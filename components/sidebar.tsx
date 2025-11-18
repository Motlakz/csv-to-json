/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { motion } from 'framer-motion';
import { Home, FileText, Share2, FileSpreadsheet } from 'lucide-react';
import Image from 'next/image';
import { PageType } from '@/types';
import { MRRLeaderboardPromoCard } from './common/mrr-leaderboard-promo';
import { Separator } from './ui/separator';
import { VscJson } from 'react-icons/vsc';
import { PiFileCsvDuotone } from 'react-icons/pi';

interface SidebarProps {
  currentPage: 'csv-to-json' | 'json-to-csv' | 'json-to-excel' | 'excel-to-json';
  activePage: PageType;
  onNavigate: (page: PageType) => void;
  onShowHistory: () => void;
  onSetConverter: (converter: 'csv-to-json' | 'json-to-csv' | 'json-to-excel' | 'excel-to-json') => void;
}

export function Sidebar({ currentPage, activePage, onNavigate, onShowHistory, onSetConverter }: SidebarProps) {
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
    <aside className="hidden md:block md:w-64 min-h-screen md:sticky md:top-0 border-r relative bg-white dark:bg-gray-900">
      <div className="p-3 md:p-2">
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
                onSetConverter('csv-to-json');
                onNavigate('converter');
              }}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors ${
                currentPage === 'csv-to-json'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <PiFileCsvDuotone size={16} />
              CSV → JSON
            </motion.button>
            <motion.button
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                onSetConverter('json-to-csv');
                onNavigate('converter');
              }}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors ${
                currentPage === 'json-to-csv'
                  ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <VscJson size={16} />
              JSON → CSV
            </motion.button>
            <motion.button
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                onSetConverter('excel-to-json');
                onNavigate('converter');
              }}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors ${
                currentPage === 'excel-to-json'
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <FileSpreadsheet size={16} />
              Excel → JSON
            </motion.button>
            <motion.button
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                onSetConverter('json-to-excel');
                onNavigate('converter');
              }}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors ${
                currentPage === 'json-to-excel'
                  ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <VscJson size={16} />
              JSON → Excel
            </motion.button>
          </div>
        </div>
      </div>

      {/* Promo + Storage Section */}
      <div className="p-3 border-t absolute bottom-0 border-gray-200 dark:border-gray-800">
        <MRRLeaderboardPromoCard />
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
