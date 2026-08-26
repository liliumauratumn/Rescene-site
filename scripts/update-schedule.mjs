import { writeFile } from 'node:fs/promises';
import {
  addDays,
  fetchText,
  monthsBetween,
  normalizeText,
  normalizeUrl,
  readJson,
  tokyoDate,
  updateDatasetDate,
  writeJsonIfChanged,
} from './lib/content-utils.mjs';
import {
  changedScheduleFields,
  hasScheduleSourceDisappeared,
  isPotentialSameSchedule,
  isPrimaryScheduleSource,
  matchedScheduleReviewReason,
  scheduleSafetyDecision,
} from './lib/schedule-safety.mjs';

const config = await readJson('scripts/config/update-sources.json');
const schedules = await readJson('data/schedules.json');
const pending = await readJson('data/pending/schedules.json');
const today = tokyoDate();
const startDate = process.env.UPDATE_START_DATE ?? '2026-08-09';
const endDate = process.env.UPDATE_END_DATE ?? addDays(today, 120);
const maxSafeChanges = Number(process.env.MAX_SAFE_SCHEDULE_CHANGES ?? 5);

const toTokyoDateTime = (value) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(value));
  const get = (type) => parts.find((part) => part.type === type)?.value;
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}:${get('second')}+09:00`;
};

const monthBounds = (year, month) => {
  const first = `${year}-${String(month).padStart(2, '0')}-01`;
  const nextYear = month === 12 ? year + 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  const next = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;
  const firstInstant = new Date(`${first}T00:00:00+09:00`);
  const nextInstant = new Date(`${next}T00:00:00+09:00`);
  const lastInstant = new Date(nextInstant.getTime() - 1_000);
  const last = tokyoDate(lastInstant);
  return {
    first,
    last,
    startAt: firstInstant.toISOString().replace('.000Z', 'Z'),
    endAt: lastInstant.toISOString().replace('.000Z', 'Z'),
  };
};

const rawEvents = [];
for (const { year, month } of monthsBetween(startDate, endDate)) {
  const bounds = monthBounds(year, month);
  const url = new URL(config.mnet.calendarApi);
  url.searchParams.set('startAt', bounds.startAt);
  url.searchParams.set('endAt', bounds.endAt);
  url.searchParams.set('startAtForAllDay', bounds.first);
  url.searchParams.set('endAtForAllDay', bounds.last);
  const response = JSON.parse(await fetchText(url));
  if (!Array.isArray(response.events)) {
    throw new Error(`${year}-${month}: 公式カレンダーのeventsが配列ではありません。`);
  }
  rawEvents.push(...response.events);
}

const eventDate = (event) =>
  event.allDay ? event.startAtAllDay : toTokyoDateTime(event.startAt).slice(0, 10);
const allowedLabels = new Set(config.scheduleLabels);
const filtered = rawEvents
  .filter((event) => allowedLabels.has(event.label?.name))
  .filter((event) => eventDate(event) >= startDate && eventDate(event) <= endDate)
  .sort((a, b) => eventDate(a).localeCompare(eventDate(b)) || a.id.localeCompare(b.id));

const groups = [];
for (const event of filtered) {
  const previous = [...groups].reverse().find((group) =>
    event.allDay &&
    group.events.every((item) => item.allDay) &&
    normalizeText(group.events[0].title) === normalizeText(event.title) &&
    group.events[0].label?.name === event.label?.name &&
    addDays(eventDate(group.events.at(-1)), 1) === eventDate(event),
  );
  if (previous) previous.events.push(event);
  else groups.push({ events: [event] });
}

const typeMap = { 방송: 'broadcast', 공연: 'performance', 행사: 'event' };
const statusFor = (title, endAt, startAt) => {
  if (/취소|中止/i.test(title)) return 'cancelled';
  if (/연기|延期/i.test(title)) return 'postponed';
  return (endAt ?? startAt)?.slice(0, 10) < today ? 'completed' : 'scheduled';
};

const records = groups.map(({ events }) => {
  const first = events[0];
  const last = events.at(-1);
  const firstDate = eventDate(first);
  const lastDate = eventDate(last);
  const month = firstDate.slice(5, 7);
  const year = firstDate.slice(0, 4);
  const detailUrl = `${config.mnet.calendarDetailBase}/${year}/${month}?eventId=${first.id}`;
  const override = config.scheduleOverrides[first.id] ?? {};
  const allDay = override.allDay ?? first.allDay;
  let startAt = first.allDay ? `${firstDate}T00:00:00+09:00` : toTokyoDateTime(first.startAt);
  let endAt = events.length > 1 || first.allDay ? `${lastDate}T23:59:59+09:00` : null;
  if (Object.hasOwn(override, 'startAt')) startAt = override.startAt;
  if (Object.hasOwn(override, 'endAt')) endAt = override.endAt;
  const title = override.title ?? first.title;
  const sourceIds = events.map((event) => event.id);
  const sources = [
    {
      label: 'RESCENE公式スケジュール',
      url: detailUrl,
      type: 'official_calendar',
      verifiedAt: today,
    },
    ...(override.additionalSources ?? []).map((source) => ({ ...source, verifiedAt: today })),
  ];
  return {
    id: `mnet-calendar-${first.id}`,
    title,
    startAt,
    endAt,
    timezone: 'Asia/Tokyo',
    type: typeMap[first.label.name] ?? 'event',
    region: override.region ?? 'KR',
    prefecture: override.prefecture ?? null,
    venue: override.venue ?? null,
    status: statusFor(title, endAt, startAt),
    applicationStartAt: null,
    applicationEndAt: null,
    saleStartAt: null,
    sourceUrl: detailUrl,
    sourceId: first.id,
    sourceIds,
    sourceName: 'RESCENE Official / Mnet Plus',
    sourceLabel: 'RESCENE公式スケジュール',
    sources,
    verifiedAt: today,
    dedupeKeys: [
      ...sourceIds.map((id) => `source:mnet-calendar:${id}`),
      `event:${normalizeText(first.title)}:${firstDate}`,
    ],
    originalTitle: first.title,
    allDay,
    autoManaged: true,
    verificationStatus: 'confirmed',
  };
});

const nextSchedules = [...schedules];
const nextPending = [...pending];
const matchedExistingIds = new Set();
const appliedChanges = [];
const reviewCandidates = [];
const pendingSignature = (item) => `${item.candidateType}:${item.sourceId ?? item.sourceUrl}`;
const unresolvedSignatures = new Set(
  nextPending.filter((item) => item.status === 'candidate').map(pendingSignature),
);
const addReviewCandidate = (candidate) => {
  const signature = pendingSignature(candidate);
  if (unresolvedSignatures.has(signature)) return;
  unresolvedSignatures.add(signature);
  reviewCandidates.push(candidate);
  nextPending.push(candidate);
};

for (const record of records) {
  const index = nextSchedules.findIndex((item) =>
    item.autoManaged && (item.id === record.id || item.sourceId === record.sourceId),
  );
  if (index !== -1) {
    const existing = nextSchedules[index];
    matchedExistingIds.add(existing.id);
    const fields = changedScheduleFields(existing, record);
    if (fields.length === 0) {
      record.verifiedAt = existing.verifiedAt;
      record.sources = record.sources.map((source) => {
        const oldSource = existing.sources?.find(
          (item) => normalizeUrl(item.url) === normalizeUrl(source.url),
        );
        return { ...source, verifiedAt: oldSource?.verifiedAt ?? existing.verifiedAt ?? today };
      });
      nextSchedules[index] = record;
      continue;
    }
    const reviewReason = matchedScheduleReviewReason(existing, record);
    if (reviewReason?.type === 'date_change') {
      addReviewCandidate({
        id: `date-change-${record.sourceId}-${today}`,
        status: 'candidate',
        candidateType: 'date_change',
        title: record.title,
        eventDate: record.startAt?.slice(0, 10) ?? null,
        sourceId: record.sourceId,
        sourceUrl: record.sourceUrl,
        sourceName: record.sourceName,
        sourceType: 'official_calendar',
        discoveredAt: today,
        changedFields: fields,
        existingSchedule: existing,
        proposedSchedule: record,
        dedupeKeys: record.dedupeKeys,
        reason: '公式カレンダー上の日付・期間・終日区分が既存公開データから変わりました。公開データは自動変更せず、人間の確認が必要です。',
      });
      continue;
    }
    if (reviewReason?.type === 'non_primary_source') {
      addReviewCandidate({
        id: `non-primary-${record.sourceId}-${today}`,
        status: 'candidate',
        candidateType: 'non_primary_source',
        title: record.title,
        eventDate: record.startAt?.slice(0, 10) ?? null,
        sourceId: record.sourceId,
        sourceUrl: record.sourceUrl,
        sourceName: record.sourceName,
        sourceType: record.sources?.[0]?.type ?? 'unknown',
        discoveredAt: today,
        existingSchedule: existing,
        proposedSchedule: record,
        dedupeKeys: record.dedupeKeys,
        reason: '自動反映の基準であるRESCENE公式Mnet Plusカレンダーを一次情報として確認できませんでした。',
      });
      continue;
    }
    nextSchedules[index] = record;
    appliedChanges.push({ kind: 'updated', id: record.id, fields });
    continue;
  }

  const possibleIndex = nextSchedules.findIndex((item) => isPotentialSameSchedule(item, record));
  if (possibleIndex !== -1) {
    const existing = nextSchedules[possibleIndex];
    matchedExistingIds.add(existing.id);
    addReviewCandidate({
      id: `uncertain-match-${record.sourceId}-${today}`,
      status: 'candidate',
      candidateType: 'uncertain_match',
      title: record.title,
      eventDate: record.startAt?.slice(0, 10) ?? null,
      sourceId: record.sourceId,
      sourceUrl: record.sourceUrl,
      sourceName: record.sourceName,
      sourceType: 'official_calendar',
      discoveredAt: today,
      existingSchedule: existing,
      proposedSchedule: record,
      dedupeKeys: record.dedupeKeys,
      reason: '公式source IDは一致しませんが、既存予定とタイトル・日付または一部source IDが近いため、同一イベントか人間が確認します。',
    });
    continue;
  }

  if (!isPrimaryScheduleSource(record)) {
    addReviewCandidate({
      id: `non-primary-${record.sourceId}-${today}`,
      status: 'candidate',
      candidateType: 'non_primary_source',
      title: record.title,
      eventDate: record.startAt?.slice(0, 10) ?? null,
      sourceId: record.sourceId,
      sourceUrl: record.sourceUrl,
      sourceName: record.sourceName,
      sourceType: record.sources?.[0]?.type ?? 'unknown',
      discoveredAt: today,
      proposedSchedule: record,
      dedupeKeys: record.dedupeKeys,
      reason: '自動反映の基準であるRESCENE公式Mnet Plusカレンダーを一次情報として確認できませんでした。',
    });
    continue;
  }

  nextSchedules.push(record);
  appliedChanges.push({ kind: 'added', id: record.id, fields: Object.keys(record) });
}

const returnedSourceIds = new Set(records.flatMap((record) => record.sourceIds));
for (const existing of schedules.filter((item) => item.autoManaged)) {
  const date = existing.startAt?.slice(0, 10);
  const disappeared = hasScheduleSourceDisappeared(
    existing,
    returnedSourceIds,
    matchedExistingIds,
    startDate,
    endDate,
  );
  if (!disappeared) continue;
  addReviewCandidate({
    id: `missing-${existing.id}-${today}`,
    status: 'candidate',
    candidateType: 'source_disappearance',
    title: existing.title,
    eventDate: date,
    sourceId: existing.sourceId,
    sourceUrl: existing.sourceUrl,
    sourceName: existing.sourceName,
    sourceType: 'official_calendar',
    discoveredAt: today,
    dedupeKeys: existing.dedupeKeys ?? [],
    reason: '公式カレンダーの収集範囲から消えました。中止・延期・削除の判断は人間が公式発表を確認します。公開データは自動削除していません。',
  });
}

nextSchedules.sort((a, b) =>
  (b.startAt ?? '').localeCompare(a.startAt ?? '') || a.id.localeCompare(b.id),
);
const publicChanged = await writeJsonIfChanged('data/schedules.json', nextSchedules);
const pendingChanged = await writeJsonIfChanged(
  'data/pending/schedules.json',
  nextPending.sort((a, b) =>
    (b.discoveredAt ?? '').localeCompare(a.discoveredAt ?? '') || a.id.localeCompare(b.id),
  ),
);
const syncChanged = await writeJsonIfChanged('data/schedule-sync.json', {
  checkedAt: today,
  source: config.mnet.calendarApi,
});
await updateDatasetDate('schedules', publicChanged);

const blockingPendingCount = nextPending.filter((item) => item.status === 'candidate').length;
const primarySourceOnly = records.every(isPrimaryScheduleSource);
const safety = scheduleSafetyDecision({
  publicChanged,
  syncChanged,
  blockingPendingCount,
  appliedChangeCount: appliedChanges.length,
  maxSafeChanges,
  primarySourceOnly,
});
const report = {
  generatedAt: today,
  source: config.mnet.calendarApi,
  primarySourceOnly,
  publicChanged,
  pendingChanged,
  syncChanged,
  appliedChangeCount: appliedChanges.length,
  addedCount: appliedChanges.filter((item) => item.kind === 'added').length,
  updatedCount: appliedChanges.filter((item) => item.kind === 'updated').length,
  maxSafeChanges,
  reviewCandidateCount: reviewCandidates.length,
  blockingPendingCount,
  appliedChanges,
  reviewCandidateTypes: [...new Set(reviewCandidates.map((item) => item.candidateType))],
  ...safety,
};
if (process.env.SCHEDULE_UPDATE_REPORT) {
  await writeFile(process.env.SCHEDULE_UPDATE_REPORT, `${JSON.stringify(report, null, 2)}\n`);
}

console.log(
  `Schedule更新: 公式 ${records.length}件、適用 ${appliedChanges.length}件、確認候補 ${reviewCandidates.length}件、公開データ変更 ${publicChanged ? 'あり' : 'なし'}、自動反映 ${report.autoMergeEligible ? '可' : '不可'}`,
);
