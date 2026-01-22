"use client"

import { ReactNode, useState, Suspense } from 'react';
import { Header } from '@/components/header';
import { HistorySidebar } from '@/components/history-sidebar';
import { QuickHistoryWidget } from '@/components/quick-history-widget';
import { CollapsibleSidebar } from '@/components/converters/collapsible-sidebar';
import { ConverterPromoSection } from '@/components/converters/converter-promo-section';
import { RelatedConverters } from '@/components/converters/related-converters';
import { useHistoryStore, useHydratedHistoryStore } from '@/lib/history-store';
import { AnimatePresence } from 'framer-motion';
import { ConverterConfig, getRelatedConverters, getActiveConverters } from '@/lib/converters';
import { SharedFileHandler } from '@/components/shared-file-handler';
import { useSearchParams } from 'next/navigation';

interface ConverterLayoutProps {
  config: ConverterConfig;
  children: ReactNode;
}

function ConverterLayoutContent({ config, children }: ConverterLayoutProps) {
  const [showHistory, setShowHistory] = useState(false);
  const searchParams = useSearchParams();

  const history = useHydratedHistoryStore();
  const clearHistory = useHistoryStore((state) => state.clearHistory);
  const deleteHistoryItem = useHistoryStore((state) => state.deleteHistoryItem);

  // Check if there's a shared file in the URL
  const newShareType = searchParams.get('s');
  const oldShareType = searchParams.get('shared');
  const hasSharedFile = newShareType !== null || oldShareType === 'true' || oldShareType === 'embedded';

  const relatedConverters = getRelatedConverters(config.id);

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
        <CollapsibleSidebar />

        <div className="flex-1 min-w-0">
          <Header title={config.name} onShowHistory={() => setShowHistory(true)} />

          {/* Mobile navigation when sidebar is hidden */}
          <MobileNav currentConverter={config.id} onShowHistory={() => setShowHistory(true)} />

          <main>
            <div className="max-w-7xl px-3 sm:px-4 py-3 sm:py-4">
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    {children}
                  </div>

                  <div className="space-y-6">
                    <ConverterPromoSection converterType={config.id} />
                    <QuickHistoryWidget onViewAll={() => window.location.href = '/all-files'} />
                  </div>
                </div>

                <RelatedConverters converters={relatedConverters} currentConverter={config.id} />
              </div>
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

export function ConverterLayout(props: ConverterLayoutProps) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <ConverterLayoutContent {...props} />
    </Suspense>
  );
}

// Mobile navigation component
import Link from 'next/link';
import { ConversionType } from '@/types';
import { LoveTestPromoCard } from '@/components/common/love-test-promo-card';
import { MRRLeaderboardPromoCard } from '@/components/common/mrr-leaderboard-promo';
import { AdPlaceholder } from '@/components/common/ad-placeholder';

function MobileNav({ currentConverter, onShowHistory }: { currentConverter: ConversionType; onShowHistory: () => void }) {
  const activeConverters = getActiveConverters();

  const colorSchemes: Record<string, { active: string; inactive: string }> = {
    blue: {
      active: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      inactive: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200',
    },
    orange: {
      active: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
      inactive: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200',
    },
    emerald: {
      active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
      inactive: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200',
    },
    violet: {
      active: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
      inactive: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200',
    },
    rose: {
      active: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
      inactive: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200',
    },
    amber: {
      active: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
      inactive: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200',
    },
    cyan: {
      active: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
      inactive: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200',
    },
    slate: {
      active: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300',
      inactive: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200',
    },
  };

  // Get the appropriate promo based on converter type
  const getMobilePromo = () => {
    switch (currentConverter) {
      case 'csv-to-json':
        return <LoveTestPromoCard />;
      case 'json-to-csv':
        return <MRRLeaderboardPromoCard />;
      default:
        return <AdPlaceholder variant="compact" />;
    }
  };

  return (
    <div className="md:hidden">
      {/* Converter tabs */}
      <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={onShowHistory}
            className="whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors bg-blue-600 text-white"
          >
            History
          </button>
          <Link
            href="/converters"
            className="whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200"
          >
            All
          </Link>
          {activeConverters.map((converter) => {
            const isActive = currentConverter === converter.id;
            const scheme = colorSchemes[converter.colorScheme] || colorSchemes.slate;
            return (
              <Link
                key={converter.id}
                href={`/${converter.slug}`}
                className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  isActive ? scheme.active : scheme.inactive
                }`}
              >
                {converter.shortName}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Mobile native ad */}
      <div className="px-3 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
        {getMobilePromo()}
      </div>
    </div>
  );
}
