import { motion } from "framer-motion";
import { FileText } from "lucide-react";

interface RecommendedToolsProps {
  onNavigate: (page: 'csv-to-json' | 'json-to-csv') => void;
}

export function RecommendedTools({ onNavigate }: RecommendedToolsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-xl border p-6"
    >
      <h3 className="font-semibold mb-4">
        Recommended tools
      </h3>
      
      <div className="space-y-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('json-to-csv')}
          className="w-full p-4 rounded-lg border text-left transition-colors dark:bg-slate-800 bg-gray-50 dark:border-gray-700 border-gray-200 hover:border-purple-400"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-purple-600/10 flex items-center justify-center">
              <FileText size={16} className="text-purple-500" />
            </div>
            <span className="font-medium text-gray-900 dark:text-gray-400">
              JSON to CSV
            </span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-200">
            Convert any JSON files to CSV format
          </p>
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('csv-to-json')}
          className="w-full p-4 rounded-lg border text-left transition-colors dark:border-gray-700 dark:bg-slate-800 bg-gray-50 border-gray-200 hover:border-blue-400"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600/10 flex items-center justify-center">
              <FileText size={16} className="text-blue-500" />
            </div>
            <span className="font-medium text-gray-900 dark:text-gray-400">
              CSV to JSON
            </span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-200">
            Convert any CSV files to JSON format
          </p>
        </motion.button>
      </div>
    </motion.div>
  );
}
