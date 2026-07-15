import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import ConditionalLayout from '@/components/ConditionalLayout';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space',
  display: 'swap',
});

export const metadata = {
  title: {
    default: 'Open Intelligence Hub — Madurai AI Community',
    template: '%s | Open Intelligence Hub',
  },
  description:
    'Discover, submit, and showcase open-source AI resources — MCP servers, datasets, RAG templates, prompt libraries, and more. Built by PiBi Foundation for the Madurai AI Community.',
  keywords: ['AI', 'open source', 'MCP', 'RAG', 'datasets', 'Madurai', 'PiBi Foundation'],
  openGraph: {
    title: 'Open Intelligence Hub',
    description: 'Community platform for open-source AI resources',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body>
        <ConditionalLayout>{children}</ConditionalLayout>
      </body>
    </html>
  );
}
