import { OutputPreview } from "./output-preview";
import { useState } from "react";
import { useHistoryStore } from "@/lib/history-store";
import { jsonToCsv, downloadFile } from "@/lib/utils";
import { FileUpload } from "./file-upload";
import { FileTabs } from "./file-tabs";
import { ConvertedFile, ViewMode } from "@/types";
import { motion } from "framer-motion";
import { VscJson } from "react-icons/vsc";

export function JSONToCSVPage() {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('code');
  const [copied, setCopied] = useState(false);
  const [fileName, setFileName] = useState('');
  const [convertedFiles, setConvertedFiles] = useState<ConvertedFile[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const { addConversion } = useHistoryStore();

  const handleFileLoad = (content: string, name: string) => {
    // Auto-convert files immediately when uploaded
    setFileName(name);
    setError('');

    const result = jsonToCsv(content);

    if (result.error) {
      setError(result.error);
    } else {
      const newFile: ConvertedFile = {
        name: name || 'converted.csv',
        input: content,
        output: result.data,
        status: 'converting',
        size: `${(result.data.length / 1024).toFixed(1)} KB`
      };

      setConvertedFiles(prev => [...prev, newFile]);
      setActiveTab(convertedFiles.length);

      setTimeout(() => {
        setConvertedFiles(prev =>
          prev.map((f, i) => i === prev.length - 1 ? { ...f, status: 'converted' as const } : f)
        );
      }, 1000);

      addConversion({
        type: 'json-to-csv',
        input: content,
        output: result.data,
        fileName: name || 'converted.csv',
        fileSize: `${(result.data.length / 1024).toFixed(1)} KB`,
      });
    }
  };

  const handleConvert = () => {
    // For manual textarea input
    if (!input.trim()) {
      setError('Please enter JSON data');
      return;
    }

    const result = jsonToCsv(input);

    if (result.error) {
      setError(result.error);
    } else {
      setError('');

      const newFile: ConvertedFile = {
        name: fileName || 'manual-conversion.csv',
        input: input,
        output: result.data,
        status: 'converting',
        size: `${(result.data.length / 1024).toFixed(1)} KB`
      };

      setConvertedFiles(prev => [...prev, newFile]);
      setActiveTab(convertedFiles.length);

      setTimeout(() => {
        setConvertedFiles(prev =>
          prev.map((f, i) => i === prev.length - 1 ? { ...f, status: 'converted' as const } : f)
        );
      }, 1000);

      addConversion({
        type: 'json-to-csv',
        input: input,
        output: result.data,
        fileName: fileName || 'manual-conversion.csv',
        fileSize: `${(result.data.length / 1024).toFixed(1)} KB`,
      });
    }
  };

  const handleCopy = () => {
    if (convertedFiles[activeTab]) {
      navigator.clipboard.writeText(convertedFiles[activeTab].output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (convertedFiles[activeTab]) {
      const file = convertedFiles[activeTab];
      const baseName = file.name || 'converted';
      const csvFileName = baseName.replace(/\.[^/.]+$/, '') + '.csv';
      downloadFile(file.output, csvFileName, 'text/csv');
    }
  };

  const handleDownloadAll = () => {
    convertedFiles.forEach((file, index) => {
      setTimeout(() => {
        const baseName = file.name || `converted-${index + 1}`;
        const csvFileName = baseName.replace(/\.[^/.]+$/, '') + '.csv';
        downloadFile(file.output, csvFileName, 'text/csv');
      }, index * 200);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <FileUpload
        onFileLoad={handleFileLoad}
        acceptedFormats=".json,application/json"
        allowMultiple={true}
      />

      {!input && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border p-6 bg-white dark:bg-gray-800"
        >
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <VscJson className="text-orange-600 dark:text-orange-400" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Upload JSON Files
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Convert your JSON files to CSV format
            </p>
            <div className="space-y-2 text-sm text-gray-500 dark:text-gray-500">
              <p>Supports .json format</p>
              <p>Upload multiple files at once</p>
              <p>Handles nested objects</p>
              <p>Automatic data flattening</p>
            </div>
          </div>
        </motion.div>
      )}

      {input && convertedFiles.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border p-6"
        >
          <h3 className="text-lg font-semibold mb-4">
            JSON Input
          </h3>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='[{"name":"John","age":30}]'
            className="w-full h-48 p-4 rounded-lg border font-mono text-sm resize-none focus:outline-none focus:ring-2 transition-all"
          />

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-sm mt-2"
            >
              {error}
            </motion.p>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleConvert}
            className="w-full mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Convert to CSV
          </motion.button>
        </motion.div>
      )}

      <FileTabs
        files={convertedFiles}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onDownloadAll={handleDownloadAll}
        colorScheme="orange"
      >
        {convertedFiles[activeTab] && (
          <OutputPreview
            content={convertedFiles[activeTab].output}
            type="csv"
            viewMode={viewMode}
            setViewMode={setViewMode}
            onCopy={handleCopy}
            onDownload={handleDownload}
            copied={copied}
          />
        )}
      </FileTabs>
    </motion.div>
  );
}
