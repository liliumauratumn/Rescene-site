export const siteConfig = {
  name: 'RESCENE FANSITE',
  url: 'https://rescene.tokyo',
  description:
    'RESCENEを日本から知り、追い、記録するための日本語・非公式ファンサイト。',
  locale: 'ja_JP',
  language: 'ja',
  unofficialLabel: '日本語・非公式ファンサイト',
  lastUpdated: '2026-08-08',
} as const;

export const absoluteUrl = (path = '/') => new URL(path, siteConfig.url).toString();
