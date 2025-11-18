import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { ConvertedFile } from '@/types';

interface FileTabsProps<T = string> {
  files: ConvertedFile<T>[];
  activeTab: number;
  onTabChange: (index: number) => void;
  children: ReactNode;
  onDownloadAll?: () => void;
  colorScheme?: 'blue' | 'violet' | 'emerald' | 'orange';
}

const colorSchemes = {
  blue: {
    active: 'bg-blue-600 text-white',
    inactive: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
  },
  violet: {
    active: 'bg-violet-600 text-white',
    inactive: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
  },
  emerald: {
    active: 'bg-emerald-600 text-white',
    inactive: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
  },
  orange: {
    active: 'bg-orange-600 text-white',
    inactive: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
  }
};

export function FileTabs<T = string>({
  files,
  activeTab,
  onTabChange,
  children,
  onDownloadAll,
  colorScheme = 'blue'
}: FileTabsProps<T>) {
  if (files.length === 0) return null;

  const colors = colorSchemes[colorScheme];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b dark:border-gray-700">
        {files.map((file, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onTabChange(index)}
            className={`
              px-4 py-2 rounded-t-lg font-medium text-sm whitespace-nowrap transition-colors
              ${activeTab === index ? colors.active : colors.inactive}
            `}
          >
            {file.name.length > 20 ? file.name.substring(0, 17) + '...' : file.name}
            {file.status === 'converting' && (
              <span className="ml-2 inline-block w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
            )}
          </motion.button>
        ))}
      </div>

      {/* Active Preview Content */}
      {children}

      {/* Download All Button */}
      {files.length > 1 && onDownloadAll && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onDownloadAll}
          className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
        >
          Download All ({files.length} files)
        </motion.button>
      )}
    </motion.div>
  );
}
