import Link from 'next/link';
import { siteConfig } from '@/site.config';

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-unofficial">
        <span className="footer-brush" aria-hidden="true">FANSITE</span>
        <p>
          RESCENE、THE MUZE Entertainmentおよび関連各社とは関係のない、個人運営の非公式ファンサイトです。
        </p>
      </div>
      <div className="footer-grid">
        <div>
          <p className="eyebrow">{siteConfig.name}</p>
          <p>日本から知り、追い、記録する。</p>
        </div>
        <nav aria-label="フッターナビゲーション">
          <Link href="/news/">ニュース</Link>
          <Link href="/schedule/">スケジュール</Link>
          <Link href="/members/">メンバー</Link>
          <Link href="/discography/">作品</Link>
          <Link href="/japan/">日本活動記録</Link>
        </nav>
        <nav aria-label="サイト情報">
          <Link href="/guide/first-rescene/">初めてのRESCENE</Link>
          <Link href="/guide/japan-events/">日本からイベントへ参加する</Link>
          <Link href="/links/">公式リンク</Link>
          <Link href="/about/">このサイトについて</Link>
          <Link href="/search/">検索</Link>
        </nav>
      </div>
      <div className="footer-bottom">
        <span>© {siteConfig.name}</span>
        <time dateTime={siteConfig.lastUpdated}>
          最終更新 {siteConfig.lastUpdated.replaceAll('-', '.')}
        </time>
      </div>
    </footer>
  );
}
