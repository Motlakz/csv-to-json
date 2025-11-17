/* eslint-disable @typescript-eslint/no-explicit-any */
import { OutputPreview } from "./output-preview";
import { useState } from "react";
import { useHistoryStore } from "@/lib/history-store";
import { jsonToCsv, downloadFile } from "@/lib/utils";
import { FileUpload } from "./file-upload";
import { ConversionList } from "./conversion-list";
import { ViewMode } from "@/types";
import { motion } from "framer-motion";

export function JSONToCSVPage() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('code');
  const [copied, setCopied] = useState(false);
  const [fileName, setFileName] = useState('');
  const [conversions, setConversions] = useState<any[]>([]);
  const { addConversion } = useHistoryStore();

  const handleFileLoad = (content: string, name: string) => {
    setInput(content);
    setFileName(name);
    setError('');
  };

  const handleConvert = () => {
    if (!input.trim()) {
      setError('Please enter JSON data or upload a file');
      return;
    }

    const result = jsonToCsv(input);
    
    if (result.error) {
      setError(result.error);
      setOutput('');
    } else {
      setOutput(result.data);
      setError('');
      
      const newConversion = {
        name: fileName || 'converted.csv',
        status: 'converting' as const,
        size: `${(result.data.length / 1024).toFixed(1)} KB`
      };
      
      setConversions([newConversion, ...conversions]);
      
      setTimeout(() => {
        setConversions(prev => 
          prev.map((c, i) => i === 0 ? { ...c, status: 'converted' as const } : c)
        );
      }, 1000);
      
      addConversion({
        type: 'json-to-csv',
        input: input,
        output: result.data,
        fileName: fileName || 'converted.csv',
      });
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const baseName = fileName || 'converted';
    const csvFileName = baseName.replace(/\.[^/.]+$/, '') + '.csv';
    downloadFile(output, csvFileName, 'text/csv');
  };

  const handleDownloadItem = (index: number) => {
    // Always download the current output with the proper CSV filename
    if (output) {
      const baseName = conversions[index]?.name || 'converted';
      const csvFileName = baseName.replace(/\.[^/.]+$/, '') + '.csv'; // Ensure .csv extension
      downloadFile(output, csvFileName, 'text/csv');
    }
  };

  const handleDownloadAll = () => {
    if (output) {
      downloadFile(output, 'all-conversions.csv', 'text/csv');
    }
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
      
      {input && !output && (
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
      
      <ConversionList
        items={conversions}
        onDownload={handleDownloadItem}
        onDownloadAll={handleDownloadAll}
        conversionType="json-to-csv"
      />
      
      {output && (
        <OutputPreview
          content={output}
          type="csv"
          viewMode={viewMode}
          setViewMode={setViewMode}
          onCopy={handleCopy}
          onDownload={handleDownload}
          copied={copied}
        />
      )}
    </motion.div>
  );
}
