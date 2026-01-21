"use client"

import { ConverterLayout } from '@/components/converters';
import { getConverterConfig } from '@/lib/converters';
import { useState } from 'react';
import { useHistoryStore } from '@/lib/history-store';
import { excelToJson, downloadFile } from '@/lib/utils';
import { FileUpload } from '@/components/file-upload';
import { FileTabs } from '@/components/file-tabs';
import { ConvertedFile, ViewMode } from '@/types';
import { motion } from 'framer-motion';
import { OutputPreview } from '@/components/output-preview';
import { FileSpreadsheet, AlertCircle } from 'lucide-react';

const config = getConverterConfig('excel-to-json');

export function ExcelToJSONConverter() {
  return (
    <ConverterLayout config={config}>
      <ExcelToJSONContent />
    </ConverterLayout>
  );
}

function ExcelToJSONContent() {
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('code');
  const [copied, setCopied] = useState(false);
  const [convertedFiles, setConvertedFiles] = useState<ConvertedFile[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const { addConversion } = useHistoryStore();

  const handleFileLoad = async (content: string, name: string, file?: File) => {
    if (!file) {
      setError('Please upload an Excel file');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const result = await excelToJson(file);

      if (result.error) {
        setError(result.error);
      } else {
        const jsonString = JSON.stringify(result.data, null, 2);

        const newFile: ConvertedFile = {
          name: name || 'converted.json',
          input: content,
          output: jsonString,
          status: 'converting',
          size: `${(jsonString.length / 1024).toFixed(1)} KB`
        };

        setConvertedFiles(prev => [...prev, newFile]);
        setActiveTab(convertedFiles.length);

        setTimeout(() => {
          setConvertedFiles(prev =>
            prev.map((f, i) => i === prev.length - 1 ? { ...f, status: 'converted' as const } : f)
          );
        }, 1000);

        addConversion({
          type: 'excel-to-json',
          input: content,
          output: jsonString,
          fileName: name || 'converted.json',
          fileSize: `${(jsonString.length / 1024).toFixed(1)} KB`,
        });
      }
    } catch (err) {
      console.error('Failed to process Excel file:', err);
      setError('Failed to process Excel file');
    } finally {
      setIsProcessing(false);
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
    convertedFiles.forEach((file, index) => {
      setTimeout(() => {
        const baseName = file.name || `converted-${index + 1}`;
        const jsonFileName = baseName.replace(/\.[^/.]+$/, '') + '.json';
        downloadFile(file.output, jsonFileName, 'application/json');
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
        acceptedFormats=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
        allowMultiple={true}
      />

      {isProcessing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border p-6 bg-white dark:bg-gray-800"
        >
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
              <span className="text-gray-600 dark:text-gray-400">Processing Excel file...</span>
            </div>
          </div>
        </motion.div>
      )}

      {!isProcessing && convertedFiles.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border p-6 bg-white dark:bg-gray-800"
        >
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileSpreadsheet className="text-emerald-600 dark:text-emerald-400" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Upload Excel Files
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

      <FileTabs
        files={convertedFiles}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onDownloadAll={handleDownloadAll}
        colorScheme="emerald"
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

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="text-red-500 dark:text-red-400 mt-0.5" size={20} />
            <div className="flex-1">
              <h4 className="font-medium text-red-800 dark:text-red-200 mb-1">
                Conversion Error
              </h4>
              <p className="text-red-600 dark:text-red-400 text-sm">
                {error}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
