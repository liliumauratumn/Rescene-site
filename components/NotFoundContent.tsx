import Link from 'next/link';

export default function NotFoundContent() {
  return (
    <div className="page-shell not-found-page">
      <div className="not-found-number" aria-hidden="true">404</div>
      <div className="not-found-copy">
        <p className="eyebrow">PAGE NOT FOUND</p>
        <h1>このページは見つかりませんでした</h1>
        <p>アドレスが変更されたか、公式発表の取り下げにともない記事を削除した可能性があります。</p>
        <div className="button-row">
          <Link className="primary-button" href="/">トップへ戻る</Link>
          <Link className="secondary-button" href="/news/">ニュース一覧を見る</Link>
        </div>
      </div>
      <nav className="not-found-links" aria-label="主要ページ">
        <Link href="/schedule/"><span>スケジュール</span><span>締切順 →</span></Link>
        <Link href="/guide/first-rescene/"><span>はじめての人へ</span><span>ガイド →</span></Link>
        <Link href="/discography/"><span>作品一覧</span><span>作品 →</span></Link>
        <Link href="/japan/"><span>日本活動記録</span><span>年別 →</span></Link>
        <Link href="/search/"><span>サイト内を検索</span><span>検索 →</span></Link>
      </nav>
    </div>
  );
}
