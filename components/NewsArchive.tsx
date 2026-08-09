'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { categoryLabels, formatDate } from '@/lib/content-display';
import type { NewsArticle } from '@/types/content';

export default function NewsArchive({ articles }: { articles: NewsArticle[] }) {
  const [category, setCategory] = useState('all');
  const [year, setYear] = useState('all');
  const [query, setQuery] = useState('');

  const categories = ['all', 'japan', 'guide', 'release', 'event'];
  const years = [...new Set(articles.map((article) => article.publishedAt.slice(0, 4)))];
  const normalizedQuery = query.normalize('NFKC').toLocaleLowerCase('ja');
  const filtered = useMemo(
    () =>
      articles.filter((article) => {
        const matchesCategory = category === 'all' || article.category === category;
        const matchesYear = year === 'all' || article.publishedAt.startsWith(year);
        const haystack = `${article.title} ${article.summary} ${article.sourceName}`
          .normalize('NFKC')
          .toLocaleLowerCase('ja');
        return matchesCategory && matchesYear && haystack.includes(normalizedQuery);
      }),
    [articles, category, normalizedQuery, year],
  );

  const categoryCount = (value: string) =>
    value === 'all'
      ? articles.length
      : articles.filter((article) => article.category === value).length;

  return (
    <>
      <div className="filter-bar" role="group" aria-label="ニュースの絞り込み">
        <span className="filter-label">CATEGORY</span>
        {categories.map((value) => (
          <button
            type="button"
            className={`filter-button ${category === value ? 'is-active' : ''}`}
            aria-pressed={category === value}
            onClick={() => setCategory(value)}
            key={value}
          >
            {value === 'all' ? 'すべて' : categoryLabels[value]} {categoryCount(value)}
          </button>
        ))}
        <span className="filter-label">YEAR</span>
        <button
          type="button"
          className={`filter-button ${year === 'all' ? 'is-active' : ''}`}
          aria-pressed={year === 'all'}
          onClick={() => setYear('all')}
        >
          全年
        </button>
        {years.map((value) => (
          <button
            type="button"
            className={`filter-button ${year === value ? 'is-active' : ''}`}
            aria-pressed={year === value}
            onClick={() => setYear(value)}
            key={value}
          >
            {value}
          </button>
        ))}
        <input
          className="filter-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="記事・人物・作品を検索"
          aria-label="ニュース内を検索"
        />
      </div>
      <p className="sr-only" aria-live="polite">{filtered.length}件の記事を表示しています</p>
      {filtered.length > 0 ? (
        <div className="news-list">
          {filtered.map((article, index) => (
            <Link className="news-row" href={`/news/${article.slug}/`} key={article.id}>
              <div className="news-row__meta">
                <time className={index === 0 ? 'is-latest' : undefined} dateTime={article.publishedAt}>
                  {formatDate(article.publishedAt)}
                </time>
                <span>{categoryLabels[article.category]}</span>
                <span>{article.sourceName}</span>
              </div>
              <div className="news-row__body">
                <h2>{article.title}</h2>
                <p>{article.summary}</p>
                {(article.relatedMembers.length > 0 || article.relatedReleases.length > 0) && (
                  <span className="news-row__related">
                    関連 {article.relatedMembers.join(' / ')} {article.relatedReleases.join(' / ')}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p className="eyebrow">RESULTS — 0</p>
          <h2>条件に一致する記事はありません</h2>
          <p>分類の件数は残しています。別の年・分類または表記でお試しください。</p>
        </div>
      )}
    </>
  );
}
