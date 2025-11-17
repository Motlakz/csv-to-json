"use client"

import { CSVToJSONPage } from "@/components/csv-to-json";
import { Header } from "@/components/header";
import { HistorySidebar } from "@/components/history-sidebar";
import { JSONToCSVPage } from "@/components/json-to-csv";
import { LoveTestPromoCard } from "@/components/love-test-promo-card";
import { QuickHistoryWidget } from "@/components/quick-history-widget";
import { RecommendedTools } from "@/components/recommended-tools";
import { Sidebar } from "@/components/sidebar";
import { FilesView } from "@/components/files-view";
import { useHistoryStore, useHydratedHistoryStore } from "@/lib/history-store";
import { AnimatePresence } from "framer-motion";
import { useState, Suspense } from "react";
import { SharedFileHandler } from "@/components/shared-file-handler";
import { PageType, SharePlatform } from "@/types";
import { useSearchParams } from "next/navigation";
import { QuolliePromo } from "../components/common/quollie-promo";

function HomePage() {
  const [currentPage, setCurrentPage] = useState<'csv-to-json' | 'json-to-csv'>('csv-to-json');
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
        return currentPage === 'csv-to-json' ? 'Convert CSV to JSON' : 'Convert JSON to CSV';
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
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <QuolliePromo />
      <Sidebar
        currentPage={currentPage}
        activePage={activePage}
        onNavigate={handleNavigate}
        onShowHistory={() => {
          setShowHistory(true);
          setActivePage('converter');
        }}
      />

      <div className="flex-1">
        <Header title={getPageTitle()} />

        <main>
          <div className="max-w-7xl p-4">
            <AnimatePresence mode="wait">
              {activePage === 'converter' ? (
                <div key="converter" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <AnimatePresence mode="wait">
                      {currentPage === 'csv-to-json' ? (
                        <CSVToJSONPage key="csv" />
                      ) : (
                        <JSONToCSVPage key="json" />
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="space-y-6">
                    <LoveTestPromoCard />
                    <QuickHistoryWidget onViewAll={() => setActivePage('all-files')} />
                    <RecommendedTools onNavigate={(page) => setCurrentPage(page)} />
                  </div>
                </div>
              ) : activePage === 'all-files' ? (
                <FilesView
                  key="all-files"
                  files={getAllFiles()}
                  showSharedOnly={false}
                  onDeleteFile={deleteHistoryItem}
                  onShareFile={handleShareFile}
                />
              ) : activePage === 'shared-files' ? (
                <FilesView
                  key="shared-files"
                  files={getSharedFiles()}
                  showSharedOnly={true}
                  onDeleteFile={deleteHistoryItem}
                  onShareFile={handleShareFile}
                />
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
