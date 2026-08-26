import Image from 'next/image';
import Link from 'next/link';
import { StarterVideoList } from '@/components/StarterVideoList';
import editorialData from '@/data/editorial.json';
import {
  categoryLabels,
  formatDate,
  homeMembers,
  news,
  nextJapanSchedule,
  releases,
  starterVideos,
} from '@/lib/content';
import { getTmiItems } from '@/lib/tmi';

const archiveLinks = [
  {
    href: '/discography/',
    label: 'DISCOGRAPHY',
    description: '20作品を発売順・形態・タイトル曲からたどる',
  },
  {
    href: '/members/',
    label: 'MEMBERS',
    description: '5人の基本プロフィールと関連作品を確認する',
  },
  {
    href: '/japan/',
    label: 'JAPAN ARCHIVE',
    description: '23件の日本活動を年別に掘る',
  },
  {
    href: '/schedule/',
    label: 'SCHEDULE',
    description: '確認済みの予定と終了した記録を見る',
  },
];

export default function HomePage() {
  const latestNews = news.slice(0, 3);
  const topTmi = getTmiItems().slice(0, 3);
  const loveAttack = releases.find((release) => release.id === 'scenedrome');

  return (
    <div className="page-shell home-page">
      <div className="home-mobile-unofficial">
        <span className="eyebrow">UNOFFICIAL — JAPANESE</span>
        <span>日本語・非公式ファンサイト</span>
      </div>

      <section className="home-tmi section-block" aria-labelledby="home-tmi-title">
        <div className="section-heading-row page-pad">
          <h2 className="section-heading section-heading--large" id="home-tmi-title">TMI</h2>
          <Link className="text-link" href="/tmi/">ALL →</Link>
        </div>
        {topTmi.length > 0 && (
          <ol className="home-tmi__list">
            {topTmi.map((item, itemIndex) => (
              <li className="home-tmi__item" key={itemIndex}>
                {item.text && <p>{item.text}</p>}
                {item.urls.length > 0 && (
                  <div className="home-tmi__sources">
                    {item.urls.map((url, urlIndex) => (
                      <a
                        className="tmi-source-link"
                        href={url}
                        target="_blank"
                        rel="noreferrer noopener"
                        aria-label={`SOURCE ${urlIndex + 1}（外部サイト）`}
                        key={urlIndex}
                      >
                        SOURCE ↗
                      </a>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="home-story-hero" aria-labelledby="home-story-title">
        <p className="eyebrow">WHY RESCENE NOW — 2026</p>
        <h1 id="home-story-title">
          2026年、RESCENEの
          <br />
          <span>過去まで</span>動き始めた。
        </h1>
        <div className="home-story-hero__footer">
          <p>
            新曲だけでなく、2年前の曲、過去の映像、5人そのものまで。
            いま同時に見つかり直しています。
          </p>
          <Link className="text-link" href="#why-now">
            2026年の入口を見る ↓
          </Link>
        </div>
      </section>

      <section className="why-now section-block" id="why-now" aria-labelledby="why-now-title">
        <div className="why-now__intro page-pad">
          <div>
            <p className="eyebrow">WHY RESCENE NOW?</p>
            <h2 id="why-now-title">新しく発見された、だけではない。</h2>
          </div>
          <p>
            2026年、RESCENEは新しく発見されたというより、
            過去までまとめて発見され直しています。
          </p>
        </div>
        <ol className="why-flow">
          {editorialData.whyNow.map((item, index) => (
            <li key={item.label}>
              <span className="why-flow__number">{item.label}</span>
              <strong>{item.title}</strong>
              <p>{item.description}</p>
              {index < editorialData.whyNow.length - 1 && (
                <span className="why-flow__arrow" aria-hidden="true">↓</span>
              )}
            </li>
          ))}
        </ol>
      </section>

      <section className="woni-minami section-block" aria-labelledby="woni-minami-title">
        <div className="woni-minami__intro page-pad">
          <div>
            <p className="eyebrow">MINAMI × WONI — GEOJE YAHO</p>
            <h2 id="woni-minami-title">千葉のMINAMIが、巨済のWONIに「ヤッホー」。</h2>
          </div>
          <p>
            「巨済ヤッホー」と言ったのはMINAMI。
            巨済出身のWONIが掛け合いと地域の文脈をつくり、2人の動画が現在の入口になりました。
          </p>
        </div>
        <div className="woni-minami__videos page-pad">
          <StarterVideoList videos={starterVideos} tone="dark" />
          <p className="starter-video-note starter-video-note--dark">
            公式に確認した再生ページだけを案内しています。動画は埋め込まず、再生回数も固定表示しません。
          </p>
        </div>
      </section>

      <section className="love-attack-story" aria-labelledby="love-attack-title">
        <div className="love-attack-story__copy">
          <p className="eyebrow">LOVE ATTACK — 2024 → 2026</p>
          <h2 id="love-attack-title">2024年の曲が、2026年に見つかり直した。</h2>
          <p>
            「LOVE ATTACK」は2024年8月発売の『SCENEDROME』収録曲。
            約2年後の2026年7月26日、SBS『人気歌謡』で1位を獲得しました。
          </p>
          <div className="button-row">
            <Link className="primary-button" href="/discography/scenedrome/">
              SCENEDROMEを掘る
            </Link>
            {loveAttack?.officialVideoUrl && (
              <a
                className="secondary-button"
                href={loveAttack.officialVideoUrl}
                target="_blank"
                rel="noreferrer noopener"
              >
                公式MVを見る <span className="sr-only">（外部サイト）</span>
              </a>
            )}
          </div>
        </div>
        <div className="love-attack-story__timeline" aria-label="LOVE ATTACKの再発見">
          <div>
            <time dateTime="2024-08-27">2024.08</time>
            <strong>SCENEDROME</strong>
            <span>LOVE ATTACK / Pinball</span>
          </div>
          <span aria-hidden="true">→</span>
          <div>
            <time dateTime="2026-07-26">2026.07</time>
            <strong>SBS 人気歌謡 1位</strong>
            <span>約2年後の再発見</span>
          </div>
        </div>
      </section>

      <section className="next-listen section-block" aria-labelledby="next-listen-title">
        <div className="next-listen__head page-pad">
          <div>
            <p className="eyebrow">FROM LOVE ATTACK — NEXT LISTEN</p>
            <h2 id="next-listen-title">LOVE ATTACKから、次はどこへ行く？</h2>
          </div>
          <p>
            公式ランキングではなく、このサイトの編集導線です。
            同じ作品、2025年、2026年へ枝分かれして聴けます。
          </p>
        </div>
        <div className="next-listen__origin page-pad">
          <span>START</span>
          <strong>LOVE ATTACK</strong>
          <Link href="/discography/scenedrome/">作品詳細 →</Link>
        </div>
        <ol className="next-listen__list">
          {editorialData.nextListen.map((item) => {
            const release = releases.find((record) => record.id === item.releaseId);
            if (!release) return null;
            return (
              <li key={`${item.releaseId}-${item.track}`}>
                <Link href={`/discography/${release.id}/`}>
                  <span aria-hidden="true">├─</span>
                  <strong>{item.track}</strong>
                  <p>{item.note}</p>
                  <span className="next-listen__release">{release.title} →</span>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="home-members section-block" aria-labelledby="home-members-title">
        <div className="section-heading-row page-pad">
          <div>
            <p className="eyebrow">WHO TO WATCH</p>
            <h2 className="section-heading section-heading--large" id="home-members-title">MEMBERS</h2>
          </div>
          <Link className="text-link" href="/members/">5人の詳細を見る →</Link>
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
              {!member.image && (
                <span className="home-member__fallback" aria-hidden="true">
                  {String(member.displayOrder).padStart(2, '0')}
                </span>
              )}
              <span className="home-member__shade" aria-hidden="true" />
              <span className="home-member__name">{member.stageName}</span>
            </Link>
          ))}
        </div>
        <div className="home-member-notes page-pad">
          {homeMembers.map((member) => {
            const entry = editorialData.memberEntries.find((item) => item.memberId === member.id);
            return (
              <Link href={`/members/${member.id}/`} key={member.id}>
                <strong>{member.stageName}</strong>
                <span>{entry?.copy ?? member.shortDescriptionJa}</span>
              </Link>
            );
          })}
        </div>
        <p className="home-members__order page-pad">
          並びはキービジュアルと同じ MAY / LIV / ZENA / MINAMI / WONI
        </p>
      </section>

      <section className="home-news section-block" aria-labelledby="home-news-title">
        <div className="section-heading-row page-pad">
          <div>
            <p className="eyebrow">WHAT HAPPENED</p>
            <h2 className="section-heading section-heading--large" id="home-news-title">NEWS</h2>
          </div>
          <Link className="text-link" href="/news/">すべての記事 →</Link>
        </div>
        <div className="home-news__context page-pad">
          <span>LATEST — 2026</span>
          <p>新曲、動画、チャート、出演など、RESCENEに実際に起きた出来事だけを記録します。</p>
        </div>
        <div className="home-news__grid">
          {latestNews.map((article, index) => (
            <Link href={`/news/${article.slug}/`} key={article.id}>
              <time className={index === 0 ? 'is-latest' : undefined} dateTime={article.publishedAt}>
                {formatDate(article.publishedAt)}
              </time>
              <span className="home-news__category">{categoryLabels[article.category]}</span>
              <span className="home-news__title">{article.title}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="next-japan" aria-labelledby="next-japan-title">
        <div>
          <h2 className="eyebrow" id="next-japan-title">NEXT IN JAPAN — UTILITY</h2>
          <p className="next-japan__title">{nextJapanSchedule.title}</p>
          <p>{nextJapanSchedule.description}</p>
        </div>
        <div className="next-japan__links">
          <time dateTime={nextJapanSchedule.checkedAt}>
            最終確認 {formatDate(nextJapanSchedule.checkedAt)}
          </time>
          <Link href="/japan/">日本活動記録 →</Link>
        </div>
      </section>

      <section className="home-start" aria-labelledby="home-start-title">
        <Link className="starter-guide" href="/guide/first-rescene/">
          <span className="eyebrow">START HERE</span>
          <h2 id="home-start-title">First RESCENE</h2>
          <p>動画、曲、メンバー。2026年の今から入れる3つの入口を選べます。</p>
          <span className="starter-guide__link">今から見るガイド →</span>
        </Link>
        <div className="home-discography home-archive">
          <div className="section-heading-row">
            <div>
              <p className="eyebrow">DIG DEEPER</p>
              <h2 className="section-heading">ARCHIVE</h2>
            </div>
          </div>
          <div className="home-archive__list">
            {archiveLinks.map((item, index) => (
              <Link href={item.href} key={item.href}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{item.label}</strong>
                <small>{item.description}</small>
                <span aria-hidden="true">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
