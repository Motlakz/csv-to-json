/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { SharePlatform } from '@/types';

// Import icons that are used in platformInfo
import {
  Cloud,
  HardDrive,
  MessageCircle,
  Users,
  Mail,
  Link2
} from 'lucide-react';

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

export const shareToPlatform = async (
  platform: SharePlatform,
  data: ShareData
): Promise<void> => {
  try {
    switch (platform) {
      case 'link':
        await shareAsDirectLink(data, platform);
        break;

      case 'email':
        await shareViaEmailWithFile(data, platform);
        break;

      case 'whatsapp':
        await shareViaWhatsAppWithContent(data, platform);
        break;

      case 'teams':
        await shareViaTeamsWithContent(data, platform);
        break;

      case 'google-drive':
        await shareToGoogleDriveWithFile(data);
        break;

      case 'onedrive':
        await shareToOneDriveWithFile(data);
        break;

      case 'dropbox':
        await shareToDropboxWithFile(data);
        break;

      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  } catch (error) {
    console.error(`Failed to share to ${platform}:`, error);
    throw error;
  }
};

// Generate a shareable URL that works across devices and browsers - NEVER truncates content
const generateShareableUrl = async (content: string, fileName: string, mimeType: string, metadata?: ShareData['metadata']): Promise<string> => {
  const baseUrl = `${window.location.origin}`;

  // Method 1: Try base64 encoding for URL parameters (browsers can handle much larger URLs than expected)
  try {
    // First, try to compress JSON to reduce size
    let compressedContent = content;
    if (mimeType === 'application/json' || content.trim().startsWith('[') || content.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(content);
        compressedContent = JSON.stringify(parsed); // Compact JSON (no whitespace)
        console.log(`Compressed JSON from ${content.length} to ${compressedContent.length} characters`);
      } catch (e) {
        console.error('Failed to compress JSON:', e);
        console.log('Could not compress JSON, using original content');
      }
    }

    const base64Content = btoa(unescape(encodeURIComponent(compressedContent)));

    // Modern browsers can handle URLs up to 2MB+ in practice, but we'll be conservative
    // Your 43.8KB file becomes ~58KB in base64, plus other parameters = ~60KB total
    if (base64Content.length < 100000) { // Increased from 48KB to 100KB
      const encodedFileName = encodeURIComponent(fileName);
      const encodedMimeType = encodeURIComponent(mimeType);
      const timestamp = Date.now();

      const params = new URLSearchParams({
        shared: 'true',
        content: base64Content,
        encoding: 'base64',
        name: encodedFileName,
        type: encodedMimeType,
        timestamp: timestamp.toString(),
        size: metadata?.fileSize || 'unknown',
        conversion: metadata?.conversionType || 'unknown',
        compressed: content.length !== compressedContent.length ? 'true' : 'false',
        original_size: content.length.toString(),
      });

      console.log('Sharing metadata:', {
        mimeType: encodedMimeType,
        conversionType: metadata?.conversionType,
        fileName: encodedFileName
      });

      const fullUrl = `${baseUrl}?${params.toString()}`;
      console.log(`Generated URL length: ${fullUrl.length} characters`);

      // Double-check the URL isn't excessively long
      if (fullUrl.length < 200000) { // 200KB absolute maximum
        return fullUrl;
      } else {
        console.log('URL too long even for modern browsers, falling back to other methods');
      }
    } else {
      console.log(`Base64 content too large: ${base64Content.length} characters`);
    }
  } catch (error) {
    console.error('Base64 encoding failed:', error);
  }

  // Method 2: Use public pastebin service for larger files
  try {
    const publicLink = await uploadToPublicService(content, fileName, mimeType);
    console.log('Successfully uploaded to public service:', publicLink);
    return publicLink;
  } catch (error: any) {
    console.error('Public service upload failed:', error.message);

    // Method 3: Create a shareable text format that can be copy-pasted
    const shareableText = createShareableTextFormat(content, fileName, mimeType, metadata);

    // Copy to clipboard first
    try {
      await copyToClipboard(shareableText);
      console.log('Successfully copied formatted content to clipboard');

      // Provide a more informative error message
      const fileSizeKB = Math.round(content.length / 1024);
      throw new Error(`File too large for URL sharing (${fileSizeKB}KB). Complete content copied to clipboard - paste and save as ${fileName}`);
    } catch (clipboardError) {
      console.error('Clipboard copy failed:', clipboardError);
      throw new Error(`Unable to share large file (${Math.round(content.length / 1024)}KB). Please save the file manually and share through other means.`);
    }
  }
};

