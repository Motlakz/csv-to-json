/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Download,
  Copy,
  CheckCircle,
  FileSpreadsheet,
  Eye,
  EyeOff,
  Table,
  Info
} from "lucide-react";
import { ViewMode } from "@/types";

interface ExcelOutputPreviewProps {
  inputData: string; // Original JSON input
  outputData: Uint8Array; // Excel binary data
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  onCopy: () => void;
  onDownload: () => void;
  copied: boolean;
  fileName: string;
}

export function ExcelOutputPreview({
  inputData,
  outputData,
  onCopy,
  onDownload,
  copied,
}: ExcelOutputPreviewProps) {
  const [showPreview, setShowPreview] = useState(true);

  // Parse JSON data for table preview - use useMemo for derived state
  const { parsedData, previewError } = useMemo(() => {
    try {
      const parsed = JSON.parse(inputData);
      if (Array.isArray(parsed)) {
        return {
          parsedData: parsed.slice(0, 20), // Show first 20 rows
          previewError: null
        };
      } else {
        return {
          parsedData: [],
          previewError: 'Data is not in array format for table display'
        };
      }
    } catch (e) {
      console.error('Failed to parse JSON for preview:', e);
      return {
        parsedData: [],
        previewError: 'Invalid JSON format for preview'
      };
    }
  }, [inputData]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getColumns = () => {
    if (parsedData.length === 0) return [];
    return Object.keys(parsedData[0]);
  };

  const formatCellValue = (value: any): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 rounded-xl border shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
            <FileSpreadsheet size={20} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Excel Output</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {formatFileSize(outputData.length)} • {parsedData.length} rows ready
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowPreview(!showPreview)}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            title={showPreview ? "Hide preview" : "Show preview"}
          >
            {showPreview ? <EyeOff size={18} /> : <Eye size={18} />}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCopy}
            className={`p-2 rounded-lg transition-colors ${
              copied
                ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            title="Copy info"
          >
            {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onDownload}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
          >
            <Download size={16} />
            Download Excel
          </motion.button>
        </div>
      </div>

      {/* Preview Content */}
      {showPreview && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden"
        >
          <div className="p-4">
            {/* Preview Controls */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Table size={16} className="text-emerald-600" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Spreadsheet Preview
                </span>
                <span className="text-xs bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded-full">
                  {parsedData.length} of {parsedData.length}+ rows
                </span>
              </div>
            </div>

            {/* Table Preview */}
            {previewError ? (
              <div className="flex items-center gap-2 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <Info size={16} className="text-amber-600 dark:text-amber-400" />
                <span className="text-sm text-amber-800 dark:text-amber-200">{previewError}</span>
              </div>
            ) : parsedData.length > 0 ? (
              <div className="overflow-x-auto border rounded-lg dark:border-gray-700">
                <table className="w-full text-sm">
                  <thead className="bg-emerald-50 dark:bg-emerald-900/20 border-b dark:border-gray-700">
                    <tr>
                      {getColumns().map((column, index) => (
                        <th
                          key={index}
                          className="px-3 py-2 text-left font-medium text-emerald-700 dark:text-emerald-300 border-r dark:border-gray-700 last:border-r-0"
                        >
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.map((row, rowIndex) => (
                      <tr
                        key={rowIndex}
                        className={`border-b dark:border-gray-700 last:border-b-0 ${
                          rowIndex % 2 === 0
                            ? 'bg-white dark:bg-gray-800'
                            : 'bg-gray-50 dark:bg-gray-700'
                        }`}
                      >
                        {getColumns().map((column, colIndex) => (
                          <td
                            key={colIndex}
                            className="px-3 py-2 text-gray-700 dark:text-gray-300 border-r dark:border-gray-700 last:border-r-0 truncate max-w-xs"
                            title={formatCellValue(row[column])}
                          >
                            {formatCellValue(row[column])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <FileSpreadsheet size={48} className="mx-auto mb-4 opacity-50" />
                <p>No data to preview</p>
              </div>
            )}

            {/* Excel Features Info */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center">
                  <FileSpreadsheet size={14} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">.xlsx Format</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">Modern Excel</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <Table size={14} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Auto-sized</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">Column widths</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <Download size={14} className="text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-800 dark:text-purple-200">Compatible</p>
                  <p className="text-xs text-purple-600 dark:text-purple-400">Excel, Sheets, Calc</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}