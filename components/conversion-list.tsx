import React from 'react';
import { motion } from 'framer-motion';
import { Check, Download, FileText, Loader, Code } from 'lucide-react';

interface ConversionItem {
  name: string;
  status: 'converting' | 'converted';
  size: string;
}

interface ConversionListProps {
  items: ConversionItem[];
  onDownload: (index: number) => void;
  onDownloadAll?: () => void;
  conversionType?: 'csv-to-json' | 'json-to-csv';
}

export function ConversionList({
  items,
  onDownload,
  onDownloadAll,
  conversionType = 'csv-to-json'
}: ConversionListProps) {
  if (items.length === 0) return null;

  const formatLabel = conversionType === 'csv-to-json' ? 'JSON' : 'CSV';
  const formatIcon = conversionType === 'csv-to-json' ? (
    <Code className="text-green-500" size={16} />
  ) : (
    <FileText className="text-blue-500" size={16} />
  );

  const formatColor = conversionType === 'csv-to-json'
    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
    : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3 mt-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
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
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors"
          >
            <Download size={16} />
            Download All
          </motion.button>
        )}
      </div>

      {items.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center justify-between p-4 rounded-xl border bg-white dark:bg-gray-800 dark:border-gray-700 hover:shadow-sm transition-shadow"
        >
          <div className="flex items-center gap-4">
            {/* Count indicator on the left */}
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300">
              {index + 1}
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                {formatIcon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {item.name}
                  </p>
                  <span className={`px-2 py-0.5 text-xs rounded-md font-medium ${formatColor}`}>
                    {formatLabel}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {item.status === 'converted' ? (
                    <>
                      <Check size={14} className="text-green-500" />
                      <span className="text-xs text-green-600 dark:text-green-400">Ready to download</span>
                    </>
                  ) : (
                    <>
                      <Loader size={14} className="text-blue-500 animate-spin" />
                      <span className="text-xs text-blue-600 dark:text-blue-400">Converting...</span>
                    </>
                  )}
                  <span className="text-xs text-gray-500 dark:text-gray-400">• {item.size}</span>
                </div>
              </div>
            </div>
          </div>

          {item.status === 'converted' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onDownload(index)}
              className="p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
              title={`Download ${item.name}`}
            >
              <Download size={18} />
            </motion.button>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
}
