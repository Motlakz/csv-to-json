import React, { useState, useEffect, JSX } from 'react';
import { motion } from 'framer-motion';
import { Search, Download, Share2, Trash2, Calendar, FileText } from 'lucide-react';
import { VscJson } from 'react-icons/vsc';
import { ConversionHistoryItem, SharePlatform } from '@/types';
import { ShareDialog } from './share-dialog';
import { PiFileCsvDuotone, PiMicrosoftExcelLogoDuotone } from 'react-icons/pi';
import { jsonToExcel, downloadExcelFile } from '@/lib/utils';
import { StyledLoveTestPromoCard } from './common/styled-love-test-promo-card';
import { StyledMRRLeaderboardPromoCard } from './common/styled-mrr-leaderboard-promo-card';

// Simple date formatting utility
const formatDistanceToNow = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} day${days === 1 ? '' : 's'} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  } else {
    return 'just now';
  }
};

interface FilesViewProps {
  files: ConversionHistoryItem[];
  showSharedOnly?: boolean;
  onDeleteFile: (id: string) => void;
  onShareFile: (id: string, shareData: { platform: SharePlatform; link?: string; sharedWith?: string[] }) => void;
}

export function FilesView({ files, showSharedOnly = false, onDeleteFile, onShareFile }: FilesViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState<ConversionHistoryItem | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [useLoveTestPromo, setUseLoveTestPromo] = useState(true);

  // Rotate promo cards every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setUseLoveTestPromo(prev => !prev);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // Filter files based on search and shared status
  const filteredFiles = files.filter(file => {
    const matchesSearch = searchTerm === '' ||
      file.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.type.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSharedFilter = !showSharedOnly || file.isShared;

    return matchesSearch && matchesSharedFilter;
  });

  const handleShare = (file: ConversionHistoryItem) => {
    setSelectedFile(file);
    setShareDialogOpen(true);
  };

  const handleShareComplete = (shareData: { platform: SharePlatform; link?: string; sharedWith?: string[] }) => {
    if (selectedFile) {
      onShareFile(selectedFile.id, shareData);
    }
    setSelectedFile(null);
  };

  const handleDownload = (file: ConversionHistoryItem) => {
    const isJsonConversion = file.type === 'csv-to-json' || file.type === 'excel-to-json';
    const isExcelConversion = file.type === 'json-to-excel';

    if (isExcelConversion) {
      // For Excel files, regenerate the Excel file from the stored JSON input
      const result = jsonToExcel(file.input);
      if (!result.error) {
        const baseName = file.fileName ? file.fileName.replace(/\.[^/.]+$/, '') : 'converted';
        const excelFileName = baseName + '.xlsx';
        downloadExcelFile(result.data, excelFileName);
      }
    } else {
      // For JSON/CSV files, use the original logic
      const content = file.output;
      const blob = new Blob([content], {
        type: isJsonConversion ? 'application/json' : 'text/csv',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      // Force correct extension based on conversion type, not original filename
      const baseName = file.fileName ? file.fileName.replace(/\.[^/.]+$/, '') : 'converted';
      const correctExtension = isJsonConversion ? '.json' : '.csv';
      a.download = baseName + correctExtension;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'csv-to-json':
        return <VscJson className="text-orange-500" size={20} />;
      case 'json-to-csv':
        return <PiFileCsvDuotone className="text-blue-500" size={20} />;
      case 'json-to-excel':
        return <PiMicrosoftExcelLogoDuotone className="text-green-600" size={20} />;
      case 'excel-to-json':
        return <VscJson className="text-violet-500" size={20} />;
      default:
        return <FileText className="text-gray-500" size={20} />;
    }
  };

  const getFileTypeLabel = (type: string) => {
    switch (type) {
      case 'csv-to-json':
        return 'JSON';
      case 'json-to-csv':
        return 'CSV';
      case 'json-to-excel':
        return 'Excel';
      case 'excel-to-json':
        return 'JSON';
      default:
        return 'Unknown';
    }
  };

  const getFileTypeColor = (type: string) => {
    switch (type) {
      case 'csv-to-json':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300';
      case 'json-to-csv':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'json-to-excel':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300';
      case 'excel-to-json':
        return 'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            {showSharedOnly ? 'Shared Files' : 'All Files'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">
            {filteredFiles.length} {filteredFiles.length === 1 ? 'file' : 'files'}
            {showSharedOnly && ' that you have shared'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
            />
          </div>
        </div>
      </div>

      {/* Files List */}
      {filteredFiles.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            {showSharedOnly ? <Share2 size={32} className="text-gray-400" /> : <FileText size={32} className="text-gray-400" />}
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {showSharedOnly ? 'No shared files yet' : 'No files found'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {showSharedOnly
              ? 'Start sharing files to see them here'
              : searchTerm
                ? 'Try adjusting your search terms'
                : 'Convert some files to see them here'
            }
          </p>
        </motion.div>
      ) : (
        <div className="grid gap-4">
          {(() => {
            const elements: JSX.Element[] = [];

            filteredFiles.forEach((file, fileIndex) => {
              // Add the file
              elements.push(
                <motion.div
                  key={`file-${file.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: fileIndex * 0.05 }}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 sm:p-4 hover:shadow-lg transition-shadow overflow-hidden"
                >
                  {/* Desktop layout - maintain original structure */}
                  <div className="hidden sm:flex items-center justify-between min-w-0 w-full">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {/* File Icon */}
                      <div className="w-12 h-12 bg-gray-50 dark:bg-gray-900 rounded-lg flex items-center justify-center shrink-0">
                        {getFileIcon(file.type)}
                      </div>

                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-900 dark:text-white truncate wrap-break-word">
                            {file.fileName || `converted.${getFileTypeLabel(file.type).toLowerCase()}`}
                          </h3>
                          <span className={`px-2 py-0.5 text-xs rounded-md font-medium ${getFileTypeColor(file.type)}`}>
                            {getFileTypeLabel(file.type)}
                          </span>
                          {file.isShared && (
                            <span className="px-2 py-0.5 text-xs rounded-md font-medium bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                              Shared
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                          <span>{file.fileSize || 'Unknown size'}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {formatDistanceToNow(file.timestamp)}
                          </span>
                          {file.sharePlatform && (
                            <>
                              <span>•</span>
                              <span>Shared via {file.sharePlatform.replace('-', ' ')}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions - desktop */}
                    <div className="flex items-center gap-2 ml-4 shrink-0">
                      <button
                        onClick={() => handleDownload(file)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Download file"
                      >
                        <Download size={18} className="text-gray-600 dark:text-gray-400" />
                      </button>
                      <button
                        onClick={() => handleShare(file)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Share file"
                      >
                        <Share2 size={18} className="text-gray-600 dark:text-gray-400" />
                      </button>
                      <button
                        onClick={() => onDeleteFile(file.id)}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Delete file"
                      >
                        <Trash2 size={18} className="text-red-500" />
                      </button>
                    </div>
                  </div>

                  {/* Mobile layout - stacked */}
                  <div className="sm:hidden space-y-3 w-full">
                    {/* Header row with file info */}
                    <div className="flex items-start gap-3">
                      {/* File Icon */}
                      <div className="w-10 h-10 bg-gray-50 dark:bg-gray-900 rounded-lg flex items-center justify-center shrink-0">
                        {getFileIcon(file.type)}
                      </div>

                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col gap-2 mb-2">
                          <h3 className="font-medium text-gray-900 dark:text-white wrap-break-word">
                            {file.fileName || `converted.${getFileTypeLabel(file.type).toLowerCase()}`}
                          </h3>
                          <div className="flex flex-wrap items-center gap-1">
                            <span className={`px-2 py-0.5 text-xs rounded-md font-medium ${getFileTypeColor(file.type)}`}>
                              {getFileTypeLabel(file.type)}
                            </span>
                            {file.isShared && (
                              <span className="px-2 py-0.5 text-xs rounded-md font-medium bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                                Shared
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                          <span>{file.fileSize || 'Unknown size'}</span>
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {formatDistanceToNow(file.timestamp)}
                          </span>
                          {file.sharePlatform && (
                            <span className="text-xs">Shared via {file.sharePlatform.replace('-', ' ')}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions - full width on mobile */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                      <button
                        onClick={() => handleDownload(file)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-xs"
                        title="Download file"
                      >
                        <Download size={16} className="text-gray-600 dark:text-gray-400" />
                        <span>Download</span>
                      </button>
                      <button
                        onClick={() => handleShare(file)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-xs"
                        title="Share file"
                      >
                        <Share2 size={16} className="text-gray-600 dark:text-gray-400" />
                        <span>Share</span>
                      </button>
                      <button
                        onClick={() => onDeleteFile(file.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors text-xs"
                        title="Delete file"
                      >
                        <Trash2 size={16} className="text-red-500" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );

              // Add promo after every 2 files (positions 3, 6, 9, etc.)
              if ((fileIndex + 1) % 3 === 0) {
                elements.push(
                  useLoveTestPromo ? (
                    <StyledLoveTestPromoCard key={`promo-${fileIndex}`} index={fileIndex} />
                  ) : (
                    <StyledMRRLeaderboardPromoCard key={`promo-${fileIndex}`} index={fileIndex} />
                  )
                );
              }
            });

            return elements;
          })()}
        </div>
      )}

      {/* Share Dialog */}
      <ShareDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        item={selectedFile}
        onShareComplete={handleShareComplete}
      />
    </div>
  );
}