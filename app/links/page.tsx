import { ExternalLink } from '@/components/ExternalLink';
import { PageHeader } from '@/components/PageHeader';
import { officialLinks } from '@/lib/content';
import { createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
  title: '公式リンク',
  description: 'RESCENEの公式コミュニティ、所属事務所、正規音楽配信、日本イベント主催者へのリンクです。',
  path: '/links/',
});

export default function LinksPage() {
  const categories = [...new Set(officialLinks.map((link) => link.category))];
  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="OFFICIAL LINKS"
        title="Links"
        lead="公式・正規配信・主催者を形でも区別します。URLを確認できていないSNSや動画チャンネルは掲載していません。"
      />
      <div className="link-kinds page-pad" aria-label="リンク種別">
        <span>公式</span><span>正規配信</span><span>主催者</span><span>公開前確認中</span>
      </div>
      <div className="link-groups content-pad">
        {categories.map((category) => (
          <section key={category}>
            <h2>{category}</h2>
            <div>
              {officialLinks.filter((link) => link.category === category).map((link) => (
                <ExternalLink
                  href={link.url}
                  kind={link.kind === 'streaming' ? 'streaming' : link.kind === 'promoter' ? 'promoter' : 'official'}
                  key={link.id}
                >
                  {link.label}
                </ExternalLink>
              ))}
            </div>
          </section>
        ))}
      </div>
      <p className="verification-note">リンク先の内容と運営については各サイトの表記をご確認ください。</p>
    </div>
  );
}
