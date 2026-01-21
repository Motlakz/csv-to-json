"use client"

import { ConverterLayout } from '@/components/converters';
import { getConverterConfig } from '@/lib/converters';
import { ExcelOutputPreview } from '@/components/excel-output-preview';
import { useState } from 'react';
import { useHistoryStore } from '@/lib/history-store';
import { jsonToExcel, downloadExcelFile } from '@/lib/utils';
import { FileUpload } from '@/components/file-upload';
import { FileTabs } from '@/components/file-tabs';
import { ConvertedFile, ViewMode } from '@/types';
import { motion } from 'framer-motion';
import { VscJson } from 'react-icons/vsc';

const config = getConverterConfig('json-to-excel');

export function JSONToExcelConverter() {
  return (
    <ConverterLayout config={config}>
      <JSONToExcelContent />
    </ConverterLayout>
  );
}

function JSONToExcelContent() {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('code');
  const [copied, setCopied] = useState(false);
  const [convertedFiles, setConvertedFiles] = useState<ConvertedFile<Uint8Array>[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const { addConversion } = useHistoryStore();

  const handleFileLoad = (content: string, name: string) => {
    // Auto-convert files immediately when uploaded
    setError('');

    try {
      const result = jsonToExcel(content);

      if (result.error) {
        setError(result.error);
      } else if (!result.data || result.data.length === 0) {
        setError('Conversion failed: Empty output generated');
      } else {
        const newFile: ConvertedFile<Uint8Array> = {
          name: name || 'converted.xlsx',
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
          type: 'json-to-excel',
          input: content,
          output: content, // Store original JSON so we can regenerate Excel later
          fileName: name || 'converted.xlsx',
          fileSize: `${(result.data.length / 1024).toFixed(1)} KB`,
        });
      }
    } catch (error) {
      console.error('Unexpected error during conversion:', error);
      setError(`Conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleConvert = () => {
    // For manual textarea input
    if (!input.trim()) {
      setError('Please enter JSON data');
      return;
    }

    setError('');
    try {
      const result = jsonToExcel(input);

      if (result.error) {
        setError(result.error);
      } else if (!result.data || result.data.length === 0) {
        setError('Conversion failed: Empty output generated');
      } else {
        const newFile: ConvertedFile<Uint8Array> = {
          name: 'manual-conversion.xlsx',
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
          type: 'json-to-excel',
          input: input,
          output: input, // Store original JSON so we can regenerate Excel later
          fileName: 'manual-conversion.xlsx',
          fileSize: `${(result.data.length / 1024).toFixed(1)} KB`,
        });
      }
    } catch (error) {
      console.error('Unexpected error during conversion:', error);
      setError(`Conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleCopy = () => {
    if (convertedFiles[activeTab]) {
      navigator.clipboard.writeText(convertedFiles[activeTab].input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (convertedFiles[activeTab]) {
      const file = convertedFiles[activeTab];
      const baseName = file.name || 'converted';
      const excelFileName = baseName.replace(/\.[^/.]+$/, '') + '.xlsx';
      downloadExcelFile(file.output, excelFileName);
    }
  };

  const handleDownloadAll = () => {
    convertedFiles.forEach((file, index) => {
      setTimeout(() => {
        const baseName = file.name || `converted-${index + 1}`;
        const excelFileName = baseName.replace(/\.[^/.]+$/, '') + '.xlsx';
        downloadExcelFile(file.output, excelFileName);
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

      {!input && convertedFiles.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border p-6 bg-white dark:bg-gray-800"
        >
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <VscJson className="text-violet-600 dark:text-violet-400" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Upload JSON Files
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {config.description}
            </p>
            <div className="space-y-2 text-sm text-gray-500 dark:text-gray-500">
              {config.features.map((feature, index) => (
                <p key={index}>{feature}</p>
              ))}
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
            placeholder='[{"name":"John","age":30,"city":"New York"}]'
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
            className="w-full mt-4 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition-colors"
          >
            Convert to Excel
          </motion.button>
        </motion.div>
      )}

      <FileTabs
        files={convertedFiles}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onDownloadAll={handleDownloadAll}
        colorScheme="violet"
      >
        {convertedFiles[activeTab] && (
          <ExcelOutputPreview
            inputData={convertedFiles[activeTab].input}
            outputData={convertedFiles[activeTab].output}
            viewMode={viewMode}
            setViewMode={setViewMode}
            onCopy={handleCopy}
            onDownload={handleDownload}
            copied={copied}
            fileName={convertedFiles[activeTab].name || 'converted.xlsx'}
          />
        )}
      </FileTabs>
    </motion.div>
  );
}
