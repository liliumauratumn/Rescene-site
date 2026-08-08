'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { formatDate } from '@/lib/content-display';
import type { SearchItem } from '@/types/content';

export default function SearchClient({ items }: { items: SearchItem[] }) {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [type, setType] = useState('すべて');
  const normalized = query.trim().normalize('NFKC').toLocaleLowerCase('ja');
  const results = useMemo(
    () =>
      normalized
        ? items.filter((item) => {
            const matchesType = type === 'すべて' || item.type === type;
            return matchesType && item.searchText.normalize('NFKC').toLocaleLowerCase('ja').includes(normalized);
          })
        : [],
    [items, normalized, type],
  );
  const types = ['すべて', 'ニュース', 'メンバー', '作品', '予定', '日本活動'];

  return (
    <>
      <form className="site-search-form" action="/search/" method="get" role="search">
        <label htmlFor="site-search-input">記事・人物・作品・予定を横断して検索</label>
        <div>
          <input
            id="site-search-input"
            name="q"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape' && !event.nativeEvent.isComposing) setQuery('');
            }}
            placeholder="例：lip bomb、ミナミ、원이"
          />
          <button type="submit">検索</button>
        </div>
      </form>
      <div className="filter-bar" aria-label="検索対象の絞り込み">
        {types.map((value) => (
          <button
            type="button"
            className={`filter-button ${type === value ? 'is-active' : ''}`}
            aria-pressed={type === value}
            onClick={() => setType(value)}
            key={value}
          >
            {value} {value === 'すべて' ? results.length : results.filter((item) => item.type === value).length}
          </button>
        ))}
      </div>
      <p className="sr-only" aria-live="polite">{results.length}件の検索結果</p>
      {!normalized ? (
        <div className="empty-state">
          <p className="eyebrow">SEARCH</p>
          <h2>検索語を入力してください</h2>
          <p>日本語・ローマ字・ハングルのいずれでも検索できます。</p>
        </div>
      ) : results.length > 0 ? (
        <div className="search-results">
          {results.map((item) => (
            <Link href={item.href} key={item.id}>
              <span className="eyebrow">{item.type}</span>
              <h2>{item.title}</h2>
              <p>{item.description}</p>
              {item.date && <time dateTime={item.date}>{formatDate(item.date)}</time>}
            </Link>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p className="eyebrow">RESULTS — 0</p>
          <h2>「{query}」に一致する記録はありません</h2>
          <p>日本語表記・ローマ字・ハングルのいずれでも検索できます。</p>
          <div className="button-row">
            <Link className="secondary-button" href="/japan/">日本活動記録を見る</Link>
            <Link className="secondary-button" href="/discography/">作品一覧から探す</Link>
            <Link className="secondary-button" href="/guide/first-rescene/">初めてのRESCENE</Link>
          </div>
        </div>
      )}
    </>
  );
}
