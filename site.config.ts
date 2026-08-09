import siteData from './data/site.json';

export const siteConfig = {
  name: siteData.siteName,
  url: siteData.siteUrl,
  description: siteData.shortDescription,
  locale: 'ja_JP',
  language: 'ja',
  unofficialLabel: siteData.siteLabel,
  lastUpdated: siteData.nextJapanSchedule.checkedAt,
} as const;

export const absoluteUrl = (path = '/') => new URL(path, siteConfig.url).toString();
