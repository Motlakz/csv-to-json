"use client"

import { CSVToJSONPage } from "@/components/csv-to-json";
import { Header } from "@/components/header";
import { HistorySidebar } from "@/components/history-sidebar";
import { JSONToCSVPage } from "@/components/json-to-csv";
import { JSONToExcelPage } from "@/components/json-to-excel";
import { ExcelToJSONPage } from "@/components/excel-to-json";
import { QuickHistoryWidget } from "@/components/quick-history-widget";
import { RecommendedTools } from "@/components/recommended-tools";
import { Sidebar } from "@/components/sidebar";
import { FilesView } from "@/components/files-view";
import { LoveTestPromoCard } from "@/components/common/love-test-promo-card";
import { useHistoryStore, useHydratedHistoryStore } from "@/lib/history-store";
import { AnimatePresence } from "framer-motion";
import { useState, Suspense } from "react";
import { SharedFileHandler } from "@/components/shared-file-handler";
import { PageType, SharePlatform } from "@/types";
import { useSearchParams } from "next/navigation";

function HomePage() {
  const [currentPage, setCurrentPage] = useState<'csv-to-json' | 'json-to-csv' | 'json-to-excel' | 'excel-to-json'>('csv-to-json');
  const [activePage, setActivePage] = useState<PageType>('converter');
  const [showHistory, setShowHistory] = useState(false);
  const searchParams = useSearchParams();

  const history = useHydratedHistoryStore();
  const clearHistory = useHistoryStore((state) => state.clearHistory);
  const deleteHistoryItem = useHistoryStore((state) => state.deleteHistoryItem);
  const updateShareStatus = useHistoryStore((state) => state.updateShareStatus);
  const getAllFiles = useHistoryStore((state) => state.getAllFiles);
  const getSharedFiles = useHistoryStore((state) => state.getSharedFiles);

  // Check if there's a shared file in the URL
  // New format: ?s=q/h/db (query/hash/database)
  // Old format: ?shared=true
  const newShareType = searchParams.get('s');
  const oldShareType = searchParams.get('shared');
  const hasSharedFile = newShareType !== null || oldShareType === 'true' || oldShareType === 'embedded';

  const handleNavigate = (page: PageType) => {
    setActivePage(page);
    if (page !== 'converter') {
      setShowHistory(false);
    }
  };

  const handleShareFile = (id: string, shareData: { platform: SharePlatform; link?: string; sharedWith?: string[] }) => {
    updateShareStatus(id, true, shareData);
  };

  const getPageTitle = () => {
    switch (activePage) {
      case 'converter':
        switch (currentPage) {
          case 'csv-to-json':
            return 'Convert CSV to JSON';
          case 'json-to-csv':
            return 'Convert JSON to CSV';
          case 'json-to-excel':
            return 'Convert JSON to Excel';
          default:
            return 'Swift Convert';
        }
      case 'all-files':
        return 'All Files';
      case 'shared-files':
        return 'Shared Files';
      default:
        return 'Swift Convert';
    }
  };

  // If there's a shared file, show the handler instead of the normal interface
  if (hasSharedFile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <SharedFileHandler />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <div className="flex flex-1">
        <Sidebar
          currentPage={currentPage}
          activePage={activePage}
          onNavigate={handleNavigate}
          onShowHistory={() => {
            setShowHistory(true);
            setActivePage('converter');
          }}
          onSetConverter={(converter) => {
            setCurrentPage(converter);
            setActivePage('converter');
            setShowHistory(false);
          }}
        />

        <div className="flex-1">
        <Header title={getPageTitle()} onShowHistory={() => setShowHistory(true)} />

        {/* Mobile navigation when sidebar is hidden */}
        <div className="md:hidden px-3 py-2 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => {
                setShowHistory(true);
                setActivePage('converter');
              }}
              className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                activePage === 'converter'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'
              }`}
            >
              Converter
            </button>
            <button
              onClick={() => handleNavigate('all-files')}
              className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                activePage === 'all-files'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'
              }`}
            >
              All Files
            </button>
            <button
              onClick={() => handleNavigate('shared-files')}
              className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                activePage === 'shared-files'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'
              }`}
            >
              Shared
            </button>
          </div>
        </div>

        <main>
          <div className="max-w-7xl px-3 sm:px-4 py-3 sm:py-4">
            <AnimatePresence mode="wait">
              {activePage === 'converter' ? (
                <div key="converter" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <AnimatePresence mode="wait">
                        {currentPage === 'csv-to-json' ? (
                          <CSVToJSONPage key="csv-to-json" />
                        ) : currentPage === 'json-to-csv' ? (
                          <JSONToCSVPage key="json-to-csv" />
                        ) : currentPage === 'json-to-excel' ? (
                          <JSONToExcelPage key="json-to-excel" />
                        ) : (
                          <ExcelToJSONPage key="excel-to-json" />
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="space-y-6">
                      <LoveTestPromoCard />
                      <QuickHistoryWidget onViewAll={() => setActivePage('all-files')} />
                    </div>
                  </div>

                  <RecommendedTools onNavigate={(page) => {
                    setCurrentPage(page);
                    setActivePage('converter');
                    setShowHistory(false);
                  }} />
                </div>
              ) : activePage === 'all-files' ? (
                <div className="space-y-4">
                  <FilesView
                    key="all-files"
                    files={getAllFiles()}
                    showSharedOnly={false}
                    onDeleteFile={deleteHistoryItem}
                    onShareFile={handleShareFile}
                  />
                </div>
              ) : activePage === 'shared-files' ? (
                <div className="space-y-4">
                  <FilesView
                    key="shared-files"
                    files={getSharedFiles()}
                    showSharedOnly={true}
                    onDeleteFile={deleteHistoryItem}
                    onShareFile={handleShareFile}
                  />
                </div>
              ) : null}
            </AnimatePresence>
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
