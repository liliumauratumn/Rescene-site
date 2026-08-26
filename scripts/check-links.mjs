import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { publicSourceUrls, readJson, rootDir, unique } from './lib/content-utils.mjs';

const news = await readJson('data/news.json');
const schedules = await readJson('data/schedules.json');
const officialLinks = await readJson('data/official-links.json');
const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tokyo' }).format(new Date());
const upcoming = schedules.filter((item) => (item.endAt ?? item.startAt ?? '').slice(0, 10) >= today);
const urls = unique([
  ...officialLinks.map((item) => item.url),
  ...news.slice(0, 5).flatMap(publicSourceUrls),
  ...upcoming.flatMap(publicSourceUrls),
]);

const failures = [];
const warnings = [];
const checkUrl = async (url) => {
  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: { 'user-agent': 'RESCENE-FANSITE-LinkCheck/1.0 (+https://rescene.jp)' },
      signal: AbortSignal.timeout(25_000),
    });
    await response.body?.cancel();
    if ([401, 403, 405, 429].includes(response.status)) {
      warnings.push(`${response.status}（アクセス制限） ${url}`);
    } else if (response.status >= 400) {
      failures.push(`${response.status} ${url}`);
    }
  } catch (error) {
    warnings.push(`通信エラー ${url} — ${error.message}`);
  }
};

for (let index = 0; index < urls.length; index += 4) {
  await Promise.all(urls.slice(index, index + 4).map(checkUrl));
}

const sitemapPath = resolve(rootDir, 'out/sitemap.xml');
try {
  const sitemap = await readFile(sitemapPath, 'utf8');
  const site = await readJson('data/site.json');
  const origin = new URL(site.siteUrl).origin;
  for (const match of sitemap.matchAll(/<loc>(.*?)<\/loc>/g)) {
    const url = new URL(match[1]);
    if (url.origin !== origin) continue;
    const path = decodeURIComponent(url.pathname);
    const outputPath = path === '/'
      ? resolve(rootDir, 'out/index.html')
      : resolve(rootDir, 'out', path.replace(/^\//, ''), 'index.html');
    await access(outputPath).catch(() => failures.push(`静的出力がありません: ${path}`));
  }
} catch (error) {
  failures.push(`out/sitemap.xmlを検査できません: ${error.message}`);
}

if (warnings.length > 0) console.warn(`リンク警告（${warnings.length}件）:\n- ${warnings.join('\n- ')}`);
if (failures.length > 0) {
  console.error(`リンク検査失敗（${failures.length}件）:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}
console.log(`主要リンク検査OK: 外部 ${urls.length}件 / sitemap静的出力確認済み`);
