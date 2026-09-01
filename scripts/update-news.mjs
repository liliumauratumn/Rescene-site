import { appendFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import {
  decodeXml,
  fetchText,
  normalizeText,
  normalizeUrl,
  parseNextData,
  publicDedupeKeys,
  publicSourceUrls,
  readJson,
  tokyoDate,
  unique,
  updateDatasetDate,
  writeJsonIfChanged,
} from './lib/content-utils.mjs';

export const sourceFailureReason = (error) => {
  const message = error instanceof Error ? error.message : String(error);
  const status = message.match(/HTTP\s+(\d{3})/i)?.[1];
  if (status) return `HTTP ${status}`;
  return message.replace(/\s+/g, ' ').trim() || 'unknown error';
};

export const formatNewsSourceSummary = ({ sourceResults, candidateCount }) => [
  '## NEWS source collection',
  ...sourceResults.map((result) => (
    result.status === 'success'
      ? `- ${result.name}: success`
      : `- ${result.name}: failed (${result.reason})`
  )),
  `- candidates: ${candidateCount}`,
].join('\n');

const appendWorkflowSummary = async (summary) => {
  if (!process.env.GITHUB_STEP_SUMMARY) return;
  await appendFile(process.env.GITHUB_STEP_SUMMARY, `${summary}\n`);
};

export const runNewsUpdate = async ({
  config,
  news,
  pending,
  cutoff = process.env.UPDATE_START_DATE ?? '2026-08-09',
  discoveredAt = tokyoDate(),
  fetchSource = fetchText,
  writeJson = writeJsonIfChanged,
  updateDataset = updateDatasetDate,
  appendSummary = appendWorkflowSummary,
  logger = console.log,
}) => {
  const knownUrls = new Set(news.flatMap(publicSourceUrls));
  const knownSourceIds = new Set(
    pending.flatMap((item) => [item.sourceId, item.videoId]).filter(Boolean),
  );
  const existingCandidateUrls = new Set(
    pending.map((item) => normalizeUrl(item.sourceUrl)).filter(Boolean),
  );
  const keywords = config.newsKeywords.map(normalizeText);
  const isHighSignal = (title) => {
    const normalized = normalizeText(title);
    return keywords.some((keyword) => normalized.includes(keyword));
  };
  const candidates = [];
  const sourceResults = [];

  const collectSource = async (name, collect) => {
    try {
      const sourceCandidates = await collect();
      candidates.push(...sourceCandidates);
      sourceResults.push({
        name,
        status: 'success',
        candidateCount: sourceCandidates.length,
      });
    } catch (error) {
      sourceResults.push({ name, status: 'failed', reason: sourceFailureReason(error) });
    }
  };

  await collectSource('Mnet Plus', async () => {
    const sourceCandidates = [];
    const communityHtml = await fetchSource(config.mnet.communityUrl);
    const nextData = parseNextData(communityHtml);
    const noticeItems = nextData?.props?.pageProps?.feeds?.items;
    if (!Array.isArray(noticeItems)) {
      throw new Error('Mnet Plus公式Noticeのitemsが配列ではありません。取得仕様の変更を確認してください。');
    }
    for (const item of noticeItems) {
      const sourceId = item.id ?? item.feedId ?? item.postId;
      const title = item.title ?? item.subject ?? item.name ?? '';
      const publishedAt = (item.createdAt ?? item.publishedAt ?? '').slice(0, 10);
      if (!sourceId || !title || publishedAt < cutoff || !isHighSignal(title)) continue;
      const sourceUrl = `${config.mnet.communityUrl}/board/${config.mnet.noticeBoardId}/post/${sourceId}`;
      if (
        knownSourceIds.has(sourceId) ||
        knownUrls.has(normalizeUrl(sourceUrl)) ||
        existingCandidateUrls.has(normalizeUrl(sourceUrl))
      ) continue;
      sourceCandidates.push({
        id: `mnet-notice-${sourceId}`,
        status: 'candidate',
        candidateType: 'official_notice',
        title,
        publishedAt,
        eventDate: null,
        sourceId,
        sourceUrl,
        sourceName: 'RESCENE Official / Mnet Plus',
        sourceType: 'official_notice',
        discoveredAt,
        dedupeKeys: [`source:mnet-notice:${sourceId}`],
        reason: '公式Noticeで検出。日本語本文、日付、関連作品を人間が確認してからapprovedに変更します。',
      });
    }
    return sourceCandidates;
  });

  await collectSource('YouTube', async () => {
    const sourceCandidates = [];
    const youtubeXml = await fetchSource(config.youtube.feedUrl);
    const entries = [...youtubeXml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map((match) => match[1]);
    if (entries.length === 0) {
      throw new Error('RESCENE公式YouTubeフィードにentryがありません。チャンネルIDまたは取得仕様を確認してください。');
    }
    for (const entry of entries) {
      const videoId = decodeXml(entry.match(/<yt:videoId>([\s\S]*?)<\/yt:videoId>/)?.[1] ?? '');
      const title = decodeXml(entry.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? '');
      const publishedAt = decodeXml(entry.match(/<published>([\s\S]*?)<\/published>/)?.[1] ?? '').slice(0, 10);
      const sourceUrl = `https://www.youtube.com/watch?v=${videoId}`;
      if (!videoId || !title || publishedAt < cutoff || !isHighSignal(title)) continue;
      if (
        knownSourceIds.has(videoId) ||
        knownUrls.has(normalizeUrl(sourceUrl)) ||
        existingCandidateUrls.has(normalizeUrl(sourceUrl))
      ) continue;
      sourceCandidates.push({
        id: `youtube-${videoId}`,
        status: 'candidate',
        candidateType: 'official_video',
        title,
        publishedAt,
        eventDate: null,
        videoId,
        sourceUrl,
        sourceName: 'RESCENE Official YouTube',
        sourceType: 'official_video',
        discoveredAt,
        dedupeKeys: [`media:youtube:${videoId}`],
        reason: '公式YouTubeの高シグナル動画として検出。記事化の要否と日本語本文を人間が確認します。',
      });
    }
    return sourceCandidates;
  });

  const sourceSummary = formatNewsSourceSummary({
    sourceResults,
    candidateCount: candidates.length,
  });
  logger(sourceSummary);
  await appendSummary(sourceSummary);

  if (!sourceResults.some((result) => result.status === 'success')) {
    throw new Error('すべてのNEWSソースを取得できませんでした。各ソースの失敗内容をsummaryで確認してください。');
  }

  const allNewsUrls = new Set(news.flatMap(publicSourceUrls));
  const allNewsKeys = new Set(news.flatMap(publicDedupeKeys));
  const semanticKeys = new Set(
    news.map((article) => `${article.eventDate ?? article.publishedAt}:${normalizeText(article.title)}`),
  );
  const promoted = [];
  for (const candidate of pending) {
    if (candidate.status !== 'approved') continue;
    if (!candidate.article || typeof candidate.article !== 'object') {
      throw new Error(`${candidate.id}: approved候補にはarticleオブジェクトが必要です。`);
    }
    const article = candidate.article;
    const urls = unique([candidate.sourceUrl, ...publicSourceUrls(article)]).map(normalizeUrl);
    const keys = unique([...(candidate.dedupeKeys ?? []), ...publicDedupeKeys(article)]);
    if (keys.length === 0) {
      throw new Error(`${candidate.id}: approved候補にはdedupeKeysが必要です。`);
    }
    const semanticKey = `${article.eventDate ?? article.publishedAt}:${normalizeText(article.title)}`;
    const duplicate =
      urls.some((url) => allNewsUrls.has(url)) ||
      keys.some((key) => allNewsKeys.has(key)) ||
      semanticKeys.has(semanticKey);
    if (duplicate) {
      candidate.status = 'duplicate';
      candidate.reason = '公開済み記事と出典URL、重複キー、または日付と正規化タイトルが一致しました。';
      continue;
    }
    promoted.push(article);
    candidate.status = 'published';
    candidate.publishedArticleId = article.id;
    candidate.publishedAtSite = discoveredAt;
    urls.forEach((url) => allNewsUrls.add(url));
    keys.forEach((key) => allNewsKeys.add(key));
    semanticKeys.add(semanticKey);
  }

  const nextNews = [...news, ...promoted].sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt) || a.id.localeCompare(b.id),
  );
  const publicChanged = await writeJson('data/news.json', nextNews);
  const nextPending = [...pending, ...candidates].sort((a, b) =>
    (b.discoveredAt ?? b.publishedAt ?? '').localeCompare(a.discoveredAt ?? a.publishedAt ?? '') ||
    a.id.localeCompare(b.id),
  );
  await writeJson('data/pending/news.json', nextPending);
  await updateDataset('news', publicChanged);

  logger(
    `News更新: 候補 ${candidates.length}件、公開昇格 ${promoted.length}件、公開データ変更 ${publicChanged ? 'あり' : 'なし'}`,
  );
  return { candidates, promoted, publicChanged, sourceResults, sourceSummary };
};

const main = async () => {
  const [config, news, pending] = await Promise.all([
    readJson('scripts/config/update-sources.json'),
    readJson('data/news.json'),
    readJson('data/pending/news.json'),
  ]);
  await runNewsUpdate({ config, news, pending });
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
