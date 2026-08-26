import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { scheduleSafetyDecision } from './lib/schedule-safety.mjs';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const workflow = await readFile(
  resolve(rootDir, '.github/workflows/update-schedule.yml'),
  'utf8',
);

assert.match(
  workflow,
  /grep -Ev '[^']*data\/schedule-sync\\\.json/,
  'schedule-sync.jsonが変更許可リストにありません。',
);
assert.match(
  workflow,
  /git diff --quiet --[^\n]*data\/schedule-sync\.json/,
  'schedule-sync.jsonがgit diff対象にありません。',
);
assert.match(
  workflow,
  /git add[^\n]*data\/schedule-sync\.json/,
  'schedule-sync.jsonがgit add対象にありません。',
);
assert.match(workflow, /git commit -m "chore\(schedule\): sync official calendar"/);
assert.match(workflow, /gh pr merge "\$pr_number" --auto --squash --delete-branch/);

const syncOnlyDecision = scheduleSafetyDecision({
  publicChanged: false,
  syncChanged: true,
  blockingPendingCount: 0,
  appliedChangeCount: 0,
  maxSafeChanges: 5,
  primarySourceOnly: true,
});
assert.equal(syncOnlyDecision.autoMergeEligible, true);
assert.equal(syncOnlyDecision.requiresReview, false);

const tempDir = await mkdtemp(join(tmpdir(), 'rescene-schedule-sync-'));
try {
  await mkdir(join(tempDir, 'data/pending'), { recursive: true });
  const syncPath = join(tempDir, 'data/schedule-sync.json');
  const oldSync = {
    checkedAt: '2026-08-25',
    source: 'https://artist.mnetplus.world/svc/stg/rescene-official/space/api/v1/calendar',
  };
  const nextSync = { ...oldSync, checkedAt: '2026-08-26' };
  await writeFile(syncPath, `${JSON.stringify(oldSync, null, 2)}\n`);
  await writeFile(join(tempDir, 'data/schedules.json'), '[]\n');
  await writeFile(join(tempDir, 'data/content-meta.json'), '{}\n');
  await writeFile(join(tempDir, 'data/pending/schedules.json'), '[]\n');

  const git = (...args) => execFileSync('git', args, { cwd: tempDir, encoding: 'utf8' }).trim();
  git('init', '-q');
  git('config', 'user.name', 'Schedule Workflow Test');
  git('config', 'user.email', 'schedule-test@example.invalid');
  git('add', 'data');
  git('commit', '-qm', 'initial');

  await writeFile(syncPath, `${JSON.stringify(nextSync, null, 2)}\n`);
  const diffResult = spawnSync(
    'git',
    [
      'diff',
      '--quiet',
      '--',
      'data/schedules.json',
      'data/schedule-sync.json',
      'data/content-meta.json',
      'data/pending/schedules.json',
    ],
    { cwd: tempDir },
  );
  assert.equal(diffResult.status, 1, '確認日だけの変更をgit diffが検出しませんでした。');

  git(
    'add',
    'data/schedules.json',
    'data/schedule-sync.json',
    'data/content-meta.json',
    'data/pending/schedules.json',
  );
  assert.equal(git('diff', '--cached', '--name-only'), 'data/schedule-sync.json');
  git('commit', '-qm', 'chore(schedule): sync official calendar');
  assert.equal(git('rev-list', '--count', 'HEAD'), '2');

  await writeFile(syncPath, `${JSON.stringify(nextSync, null, 2)}\n`);
  assert.equal(git('status', '--porcelain'), '', '同じ確認日の再実行で不要差分が生じました。');
} finally {
  await rm(tempDir, { recursive: true, force: true });
}

console.log('Schedule確認日Workflow整合テストOK');
