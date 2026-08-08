import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/JsonLd';
import { Breadcrumbs } from '@/components/PageHeader';
import { formatDateJa, getMember, members, news, releases } from '@/lib/content';
import { createMetadata } from '@/lib/metadata';
import { absoluteUrl } from '@/site.config';

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return members.map((member) => ({ slug: member.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const member = getMember(slug);
  if (!member) return {};
  return createMetadata({
    title: `${member.stageName}（${member.stageNameJa}）`,
    description: `RESCENE ${member.stageName}（${member.stageNameJa}／${member.stageNameKo}）の確認済み情報と関連コンテンツ。`,
    path: `/members/${member.id}/`,
  });
}

export default async function MemberDetailPage({ params }: Props) {
  const { slug } = await params;
  const member = getMember(slug);
  if (!member) notFound();
  const otherMembers = members.filter((item) => item.id !== member.id);
  const relatedNews = news.filter((article) => article.relatedMembers.includes(member.id));
  const latestWorks = releases.slice(0, 3);
  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: member.stageName,
    alternateName: [member.stageNameJa, member.stageNameKo],
    url: absoluteUrl(`/members/${member.id}/`),
    memberOf: { '@type': 'MusicGroup', name: 'RESCENE' },
  };

  return (
    <div className="page-shell">
      <JsonLd data={personSchema} />
      <div className="member-detail-intro">
        <div className="member-detail-portrait">
          {member.image ? (
            <Image
              src={member.image}
              alt={member.stageName}
              fill
              preload
              sizes="(max-width: 767px) 100vw, 300px"
            />
          ) : (
            <div className="member-detail-portrait-fallback" aria-hidden="true">
              <span>
                {String(member.displayOrder).padStart(2, '0')}
                <br />
                {member.stageName}
              </span>
            </div>
          )}
        </div>
        <div className="member-detail-breadcrumbs">
          <Breadcrumbs
            items={[{ label: 'MEMBERS', href: '/members/' }, { label: member.stageName }]}
          />
        </div>
        <div className="member-detail-panel content-pad">
          <header className="member-detail-hero">
            <p className="eyebrow member-detail-eyebrow">
              MEMBER {String(member.displayOrder).padStart(2, '0')}
            </p>
            <h1>{member.stageName}</h1>
            <p className="member-names">
              <span>{member.stageNameJa}</span>
              <span lang="ko" className="korean">{member.stageNameKo}</span>
              {member.roleLabelJa && <span className="member-role">{member.roleLabelJa}</span>}
            </p>
            {member.shortDescriptionJa && (
              <p className="member-description">{member.shortDescriptionJa}</p>
            )}
          </header>
          {(member.birthDate || member.originJa || member.roleLabelJa) && (
            <section className="member-facts member-detail-facts" aria-labelledby="member-facts-title">
              <h2 className="sr-only" id="member-facts-title">PROFILE</h2>
              <dl>
                {member.birthDate && <div><dt>生年月日</dt><dd><time dateTime={member.birthDate}>{formatDateJa(member.birthDate)}</time></dd></div>}
                {member.originJa && <div><dt>出身</dt><dd>{member.originJa}</dd></div>}
                {member.roleLabelJa && <div><dt>役割</dt><dd>{member.roleLabelJa}</dd></div>}
              </dl>
            </section>
          )}
          <div className="member-detail-actions">
            {relatedNews.length > 0 && <Link href="#member-related-news">関連ニュースを見る</Link>}
            <Link href="/japan/">日本活動記録</Link>
          </div>
        </div>
      </div>
      {relatedNews.length > 0 && (
        <section className="related-section content-pad" id="member-related-news">
          <h2 className="section-heading">関連ニュース</h2>
          {relatedNews.map((article) => (
            <Link className="related-row" href={`/news/${article.slug}/`} key={article.id}>
              <time dateTime={article.publishedAt}>{article.publishedAt.replaceAll('-', '.')}</time>
              <span>{article.title}</span>
            </Link>
          ))}
        </section>
      )}
      <section className="related-section content-pad">
        <h2 className="section-heading">作品への入口</h2>
        <div className="related-card-grid">
          {latestWorks.map((release) => (
            <Link href={`/discography/${release.id}/`} key={release.id}>
              <span>{release.title}</span><time dateTime={release.releaseDate}>{release.releaseDate.replaceAll('-', '.')}</time>
            </Link>
          ))}
        </div>
      </section>
      <nav className="other-members" aria-label="他のメンバー">
        {otherMembers.map((item) => (
          <Link href={`/members/${item.id}/`} key={item.id}>
            <span>{item.stageName}</span>
            <small>{[item.stageNameJa, item.roleLabelJa].filter(Boolean).join('｜')}</small>
          </Link>
        ))}
      </nav>
    </div>
  );
}
