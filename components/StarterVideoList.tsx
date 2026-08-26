import type { StarterVideo } from '@/types/content';

export function StarterVideoList({
  videos,
  tone = 'light',
}: {
  videos: StarterVideo[];
  tone?: 'light' | 'dark';
}) {
  return (
    <div className={`starter-video-list starter-video-list--${tone}`}>
      {videos.map((video) => (
        <a
          className="starter-video-row"
          href={video.url}
          target="_blank"
          rel="noreferrer noopener"
          key={video.id}
        >
          <span className="starter-video-order">
            {String(video.order).padStart(2, '0')}
          </span>
          <span className="starter-video-copy">
            <span className="starter-video-title">{video.title}</span>
            <span className="starter-video-original" lang="ko">
              {video.originalTitle}
            </span>
            <span className="starter-video-comment">
              <span>EDITOR&apos;S NOTE</span>
              {video.editorialNote}
            </span>
          </span>
          <span className="starter-video-source" aria-hidden="true">
            <span className="starter-video-source-label">YouTube </span>↗
          </span>
          <span className="sr-only">（YouTubeを新しいタブで開く）</span>
        </a>
      ))}
    </div>
  );
}
