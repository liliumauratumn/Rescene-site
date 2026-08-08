'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { siteConfig } from '@/site.config';

type HeaderMember = {
  id: string;
  stageName: string;
  stageNameJa: string;
};

const primaryNav = [
  { href: '/news/', label: 'NEWS' },
  { href: '/schedule/', label: 'SCHEDULE' },
  { href: '/members/', label: 'MEMBERS' },
  { href: '/discography/', label: 'DISCOGRAPHY' },
  { href: '/japan/', label: 'JAPAN' },
  { href: '/guide/first-rescene/', label: 'GUIDE' },
];

const mobileNav = [
  ...primaryNav.slice(0, 5).map((item) => ({ ...item, ja: {
    NEWS: 'ニュース',
    SCHEDULE: '予定',
    MEMBERS: 'メンバー',
    DISCOGRAPHY: '作品',
    JAPAN: '日本活動記録',
  }[item.label] ?? '' })),
  { href: '/guide/first-rescene/', label: 'Guide', ja: '初めてのRESCENE' },
  { href: '/guide/japan-events/', label: 'Guide', ja: '日本からイベントへ参加する' },
  { href: '/links/', label: 'Links', ja: '公式リンク集' },
  { href: '/about/', label: 'About', ja: 'このサイトについて' },
];

function isCurrent(pathname: string, href: string) {
  const root = href.split('/').filter(Boolean)[0];
  return root ? pathname.startsWith(`/${root}`) : pathname === '/';
}

function isMobileCurrent(pathname: string, href: string) {
  if (href.startsWith('/guide/')) {
    return pathname === href.replace(/\/$/, '');
  }

  return isCurrent(pathname, href);
}

export default function SiteHeader({ homeMembers }: { homeMembers: HeaderMember[] }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const drawer = drawerRef.current;
    if (!drawer) return;
    const focusable = drawer.querySelectorAll<HTMLElement>('a, button');
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    first?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
      if (event.key === 'Tab' && focusable.length > 0) {
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  return (
    <>
      {pathname === '/' && (
        <div className="home-prelude">
          <div className="unofficial-bar">
            <span className="eyebrow">UNOFFICIAL — JAPANESE</span>
            <span>
              {siteConfig.name} は個人運営の日本語・非公式ファンサイトです。RESCENE / THE
              MUZE Entertainment とは無関係です。
            </span>
            <time dateTime={siteConfig.lastUpdated}>
              最終更新 {siteConfig.lastUpdated.replaceAll('-', '.')}
            </time>
          </div>
          <div className="hero-visual">
            <Image
              src="/images/hero.png"
              alt="RESCENEメンバー5人のキービジュアル"
              width={2880}
              height={1800}
              priority
              sizes="100vw"
            />
            <div className="hero-hit-grid" aria-label="メンバープロフィール">
              {homeMembers.map((member) => (
                <Link
                  className={`hero-hit hero-hit--${member.id}`}
                  href={`/members/${member.id}/`}
                  key={member.id}
                >
                  <span className="hero-hit-name">{member.stageName}</span>
                  <span>{member.stageNameJa}｜プロフィールへ</span>
                </Link>
              ))}
            </div>
          </div>
          <div className="hero-name-row" aria-label="メンバー一覧">
            {homeMembers.map((member) => (
              <Link href={`/members/${member.id}/`} key={member.id}>
                {member.stageName}
              </Link>
            ))}
          </div>
        </div>
      )}

      <header className="site-header">
        <div className="site-header__inner">
          <Link className="brand" href="/" aria-label={`${siteConfig.name} ホーム`}>
            <Image src="/images/logo.png" alt="RESCENE" width={1235} height={236} priority />
            <span>FANSITE</span>
          </Link>
          <nav className="desktop-nav" aria-label="グローバルナビゲーション">
            {primaryNav.map((item) => (
              <Link
                href={item.href}
                className={isCurrent(pathname, item.href) ? 'is-current' : undefined}
                aria-current={isCurrent(pathname, item.href) ? 'page' : undefined}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mobile-actions">
            <Link className="header-action" href="/search/" aria-label="サイト内検索">
              <span aria-hidden="true">検</span>
            </Link>
            <button
              className="header-action menu-button"
              type="button"
              aria-label="メニューを開く"
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              onClick={() => setMenuOpen(true)}
              ref={menuButtonRef}
            >
              <span aria-hidden="true" />
              <span aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div
          className="mobile-drawer"
          id="mobile-navigation"
          role="dialog"
          aria-modal="true"
          aria-label="サイトメニュー"
          ref={drawerRef}
        >
          <div className="mobile-drawer__head">
            <span className="brand-text">FANSITE</span>
            <button
              className="drawer-close"
              type="button"
              onClick={() => {
                setMenuOpen(false);
                menuButtonRef.current?.focus();
              }}
              aria-label="メニューを閉じる"
            >
              ×
            </button>
          </div>
          <nav className="mobile-nav" aria-label="モバイルナビゲーション">
            {mobileNav.map((item) => (
              <Link
                href={item.href}
                className={isMobileCurrent(pathname, item.href) ? 'is-current' : undefined}
                aria-current={isMobileCurrent(pathname, item.href) ? 'page' : undefined}
                onClick={() => setMenuOpen(false)}
                key={`${item.href}-${item.ja}`}
              >
                <span>{item.label}</span>
                <span>{item.ja}</span>
              </Link>
            ))}
          </nav>
          <p className="drawer-note">
            個人運営の非公式ファンサイトです。公式および関連各社とは関係ありません。
          </p>
        </div>
      )}
    </>
  );
}
