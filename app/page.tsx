import Image from 'next/image';
import Link from 'next/link';
import { formatDate, homeMembers, news, releases } from '@/lib/content';
import siteData from '@/data/site.json';

export default function HomePage() {
  const latestRelease = releases.find(
    (release) => release.id === siteData.currentHighlight.releaseId,
  ) ?? releases[0];
  const latestNews = news.slice(0, 3);
  const latestReleases = releases.slice(0, 3).reverse();

  return (
    <div className="page-shell home-page">
      <div className="home-mobile-unofficial">
        <span className="eyebrow">UNOFFICIAL — JAPANESE</span>
        <span>日本語・非公式ファンサイト</span>
      </div>

      <div className="home-intro">
        <section className="next-japan" aria-labelledby="next-japan-title">
          <div>
            <p className="eyebrow" id="next-japan-title">NEXT IN JAPAN</p>
            <p className="next-japan__title">{siteData.nextJapanSchedule.title}</p>
            <p>{siteData.nextJapanSchedule.description}</p>
          </div>
          <div className="next-japan__links">
            <time dateTime={siteData.nextJapanSchedule.checkedAt}>
              最終確認 {formatDate(siteData.nextJapanSchedule.checkedAt)}
            </time>
            <Link href="/japan/">日本活動記録 →</Link>
          </div>
        </section>

        <section className="latest-release" aria-labelledby="latest-release-title">
          <p className="eyebrow">
            LATEST RELEASE — {latestRelease.releaseType} — {formatDate(latestRelease.releaseDate)}
          </p>
          <h1 id="latest-release-title">{latestRelease.title}</h1>
          <p>{latestRelease.descriptionJa}</p>
          <div className="button-row">
            {latestRelease.officialVideoUrl && (
              <a
                className="primary-button"
                href={latestRelease.officialVideoUrl}
                target="_blank"
                rel="noreferrer noopener"
              >
                公式MVを見る <span className="sr-only">（外部サイト）</span>
              </a>
            )}
            {latestRelease.streamingLinks[0] && (
              <a
                className="secondary-button"
                href={latestRelease.streamingLinks[0].url}
                target="_blank"
                rel="noreferrer noopener"
              >
                配信で聴く <span className="sr-only">（外部サイト）</span>
              </a>
            )}
            <Link className="secondary-button" href={`/discography/${latestRelease.id}/`}>
              作品情報
            </Link>
          </div>
        </section>
      </div>

      <section className="home-news section-block" aria-labelledby="home-news-title">
        <div className="section-heading-row page-pad">
          <h2 className="section-heading" id="home-news-title">NEWS</h2>
          <Link className="text-link" href="/news/">すべての記事 →</Link>
        </div>
        <div className="home-news__filters page-pad" role="group" aria-label="ニュース分類への導線">
          <span>絞り込み</span>
          <Link href="/news/">2026</Link>
          <Link href="/news/">2025</Link>
          <Link href="/news/">2024</Link>
          <Link href="/news/">JAPAN</Link>
          <Link href="/news/">GUIDE</Link>
          <Link href="/news/">RELEASE</Link>
        </div>
        <div className="home-news__grid">
          {latestNews.map((article, index) => (
            <Link href={`/news/${article.slug}/`} key={article.id}>
              <time className={index === 0 ? 'is-latest' : undefined} dateTime={article.publishedAt}>
                {formatDate(article.publishedAt)}
              </time>
              <span className="home-news__category">
                {article.category === 'japan' ? 'JAPAN' : 'GUIDE'}
              </span>
              <span className="home-news__title">{article.title}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-members section-block" aria-labelledby="home-members-title">
        <div className="section-heading-row page-pad">
          <h2 className="section-heading" id="home-members-title">MEMBERS</h2>
          <Link className="text-link" href="/members/">5人を見る →</Link>
        </div>
        <div className="home-members__grid page-pad">
          {homeMembers.map((member) => (
            <Link className={`home-member home-member--${member.id}`} href={`/members/${member.id}/`} key={member.id}>
              {member.image && (
                <Image
                  src={member.image}
                  alt={`${member.stageName}（${member.stageNameJa}）`}
                  fill
                  sizes="(max-width: 767px) 50vw, 20vw"
                />
              )}
              <span className="home-member__shade" aria-hidden="true" />
              <span className="home-member__name">{member.stageName}</span>
            </Link>
          ))}
        </div>
        <p className="home-members__order page-pad">
          並びはキービジュアルと同じ MAY / LIV / ZENA / MINAMI / WONI
        </p>
      </section>

      <section className="home-start" aria-labelledby="home-start-title">
        <Link className="starter-guide" href="/guide/first-rescene/">
          <span className="eyebrow">START HERE</span>
          <h2 id="home-start-title">初めてのRESCENE</h2>
          <p>グループ名の意味、5人のメンバー、最初に聴く作品を短く案内します。</p>
          <span className="starter-guide__link">入門を読む →</span>
        </Link>
        <div className="home-discography">
          <div className="section-heading-row">
            <h2 className="section-heading">DISCOGRAPHY</h2>
            <Link href="/discography/">作品一覧 →</Link>
          </div>
          <div className="home-discography__grid">
            {latestReleases.map((release) => (
              <Link href={`/discography/${release.id}/`} key={release.id}>
                <span>{release.title}</span>
                <time dateTime={release.releaseDate}>{formatDate(release.releaseDate)}</time>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
