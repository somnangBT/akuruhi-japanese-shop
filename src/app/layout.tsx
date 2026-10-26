import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Akuruhi Japanese Food & Beverage Supply',
  description:
    'Premier online Japanese food and beverage supply store with customer authentication, seamless QR code and Telegram checkout, and a real-time admin management dashboard.',
  openGraph: {
    title: 'Akuruhi Japanese Food & Beverage Supply',
    description:
      'Premier online Japanese food and beverage supply store with customer authentication, seamless QR code and Telegram checkout, and a real-time admin management dashboard.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export const viewport: Viewport = {
  themeColor: '#e11d48',
  width: 'device-width',
  initialScale: 1,
};

const themeScript = `
  (function() {
    try {
      var saved = localStorage.getItem('akuruhi_theme');
      var theme = saved ? saved : (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
        document.documentElement.setAttribute('data-theme', 'light');
      }
    } catch(e) {}
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="bg-slate-50 dark:bg-[#0b0d10] text-slate-900 dark:text-neutral-100 antialiased selection:bg-rose-500 selection:text-white transition-colors duration-200">
        {children}
      </body>
    </html>
  );
}
