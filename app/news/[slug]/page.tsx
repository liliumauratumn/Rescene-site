import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ExternalLink } from '@/components/ExternalLink';
import { JsonLd } from '@/components/JsonLd';
import { Breadcrumbs } from '@/components/PageHeader';
import { categoryLabels, formatDate, getArticle, getMember, getRelease, news } from '@/lib/content';
import { createMetadata } from '@/lib/metadata';
import { absoluteUrl, siteConfig } from '@/site.config';

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return news.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  const base = createMetadata({
    title: article.title,
    description: article.summary,
    path: `/news/${article.slug}/`,
  });
  return {
    ...base,
    openGraph: { ...base.openGraph, type: 'article', publishedTime: article.publishedAt, modifiedTime: article.updatedAt ?? undefined },
  };
}

export default async function NewsDetailPage({ params }: Props) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();
  const relatedMembers = article.relatedMembers.map(getMember).filter(Boolean);
  const relatedReleases = article.relatedReleases.map(getRelease).filter(Boolean);
  const relatedArticles = news.filter((item) => item.id !== article.id).slice(0, 2);
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.summary,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt ?? article.publishedAt,
    mainEntityOfPage: absoluteUrl(`/news/${article.slug}/`),
    publisher: { '@type': 'Organization', name: siteConfig.name, url: siteConfig.url },
  };

  return (
    <div className="page-shell">
      <JsonLd data={articleSchema} />
      <Breadcrumbs items={[{ label: 'NEWS', href: '/news/' }, { label: categoryLabels[article.category] }]} />
      <article className="article-page">
        <header className="article-header content-pad">
          <p className="eyebrow">NEWS ／ {categoryLabels[article.category]}</p>
          <h1>{article.title}</h1>
          <div className="article-meta">
            <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
            <span>{categoryLabels[article.category]}</span>
            <span>{article.sourceType === 'editorial' ? '編集記事' : '出典'} ／ {article.sourceName}</span>
            <span>{article.updatedAt ? `更新 ${formatDate(article.updatedAt)}` : '更新なし'}</span>
          </div>
        </header>
        <div className="article-summary">{article.summary}</div>
        {article.correctionNote && <aside className="correction-notice"><strong>訂正</strong><p>{article.correctionNote}</p></aside>}
        <div className="article-body content-pad">
          {article.body.map((section) => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </section>
          ))}
        </div>
        <section className="article-source content-pad">
          <h2 className="section-heading">出典</h2>
          <ExternalLink href={article.sourceUrl} kind={article.sourceType === 'event_organizer' ? 'promoter' : 'official'}>{article.sourceName}</ExternalLink>
          <p>本記事は公式・放送局・主催者が公開した情報の要点を日本語で整理したものです。原文の全文転載ではありません。</p>
        </section>
        <section className="article-policy content-pad">
          <h2 className="section-heading">訂正・広告</h2>
          <p>{article.correctionNote ?? 'この記事に訂正はありません。'}</p>
          <p>{article.affiliateDisclosure ?? 'この記事には広告・アフィリエイトリンクを含みません。'}</p>
        </section>
        {(relatedMembers.length > 0 || relatedReleases.length > 0) && (
          <section className="related-section content-pad">
            {relatedMembers.length > 0 && <><h2 className="section-heading">関連人物</h2><div className="related-card-grid">{relatedMembers.map((member) => member && <Link href={`/members/${member.id}/`} key={member.id}><span>{member.stageName}</span><small>{member.stageNameJa} →</small></Link>)}</div></>}
            {relatedReleases.length > 0 && <><h2 className="section-heading">関連作品</h2><div className="related-card-grid">{relatedReleases.map((release) => release && <Link href={`/discography/${release.id}/`} key={release.id}><span>{release.title}</span><small>{formatDate(release.releaseDate)} →</small></Link>)}</div></>}
          </section>
        )}
        <section className="related-section content-pad">
          <h2 className="section-heading">関連記事</h2>
          {relatedArticles.map((item) => <Link className="related-row" href={`/news/${item.slug}/`} key={item.id}><time dateTime={item.publishedAt}>{formatDate(item.publishedAt)}</time><span>{item.title}</span></Link>)}
        </section>
      </article>
      <div className="back-row page-pad"><Link className="text-link" href="/news/">← ニュース一覧へ戻る</Link></div>
    </div>
  );
}