// Upload content to a public pastebin-like service
const uploadToPublicService = async (content: string, fileName: string, mimeType: string): Promise<string> => {
  // Try multiple public services in order of preference

  // Method 2a: Try Paste.ee (supports large files, no API key needed)
  try {
    const response = await fetch('https://paste.ee/api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        key: 'public',
        description: `${fileName} (${mimeType})`,
        paste: content,
        format: mimeType.includes('json') ? 'json' : 'text',
        expiration: '1w',
        private: '0', // Changed from number to string
      }),
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Paste.ee response:', result); // Debug log
      if (result && result.status === 'success' && result.data && result.data.link) {
        return result.data.link;
      } else {
        console.error('Paste.ee unexpected response format:', result);
      }
    } else {
      console.error('Paste.ee HTTP error:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('Paste.ee failed:', error);
  }

  // Method 2b: Try Gist (GitHub) - requires authentication, so skip for now
  // Method 2c: Try another service like paste.rs
  try {
    const response = await fetch('https://paste.rs/', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: content,
    });

    if (response.ok) {
      const pasteUrl = await response.text();
      if (pasteUrl && pasteUrl.startsWith('http')) {
        return pasteUrl.trim();
      }
    }
  } catch (error) {
    console.error('Paste.rs failed:', error);
  }

  // Method 2d: Try JustPaste.it (simple form-based paste)
  try {
    const formData = new FormData();
    formData.append('text', content);
    formData.append('title', fileName);
    formData.append('privacy', '0');

    const response = await fetch('https://justpaste.it', {
      method: 'POST',
      body: formData,
    });

    if (response.ok && response.url) {
      return response.url;
    }
  } catch (error) {
    console.error('JustPaste.it failed:', error);
  }

  // All services failed - this is expected due to CORS or service limitations
  throw new Error('Public paste services unavailable');
};

// Create a shareable text format that preserves file structure
const createShareableTextFormat = (content: string, fileName: string, mimeType: string, metadata?: ShareData['metadata']): string => {
  const timestamp = new Date().toISOString();
  const header = `Shared File: ${fileName}`;
  const separator = '='.repeat(50);
  const footer = `Shared on: ${timestamp} | Size: ${metadata?.fileSize || 'Unknown'} | Type: ${mimeType}`;

  return [
    header,
    separator,
    `File Name: ${fileName}`,
    `File Type: ${mimeType}`,
    `File Size: ${metadata?.fileSize || 'Unknown'}`,
    `Conversion Type: ${metadata?.conversionType || 'Unknown'}`,
    '',
    'START OF FILE CONTENT:',
    '',
    content,
    '',
    'END OF FILE CONTENT',
    '',
    footer,
    '',
    'Instructions:',
    '1. Copy everything between START OF FILE CONTENT and END OF FILE CONTENT',
    '2. Save it to a file with the correct extension (.json or .csv)',
    '3. Open in your preferred application'
  ].join('\n');
};

