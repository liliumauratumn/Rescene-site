import japanActivityData from '@/data/japan-activities.json';
import memberData from '@/data/members.json';
import newsData from '@/data/news.json';
import officialLinkData from '@/data/official-links.json';
import releaseData from '@/data/releases.json';
import scheduleData from '@/data/schedules.json';
import starterVideoData from '@/data/starter-videos.json';
import { categoryLabels } from '@/lib/content-display';
import type {
  JapanActivity,
  Member,
  NewsArticle,
  OfficialLink,
  OfficialLinkRecord,
  Release,
  Schedule,
  SearchItem,
  StarterVideo,
  VerificationStatus,
} from '@/types/content';

const publicVerificationStatuses = new Set<VerificationStatus>(['confirmed', 'verified']);

export const isPublicVerificationStatus = (status: VerificationStatus) =>
  publicVerificationStatuses.has(status);

const memberRecords = memberData as Member[];

export const members = memberRecords
  .filter((member) =>
    isPublicVerificationStatus(
      member.identityVerificationStatus ?? member.verificationStatus,
    ),
  )
  .map((member) =>
    isPublicVerificationStatus(member.verificationStatus)
      ? member
      : {
          ...member,
          birthDate: null,
          originJa: null,
          roleLabelJa: null,
          shortDescriptionJa: null,
          image: null,
        },
  )
  .sort((a, b) => a.displayOrder - b.displayOrder);
export const homeMembers = [...members].sort((a, b) => a.homeOrder - b.homeOrder);
export const releases = (releaseData as Release[])
  .filter(
    (release) => release.publish && isPublicVerificationStatus(release.verificationStatus),
  )
  .sort((a, b) => b.releaseDate.localeCompare(a.releaseDate));
export const news = (newsData as NewsArticle[])
  .filter((article) => isPublicVerificationStatus(article.verificationStatus))
  .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
export const schedules = (scheduleData as Schedule[])
  .filter((schedule) => isPublicVerificationStatus(schedule.verificationStatus))
  .sort((a, b) => (b.startAt ?? '').localeCompare(a.startAt ?? ''));
export const japanActivities = (japanActivityData as JapanActivity[])
  .filter((activity) => isPublicVerificationStatus(activity.verificationStatus))
  .sort((a, b) => b.eventDate.localeCompare(a.eventDate));
const officialLinkPresentation: Record<
  string,
  Pick<OfficialLink, 'category' | 'kind'>
> = {
  official_community: { category: '公式コミュニティ・SNS', kind: 'official' },
  official: { category: '所属事務所', kind: 'official' },
  official_video: { category: '公式コミュニティ・SNS', kind: 'official' },
  official_social: { category: '公式コミュニティ・SNS', kind: 'official' },
  streaming: { category: '音楽配信', kind: 'streaming' },
  retailer: { category: '日本の正規イベント・販売', kind: 'retailer' },
  promoter: { category: '日本の正規イベント・販売', kind: 'promoter' },
};

export const officialLinks = (officialLinkData as OfficialLinkRecord[]).map(
  (link): OfficialLink => ({
    id: link.id,
    label: link.label,
    url: link.url,
    category: officialLinkPresentation[link.type]?.category ?? 'その他',
    kind: officialLinkPresentation[link.type]?.kind ?? 'official',
    note: link.description,
  }),
);
export const starterVideos = (starterVideoData as StarterVideo[])
  .filter((video) => isPublicVerificationStatus(video.verificationStatus))
  .map((video, index) => ({ ...video, order: index + 1 }));

export const getMember = (id: string) => members.find((member) => member.id === id);
export const getRelease = (id: string) => releases.find((release) => release.id === id);
export const getArticle = (slug: string) => news.find((article) => article.slug === slug);

export { categoryLabels };
export { activityTypeLabels, formatDate, formatDateJa } from '@/lib/content-display';

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
    description: [member.stageNameJa, member.stageNameKo, member.roleLabelJa]
      .filter(Boolean)
      .join(' ／ '),
    href: `/members/${member.id}/`,
    searchText: [
      member.stageName,
      member.stageNameJa,
      member.stageNameKo,
      member.roleLabelJa ?? '',
      member.originJa ?? '',
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
