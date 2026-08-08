import type { MetadataRoute } from 'next';
import { members, news, releases } from '@/lib/content';
import { absoluteUrl } from '@/site.config';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date('2026-08-08T00:00:00+09:00');
  const staticPaths = [
    '/',
    '/news/',
    '/schedule/',
    '/members/',
    '/discography/',
    '/guide/first-rescene/',
    '/guide/japan-events/',
    '/japan/',
    '/links/',
    '/about/',
    '/search/',
  ];
  return [
    ...staticPaths.map((path, index) => ({
      url: absoluteUrl(path),
      lastModified,
      changeFrequency: (path === '/' || path === '/news/' || path === '/schedule/' ? 'weekly' : 'monthly') as 'weekly' | 'monthly',
      priority: index === 0 ? 1 : path === '/news/' || path === '/schedule/' ? 0.9 : 0.7,
    })),
    ...members.map((member) => ({
      url: absoluteUrl(`/members/${member.id}/`),
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...releases.map((release) => ({
      url: absoluteUrl(`/discography/${release.id}/`),
      lastModified: new Date(`${release.releaseDate}T00:00:00+09:00`),
      changeFrequency: 'yearly' as const,
      priority: 0.7,
    })),
    ...news.map((article) => ({
      url: absoluteUrl(`/news/${article.slug}/`),
      lastModified: new Date(`${article.updatedAt ?? article.publishedAt}T00:00:00+09:00`),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ];
}
