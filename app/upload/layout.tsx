import type { Metadata } from 'next';
import type { Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Upload Receipt',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

export default function UploadLayout({ children }: { children: React.ReactNode }) {
  return children;
}
