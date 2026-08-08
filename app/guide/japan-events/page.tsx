import Link from 'next/link';
import { Breadcrumbs, PageHeader } from '@/components/PageHeader';
import { createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
  title: '日本からイベントへ参加する',
  description: 'RESCENEの日本イベントへ参加する際の公式情報、日付、応募、本人確認の見方を案内します。',
  path: '/guide/japan-events/',
});

export default function JapanEventsGuidePage() {
  return (
    <div className="page-shell">
      <Breadcrumbs items={[{ label: 'GUIDE', href: '/guide/first-rescene/' }, { label: '日本からイベントへ参加する' }]} />
      <PageHeader
        eyebrow="GUIDE — 日本からイベントへ参加する"
        title="Japan Events"
        lead="最初につまずきやすい応募の順番と本人確認を、4つの手順に絞って説明します。グループの基本は「初めてのRESCENE」にまとめています。"
      />
      <article className="guide-article">
        <section className="guide-section">
          <span className="guide-number">01</span>
          <div><h2>公式アカウントを先に押さえる</h2><p>告知は公式コミュニティ（Mnet Plus）や公式SNSに出ます。当サイトに掲載した内容だけで判断せず、原文へ進める導線を先に確認してください。</p><Link className="guide-link" href="/links/">公式リンク一覧 →</Link></div>
        </section>
        <section className="guide-section">
          <span className="guide-number">02</span>
          <div><h2>発表日・開催日・締切は別々に見る</h2><p>同じイベントでも、販売開始や応募締切が開催日より先に来ます。当サイトはそれぞれを別フィールドで記録しています。</p><Link className="guide-link" href="/schedule/">スケジュール →</Link></div>
        </section>
        <section className="guide-section">
          <span className="guide-number">03</span>
          <div><h2>本人確認は申込時の名義で決まる</h2><p>入場時に身分証と申込名義の一致を求められる場合があります。必要書類、名義変更、年齢条件はイベントごとに異なるため、申込前に主催者の原文を確認してください。</p></div>
        </section>
        <section className="guide-section">
          <span className="guide-number">04</span>
          <div><h2>作品の呼び方をそろえておく</h2><p>韓国語版、英語版、日本語版が混在します。日本語版のある曲は「YoYo (Japanese Version)」のように原題と分けて記録します。</p><Link className="guide-link" href="/discography/">作品一覧 →</Link></div>
        </section>
        <section className="guide-faq">
          <p className="eyebrow">よくある質問</p>
          <div><h2>日本独自のファンクラブはありますか</h2><p>提供資料では確認できていません。公式コミュニティの最新案内をご確認ください。</p></div>
          <div><h2>このサイトはチケットを扱いますか</h2><p>扱いません。販売・応募は公式または正規の販売事業者のページで行ってください。</p></div>
          <div><h2>情報が古い場合はどうすればよいですか</h2><p>相違がある場合は公式発表を優先してください。訂正時は記事に更新日と修正内容を残します。</p></div>
        </section>
      </article>
      <p className="verification-note">本ガイドは参加条件を保証するものではありません。申込前に必ず公式・主催者の原文をご確認ください。</p>
    </div>
  );
}
