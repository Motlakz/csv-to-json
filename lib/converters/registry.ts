import { FileSpreadsheet, FileCode, FileText, LucideIcon } from 'lucide-react';
import { IconType } from 'react-icons';
import { VscJson } from 'react-icons/vsc';
import { PiFileCsvDuotone } from 'react-icons/pi';
import { ConversionType } from '@/types';

export type ConverterCategory = 'csv' | 'json' | 'excel' | 'xml' | 'yaml' | 'other';

export interface ConverterConfig {
  id: ConversionType;
  slug: string;
  name: string;
  shortName: string;
  title: string;
  description: string;
  metaDescription: string;
  keywords: string[];
  sourceFormat: string;
  targetFormat: string;
  sourceExtensions: string[];
  targetExtension: string;
  sourceMimeTypes: string[];
  targetMimeType: string;
  icon: IconType | LucideIcon;
  colorScheme: 'blue' | 'orange' | 'emerald' | 'violet' | 'rose' | 'amber' | 'cyan' | 'slate';
  features: string[];
  category: ConverterCategory;
  isActive: boolean; // Whether the converter is implemented
  popular?: boolean; // Featured on homepage
}

export interface CategoryInfo {
  id: ConverterCategory;
  name: string;
  icon: IconType | LucideIcon;
  color: string;
}

export const categories: Record<ConverterCategory, CategoryInfo> = {
  csv: {
    id: 'csv',
    name: 'CSV',
    icon: PiFileCsvDuotone,
    color: 'blue',
  },
  json: {
    id: 'json',
    name: 'JSON',
    icon: VscJson,
    color: 'orange',
  },
  excel: {
    id: 'excel',
    name: 'Excel',
    icon: FileSpreadsheet,
    color: 'emerald',
  },
  xml: {
    id: 'xml',
    name: 'XML',
    icon: FileCode,
    color: 'rose',
  },
  yaml: {
    id: 'yaml',
    name: 'YAML',
    icon: FileText,
    color: 'amber',
  },
  other: {
    id: 'other',
    name: 'Other',
    icon: FileText,
    color: 'slate',
  },
};

