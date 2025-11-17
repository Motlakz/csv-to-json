import { motion } from 'framer-motion';
import { X, Trash2, FileText } from 'lucide-react';
import { ConversionHistoryItem } from '../types';

interface HistorySidebarProps {
  history: ConversionHistoryItem[];
  onClose: () => void;
  onClear: () => void;
  onDelete: (id: string) => void;
}

export function HistorySidebar({ history, onClose, onClear, onDelete }: HistorySidebarProps) {
  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 30 }}
      className="fixed right-0 top-0 h-full w-96 border-l shadow-2xl z-50 bg-white dark:bg-slate-900 dark:border-gray-800 border-gray-200"
    >
      <div className="p-6 border-b dark:border-gray-600 border-gray-300">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            History
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-600 dark:text-white"
          >
            <X size={20} />
          </button>
        </div>
        
        {history.length > 0 && (
          <button
            onClick={onClear}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Trash2 size={16} />
            Clear All
          </button>
        )}
      </div>
      
      <div className="p-6 overflow-auto h-[calc(100vh-120px)]">
        {history.length === 0 ? (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto mb-4 text-gray-300 dark:text-white" />
            <p className="text-gray-600 dark:text-white">
              No conversion history yet
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 rounded-xl border dark:border-gray-700 bg-gray-50 dark:bg-slate-800 border-gray-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium dark:text-white ${
                      item.type === 'csv-to-json'
                        ? 'bg-blue-600 text-white'
                        : 'bg-purple-600 text-white'
                    }`}>
                      {item.type === 'csv-to-json' ? 'CSV → JSON' : 'JSON → CSV'}
                    </div>
                  </div>
                  <button
                    onClick={() => onDelete(item.id)}
                    className="p-1 rounded transition-colors hover:bg-red-200 dark:hover:bg-red-500 text-gray-600 dark:text-white"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                
                {item.fileName && (
                  <p className="text-sm font-medium mb-2 text-gray-900 dark:text-white truncate">
                    {item.fileName}
                  </p>
                )}
                
                <div className="text-xs font-mono p-2 rounded mb-2 overflow-hidden bg-white dark:bg-slate-950/20 text-gray-600 dark:text-white">
                  <div className="line-clamp-2">{item.output}</div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-white">
                    {new Date(item.timestamp).toLocaleString()}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
