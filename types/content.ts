export type VerificationStatus =
  | 'confirmed'
  | 'verified'
  | 'verify_before_publish'
  | 'stage_details_verify_before_publish'
  | 'unverified';

export type Member = {
  id: string;
  displayOrder: number;
  homeOrder: number;
  stageName: string;
  stageNameKo: string;
  stageNameJa: string;
  birthDate: string | null;
  originJa: string | null;
  roleLabelJa: string | null;
  shortDescriptionJa: string | null;
  image: string | null;
  identityVerificationStatus?: VerificationStatus;
  verificationStatus: VerificationStatus;
};

export type Track = {
  title: string;
  isTitle?: boolean;
  preReleaseDate?: string;
};

export type Release = {
  id: string;
  title: string;
  releaseDate: string;
  releaseType: string;
  language: 'ko' | 'ja' | 'en';
  titleTracks: string[];
  tracks: Track[];
  scentConcept: string | null;
  descriptionJa: string;
  japanRelated: boolean;
  officialVideoUrl: string | null;
  streamingLinks: Array<{ label: string; url: string }>;
  purchaseLinks: Array<{ label: string; url: string; affiliate: boolean }>;
  verificationStatus: VerificationStatus;
  publish: boolean;
};

export type NewsArticle = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  publishedAt: string;
  updatedAt: string | null;
  eventDate: string | null;
  category: string;
  sourceType: string;
  sourceName: string;
  sourceUrl: string;
  body: Array<{ heading: string; paragraphs: string[] }>;
  relatedMembers: string[];
  relatedReleases: string[];
  affiliateDisclosure: string | null;
  correctionNote: string | null;
  verificationStatus: VerificationStatus;
};

export type Schedule = {
  id: string;
  title: string;
  startAt: string | null;
  endAt: string | null;
  timezone: 'Asia/Tokyo';
  type: string;
  region: string;
  prefecture: string | null;
  venue: string | null;
  status: string;
  applicationStartAt: string | null;
  applicationEndAt: string | null;
  saleStartAt: string | null;
  sourceUrl: string | null;
  verificationStatus: VerificationStatus;
};

export type JapanActivity = {
  id: string;
  eventDate: string;
  endDate?: string;
  type: string;
  title: string;
  prefecture: string | null;
  venue: string;
  relatedRelease: string | null;
  status: string;
  sourceUrl: string | null;
  verificationStatus: VerificationStatus;
  isFirst?: boolean;
};

export type OfficialLink = {
  id: string;
  label: string;
  url: string;
  category: string;
  kind: 'official' | 'streaming' | 'promoter' | 'retailer' | 'database' | 'unofficial';
  note?: string;
};

export type OfficialLinkRecord = {
  id: string;
  label: string;
  url: string;
  type: string;
  description: string;
  official: boolean;
};

export type StarterVideo = {
  id: string;
  order?: number;
  title: string;
  originalTitle: string;
  url: string;
  memberIds: string[];
  verificationStatus: VerificationStatus;
};

export type SearchItem = {
  id: string;
  type: 'ニュース' | 'メンバー' | '作品' | '予定' | '日本活動';
  title: string;
  description: string;
  href: string;
  date?: string;
  searchText: string;
};
