import { normalizeText } from './content-utils.mjs';

const withoutVerificationDates = (record) => ({
  ...record,
  verifiedAt: undefined,
  sources: record.sources?.map((source) => ({ ...source, verifiedAt: undefined })),
});

export const changedScheduleFields = (before, after) => {
  const left = withoutVerificationDates(before);
  const right = withoutVerificationDates(after);
  return [...new Set([...Object.keys(left), ...Object.keys(right)])]
    .filter((field) => JSON.stringify(left[field]) !== JSON.stringify(right[field]));
};

export const isPrimaryScheduleSource = (record) => {
  try {
    return record.sources?.[0]?.type === 'official_calendar' &&
      new URL(record.sourceUrl).hostname === 'artist.mnetplus.world';
  } catch {
    return false;
  }
};

export const matchedScheduleReviewReason = (before, after) => {
  const fields = changedScheduleFields(before, after);
  if (fields.some((field) => ['startAt', 'endAt', 'allDay', 'sourceIds'].includes(field))) {
    return { type: 'date_change', fields };
  }
  if (!isPrimaryScheduleSource(after)) return { type: 'non_primary_source', fields };
  return null;
};

export const isAbnormalScheduleChangeCount = (count, limit) => count > limit;

export const isPotentialSameSchedule = (existing, proposed) => {
  const existingIds = existing.sourceIds ?? (existing.sourceId ? [existing.sourceId] : []);
  const proposedIds = proposed.sourceIds ?? (proposed.sourceId ? [proposed.sourceId] : []);
  if (existingIds.some((id) => proposedIds.includes(id))) return true;
  const leftDate = existing.startAt?.slice(0, 10);
  const rightDate = proposed.startAt?.slice(0, 10);
  if (!leftDate || !rightDate) return false;
  const days = Math.abs(
    (new Date(`${leftDate}T00:00:00+09:00`).getTime() -
      new Date(`${rightDate}T00:00:00+09:00`).getTime()) /
      86_400_000,
  );
  return normalizeText(existing.originalTitle ?? existing.title) ===
    normalizeText(proposed.originalTitle ?? proposed.title) && days <= 7;
};

export const hasScheduleSourceDisappeared = (
  existing,
  returnedSourceIds,
  matchedExistingIds,
  startDate,
  endDate,
) => {
  const date = existing.startAt?.slice(0, 10);
  if (!date || date < startDate || date > endDate || matchedExistingIds.has(existing.id)) {
    return false;
  }
  const sourceIds = existing.sourceIds ?? (existing.sourceId ? [existing.sourceId] : []);
  return sourceIds.length > 0 && !sourceIds.some((id) => returnedSourceIds.has(id));
};

export const scheduleSafetyDecision = ({
  publicChanged,
  syncChanged,
  blockingPendingCount,
  appliedChangeCount,
  maxSafeChanges,
  primarySourceOnly,
}) => {
  const unsafeReasons = [
    ...(blockingPendingCount > 0 ? [`未解決の確認候補 ${blockingPendingCount}件`] : []),
    ...(isAbnormalScheduleChangeCount(appliedChangeCount, maxSafeChanges)
      ? [`一度の公開変更 ${appliedChangeCount}件が上限 ${maxSafeChanges}件を超過`]
      : []),
    ...(!primarySourceOnly ? ['一次情報ではないsourceを検出'] : []),
    ...(publicChanged && appliedChangeCount === 0 ? ['分類されていない公開データ変更'] : []),
  ];
  return {
    unsafeReasons,
    requiresReview: unsafeReasons.length > 0,
    autoMergeEligible: (publicChanged || syncChanged) && unsafeReasons.length === 0,
  };
};
