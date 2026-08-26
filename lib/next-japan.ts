import type { Schedule } from '@/types/content';

const upcomingStatuses = new Set([
  'scheduled',
  'application_open',
  'deadline_soon',
  'details_pending',
  'postponed',
]);

const statusLabels: Record<string, string> = {
  scheduled: '予定',
  application_open: '受付中',
  deadline_soon: '締切間近',
  details_pending: '詳細未発表',
  postponed: '延期',
};

const formatDateJa = (date: string) => {
  const [year, month, day] = date.split('-');
  return `${Number(year)}年${Number(month)}月${Number(day)}日`;
};

export type NextJapanSchedule = {
  status: string;
  statusLabel: string;
  title: string;
  description: string;
  checkedAt: string;
  scheduleId: string | null;
};

export const deriveNextJapanSchedule = (
  schedules: Schedule[],
  checkedAt: string,
): NextJapanSchedule => {
  const nextSchedule = schedules
    .filter((item) =>
      item.region === 'JP' &&
      item.startAt !== null &&
      item.startAt.slice(0, 10) >= checkedAt &&
      upcomingStatuses.has(item.status),
    )
    .sort((a, b) =>
      (a.startAt ?? '').localeCompare(b.startAt ?? '') || a.id.localeCompare(b.id),
    )[0];

  if (!nextSchedule?.startAt) {
    return {
      status: 'none_announced',
      statusLabel: '発表なし',
      title: '現在、確認済みの次回日本予定はありません',
      description: `${formatDateJa(checkedAt)}時点で、確認した公式・主催者情報では次回の日本予定を確認できていません。新しい公式発表を確認後に更新します。`,
      checkedAt,
      scheduleId: null,
    };
  }

  const date = nextSchedule.startAt.slice(0, 10);
  const time = nextSchedule.allDay ? '' : nextSchedule.startAt.slice(11, 16);
  const dateTime = `${formatDateJa(date)}${time ? ` ${time}` : ''}`;
  const location = [nextSchedule.prefecture, nextSchedule.venue].filter(Boolean).join('・');
  const occurrence = location ? `${dateTime}、${location}で` : `${dateTime}に`;

  return {
    status: nextSchedule.status,
    statusLabel: statusLabels[nextSchedule.status] ?? nextSchedule.status,
    title: nextSchedule.title,
    description: `${occurrence}予定されています。最新情報は公式発表で確認してください。`,
    checkedAt,
    scheduleId: nextSchedule.id,
  };
};
