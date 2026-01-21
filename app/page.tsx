"use client"

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, FileSpreadsheet } from 'lucide-react';
import { VscJson } from 'react-icons/vsc';
import { PiFileCsvDuotone, PiMicrosoftExcelLogoBold } from 'react-icons/pi';
import { LoveTestPromoCard } from '@/components/common/love-test-promo-card';
import { MRRLeaderboardPromoCard } from '@/components/common/mrr-leaderboard-promo';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SharedFileHandler } from '@/components/shared-file-handler';

function HomePage() {
  const searchParams = useSearchParams();

  // Check if there's a shared file in the URL
  const newShareType = searchParams.get('s');
  const oldShareType = searchParams.get('shared');
  const hasSharedFile = newShareType !== null || oldShareType === 'true' || oldShareType === 'embedded';

  // If there's a shared file, show the handler instead of the normal interface
  if (hasSharedFile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <SharedFileHandler />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image src="/logo.png" alt="Swift Convert" width={48} height={48} />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">Swift Convert</span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/all-files" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                All Files
              </Link>
              <Link href="/shared-files" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                Shared Files
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Content */}
      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Free Online File Converters
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Convert between CSV, JSON, Excel and more. Fast, secure, and completely free. No signup required.
            </p>
          </motion.div>

          {/* Converter Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <ConverterCard
              href="/csv-to-json"
              icon={<PiFileCsvDuotone size={32} />}
              title="CSV to JSON"
              description="Convert CSV files to JSON format with automatic delimiter detection"
              colorClass="blue"
            />
            <ConverterCard
              href="/json-to-csv"
              icon={<VscJson size={32} />}
              title="JSON to CSV"
              description="Convert JSON files to CSV with automatic data flattening"
              colorClass="orange"
            />
            <ConverterCard
              href="/excel-to-json"
              icon={<PiMicrosoftExcelLogoBold size={32} />}
              title="Excel to JSON"
              description="Convert Excel spreadsheets to JSON with header detection"
              colorClass="emerald"
            />
            <ConverterCard
              href="/json-to-excel"
              icon={<VscJson size={32} />}
              title="JSON to Excel"
              description="Convert JSON files to Excel with auto-sized columns"
              colorClass="violet"
            />
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                <FileSpreadsheet className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Multiple Formats
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Support for CSV, JSON, Excel and more formats. Convert between any combination instantly.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                <svg className="text-green-600 dark:text-green-400" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Privacy-First
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                All conversions happen in your browser. Your files never leave your device.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
                <svg className="text-purple-600 dark:text-purple-400" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12,6 12,12 16,14" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Lightning Fast
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Instant conversions powered by modern browser APIs. No waiting for servers.
              </p>
            </motion.div>
          </div>

          {/* Promo Section */}
          <div className="grid md:grid-cols-2 gap-6">
            <LoveTestPromoCard />
            <MRRLeaderboardPromoCard />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white dark:bg-gray-950 text-gray-600 dark:text-gray-400">
        <div className="max-w-7xl px-4 sm:px-6 py-6 mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-sm text-center sm:text-left">© {new Date().getFullYear()} Swift Convert.</div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs px-2 py-1 rounded-md border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">Fast</span>
            <span className="text-xs px-2 py-1 rounded-md border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">Secure</span>
            <span className="text-xs px-2 py-1 rounded-md border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">Privacy-first</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

interface ConverterCardProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  colorClass: 'blue' | 'orange' | 'emerald' | 'violet';
}

const colorClassMap = {
  blue: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-600 dark:text-blue-400',
    hover: 'hover:border-blue-400',
    button: 'bg-blue-600 hover:bg-blue-700',
  },
  orange: {
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    text: 'text-orange-600 dark:text-orange-400',
    hover: 'hover:border-orange-400',
    button: 'bg-orange-600 hover:bg-orange-700',
  },
  emerald: {
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    text: 'text-emerald-600 dark:text-emerald-400',
    hover: 'hover:border-emerald-400',
    button: 'bg-emerald-600 hover:bg-emerald-700',
  },
  violet: {
    bg: 'bg-violet-100 dark:bg-violet-900/30',
    text: 'text-violet-600 dark:text-violet-400',
    hover: 'hover:border-violet-400',
    button: 'bg-violet-600 hover:bg-violet-700',
  },
};

function ConverterCard({ href, icon, title, description, colorClass }: ConverterCardProps) {
  const colors = colorClassMap[colorClass];

  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 transition-all ${colors.hover} h-full flex flex-col`}
      >
        <div className={`w-14 h-14 ${colors.bg} rounded-lg flex items-center justify-center mb-4`}>
          <span className={colors.text}>{icon}</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4 flex-1">
          {description}
        </p>
        <div className={`flex items-center gap-2 ${colors.text} font-medium`}>
          Convert Now
          <ArrowRight size={16} />
        </div>
      </motion.div>
    </Link>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <HomePage />
    </Suspense>
  );
}
