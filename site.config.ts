import siteData from './data/site.json';
import contentMeta from './data/content-meta.json';

const lastUpdated = Object.values(contentMeta)
  .filter((value): value is string => /^\d{4}-\d{2}-\d{2}$/.test(value))
  .sort()
  .at(-1) ?? contentMeta.site;

export const siteConfig = {
  name: siteData.siteName,
  url: siteData.siteUrl,
  description: siteData.shortDescription,
  locale: 'ja_JP',
  language: 'ja',
  unofficialLabel: siteData.siteLabel,
  lastUpdated,
} as const;

export const absoluteUrl = (path = '/') => new URL(path, siteConfig.url).toString();
