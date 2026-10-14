import type { Metadata, Viewport } from 'next';
import './globals.css';
import { PWARegister } from '@/components/PWARegister';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://resqai.org'),
  title: 'ResQAI — Zero-login Emergency Response Portal',
  description: 'Instant zero-login emergency reporting, AI triage, and real-time citizen-to-command dispatch platform.',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'ResQAI — Zero-login Emergency Response Portal',
    description: 'Instant zero-login emergency reporting and citizen-to-command dispatch platform.',
    siteName: 'ResQAI',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/icon-512.png',
        width: 512,
        height: 512,
        alt: 'ResQAI Emergency System',
      },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ResQAI SOS',
  },
};

export const viewport: Viewport = {
  themeColor: '#005cb8',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className="bg-surface font-body-md text-on-surface flex flex-col min-h-screen selection:bg-primary-container selection:text-white">
        <PWARegister />
        {children}
      </body>
    </html>
  );
}
