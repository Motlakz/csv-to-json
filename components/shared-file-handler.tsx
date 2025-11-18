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
  FileSpreadsheet,
  Calendar,
  HardDrive,
  ArrowLeft,
  ExternalLink,
  Info,
  Copy,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { ConversionType } from '@/types';
import { useHistoryStore } from '@/lib/history-store';
import { getSharedContentFromUrl } from '@/lib/sharing';
import { VscJson } from 'react-icons/vsc';
import { PiFileCsvDuotone } from 'react-icons/pi';

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
          // Check what parameters were provided for better error messages
          const urlParams = new URLSearchParams(window.location.search);
          const strategy = urlParams.get('s');
          const base64Content = urlParams.get('c');
          const fileName = urlParams.get('n');

          if (!strategy) {
            setError('Invalid share link format. No sharing strategy specified.');
          } else if (strategy === 'q' && (!base64Content || !fileName)) {
            setError('Invalid share link. Missing required file information.');
          } else if (strategy === 'h') {
            setError('Invalid share link. Hash fragment is missing or corrupted.');
          } else if (strategy === 'db') {
            setError('Shared file not found in database or database is not available.');
          } else {
            setError('Invalid or expired share link');
          }

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
        } else if (sharedContent.metadata?.conversionType === 'json-to-excel') {
          conversionType = 'json-to-excel';
          correctedMimeType = 'application/json'; // Store the JSON input, not the Excel output

          // Ensure file has .json extension for preview, but indicates Excel conversion
          if (!sharedContent.fileName.toLowerCase().endsWith('.json')) {
            const baseName = sharedContent.fileName.replace(/\.[^/.]+$/, '');
            correctedFileName = baseName + '.json';
          }
        } else if (sharedContent.metadata?.conversionType === 'excel-to-json') {
          conversionType = 'excel-to-json';
          correctedMimeType = 'application/json';

          // Ensure file has .json extension
          if (!sharedContent.fileName.toLowerCase().endsWith('.json')) {
            const baseName = sharedContent.fileName.replace(/\.[^/.]+$/, '');
            correctedFileName = baseName + '.json';
          }
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

        console.log('Setting sharedData:', {
          sharedContentConversionType: sharedContent.metadata?.conversionType,
          conversionType,
          correctedFileName,
          correctedMimeType
        });

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

    // Special handling for Excel conversions
    if (sharedData.conversion === 'json-to-excel') {
      // For JSON to Excel files, convert the JSON content to Excel and download as .xlsx
      import('@/lib/utils').then(({ jsonToExcel, downloadExcelFile }) => {
        const result = jsonToExcel(sharedData.file);
        if (!result.error && result.data.length > 0) {
          const baseName = sharedData.name.replace(/\.[^/.]+$/, '');
          const excelFileName = baseName + '.xlsx';
          downloadExcelFile(result.data, excelFileName);
        } else {
          console.error('Failed to convert shared JSON to Excel:', result.error);
        }
      });
      return;
    }

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

    // Check by conversion type first for Excel conversions
    if (sharedData.conversion === 'json-to-excel') {
      return 'Excel';
    } else if (sharedData.conversion === 'excel-to-json') {
      return 'JSON';
    }

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

  const getFileTypeInfo = (fileType?: string) => {
    const type = fileType || getFileTypeLabel();

    const typeConfig = {
      JSON: {
        icon: VscJson,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100 dark:bg-orange-900/30',
        badgeColor: 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300',
        previewBg: 'dark:bg-orange-900/10 bg-orange-50'
      },
      Excel: {
        icon: FileSpreadsheet,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
        badgeColor: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
        previewBg: 'bg-white dark:bg-gray-800'
      },
      CSV: {
        icon: PiFileCsvDuotone,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        badgeColor: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
        previewBg: 'dark:bg-blue-900/10 bg-blue-50'
      }
    };

    return typeConfig[type as keyof typeof typeConfig] || {
      icon: FileText,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100 dark:bg-gray-900/30',
      badgeColor: 'bg-gray-100 dark:bg-gray-900/40 text-gray-700 dark:text-gray-300',
      previewBg: 'dark:bg-slate-900/20 bg-slate-200'
    };
  };

  const getHighlightedContent = () => {
    if (!sharedData?.file) return '';

    const content = sharedData.file;

    // Special handling for JSON-to-Excel conversions - show as table
    // Note: excel-to-json should show as regular JSON with syntax highlighting
    if (sharedData.conversion === 'json-to-excel') {
      try {
        const jsonData = JSON.parse(content);
        if (Array.isArray(jsonData) && jsonData.length > 0) {
          // Create a table preview with improved styling
          const headers = Object.keys(jsonData[0]);
          const maxRows = 20; // Show more rows for better preview
          const displayRows = jsonData.slice(0, maxRows);

          const tableRows = displayRows.map((row, index) => {
            const cells = headers.map(header => {
              const value = row[header];
              // Format the value nicely
              const displayValue = value === null || value === undefined ? '' : String(value);
              return `<td class="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300" title="${displayValue}">${displayValue}</td>`;
            }).join('');

            return `<tr class="${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-750'}">${cells}</tr>`;
          }).join('');

          const headerCells = headers.map(header =>
            `<th class="px-3 py-2 text-left font-medium text-emerald-700 dark:text-emerald-300 border border-gray-200 dark:border-gray-700 bg-emerald-50 dark:bg-emerald-900/20 sticky top-0">${header}</th>`
          ).join('');

          return `
            <div class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <table class="w-full text-sm border-collapse">
                <thead>
                  <tr>${headerCells}</tr>
                </thead>
                <tbody>
                  ${tableRows}
                </tbody>
              </table>
            </div>
            ${jsonData.length > maxRows ? `<p class="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">Showing first ${maxRows} of ${jsonData.length} rows • Download to see all data</p>` : ''}
          `;
        }
      } catch (e) {
        // If JSON parsing fails, fall back to regular display
        console.warn('Failed to parse JSON for Excel preview:', e);
      }
    }

    const isJson = sharedData.type === 'application/json' ||
                   content.trim().startsWith('[') ||
                   content.trim().startsWith('{');

    if (isJson) {
      // Simple syntax highlighting for JSON with proper escaping
      return content
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/(".*?")/g, '<span>$1</span>')
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
                <div className={`p-3 rounded-lg ${getFileTypeInfo().bgColor}`}>
                  {(() => {
                    const fileInfo = getFileTypeInfo();
                    const IconComponent = fileInfo.icon;
                    return (
                      <IconComponent size={24} className={fileInfo.color} />
                    );
                  })()}
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
              <Badge variant="secondary" className="shrink-0">
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
                  {(() => {
                    const fileInfo = getFileTypeInfo();
                    return (
                      <Button
                        onClick={handleDownload}
                        className={`flex-1 sm:flex-none ${
                          sharedData.conversion === 'json-to-excel'
                            ? 'bg-emerald-600 hover:bg-emerald-700'
                            : sharedData.conversion === 'json-to-csv'
                            ? 'bg-blue-600 hover:bg-blue-700'
                            : fileInfo.color === 'text-orange-600'
                            ? 'bg-orange-600 hover:bg-orange-700'
                            : ''
                        }`}
                      >
                        <Download size={16} className="mr-2" />
                        Download {sharedData.conversion === 'json-to-excel' ? 'Excel' : ''}
                      </Button>
                    );
                  })()}

                  {(() => {
                    return (
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
                    );
                  })()}
                </>
              )}

              <Button
                onClick={handleBackToConverter}
                variant="outline"
                className="flex-1 sm:flex-none hover:bg-gray-50 dark:hover:bg-gray-900/20"
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
                {(() => {
                  const fileInfo = getFileTypeInfo();
                  const IconComponent = fileInfo.icon;
                  return (
                    <IconComponent size={18} className={fileInfo.color} />
                  );
                })()}
                File Preview
              </CardTitle>
              <CardDescription>
                {sharedData.conversion === 'json-to-excel' ? (
                  <>Excel data preview • {sharedData.file.length.toLocaleString()} characters total</>
                ) : (
                  <>{sharedData.file.length.toLocaleString()} characters • {sharedData.file.split('\n').length} lines</>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className={`rounded-lg p-4 border dark:border-gray-700 border-gray-400 ${
                sharedData.conversion === 'json-to-excel'
                  ? getFileTypeInfo('Excel').previewBg
                  : getFileTypeInfo().previewBg
              }`}>
                <div className="flex items-center justify-between mb-3 pb-2 border-b dark:border-gray-700 border-gray-400">
                  <span className="text-xs text-gray-700 dark:text-gray-400">
                    {sharedData.conversion === 'json-to-excel' ? 'Excel Spreadsheet' : `${getFileTypeLabel()} File`}
                  </span>
                  {sharedData.conversion === 'json-to-excel' ? (
                    <span className="text-xs bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded-full">
                      Table Preview
                    </span>
                  ) : getFileTypeLabel() === 'JSON' ? (
                    <span className="text-xs bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 px-2 py-1 rounded-full">
                      Syntax Highlighted
                    </span>
                  ) : getFileTypeLabel() === 'CSV' ? (
                    <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
                      Comma Separated
                    </span>
                  ) : null}
                </div>
                <div
                  className={`text-sm overflow-x-auto max-h-96 overflow-y-auto ${
                    sharedData.conversion === 'json-to-excel'
                      ? ''
                      : 'font-mono dark:text-gray-400 text-gray-800'
                  }`}
                  dangerouslySetInnerHTML={{ __html: getHighlightedContent() }}
                  style={{
                    whiteSpace: sharedData.conversion === 'json-to-excel' ? 'normal' : 'pre-wrap',
                    wordBreak: sharedData.conversion === 'json-to-excel' ? 'normal' : 'break-word',
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
