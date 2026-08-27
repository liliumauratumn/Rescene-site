import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { routeSchedulePullRequest } from './route-schedule-pr.mjs';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const workflow = await readFile(
  resolve(rootDir, '.github/workflows/update-schedule.yml'),
  'utf8',
);
const continuationStart = workflow.indexOf('- name: Continue the schedule branch if it exists');
const mergeIndex = workflow.indexOf('git merge --no-edit "origin/$default_branch"', continuationStart);
const nameConfigIndex = workflow.indexOf('git config user.name "github-actions[bot]"', continuationStart);
const emailConfigIndex = workflow.indexOf(
  'git config user.email "41898282+github-actions[bot]@users.noreply.github.com"',
  continuationStart,
);

assert.notEqual(continuationStart, -1, 'Schedule branch継続ステップがありません。');
assert.notEqual(mergeIndex, -1, '既存Schedule branchへのmain mergeがありません。');
assert.ok(nameConfigIndex > continuationStart && nameConfigIndex < mergeIndex);
assert.ok(emailConfigIndex > continuationStart && emailConfigIndex < mergeIndex);
assert.equal(
  workflow.match(/git config user\.name "github-actions\[bot\]"/g)?.length,
  1,
  'git user.name設定が重複しています。',
);
assert.equal(
  workflow.match(/git config user\.email "41898282\+github-actions\[bot\]@users\.noreply\.github\.com"/g)?.length,
  1,
  'git user.email設定が重複しています。',
);

const tempDir = await mkdtemp(join(tmpdir(), 'rescene-schedule-branch-'));
const gitEnvironment = {
  ...process.env,
  GIT_CONFIG_GLOBAL: '/dev/null',
  GIT_CONFIG_SYSTEM: '/dev/null',
};
const git = (cwd, ...args) => execFileSync('git', args, {
  cwd,
  encoding: 'utf8',
  env: gitEnvironment,
}).trim();

