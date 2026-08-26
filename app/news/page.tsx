import NewsArchive from '@/components/NewsArchive';
import { PageHeader } from '@/components/PageHeader';
import { news } from '@/lib/content';
import { createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
  title: 'ニュース',
  description: 'RESCENEの新曲、動画、チャート、出演、日本活動など、実際に起きた出来事を出典とともに記録します。',
  path: '/news/',
});

export default function NewsPage() {
  return (
    <div className="page-shell">
      <PageHeader
        eyebrow={`NEWS — 全 ${news.length} 件`}
        title="News"
        lead="新曲、動画、チャート、出演、日本活動など、RESCENEに実際に起きた出来事を記録します。事実と当サイトの編集コメントは分けて表示します。"
      />
      <NewsArchive articles={news} />
      <div className="verification-note">記事は出典の要点を日本語で整理したもので、原文の全文転載ではありません。日本活動は年別アーカイブからも確認できます。</div>
    </div>
  );
}
