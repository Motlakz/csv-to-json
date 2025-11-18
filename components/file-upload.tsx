import React, { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Check, X, Loader2 } from 'lucide-react';
import { readFileAsText } from '@/lib/utils';
import { PiFileCsvFill } from 'react-icons/pi';
import { BiSolidFileJson } from 'react-icons/bi';
import { BiSolidFileTxt } from 'react-icons/bi';

interface FileUploadProps {
  onFileLoad: (content: string, fileName: string, file?: File) => void;
  acceptedFormats: string;
  allowMultiple?: boolean;
}

interface UploadedFile {
  file: File;
  content: string;
  status: 'pending' | 'loading' | 'success' | 'error';
  error?: string;
}

export function FileUpload({ onFileLoad, acceptedFormats, allowMultiple = false }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const validateFile = useCallback((file: File): string | null => {
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return 'File size must be less than 5MB';
    }

    // Check file type with better extension handling
    const acceptedTypes = acceptedFormats.split(',').map(type => type.trim());
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const isAccepted = acceptedTypes.some(type => {
      if (type.startsWith('.')) {
        return fileExtension === type.toLowerCase();
      }
      return file.type === type || file.name.toLowerCase().endsWith(type.replace('*', '').toLowerCase());
    });

    if (!isAccepted) {
      const extensionMap: { [key: string]: string } = {
        '.csv': 'text/csv',
        '.json': 'application/json',
        '.txt': 'text/plain',
      };

      // Check if it's a known format by extension
      const mimeType = extensionMap[fileExtension];
      if (mimeType && acceptedTypes.includes(mimeType)) {
        return null;
      }

      return `File type not supported. Accepted formats: ${acceptedFormats}`;
    }

    return null;
  }, [acceptedFormats]);

  const processFile = useCallback(async (file: File): Promise<UploadedFile> => {
    const validationError = validateFile(file);
    if (validationError) {
      return {
        file,
        content: '',
        status: 'error',
        error: validationError
      };
    }

    try {
      const content = await readFileAsText(file);
      return {
        file,
        content,
        status: 'success'
      };
    } catch (error) {
      console.error('Failed to read file:', error);
      return {
        file,
        content: '',
        status: 'error',
        error: 'Failed to read file'
      };
    }
  }, [validateFile]);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (!allowMultiple && files.length > 1) {
      alert('Please upload only one file at a time');
      return;
    }

    // Initialize uploaded files with pending status
    const pendingFiles = files.map(file => ({
      file,
      content: '',
      status: 'pending' as const
    }));
    setUploadedFiles(pendingFiles);

    // Process files one by one for better UX
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadedFiles(prev =>
        prev.map((item, index) =>
          index === i ? { ...item, status: 'loading' } : item
        )
      );

      const processedFile = await processFile(file);
      setUploadedFiles(prev =>
        prev.map((item, index) =>
          index === i ? processedFile : item
        )
      );

      if (processedFile.status === 'success') {
        onFileLoad(processedFile.content, processedFile.file.name, processedFile.file);
      }
    }

    // Clear successful files after a delay
    setTimeout(() => {
      setUploadedFiles(prev => prev.filter(f => f.status !== 'success' && f.status !== 'error'));
    }, 3000);
  }, [onFileLoad, allowMultiple, processFile]);

  const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (!allowMultiple && files.length > 1) {
      alert('Please upload only one file at a time');
      return;
    }

    if (files.length === 0) return;

    // Initialize uploaded files with pending status
    const pendingFiles = files.map(file => ({
      file,
      content: '',
      status: 'pending' as const
    }));
    setUploadedFiles(pendingFiles);

    // Process files one by one for better UX
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadedFiles(prev =>
        prev.map((item, index) =>
          index === i ? { ...item, status: 'loading' } : item
        )
      );

      const processedFile = await processFile(file);
      setUploadedFiles(prev =>
        prev.map((item, index) =>
          index === i ? processedFile : item
        )
      );

      if (processedFile.status === 'success') {
        onFileLoad(processedFile.content, processedFile.file.name, processedFile.file);
      }
    }

    // Clear successful files after a delay
    setTimeout(() => {
      setUploadedFiles(prev => prev.filter(f => f.status !== 'success' && f.status !== 'error'));
    }, 3000);

    // Reset input
    e.target.value = '';
  }, [onFileLoad, allowMultiple, processFile]);

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (extension === 'csv') return <PiFileCsvFill size={16} />;
    if (extension === 'json') return <BiSolidFileJson size={16} />;
    if (extension === 'txt') return <BiSolidFileTxt size={16} />;
    return <FileText size={16} />;
  };

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragOver(false);
        }}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all
          ${isDragOver
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
            : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/20 hover:border-gray-400 dark:hover:border-gray-500'
          }
        `}
      >
        <input
          type="file"
          accept={acceptedFormats}
          onChange={handleFileInput}
          className="hidden"
          id="file-upload"
          multiple={allowMultiple}
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <motion.div
            animate={{ scale: isDragOver ? 1.1 : 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Upload size={48} className="mx-auto mb-4 text-gray-400 dark:text-gray-500" />
          </motion.div>
          <p className="text-lg mb-2 text-gray-700 dark:text-gray-300">
            {allowMultiple
              ? 'Click or drag your files here to convert'
              : 'Click or drag your file here to convert'
            }
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {allowMultiple ? 'Supports multiple files' : 'Single file'} up to 5MB • {acceptedFormats}
          </p>
        </label>
      </motion.div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Uploaded Files
          </h4>
          {uploadedFiles.map((uploadedFile, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`
                flex items-center gap-3 p-3 rounded-lg border
                ${uploadedFile.status === 'success'
                  ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20'
                  : uploadedFile.status === 'error'
                  ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20'
                  : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
                }
              `}
            >
              {getFileIcon(uploadedFile.file.name)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {uploadedFile.file.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {(uploadedFile.file.size / 1024).toFixed(1)} KB
                </p>
                {uploadedFile.error && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    {uploadedFile.error}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {uploadedFile.status === 'pending' && (
                  <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                )}
                {uploadedFile.status === 'loading' && (
                  <Loader2 size={16} className="animate-spin text-blue-500" />
                )}
                {uploadedFile.status === 'success' && (
                  <Check size={16} className="text-green-500" />
                )}
                {uploadedFile.status === 'error' && (
                  <X size={16} className="text-red-500" />
                )}
                <button
                  onClick={() => removeFile(index)}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                >
                  <X size={14} className="text-gray-500" />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
