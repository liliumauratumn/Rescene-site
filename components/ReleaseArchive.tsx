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
      <div className="filter-bar" aria-label="作品の絞り込み">
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
      <div className="release-table" role="table" aria-label="作品一覧">
        <div className="release-table__head" role="row">
          <span role="columnheader">DATE</span>
          <span role="columnheader">TITLE</span>
          <span role="columnheader">TYPE</span>
          <span role="columnheader">TITLE TRACK</span>
          <span role="columnheader">SCENT</span>
        </div>
        {filtered.map((release) => (
          <Link className="release-row" href={`/discography/${release.id}/`} role="row" key={release.id}>
            <time role="cell" dateTime={release.releaseDate}>{formatDate(release.releaseDate)}</time>
            <span className="release-row__title" role="cell">
              {release.title}
              {release.tracks.length > 1 && <small>全{release.tracks.length}曲</small>}
            </span>
            <span role="cell">{release.releaseType}</span>
            <span role="cell">{release.titleTracks.join(' ／ ')}</span>
            <span role="cell">{release.scentConcept ?? '—'}</span>
          </Link>
        ))}
      </div>
    </>
  );
}
