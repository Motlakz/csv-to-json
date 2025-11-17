import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Download, Share2, Trash2, Calendar, FileText, Code } from 'lucide-react';
import { ConversionHistoryItem, SharePlatform } from '@/types';
import { ShareDialog } from './share-dialog';
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
    const content = file.output;
    const isJsonConversion = file.type === 'csv-to-json';
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
  };

  const getFileIcon = (type: string) => {
    return type === 'csv-to-json' ? (
      <Code className="text-green-500" size={20} />
    ) : (
      <FileText className="text-blue-500" size={20} />
    );
  };

  const getFileTypeLabel = (type: string) => {
    return type === 'csv-to-json' ? 'JSON' : 'CSV';
  };

  const getFileTypeColor = (type: string) => {
    return type === 'csv-to-json'
      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
      : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {showSharedOnly ? 'Shared Files' : 'All Files'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
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
              className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          {filteredFiles.map((file, index) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {/* File Icon */}
                  <div className="w-12 h-12 bg-gray-50 dark:bg-gray-900 rounded-lg flex items-center justify-center shrink-0">
                    {getFileIcon(file.type)}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">
                        {file.fileName || `converted.${file.type === 'csv-to-json' ? 'json' : 'csv'}`}
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
                        <Calendar size={14} />
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

                {/* Actions */}
                <div className="flex items-center gap-2 ml-4">
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
            </motion.div>
          ))}
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