import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { createMetadata } from '@/lib/metadata';
import { siteConfig } from '@/site.config';

export const metadata = createMetadata({
  title: 'このサイトについて',
  description: 'RESCENE FANSITEの非公式表記、運営目的、情報源、権利、訂正、広告、プライバシー方針。',
  path: '/about/',
});

const sourceOrder = [
  '公式コミュニティ / Mnet Plus',
  'THE MUZE Entertainment',
  '公式YouTube・公式SNS',
  'イベント主催者・放送局・販売元',
  '正規配信ページ・報道・プレスリリース',
];

export default function AboutPage() {
  return (
    <div className="page-shell">
      <PageHeader eyebrow="ABOUT — 個人運営・非公式" title="About" />
      <section className="about-unofficial content-pad">
        <p>RESCENE、THE MUZE Entertainmentおよび関連各社とは関係のない、個人運営の非公式ファンサイトです。</p>
        <p>公式からの依頼・提供・監修を受けていません。掲載内容の最終確認は各公式発表でお願いします。</p>
      </section>
      <div className="about-sections content-pad">
        <section>
          <span>01</span><div><h2>運営目的</h2><p>RESCENEを日本から知り、追い、記録するための場所です。速報の量ではなく、後年に参照できる正確さを優先します。</p></div>
        </section>
        <section>
          <span>02</span><div><h2>情報源の扱い</h2><p>公式発表を全文転載せず、日本語で要点を整理し、原文へリンクします。発表日・開催日・販売開始日・応募締切は別の日付として扱います。</p><ol>{sourceOrder.map((source) => <li key={source}>{source}</li>)}</ol></div>
        </section>
        <section>
          <span>03</span><div><h2>写真・動画・音源の権利</h2><p>権利はそれぞれの権利者に帰属します。公式画像の自動保存や再配布は行わず、歌詞や翻訳の全文は掲載しません。</p></div>
        </section>
        <section>
          <span>04</span><div><h2>訂正・削除のご依頼</h2><p>事実誤認、権利上の問題、掲載を望まない情報は確認後に訂正または削除し、記事に更新日と修正内容を残します。現在、問い合わせ窓口は設置していません。</p></div>
        </section>
        <section>
          <span>05</span><div><h2>広告・アフィリエイト</h2><p>公式リンクと広告リンクは同じ表現にせず、広告を含む場合はリンクより前に開示します。現在、広告リンクは掲載していません。</p></div>
        </section>
        <section>
          <span>06</span><div><h2>プライバシー</h2><p>現在、独自のアクセス解析・会員登録・コメント機能はありません。外部サイトへ移動した後の情報取得は、各リンク先の方針をご確認ください。</p></div>
        </section>
      </div>
      <div className="about-bottom page-pad">
        <time dateTime={siteConfig.lastUpdated}>
          最終更新 {siteConfig.lastUpdated.replaceAll('-', '.')}
        </time>
        <Link className="text-link" href="/links/">公式リンク一覧へ →</Link>
      </div>
    </div>
  );
}
