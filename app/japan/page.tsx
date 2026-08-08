import JapanArchive from '@/components/JapanArchive';
import { PageHeader } from '@/components/PageHeader';
import { japanActivities } from '@/lib/content';
import { createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
  title: '日本活動記録',
  description: 'RESCENEの来日イベント、日本語版リリース、フェス、オンライン企画を年別に記録します。',
  path: '/japan/',
});

export default function JapanPage() {
  const years = japanActivities.map((item) => Number(item.eventDate.slice(0, 4)));
  return (
    <div className="page-shell">
      <PageHeader
        eyebrow={`JAPAN ARCHIVE — ${japanActivities.length} 件 ／ ${Math.min(...years)}–${Math.max(...years)}`}
        title="Japan Archive"
        lead="来日イベント、日本語版リリース、フェス出演、オンライン企画を年別に記録する恒久アーカイブです。"
      />
      <JapanArchive items={japanActivities} />
    </div>
  );
}
