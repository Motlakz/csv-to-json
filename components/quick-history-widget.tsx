"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */
import { motion } from "framer-motion";
import { useHistoryStore } from "@/lib/history-store";
import { FileText, MoreVertical, Eye, Trash2, Clock, Zap, Shield, FileCode, Download } from "lucide-react";
import { useMemo, useState } from "react";

const getFileIcon = (fileName: string) => {
  const ext = fileName?.split('.').pop()?.toLowerCase();
  
  const iconColors = {
    jpg: 'bg-blue-100',
    jpeg: 'bg-blue-100',
    png: 'bg-yellow-100',
    svg: 'bg-green-100',
    doc: 'bg-purple-100',
    docx: 'bg-purple-100',
    pdf: 'bg-pink-100',
    json: 'bg-green-100',
    csv: 'bg-blue-100',
  };
  
  const iconColor = iconColors[ext as keyof typeof iconColors] || 'bg-gray-100';
  
  return (
    <div className={`w-10 h-10 dark:bg-slate-800 rounded-lg ${iconColor} flex items-center justify-center shrink-0`}>
      <FileText size={18} className="text-gray-600 dark:text-slate-300" />
    </div>
  );
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Kb`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mb`;
};

export function QuickHistoryWidget({ onViewAll }: any) {
  const history = useHistoryStore((state) => state.history);
  const deleteHistoryItem = useHistoryStore((state) => state.deleteHistoryItem);
  const recent = useMemo(() => history.slice(0, 6), [history]);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [viewingItem, setViewingItem] = useState<any>(null);

  // Empty state when no history
  if (recent.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-gray-200 dark:border-gray-700 bg-linear-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <Clock size={20} className="text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">History</h3>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Your conversion history will appear here. Start converting to see your files!
          </p>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
              <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                <Zap size={16} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Lightning Fast</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">All conversions happen instantly in your browser</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                <Shield size={16} className="text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">100% Private</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Your data never leaves your device</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                <FileCode size={16} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Auto-saved History</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Quick access to recent conversions</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  const handleView = (item: any) => {
    setViewingItem(item);
    setActiveMenu(null);
  };

  const handleDelete = (id: string) => {
    deleteHistoryItem(id);
    setActiveMenu(null);
  };

  const handleDownload = (item: any) => {
    const blob = new Blob([item.output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = item.fileName || 'converted-file.txt';
    a.click();
    URL.revokeObjectURL(url);
    setActiveMenu(null);
  };
  
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">History</h3>
          <button
            onClick={onViewAll}
            className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            View all
          </button>
        </div>
        
        <div className="space-y-1">
          {recent.map((item: any, index: number) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group relative"
            >
              <div className="flex items-center gap-3 p-3 rounded-lg dark:bg-slate-950/20 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                {getFileIcon(item.fileName)}
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-gray-900 dark:text-white">
                    {item.fileName || 'Untitled'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(item.output?.length || 0)}
                  </p>
                </div>
                
                <div className="relative">
                  <button
                    onClick={() => setActiveMenu(activeMenu === item.id ? null : item.id)}
                    className="p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-400 opacity-0 group-hover:opacity-100"
                  >
                    <MoreVertical size={18} />
                  </button>
                  
                  {activeMenu === item.id && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setActiveMenu(null)}
                      />
                      <div className="absolute right-0 top-10 w-44 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20">
                        <button
                          onClick={() => handleView(item)}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                        >
                          <Eye size={16} />
                          View
                        </button>
                        <button
                          onClick={() => handleDownload(item)}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                        >
                          <Download size={16} />
                          Download
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* View Modal */}
      {viewingItem && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setViewingItem(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {viewingItem.fileName || 'Untitled'}
                </h3>
                <button
                  onClick={() => setViewingItem(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {viewingItem.type === 'csv-to-json' ? 'CSV → JSON' : 'JSON → CSV'}
              </p>
            </div>
            <div className="p-6 overflow-auto max-h-[60vh]">
              <pre className="text-xs font-mono bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto text-gray-800 dark:text-gray-200">
                {viewingItem.output}
              </pre>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}
