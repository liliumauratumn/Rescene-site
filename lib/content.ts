import japanActivityData from '@/data/japan-activities.json';
import memberData from '@/data/members.json';
import newsData from '@/data/news.json';
import officialLinkData from '@/data/official-links.json';
import releaseData from '@/data/releases.json';
import scheduleData from '@/data/schedules.json';
import type {
  JapanActivity,
  Member,
  NewsArticle,
  OfficialLink,
  Release,
  Schedule,
  SearchItem,
} from '@/types/content';

export const members = (memberData as Member[]).sort(
  (a, b) => a.displayOrder - b.displayOrder,
);
export const homeMembers = [...members].sort((a, b) => a.homeOrder - b.homeOrder);
export const releases = (releaseData as Release[])
  .filter((release) => release.publish)
  .sort((a, b) => b.releaseDate.localeCompare(a.releaseDate));
export const news = (newsData as NewsArticle[]).sort((a, b) =>
  b.publishedAt.localeCompare(a.publishedAt),
);
export const schedules = (scheduleData as Schedule[]).sort((a, b) =>
  (b.startAt ?? '').localeCompare(a.startAt ?? ''),
);
export const japanActivities = (japanActivityData as JapanActivity[]).sort((a, b) =>
  b.eventDate.localeCompare(a.eventDate),
);
export const officialLinks = officialLinkData as OfficialLink[];

export const getMember = (id: string) => members.find((member) => member.id === id);
export const getRelease = (id: string) => releases.find((release) => release.id === id);
export const getArticle = (slug: string) => news.find((article) => article.slug === slug);

export const formatDate = (date: string) => date.replaceAll('-', '.');

export const formatDateJa = (date: string) => {
  const [year, month, day] = date.slice(0, 10).split('-');
  return `${Number(year)}年${Number(month)}月${Number(day)}日`;
};

export const categoryLabels: Record<string, string> = {
  guide: '入門',
  japan: '日本活動',
  release: 'リリース',
  event: '公演・イベント',
  media: 'メディア',
  official: '公式告知',
  record: '記録',
  other: 'その他',
};

export const activityTypeLabels: Record<string, string> = {
  japanese_release: '日本語版リリース',
  official_event: '来日イベント',
  promotion_event: '来日イベント',
  online_event: 'オンライン',
  festival: 'フェス',
};

export const searchIndex: SearchItem[] = [
  ...news.map((article) => ({
    id: `news-${article.id}`,
    type: 'ニュース' as const,
    title: article.title,
    description: article.summary,
    href: `/news/${article.slug}/`,
    date: article.publishedAt,
    searchText: [article.title, article.summary, categoryLabels[article.category]].join(' '),
  })),
  ...members.map((member) => ({
    id: `member-${member.id}`,
    type: 'メンバー' as const,
    title: member.stageName,
    description: `${member.stageNameJa} ／ ${member.stageNameKo} ／ ${member.roleLabelJa}`,
    href: `/members/${member.id}/`,
    searchText: [
      member.stageName,
      member.stageNameJa,
      member.stageNameKo,
      member.roleLabelJa,
      member.originJa,
    ].join(' '),
  })),
  ...releases.map((release) => ({
    id: `release-${release.id}`,
    type: '作品' as const,
    title: release.title,
    description: `${release.releaseType} ／ ${release.titleTracks.join(' ／ ')}`,
    href: `/discography/${release.id}/`,
    date: release.releaseDate,
    searchText: [
      release.title,
      release.releaseType,
      ...release.titleTracks,
      ...release.tracks.map((track) => track.title),
      release.scentConcept ?? '',
    ].join(' '),
  })),
  ...schedules.map((schedule) => ({
    id: `schedule-${schedule.id}`,
    type: '予定' as const,
    title: schedule.title,
    description: [schedule.prefecture, schedule.venue, schedule.status].filter(Boolean).join(' ／ '),
    href: '/schedule/',
    date: schedule.startAt?.slice(0, 10),
    searchText: [schedule.title, schedule.prefecture ?? '', schedule.venue ?? ''].join(' '),
  })),
  ...japanActivities.map((activity) => ({
    id: `japan-${activity.id}`,
    type: '日本活動' as const,
    title: activity.title,
    description: [activity.prefecture, activity.venue].filter(Boolean).join('・'),
    href: `/japan/#${activity.id}`,
    date: activity.eventDate,
    searchText: [activity.title, activity.prefecture ?? '', activity.venue].join(' '),
  })),
];
