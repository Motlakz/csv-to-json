import { ConversionType } from '@/types';
import { FileSpreadsheet, FileText, LucideIcon } from 'lucide-react';
import { IconType } from 'react-icons';
import { VscJson } from 'react-icons/vsc';
import { PiFileCsvDuotone } from 'react-icons/pi';

export interface FileTypeInfo {
  icon: IconType | LucideIcon;
  color: string;
  bgColor: string;
  badgeColor: string;
  previewBg: string;
}

export const fileTypeConfigs: Record<string, FileTypeInfo> = {
  JSON: {
    icon: VscJson,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    badgeColor: 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300',
    previewBg: 'dark:bg-orange-900/10 bg-orange-50',
  },
  Excel: {
    icon: FileSpreadsheet,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
    badgeColor: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
    previewBg: 'bg-white dark:bg-gray-800',
  },
  CSV: {
    icon: PiFileCsvDuotone,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    badgeColor: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
    previewBg: 'dark:bg-blue-900/10 bg-blue-50',
  },
  default: {
    icon: FileText,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100 dark:bg-gray-900/30',
    badgeColor: 'bg-gray-100 dark:bg-gray-900/40 text-gray-700 dark:text-gray-300',
    previewBg: 'dark:bg-slate-900/20 bg-slate-200',
  },
};

export function getFileTypeInfo(fileType: string): FileTypeInfo {
  return fileTypeConfigs[fileType] || fileTypeConfigs.default;
}

export function getFileTypeFromConversion(conversionType: ConversionType): string {
  switch (conversionType) {
    case 'csv-to-json':
    case 'excel-to-json':
      return 'JSON';
    case 'json-to-csv':
      return 'CSV';
    case 'json-to-excel':
      return 'Excel';
    default:
      return 'File';
  }
}

export function getOutputExtension(conversionType: ConversionType): string {
  switch (conversionType) {
    case 'csv-to-json':
    case 'excel-to-json':
      return '.json';
    case 'json-to-csv':
      return '.csv';
    case 'json-to-excel':
      return '.xlsx';
    default:
      return '';
  }
}

export function getOutputMimeType(conversionType: ConversionType): string {
  switch (conversionType) {
    case 'csv-to-json':
    case 'excel-to-json':
      return 'application/json';
    case 'json-to-csv':
      return 'text/csv';
    case 'json-to-excel':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    default:
      return 'application/octet-stream';
  }
}

export function detectConversionTypeFromContent(content: string, mimeType?: string, fileName?: string): ConversionType {
  // Check MIME type first
  if (mimeType === 'application/json') {
    return 'csv-to-json';
  }
  if (mimeType === 'text/csv') {
    return 'json-to-csv';
  }

  // Check file extension
  if (fileName) {
    const lowerName = fileName.toLowerCase();
    if (lowerName.endsWith('.json')) {
      return 'csv-to-json';
    }
    if (lowerName.endsWith('.csv')) {
      return 'json-to-csv';
    }
    if (lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls')) {
      return 'excel-to-json';
    }
  }

  // Detect by content
  const trimmed = content.trim();
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    return 'csv-to-json';
  }

  return 'json-to-csv';
}

export function calculateFileSize(content: string): string {
  const bytes = new Blob([content]).size;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatTimestamp(timestamp: string | number): string {
  try {
    const ts = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp;
    return new Date(ts).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Unknown date';
  }
}
