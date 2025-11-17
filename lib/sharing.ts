/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { SharePlatform } from '@/types';
import { Cloud, HardDrive, MessageCircle, Users, Mail, Link2 } from 'lucide-react';

export interface ShareData {
  title: string;
  text: string;
  url?: string;
  file?: File;
  metadata?: {
    fileName?: string;
    fileSize?: string;
    conversionType?: string;
    conversionDate?: number;
    platform?: SharePlatform;
  };
}

// ============================================================================
// CORE SHARING LOGIC - Creates cross-browser compatible URLs
// ============================================================================

/**
 * Strategy for handling files of different sizes:
 * 1. Small files (< 4KB): Use URL query parameters (safe for all servers)
 * 2. Medium files (4KB - 40KB): Use URL hash fragment (bypasses server 431 errors)
 * 3. Large files (> 40KB): Use IndexedDB with short reference ID
 */

const generateShareableUrl = async (
  content: string,
  fileName: string,
  mimeType: string,
  metadata?: ShareData['metadata']
): Promise<string> => {
  const baseUrl = window.location.origin; // Use root path, SharedFileHandler will detect params

  // Compress JSON if possible
  let processedContent = content;
  if (mimeType === 'application/json' || content.trim().startsWith('[') || content.trim().startsWith('{')) {
    try {
      processedContent = JSON.stringify(JSON.parse(content)); // Remove whitespace
    } catch (e) {
      // Not valid JSON, use as-is
    }
  }

  const base64Content = btoa(unescape(encodeURIComponent(processedContent)));
  const contentSizeKB = Math.round(base64Content.length / 1024);

  console.log(`📊 Content size: ${contentSizeKB}KB (base64)`);

  // Strategy 1: Small files - use query parameters (most compatible)
  if (base64Content.length < 4000) {
    console.log('✅ Using query parameter strategy (small file)');
    const params = new URLSearchParams({
      s: 'q', // shared via query
      c: base64Content,
      n: fileName,
      t: mimeType,
      sz: metadata?.fileSize || `${contentSizeKB}KB`
    });
    return `${baseUrl}?${params.toString()}`;
  }

  // Strategy 2: Medium files - use hash fragment (bypasses server limits)
  if (base64Content.length < 40000) {
    console.log('✅ Using hash fragment strategy (medium file)');
    const params = new URLSearchParams({
      s: 'h' // shared via hash
    });
    const hashData = {
      c: base64Content,
      n: fileName,
      t: mimeType,
      sz: metadata?.fileSize || `${contentSizeKB}KB`
    };
    return `${baseUrl}?${params.toString()}#${btoa(JSON.stringify(hashData))}`;
  }

  // Strategy 3: Large files - use IndexedDB
  console.log('✅ Using IndexedDB strategy (large file)');
  try {
    const shareId = await storeInIndexedDB(processedContent, fileName, mimeType, metadata);
    return `${baseUrl}?s=db&id=${shareId}`;
  } catch (error) {
    console.error('❌ IndexedDB storage failed:', error);
    throw new Error(`File too large (${contentSizeKB}KB) and browser storage unavailable. Please download and share manually.`);
  }
};

// ============================================================================
// INDEXEDDB STORAGE (for large files)
// ============================================================================

const storeInIndexedDB = (
  content: string,
  fileName: string,
  mimeType: string,
  metadata: any
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('FileShareDB', 1);

    request.onerror = () => reject(new Error('Browser storage not available'));

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('shares')) {
        db.createObjectStore('shares', { keyPath: 'id' });
      }
    };

    request.onsuccess = (event: any) => {
      const db = event.target.result;
      const shareId = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
      
      const transaction = db.transaction(['shares'], 'readwrite');
      const store = transaction.objectStore('shares');
      
      store.add({
        id: shareId,
        content,
        fileName,
        mimeType,
        metadata,
        created: Date.now(),
        expires: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
      });

      transaction.oncomplete = () => {
        console.log(`✅ Stored in IndexedDB with ID: ${shareId}`);
        resolve(shareId);
      };
      transaction.onerror = () => reject(new Error('Failed to store file'));
    };
  });
};

const retrieveFromIndexedDB = (shareId: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('FileShareDB', 1);

    request.onerror = () => reject(new Error('Browser storage not available'));

    request.onsuccess = (event: any) => {
      const db = event.target.result;
      const transaction = db.transaction(['shares'], 'readonly');
      const store = transaction.objectStore('shares');
      const getRequest = store.get(shareId);

      getRequest.onsuccess = () => {
        const data = getRequest.result;
        if (!data) {
          reject(new Error('Shared file not found or expired'));
          return;
        }
        if (data.expires < Date.now()) {
          reject(new Error('Shared file has expired'));
          return;
        }
        resolve(data);
      };

      getRequest.onerror = () => reject(new Error('Failed to retrieve file'));
    };
  });
};

// ============================================================================
// RETRIEVE SHARED CONTENT
// ============================================================================

