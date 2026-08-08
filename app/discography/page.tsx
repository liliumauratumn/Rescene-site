import { PageHeader } from '@/components/PageHeader';
import ReleaseArchive from '@/components/ReleaseArchive';
import { releases } from '@/lib/content';
import { createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
  title: 'ディスコグラフィー',
  description: 'RESCENEの作品を発売日、種別、タイトル曲、香りのコンセプトで記録します。',
  path: '/discography/',
});

export default function DiscographyPage() {
  const years = releases.map((release) => release.releaseDate.slice(0, 4));
  return (
    <div className="page-shell">
      <PageHeader
        eyebrow={`DISCOGRAPHY — ${releases.length} 作品 ／ ${Math.min(...years.map(Number))}–${Math.max(...years.map(Number))}`}
        title="Discography"
        lead="作品名は公式表記を保ち、発売日・タイトル曲・香りの軸を作品データから表示します。"
      />
      <ReleaseArchive items={releases} />
    </div>
  );
}
