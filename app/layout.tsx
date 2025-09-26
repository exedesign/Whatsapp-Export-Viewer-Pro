import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Whatsapp Export Reader',
  description: 'Read your Whatsapp exports',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
