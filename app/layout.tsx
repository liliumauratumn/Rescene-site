import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { JsonLd } from '@/components/JsonLd';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import { homeMembers } from '@/lib/content';
import { absoluteUrl, siteConfig } from '@/site.config';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  formatDetection: { email: false, address: false, telephone: false },
  alternates: { canonical: '/' },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    type: 'website',
    images: [
      {
        url: absoluteUrl('/images/og.png'),
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: [absoluteUrl('/images/og.png')],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#0B0C0E',
  colorScheme: 'dark',
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: siteConfig.name,
  url: siteConfig.url,
  description: siteConfig.description,
  inLanguage: 'ja',
  potentialAction: {
    '@type': 'SearchAction',
    target: `${siteConfig.url}/search/?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};

const musicGroupSchema = {
  '@context': 'https://schema.org',
  '@type': 'MusicGroup',
  name: 'RESCENE',
  url: 'https://themuze.kr/rescene',
  sameAs: [
    'https://artist.mnetplus.world/main/stg/rescene-official',
    'https://music.apple.com/jp/artist/rescene/1732658659',
    'https://open.spotify.com/artist/5deOsjuFTKrNMJW3rKuL8S',
  ],
};

const headerMembers = homeMembers.map(({ id, stageName, stageNameJa }) => ({
  id,
  stageName,
  stageNameJa,
}));

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja" data-scroll-behavior="smooth">
      <body>
        <a className="skip-link" href="#main-content">本文へ移動</a>
        <JsonLd data={websiteSchema} />
        <JsonLd data={musicGroupSchema} />
        <SiteHeader homeMembers={headerMembers} />
        <main id="main-content">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
