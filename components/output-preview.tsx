/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Download, Grid as GridIcon, Table as TableIcon, Code, Check, Maximize2, Eye } from 'lucide-react';
import Papa from 'papaparse';
import { ViewMode } from '../types';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface OutputPreviewProps {
  content: string;
  type: 'json' | 'csv';
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  onCopy: () => void;
  onDownload: () => void;
  copied: boolean;
}

// Helper component for truncated text with tooltip
const TruncatedText = ({ text, maxLength = 50 }: { text: string; maxLength?: number }) => {
  const shouldTruncate = text && text.length > maxLength;
  const displayText = shouldTruncate ? text.substring(0, maxLength) + '...' : text;

  if (!shouldTruncate) {
    return <span>{displayText}</span>;
  }

  return (
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>
        <span className="cursor-help hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          {displayText}
        </span>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="max-w-xs p-3 bg-gray-900 text-white border-gray-700 shadow-lg"
        sideOffset={4}
      >
        <div className="font-mono text-xs wrap-break-word max-h-32 overflow-y-auto">
          {text}
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

// Helper component for expandable dialog in grid view
const ExpandableCard = ({ item, index }: { item: any; index: number }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.05 }}
        className="p-4 rounded-lg border bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700 hover:shadow-md transition-all cursor-pointer group relative min-h-[100px] break-inside-avoid"
        onClick={() => setIsOpen(true)}
      >
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Eye size={14} className="text-gray-400" />
        </div>

        <div className="space-y-2 pr-8">
          {Object.entries(item).slice(0, 3).map(([key, value]) => (
            <div key={key} className="last:mb-0">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 block truncate">
                {key}:
              </span>
              <div className="text-sm text-gray-900 dark:text-gray-200">
                <TruncatedText text={String(value || '')} maxLength={25} />
              </div>
            </div>
          ))}
          {Object.keys(item).length > 3 && (
            <div className="text-xs text-gray-400 dark:text-gray-500 italic">
              +{Object.keys(item).length - 3} more fields...
            </div>
          )}
        </div>
      </motion.div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Maximize2 size={18} />
              Record {index + 1}
            </DialogTitle>
            <DialogDescription>
              Complete data for this record
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-3">
            {Object.entries(item).map(([key, value]) => (
              <div key={key} className="border-b border-gray-200 dark:border-gray-700 pb-3 last:border-b-0">
                <div className="flex flex-col gap-2">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white capitalize">
                    {key.replace(/_/g, ' ')}
                  </h4>
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700">
                    <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap wrap-break-word font-mono">
                      {String(value || '')}
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export function OutputPreview({
  content,
  type,
  viewMode,
  setViewMode,
  onCopy,
  onDownload,
  copied
}: OutputPreviewProps) {
  const parsedData = React.useMemo(() => {
    try {
      if (type === 'json') {
        return JSON.parse(content);
      } else {
        return Papa.parse(content, { header: true }).data;
      }
    } catch {
      return [];
    }
  }, [content, type]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border p-6 bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-700"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Output Preview
        </h3>
        
        <div className="flex items-center gap-2">
          <div className="flex gap-1 p-1 rounded-lg bg-gray-100 dark:bg-gray-700">
            <button
              onClick={() => setViewMode('code')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'code'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              <Code size={16} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'table'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              <TableIcon size={16} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              <GridIcon size={16} />
            </button>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCopy}
            className="p-2 rounded-lg transition-colors hover:bg-gray-100 text-gray-600 dark:hover:bg-gray-700 dark:text-gray-400"
          >
            {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onDownload}
            className="p-2 rounded-lg transition-colors hover:bg-gray-100 text-gray-600 dark:hover:bg-gray-700 dark:text-gray-400"
          >
            <Download size={18} />
          </motion.button>
        </div>
      </div>
      
      <div className="rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900">
        {viewMode === 'code' && (
          <pre className="p-4 overflow-auto max-h-96 text-sm font-mono text-gray-900 dark:text-gray-100">
            {content}
          </pre>
        )}
        
        {viewMode === 'table' && (
          <div className="overflow-auto max-h-96">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 dark:bg-gray-800 sticky top-0 z-10">
                <tr>
                  {parsedData[0] && Object.keys(parsedData[0]).map((key: string) => (
                    <th
                      key={key}
                      className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-200 border-b-2 border-gray-300 dark:border-gray-600 whitespace-nowrap"
                    >
                      <div className="truncate max-w-[200px]">
                        <Tooltip delayDuration={300}>
                          <TooltipTrigger asChild>
                            <span className="cursor-help">{key}</span>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <div className="font-medium">{key}</div>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {parsedData.map((row: any, i: number) => (
                  <tr
                    key={i}
                    className="border-t border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    {Object.values(row).map((val: any, j: number) => (
                      <td
                        key={j}
                        className="px-4 py-3 text-gray-600 dark:text-gray-300 align-top whitespace-nowrap"
                      >
                        <div className="truncate max-w-[200px]">
                          <TruncatedText
                            text={String(val || '')}
                            maxLength={50}
                          />
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {viewMode === 'grid' && (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-auto">
            {parsedData.map((item: any, i: number) => (
              <ExpandableCard key={i} item={item} index={i} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
