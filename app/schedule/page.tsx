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
  const upcomingCount = schedules.filter((item) =>
    ['scheduled', 'application_open', 'deadline_soon', 'details_pending', 'postponed'].includes(item.status),
  ).length;

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow={`SCHEDULE — 確認済みの今後の予定 ${upcomingCount} 件`}
        title="Schedule"
        lead="放送・公演・イベントの確認済み日程を整理します。終了したものも状態を残し、参加可否は必ず公式発表で確認してください。"
      />
      <ScheduleArchive items={schedules} />
      <p className="verification-note">終了した予定は日付と会場を残したまま日本活動記録へ蓄積します。</p>
    </div>
  );
}
