import assert from 'node:assert/strict';
import { deriveNextJapanSchedule } from '../lib/next-japan.ts';

const checkedAt = '2026-08-26';
const noSchedule = deriveNextJapanSchedule([], checkedAt);
assert.equal(noSchedule.scheduleId, null);
assert.equal(noSchedule.checkedAt, checkedAt);
assert.match(noSchedule.description, /2026年8月26日時点/);

const nextSchedule = deriveNextJapanSchedule([
  {
    id: 'kr-event',
    title: '韓国イベント',
    startAt: '2026-09-01T19:00:00+09:00',
    region: 'KR',
    status: 'scheduled',
  },
  {
    id: 'jp-completed',
    title: '終了した日本イベント',
    startAt: '2026-08-01T19:00:00+09:00',
    region: 'JP',
    status: 'completed',
  },
  {
    id: 'jp-next',
    title: 'RESCENE 日本イベント',
    startAt: '2026-10-12T18:00:00+09:00',
    allDay: false,
    region: 'JP',
    prefecture: '東京都',
    venue: '東京会場',
    status: 'scheduled',
  },
], checkedAt);

assert.equal(nextSchedule.scheduleId, 'jp-next');
assert.equal(nextSchedule.title, 'RESCENE 日本イベント');
assert.equal(nextSchedule.statusLabel, '予定');
assert.match(nextSchedule.description, /2026年10月12日 18:00/);
assert.match(nextSchedule.description, /東京都・東京会場/);

console.log('NEXT IN JAPAN算出テストOK');
