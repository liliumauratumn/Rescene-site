import { access, appendFile, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { publicSourceUrls, readJson, rootDir, unique } from './lib/content-utils.mjs';

const accessRestrictedStatuses = new Set([403, 429]);
const dnsErrorCodes = new Set(['EAI_AGAIN', 'ENODATA', 'ENOTFOUND']);

const errorCode = (error) => {
  let current = error;
  while (current && typeof current === 'object') {
    if (typeof current.code === 'string') return current.code;
    current = current.cause;
  }
  return null;
};

export const classifyLinkResponse = ({ url, response, error }) => {
  if (error) {
    if (dnsErrorCodes.has(errorCode(error))) {
      return { severity: 'failure', message: `DNS解決失敗 ${url} — ${error.message}` };
    }
    return { severity: 'warning', message: `通信エラー ${url} — ${error.message}` };
  }
  if (accessRestrictedStatuses.has(response.status)) {
    return { severity: 'warning', message: `${response.status}（アクセス制限） ${url}` };
  }
  if (response.status >= 500 && response.status <= 599) {
    return { severity: 'warning', message: `${response.status}（外部サイトの一時的な障害） ${url}` };
  }
  if (response.status >= 400) {
    return { severity: 'failure', message: `${response.status} ${url}` };
  }
  return null;
};

export const checkExternalUrls = async ({ urls, fetchImpl = fetch, concurrency = 4 }) => {
  const warnings = [];
  const failures = [];
  const checkUrl = async (url) => {
    try {
      const response = await fetchImpl(url, {
        method: 'GET',
        redirect: 'follow',
        headers: { 'user-agent': 'RESCENE-FANSITE-LinkCheck/1.0 (+https://rescene.jp)' },
        signal: AbortSignal.timeout(25_000),
      });
      await response.body?.cancel();
      const result = classifyLinkResponse({ url, response });
      if (result?.severity === 'warning') warnings.push(result.message);
      if (result?.severity === 'failure') failures.push(result.message);
    } catch (error) {
      const result = classifyLinkResponse({ url, error });
      if (result.severity === 'warning') warnings.push(result.message);
      if (result.severity === 'failure') failures.push(result.message);
    }
  };

  for (let index = 0; index < urls.length; index += concurrency) {
    await Promise.all(urls.slice(index, index + concurrency).map(checkUrl));
  }
  return { warnings, failures };
};

export const collectExternalUrls = async () => {
  const [news, schedules, officialLinks] = await Promise.all([
    readJson('data/news.json'),
    readJson('data/schedules.json'),
    readJson('data/official-links.json'),
  ]);
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tokyo' }).format(new Date());
  const upcoming = schedules.filter((item) => (item.endAt ?? item.startAt ?? '').slice(0, 10) >= today);
  return unique([
    ...officialLinks.map((item) => item.url),
    ...news.slice(0, 5).flatMap(publicSourceUrls),
    ...upcoming.flatMap(publicSourceUrls),
  ]);
};

export const checkStaticOutput = async () => {
  const failures = [];
  const sitemapPath = resolve(rootDir, 'out/sitemap.xml');
  try {
    const [sitemap, site] = await Promise.all([
      readFile(sitemapPath, 'utf8'),
      readJson('data/site.json'),
    ]);
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
  return failures;
};

export const formatLinkSummary = ({ urlCount, warnings, failures }) => [
  '### Link check',
  `- External URLs checked: ${urlCount}`,
  ...(warnings.length > 0
    ? ['- Warnings:', ...warnings.map((warning) => `  - ${warning}`)]
    : ['- Warnings: none']),
  ...(failures.length > 0
    ? ['- Failures:', ...failures.map((failure) => `  - ${failure}`)]
    : ['- Failures: none']),
].join('\n');

const appendWorkflowSummary = async (summary) => {
  if (!process.env.GITHUB_STEP_SUMMARY) return;
  await appendFile(process.env.GITHUB_STEP_SUMMARY, `${summary}\n`);
};

export const runLinkCheck = async ({
  urls,
  fetchImpl = fetch,
  checkStatic = checkStaticOutput,
  appendSummary = appendWorkflowSummary,
} = {}) => {
  const targetUrls = urls ?? await collectExternalUrls();
  const { warnings, failures: externalFailures } = await checkExternalUrls({
    urls: targetUrls,
    fetchImpl,
  });
  const failures = [...externalFailures, ...await checkStatic()];
  const summary = formatLinkSummary({ urlCount: targetUrls.length, warnings, failures });
  await appendSummary(summary);
  return { warnings, failures, summary, exitCode: failures.length > 0 ? 1 : 0 };
};

const main = async () => {
  const { warnings, failures } = await runLinkCheck({});
  if (warnings.length > 0) console.warn(`リンク警告（${warnings.length}件）:\n- ${warnings.join('\n- ')}`);
  if (failures.length > 0) {
    console.error(`リンク検査失敗（${failures.length}件）:\n- ${failures.join('\n- ')}`);
    process.exitCode = 1;
    return;
  }
  console.log('主要リンク検査OK: 外部リンクとsitemap静的出力を確認済み');
};

if (import.meta.url === new URL(process.argv[1], 'file:').href) {
  await main();
}
