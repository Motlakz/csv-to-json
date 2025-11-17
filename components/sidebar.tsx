/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { motion } from 'framer-motion';
import { Home, FileText, Share2, Code, Database } from 'lucide-react';
import Image from 'next/image';
import { MRRLeaderboardPromoCard } from './common/mrr-leaderboard-promo';
import { PageType } from '@/types';
import { Separator } from './ui/separator';

interface SidebarProps {
  currentPage: 'csv-to-json' | 'json-to-csv';
  activePage: PageType;
  onNavigate: (page: PageType) => void;
  onShowHistory: () => void;
}

export function Sidebar({ currentPage, activePage, onNavigate, onShowHistory }: SidebarProps) {
  const menuItems = [
    {
      icon: Home,
      label: 'Converter',
      page: 'converter' as PageType,
      active: activePage === 'converter'
    },
    {
      icon: FileText,
      label: 'All Files',
      page: 'all-files' as PageType,
      active: activePage === 'all-files'
    },
    {
      icon: Share2,
      label: 'Shared Files',
      page: 'shared-files' as PageType,
      active: activePage === 'shared-files'
    },
  ];

  return (
    <aside className="w-64 h-screen sticky top-0 border-r bg-white dark:bg-gray-900">
      <div className="p-2">
        <div className="flex pb-2 items-center gap-3 mb-4 border-b">
          <div className="p-1 rounded-xl flex items-center justify-center">
            <Image src="/logo.png" alt="Swift Convert" width={48} height={48}/>
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            Swift Convert
          </span>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => (
            <motion.button
              key={item.page}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (item.page === 'converter') {
                  onShowHistory();
                } else {
                  onNavigate(item.page);
                }
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                item.active
                  ? 'bg-blue-600/10 text-blue-600 dark:bg-blue-600/20 dark:text-blue-400 font-medium'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <item.icon size={20} />
              {item.label}
              {item.page === 'all-files' && (
                <FileCountBadge page="all" />
              )}
              {item.page === 'shared-files' && (
                <FileCountBadge page="shared" />
              )}
            </motion.button>
          ))}
        </nav>

        <Separator className="my-4" />

        {/* Quick Actions */}
        <div className="space-y-2 overflow-y-auto overflow-hidden max-h-[200px]">
          <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Quick Convert
          </h3>
          <div className="space-y-1">
            <motion.button
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                onShowHistory();
              }}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors ${
                currentPage === 'csv-to-json'
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Database size={16} />
              CSV → JSON
            </motion.button>
            <motion.button
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                onShowHistory();
              }}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors ${
                currentPage === 'json-to-csv'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Code size={16} />
              JSON → CSV
            </motion.button>
          </div>
        </div>
      </div>

      {/* Promo + Storage Section */}
      <div className="p-2 mt-8 border-t border-gray-200 dark:border-gray-800">
        <div className="flex flex-col gap-2">
          <MRRLeaderboardPromoCard />
          <StorageIndicator />
        </div>
      </div>
    </aside>
  );
}

// Helper component for file count badge
function FileCountBadge({ page }: { page: 'all' | 'shared' }) {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    // Get count from localStorage or store
    const stored = localStorage.getItem('converter-storage');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        const history = data.state?.history || [];
        const filteredCount = page === 'shared'
          ? history.filter((item: any) => item.isShared).length
          : history.length;
        setCount(filteredCount);
      } catch (error) {
        console.error('Error reading storage:', error);
      }
    }
  }, []);

  if (count === 0) return null;

  return (
    <span className="ml-auto px-2 py-0.5 text-xs rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
      {count}
    </span>
  );
}

// Storage indicator component
function StorageIndicator() {
  const [storageUsed, setStorageUsed] = React.useState('0 KB');

  React.useEffect(() => {
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
