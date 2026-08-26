import { PageHeader } from '@/components/PageHeader';
import { createMetadata } from '@/lib/metadata';
import { getTmiItems } from '@/lib/tmi';

export const metadata = createMetadata({
  title: 'TMI',
  description: '動画、配信、番組、過去映像から見つけたRESCENEの細かな記録。',
  path: '/tmi/',
});

export default function TmiPage() {
  const items = getTmiItems();

  return (
    <div className="page-shell tmi-page">
      <PageHeader eyebrow="TMI — MANUAL NOTES" title="TMI" />
      {items.length > 0 ? (
        <ol className="tmi-list" aria-label="TMI一覧">
          {items.map((item, itemIndex) => (
            <li className="tmi-entry" key={itemIndex}>
              {item.text && <p className="tmi-entry__text">{item.text}</p>}
              {item.urls.length > 0 && (
                <div className="tmi-entry__sources">
                  {item.urls.map((url, urlIndex) => (
                    <a
                      className="tmi-source-link"
                      href={url}
                      target="_blank"
                      rel="noreferrer noopener"
                      aria-label={`SOURCE ${urlIndex + 1}（外部サイト）`}
                      key={urlIndex}
                    >
                      SOURCE ↗
                    </a>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ol>
      ) : (
        <p className="tmi-empty content-pad">TMIはまだありません。</p>
      )}
    </div>
  );
}
