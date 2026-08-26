import Link from 'next/link';
import { Breadcrumbs, PageHeader } from '@/components/PageHeader';
import { StarterVideoList } from '@/components/StarterVideoList';
import editorialData from '@/data/editorial.json';
import { homeMembers, starterVideos } from '@/lib/content';
import { createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
  title: '初めてのRESCENE — 2026年の入口',
  description: '巨済ヤッホー、WONIとMINAMI、LOVE ATTACKから、2026年の今のRESCENEを動画・曲・メンバー別に案内します。',
  path: '/guide/first-rescene/',
});

const listeningPaths = [
  { label: 'LOVE ATTACK / Pinball', href: '/discography/scenedrome/', note: '同じ作品を横に掘る' },
  { label: 'Deja Vu', href: '/discography/dearest/', note: '2025年へ進む' },
  { label: 'Runaway', href: '/discography/runaway/', note: '2026年の音へ進む' },
  { label: 'Pretty Girl', href: '/discography/pretty-girl/', note: '現在地点を見る' },
];

export default function FirstRescenePage() {
  return (
    <div className="page-shell">
      <Breadcrumbs items={[{ label: 'GUIDE' }, { label: '初めてのRESCENE' }]} />
      <PageHeader
        eyebrow="GUIDE — FIRST RESCENE 2026"
        title="First RESCENE"
        lead="正しい鑑賞順ではなく、動画・曲・メンバーのどこからでも入れる発見ガイドです。2026年の今を入口に、過去作品まで掘れます。"
      />
      <article className="guide-article">
        <section className="guide-section guide-section--state">
          <span className="guide-number">00</span>
          <div>
            <p className="guide-kicker">30 SECOND MAP</p>
            <h2>まず「今の流れ」だけ知る</h2>
            <ol className="guide-flow-mini">
              <li>WONIの個人YouTube</li>
              <li>WONI × MINAMI</li>
              <li>「巨済ヤッホー」</li>
              <li>2024年「LOVE ATTACK」の再発見</li>
              <li>2026年『人気歌謡』1位</li>
              <li>「Pretty Girl」と今の5人へ</li>
            </ol>
            <p>
              この並びは公式の因果図ではなく、当サイトが2026年の出来事を掘り始めるために整理した編集マップです。
            </p>
          </div>
        </section>

        <section className="guide-section">
          <span className="guide-number">01</span>
          <div>
            <p className="guide-kicker">ENTER BY VIDEO</p>
            <h2>動画から入る — WONI × MINAMI</h2>
            <p>
              2人の関係性は説明文で決めつけず、実際の掛け合いから見るのが分かりやすい。
              この3本はどこから見ても構いません。
            </p>
            <StarterVideoList videos={starterVideos} />
            <p className="starter-video-note">
              動画は埋め込まず、YouTubeの再生ページへ移動します。再生回数は表示しません。
            </p>
          </div>
        </section>

        <section className="guide-section">
          <span className="guide-number">02</span>
          <div>
            <p className="guide-kicker">ENTER BY SONG</p>
            <h2>曲から入る — LOVE ATTACKから枝分かれする</h2>
            <p>
              2024年の「LOVE ATTACK」を起点に、同じ作品、2025年、2026年へ進めます。
              公式ランキングではなく、このサイトのNEXT LISTENです。
            </p>
            <div className="guide-listening-paths">
              {listeningPaths.map((item, index) => (
                <Link href={item.href} key={item.label}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <strong>{item.label}</strong>
                  <small>{item.note}</small>
                  <span aria-hidden="true">→</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="guide-section">
          <span className="guide-number">03</span>
          <div>
            <p className="guide-kicker">ENTER BY MEMBER</p>
            <h2>メンバーから入る — 何を見ると人物が見える？</h2>
            <p>基本プロフィールより先に、各メンバーを見る入口を短く置きます。</p>
            <div className="guide-member-grid guide-member-grid--editorial">
              {homeMembers.map((member) => {
                const entry = editorialData.memberEntries.find((item) => item.memberId === member.id);
                return (
                  <Link href={`/members/${member.id}/`} key={member.id}>
                    <span>{member.stageName}</span>
                    <em>{member.stageNameJa}</em>
                    <small>{entry?.copy ?? member.shortDescriptionJa}</small>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section className="guide-section">
          <span className="guide-number">04</span>
          <div>
            <p className="guide-kicker">CURRENT RESCENE</p>
            <h2>2026年の5人へ追いつく</h2>
            <p>
              「Runaway」で2026年の音へ進み、「Pretty Girl」で現在のステージを見る。
              逆走した過去曲だけでRESCENEを止めないための2本です。
            </p>
            <div className="guide-inline-links">
              <Link className="guide-link" href="/discography/runaway/">Runaway →</Link>
              <Link className="guide-link" href="/discography/pretty-girl/">Pretty Girl →</Link>
            </div>
          </div>
        </section>

        <section className="guide-section">
          <span className="guide-number">05</span>
          <div>
            <p className="guide-kicker">DIG DEEPER</p>
            <h2>あとは、好きな方向へ掘る</h2>
            <p>
              発売順に追う必要はありません。Discographyで作品を、Membersで人物を、Japan Archiveで日本活動を資料として確認できます。
            </p>
            <div className="guide-inline-links">
              <Link className="guide-link" href="/discography/">作品一覧 →</Link>
              <Link className="guide-link" href="/members/">メンバー →</Link>
              <Link className="guide-link" href="/japan/">日本活動記録 →</Link>
            </div>
          </div>
        </section>

        <section className="guide-section guide-section--utility">
          <span className="guide-number">06</span>
          <div>
            <p className="guide-kicker">NEED-TO-KNOW</p>
            <h2>イベント参加情報は、必要なときだけ</h2>
            <p>
              応募期間、販売時刻、本人確認はRESCENEを知る入口ではありません。参加予定ができたときの補助情報として別ページに置いています。
            </p>
            <Link className="guide-link" href="/guide/japan-events/">参加前の補助情報 →</Link>
          </div>
        </section>
      </article>
    </div>
  );
}
