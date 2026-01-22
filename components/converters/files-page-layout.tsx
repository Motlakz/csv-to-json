"use client"

import { ReactNode, useState, Suspense } from 'react';
import Link from 'next/link';
import { Header } from '@/components/header';
import { HistorySidebar } from '@/components/history-sidebar';
import { useHistoryStore, useHydratedHistoryStore } from '@/lib/history-store';
import { AnimatePresence } from 'framer-motion';
import { usePathname, useSearchParams } from 'next/navigation';
import { SharedFileHandler } from '@/components/shared-file-handler';
import { CollapsibleSidebar } from '@/components/converters/collapsible-sidebar';
import { LoveTestPromoCard } from '@/components/common/love-test-promo-card';
import { MRRLeaderboardPromoCard } from '@/components/common/mrr-leaderboard-promo';

interface FilesPageLayoutProps {
  title: string;
  children: ReactNode;
}

function FilesPageLayoutContent({ title, children }: FilesPageLayoutProps) {
  const [showHistory, setShowHistory] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const history = useHydratedHistoryStore();
  const clearHistory = useHistoryStore((state) => state.clearHistory);
  const deleteHistoryItem = useHistoryStore((state) => state.deleteHistoryItem);

  // Check if there's a shared file in the URL
  const newShareType = searchParams.get('s');
  const oldShareType = searchParams.get('shared');
  const hasSharedFile = newShareType !== null || oldShareType === 'true' || oldShareType === 'embedded';

  const isAllFiles = pathname === '/all-files';
  const isSharedFiles = pathname === '/shared-files';

  // If there's a shared file, show the handler instead of the normal interface
  if (hasSharedFile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <SharedFileHandler />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col overflow-x-hidden">
      <div className="flex flex-1">
        {/* Collapsible Sidebar */}
        <CollapsibleSidebar />

        <div className="flex-1 min-w-0">
          <Header title={title} onShowHistory={() => setShowHistory(true)} />

          {/* Mobile navigation when sidebar is hidden */}
          <div className="md:hidden">
            <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                <Link
                  href="/converters"
                  className="whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200"
                >
                  Converters
                </Link>
                <Link
                  href="/all-files"
                  className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    isAllFiles
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'
                  }`}
                >
                  All Files
                </Link>
                <Link
                  href="/shared-files"
                  className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    isSharedFiles
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'
                  }`}
                >
                  Shared
                </Link>
              </div>
            </div>

            {/* Mobile native ad */}
            <div className="px-3 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
              {isAllFiles ? <LoveTestPromoCard /> : <MRRLeaderboardPromoCard />}
            </div>
          </div>

          <main>
            <div className="max-w-7xl px-3 sm:px-4 py-3 sm:py-4">
              {children}
            </div>
          </main>
        </div>

        <AnimatePresence>
          {showHistory && (
            <HistorySidebar
              history={history}
              onClose={() => setShowHistory(false)}
              onClear={clearHistory}
              onDelete={deleteHistoryItem}
            />
          )}
        </AnimatePresence>
      </div>

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

export function FilesPageLayout(props: FilesPageLayoutProps) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <FilesPageLayoutContent {...props} />
    </Suspense>
  );
}

