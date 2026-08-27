import { execFile } from 'node:child_process';
import { appendFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const AUTO_TITLE = '[Schedule auto] Sync official RESCENE calendar';
const AUTO_BODY = 'RESCENE公式Mnet PlusカレンダーからのSchedule更新です。重複判定、schema validation、型検査、lint、build、主要リンク検査が完了し、削除・日付変更・曖昧一致・非一次情報・大量変更は検出されていません。';
const REVIEW_TITLE = '[Schedule review] Official calendar needs confirmation';
const REVIEW_BODY = '自動反映の安全条件を満たさなかったSchedule更新です。data/pending/schedules.jsonと変更差分を確認してください。日付変更、公式予定の消失、同一イベント判定、一次情報、変更件数のいずれかが確認対象です。';

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const parseJson = (value, description) => {
  try {
    return JSON.parse(value);
  } catch (error) {
    throw new Error(`${description}のJSONを解析できませんでした。`, { cause: error });
  }
};

const transientMergeError = (error) => /(?:unstable status|mergeability.*(?:calculat|unknown)|merge state.*(?:calculat|unknown))/i
  .test(error instanceof Error ? error.message : String(error));

const runGhCommand = async (args) => {
  try {
    const { stdout } = await execFileAsync('gh', args, { encoding: 'utf8' });
    return stdout.trim();
  } catch (cause) {
    const message = cause.stderr?.trim() || cause.stdout?.trim() || cause.message;
    throw new Error(message, { cause });
  }
};

const retryOrDefer = async ({ attempt, maxAttempts, retryDelayMs, reason, wait, report }) => {
  if (attempt >= maxAttempts) {
    report(`Schedule PRのauto-merge設定を保留しました: ${reason}（${maxAttempts}回確認）。次回実行で再試行します。`);
    return false;
  }
  report(`Schedule PRのmerge状態を再確認します (${attempt}/${maxAttempts}): ${reason}`);
  await wait(retryDelayMs);
  return true;
};

export const enableScheduleAutoMerge = async ({
  prNumber,
  runGh = runGhCommand,
  wait = delay,
  maxAttempts = 18,
  retryDelayMs = 10_000,
  report = console.log,
}) => {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const raw = await runGh([
      'pr',
      'view',
      String(prNumber),
      '--json',
      'number,state,isDraft,mergeable,mergeStateStatus,statusCheckRollup,autoMergeRequest',
    ]);
    const pr = parseJson(raw, `Schedule PR #${prNumber}`);

    if (pr.autoMergeRequest) {
      report(`Schedule PR #${prNumber}はすでにauto-merge設定済みです。`);
      return { status: 'already-enabled', attempts: attempt };
    }
    if (pr.state === 'MERGED') {
      report(`Schedule PR #${prNumber}はすでにmerge済みです。`);
      return { status: 'already-merged', attempts: attempt };
    }
    if (pr.state !== 'OPEN') {
      throw new Error(`Schedule PR #${prNumber}はOPENではありません (${pr.state ?? 'UNKNOWN'})。`);
    }
    if (pr.isDraft || pr.mergeStateStatus === 'DRAFT') {
      throw new Error(`Schedule PR #${prNumber}はdraftのためauto-mergeできません。`);
    }
    if (pr.mergeable === 'CONFLICTING' || pr.mergeStateStatus === 'DIRTY') {
      throw new Error(`Schedule PR #${prNumber}にmerge conflictがあります。`);
    }

    if (pr.mergeable === 'UNKNOWN' || ['UNKNOWN', 'UNSTABLE'].includes(pr.mergeStateStatus)) {
      const shouldRetry = await retryOrDefer({
        attempt,
        maxAttempts,
        retryDelayMs,
        reason: `${pr.mergeable ?? 'UNKNOWN'} / ${pr.mergeStateStatus ?? 'UNKNOWN'}`,
        wait,
        report,
      });
      if (!shouldRetry) return { status: 'deferred', attempts: attempt };
      continue;
    }

    try {
      await runGh(['pr', 'merge', String(prNumber), '--auto', '--squash', '--delete-branch']);
      report(`Safe Schedule PR #${prNumber} was set to auto-merge.`);
      return { status: 'enabled', attempts: attempt };
    } catch (error) {
      if (!transientMergeError(error)) throw error;
      const shouldRetry = await retryOrDefer({
        attempt,
        maxAttempts,
        retryDelayMs,
        reason: error.message,
        wait,
        report,
      });
      if (!shouldRetry) return { status: 'deferred', attempts: attempt };
    }
  }

  throw new Error('Schedule PRのauto-merge再試行処理が予期せず終了しました。');
};

