/* eslint-disable @typescript-eslint/no-explicit-any */
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

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

export const jsonToExcel = (json: string): { data: Uint8Array; error?: string } => {
  try {
    // Validate input
    if (!json || json.trim() === '') {
      return { data: new Uint8Array(), error: 'JSON input is empty' };
    }

    const parsed = JSON.parse(json);

    let array: any[];
    if (Array.isArray(parsed)) {
      array = parsed;
    } else if (typeof parsed === 'object') {
      array = [parsed];
    } else {
      return { data: new Uint8Array(), error: 'JSON must be an object or array' };
    }

    // Check if array is empty
    if (array.length === 0) {
      return { data: new Uint8Array(), error: 'JSON array is empty' };
    }

    // Limit array size to prevent memory issues
    const maxRows = 10000;
    const limitedArray = array.length > maxRows ? array.slice(0, maxRows) : array;

    // Create a new workbook
    const wb = XLSX.utils.book_new();

    // Convert JSON to worksheet
    const ws = XLSX.utils.json_to_sheet(limitedArray, {
      skipHeader: false,
    });

    // Auto-size columns with reasonable limits
    const headers = Object.keys(limitedArray[0] || {});
    const colWidths = headers.map(key => {
      const maxContentLength = Math.min(50, Math.max(key.length, ...limitedArray.map(row => String(row[key] || '').length)));
      return { wch: Math.min(maxContentLength + 2, 50) };
    });
    ws['!cols'] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Data');

    // Write workbook to buffer with compression
    const excelBuffer = XLSX.write(wb, {
      bookType: 'xlsx',
      type: 'array',
      compression: true
    }) as Uint8Array;

    // Ensure we have a valid Uint8Array
    if (!excelBuffer || excelBuffer.length === 0) {
      return { data: new Uint8Array(), error: 'Failed to generate Excel file' };
    }

    return { data: excelBuffer };
  } catch (error) {
    return { data: new Uint8Array(), error: `Conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
};

export const downloadExcelFile = (buffer: Uint8Array, filename: string) => {
  try {
    // Create blob from Uint8Array - type assertion needed for XLSX library compatibility
    // @ts-ignore - XLSX returns Uint8Array<ArrayBufferLike> which is compatible at runtime
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    // Create object URL
    const url = URL.createObjectURL(blob);

    // Create download link
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';

    // Add to DOM, trigger click, then cleanup
    document.body.appendChild(a);
    a.click();

    // Cleanup after a delay to ensure download starts
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);

  } catch (error) {
    throw new Error(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const excelToJson = (file: File): Promise<{ data: any[]; error?: string }> => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        // Get the first worksheet
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
          resolve({ data: [], error: 'No worksheet found in Excel file' });
          return;
        }

        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: null,
          blankrows: false
        });

        if (jsonData.length === 0) {
          resolve({ data: [], error: 'Excel file is empty' });
          return;
        }

        // Convert to proper JSON with headers
        const headers = jsonData[0] as string[];
        const rows = jsonData.slice(1);

        const result = rows.map((row: any) => {
          const obj: any = {};
          headers.forEach((header, index) => {
            obj[header] = row[index] || null;
          });
          return obj;
        });

        resolve({ data: result });
      } catch (error) {
        console.error(error);
        resolve({ data: [], error: 'Failed to parse Excel file' });
      }
    };

    reader.onerror = () => {
      resolve({ data: [], error: 'Failed to read Excel file' });
    };

    reader.readAsArrayBuffer(file);
  });
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
