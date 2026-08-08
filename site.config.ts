import siteData from './data/site.json';

export const siteConfig = siteData.site;

export const absoluteUrl = (path = '/') => new URL(path, siteConfig.url).toString();
