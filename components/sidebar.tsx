/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { motion } from 'framer-motion';
import { Home, FileText, Share2, HelpCircle, Code, Database } from 'lucide-react';

type PageType = 'converter' | 'all-files' | 'shared-files' | 'support';

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
    {
      icon: HelpCircle,
      label: 'Support',
      page: 'support' as PageType,
      active: activePage === 'support'
    },
      ];

  return (
    <aside className="w-64 h-screen sticky top-0 border-r flex flex-col bg-white dark:bg-gray-900">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
              <path d="M7 7H17M7 12H17M7 17H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            Fast Convert
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
                } else if (item.page === 'support') {
                  // Open support center in new tab/window
                  window.open('/support', '_blank');
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

        {/* Quick Actions */}
        <div className="mt-8 space-y-2">
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

      {/* Storage Indicator */}
      <div className="mt-auto p-6 border-t border-gray-200 dark:border-gray-800">
        <StorageIndicator />
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
    <div className="space-y-2">
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