// Retrieve shared content from URL parameters (cross-browser compatible)
const getSharedContentFromUrl = (): { content: string; fileName: string; mimeType: string; metadata?: ShareData['metadata']; truncated?: boolean; dataUrl?: string } | null => {
  const urlParams = new URLSearchParams(window.location.search);
  const shared = urlParams.get('shared');

  if (shared === 'metadata' || urlParams.get('download_required') === 'true') {
    // Case where we only have metadata, not content
    return {
      content: '',
      fileName: decodeURIComponent(urlParams.get('name') || 'shared-file'),
      mimeType: decodeURIComponent(urlParams.get('type') || 'text/plain'),
      metadata: {
        fileSize: urlParams.get('size') || 'unknown',
        conversionType: urlParams.get('conversion') || 'unknown'
      },
      truncated: false,
      dataUrl: undefined
    };
  }

  if (shared !== 'true') return null;

  const content = urlParams.get('content');
  const fileName = urlParams.get('name');
  const mimeType = urlParams.get('type');
  const encoding = urlParams.get('encoding');
  const originalSize = urlParams.get('original_size');

  if (!content || !fileName || !mimeType) {
    return null;
  }

  try {
    let decodedContent: string;

    if (encoding === 'base64') {
      decodedContent = decodeURIComponent(escape(atob(content)));
    } else {
      decodedContent = decodeURIComponent(content);
    }

    // Always format JSON content for better readability
    if (mimeType === 'application/json' || decodedContent.trim().startsWith('[') || decodedContent.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(decodedContent);
        // Check if content is already formatted (has proper indentation)
        const isFormatted = decodedContent.includes('\n    ') || decodedContent.includes('\n  ');

        if (!isFormatted) {
          // Pretty-print the JSON with 2-space indentation
          decodedContent = JSON.stringify(parsed, null, 2);
          console.log(`Formatted JSON from URL (${originalSize} -> ${decodedContent.length} characters)`);
        } else {
          console.log('JSON already formatted, using as-is');
        }
      } catch (formatError) {
        console.log('Could not format JSON, using original version', formatError);
      }
    }

    return {
      content: decodedContent,
      fileName: decodeURIComponent(fileName),
      mimeType: decodeURIComponent(mimeType),
      metadata: {
        fileSize: urlParams.get('size') || 'unknown',
        conversionType: urlParams.get('conversion') || 'unknown'
      },
      truncated: false // Never truncate with the new system
    };
  } catch (error) {
    console.error('Error decoding shared content:', error);
    return null;
  }
};

// Enhanced sharing functions with better file handling
const shareAsDirectLink = async (data: ShareData, platform: SharePlatform): Promise<void> => {
  try {
    if (data.file) {
      const reader = new FileReader();
      reader.onload = async () => {
        const content = reader.result as string;
        const fileSizeKB = Math.round(content.length / 1024);

        try {
          // Use new full-content sharing approach (now async)
          const shareableLink = await generateShareableUrl(content, data.file!.name, data.file!.type, data.metadata);

          if (shareableLink.startsWith('http://') || shareableLink.startsWith('https://')) {
            // Regular URL or public service link
            copyToClipboard(shareableLink);
            showToast(`Shareable link copied! Contains full file (${fileSizeKB}KB).`, 'success');
          } else if (shareableLink.startsWith('data:')) {
            // Data URL fallback
            copyToClipboard(shareableLink);
            showToast(`Data URL copied (${fileSizeKB}KB). Paste in browser to download.`, 'success');
          } else {
            // Fallback - should not happen with new system
            copyToClipboard(shareableLink);
            showToast('Shareable content copied to clipboard.', 'success');
          }
        } catch (error: any) {
          console.error('Failed to generate shareable link:', error);

          // Handle the clipboard fallback case
          if (error.message && error.message.includes('copied to clipboard')) {
            showToast(error.message, 'info');
          } else {
            // Last resort: create a simple text format
            const shareableText = createShareableTextFormat(content, data.file!.name, data.file!.type, data.metadata);
            copyToClipboard(shareableText);
            showToast(`File too large for sharing. Complete content copied to clipboard (${fileSizeKB}KB).`, 'info');
          }
        }
      };
      reader.onerror = () => {
        showToast('Failed to read file for sharing', 'error');
        throw new Error('Failed to read file');
      };
      reader.readAsText(data.file);
    } else if (data.text && data.url) {
      copyToClipboard(data.url);
      showToast('Link copied to clipboard!', 'success');
    } else {
      showToast('No file or content available to share', 'error');
      throw new Error('No file or content available to share');
    }
  } catch (error) {
    console.error('Direct link sharing failed:', error);
    showToast('Failed to create shareable link', 'error');
    throw error;
  }
};

