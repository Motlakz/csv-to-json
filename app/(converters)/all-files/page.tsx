import { Metadata } from 'next';
import { AllFilesPage } from './files-page';

export const metadata: Metadata = {
  title: 'All Files - Swift Convert',
  description: 'View and manage all your converted files. Download, share, or delete your conversion history.',
  openGraph: {
    title: 'All Files - Swift Convert',
    description: 'View and manage all your converted files. Download, share, or delete your conversion history.',
    url: 'https://csvtojsonconverter.vercel.app/all-files',
    siteName: 'Swift Convert',
    locale: 'en_US',
    type: 'website',
  },
};

export default function Page() {
  return <AllFilesPage />;
}
