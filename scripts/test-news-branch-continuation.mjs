import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const workflow = await readFile(resolve(rootDir, '.github/workflows/update-news.yml'), 'utf8');
const updater = await readFile(resolve(rootDir, 'scripts/update-news.mjs'), 'utf8');
const continuationStart = workflow.indexOf('- name: Continue the news branch if it exists');
const mergeIndex = workflow.indexOf('git merge --no-edit "origin/$default_branch"', continuationStart);
const nameConfigIndex = workflow.indexOf('git config user.name "github-actions[bot]"', continuationStart);
const emailConfigIndex = workflow.indexOf(
  'git config user.email "41898282+github-actions[bot]@users.noreply.github.com"',
  continuationStart,
);

assert.notEqual(continuationStart, -1, 'News branch継続ステップがありません。');
assert.notEqual(mergeIndex, -1, '既存News branchへのmain mergeがありません。');
assert.ok(nameConfigIndex > continuationStart && nameConfigIndex < mergeIndex);
assert.ok(emailConfigIndex > continuationStart && emailConfigIndex < mergeIndex);
assert.equal(
  workflow.match(/git config user\.name "github-actions\[bot\]"/g)?.length,
  1,
  'News Workflowのgit user.name設定が重複しています。',
);
assert.equal(
  workflow.match(/git config user\.email "41898282\+github-actions\[bot\]@users\.noreply\.github\.com"/g)?.length,
  1,
  'News Workflowのgit user.email設定が重複しています。',
);

assert.match(workflow, /UPDATE_BRANCH: automation\/news-review/);
assert.match(workflow, /title="\[News review\] Official discoveries and approved drafts"/);
assert.match(workflow, /gh pr list --state open --head "\$UPDATE_BRANCH"/);
assert.match(workflow, /gh pr create --base "\$default_branch" --head "\$UPDATE_BRANCH"/);
assert.match(workflow, /gh pr edit "\$pr_number"/);
assert.doesNotMatch(workflow, /gh pr merge|--auto/, 'News Workflowが自動mergeを実行します。');
assert.match(workflow, /NEWS本文は自動マージされません/);
assert.match(updater, /status: 'candidate'/);
assert.match(updater, /if \(candidate\.status !== 'approved'\) continue;/);

const tempDir = await mkdtemp(join(tmpdir(), 'rescene-news-branch-'));
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
  await mkdir(join(seedDir, 'data/pending'), { recursive: true });

  git(tempDir, 'init', '--bare', '-q', originDir);
  git(seedDir, 'init', '-q', '-b', 'main');
  git(seedDir, 'config', 'user.name', 'Repository Owner');
  git(seedDir, 'config', 'user.email', 'owner@example.invalid');
  await writeFile(join(seedDir, 'data/news.json'), '[]\n');
  await writeFile(join(seedDir, 'data/content-meta.json'), '{}\n');
  await writeFile(join(seedDir, 'data/pending/news.json'), '[]\n');
  git(seedDir, 'add', 'data');
  git(seedDir, 'commit', '-qm', 'initial');
  git(seedDir, 'remote', 'add', 'origin', originDir);
  git(seedDir, 'push', '-q', '-u', 'origin', 'main');

  git(seedDir, 'switch', '-q', '-c', 'automation/news-review');
  await writeFile(
    join(seedDir, 'data/pending/news.json'),
    `${JSON.stringify([{ id: 'existing-candidate', status: 'candidate' }], null, 2)}\n`,
  );
  git(seedDir, 'add', 'data/pending/news.json');
  git(seedDir, 'commit', '-qm', 'chore(news): collect review candidates');
  git(seedDir, 'push', '-q', '-u', 'origin', 'automation/news-review');

  git(seedDir, 'switch', '-q', 'main');
  await writeFile(join(seedDir, 'schedule-main.txt'), 'main advanced by Schedule\n');
  git(seedDir, 'add', 'schedule-main.txt');
  git(seedDir, 'commit', '-qm', 'main advances');
  git(seedDir, 'push', '-q', 'origin', 'main');

  git(tempDir, 'clone', '-q', '--branch', 'main', originDir, failedRunnerDir);
  git(failedRunnerDir, 'config', 'user.useConfigOnly', 'true');
  git(failedRunnerDir, 'fetch', '-q', 'origin', 'main');
  git(
    failedRunnerDir,
    'fetch',
    '-q',
    'origin',
    'automation/news-review:automation/news-review',
  );
  git(failedRunnerDir, 'switch', '-q', 'automation/news-review');
  const failedMerge = spawnSync(
    'git',
    ['merge', '--no-edit', 'origin/main'],
    { cwd: failedRunnerDir, encoding: 'utf8', env: gitEnvironment },
  );
  assert.equal(failedMerge.status, 128);
  assert.match(
    `${failedMerge.stdout}\n${failedMerge.stderr}`,
    /Committer identity unknown|empty ident name/,
    'News Workflowのidentity未設定エラーを再現できませんでした。',
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
    'automation/news-review:automation/news-review',
  );
  git(runnerDir, 'switch', '-q', 'automation/news-review');
  git(runnerDir, 'merge', '--no-edit', 'origin/main');

  assert.equal(git(runnerDir, 'log', '-1', '--format=%cn'), 'github-actions[bot]');
  assert.equal(
    git(runnerDir, 'log', '-1', '--format=%ce'),
    '41898282+github-actions[bot]@users.noreply.github.com',
  );
  assert.equal(git(runnerDir, 'log', '-1', '--format=%P').split(' ').length, 2);
  assert.equal(await readFile(join(runnerDir, 'schedule-main.txt'), 'utf8'), 'main advanced by Schedule\n');
  assert.match(
    await readFile(join(runnerDir, 'data/pending/news.json'), 'utf8'),
    /existing-candidate/,
  );
  git(runnerDir, 'merge-base', '--is-ancestor', 'origin/main', 'HEAD');

  const changedFiles = workflow.match(
    /git add data\/news\.json data\/content-meta\.json data\/pending\/news\.json/,
  );
  assert.ok(changedFiles, 'News commit対象ファイルが変わっています。');
} finally {
  await rm(tempDir, { recursive: true, force: true });
}

console.log('News branch継続・review停止方針テストOK');