const shareViaEmailWithFile = async (data: ShareData, platform: SharePlatform): Promise<void> => {
  if (data.file) {
    const reader = new FileReader();
    reader.onload = async () => {
      const content = reader.result as string;
      const fileSizeKB = Math.round(content.length / 1024);

      try {
        // Use async generateShareableUrl
        const shareableLink = await generateShareableUrl(content, data.file!.name, data.file!.type, data.metadata);

        const subject = encodeURIComponent(data.title);
        let bodyText: string;

        if (shareableLink.startsWith('http')) {
          bodyText = `${data.text}\n\n📄 File Details:\n• Name: ${data.file!.name}\n• Size: ${data.metadata?.fileSize || 'Unknown'}\n• Type: ${data.metadata?.conversionType || 'Unknown'}\n• Shared via: ${platform.replace('-', ' ').toUpperCase()}\n\n📎 View/Download Link: ${shareableLink}\n\n💡 Click the link to view and download the file. Works on any device.`;
        } else {
          bodyText = `${data.text}\n\n📄 File Details:\n• Name: ${data.file!.name}\n• Size: ${data.metadata?.fileSize || 'Unknown'}\n• Type: ${data.metadata?.conversionType || 'Unknown'}\n• Shared via: ${platform.replace('-', ' ').toUpperCase()}\n\n📎 The complete file content has been copied to your clipboard.\n💡 Paste the content into a text editor and save with .json or .csv extension.`;
        }

        const body = encodeURIComponent(bodyText);
        window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
        showToast('Email client opened with shareable link!', 'success');
      } catch (error: any) {
        console.error('Failed to generate email share link:', error);

        const subject = encodeURIComponent(data.title);
        let bodyText: string;

        if (error.message && error.message.includes('copied to clipboard')) {
          bodyText = `${data.text}\n\n📄 File Details:\n• Name: ${data.file!.name}\n• Size: ${data.metadata?.fileSize || 'Unknown'}\n• Type: ${data.metadata?.conversionType || 'Unknown'}\n• Shared via: ${platform.replace('-', ' ').toUpperCase()}\n\n📎 The complete file content (${fileSizeKB}KB) has been copied to your clipboard.\n💡 Paste into a text editor and save with the correct extension.`;
        } else {
          bodyText = `${data.text}\n\n📄 File: ${data.file!.name} (${data.metadata?.fileSize || 'Unknown'})\n\nFile is too large for email sharing. Please share it via cloud storage or download from the converter.`;
        }

        const body = encodeURIComponent(bodyText);
        window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
        showToast('Email opened with sharing instructions.', 'info');
      }
    };
    reader.onerror = () => {
      showToast('Failed to read file for email sharing', 'error');
      throw new Error('Failed to read file');
    };
    reader.readAsText(data.file);
  } else {
    const subject = encodeURIComponent(data.title);
    const body = encodeURIComponent(`${data.text}\n\nShared via: ${platform.replace('-', ' ').toUpperCase()}\n\n${data.url || ''}`);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    showToast('Email client opened!', 'success');
  }
};

