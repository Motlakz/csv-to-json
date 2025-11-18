import { motion } from 'framer-motion';
import { Check, Download, FileText, Loader } from 'lucide-react';
import { VscJson } from 'react-icons/vsc';
import { PiFileCsvDuotone, PiMicrosoftExcelLogoDuotone } from 'react-icons/pi';

interface ConversionItem {
  name: string;
  status: 'converting' | 'converted';
  size: string;
}

interface ConversionListProps {
  items: ConversionItem[];
  onDownload: (index: number) => void;
  onDownloadAll?: () => void;
  conversionType?: 'csv-to-json' | 'json-to-csv' | 'json-to-excel' | 'excel-to-json';
}

export function ConversionList({
  items,
  onDownload,
  onDownloadAll,
  conversionType = 'csv-to-json'
}: ConversionListProps) {
  if (items.length === 0) return null;

  const getFormatDetails = (type: string) => {
    switch (type) {
      case 'csv-to-json':
      case 'excel-to-json':
        return {
          label: 'JSON',
          icon: <VscJson className="text-orange-500" size={16} />,
          color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
        };
      case 'json-to-csv':
        return {
          label: 'CSV',
          icon: <PiFileCsvDuotone className="text-blue-500" size={16} />,
          color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
        };
      case 'json-to-excel':
        return {
          label: 'Excel',
          icon: <PiMicrosoftExcelLogoDuotone className="text-green-500" size={16} />,
          color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
        };
      default:
        return {
          label: 'Unknown',
          icon: <FileText className="text-gray-500" size={16} />,
          color: 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300'
        };
    }
  };

  const formatDetails = getFormatDetails(conversionType);
  const formatLabel = formatDetails.label;
  const formatIcon = formatDetails.icon;
  const formatColor = formatDetails.color;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 sm:space-y-6 mt-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-2">
          <span className="text-base sm:text-sm font-medium text-gray-600 dark:text-gray-400">
            Recent Conversions
          </span>
          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-400">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        {items.length > 0 && items.every(i => i.status === 'converted') && onDownloadAll && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onDownloadAll}
            className="flex items-center justify-center gap-2 px-4 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors w-full sm:w-auto"
          >
            <Download size={16} />
            <span>Download All</span>
          </motion.button>
        )}
      </div>

      {items.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5 hover:shadow-sm transition-shadow overflow-hidden"
        >
          {/* Desktop layout - maintain original structure */}
          <div className="hidden sm:flex items-center justify-between min-w-0 w-full">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {/* Count indicator on the left */}
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 shrink-0">
                {index + 1}
              </div>

              {/* File icon */}
              <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-gray-900 flex items-center justify-center shrink-0">
                {formatIcon}
              </div>

              {/* File info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {item.name}
                  </p>
                  <span className={`px-2 py-0.5 text-xs rounded-md font-medium ${formatColor} shrink-0`}>
                    {formatLabel}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                  {item.status === 'converted' ? (
                    <>
                      <Check size={14} className="text-green-500" />
                      <span>Ready to download</span>
                    </>
                  ) : (
                    <>
                      <Loader size={14} className="text-blue-500 animate-spin" />
                      <span>Converting...</span>
                    </>
                  )}
                  <span>• {item.size}</span>
                </div>
              </div>
            </div>

            {/* Actions - desktop */}
            {item.status === 'converted' && (
              <div className="flex items-center gap-2 ml-4 shrink-0">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onDownload(index)}
                  className="p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                  title={`Download ${item.name}`}
                >
                  <Download size={16} />
                </motion.button>
              </div>
            )}
          </div>

          {/* Mobile layout - stacked */}
          <div className="sm:hidden space-y-3 w-full">
            {/* Header row with file info */}
            <div className="flex items-start gap-3">
              {/* File Icon */}
              <div className="w-10 h-10 bg-gray-50 dark:bg-gray-900 rounded-lg flex items-center justify-center shrink-0">
                {formatIcon}
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col gap-2 mb-2">
                  <h3 className="font-medium text-gray-900 dark:text-white truncate">
                    {item.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-1">
                    <span className={`px-2 py-0.5 text-xs rounded-md font-medium ${formatColor}`}>
                      {formatLabel}
                    </span>
                    <span className="px-2 py-0.5 text-xs rounded-md font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                      #{index + 1}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  {item.status === 'converted' ? (
                    <>
                      <Check size={14} className="text-green-500" />
                      <span>Ready to download</span>
                    </>
                  ) : (
                    <>
                      <Loader size={14} className="text-blue-500 animate-spin" />
                      <span>Converting...</span>
                    </>
                  )}
                  <span>{item.size}</span>
                </div>
              </div>
            </div>

            {/* Download button - full width on mobile */}
            {item.status === 'converted' && (
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                <button
                  onClick={() => onDownload(index)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-xs"
                  title={`Download ${item.name}`}
                >
                  <Download size={16} className="text-gray-600 dark:text-gray-400" />
                  <span>Download</span>
                </button>
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
