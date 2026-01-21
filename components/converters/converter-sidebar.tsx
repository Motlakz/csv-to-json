"use client"

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, FileText, Share2, FileSpreadsheet } from 'lucide-react';
import Image from 'next/image';
import { ConversionType } from '@/types';
import { MRRLeaderboardPromoCard } from '@/components/common/mrr-leaderboard-promo';
import { Separator } from '@/components/ui/separator';
import { VscJson } from 'react-icons/vsc';
import { PiFileCsvDuotone } from 'react-icons/pi';

interface ConverterSidebarProps {
  currentConverter: ConversionType;
  onShowHistory: () => void;
}

export function ConverterSidebar({ currentConverter, onShowHistory }: ConverterSidebarProps) {
  return (
    <aside className="hidden md:block md:w-64 min-h-screen md:sticky md:top-0 border-r relative bg-white dark:bg-gray-900">
      <div className="p-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 pb-4 mb-4 border-b border-gray-200 dark:border-gray-800">
          <div className="p-1 rounded-xl flex items-center justify-center">
            <Image src="/logo.png" alt="Swift Convert" width={48} height={48} />
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            Swift Convert
          </span>
        </Link>

        {/* Main Navigation */}
        <nav className="space-y-1 mb-6">
          <motion.button
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={onShowHistory}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors bg-blue-600/10 text-blue-600 dark:bg-blue-600/20 dark:text-blue-400 font-medium"
          >
            <Home size={20} />
            Converter
          </motion.button>

          <Link href="/all-files">
            <motion.div
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
            >
              <FileText size={20} />
              All Files
              <FileCountBadge page="all" />
            </motion.div>
          </Link>

          <Link href="/shared-files">
            <motion.div
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
            >
              <Share2 size={20} />
              Shared Files
              <FileCountBadge page="shared" />
            </motion.div>
          </Link>
        </nav>

        <Separator className="my-4" />

        {/* Quick Actions */}
        <div className="space-y-3">
          <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-1">
            Quick Convert
          </h3>
          <div className="space-y-1">
            <Link href="/csv-to-json">
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                  currentConverter === 'csv-to-json'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <PiFileCsvDuotone size={18} />
                CSV → JSON
              </motion.div>
            </Link>
            <Link href="/json-to-csv">
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                  currentConverter === 'json-to-csv'
                    ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <VscJson size={18} />
                JSON → CSV
              </motion.div>
            </Link>
            <Link href="/excel-to-json">
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                  currentConverter === 'excel-to-json'
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <FileSpreadsheet size={18} />
                Excel → JSON
              </motion.div>
            </Link>
            <Link href="/json-to-excel">
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                  currentConverter === 'json-to-excel'
                    ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <VscJson size={18} />
                JSON → Excel
              </motion.div>
            </Link>
          </div>
        </div>
      </div>

      {/* Promo Section - Fixed at bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-800">
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
          ? history.filter((item: { isShared: boolean }) => item.isShared).length
          : history.length;
        setCount(filteredCount);
      } catch (error) {
        console.error('Error reading storage:', error);
      }
    }
  }, [page]);

  if (count === 0) return null;

  return (
    <span className="ml-auto px-2 py-0.5 text-xs rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
      {count}
    </span>
  );
}
