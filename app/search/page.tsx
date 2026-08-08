import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PageHeader } from '@/components/PageHeader';
import SearchClient from '@/components/SearchClient';
import { searchIndex } from '@/lib/content';
import { createMetadata } from '@/lib/metadata';

export const metadata: Metadata = {
  ...createMetadata({
    title: 'サイト内検索',
    description: 'ニュース、メンバー、作品、予定、日本活動記録を横断して検索します。',
    path: '/search/',
  }),
  robots: { index: false, follow: true },
};

export default function SearchPage() {
  return (
    <div className="page-shell">
      <PageHeader eyebrow="SEARCH" title="Search" lead="人物・記事・作品・予定・日本活動を横断して探します。" />
      <Suspense fallback={<div className="empty-state"><span className="sr-only">読み込み中</span></div>}>
        <SearchClient items={searchIndex} />
      </Suspense>
    </div>
  );
}
