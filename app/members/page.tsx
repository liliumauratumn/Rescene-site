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
        lead="確認済みの英語・韓国語・日本語の名義を記録しています。"
      />
      <div className="member-list">
        {members.map((member) => {
          const hasProfile = Boolean(
            member.shortDescriptionJa || member.roleLabelJa || member.birthDate || member.originJa,
          );
          return (
            <Link
              className={`member-row ${hasProfile ? '' : 'member-row--identity-only'}`}
              href={`/members/${member.id}/`}
              key={member.id}
            >
              <span className="member-row__number">{String(member.displayOrder).padStart(2, '0')}</span>
              <div className="member-row__identity">
                <h2>{member.stageName}</h2>
                <p>
                  <span lang="ko" className="korean">{member.stageNameKo}</span>　{member.stageNameJa}
                </p>
              </div>
              {member.shortDescriptionJa && (
                <p className="member-row__description">{member.shortDescriptionJa}</p>
              )}
              {(member.roleLabelJa || member.birthDate || member.originJa) && (
                <div className="member-row__facts">
                  {member.roleLabelJa && <span>{member.roleLabelJa}</span>}
                  {member.birthDate && (
                    <time dateTime={member.birthDate}>{formatDate(member.birthDate)}</time>
                  )}
                  {member.originJa && <span>{member.originJa}</span>}
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
