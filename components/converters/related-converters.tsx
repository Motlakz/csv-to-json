"use client"

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ConverterConfig } from '@/lib/converters';
import { ConversionType } from '@/types';
import { PiFileCsvDuotone, PiMicrosoftExcelLogoBold } from 'react-icons/pi';
import { VscJson } from 'react-icons/vsc';

interface RelatedConvertersProps {
  converters: ConverterConfig[];
  currentConverter: ConversionType;
}

const colorSchemeClasses: Record<ConverterConfig['colorScheme'], { bg: string; text: string; hover: string }> = {
  blue: {
    bg: 'bg-blue-600/10',
    text: 'text-blue-500',
    hover: 'hover:border-blue-400',
  },
  orange: {
    bg: 'bg-orange-600/10',
    text: 'text-orange-500',
    hover: 'hover:border-orange-400',
  },
  emerald: {
    bg: 'bg-green-600/10',
    text: 'text-green-500',
    hover: 'hover:border-green-400',
  },
  violet: {
    bg: 'bg-violet-600/10',
    text: 'text-violet-500',
    hover: 'hover:border-violet-400',
  },
  rose: {
    bg: 'bg-rose-600/10',
    text: 'text-rose-500',
    hover: 'hover:border-rose-400',
  },
  amber: {
    bg: 'bg-amber-600/10',
    text: 'text-amber-500',
    hover: 'hover:border-amber-400',
  },
  cyan: {
    bg: 'bg-cyan-600/10',
    text: 'text-cyan-500',
    hover: 'hover:border-cyan-400',
  },
  slate: {
    bg: 'bg-slate-600/10',
    text: 'text-slate-500',
    hover: 'hover:border-slate-400',
  },
};

function getIcon(converterId: ConversionType) {
  switch (converterId) {
    case 'csv-to-json':
      return PiFileCsvDuotone;
    case 'json-to-csv':
    case 'json-to-excel':
      return VscJson;
    case 'excel-to-json':
      return PiMicrosoftExcelLogoBold;
    default:
      return VscJson;
  }
}

export function RelatedConverters({ converters }: RelatedConvertersProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-xl border p-6 bg-white dark:bg-slate-800"
    >
      <h3 className="font-semibold mb-4">
        Related Converters
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {converters.map((converter) => {
          const Icon = getIcon(converter.id);
          const colors = colorSchemeClasses[converter.colorScheme];

          return (
            <Link key={converter.id} href={`/${converter.slug}`}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-4 rounded-lg border text-left transition-colors dark:bg-slate-900/20 bg-gray-50 dark:border-gray-700 border-gray-200 ${colors.hover}`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center`}>
                    <Icon size={16} className={colors.text} />
                  </div>
                  <span className="font-medium text-gray-900 dark:text-gray-400">
                    {converter.shortName}
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-200">
                  {converter.description}
                </p>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </motion.div>
  );
}
