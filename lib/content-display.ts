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
  media: 'メディア',
  radio: 'ラジオ',
};
