import { ConvertedFile, ViewMode } from "@/types";
import { OutputPreview } from "./output-preview";
import { useState } from "react";
import { useHistoryStore } from "@/lib/history-store";
import { csvToJson, downloadFile } from "@/lib/utils";
import { FileUpload } from "./file-upload";
import { FileTabs } from "./file-tabs";
import { motion } from "framer-motion";
import { PiFileCsvDuotone } from "react-icons/pi";

export function CSVToJSONPage() {
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

    const result = csvToJson(content);

    if (result.error) {
      setError(result.error);
    } else {
      const jsonOutput = JSON.stringify(result.data, null, 2);

      const newFile: ConvertedFile = {
        name: name || 'converted.json',
        input: content,
        output: jsonOutput,
        status: 'converting',
        size: `${(jsonOutput.length / 1024).toFixed(1)} KB`
      };

      setConvertedFiles(prev => [...prev, newFile]);
      setActiveTab(convertedFiles.length); // Switch to new tab

      setTimeout(() => {
        setConvertedFiles(prev =>
          prev.map((f, i) => i === prev.length - 1 ? { ...f, status: 'converted' as const } : f)
        );
      }, 1000);

      addConversion({
        type: 'csv-to-json',
        input: content,
        output: jsonOutput,
        fileName: name || 'converted.json',
        fileSize: `${(jsonOutput.length / 1024).toFixed(1)} KB`,
      });
    }
  };

  const handleConvert = () => {
    // For manual textarea input
    if (!input.trim()) {
      setError('Please enter CSV data');
      return;
    }

    const result = csvToJson(input);

    if (result.error) {
      setError(result.error);
    } else {
      const jsonOutput = JSON.stringify(result.data, null, 2);
      setError('');

      const newFile: ConvertedFile = {
        name: fileName || 'manual-conversion.json',
        input: input,
        output: jsonOutput,
        status: 'converting',
        size: `${(jsonOutput.length / 1024).toFixed(1)} KB`
      };

      setConvertedFiles(prev => [...prev, newFile]);
      setActiveTab(convertedFiles.length);

      setTimeout(() => {
        setConvertedFiles(prev =>
          prev.map((f, i) => i === prev.length - 1 ? { ...f, status: 'converted' as const } : f)
        );
      }, 1000);

      addConversion({
        type: 'csv-to-json',
        input: input,
        output: jsonOutput,
        fileName: fileName || 'manual-conversion.json',
        fileSize: `${(jsonOutput.length / 1024).toFixed(1)} KB`,
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
      const jsonFileName = baseName.replace(/\.[^/.]+$/, '') + '.json';
      downloadFile(file.output, jsonFileName, 'application/json');
    }
  };

  const handleDownloadAll = () => {
    // Download all files as separate downloads
    convertedFiles.forEach((file, index) => {
      setTimeout(() => {
        const baseName = file.name || `converted-${index + 1}`;
        const jsonFileName = baseName.replace(/\.[^/.]+$/, '') + '.json';
        downloadFile(file.output, jsonFileName, 'application/json');
      }, index * 200); // Stagger downloads
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
        acceptedFormats=".csv,text/csv"
        allowMultiple={true}
      />

      {!input && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border p-6 bg-white dark:bg-gray-800"
        >
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <PiFileCsvDuotone className="text-blue-600 dark:text-blue-400" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Upload CSV Files
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Convert your CSV files to JSON format
            </p>
            <div className="space-y-2 text-sm text-gray-500 dark:text-gray-500">
              <p>Supports .csv format</p>
              <p>Upload multiple files at once</p>
              <p>Automatic delimiter detection</p>
              <p>Preserves data structure</p>
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
            CSV Input
          </h3>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="name,age,city&#10;John,30,New York"
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
            Convert to JSON
          </motion.button>
        </motion.div>
      )}

      <FileTabs
        files={convertedFiles}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onDownloadAll={handleDownloadAll}
        colorScheme="blue"
      >
        {convertedFiles[activeTab] && (
          <OutputPreview
            content={convertedFiles[activeTab].output}
            type="json"
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
