import { normalizeUrl, readJson } from './lib/content-utils.mjs';

const errors = [];
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const dateTimePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+09:00$/;
const publicStatuses = new Set(['confirmed', 'verified']);
const candidateStatuses = new Set(['candidate', 'approved', 'published', 'duplicate', 'rejected']);

const requiredString = (item, field, context) => {
  if (typeof item[field] !== 'string' || item[field].trim() === '') {
    errors.push(`${context}.${field} は空でない文字列が必要です。`);
  }
};

const validUrl = (value, context, nullable = false) => {
  if (nullable && value === null) return;
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error('protocol');
  } catch {
    errors.push(`${context} は有効なHTTP(S) URLではありません: ${String(value)}`);
  }
};

const uniqueField = (items, field, label) => {
  const seen = new Set();
  for (const item of items) {
    const value = item[field];
    if (seen.has(value)) errors.push(`${label}が重複しています: ${value}`);
    seen.add(value);
  }
};

const validateSources = (item, context) => {
  if (!item.sources) return;
  if (!Array.isArray(item.sources) || item.sources.length === 0) {
    errors.push(`${context}.sources は1件以上の配列にしてください。`);
    return;
  }
  for (const [index, source] of item.sources.entries()) {
    const sourceContext = `${context}.sources[${index}]`;
    requiredString(source, 'label', sourceContext);
    requiredString(source, 'type', sourceContext);
    validUrl(source.url, `${sourceContext}.url`);
    if (!datePattern.test(source.verifiedAt ?? '')) {
      errors.push(`${sourceContext}.verifiedAt はYYYY-MM-DD形式が必要です。`);
    }
  }
};

const news = await readJson('data/news.json');
if (!Array.isArray(news)) errors.push('data/news.json は配列である必要があります。');
else {
  uniqueField(news, 'id', 'News id');
  uniqueField(news, 'slug', 'News slug');
  const seenUrls = new Map();
  const seenKeys = new Map();
  for (const [index, article] of news.entries()) {
    const context = `news[${index}](${article.id ?? 'idなし'})`;
    for (const field of ['id', 'slug', 'title', 'summary', 'publishedAt', 'category', 'sourceType', 'sourceName']) {
      requiredString(article, field, context);
    }
    if (!datePattern.test(article.publishedAt ?? '')) errors.push(`${context}.publishedAt の形式が不正です。`);
    if (article.eventDate !== null && !datePattern.test(article.eventDate ?? '')) errors.push(`${context}.eventDate の形式が不正です。`);
    if (article.verifiedAt && !datePattern.test(article.verifiedAt)) errors.push(`${context}.verifiedAt の形式が不正です。`);
    if (!publicStatuses.has(article.verificationStatus)) errors.push(`${context} は公開データなのに確認済み状態ではありません。`);
    validUrl(article.sourceUrl, `${context}.sourceUrl`);
    if (!Array.isArray(article.body) || article.body.length === 0) errors.push(`${context}.body が空です。`);
    validateSources(article, context);
    for (const rawUrl of [article.sourceUrl, ...(article.sources ?? []).map((source) => source.url)]) {
      const url = normalizeUrl(rawUrl);
      const owner = seenUrls.get(url);
      if (owner && owner !== article.id) errors.push(`News出典URLが${owner}と${article.id}で重複しています: ${url}`);
      seenUrls.set(url, article.id);
    }
    for (const key of article.dedupeKeys ?? []) {
      const owner = seenKeys.get(key);
      if (owner && owner !== article.id) errors.push(`News dedupeKeyが${owner}と${article.id}で重複しています: ${key}`);
      seenKeys.set(key, article.id);
    }
  }
}

const schedules = await readJson('data/schedules.json');
if (!Array.isArray(schedules)) errors.push('data/schedules.json は配列である必要があります。');
else {
  uniqueField(schedules, 'id', 'Schedule id');
  const seenSourceIds = new Map();
  for (const [index, schedule] of schedules.entries()) {
    const context = `schedules[${index}](${schedule.id ?? 'idなし'})`;
    for (const field of ['id', 'title', 'timezone', 'type', 'region', 'status']) requiredString(schedule, field, context);
    if (!publicStatuses.has(schedule.verificationStatus)) errors.push(`${context} は公開データなのに確認済み状態ではありません。`);
    if (schedule.timezone !== 'Asia/Tokyo') errors.push(`${context}.timezone はAsia/Tokyoで統一します。`);
    for (const field of ['startAt', 'endAt', 'applicationStartAt', 'applicationEndAt', 'saleStartAt']) {
      if (schedule[field] !== null && !dateTimePattern.test(schedule[field] ?? '')) {
        errors.push(`${context}.${field} は+09:00付きの日時形式が必要です。`);
      }
    }
    validUrl(schedule.sourceUrl, `${context}.sourceUrl`, true);
    validateSources(schedule, context);
    for (const sourceId of schedule.sourceIds ?? (schedule.sourceId ? [schedule.sourceId] : [])) {
      const owner = seenSourceIds.get(sourceId);
      if (owner && owner !== schedule.id) errors.push(`Schedule sourceIdが${owner}と${schedule.id}で重複しています: ${sourceId}`);
      seenSourceIds.set(sourceId, schedule.id);
    }
  }
}

for (const file of ['data/pending/news.json', 'data/pending/schedules.json']) {
  const items = await readJson(file);
  if (!Array.isArray(items)) {
    errors.push(`${file} は配列である必要があります。`);
    continue;
  }
  uniqueField(items, 'id', `${file} id`);
  for (const [index, item] of items.entries()) {
    if (!candidateStatuses.has(item.status)) errors.push(`${file}[${index}].status が不正です: ${item.status}`);
    if (item.sourceUrl) validUrl(item.sourceUrl, `${file}[${index}].sourceUrl`);
    if (item.status === 'approved' && (!item.article || typeof item.article !== 'object')) {
      errors.push(`${file}[${index}] approvedにはarticleオブジェクトが必要です。`);
    }
  }
}

const meta = await readJson('data/content-meta.json');
for (const [key, value] of Object.entries(meta)) {
  if (!datePattern.test(value)) errors.push(`content-meta.${key} はYYYY-MM-DD形式が必要です。`);
}

const scheduleSync = await readJson('data/schedule-sync.json');
if (!datePattern.test(scheduleSync.checkedAt ?? '')) {
  errors.push('schedule-sync.checkedAt はYYYY-MM-DD形式が必要です。');
}
validUrl(scheduleSync.source, 'schedule-sync.source');

if (errors.length > 0) {
  console.error(`データ検証に失敗しました（${errors.length}件）:\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
console.log(`データ検証OK: News ${news.length}件 / Schedule ${schedules.length}件`);
