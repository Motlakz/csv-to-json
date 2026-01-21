"use client"

import { motion } from 'framer-motion';
import { Megaphone } from 'lucide-react';
import Link from 'next/link';

interface AdPlaceholderProps {
  variant?: 'default' | 'compact';
}

export function AdPlaceholder({ variant = 'default' }: AdPlaceholderProps) {
  const isCompact = variant === 'compact';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 ${
        isCompact ? 'p-4' : 'p-6'
      }`}
    >
      <div className="flex flex-col items-center justify-center text-center">
        <div className={`${isCompact ? 'w-10 h-10 mb-2' : 'w-12 h-12 mb-3'} rounded-full bg-linear-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center`}>
          <Megaphone className={`${isCompact ? 'w-5 h-5' : 'w-6 h-6'} text-blue-600 dark:text-blue-400`} />
        </div>

        <h3 className={`font-semibold text-gray-700 dark:text-gray-300 ${isCompact ? 'text-sm mb-1' : 'text-base mb-2'}`}>
          Ad Space Available
        </h3>

        <p className={`text-gray-500 dark:text-gray-400 ${isCompact ? 'text-xs mb-3' : 'text-sm mb-4'}`}>
          Promote your product or service here
        </p>

        <Link
          href="mailto:contact@swiftconvert.com?subject=Ad%20Space%20Inquiry"
          className={`inline-flex items-center justify-center gap-2 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all ${
            isCompact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'
          }`}
        >
          <Megaphone className={isCompact ? 'w-3 h-3' : 'w-4 h-4'} />
          Claim This Space
        </Link>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-linear-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-2xl" />
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-linear-to-tr from-purple-500/5 to-pink-500/5 rounded-full blur-2xl" />
    </motion.div>
  );
}
