'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { formatDate } from '@/lib/content-display';
import type { Release } from '@/types/content';

const filters = [
  { value: 'all', label: '発売順' },
  { value: 'ko', label: '韓国リリース' },
  { value: 'ja', label: '日本語版' },
  { value: 'en', label: '英語版' },
  { value: 'title', label: 'タイトル曲のみ' },
];

export default function ReleaseArchive({ items }: { items: Release[] }) {
  const [filter, setFilter] = useState('all');
  const filtered = useMemo(() => {
    if (filter === 'all' || filter === 'title') return items;
    return items.filter((release) => release.language === filter);
  }, [filter, items]);

  return (
    <>
      <div className="filter-bar" role="group" aria-label="作品の絞り込み">
        {filters.map((item) => (
          <button
            className={`filter-button ${filter === item.value ? 'is-active' : ''}`}
            type="button"
            aria-pressed={filter === item.value}
            onClick={() => setFilter(item.value)}
            key={item.value}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="release-table">
        <div className="release-table__head" aria-hidden="true">
          <span>DATE</span>
          <span>TITLE</span>
          <span>TYPE</span>
          <span>TITLE TRACK</span>
          <span>SCENT</span>
        </div>
        {filtered.map((release) => (
          <Link className="release-row" href={`/discography/${release.id}/`} key={release.id}>
            <time dateTime={release.releaseDate}>{formatDate(release.releaseDate)}</time>
            <span className="release-row__title">
              {release.title}
              {release.tracks.length > 1 && <small>全{release.tracks.length}曲</small>}
            </span>
            <span>{release.releaseType}</span>
            <span>{release.titleTracks.join(' ／ ')}</span>
            <span>{release.scentConcept ?? '—'}</span>
          </Link>
        ))}
      </div>
    </>
  );
}