try {
  const originDir = join(tempDir, 'origin.git');
  const seedDir = join(tempDir, 'seed');
  const failedRunnerDir = join(tempDir, 'runner-without-identity');
  const runnerDir = join(tempDir, 'runner');
  await mkdir(seedDir);

  git(tempDir, 'init', '--bare', '-q', originDir);
  git(seedDir, 'init', '-q', '-b', 'main');
  git(seedDir, 'config', 'user.name', 'Repository Owner');
  git(seedDir, 'config', 'user.email', 'owner@example.invalid');
  await writeFile(join(seedDir, 'base.txt'), 'base\n');
  git(seedDir, 'add', 'base.txt');
  git(seedDir, 'commit', '-qm', 'initial');
  git(seedDir, 'remote', 'add', 'origin', originDir);
  git(seedDir, 'push', '-q', '-u', 'origin', 'main');

  git(seedDir, 'switch', '-q', '-c', 'automation/schedule-update');
  await writeFile(join(seedDir, 'schedule.txt'), 'schedule branch change\n');
  git(seedDir, 'add', 'schedule.txt');
  git(seedDir, 'commit', '-qm', 'schedule update');
  git(seedDir, 'push', '-q', '-u', 'origin', 'automation/schedule-update');

  git(seedDir, 'switch', '-q', 'main');
  await writeFile(join(seedDir, 'main.txt'), 'new main commit\n');
  git(seedDir, 'add', 'main.txt');
  git(seedDir, 'commit', '-qm', 'new main commit');
  git(seedDir, 'push', '-q', 'origin', 'main');

  git(tempDir, 'clone', '-q', '--branch', 'main', originDir, failedRunnerDir);
  git(failedRunnerDir, 'config', 'user.useConfigOnly', 'true');
  git(failedRunnerDir, 'fetch', '-q', 'origin', 'main');
  git(
    failedRunnerDir,
    'fetch',
    '-q',
    'origin',
    'automation/schedule-update:automation/schedule-update',
  );
  git(failedRunnerDir, 'switch', '-q', 'automation/schedule-update');
  const failedMerge = spawnSync(
    'git',
    ['merge', '--no-edit', 'origin/main'],
    { cwd: failedRunnerDir, encoding: 'utf8', env: gitEnvironment },
  );
  assert.equal(failedMerge.status, 128);
  assert.match(
    `${failedMerge.stdout}\n${failedMerge.stderr}`,
    /Committer identity unknown|empty ident name/,
    'Run #2のidentity未設定エラーを再現できませんでした。',
  );

  git(tempDir, 'clone', '-q', '--branch', 'main', originDir, runnerDir);
  git(runnerDir, 'config', 'user.useConfigOnly', 'true');
  git(runnerDir, 'config', 'user.name', 'github-actions[bot]');
  git(
    runnerDir,
    'config',
    'user.email',
    '41898282+github-actions[bot]@users.noreply.github.com',
  );
  git(runnerDir, 'fetch', '-q', 'origin', 'main');
  git(
    runnerDir,
    'fetch',
    '-q',
    'origin',
    'automation/schedule-update:automation/schedule-update',
  );
  git(runnerDir, 'switch', '-q', 'automation/schedule-update');
  git(runnerDir, 'merge', '--no-edit', 'origin/main');

  assert.equal(git(runnerDir, 'log', '-1', '--format=%cn'), 'github-actions[bot]');
  assert.equal(
    git(runnerDir, 'log', '-1', '--format=%ce'),
    '41898282+github-actions[bot]@users.noreply.github.com',
  );
  assert.equal(git(runnerDir, 'log', '-1', '--format=%P').split(' ').length, 2);
  assert.equal(await readFile(join(runnerDir, 'schedule.txt'), 'utf8'), 'schedule branch change\n');
  assert.equal(await readFile(join(runnerDir, 'main.txt'), 'utf8'), 'new main commit\n');
  assert.ok(Number(git(runnerDir, 'rev-list', '--count', 'origin/main..HEAD')) > 0);

  const ghCalls = [];
  let viewCount = 0;
  let waitCount = 0;
  const routeResult = await routeSchedulePullRequest({
    defaultBranch: 'main',
    updateBranch: 'automation/schedule-update',
    requiresReview: false,
    runGh: async (args) => {
      ghCalls.push(args);
      const command = args.slice(0, 2).join(' ');
      if (command === 'pr list') {
        return JSON.stringify([{ number: 1, title: '[Schedule auto] Sync official RESCENE calendar' }]);
      }
      if (command === 'pr edit') return '';
      if (command === 'pr view') {
        viewCount += 1;
        return JSON.stringify({
          number: 1,
          state: 'OPEN',
          isDraft: false,
          mergeable: viewCount === 1 ? 'UNKNOWN' : 'MERGEABLE',
          mergeStateStatus: viewCount === 1 ? 'UNKNOWN' : 'CLEAN',
          statusCheckRollup: [],
          autoMergeRequest: null,
        });
      }
      if (command === 'pr merge') return '';
      if (command === 'pr create') throw new Error('既存PR #1を再利用する必要があります。');
      throw new Error(`予期しないghコマンド: ${args.join(' ')}`);
    },
    wait: async () => { waitCount += 1; },
    maxAttempts: 3,
    retryDelayMs: 0,
    report: () => {},
  });

  assert.equal(routeResult.prNumber, 1);
  assert.equal(routeResult.autoMerge.status, 'enabled');
  assert.equal(routeResult.autoMerge.attempts, 2);
  assert.equal(waitCount, 1, 'auto-mergeのUNKNOWN retryに到達していません。');
  assert.equal(ghCalls.some((args) => args[1] === 'create'), false);
  assert.equal(ghCalls.some((args) => args[1] === 'edit' && args[2] === '1'), true);
  assert.equal(ghCalls.some((args) => args[1] === 'merge' && args[2] === '1'), true);
} finally {
  await rm(tempDir, { recursive: true, force: true });
}

console.log('Schedule branch継続・既存PR再利用テストOK');
