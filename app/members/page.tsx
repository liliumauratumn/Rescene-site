import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { formatDate, members } from '@/lib/content';
import { createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
  title: 'メンバー',
  description: 'RESCENEの5人のメンバーを英語・韓国語・日本語の3表記で紹介します。',
  path: '/members/',
});

export default function MembersPage() {
  return (
    <div className="page-shell">
      <PageHeader
        eyebrow={`MEMBERS — ${members.length}`}
        title="Members"
        lead="名義は英語・韓国語・日本語の3表記で記録します。プロフィール項目は本番公開前に一次情報で再確認します。"
      />
      <div className="member-list">
        {members.map((member) => (
          <Link className={`member-row ${member.id === 'minami' ? 'member-row--japan' : ''}`} href={`/members/${member.id}/`} key={member.id}>
            <span className="member-row__number">{String(member.displayOrder).padStart(2, '0')}</span>
            <div className="member-row__identity">
              <h2>{member.stageName}</h2>
              <p>
                <span lang="ko" className="korean">{member.stageNameKo}</span>　{member.stageNameJa}
              </p>
            </div>
            <p className="member-row__description">{member.shortDescriptionJa}</p>
            <div className="member-row__facts">
              <span>{member.roleLabelJa}</span>
              <time dateTime={member.birthDate}>{formatDate(member.birthDate)}</time>
              <span>{member.originJa}</span>
            </div>
            {member.id === 'minami' && <span className="member-row__marker">JAPAN</span>}
          </Link>
        ))}
      </div>
      <p className="verification-note">生年月日・出身・役割は `verify_before_publish` の項目で、公開前に公式プロフィールと照合します。</p>
    </div>
  );
}
