import type { Metadata } from 'next';
import { absoluteUrl, siteConfig } from '@/site.config';

export function createMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const canonical = absoluteUrl(path);
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type: 'website',
      images: [
        {
          url: absoluteUrl('/images/og.png'),
          width: 2880,
          height: 1800,
          alt: 'RESCENE FANSITE',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [absoluteUrl('/images/og.png')],
    },
  };
}
