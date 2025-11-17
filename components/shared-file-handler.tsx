"use client"

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Share2, FileText, Calendar, HardDrive, ArrowLeft, ExternalLink, Info } from 'lucide-react';
import { ConversionType } from '@/types';
import { useHistoryStore } from '@/lib/history-store';

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

  useEffect(() => {
    const loadSharedFile = async () => {
      const shared = searchParams.get('shared');
      if (shared === 'true') {
        // Use the new URL-based sharing approach
        try {
          // Import the getSharedContentFromUrl function
          const { getSharedContentFromUrl } = await import('@/lib/sharing');
          const sharedContent = getSharedContentFromUrl();

          if (sharedContent) {
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
              size: sharedContent.metadata?.fileSize || 'Unknown',
              conversion: sharedContent.metadata?.conversionType || conversionType,
            });

            // Only add to history if we have actual content
            if (sharedContent.content && sharedContent.content.length > 0) {
              addConversion({
                type: conversionType,
                input: '', // We don't have the original input
                output: sharedContent.content,
                fileName: correctedFileName,
                fileSize: sharedContent.metadata?.fileSize,
                isShared: true,
                tags: ['shared'],
              });
            }

            setIsLoading(false);
            return;
          } else {
            setError('Shared file link is invalid or corrupted.');
            setIsLoading(false);
            return;
          }
        } catch (err) {
          console.error('Error loading shared file from URL:', err);
          setError('Failed to load the shared file. The link may be corrupted or incomplete.');
          setIsLoading(false);
          return;
        }
      } else {
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
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy content:', err);
    }
  };

  const handleBackToConverter = () => {
    // Clear the shared parameters and go back to converter
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
      // Simple syntax highlighting for JSON
      return content
        .replace(/("([^"]*)")/g, '<span class="text-green-600">"$1"</span>') // Strings in green
        .replace(/(\d+)/g, '<span class="text-blue-600">$1</span>') // Numbers in blue
        .replace(/(true|false|null)/g, '<span class="text-purple-600">$1</span>') // Booleans/null in purple
        .replace(/([{])/g, '<span class="text-orange-600">$1</span>') // Braces in orange
        .replace(/([}])/g, '<span class="text-orange-600">$1</span>')
        .replace(/([[\]])/g, '<span class="text-orange-600">$1</span>') // Brackets in orange
        .replace(/(:)/g, '<span class="text-gray-600">$1</span>'); // Colons in gray
    }

    // For CSV, just return as-is with proper spacing
    return content;
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading shared file...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Error Loading File</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={handleBackToConverter} className="w-full">
              <ArrowLeft size={16} className="mr-2" />
              Back to Converter
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
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <Badge variant="secondary" className="text-sm">
          <Share2 size={14} className="mr-1" />
          Shared File
        </Badge>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Shared File Received
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Someone shared a {getFileTypeLabel()} file with you through Fast Convert
        </p>
      </div>

      {/* File Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <FileText size={24} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-lg">{sharedData.name}</CardTitle>
                <CardDescription>
                  {getFileTypeLabel()} File • {sharedData.size}
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline">{getFileTypeLabel()}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>{formatDate(sharedData.timestamp)}</span>
            </div>
            <div className="flex items-center gap-1">
              <HardDrive size={14} />
              <span>{sharedData.size}</span>
            </div>
          </div>

          {/* Message for metadata-only sharing */}
          {!hasContent && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start gap-2 text-blue-800 dark:text-blue-200">
                <Info size={16} className="shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">File Information Only</p>
                  <p className="opacity-90">
                    This file was too large to include in the share link. Please contact the original sender to get the complete file, or download it from the device where it was originally converted.
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
                  Download File
                </Button>
                <Button onClick={handleCopyContent} variant="outline" className="flex-1 sm:flex-none">
                  Copy Content
                </Button>
              </>
            )}
            <Button onClick={handleBackToConverter} variant="outline" className="flex-1 sm:flex-none">
              <ArrowLeft size={16} className="mr-2" />
              Back to Converter
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
              Full file content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Content Type: {getFileTypeLabel()}
                </span>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {sharedData.file.length.toLocaleString()} characters • Full content
                  </span>
                  {getFileTypeLabel() === 'JSON' && (
                    <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
                      Syntax Highlighted
                    </span>
                  )}
                </div>
              </div>
              <div
                className="text-sm overflow-x-auto whitespace-pre-wrap break-all max-h-96 overflow-y-auto font-mono text-gray-800 dark:text-gray-200"
                dangerouslySetInnerHTML={{ __html: getHighlightedContent() }}
                style={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <span>This file has been added to your history</span>
          <span>•</span>
          <span>Safe and local processing</span>
        </div>
        <Button onClick={() => router.push('/')} variant="outline">
          <ExternalLink size={16} className="mr-2" />
          Open in Converter
        </Button>
      </div>
    </div>
  );
}