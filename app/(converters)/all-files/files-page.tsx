"use client"

import { Suspense } from 'react';
import { FilesPageLayout } from '@/components/converters/files-page-layout';
import { FilesView } from '@/components/files-view';
import { useHistoryStore } from '@/lib/history-store';
import { SharePlatform } from '@/types';

export function AllFilesPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <AllFilesContent />
    </Suspense>
  );
}

function AllFilesContent() {
  const getAllFiles = useHistoryStore((state) => state.getAllFiles);
  const deleteHistoryItem = useHistoryStore((state) => state.deleteHistoryItem);
  const updateShareStatus = useHistoryStore((state) => state.updateShareStatus);

  const handleShareFile = (id: string, shareData: { platform: SharePlatform; link?: string; sharedWith?: string[] }) => {
    updateShareStatus(id, true, shareData);
  };

  return (
    <FilesPageLayout title="All Files">
      <FilesView
        files={getAllFiles()}
        showSharedOnly={false}
        onDeleteFile={deleteHistoryItem}
        onShareFile={handleShareFile}
      />
    </FilesPageLayout>
  );
}
