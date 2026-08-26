'use client';

import { useMemo, useState } from 'react';
import { ExternalLink } from '@/components/ExternalLink';
import siteData from '@/data/site.json';
import { formatDate } from '@/lib/content-display';
import type { Schedule } from '@/types/content';

const statusLabels: Record<string, string> = {
  scheduled: '予定',
  application_open: '受付中',
  deadline_soon: '締切間近',
  completed: '開催済み',
  cancelled: '中止',
  postponed: '延期',
  details_pending: '詳細未発表',
  closed: '受付終了',
};

const dateTimeLabel = (value: string) => {
  const date = value.slice(0, 10).replaceAll('-', '.');
  const time = value.slice(11, 16);
  return time === '00:00' || time === '23:59' ? (time === '23:59' ? `${date} ${time}` : date) : `${date} ${time}`;
};

export default function ScheduleArchive({ items }: { items: Schedule[] }) {
  const [filter, setFilter] = useState('all');
  const filtered = useMemo(() => {
    if (filter === 'jp') return items.filter((item) => item.region === 'JP');
    if (filter === 'deadline') return items.filter((item) => item.applicationEndAt);
    return items;
  }, [filter, items]);
  const upcomingItems = filtered
    .filter((item) => ['scheduled', 'application_open', 'deadline_soon', 'details_pending', 'postponed'].includes(item.status))
    .sort((a, b) => (a.startAt ?? '').localeCompare(b.startAt ?? ''));
  const pastItems = filtered
    .filter((item) => !upcomingItems.includes(item))
    .sort((a, b) => (b.startAt ?? '').localeCompare(a.startAt ?? ''));

  const renderItems = (sectionItems: Schedule[]) => sectionItems.map((item) => (
    <article className={`schedule-row schedule-row--${item.status}`} key={item.id}>
      <div className="schedule-row__date">
        {item.startAt && (
          <time dateTime={item.startAt}>
            {formatDate(item.startAt.slice(0, 10))}
            {item.endAt && item.endAt.slice(0, 10) !== item.startAt.slice(0, 10)
              ? ` – ${formatDate(item.endAt.slice(0, 10))}`
              : ''}
          </time>
        )}
        <span className="status-badge">{statusLabels[item.status] ?? item.status}</span>
      </div>
      <div className="schedule-row__content">
        <p className="eyebrow">{item.type.replaceAll('_', ' ')}</p>
        <h3>{item.title}</h3>
        <p>{[item.prefecture, item.venue].filter(Boolean).join('・')}</p>
        {item.applicationStartAt && item.applicationEndAt && (
          <p className="schedule-row__dates">
            応募 {dateTimeLabel(item.applicationStartAt)} → {dateTimeLabel(item.applicationEndAt)}
          </p>
        )}
        {item.saleStartAt && (
          <p className="schedule-row__dates">販売開始 {dateTimeLabel(item.saleStartAt)}</p>
        )}
        {item.sourceUrl && (
          <ExternalLink href={item.sourceUrl} kind="promoter">公式・主催者情報を確認</ExternalLink>
        )}
      </div>
    </article>
  ));

  return (
    <>
      <div className="filter-bar" role="group" aria-label="スケジュールの絞り込み">
        {[
          ['all', 'すべて'],
          ['jp', '日本のみ'],
          ['deadline', '締切のみ'],
        ].map(([value, label]) => (
          <button
            className={`filter-button ${filter === value ? 'is-active' : ''}`}
            type="button"
            aria-pressed={filter === value}
            onClick={() => setFilter(value)}
            key={value}
          >
            {label}
          </button>
        ))}
        <span className="timezone-note">日本時間（JST）表記</span>
      </div>
      <section className="schedule-next" aria-labelledby="schedule-next-title">
        <div>
          <span className="status-badge">
            {siteData.nextJapanSchedule.status === 'none_announced' ? '発表なし' : '詳細未発表'}
          </span>
          <h2 id="schedule-next-title">{siteData.nextJapanSchedule.title}</h2>
        </div>
        <p>
          {siteData.nextJapanSchedule.description}
          <br />
          <time dateTime={siteData.nextJapanSchedule.checkedAt}>
            最終確認 {formatDate(siteData.nextJapanSchedule.checkedAt)}
          </time>
        </p>
      </section>
      <section className="schedule-past" aria-labelledby="schedule-past-title">
        <h2 className="section-heading" id="schedule-past-title">今後の予定</h2>
        {upcomingItems.length > 0 ? renderItems(upcomingItems) : <p>確認済みの予定はありません。</p>}
      </section>
      <section className="schedule-past" aria-labelledby="schedule-archive-title">
        <h2 className="section-heading" id="schedule-archive-title">終了した予定</h2>
        {renderItems(pastItems)}
      </section>
    </>
  );
}
