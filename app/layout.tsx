import './globals.css';
import type { Metadata } from 'next';
import { ThemeProvider } from '@/context/theme';

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
      <body suppressHydrationWarning className="font-sans">
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {try {var k='app.theme';var t=localStorage.getItem(k);if(t==='whatsapp') t='light';var c=document.documentElement.classList;c.remove('theme-whatsapp','theme-light','theme-deep');if(t==='light') {c.add('theme-light','theme-whatsapp');} else {c.add('theme-deep');}} catch(e){document.documentElement.classList.add('theme-deep');}})();`
          }}
        />
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
