import { Metadata } from 'next';
import { SharedFilesPage } from './files-page';

export const metadata: Metadata = {
  title: 'Shared Files - Swift Convert',
  description: 'View and manage your shared files. Keep track of all files you have shared with others.',
  openGraph: {
    title: 'Shared Files - Swift Convert',
    description: 'View and manage your shared files. Keep track of all files you have shared with others.',
    url: 'https://csvtojsonconverter.vercel.app/shared-files',
    siteName: 'Swift Convert',
    locale: 'en_US',
    type: 'website',
  },
};

export default function Page() {
  return <SharedFilesPage />;
}
