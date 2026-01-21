import { Metadata } from 'next';
import { getConverterConfig } from '@/lib/converters';
import { ExcelToJSONConverter } from './converter';

const config = getConverterConfig('excel-to-json');

export const metadata: Metadata = {
  title: config.title,
  description: config.metaDescription,
  keywords: config.keywords,
  openGraph: {
    title: config.title,
    description: config.metaDescription,
    url: `https://csvtojsonconverter.vercel.app/${config.slug}`,
    siteName: 'Swift Convert',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: config.name,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: config.title,
    description: config.metaDescription,
    images: ['/og-image.png'],
    site: '@MotlalepulaSel6',
  },
  alternates: {
    canonical: `https://csvtojsonconverter.vercel.app/${config.slug}`,
  },
};

export default function ExcelToJSONPage() {
  return <ExcelToJSONConverter />;
}
