import assert from 'node:assert/strict';
import {
  hasScheduleSourceDisappeared,
  isAbnormalScheduleChangeCount,
  isPotentialSameSchedule,
  isPrimaryScheduleSource,
  matchedScheduleReviewReason,
  scheduleSafetyDecision,
} from './lib/schedule-safety.mjs';

const base = {
  id: 'mnet-calendar-event-1',
  title: '公式イベント',
  startAt: '2026-09-01T19:00:00+09:00',
  endAt: null,
  allDay: false,
  sourceIds: ['event-1'],
  sourceUrl: 'https://artist.mnetplus.world/main/stg/rescene-official/schedule/2026/09?eventId=event-1',
  sources: [
    {
      label: 'RESCENE公式スケジュール',
      url: 'https://artist.mnetplus.world/main/stg/rescene-official/schedule/2026/09?eventId=event-1',
      type: 'official_calendar',
      verifiedAt: '2026-08-26',
    },
  ],
  verifiedAt: '2026-08-26',
};

assert.equal(isPrimaryScheduleSource(base), true);
assert.equal(matchedScheduleReviewReason(base, { ...base, status: 'completed' }), null);
assert.equal(
  matchedScheduleReviewReason(base, { ...base, startAt: '2026-09-02T19:00:00+09:00' })?.type,
  'date_change',
);
assert.equal(
  matchedScheduleReviewReason(base, {
    ...base,
    sourceUrl: 'https://example.com/event-1',
    sources: [{ ...base.sources[0], url: 'https://example.com/event-1', type: 'news_report' }],
  })?.type,
  'non_primary_source',
);
assert.equal(isAbnormalScheduleChangeCount(5, 5), false);
assert.equal(isAbnormalScheduleChangeCount(6, 5), true);
assert.equal(
  isPotentialSameSchedule(base, {
    ...base,
    id: 'mnet-calendar-event-2',
    sourceId: 'event-2',
    sourceIds: ['event-2'],
    startAt: '2026-09-03T19:00:00+09:00',
  }),
  true,
);
assert.equal(
  hasScheduleSourceDisappeared(
    { ...base, autoManaged: true, sourceId: 'event-1' },
    new Set(),
    new Set(),
    '2026-08-01',
    '2026-12-01',
  ),
  true,
);
assert.equal(
  scheduleSafetyDecision({
    publicChanged: true,
    syncChanged: false,
    blockingPendingCount: 0,
    appliedChangeCount: 3,
    maxSafeChanges: 5,
    primarySourceOnly: true,
  }).autoMergeEligible,
  true,
);
for (const unsafe of [
  { publicChanged: true, syncChanged: false, blockingPendingCount: 1, appliedChangeCount: 1, maxSafeChanges: 5, primarySourceOnly: true },
  { publicChanged: true, syncChanged: false, blockingPendingCount: 0, appliedChangeCount: 6, maxSafeChanges: 5, primarySourceOnly: true },
  { publicChanged: true, syncChanged: false, blockingPendingCount: 0, appliedChangeCount: 1, maxSafeChanges: 5, primarySourceOnly: false },
  { publicChanged: true, syncChanged: false, blockingPendingCount: 0, appliedChangeCount: 0, maxSafeChanges: 5, primarySourceOnly: true },
]) {
  assert.equal(scheduleSafetyDecision(unsafe).autoMergeEligible, false);
  assert.equal(scheduleSafetyDecision(unsafe).requiresReview, true);
}
assert.equal(
  scheduleSafetyDecision({
    publicChanged: false,
    syncChanged: true,
    blockingPendingCount: 0,
    appliedChangeCount: 0,
    maxSafeChanges: 5,
    primarySourceOnly: true,
  }).autoMergeEligible,
  true,
);

console.log('Schedule安全判定テストOK');
