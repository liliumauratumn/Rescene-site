import assert from 'node:assert/strict';
import { runLinkCheck } from './check-links.mjs';

const response = (status) => ({ status, body: { cancel: async () => {} } });
const runWith = async ({ urls, fetchImpl }) => {
  const summaries = [];
  const result = await runLinkCheck({
    urls,
    fetchImpl,
    checkStatic: async () => [],
    appendSummary: async (summary) => { summaries.push(summary); },
  });
  return { result, summary: summaries[0] };
};

const temporaryUrls = {
  'https://x.com/RESCENEofficial': 403,
  'https://www.instagram.com/rescene_official/': 429,
  'https://kissent.jp/contents/news/rescene': 503,
};
const warningOnly = await runWith({
  urls: Object.keys(temporaryUrls),
  fetchImpl: async (url) => response(temporaryUrls[url]),
});
assert.equal(warningOnly.result.exitCode, 0, 'warningのみでcheck:linksが失敗しました。');
assert.deepEqual(warningOnly.result.failures, []);
assert.equal(warningOnly.result.warnings.length, 3);
assert.match(warningOnly.summary, /503（外部サイトの一時的な障害） https:\/\/kissent\.jp\/contents\/news\/rescene/);
assert.match(warningOnly.summary, /403（アクセス制限）/);
assert.match(warningOnly.summary, /429（アクセス制限）/);

const transientNetwork = await runWith({
  urls: ['https://temporary-network.example.invalid/'],
  fetchImpl: async () => { throw new TypeError('fetch failed'); },
});
assert.equal(transientNetwork.result.exitCode, 0);
assert.match(transientNetwork.summary, /通信エラー/);

const dnsError = new TypeError('fetch failed');
dnsError.cause = Object.assign(new Error('getaddrinfo ENOTFOUND'), { code: 'ENOTFOUND' });
const brokenLinks = await runWith({
  urls: ['https://missing.example.invalid/', 'https://dns.example.invalid/'],
  fetchImpl: async (url) => {
    if (url.includes('missing')) return response(404);
    throw dnsError;
  },
});
assert.equal(brokenLinks.result.exitCode, 1, '404またはDNS失敗をfailureとして扱っていません。');
assert.equal(brokenLinks.result.failures.length, 2);
assert.match(brokenLinks.summary, /404 https:\/\/missing\.example\.invalid\//);
assert.match(brokenLinks.summary, /DNS解決失敗 https:\/\/dns\.example\.invalid\//);

console.log('Link check warning/failure分類テストOK');