const shareViaWhatsAppWithContent = async (data: ShareData, platform: SharePlatform): Promise<void> => {
  let text = `${data.title}\n${data.text}`;

  if (data.file) {
    const reader = new FileReader();
    reader.onload = async () => {
      const content = reader.result as string;
      try {
        // Use async generateShareableUrl
        const shareableLink = await generateShareableUrl(content, data.file!.name, data.file!.type, data.metadata);
        let fullText: string;

        if (shareableLink.startsWith('http')) {
          fullText = `${text}\n\n📄 ${data.file!.name} (${data.metadata?.fileSize || 'Unknown'})\n🔗 ${shareableLink}\n\nShared via Fast Convert • Works on any device!`;
        } else {
          fullText = `${text}\n\n📄 ${data.file!.name} (${data.metadata?.fileSize || 'Unknown'})\n📎 Complete file copied to clipboard! Paste and save as file.`;
        }

        const encodedText = encodeURIComponent(fullText);
        window.open(`https://wa.me/?text=${encodedText}`, '_blank');
        showToast('WhatsApp opened with sharing info!', 'success');
      } catch (error: any) {
        console.error('Failed to share via WhatsApp:', error);
        const fallbackText = `${text}\n\n📄 ${data.file!.name} (${data.metadata?.fileSize || 'Unknown'})\n📎 File too large for link sharing. Copied to clipboard - paste and save.`;
        const encodedText = encodeURIComponent(fallbackText);
        window.open(`https://wa.me/?text=${encodedText}`, '_blank');
        showToast('WhatsApp opened with clipboard instructions.', 'info');
      }
    };
    reader.readAsText(data.file);
  } else {
    text += `\n\n📱 Shared via: ${platform.replace('-', ' ').toUpperCase()}\n\n${data.url || ''}`;
    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encodedText}`, '_blank');
    showToast('WhatsApp opened!', 'success');
  }
};

const shareViaTeamsWithContent = async (data: ShareData, platform: SharePlatform): Promise<void> => {
  if (data.file) {
    const reader = new FileReader();
    reader.onload = async () => {
      const content = reader.result as string;
      try {
        // Use async generateShareableUrl
        const shareableLink = await generateShareableUrl(content, data.file!.name, data.file!.type, data.metadata);
        let message: string;

        if (shareableLink.startsWith('http')) {
          message = encodeURIComponent(`${data.text}\n\n📄 File: ${data.file!.name}\n🔗 View link: ${shareableLink}\n\nShared via: ${platform.replace('-', ' ').toUpperCase()}`);
          window.open(`https://teams.microsoft.com/share?href=${encodeURIComponent(shareableLink)}&msg=${message}`, '_blank');
        } else {
          message = encodeURIComponent(`${data.text}\n\n📄 File: ${data.file!.name}\n📎 Content copied to clipboard! Paste and save as file.\n\nShared via: ${platform.replace('-', ' ').toUpperCase()}`);
          window.open(`https://teams.microsoft.com/share?href=${encodeURIComponent(window.location.href)}&msg=${message}`, '_blank');
        }

        showToast('Teams opened with sharing info!', 'success');
      } catch (error: any) {
        console.error('Failed to share via Teams:', error);
        const fallbackMessage = encodeURIComponent(`${data.text}\n\n📄 File: ${data.file!.name}\n📎 File too large for link sharing. Content copied to clipboard.\n\nShared via: ${platform.replace('-', ' ').toUpperCase()}`);
        window.open(`https://teams.microsoft.com/share?href=${encodeURIComponent(window.location.href)}&msg=${fallbackMessage}`, '_blank');
        showToast('Teams opened with clipboard instructions.', 'info');
      }
    };
    reader.readAsText(data.file);
  } else {
    const message = encodeURIComponent(`${data.text}\n\n🔗 ${data.url || ''}\n\nShared via: ${platform.replace('-', ' ').toUpperCase()}`);
    window.open(`https://teams.microsoft.com/share?href=${encodeURIComponent(data.url || '')}&msg=${message}`, '_blank');
    showToast('Teams opened!', 'success');
  }
};

// Google Drive API Integration
let gapiInited = false;
let gisInited = false;
let tokenClient: any = null;
let gapi: any = null;

// Google Drive API Configuration
// To enable direct uploads, replace this with your actual Client ID
// See GOOGLE_DRIVE_API_SETUP.md for setup instructions
const CLIENT_ID = '123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com'; // Replace with your actual Client ID
const SCOPES = 'https://www.googleapis.com/auth/drive/file';

