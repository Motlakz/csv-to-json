/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Share2, 
  FileText, 
  Calendar, 
  HardDrive, 
  ArrowLeft, 
  ExternalLink, 
  Info,
  Copy,
  AlertCircle, 
  CheckCircle
} from 'lucide-react';
import { ConversionType } from '@/types';
import { useHistoryStore } from '@/lib/history-store';
import { getSharedContentFromUrl } from '@/lib/sharing';

interface SharedFileData {
  file: string;
  name: string;
  type: string;
  timestamp: string;
  size: string;
  conversion: string;
}

export function SharedFileHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const addConversion = useHistoryStore((state) => state.addConversion);

  const [sharedData, setSharedData] = useState<SharedFileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const calculateFileSize = (content: string): string => {
    const bytes = new Blob([content]).size;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  useEffect(() => {
    const loadSharedFile = async () => {
      // Check if this is a share URL (new system: ?s=q/h/db or old system: ?shared=true)
      const newShareType = searchParams.get('s');
      const oldShareType = searchParams.get('shared');
      
      if (!newShareType && !oldShareType) {
        setIsLoading(false);
        return;
      }

      try {
        // Use the new sharing system
        const sharedContent = await getSharedContentFromUrl();

        if (!sharedContent) {
          setError('Invalid or expired share link');
          setIsLoading(false);
          return;
        }

        // Determine conversion type based on file type or metadata
        let conversionType: ConversionType;
        let correctedMimeType = sharedContent.mimeType;
        let correctedFileName = sharedContent.fileName;

        // First, check metadata
        if (sharedContent.metadata?.conversionType === 'csv-to-json' || sharedContent.mimeType === 'application/json') {
          conversionType = 'csv-to-json';
          correctedMimeType = 'application/json';
        } else if (sharedContent.metadata?.conversionType === 'json-to-csv' || sharedContent.mimeType === 'text/csv') {
          conversionType = 'json-to-csv';
          correctedMimeType = 'text/csv';
        } else {
          // Detect by content and file name
          const isJsonContent = sharedContent.content.trim().startsWith('[') ||
                               sharedContent.content.trim().startsWith('{') ||
                               sharedContent.fileName.toLowerCase().includes('.json');

          if (isJsonContent) {
            conversionType = 'csv-to-json';
            correctedMimeType = 'application/json';

            // Fix file extension if needed
            if (!sharedContent.fileName.toLowerCase().endsWith('.json')) {
              const baseName = sharedContent.fileName.replace(/\.[^/.]+$/, '');
              correctedFileName = baseName + '.json';
            }
          } else {
            conversionType = 'json-to-csv';
            correctedMimeType = 'text/csv';

            // Fix file extension if needed
            if (!sharedContent.fileName.toLowerCase().endsWith('.csv')) {
              const baseName = sharedContent.fileName.replace(/\.[^/.]+$/, '');
              correctedFileName = baseName + '.csv';
            }
          }
        }

        setSharedData({
          file: sharedContent.content,
          name: correctedFileName,
          type: correctedMimeType,
          timestamp: Date.now().toString(),
          size: sharedContent.metadata?.fileSize || calculateFileSize(sharedContent.content),
          conversion: sharedContent.metadata?.conversionType || conversionType,
        });

        // Only add to history if we have actual content
        if (sharedContent.content && sharedContent.content.length > 0) {
          addConversion({
            type: conversionType,
            input: '', // We don't have the original input
            output: sharedContent.content,
            fileName: correctedFileName,
            fileSize: sharedContent.metadata?.fileSize || calculateFileSize(sharedContent.content),
            isShared: true,
            tags: ['shared'],
          });
        }

        setIsLoading(false);
      } catch (err: any) {
        console.error('Error loading shared file:', err);
        setError(err.message || 'Failed to load the shared file. The link may be corrupted or incomplete.');
        setIsLoading(false);
      }
    };

    loadSharedFile();
  }, [searchParams, addConversion]);

  const handleDownload = () => {
    if (!sharedData) return;

    // Ensure the file extension matches the content type
    let downloadFileName = sharedData.name;
    const downloadMimeType = sharedData.type;

    // If the file extension doesn't match the MIME type, fix it
    if (downloadMimeType === 'application/json' && !downloadFileName.toLowerCase().endsWith('.json')) {
      const baseName = downloadFileName.replace(/\.[^/.]+$/, '');
      downloadFileName = baseName + '.json';
    } else if (downloadMimeType === 'text/csv' && !downloadFileName.toLowerCase().endsWith('.csv')) {
      const baseName = downloadFileName.replace(/\.[^/.]+$/, '');
      downloadFileName = baseName + '.csv';
    }

    const blob = new Blob([sharedData.file], { type: downloadMimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = downloadFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyContent = async () => {
    if (!sharedData) return;

    try {
      await navigator.clipboard.writeText(sharedData.file);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy content:', err);
    }
  };

  const handleBackToConverter = () => {
    router.push('/');
  };

  const getFileTypeLabel = () => {
    if (!sharedData) return 'Unknown';

    // Check by MIME type first
    if (sharedData.type === 'application/json') {
      return 'JSON';
    } else if (sharedData.type === 'text/csv') {
      return 'CSV';
    }

    // Check by file extension
    if (sharedData.name.toLowerCase().endsWith('.json')) {
      return 'JSON';
    } else if (sharedData.name.toLowerCase().endsWith('.csv')) {
      return 'CSV';
    }

    // Check by content (for edge cases)
    const content = sharedData.file || '';
    if (content.trim().startsWith('[') || content.trim().startsWith('{')) {
      return 'JSON';
    } else if (content.includes(',') && content.split('\n').length > 1) {
      return 'CSV';
    }

    return sharedData.type.split('/')[1]?.toUpperCase() || 'File';
  };

  const getHighlightedContent = () => {
    if (!sharedData?.file) return '';

    const content = sharedData.file;
    const isJson = sharedData.type === 'application/json' ||
                   content.trim().startsWith('[') ||
                   content.trim().startsWith('{');

    if (isJson) {
      // Simple syntax highlighting for JSON with proper escaping
      return content
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/(".*?")/g, '<span class="text-green-600 dark:text-green-400">$1</span>')
        .replace(/(\b\d+\.?\d*\b)/g, '<span class="text-blue-600 dark:text-blue-400">$1</span>')
        .replace(/\b(true|false|null)\b/g, '<span class="text-purple-600 dark:text-purple-400">$1</span>');
    }

    // For CSV, escape HTML
    return content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  };

  const formatDate = (timestamp: string) => {
    try {
      return new Date(parseInt(timestamp)).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Unknown date';
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading shared file...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-red-600 dark:text-red-400">Unable to Load File</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={handleBackToConverter} className="w-full">
              <ArrowLeft size={16} className="mr-2" />
              Go to Converter
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!sharedData) {
    return null;
  }

  // Check if we have no content (metadata-only sharing)
  const hasContent = sharedData.file && sharedData.file.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4 pt-8">
          <Badge variant="secondary" className="text-sm">
            <Share2 size={14} className="mr-1" />
            Shared File
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            {sharedData.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Shared {getFileTypeLabel()} file • {sharedData.size}
          </p>
        </div>

        {/* File Info Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <FileText size={24} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-xl">{sharedData.name}</CardTitle>
                  <CardDescription className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1">
                      <HardDrive size={14} />
                      {sharedData.size}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {formatDate(sharedData.timestamp)}
                    </span>
                  </CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="shrink-0">
                {getFileTypeLabel()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Message for metadata-only sharing */}
            {!hasContent && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start gap-2 text-blue-800 dark:text-blue-200">
                  <Info size={16} className="shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium">File Information Only</p>
                    <p className="opacity-90">
                      This file was too large to include in the share link. Please contact the original sender to get the complete file.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              {hasContent && (
                <>
                  <Button onClick={handleDownload} className="flex-1 sm:flex-none">
                    <Download size={16} className="mr-2" />
                    Download
                  </Button>
                  <Button 
                    onClick={handleCopyContent} 
                    variant="outline" 
                    className="flex-1 sm:flex-none"
                  >
                    {copied ? (
                      <>
                        <CheckCircle size={16} className="mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={16} className="mr-2" />
                        Copy Content
                      </>
                    )}
                  </Button>
                </>
              )}
              <Button 
                onClick={handleBackToConverter} 
                variant="outline" 
                className="flex-1 sm:flex-none"
              >
                <ArrowLeft size={16} className="mr-2" />
                New Conversion
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* File Preview - Only show if we have content */}
        {hasContent && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText size={18} />
                File Preview
              </CardTitle>
              <CardDescription>
                {sharedData.file.length.toLocaleString()} characters • {sharedData.file.split('\n').length} lines
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="dark:bg-slate-900/20 bg-slate-200 rounded-lg p-4 border dark:border-gray-700 border-gray-400">
                <div className="flex items-center justify-between mb-3 pb-2 border-b dark:border-gray-700 border-gray-400">
                  <span className="text-xs text-gray-700 dark:text-gray-400">
                    {getFileTypeLabel()} File
                  </span>
                  {getFileTypeLabel() === 'JSON' && (
                    <span className="text-xs bg-green-900/30 text-green-300 px-2 py-1 rounded-full">
                      Syntax Highlighted
                    </span>
                  )}
                </div>
                <div
                  className="text-sm overflow-x-auto max-h-96 overflow-y-auto font-mono dark:text-gray-400 text-gray-800"
                  dangerouslySetInnerHTML={{ __html: getHighlightedContent() }}
                  style={{
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    tabSize: 2
                  }}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer Info */}
        <div className="text-center text-sm text-gray-600 dark:text-gray-400 space-y-2 pb-8">
          <div className="flex items-center justify-center gap-4">
            <span>This file has been added to your history</span>
            <span>•</span>
            <span>Safe and local processing</span>
          </div>
          <Button onClick={() => router.push('/')} variant="outline" size="sm">
            <ExternalLink size={14} className="mr-2" />
            Open in Converter
          </Button>
        </div>
      </div>
    </div>
  );
}
