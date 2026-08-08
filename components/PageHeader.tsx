import Link from 'next/link';
import { JsonLd } from '@/components/JsonLd';
import { absoluteUrl } from '@/site.config';

export function Breadcrumbs({
  items,
}: {
  items: Array<{ label: string; href?: string }>;
}) {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'HOME',
              item: absoluteUrl('/'),
            },
            ...items.map((item, index) => ({
              '@type': 'ListItem',
              position: index + 2,
              name: item.label,
              ...(item.href ? { item: absoluteUrl(item.href) } : {}),
            })),
          ],
        }}
      />
      <nav className="breadcrumbs" aria-label="パンくずリスト">
        <Link href="/">HOME</Link>
        {items.map((item, index) => (
          <span key={`${item.label}-${index}`}>
            <span aria-hidden="true"> ／ </span>
            {item.href ? (
              <Link href={item.href}>{item.label}</Link>
            ) : (
              <span aria-current={index === items.length - 1 ? 'page' : undefined}>{item.label}</span>
            )}
          </span>
        ))}
      </nav>
    </>
  );
}

export function PageHeader({
  eyebrow,
  title,
  lead,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
}) {
  return (
    <header className="page-heading page-pad">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="display-title">{title}</h1>
      {lead && <p className="page-lead">{lead}</p>}
    </header>
  );
}
