#!/usr/bin/env node
/**
 * 一键建 PR + 入 auto-merge 队列。
 *
 * 用法：
 *   pnpm pr                              # 用最近一个 commit 的 message 填 title/body
 *   pnpm pr --title "自定义" --body "..."  # 覆盖任意字段
 *   pnpm pr --base release/v1            # 改目标分支（默认 main）
 *
 * 所有 --xxx 参数都会原样透传给 `gh pr create`。
 */
import { spawnSync } from 'node:child_process';

const extraArgs = process.argv.slice(2);

// 如果调用方没传 --base，就默认 main
const hasBase = extraArgs.some((arg) => arg === '--base' || arg === '-B');

const createArgs = ['pr', 'create', '--fill', ...(hasBase ? [] : ['--base', 'main']), ...extraArgs];

const create = spawnSync('gh', createArgs, { stdio: 'inherit' });
if (create.status !== 0) {
  process.exit(create.status ?? 1);
}

const merge = spawnSync('gh', ['pr', 'merge', '--auto', '--squash', '--delete-branch'], {
  stdio: 'inherit',
});
process.exit(merge.status ?? 0);
