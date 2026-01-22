"use client"

import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, FileSpreadsheet, Menu, X } from 'lucide-react';
import { VscJson } from 'react-icons/vsc';
import { PiFileCsvDuotone, PiMicrosoftExcelLogoBold } from 'react-icons/pi';
import { LoveTestPromoCard } from '@/components/common/love-test-promo-card';
import { MRRLeaderboardPromoCard } from '@/components/common/mrr-leaderboard-promo';
import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { SharedFileHandler } from '@/components/shared-file-handler';
import { ThemeToggle } from '@/components/common/theme-toggle';

function HomePage() {
  const searchParams = useSearchParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
      {/* Hero Section */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 sm:gap-3 min-w-0">
              <Image src="/logo.png" alt="Swift Convert" width={40} height={40} className="w-8 h-8 sm:w-12 sm:h-12 flex-shrink-0" />
              <span className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white truncate">Swift Convert</span>
            </Link>

            {/* Desktop navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/converters" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                Converters
              </Link>
              <Link href="/all-files" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                All Files
              </Link>
              <Link href="/shared-files" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                Shared Files
              </Link>
              <ThemeToggle />
            </nav>

            {/* Mobile menu button */}
            <div className="flex items-center gap-2 md:hidden">
              <ThemeToggle />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile navigation dropdown */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.nav
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="md:hidden overflow-hidden"
              >
                <div className="pt-4 pb-2 space-y-1">
                  <Link
                    href="/converters"
                    className="block px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Converters
                  </Link>
                  <Link
                    href="/all-files"
                    className="block px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    All Files
                  </Link>
                  <Link
                    href="/shared-files"
                    className="block px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Shared Files
                  </Link>
                </div>
              </motion.nav>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Hero Content */}
      <section className="py-8 sm:py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8 sm:mb-12"
          >
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 px-2">
              Free Online File Converters
            </h1>
            <p className="text-base sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-2">
              Convert between CSV, JSON, Excel and more. Fast, secure, and completely free. No signup required.
            </p>
          </motion.div>

          {/* Converter Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
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
        className={`bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 transition-all ${colors.hover} h-full flex flex-col`}
      >
        <div className={`w-12 h-12 sm:w-14 sm:h-14 ${colors.bg} rounded-lg flex items-center justify-center mb-3 sm:mb-4`}>
          <span className={`${colors.text} [&>svg]:w-6 [&>svg]:h-6 sm:[&>svg]:w-8 sm:[&>svg]:h-8`}>{icon}</span>
        </div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1 sm:mb-2">
          {title}
        </h3>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-3 sm:mb-4 flex-1">
          {description}
        </p>
        <div className={`flex items-center gap-2 ${colors.text} font-medium text-sm sm:text-base`}>
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
