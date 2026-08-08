import NewsArchive from '@/components/NewsArchive';
import { PageHeader } from '@/components/PageHeader';
import { news } from '@/lib/content';
import { createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
  title: 'ニュース',
  description: 'RESCENEの公式発表を日本語で要約し、出典とともに記録します。',
  path: '/news/',
});

export default function NewsPage() {
  return (
    <div className="page-shell">
      <PageHeader
        eyebrow={`NEWS — 全 ${news.length} 件`}
        title="News"
        lead="公式発表を日本語で要約し、出典とともに記録します。要約は全文転載ではありません。"
      />
      <NewsArchive articles={news} />
      <div className="verification-note">これ以上の記事はありません。日本活動は年別アーカイブからも確認できます。</div>
    </div>
  );
}