export const converterRegistry: Record<string, ConverterConfig> = {
  'csv-to-json': {
    id: 'csv-to-json',
    slug: 'csv-to-json',
    name: 'CSV to JSON Converter',
    shortName: 'CSV → JSON',
    title: 'CSV to JSON Converter - Free Online Tool | Swift Convert',
    description: 'Convert your CSV files to JSON format',
    metaDescription: 'Convert CSV files to JSON online instantly. Free, secure, and no signup required. Automatic delimiter detection, preserves data structure, supports bulk conversion.',
    keywords: ['CSV to JSON', 'CSV to JSON converter', 'CSV to JSON online', 'convert CSV to JSON'],
    sourceFormat: 'CSV',
    targetFormat: 'JSON',
    sourceExtensions: ['.csv'],
    targetExtension: '.json',
    sourceMimeTypes: ['text/csv', '.csv'],
    targetMimeType: 'application/json',
    icon: PiFileCsvDuotone,
    colorScheme: 'blue',
    features: ['Automatic delimiter detection', 'Bulk conversion', 'Preserves data structure', 'No file size limits'],
    category: 'csv',
    isActive: true,
    popular: true,
  },
  'json-to-csv': {
    id: 'json-to-csv',
    slug: 'json-to-csv',
    name: 'JSON to CSV Converter',
    shortName: 'JSON → CSV',
    title: 'JSON to CSV Converter - Free Online Tool | Swift Convert',
    description: 'Convert your JSON files to CSV format',
    metaDescription: 'Convert JSON files to CSV online instantly. Free, secure, and no signup required. Handles nested objects, automatic data flattening.',
    keywords: ['JSON to CSV', 'JSON to CSV converter', 'JSON to CSV online', 'convert JSON to CSV'],
    sourceFormat: 'JSON',
    targetFormat: 'CSV',
    sourceExtensions: ['.json'],
    targetExtension: '.csv',
    sourceMimeTypes: ['application/json', '.json'],
    targetMimeType: 'text/csv',
    icon: VscJson,
    colorScheme: 'orange',
    features: ['Handles nested objects', 'Automatic flattening', 'Bulk conversion', 'Custom delimiters'],
    category: 'json',
    isActive: true,
    popular: true,
  },
  'json-to-excel': {
    id: 'json-to-excel',
    slug: 'json-to-excel',
    name: 'JSON to Excel Converter',
    shortName: 'JSON → Excel',
    title: 'JSON to Excel Converter - Free Online Tool | Swift Convert',
    description: 'Convert your JSON files to Excel format',
    metaDescription: 'Convert JSON files to Excel (.xlsx) online instantly. Free, secure, and no signup required. Creates formatted spreadsheets.',
    keywords: ['JSON to Excel', 'JSON to XLSX', 'JSON to Excel converter', 'convert JSON to Excel'],
    sourceFormat: 'JSON',
    targetFormat: 'Excel',
    sourceExtensions: ['.json'],
    targetExtension: '.xlsx',
    sourceMimeTypes: ['application/json', '.json'],
    targetMimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    icon: VscJson,
    colorScheme: 'violet',
    features: ['Auto-sized columns', 'Formatted output', 'Bulk conversion', 'Preserves data types'],
    category: 'json',
    isActive: true,
    popular: true,
  },
  'excel-to-json': {
    id: 'excel-to-json',
    slug: 'excel-to-json',
    name: 'Excel to JSON Converter',
    shortName: 'Excel → JSON',
    title: 'Excel to JSON Converter - Free Online Tool | Swift Convert',
    description: 'Convert your Excel spreadsheets to JSON format',
    metaDescription: 'Convert Excel files (.xlsx, .xls) to JSON online instantly. Free, secure, and no signup required. Automatic header detection.',
    keywords: ['Excel to JSON', 'XLSX to JSON', 'Excel to JSON converter', 'convert Excel to JSON'],
    sourceFormat: 'Excel',
    targetFormat: 'JSON',
    sourceExtensions: ['.xlsx', '.xls'],
    targetExtension: '.json',
    sourceMimeTypes: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'],
    targetMimeType: 'application/json',
    icon: FileSpreadsheet,
    colorScheme: 'emerald',
    features: ['Auto header detection', 'Multiple sheets', 'Bulk conversion', 'Preserves formatting'],
    category: 'excel',
    isActive: true,
    popular: true,
  },
  // Future converters (not yet implemented)
  'csv-to-excel': {
    id: 'csv-to-excel' as ConversionType,
    slug: 'csv-to-excel',
    name: 'CSV to Excel Converter',
    shortName: 'CSV → Excel',
    title: 'CSV to Excel Converter - Free Online Tool | Swift Convert',
    description: 'Convert your CSV files to Excel format',
    metaDescription: 'Convert CSV files to Excel (.xlsx) online instantly. Free, secure, and no signup required.',
    keywords: ['CSV to Excel', 'CSV to XLSX', 'CSV to Excel converter'],
    sourceFormat: 'CSV',
    targetFormat: 'Excel',
    sourceExtensions: ['.csv'],
    targetExtension: '.xlsx',
    sourceMimeTypes: ['text/csv'],
    targetMimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    icon: PiFileCsvDuotone,
    colorScheme: 'blue',
    features: ['Auto-format columns', 'Bulk conversion', 'Preserves data'],
    category: 'csv',
    isActive: false,
  },
  'csv-to-xml': {
    id: 'csv-to-xml' as ConversionType,
    slug: 'csv-to-xml',
    name: 'CSV to XML Converter',
    shortName: 'CSV → XML',
    title: 'CSV to XML Converter - Free Online Tool | Swift Convert',
    description: 'Convert your CSV files to XML format',
    metaDescription: 'Convert CSV files to XML online instantly. Free, secure, and no signup required.',
    keywords: ['CSV to XML', 'CSV to XML converter'],
    sourceFormat: 'CSV',
    targetFormat: 'XML',
    sourceExtensions: ['.csv'],
    targetExtension: '.xml',
    sourceMimeTypes: ['text/csv'],
    targetMimeType: 'application/xml',
    icon: PiFileCsvDuotone,
    colorScheme: 'rose',
    features: ['Custom root element', 'Attribute mapping', 'Bulk conversion'],
    category: 'csv',
    isActive: false,
  },
  'csv-to-yaml': {
    id: 'csv-to-yaml' as ConversionType,
    slug: 'csv-to-yaml',
    name: 'CSV to YAML Converter',
    shortName: 'CSV → YAML',
    title: 'CSV to YAML Converter - Free Online Tool | Swift Convert',
    description: 'Convert your CSV files to YAML format',
    metaDescription: 'Convert CSV files to YAML online instantly. Free, secure, and no signup required.',
    keywords: ['CSV to YAML', 'CSV to YAML converter'],
    sourceFormat: 'CSV',
    targetFormat: 'YAML',
    sourceExtensions: ['.csv'],
    targetExtension: '.yaml',
    sourceMimeTypes: ['text/csv'],
    targetMimeType: 'text/yaml',
    icon: PiFileCsvDuotone,
    colorScheme: 'amber',
    features: ['Clean formatting', 'Nested structure', 'Bulk conversion'],
    category: 'csv',
    isActive: false,
  },
  'json-to-xml': {
    id: 'json-to-xml' as ConversionType,
    slug: 'json-to-xml',
    name: 'JSON to XML Converter',
    shortName: 'JSON → XML',
    title: 'JSON to XML Converter - Free Online Tool | Swift Convert',
    description: 'Convert your JSON files to XML format',
    metaDescription: 'Convert JSON files to XML online instantly. Free, secure, and no signup required.',
    keywords: ['JSON to XML', 'JSON to XML converter'],
    sourceFormat: 'JSON',
    targetFormat: 'XML',
    sourceExtensions: ['.json'],
    targetExtension: '.xml',
    sourceMimeTypes: ['application/json'],
    targetMimeType: 'application/xml',
    icon: VscJson,
    colorScheme: 'rose',
    features: ['Preserves structure', 'Custom attributes', 'Bulk conversion'],
    category: 'json',
    isActive: false,
  },
  'json-to-yaml': {
    id: 'json-to-yaml' as ConversionType,
    slug: 'json-to-yaml',
    name: 'JSON to YAML Converter',
    shortName: 'JSON → YAML',
    title: 'JSON to YAML Converter - Free Online Tool | Swift Convert',
    description: 'Convert your JSON files to YAML format',
    metaDescription: 'Convert JSON files to YAML online instantly. Free, secure, and no signup required.',
    keywords: ['JSON to YAML', 'JSON to YAML converter'],
    sourceFormat: 'JSON',
    targetFormat: 'YAML',
    sourceExtensions: ['.json'],
    targetExtension: '.yaml',
    sourceMimeTypes: ['application/json'],
    targetMimeType: 'text/yaml',
    icon: VscJson,
    colorScheme: 'amber',
    features: ['Clean output', 'Preserves types', 'Bulk conversion'],
    category: 'json',
    isActive: false,
  },
  'xml-to-json': {
    id: 'xml-to-json' as ConversionType,
    slug: 'xml-to-json',
    name: 'XML to JSON Converter',
    shortName: 'XML → JSON',
    title: 'XML to JSON Converter - Free Online Tool | Swift Convert',
    description: 'Convert your XML files to JSON format',
    metaDescription: 'Convert XML files to JSON online instantly. Free, secure, and no signup required.',
    keywords: ['XML to JSON', 'XML to JSON converter'],
    sourceFormat: 'XML',
    targetFormat: 'JSON',
    sourceExtensions: ['.xml'],
    targetExtension: '.json',
    sourceMimeTypes: ['application/xml', 'text/xml'],
    targetMimeType: 'application/json',
    icon: FileCode,
    colorScheme: 'rose',
    features: ['Attribute handling', 'Namespace support', 'Bulk conversion'],
    category: 'xml',
    isActive: false,
  },
  'xml-to-csv': {
    id: 'xml-to-csv' as ConversionType,
    slug: 'xml-to-csv',
    name: 'XML to CSV Converter',
    shortName: 'XML → CSV',
    title: 'XML to CSV Converter - Free Online Tool | Swift Convert',
    description: 'Convert your XML files to CSV format',
    metaDescription: 'Convert XML files to CSV online instantly. Free, secure, and no signup required.',
    keywords: ['XML to CSV', 'XML to CSV converter'],
    sourceFormat: 'XML',
    targetFormat: 'CSV',
    sourceExtensions: ['.xml'],
    targetExtension: '.csv',
    sourceMimeTypes: ['application/xml', 'text/xml'],
    targetMimeType: 'text/csv',
    icon: FileCode,
    colorScheme: 'rose',
    features: ['Flatten nested', 'Custom mapping', 'Bulk conversion'],
    category: 'xml',
    isActive: false,
  },
  'yaml-to-json': {
    id: 'yaml-to-json' as ConversionType,
    slug: 'yaml-to-json',
    name: 'YAML to JSON Converter',
    shortName: 'YAML → JSON',
    title: 'YAML to JSON Converter - Free Online Tool | Swift Convert',
    description: 'Convert your YAML files to JSON format',
    metaDescription: 'Convert YAML files to JSON online instantly. Free, secure, and no signup required.',
    keywords: ['YAML to JSON', 'YAML to JSON converter'],
    sourceFormat: 'YAML',
    targetFormat: 'JSON',
    sourceExtensions: ['.yaml', '.yml'],
    targetExtension: '.json',
    sourceMimeTypes: ['text/yaml', 'application/x-yaml'],
    targetMimeType: 'application/json',
    icon: FileText,
    colorScheme: 'amber',
    features: ['Multi-document', 'Preserves types', 'Bulk conversion'],
    category: 'yaml',
    isActive: false,
  },
  'yaml-to-csv': {
    id: 'yaml-to-csv' as ConversionType,
    slug: 'yaml-to-csv',
    name: 'YAML to CSV Converter',
    shortName: 'YAML → CSV',
    title: 'YAML to CSV Converter - Free Online Tool | Swift Convert',
    description: 'Convert your YAML files to CSV format',
    metaDescription: 'Convert YAML files to CSV online instantly. Free, secure, and no signup required.',
    keywords: ['YAML to CSV', 'YAML to CSV converter'],
    sourceFormat: 'YAML',
    targetFormat: 'CSV',
    sourceExtensions: ['.yaml', '.yml'],
    targetExtension: '.csv',
    sourceMimeTypes: ['text/yaml', 'application/x-yaml'],
    targetMimeType: 'text/csv',
    icon: FileText,
    colorScheme: 'amber',
    features: ['Flatten structure', 'Custom delimiter', 'Bulk conversion'],
    category: 'yaml',
    isActive: false,
  },
  'excel-to-csv': {
    id: 'excel-to-csv' as ConversionType,
    slug: 'excel-to-csv',
    name: 'Excel to CSV Converter',
    shortName: 'Excel → CSV',
    title: 'Excel to CSV Converter - Free Online Tool | Swift Convert',
    description: 'Convert your Excel files to CSV format',
    metaDescription: 'Convert Excel files to CSV online instantly. Free, secure, and no signup required.',
    keywords: ['Excel to CSV', 'XLSX to CSV', 'Excel to CSV converter'],
    sourceFormat: 'Excel',
    targetFormat: 'CSV',
    sourceExtensions: ['.xlsx', '.xls'],
    targetExtension: '.csv',
    sourceMimeTypes: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    targetMimeType: 'text/csv',
    icon: FileSpreadsheet,
    colorScheme: 'emerald',
    features: ['Sheet selection', 'Custom delimiter', 'Bulk conversion'],
    category: 'excel',
    isActive: false,
  },
  'excel-to-xml': {
    id: 'excel-to-xml' as ConversionType,
    slug: 'excel-to-xml',
    name: 'Excel to XML Converter',
    shortName: 'Excel → XML',
    title: 'Excel to XML Converter - Free Online Tool | Swift Convert',
    description: 'Convert your Excel files to XML format',
    metaDescription: 'Convert Excel files to XML online instantly. Free, secure, and no signup required.',
    keywords: ['Excel to XML', 'XLSX to XML', 'Excel to XML converter'],
    sourceFormat: 'Excel',
    targetFormat: 'XML',
    sourceExtensions: ['.xlsx', '.xls'],
    targetExtension: '.xml',
    sourceMimeTypes: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    targetMimeType: 'application/xml',
    icon: FileSpreadsheet,
    colorScheme: 'emerald',
    features: ['Custom schema', 'Sheet selection', 'Bulk conversion'],
    category: 'excel',
    isActive: false,
  },
};

export function getConverterConfig(id: ConversionType): ConverterConfig {
  return converterRegistry[id];
}

export function getConverterBySlug(slug: string): ConverterConfig | undefined {
  return Object.values(converterRegistry).find((config) => config.slug === slug);
}

export function getAllConverters(): ConverterConfig[] {
  return Object.values(converterRegistry);
}

export function getActiveConverters(): ConverterConfig[] {
  return Object.values(converterRegistry).filter((config) => config.isActive);
}

export function getPopularConverters(): ConverterConfig[] {
  return Object.values(converterRegistry).filter((config) => config.popular && config.isActive);
}

export function getRelatedConverters(currentId: ConversionType): ConverterConfig[] {
  return Object.values(converterRegistry).filter((config) => config.id !== currentId && config.isActive);
}

export function getConvertersByCategory(category: ConverterCategory): ConverterConfig[] {
  return Object.values(converterRegistry).filter((config) => config.category === category);
}

export function getActiveConvertersByCategory(category: ConverterCategory): ConverterConfig[] {
  return Object.values(converterRegistry).filter((config) => config.category === category && config.isActive);
}

export function getCategoryForConverter(converterId: string): ConverterCategory | undefined {
  const converter = converterRegistry[converterId];
  return converter?.category;
}
