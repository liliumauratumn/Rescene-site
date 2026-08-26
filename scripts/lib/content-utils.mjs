import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

export const readJson = async (relativePath) =>
  JSON.parse(await readFile(resolve(rootDir, relativePath), 'utf8'));

export const writeJsonIfChanged = async (relativePath, value) => {
  const path = resolve(rootDir, relativePath);
  const next = `${JSON.stringify(value, null, 2)}\n`;
  const current = await readFile(path, 'utf8').catch(() => '');
  if (current === next) return false;
  await writeFile(path, next);
  return true;
};

export const tokyoDate = (value = new Date()) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(value);
  const get = (type) => parts.find((part) => part.type === type)?.value;
  return `${get('year')}-${get('month')}-${get('day')}`;
};

export const addDays = (dateString, days) => {
  const date = new Date(`${dateString}T00:00:00+09:00`);
  date.setUTCDate(date.getUTCDate() + days);
  return tokyoDate(date);
};

export const monthsBetween = (startDate, endDate) => {
  const result = [];
  const [startYear, startMonth] = startDate.split('-').map(Number);
  const [endYear, endMonth] = endDate.split('-').map(Number);
  let year = startYear;
  let month = startMonth;
  while (year < endYear || (year === endYear && month <= endMonth)) {
    result.push({ year, month });
    month += 1;
    if (month === 13) {
      year += 1;
      month = 1;
    }
  }
  return result;
};

export const normalizeText = (value = '') =>
  value
    .normalize('NFKC')
    .toLocaleLowerCase('ja')
    .replace(/[\p{P}\p{S}\s]+/gu, '');

export const normalizeUrl = (value) => {
  if (!value) return '';
  const url = new URL(value);
  if (url.hostname === 'youtu.be') {
    const videoId = url.pathname.split('/').filter(Boolean).at(-1) ?? '';
    url.hostname = 'www.youtube.com';
    url.pathname = '/watch';
    url.search = `?v=${videoId}`;
  }
  if (url.hostname.endsWith('youtube.com') && url.pathname.startsWith('/shorts/')) {
    const videoId = url.pathname.split('/')[2];
    url.pathname = '/watch';
    url.search = `?v=${videoId}`;
  }
  for (const key of [...url.searchParams.keys()]) {
    if (key.startsWith('utm_') || ['si', 'feature'].includes(key)) url.searchParams.delete(key);
  }
  url.hash = '';
  return url.toString().replace(/\/$/, '');
};

export const parseNextData = (html) => {
  const match = html.match(/<script[^>]+id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i);
  if (!match) throw new Error('Mnet Plusの__NEXT_DATA__を取得できませんでした。');
  return JSON.parse(match[1]);
};

export const decodeXml = (value = '') =>
  value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'");

export const fetchText = async (url) => {
  const response = await fetch(url, {
    headers: { 'user-agent': 'RESCENE-FANSITE-Updater/1.0 (+https://rescene.jp)' },
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`${url} の取得に失敗しました（HTTP ${response.status}）。`);
  return response.text();
};

export const updateDatasetDate = async (dataset, changed) => {
  if (!changed) return false;
  const meta = await readJson('data/content-meta.json');
  meta[dataset] = tokyoDate();
  return writeJsonIfChanged('data/content-meta.json', meta);
};

export const unique = (values) => [...new Set(values.filter(Boolean))];

export const publicSourceUrls = (item) =>
  unique([item.sourceUrl, ...(item.sources ?? []).map((source) => source.url)].map(normalizeUrl));

export const publicDedupeKeys = (item) => unique(item.dedupeKeys ?? []);
