/* eslint-disable @typescript-eslint/no-explicit-any */
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import Papa from 'papaparse';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const csvToJson = (csv: string): { data: any[]; error?: string } => {
  try {
    const result = Papa.parse(csv, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      transformHeader: (header) => header.trim(),
    });
    
    if (result.errors.length > 0) {
      return { data: [], error: result.errors[0].message };
    }
    
    return { data: result.data };
  } catch (error) {
    console.error(error)
    return { data: [], error: 'Failed to parse CSV' };
  }
};

export const jsonToCsv = (json: string): { data: string; error?: string } => {
  try {
    const parsed = JSON.parse(json);
    const array = Array.isArray(parsed) ? parsed : [parsed];
    
    const csv = Papa.unparse(array, {
      quotes: true,
      skipEmptyLines: true,
    });
    
    return { data: csv };
  } catch (error) {
    console.error(error)
    return { data: '', error: 'Invalid JSON format' };
  }
};

export const downloadFile = (content: string, filename: string, type: string) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
};