// Check if API is properly configured
const isGoogleDriveApiConfigured = CLIENT_ID !== '123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com';

// Initialize Google API
const initializeGoogleApi = () => {
  return new Promise<void>((resolve, reject) => {
    // Load GAPI script
    const gapiScript = document.createElement('script');
    gapiScript.src = 'https://apis.google.com/js/api.js';
    gapiScript.onload = () => {
      gapi = (window as any).gapi;
      gapi.load('client', () => {
        gapiInited = true;
        console.log('Google API initialized');
        resolve();
      });
    };
    gapiScript.onerror = () => reject(new Error('Failed to load Google API'));
    document.head.appendChild(gapiScript);

    // Load GIS script for OAuth2
    const gisScript = document.createElement('script');
    gisScript.src = 'https://accounts.google.com/gsi/client';
    gisScript.onload = () => {
      tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (tokenResponse: any) => {
          if (tokenResponse && tokenResponse.access_token) {
            gapi.auth.setToken(tokenResponse);
            gisInited = true;
            console.log('Google OAuth2 initialized');
            resolve();
          }
        },
      });
      console.log('Google OAuth2 initialized');
    };
    gisScript.onerror = () => reject(new Error('Failed to load Google OAuth2'));
    document.head.appendChild(gisScript);
  });
};

// Authenticate with Google Drive
const authenticateWithGoogle = async (): Promise<boolean> => {
  try {
    if (!gapiInited || !gisInited) {
      await initializeGoogleApi();
    }

    return new Promise((resolve, reject) => {
      // Try to get existing token
      const token = gapi.auth.getToken();
      if (token && token.access_token) {
        resolve(true);
        return;
      }

      // Request new token
      tokenClient.requestAccessToken();

      // Listen for token
      const checkToken = setInterval(() => {
        const currentToken = gapi.auth.getToken();
        if (currentToken && currentToken.access_token) {
          clearInterval(checkToken);
          resolve(true);
        }
      }, 100);

      // Timeout after 30 seconds
      setTimeout(() => {
        clearInterval(checkToken);
        reject(new Error('Authentication timeout'));
      }, 30000);
    });
  } catch (error) {
    console.error('Google authentication failed:', error);
    throw new Error('Failed to authenticate with Google Drive');
  }
};

// Upload file to Google Drive
const uploadToGoogleDrive = async (content: string, fileName: string, mimeType: string): Promise<string> => {
  try {
    // Authenticate first
    await authenticateWithGoogle();

    // Create file metadata
    const metadata = {
      name: fileName,
      parents: ['appDataFolder'], // Store in app-specific folder
    };

    // Convert content to Blob
    const blob = new Blob([content], { type: mimeType });

    // Create FormData for the upload
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', blob);

    // Upload to Google Drive
    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${gapi.auth.getToken().access_token}`,
      },
      body: form,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Google Drive upload successful:', result);

    // Make file shareable (anyone with link can view)
    const shareResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${result.id}/permissions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${gapi.auth.getToken().access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role: 'reader',
        type: 'anyone',
      }),
    });

    if (shareResponse.ok) {
      // Get the shareable link
      const fileResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${result.id}?fields=webViewLink`, {
        headers: {
          'Authorization': `Bearer ${gapi.auth.getToken().access_token}`,
        },
      });

      if (fileResponse.ok) {
        const fileData = await fileResponse.json();
        return fileData.webViewLink;
      }
    }

    // Fallback to standard file view link
    return `https://drive.google.com/file/d/${result.id}/view`;
  } catch (error) {
    console.error('Google Drive upload failed:', error);
    throw error;
  }
};

