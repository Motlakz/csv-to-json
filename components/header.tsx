"use client"

import { MoreVertical } from 'lucide-react';
import { motion } from 'framer-motion';
import { ThemeToggle } from './common/theme-toggle';
import { useEffect, useState } from 'react';

interface HeaderProps {
  title?: string;
  onShowHistory?: () => void;
}

// Storage indicator component
function StorageIndicator() {
  const [storageUsed, setStorageUsed] = useState('0 KB');

  useEffect(() => {
    const updateStorageUsed = () => {
      let total = 0;
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += localStorage[key].length + key.length;
        }
      }
      const used = total / 1024;
      setStorageUsed(used < 1024 ? `${used.toFixed(1)} KB` : `${(used / 1024).toFixed(1)} MB`);
    };

    updateStorageUsed();
    const interval = setInterval(updateStorageUsed, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-2 p-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500 dark:text-gray-400">Storage Used</span>
        <span className="text-gray-700 dark:text-gray-300">{storageUsed}</span>
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400">
        Auto-cleared every 6 hours
      </div>
    </div>
  );
}

export function Header({ title, onShowHistory }: HeaderProps) {
  return (
    <header className="flex items-center justify-between p-2 border-b bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
      {title ? (
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h1>
      ) : (
        <StorageIndicator />
      )}

      <div className="flex items-center gap-1.5 sm:gap-2">
        <ThemeToggle />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onShowHistory}
          className="p-2 rounded-lg transition-colors hover:bg-gray-100 text-gray-600 dark:hover:bg-gray-800 dark:text-gray-400"
          title="Show history"
        >
          <MoreVertical size={20} />
        </motion.button>
      </div>
    </header>
  );
}
