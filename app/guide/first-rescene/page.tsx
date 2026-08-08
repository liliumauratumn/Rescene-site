import Link from 'next/link';
import { Breadcrumbs, PageHeader } from '@/components/PageHeader';
import { members, starterVideos } from '@/lib/content';
import { createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
  title: '初めてのRESCENE',
  description: 'RESCENEの名前、5人のメンバー、最初に聴く作品、公式情報への入口を案内します。',
  path: '/guide/first-rescene/',
});

export default function FirstRescenePage() {
  return (
    <div className="page-shell">
      <Breadcrumbs items={[{ label: 'GUIDE' }, { label: '初めてのRESCENE' }]} />
      <PageHeader
        eyebrow="GUIDE — 初めてのRESCENE"
        title="First RESCENE"
        lead="名前の意味、5人のメンバー、最初に聴く作品から順に読める入門です。"
      />
      <article className="guide-article">
        <section className="guide-section guide-section--state">
          <span className="guide-number">00</span>
          <div>
            <h2>最初に見るべき動画</h2>
            <p>メンバーを知る入口として、YouTubeで公開されている3本を案内します。</p>
            <div className="starter-video-list">
              {starterVideos.map((video) => (
                <a
                  className="starter-video-row"
                  href={video.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  key={video.url}
                >
                  <span className="starter-video-order">{String(video.order).padStart(2, '0')}</span>
                  <span className="starter-video-title korean" lang="ko">{video.title}</span>
                  <span className="starter-video-source" aria-hidden="true">
                    <span className="starter-video-source-label">YouTube </span>↗
                  </span>
                  <span className="sr-only">（YouTubeを新しいタブで開く）</span>
                </a>
              ))}
            </div>
            <p className="starter-video-note">動画は埋め込まず、YouTubeの再生ページへ移動します。再生回数は表示しません。</p>
          </div>
        </section>
        <section className="guide-section">
          <span className="guide-number">01</span>
          <div>
            <h2>RESCENEとは</h2>
            <p>THE MUZE Entertainment所属の韓国の5人組ガールズグループです。グループ名は Scene（場面）と Scent（香り）を組み合わせ、香りから過去の場面が呼び起こされる着想を音楽の世界観に用いています。</p>
          </div>
        </section>
        <section className="guide-section">
          <span className="guide-number">02</span>
          <div>
            <h2>5人のメンバー</h2>
            <p>個別ページから関連作品と日本活動へ進めます。</p>
            <div className="guide-member-grid">
              {members.map((member) => (
                <Link href={`/members/${member.id}/`} key={member.id}>
                  <span>{member.stageName}</span><small>{member.stageNameJa}</small>
                </Link>
              ))}
            </div>
          </div>
        </section>
        <section className="guide-section">
          <span className="guide-number">03</span>
          <div>
            <h2>最初に聴く1曲</h2>
            <p>編集上の入口として『SCENEDROME』収録の「LOVE ATTACK」から始め、最新作「Pretty Girl」、香りの軸が異なる「Runaway」「lip bomb」へ進む順を提案します。</p>
            <Link className="guide-link" href="/discography/scenedrome/">SCENEDROMEを見る →</Link>
          </div>
        </section>
        <section className="guide-section">
          <span className="guide-number">04</span>
          <div>
            <h2>MVから入る</h2>
            <p>当サイトは動画ファイルを再配布しません。確認済みの再生ページは作品詳細から案内します。</p>
          </div>
        </section>
        <section className="guide-section">
          <span className="guide-number">05</span>
          <div>
            <h2>作品を聴く順番</h2>
            <p>最新作から遡る方法と、発売順に追う方法があります。ディスコグラフィーでは、作品名、タイトル曲、香りのコンセプトを同じ軸で比較できます。</p>
            <Link className="guide-link" href="/discography/">作品一覧 →</Link>
          </div>
        </section>
        <section className="guide-section">
          <span className="guide-number">06</span>
          <div>
            <h2>ファンダム名</h2>
            <p>公式ファンダム名は <strong>REMINE</strong> です。</p>
          </div>
        </section>
        <section className="guide-section">
          <span className="guide-number">07</span>
          <div>
            <h2>日本から応援する</h2>
            <p>日本からイベントへ参加する手順は別ページにまとめています。発表日、販売開始、応募締切、本人確認を分けて確認してください。</p>
            <Link className="guide-link" href="/guide/japan-events/">日本からイベントへ参加する →</Link>
          </div>
        </section>
      </article>
    </div>
  );
}
