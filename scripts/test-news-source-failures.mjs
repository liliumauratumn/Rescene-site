import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runNewsUpdate } from './update-news.mjs';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const workflow = await readFile(resolve(rootDir, '.github/workflows/update-news.yml'), 'utf8');
const config = {
  mnet: {
    communityUrl: 'https://artist.mnetplus.world/main/stg/rescene-official/community',
    noticeBoardId: 'notice-board',
  },
  youtube: {
    feedUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCtKtCiaWRz-d3EZn2xd1mdA',
  },
  newsKeywords: ['official mv'],
};
const existingNews = [{
  id: 'existing-news',
  title: 'Existing article',
  publishedAt: '2026-08-20',
  sourceUrl: 'https://example.com/existing-news',
  dedupeKeys: ['existing-news'],
}];
const mnetHtml = (items) => `<script id="__NEXT_DATA__">${JSON.stringify({
  props: { pageProps: { feeds: { items } } },
})}</script>`;
const highSignalNotice = {
  id: 'notice-1',
  title: 'RESCENE Official MV release',
  createdAt: '2026-09-01T09:00:00+09:00',
};

const filesValue = (files, path) => files.get(path);

const runScenario = async ({ mnet, youtube }) => {
  const files = new Map([
    ['data/news.json', structuredClone(existingNews)],
    ['data/pending/news.json', []],
  ]);
  const writes = [];
  const summaries = [];
  const result = await runNewsUpdate({
    config,
    news: structuredClone(existingNews),
    pending: [],
    cutoff: '2026-08-09',
    discoveredAt: '2026-09-01',
    fetchSource: async (url) => {
      const response = url === config.mnet.communityUrl ? mnet : youtube;
      if (response instanceof Error) throw response;
      return response;
    },
    writeJson: async (path, value) => {
      const current = JSON.stringify(files.get(path));
      const next = JSON.stringify(value);
      if (current === next) return false;
      files.set(path, structuredClone(value));
      writes.push(path);
      return true;
    },
    updateDataset: async () => false,
    appendSummary: async (summary) => { summaries.push(summary); },
    logger: () => {},
  });
  return { result, files, writes, summaries };
};

for (const failure of [
  new Error('https://www.youtube.com/feeds/videos.xml の取得に失敗しました（HTTP 404）。'),
  new Error('https://www.youtube.com/feeds/videos.xml の取得に失敗しました（HTTP 403）。'),
  new Error('https://www.youtube.com/feeds/videos.xml の取得に失敗しました（HTTP 500）。'),
  new TypeError('fetch failed'),
]) {
  const scenario = await runScenario({ mnet: mnetHtml([highSignalNotice]), youtube: failure });
  assert.equal(scenario.result.sourceResults[0].status, 'success');
  assert.equal(scenario.result.sourceResults[1].status, 'failed');
  assert.equal(scenario.result.candidates.length, 1, 'Mnet Plus候補の収集が継続していません。');
  assert.equal(scenario.result.candidates[0].candidateType, 'official_notice');
  assert.equal(
    scenario.result.candidates.some((candidate) => candidate.candidateType === 'official_video'),
    false,
    'YouTube取得不能時に候補を推測生成しました。',
  );
  assert.deepEqual(filesValue(scenario.files, 'data/news.json'), existingNews);
  assert.match(scenario.summaries[0], /Mnet Plus: success/);
  assert.match(scenario.summaries[0], /YouTube: failed/);
}

const youtubeOnlyFailure = await runScenario({
  mnet: mnetHtml([]),
  youtube: new Error('https://www.youtube.com/feeds/videos.xml の取得に失敗しました（HTTP 404）。'),
});
assert.equal(youtubeOnlyFailure.result.candidates.length, 0);
assert.deepEqual(youtubeOnlyFailure.writes, []);
assert.match(youtubeOnlyFailure.summaries[0], /YouTube: failed \(HTTP 404\)/);
assert.match(youtubeOnlyFailure.summaries[0], /candidates: 0/);

const allFailedFiles = new Map([
  ['data/news.json', structuredClone(existingNews)],
  ['data/pending/news.json', []],
]);
const allFailedWrites = [];
const allFailedSummaries = [];
await assert.rejects(
  runNewsUpdate({
    config,
    news: structuredClone(existingNews),
    pending: [],
    fetchSource: async (url) => {
      if (url === config.mnet.communityUrl) throw new Error('Mnet Plus network error');
      throw new Error('YouTube network error');
    },
    writeJson: async (path, value) => {
      allFailedFiles.set(path, structuredClone(value));
      allFailedWrites.push(path);
      return true;
    },
    updateDataset: async () => false,
    appendSummary: async (summary) => { allFailedSummaries.push(summary); },
    logger: () => {},
  }),
  /すべてのNEWSソースを取得できませんでした/,
);
assert.deepEqual(allFailedWrites, []);
assert.deepEqual(filesValue(allFailedFiles, 'data/news.json'), existingNews);
assert.match(allFailedSummaries[0], /Mnet Plus: failed/);
assert.match(allFailedSummaries[0], /YouTube: failed/);

assert.doesNotMatch(workflow, /gh pr merge|--auto/, 'NEWS PRにauto-merge処理があります。');

console.log('NEWS source failure isolationテストOK');
