import Link from 'next/link';
import { Breadcrumbs, PageHeader } from '@/components/PageHeader';
import { createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
  title: '日本イベント参加前の補助情報',
  description: 'RESCENEの日本イベントへ参加予定がある人向けに、公式情報、日付、応募、本人確認の見方だけを補助情報として案内します。',
  path: '/guide/japan-events/',
});

export default function JapanEventsGuidePage() {
  return (
    <div className="page-shell">
      <Breadcrumbs items={[{ label: 'GUIDE', href: '/guide/first-rescene/' }, { label: '参加前の補助情報' }]} />
      <PageHeader
        eyebrow="GUIDE — UTILITY"
        title="Japan Events"
        lead="このページは、参加予定ができた人だけが確認する補助情報です。RESCENEを今から知る入口は「First RESCENE」、日本で起きてきた活動は「Japan Archive」にあります。"
      />
      <div className="guide-priority-links page-pad" aria-label="優先コンテンツ">
        <Link href="/guide/first-rescene/">
          <span>START HERE</span>
          <strong>2026年の今から見る First RESCENE →</strong>
        </Link>
        <Link href="/japan/">
          <span>ACTIVITY RECORD</span>
          <strong>日本で何が起きてきたかを見る →</strong>
        </Link>
      </div>
      <article className="guide-article guide-article--utility">
        <section className="guide-section">
          <span className="guide-number">01</span>
          <div>
            <h2>参加前は公式原文を起点にする</h2>
            <p>告知は公式コミュニティや公式SNS、主催者から出ます。当サイトの要約だけで申し込まず、必ず原文へ進んでください。</p>
            <Link className="guide-link" href="/links/">公式リンク一覧 →</Link>
          </div>
        </section>
        <section className="guide-section">
          <span className="guide-number">02</span>
          <div>
            <h2>発表日・締切・開催日を分ける</h2>
            <p>同じイベントでも、販売開始や応募締切は開催日より先に来ます。参加予定がある場合だけ、スケジュールで日付の種類を確認してください。</p>
            <Link className="guide-link" href="/schedule/">スケジュール →</Link>
          </div>
        </section>
        <section className="guide-section">
          <span className="guide-number">03</span>
          <div>
            <h2>本人確認条件はイベントごとに違う</h2>
            <p>必要書類、申込名義、年齢条件は共通ルールではありません。申込前に、そのイベントの主催者が出した最新条件を確認してください。</p>
          </div>
        </section>
        <section className="guide-section">
          <span className="guide-number">04</span>
          <div>
            <h2>このサイトは参加可否を保証しない</h2>
            <p>当サイトはチケット販売や応募受付を行いません。情報が異なる場合は、公式・主催者の最新発表を優先します。</p>
          </div>
        </section>
      </article>
      <p className="verification-note">参加条件は変更される場合があります。申込・購入前に、必ず公式または主催者の原文をご確認ください。</p>
    </div>
  );
}
