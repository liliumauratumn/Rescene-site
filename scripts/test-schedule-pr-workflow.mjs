import assert from 'node:assert/strict';
import { routeSchedulePullRequest } from './route-schedule-pr.mjs';

const prState = (overrides = {}) => JSON.stringify({
  number: 1,
  state: 'OPEN',
  isDraft: false,
  mergeable: 'MERGEABLE',
  mergeStateStatus: 'BLOCKED',
  statusCheckRollup: [
    { __typename: 'StatusContext', context: 'Vercel', state: 'PENDING' },
  ],
  autoMergeRequest: null,
  ...overrides,
});

const actualLogStates = [
  prState({ mergeable: 'UNKNOWN', mergeStateStatus: 'UNKNOWN', statusCheckRollup: [] }),
  prState({ mergeStateStatus: 'UNSTABLE' }),
  prState(),
  prState({
    mergeStateStatus: 'CLEAN',
    statusCheckRollup: [
      { __typename: 'StatusContext', context: 'Vercel', state: 'SUCCESS' },
    ],
  }),
];
const calls = [];
const reports = [];
let mergeAttempts = 0;
let waitCount = 0;
const runGh = async (args) => {
  calls.push(args);
  const command = args.slice(0, 2).join(' ');
  if (command === 'pr list') return '[]';
  if (command === 'pr create') return 'https://github.com/liliumauratumn/Rescene-site/pull/1';
  if (command === 'pr edit') throw new Error('新規PR作成時にeditしてはいけません。');
  if (command === 'pr view') return actualLogStates.shift();
  if (command === 'pr merge') {
    mergeAttempts += 1;
    if (mergeAttempts === 1) {
      throw new Error('GraphQL: Pull request Pull request is in unstable status (enablePullRequestAutoMerge)');
    }
    return '';
  }
  throw new Error(`予期しないghコマンド: ${args.join(' ')}`);
};

const result = await routeSchedulePullRequest({
  defaultBranch: 'main',
  updateBranch: 'automation/schedule-update',
  requiresReview: false,
  runGh,
  wait: async () => { waitCount += 1; },
  maxAttempts: 6,
  retryDelayMs: 0,
  report: (message) => reports.push(message),
});

assert.equal(result.prNumber, 1);
assert.equal(result.route, 'auto');
assert.equal(result.autoMerge.status, 'enabled');
assert.equal(result.autoMerge.attempts, 4);
assert.equal(waitCount, 3, 'UNKNOWN、UNSTABLE、GraphQL raceの各状態で待機する必要があります。');
assert.equal(mergeAttempts, 2, '一時的なGraphQL unstableエラーをretryしていません。');
assert.equal(
  calls.some((args) => args[0] === 'pr' && args[1] === 'create'),
  true,
  'Schedule PRを作成していません。',
);
assert.match(reports.join('\n'), /Schedule PR #1を作成/);
assert.match(reports.join('\n'), /unstable status/);

const reuseCalls = [];
const reused = await routeSchedulePullRequest({
  defaultBranch: 'main',
  updateBranch: 'automation/schedule-update',
  requiresReview: false,
  runGh: async (args) => {
    reuseCalls.push(args);
    const command = args.slice(0, 2).join(' ');
    if (command === 'pr list') {
      return JSON.stringify([{ number: 1, title: '[Schedule auto] Sync official RESCENE calendar' }]);
    }
    if (command === 'pr edit') return '';
    if (command === 'pr view') return prState({ mergeStateStatus: 'CLEAN' });
    if (command === 'pr merge') return '';
    if (command === 'pr create') throw new Error('既存PR #1があるためcreateしてはいけません。');
    throw new Error(`予期しないghコマンド: ${args.join(' ')}`);
  },
  wait: async () => {},
  maxAttempts: 3,
  retryDelayMs: 0,
  report: () => {},
});
assert.equal(reused.prNumber, 1);
assert.equal(reused.autoMerge.status, 'enabled');
assert.equal(reuseCalls.some((args) => args[0] === 'pr' && args[1] === 'create'), false);
assert.equal(
  reuseCalls.some((args) => args[0] === 'pr' && args[1] === 'edit' && args[2] === '1'),
  true,
  '既存のopen PR #1を再利用していません。',
);

let conflictMergeCalled = false;
await assert.rejects(
  routeSchedulePullRequest({
    defaultBranch: 'main',
    updateBranch: 'automation/schedule-update',
    requiresReview: false,
    runGh: async (args) => {
      const command = args.slice(0, 2).join(' ');
      if (command === 'pr list') return JSON.stringify([{ number: 1, title: '[Schedule auto] Test' }]);
      if (command === 'pr edit') return '';
      if (command === 'pr view') {
        return prState({ mergeable: 'CONFLICTING', mergeStateStatus: 'DIRTY' });
      }
      if (command === 'pr merge') conflictMergeCalled = true;
      return '';
    },
    wait: async () => {},
    maxAttempts: 3,
    retryDelayMs: 0,
    report: () => {},
  }),
  /merge conflict/,
);
assert.equal(conflictMergeCalled, false, 'conflict状態でmergeを実行しました。');

let pendingViews = 0;
const deferred = await routeSchedulePullRequest({
  defaultBranch: 'main',
  updateBranch: 'automation/schedule-update',
  requiresReview: false,
  runGh: async (args) => {
    const command = args.slice(0, 2).join(' ');
    if (command === 'pr list') return JSON.stringify([{ number: 1, title: '[Schedule auto] Test' }]);
    if (command === 'pr edit') return '';
    if (command === 'pr view') {
      pendingViews += 1;
      return prState({ mergeStateStatus: 'UNSTABLE' });
    }
    throw new Error(`pending中に呼んではいけないコマンド: ${args.join(' ')}`);
  },
  wait: async () => {},
  maxAttempts: 3,
  retryDelayMs: 0,
  report: () => {},
});
assert.equal(deferred.autoMerge.status, 'deferred');
assert.equal(pendingViews, 3);

console.log('Schedule PR auto-merge raceテストOK');
