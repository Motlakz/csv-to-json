/* eslint-disable @typescript-eslint/no-explicit-any */
import { ViewMode } from "@/types";
import { OutputPreview } from "./output-preview";
import { useState } from "react";
import { useHistoryStore } from "@/lib/history-store";
import { csvToJson, downloadFile } from "@/lib/utils";
import { FileUpload } from "./file-upload";
import { ConversionList } from "./conversion-list";
import { motion } from "framer-motion";

export function CSVToJSONPage() {
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
      setError('Please enter CSV data or upload a file');
      return;
    }

    const result = csvToJson(input);
    
    if (result.error) {
      setError(result.error);
      setOutput('');
    } else {
      const jsonOutput = JSON.stringify(result.data, null, 2);
      setOutput(jsonOutput);
      setError('');
      
      const newConversion = {
        name: fileName || 'converted.json',
        status: 'converting' as const,
        size: `${(jsonOutput.length / 1024).toFixed(1)} KB`
      };
      
      setConversions([newConversion, ...conversions]);
      
      setTimeout(() => {
        setConversions(prev => 
          prev.map((c, i) => i === 0 ? { ...c, status: 'converted' as const } : c)
        );
      }, 1000);
      
      addConversion({
        type: 'csv-to-json',
        input: input,
        output: jsonOutput,
        fileName: fileName || 'converted.json',
      });
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    downloadFile(output, fileName || 'converted.json', 'application/json');
  };

  const handleDownloadItem = (index: number) => {
    // Always download the current output with the proper JSON filename
    if (output) {
      const baseName = conversions[index]?.name || 'converted';
      const jsonFileName = baseName.replace(/\.[^/.]+$/, '') + '.json'; // Ensure .json extension
      downloadFile(output, jsonFileName, 'application/json');
    }
  };

  const handleDownloadAll = () => {
    if (output) {
      downloadFile(output, 'all-conversions.json', 'application/json');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl">
        <FileUpload
          onFileLoad={handleFileLoad}
          acceptedFormats=".csv,text/csv"
          allowMultiple={true}
        />
        
        {input && !output && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border p-6 mt-6"
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
        
        <ConversionList
          items={conversions}
          onDownload={handleDownloadItem}
          onDownloadAll={handleDownloadAll}
          conversionType="csv-to-json"
        />
      </div>
      
      {output && (
        <OutputPreview
          content={output}
          type="json"
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
