"use client"

import { MoreVertical } from 'lucide-react';
import { motion } from 'framer-motion';
import { ThemeToggle } from './common/theme-toggle';

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-4.5 border-b border-gray-200 dark:border-gray-800">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
        {title}
      </h1>
      
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 rounded-lg transition-colors hover:bg-gray-100 text-gray-600 dark:hover:bg-gray-800 dark:text-gray-400"
        >
          <MoreVertical size={20} />
        </motion.button>
      </div>
    </header>
  );
}
