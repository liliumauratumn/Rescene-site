import { PageHeader } from '@/components/PageHeader';
import ScheduleArchive from '@/components/ScheduleArchive';
import { schedules } from '@/lib/content';
import { createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
  title: 'スケジュール',
  description: 'RESCENEの日本関連予定、応募締切、販売開始、開催日時を日本時間で整理します。',
  path: '/schedule/',
});

export default function SchedulePage() {
  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="SCHEDULE — 受付中の予定 0 件"
        title="Schedule"
        lead="応募・販売・開催はそれぞれ別の日付で動きます。終了したものも状態を残し、参加可否は必ず公式発表で確認してください。"
      />
      <ScheduleArchive items={schedules} />
      <p className="verification-note">終了した予定は日付と会場を残したまま日本活動記録へ蓄積します。</p>
    </div>
  );
}
