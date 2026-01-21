"use client"

import { Suspense } from 'react';
import { FilesPageLayout } from '@/components/converters/files-page-layout';
import { FilesView } from '@/components/files-view';
import { useHistoryStore } from '@/lib/history-store';
import { SharePlatform } from '@/types';

export function SharedFilesPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <SharedFilesContent />
    </Suspense>
  );
}

function SharedFilesContent() {
  const getSharedFiles = useHistoryStore((state) => state.getSharedFiles);
  const deleteHistoryItem = useHistoryStore((state) => state.deleteHistoryItem);
  const updateShareStatus = useHistoryStore((state) => state.updateShareStatus);

  const handleShareFile = (id: string, shareData: { platform: SharePlatform; link?: string; sharedWith?: string[] }) => {
    updateShareStatus(id, true, shareData);
  };

  return (
    <FilesPageLayout title="Shared Files">
      <FilesView
        files={getSharedFiles()}
        showSharedOnly={true}
        onDeleteFile={deleteHistoryItem}
        onShareFile={handleShareFile}
      />
    </FilesPageLayout>
  );
}
