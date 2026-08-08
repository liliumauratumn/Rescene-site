import type { ReactNode } from 'react';

export function ExternalLink({
  href,
  kind = 'official',
  children,
}: {
  href: string;
  kind?: 'official' | 'streaming' | 'shop' | 'promoter';
  children: ReactNode;
}) {
  return (
    <a
      className={`external-link external-link--${kind}`}
      href={href}
      target="_blank"
      rel="noreferrer noopener"
    >
      <span>{children}</span>
      <span aria-hidden="true">↗</span>
      <span className="sr-only">（外部サイト）</span>
    </a>
  );
}