const shareToGoogleDriveWithFile = async (data: ShareData): Promise<void> => {
  if (data.file) {
    const reader = new FileReader();
    reader.onload = async () => {
      const content = reader.result as string;
      const fileSizeKB = Math.round(content.length / 1024);

      // Check if Google Drive API is properly configured
      if (!isGoogleDriveApiConfigured) {
        showToast('Google Drive API not configured. Using manual upload method...', 'info');

        // Fallback to manual upload method
        try {
          const shareableLink = await generateShareableUrl(content, data.file!.name, data.file!.type, data.metadata);

          if (shareableLink.startsWith('http')) {
            copyToClipboard(shareableLink);
            showToast(`Shareable link copied (${fileSizeKB}KB)! Google Drive opened for upload.`, 'success');
          } else {
            showToast(`File content copied (${fileSizeKB}KB)! Google Drive opened for upload.`, 'info');
          }
        } catch (fallbackError) {
          console.error('Fallback upload failed:', fallbackError);
          showToast(`File content copied (${fileSizeKB}KB)! Google Drive opened for upload.`, 'info');
        }

        // Download file for manual upload
        const blob = new Blob([content], { type: data.file!.type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;

        // Ensure correct file extension based on content type
        let correctFileName = data.file!.name;
        const correctExtension = data.file!.type === 'application/json' ? '.json' : '.csv';

        if (!correctFileName.toLowerCase().endsWith(correctExtension)) {
          const baseName = correctFileName.replace(/\.[^/.]+$/, '');
          correctFileName = baseName + correctExtension;
        }

        a.download = correctFileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setTimeout(() => {
          window.open('https://drive.google.com/drive/my-drive', '_blank');
        }, 500);
        return;
      }

      try {
        showToast('Connecting to Google Drive...', 'info');

        // Try to upload directly to Google Drive
        const shareableLink = await uploadToGoogleDrive(content, data.file!.name, data.file!.type);
        copyToClipboard(shareableLink);
        showToast(`Successfully uploaded to Google Drive! Link copied (${fileSizeKB}KB).`, 'success');

      } catch (error: any) {
        console.error('Direct Google Drive upload failed:', error.message);

        // Fallback to manual upload method
        showToast('Direct upload failed. Using manual upload method...', 'info');

        try {
          // Use new sharing system for manual upload
          const shareableLink = await generateShareableUrl(content, data.file!.name, data.file!.type, data.metadata);

          if (shareableLink.startsWith('http')) {
            copyToClipboard(shareableLink);
            showToast(`Shareable link copied (${fileSizeKB}KB)! Google Drive opened for upload.`, 'success');
          } else {
            showToast(`File content copied (${fileSizeKB}KB)! Google Drive opened for upload.`, 'info');
          }
        } catch (fallbackError) {
          console.error('Fallback upload failed:', fallbackError);
          showToast(`File content copied (${fileSizeKB}KB)! Google Drive opened for upload.`, 'info');
        }

        // Always download the file for manual upload
        const blob = new Blob([content], { type: data.file!.type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;

        // Ensure correct file extension based on content type
        let correctFileName = data.file!.name;
        const correctExtension = data.file!.type === 'application/json' ? '.json' : '.csv';

        if (!correctFileName.toLowerCase().endsWith(correctExtension)) {
          const baseName = correctFileName.replace(/\.[^/.]+$/, '');
          correctFileName = baseName + correctExtension;
        }

        a.download = correctFileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Open Google Drive for uploading
        setTimeout(() => {
          window.open('https://drive.google.com/drive/my-drive', '_blank');
        }, 500);
      }
    };
    reader.onerror = () => {
      showToast('Failed to read file for Google Drive sharing', 'error');
      throw new Error('Failed to read file');
    };
    reader.readAsText(data.file);
  } else {
    window.open('https://drive.google.com/drive/my-drive', '_blank');
  }
};

const shareToOneDriveWithFile = async (data: ShareData): Promise<void> => {
  if (data.file) {
    const reader = new FileReader();
    reader.onload = async () => {
      const content = reader.result as string;
      const fileSizeKB = Math.round(content.length / 1024);

      try {
        // Use new sharing system
        const shareableLink = await generateShareableUrl(content, data.file!.name, data.file!.type, data.metadata);

        if (shareableLink.startsWith('http')) {
          // Successfully created shareable link
          copyToClipboard(shareableLink);
          showToast(`Shareable link copied (${fileSizeKB}KB)! OneDrive opened for upload.`, 'success');
        } else {
          // Link too large, using clipboard approach
          showToast(`File content copied (${fileSizeKB}KB)! OneDrive opened for upload.`, 'info');
        }
      } catch (error: any) {
        console.error('Failed to generate shareable link for OneDrive:', error);
        showToast(`File content copied (${fileSizeKB}KB)! OneDrive opened for upload.`, 'info');
      }

      // Always download the file for upload
      const blob = new Blob([content], { type: data.file!.type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      // Ensure correct file extension based on content type
      let correctFileName = data.file!.name;
      const correctExtension = data.file!.type === 'application/json' ? '.json' : '.csv';

      if (!correctFileName.toLowerCase().endsWith(correctExtension)) {
        const baseName = correctFileName.replace(/\.[^/.]+$/, '');
        correctFileName = baseName + correctExtension;
      }

      a.download = correctFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Open OneDrive for uploading
      setTimeout(() => {
        window.open('https://onedrive.live.com/', '_blank');
      }, 500);
    };
    reader.onerror = () => {
      showToast('Failed to read file for OneDrive sharing', 'error');
      throw new Error('Failed to read file');
    };
    reader.readAsText(data.file);
  } else {
    window.open('https://onedrive.live.com/', '_blank');
  }
};

const shareToDropboxWithFile = async (data: ShareData): Promise<void> => {
  if (data.file) {
    const reader = new FileReader();
    reader.onload = async () => {
      const content = reader.result as string;
      const fileSizeKB = Math.round(content.length / 1024);

      try {
        // Use new sharing system
        const shareableLink = await generateShareableUrl(content, data.file!.name, data.file!.type, data.metadata);

        if (shareableLink.startsWith('http')) {
          // Successfully created shareable link
          copyToClipboard(shareableLink);
          showToast(`Shareable link copied (${fileSizeKB}KB)! Dropbox opened for upload.`, 'success');
        } else {
          // Link too large, using clipboard approach
          showToast(`File content copied (${fileSizeKB}KB)! Dropbox opened for upload.`, 'info');
        }
      } catch (error: any) {
        console.error('Failed to generate shareable link for Dropbox:', error);
        showToast(`File content copied (${fileSizeKB}KB)! Dropbox opened for upload.`, 'info');
      }

      // Always download the file for upload
      const blob = new Blob([content], { type: data.file!.type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      // Ensure correct file extension based on content type
      let correctFileName = data.file!.name;
      const correctExtension = data.file!.type === 'application/json' ? '.json' : '.csv';

      if (!correctFileName.toLowerCase().endsWith(correctExtension)) {
        const baseName = correctFileName.replace(/\.[^/.]+$/, '');
        correctFileName = baseName + correctExtension;
      }

      a.download = correctFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Open Dropbox for uploading
      setTimeout(() => {
        window.open('https://www.dropbox.com/', '_blank');
      }, 500);
    };
    reader.onerror = () => {
      showToast('Failed to read file for Dropbox sharing', 'error');
      throw new Error('Failed to read file');
    };
    reader.readAsText(data.file);
  } else {
    window.open('https://www.dropbox.com/', '_blank');
  }
};

const copyToClipboard = async (text: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text);
    showToast('Link copied to clipboard!', 'success');
  } catch (err) {
    console.error('Clipboard write failed:', err);
    try {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      showToast('Link copied to clipboard!', 'success');
    } catch (fallbackErr) {
      console.error('Fallback copy failed:', fallbackErr);
      showToast('Failed to copy link to clipboard', 'error');
      throw new Error('Failed to copy to clipboard');
    }
  }
};


const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success'): void => {
  // Enhanced toast notification with different types
  const colors = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-blue-600'
  };

  const toast = document.createElement('div');
  toast.className = `fixed bottom-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-in fade-in duration-300`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 300);
  }, 3000);
};

export { getSharedContentFromUrl };

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