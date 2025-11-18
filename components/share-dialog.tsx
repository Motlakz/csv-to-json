import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Share2, Download, Copy, Check, Monitor, Clock, FileText, Loader2,
  ShieldCheck
} from 'lucide-react';
import { ConversionHistoryItem, SharePlatform } from '@/types';
import { shareToPlatform, platformInfo } from '@/lib/sharing';
import { jsonToExcel, downloadExcelFile } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ConversionHistoryItem | null;
  onShareComplete: (shareData: { platform: SharePlatform; link?: string; sharedWith?: string[] }) => void;
}

export function ShareDialog({ open, onOpenChange, item, onShareComplete }: ShareDialogProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<SharePlatform | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [shareProgress, setShareProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!item) return null;

  const platforms: SharePlatform[] = ['link', 'email'];

  const handleShare = async (platform: SharePlatform) => {
    setIsSharing(true);
    setSelectedPlatform(platform);
    setShareProgress(0);

    try {
      // Track start time for minimum delay
      const startTime = Date.now();
      const minDelay = 2000; // Minimum 2 seconds to see the progress

      // Simulate progress for better UX - smoother animation over 2 seconds
      const progressInterval = setInterval(() => {
        setShareProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 5; // Increment by 5 every 100ms (reaches 90 in 1.8 seconds)
        });
      }, 100);

      // Determine file type and MIME type based on conversion type
      let fileExtension = 'csv';
      let fileType = 'CSV';
      let mimeType = 'text/csv';
      let content = item.output;

      switch (item.type) {
        case 'csv-to-json':
          fileExtension = 'json';
          fileType = 'JSON';
          mimeType = 'application/json';
          break;
        case 'json-to-csv':
          fileExtension = 'csv';
          fileType = 'CSV';
          mimeType = 'text/csv';
          break;
        case 'json-to-excel':
          // For Excel conversions, share the JSON source with json mime type
          // The SharedFileHandler will display it as a table and allow Excel download
          fileExtension = 'json';
          fileType = 'Excel';
          mimeType = 'application/json'; // Use JSON mime type for the source data
          content = item.input; // Share the JSON source
          break;
        case 'excel-to-json':
          fileExtension = 'json';
          fileType = 'JSON';
          mimeType = 'application/json';
          break;
        default:
          fileExtension = 'txt';
          fileType = 'File';
          mimeType = 'text/plain';
      }

      // Create enhanced share data with metadata
      const shareData = {
        title: `${item.fileName || 'Converted File'} (${fileType})`,
        text: `Check out this ${fileType} file I converted using Swift Convert.`,
        url: `${window.location.origin}?shared=${item.id}&timestamp=${Date.now()}`,
        metadata: {
          fileName: item.fileName,
          fileSize: item.fileSize,
          conversionType: item.type,
          conversionDate: item.timestamp,
          platform: platform,
        }
      };

      // Create a file with proper naming and metadata
      const fileName = item.fileName || `converted-${item.type}-${Date.now()}.${fileExtension}`;
      const blob = new Blob([content], { type: mimeType });
      const file = new File([blob], fileName, { type: mimeType });

      // Enhanced share data with actual file content
      const enhancedShareData = {
        title: shareData.title,
        text: shareData.text,
        url: shareData.url,
        file,
        metadata: {
          fileName: fileName,
          fileSize: item.fileSize,
          conversionType: item.type,
          conversionDate: item.timestamp,
          platform: platform,
        }
      };

      // Execute share and ensure minimum delay
      await Promise.all([
        shareToPlatform(platform, enhancedShareData),
        new Promise(resolve => {
          const elapsed = Date.now() - startTime;
          const remainingDelay = Math.max(0, minDelay - elapsed);
          setTimeout(resolve, remainingDelay);
        })
      ]);

      clearInterval(progressInterval);
      setShareProgress(100);

      // Update the item's share status with proper link
      onShareComplete({
        platform,
        link: shareData.url, // Always provide the direct link
        sharedWith: platform === 'email' ? ['recipient'] : platform === 'whatsapp' || platform === 'teams' ? ['contact'] : undefined
      });

      setShowSuccess(true);

      // Show success for 1.5 seconds before closing
      setTimeout(() => {
        setShowSuccess(false);
        onOpenChange(false);
        setSelectedPlatform(null);
        setShareProgress(0);
      }, 1500);
    } catch (error) {
      console.error('Share failed:', error);
      // Show error message - could enhance with a toast component
      setShareProgress(0);
      // Optional: Add error state display
      setShowSuccess(false);
    } finally {
      setIsSharing(false);
    }
  };

  const handleDownload = () => {
    const isJsonConversion = item.type === 'csv-to-json' || item.type === 'excel-to-json';
    const isExcelConversion = item.type === 'json-to-excel';
    const baseName = item.fileName ? item.fileName.replace(/\.[^/.]+$/, '') : 'converted';

    if (isExcelConversion) {
      // For Excel conversions, regenerate the Excel file
      const result = jsonToExcel(item.input);
      if (!result.error && result.data) {
        const excelFileName = baseName + '.xlsx';
        downloadExcelFile(result.data, excelFileName);
      }
    } else {
      // For JSON/CSV files, use standard download
      const content = item.output;
      const mimeType = isJsonConversion ? 'application/json' : 'text/csv';
      const correctExtension = isJsonConversion ? '.json' : '.csv';
      const fileName = baseName + correctExtension;

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const formatFileSize = (size?: string) => size || 'Unknown size';

  const formatFileName = (fileName?: string) => {
    if (!fileName) return 'Converted File';
    return fileName.length > 25 ? fileName.substring(0, 22) + '...' : fileName;
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Future enhancement: Allow re-importing and modifying shared files
      console.log('File import triggered:', file.name);
    }
    // Reset input
    event.target.value = '';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Hidden file input for future file import functionality */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.json,.txt"
          onChange={handleFileImport}
          className="hidden"
        />
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Share2 size={24} className="text-blue-600" />
            Share Your File
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Copy a shareable link or send via email • {formatFileName(item.fileName)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Enhanced File Info */}
          <div className="relative bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <FileText size={18} className="text-blue-600 dark:text-blue-400 shrink-0" />
                  <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                    {formatFileName(item.fileName)}
                  </h4>
                </div>
                <div className="flex items-center flex-wrap gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full font-medium">
                    {item.type === 'csv-to-json' || item.type === 'excel-to-json' ? 'JSON' :
                     item.type === 'json-to-excel' ? 'XLSX' : 'CSV'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Monitor size={12} />
                    {formatFileSize(item.fileSize)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(item.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <button
                onClick={handleDownload}
                className="ml-3 p-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors shadow-sm"
                title="Download file"
              >
                <Download size={16} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>

          {/* Share Options */}
          <div className="space-y-4">
            {/* Progress Indicator */}
            <AnimatePresence>
              {isSharing && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                >
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      Sharing to {platformInfo[selectedPlatform as SharePlatform]?.name}...
                    </span>
                    <span className="text-blue-600 dark:text-blue-400 font-semibold">
                      {shareProgress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="h-full bg-linear-to-r from-blue-500 to-blue-600 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${shareProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <h3 className="font-medium text-gray-900 dark:text-white text-center">
              Choose how to share
            </h3>
            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
              {platforms.map((platform) => {
                const info = platformInfo[platform];
                const isSelected = selectedPlatform === platform;
                const isLoading = isSharing && isSelected;
                const IconComponent = info.icon;

                return (
                  <motion.button
                    key={platform}
                    whileHover={{ scale: isLoading ? 1 : 1.02 }}
                    whileTap={{ scale: isLoading ? 1 : 0.98 }}
                    onClick={() => !isLoading && handleShare(platform)}
                    disabled={isLoading || isSharing}
                    className={`
                      relative flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all shadow-sm hover:shadow-md
                      ${isSelected && !showSuccess
                        ? `${info.color} border-transparent shadow-lg scale-105`
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-750'
                      }
                      ${isLoading || (isSharing && !isSelected) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                      }
                      ${showSuccess && isSelected ? 'ring-2 ring-green-500 ring-offset-2' : ''}
                    `}
                  >
                    <div className="relative">
                      <IconComponent
                        size={28}
                        className={`
                          ${isSelected && !showSuccess ? info.textColor : 'text-gray-600 dark:text-gray-400'}
                          ${showSuccess && isSelected ? 'text-green-600' : ''}
                        `}
                      />
                      {isLoading && (
                        <div className="absolute -top-2 -right-2">
                          <Loader2 size={16} className="text-blue-600 animate-spin" />
                        </div>
                      )}
                      {showSuccess && isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
                        >
                          <Check size={12} className="text-white" />
                        </motion.div>
                      )}
                      {platform === 'link' && !isLoading && !showSuccess && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                          <Copy size={8} className="text-white" />
                        </div>
                      )}
                    </div>
                    <span className={`text-sm font-medium text-center ${
                      isSelected && !showSuccess ? info.textColor :
                      showSuccess && isSelected ? 'text-green-600' :
                      'text-gray-700 dark:text-gray-300'
                    }`}>
                      {info.name}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Success Message */}
          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
              >
                <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                  <Check size={20} className="shrink-0" />
                  <div>
                    <p className="font-medium">Successfully shared!</p>
                    <p className="text-sm opacity-90">
                      Your file has been shared to {platformInfo[selectedPlatform as SharePlatform]?.name}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Security Notice */}
          <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <ShieldCheck size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800 dark:text-amber-200">
              <p className="font-medium mb-1">Privacy & Security</p>
              <p className="opacity-90">
                Files are shared locally and contain only your data. No sensitive information is stored on our servers.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}