export const routeSchedulePullRequest = async ({
  defaultBranch,
  updateBranch,
  requiresReview,
  runGh = runGhCommand,
  wait = delay,
  maxAttempts = 18,
  retryDelayMs = 10_000,
  report = console.log,
}) => {
  const rawOpenPrs = await runGh([
    'pr',
    'list',
    '--state',
    'open',
    '--head',
    updateBranch,
    '--json',
    'number,title',
    '--limit',
    '1',
  ]);
  const openPrs = parseJson(rawOpenPrs, 'open Schedule PR一覧');
  const existingPr = openPrs[0];
  const route = requiresReview || existingPr?.title?.startsWith('[Schedule review]')
    ? 'review'
    : 'auto';
  const title = route === 'review' ? REVIEW_TITLE : AUTO_TITLE;
  const body = route === 'review' ? REVIEW_BODY : AUTO_BODY;

  let prNumber = existingPr?.number;
  if (prNumber) {
    await runGh(['pr', 'edit', String(prNumber), '--title', title, '--body', body]);
    report(`既存のSchedule PR #${prNumber}を再利用しました。`);
  } else {
    const createOutput = await runGh([
      'pr',
      'create',
      '--base',
      defaultBranch,
      '--head',
      updateBranch,
      '--title',
      title,
      '--body',
      body,
    ]);
    const createdNumber = createOutput.match(/\/pull\/(\d+)/)?.[1];
    if (createdNumber) {
      prNumber = Number(createdNumber);
    } else {
      const rawCreatedPr = await runGh(['pr', 'view', updateBranch, '--json', 'number']);
      prNumber = parseJson(rawCreatedPr, '作成済みSchedule PR').number;
    }
    if (!prNumber) throw new Error('作成したSchedule PRの番号を取得できませんでした。');
    report(`Schedule PR #${prNumber}を作成しました。`);
  }

  if (route === 'review') {
    report(`Schedule PR #${prNumber} requires human review and was not merged.`);
    return { prNumber, route, autoMerge: null };
  }

  const autoMerge = await enableScheduleAutoMerge({
    prNumber,
    runGh,
    wait,
    maxAttempts,
    retryDelayMs,
    report,
  });
  return { prNumber, route, autoMerge };
};

const positiveInteger = (value, fallback, name) => {
  const parsed = Number.parseInt(value ?? String(fallback), 10);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    throw new Error(`${name}は正の整数で指定してください。`);
  }
  return parsed;
};

const main = async () => {
  const defaultBranch = process.env.DEFAULT_BRANCH;
  const updateBranch = process.env.UPDATE_BRANCH;
  if (!defaultBranch || !updateBranch) {
    throw new Error('DEFAULT_BRANCHとUPDATE_BRANCHが必要です。');
  }

  const summaryLines = [];
  const report = (message) => {
    console.log(message);
    summaryLines.push(`- ${message}`);
  };

  await routeSchedulePullRequest({
    defaultBranch,
    updateBranch,
    requiresReview: process.env.REQUIRES_REVIEW === 'true',
    maxAttempts: positiveInteger(
      process.env.AUTO_MERGE_MAX_ATTEMPTS,
      18,
      'AUTO_MERGE_MAX_ATTEMPTS',
    ),
    retryDelayMs: positiveInteger(
      process.env.AUTO_MERGE_RETRY_SECONDS,
      10,
      'AUTO_MERGE_RETRY_SECONDS',
    ) * 1000,
    report,
  });

  if (process.env.GITHUB_STEP_SUMMARY && summaryLines.length > 0) {
    await appendFile(process.env.GITHUB_STEP_SUMMARY, `${summaryLines.join('\n')}\n`);
  }
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
