export type ConversionType = 'csv-to-json' | 'json-to-csv';
export type ViewMode = 'code' | 'table' | 'grid';
export type SharePlatform = 'google-drive' | 'onedrive' | 'dropbox' | 'whatsapp' | 'teams' | 'email' | 'link';
export type PageType = 'converter' | 'all-files' | 'shared-files';

export interface ConversionHistoryItem {
  id: string;
  type: ConversionType;
  input: string;
  output: string;
  timestamp: number;
  fileName?: string;
  fileSize?: string;
  isShared?: boolean;
  sharedWith?: string[];
  shareLink?: string;
  sharePlatform?: SharePlatform;
  tags?: string[];
}

export interface HistoryStore {
  history: ConversionHistoryItem[];
  addConversion: (item: Omit<ConversionHistoryItem, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;
  deleteHistoryItem: (id: string) => void;
  clearOldData: () => void; // For 6-hour auto-clear
  updateShareStatus: (id: string, isShared: boolean, shareData?: { platform: SharePlatform; link?: string; sharedWith?: string[] }) => void;
  getAllFiles: () => ConversionHistoryItem[];
  getSharedFiles: () => ConversionHistoryItem[];
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}