export const getSharedContentFromUrl = async (): Promise<{
  content: string;
  fileName: string;
  mimeType: string;
  metadata?: any;
} | null> => {
  const urlParams = new URLSearchParams(window.location.search);
  const strategy = urlParams.get('s');

  if (!strategy) return null;

  try {
    // Strategy 1: Query parameters
    if (strategy === 'q') {
      const base64Content = urlParams.get('c');
      const fileName = urlParams.get('n');
      const mimeType = urlParams.get('t');
      
      if (!base64Content || !fileName || !mimeType) return null;

      const content = decodeURIComponent(escape(atob(base64Content)));
      return {
        content: formatJSON(content, mimeType),
        fileName,
        mimeType,
        metadata: { fileSize: urlParams.get('sz') || 'Unknown' }
      };
    }

    // Strategy 2: Hash fragment
    if (strategy === 'h') {
      const hash = window.location.hash.substring(1);
      if (!hash) return null;

      const data = JSON.parse(atob(hash));
      const content = decodeURIComponent(escape(atob(data.c)));
      
      return {
        content: formatJSON(content, data.t),
        fileName: data.n,
        mimeType: data.t,
        metadata: { fileSize: data.sz }
      };
    }

    // Strategy 3: IndexedDB
    if (strategy === 'db') {
      const shareId = urlParams.get('id');
      if (!shareId) return null;

      const data = await retrieveFromIndexedDB(shareId);
      return {
        content: formatJSON(data.content, data.mimeType),
        fileName: data.fileName,
        mimeType: data.mimeType,
        metadata: data.metadata
      };
    }

    return null;
  } catch (error) {
    console.error('Failed to retrieve shared content:', error);
    return null;
  }
};

const formatJSON = (content: string, mimeType: string): string => {
  if (mimeType === 'application/json' || content.trim().startsWith('[') || content.trim().startsWith('{')) {
    try {
      return JSON.stringify(JSON.parse(content), null, 2);
    } catch (e) {
      return content;
    }
  }
  return content;
};

// ============================================================================
// PLATFORM-SPECIFIC SHARING
// ============================================================================

export const shareToPlatform = async (
  platform: SharePlatform,
  data: ShareData
): Promise<void> => {
  if (!data.file) throw new Error('No file to share');

  const content = await readFileAsText(data.file);
  const shareUrl = await generateShareableUrl(
    content,
    data.file.name,
    data.file.type,
    data.metadata
  );

  switch (platform) {
    case 'link':
      await copyToClipboard(shareUrl);
      showToast('✅ Share link copied to clipboard!', 'success');
      break;

    case 'email':
      const emailBody = `Check out this file: ${data.file.name}\n\n${shareUrl}`;
      window.open(`mailto:?subject=${encodeURIComponent(data.title)}&body=${encodeURIComponent(emailBody)}`);
      showToast('✅ Email opened with share link', 'success');
      break;

    case 'whatsapp':
      const whatsappText = `${data.title}\n${data.file.name}\n\n${shareUrl}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(whatsappText)}`);
      showToast('✅ WhatsApp opened with share link', 'success');
      break;

    case 'teams':
      window.open(`https://teams.microsoft.com/share?href=${encodeURIComponent(shareUrl)}&msgText=${encodeURIComponent(data.text)}`);
      showToast('✅ Teams opened with share link', 'success');
      break;

    case 'google-drive':
    case 'onedrive':
    case 'dropbox':
      // For cloud storage, copy link and download file for manual upload
      await copyToClipboard(shareUrl);
      downloadFile(content, data.file.name, data.file.type);
      const cloudName = platform === 'google-drive' ? 'Google Drive' : platform === 'onedrive' ? 'OneDrive' : 'Dropbox';
      showToast(`✅ Share link copied! File downloaded for ${cloudName} upload`, 'success');
      setTimeout(() => {
        const urls = {
          'google-drive': 'https://drive.google.com/drive/my-drive',
          'onedrive': 'https://onedrive.live.com/',
          'dropbox': 'https://www.dropbox.com/'
        };
        window.open(urls[platform], '_blank');
      }, 500);
      break;

    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
};

// ============================================================================
// UTILITIES
// ============================================================================

const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

const downloadFile = (content: string, fileName: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const copyToClipboard = async (text: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }
};

const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success'): void => {
  const colors = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-blue-600'
  };

  const toast = document.createElement('div');
  toast.className = `fixed bottom-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    if (document.body.contains(toast)) {
      document.body.removeChild(toast);
    }
  }, 3000);
};

export const platformInfo = {
  'google-drive': {
    name: 'Google Drive',
    icon: Cloud,
    color: 'bg-blue-600 hover:bg-blue-700',
    textColor: 'text-white',
  },
  'onedrive': {
    name: 'OneDrive',
    icon: Cloud,
    color: 'bg-sky-500 hover:bg-sky-600',
    textColor: 'text-white',
  },
  'dropbox': {
    name: 'Dropbox',
    icon: HardDrive,
    color: 'bg-blue-400 hover:bg-blue-500',
    textColor: 'text-white',
  },
  'whatsapp': {
    name: 'WhatsApp',
    icon: MessageCircle,
    color: 'bg-green-600 hover:bg-green-700',
    textColor: 'text-white',
  },
  'teams': {
    name: 'Microsoft Teams',
    icon: Users,
    color: 'bg-purple-600 hover:bg-purple-700',
    textColor: 'text-white',
  },
  'email': {
    name: 'Email',
    icon: Mail,
    color: 'bg-gray-600 hover:bg-gray-700',
    textColor: 'text-white',
  },
  'link': {
    name: 'Copy Link',
    icon: Link2,
    color: 'bg-gray-500 hover:bg-gray-600',
    textColor: 'text-white',
  },
} as const;
