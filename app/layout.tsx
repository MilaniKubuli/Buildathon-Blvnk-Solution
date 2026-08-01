import type { Metadata, Viewport } from 'next';
import '../src/index.css';

export const metadata: Metadata = {
  title: 'BLVNK Tech Solutions - Municipal AI Dispatch Engine',
  description:
    'BLVNK Tech Solutions - Municipal AI Dispatch Engine & 11 Official SA Languages Intelligence',
  icons: {
    icon: '/logo.jpg',
    apple: '/logo.jpg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#070f1e',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Google Fonts: Outfit & Inter */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        {/* Leaflet CSS */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="bg-[#070f1e] text-slate-100 font-sans antialiased selection:bg-[#00f2fe] selection:text-[#070f1e] min-h-screen overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
