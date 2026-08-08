'use client';

import { useMemo, useState } from 'react';
import { activityTypeLabels, formatDate } from '@/lib/content';
import type { JapanActivity } from '@/types/content';

const groups = [
  { value: 'all', label: 'すべて' },
  { value: 'event', label: '来日イベント' },
  { value: 'release', label: '日本語版リリース' },
  { value: 'festival', label: 'フェス' },
  { value: 'online', label: 'オンライン' },
];

function matchesGroup(item: JapanActivity, group: string) {
  if (group === 'all') return true;
  if (group === 'event') return ['official_event', 'promotion_event'].includes(item.type);
  if (group === 'release') return item.type === 'japanese_release';
  if (group === 'festival') return item.type === 'festival';
  return item.type === 'online_event';
}

export default function JapanArchive({ items }: { items: JapanActivity[] }) {
  const [filter, setFilter] = useState('all');
  const filtered = useMemo(() => items.filter((item) => matchesGroup(item, filter)), [filter, items]);
  const years = [...new Set(filtered.map((item) => item.eventDate.slice(0, 4)))];

  return (
    <>
      <div className="filter-bar" aria-label="日本活動の絞り込み">
        {groups.map((group) => (
          <button
            className={`filter-button ${filter === group.value ? 'is-active' : ''}`}
            type="button"
            aria-pressed={filter === group.value}
            onClick={() => setFilter(group.value)}
            key={group.value}
          >
            {group.label} {items.filter((item) => matchesGroup(item, group.value)).length}
          </button>
        ))}
      </div>
      <div className="japan-timeline">
        {years.map((year) => {
          const yearItems = filtered.filter((item) => item.eventDate.startsWith(year));
          return (
            <section className="japan-year" id={`year-${year}`} key={year}>
              <div className="japan-year__heading">
                <h2>{year}</h2>
                <span>{yearItems.length} 件</span>
              </div>
              <div>
                {yearItems.map((item) => (
                  <article className="japan-row" id={item.id} key={item.id}>
                    <time dateTime={item.eventDate}>
                      {formatDate(item.eventDate).slice(5)}
                      {item.endDate && `–${formatDate(item.endDate).slice(5)}`}
                    </time>
                    <div>
                      <p className="eyebrow">{activityTypeLabels[item.type] ?? item.type}</p>
                      <h3>{item.title}</h3>
                      <p>{item.prefecture ? `${item.prefecture}・${item.venue}` : item.venue}</p>
                      {item.isFirst && <span className="first-marker">日本初の公式イベント</span>}
                      {item.verificationStatus !== 'confirmed' && (
                        <span className="pending-note">ステージ詳細は要確認</span>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
