import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ExternalLink } from '@/components/ExternalLink';
import { JsonLd } from '@/components/JsonLd';
import { Breadcrumbs } from '@/components/PageHeader';
import { formatDate, formatDateJa, getRelease, japanActivities, news, releases } from '@/lib/content';
import { createMetadata } from '@/lib/metadata';
import { absoluteUrl } from '@/site.config';

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return releases.map((release) => ({ slug: release.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const release = getRelease(slug);
  if (!release) return {};
  return createMetadata({
    title: release.title,
    description: `${release.title}（${formatDateJa(release.releaseDate)}）の収録曲、タイトル曲、香りのコンセプト、公式リンク。`,
    path: `/discography/${release.id}/`,
  });
}

export default async function ReleaseDetailPage({ params }: Props) {
  const { slug } = await params;
  const release = getRelease(slug);
  if (!release) notFound();
  const relatedActivities = japanActivities.filter((item) => item.relatedRelease === release.id);
  const relatedNews = news.filter((article) => article.relatedReleases.includes(release.id));
  const albumSchema = {
    '@context': 'https://schema.org',
    '@type': 'MusicAlbum',
    name: release.title,
    datePublished: release.releaseDate,
    url: absoluteUrl(`/discography/${release.id}/`),
    byArtist: { '@type': 'MusicGroup', name: 'RESCENE' },
    numTracks: release.tracks.length,
    track: release.tracks.map((track, index) => ({
      '@type': 'MusicRecording',
      position: index + 1,
      name: track.title,
    })),
  };

  return (
    <div className="page-shell">
      <JsonLd data={albumSchema} />
      <Breadcrumbs items={[{ label: 'DISCOGRAPHY', href: '/discography/' }, { label: release.title }]} />
      <header className="release-detail-hero content-pad">
        <p className="eyebrow">{release.releaseType} — {formatDate(release.releaseDate)} — 全{release.tracks.length}曲</p>
        <h1>{release.title}</h1>
        <p>{release.descriptionJa}</p>
        {(release.officialVideoUrl || release.streamingLinks.length > 0) && (
          <div className="button-row">
            {release.officialVideoUrl && <a className="primary-button" href={release.officialVideoUrl} target="_blank" rel="noreferrer noopener">公式情報を見る <span className="sr-only">（外部サイト）</span></a>}
            {release.streamingLinks[0] && <a className="secondary-button" href={release.streamingLinks[0].url} target="_blank" rel="noreferrer noopener">配信で聴く <span className="sr-only">（外部サイト）</span></a>}
          </div>
        )}
      </header>
      <section className="track-list" aria-labelledby="track-list-title">
        <div className="track-list__head"><h2 id="track-list-title">収録曲</h2><span>TRACK LIST</span></div>
        <ol>
          {release.tracks.map((track, index) => (
            <li key={`${track.title}-${index}`}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{track.title}</strong>
              <span>{track.isTitle ? 'タイトル曲' : ''}{track.preReleaseDate ? `　先行 ${formatDate(track.preReleaseDate)}` : ''}</span>
            </li>
          ))}
        </ol>
        <p>歌詞および歌詞の翻訳は掲載しません。曲名表記は提供済み資料の表記に従います。</p>
      </section>
      <section className="release-info content-pad" aria-labelledby="release-info-title">
        <h2 className="section-heading" id="release-info-title">作品情報</h2>
        <dl>
          <div><dt>発売日</dt><dd>{formatDateJa(release.releaseDate)}</dd></div>
          <div><dt>形態</dt><dd>{release.releaseType}</dd></div>
          {release.scentConcept && <div><dt>香り</dt><dd>{release.scentConcept}</dd></div>}
          <div><dt>言語</dt><dd>{release.language === 'ja' ? '日本語' : release.language === 'en' ? '英語' : '韓国語'}</dd></div>
        </dl>
      </section>
      {relatedActivities.length > 0 && (
        <section className="related-section content-pad">
          <h2 className="section-heading">日本での動き</h2>
          {relatedActivities.map((activity) => (
            <Link className="related-row" href={`/japan/#${activity.id}`} key={activity.id}>
              <time dateTime={activity.eventDate}>{formatDate(activity.eventDate)}</time><span>{activity.title}　{activity.prefecture ? `${activity.prefecture}・` : ''}{activity.venue}</span>
            </Link>
          ))}
        </section>
      )}
      {(release.officialVideoUrl || release.streamingLinks.length > 0) && (
        <section className="listening-links content-pad">
          <h2 className="section-heading">公式・正規配信</h2>
          <div>
            {release.officialVideoUrl && <ExternalLink href={release.officialVideoUrl}>公式作品情報</ExternalLink>}
            {release.streamingLinks.map((link) => <ExternalLink href={link.url} kind="streaming" key={link.url}>{link.label}</ExternalLink>)}
          </div>
        </section>
      )}
      {release.purchaseLinks.length > 0 && (
        <section className="purchase-links content-pad">
          <h2 className="section-heading">販売</h2>
          {release.purchaseLinks.some((link) => link.affiliate) && <p>以下の販売リンクにはアフィリエイトを含みます。</p>}
          {release.purchaseLinks.map((link) => <ExternalLink href={link.url} kind="shop" key={link.url}>{link.label}</ExternalLink>)}
        </section>
      )}
      {relatedNews.length > 0 && (
        <section className="related-section content-pad">
          <h2 className="section-heading">関連ニュース</h2>
          {relatedNews.map((article) => <Link className="related-row" href={`/news/${article.slug}/`} key={article.id}><time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time><span>{article.title}</span></Link>)}
        </section>
      )}
      <div className="back-row page-pad"><Link className="text-link" href="/discography/">← 作品一覧へ戻る</Link></div>
    </div>
  );
}
