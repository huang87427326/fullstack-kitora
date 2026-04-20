#!/usr/bin/env node
/**
 * ship —— 从「当前分支已 push」一路交付到「PR 合并、本地干净」的自动化入口。
 *
 * 流程：
 *   0. git fetch --prune              先清理已被远端删除的僵尸 tracking ref
 *   1. gh pr create --fill            用最近一条 commit 填 title/body
 *   2. gh pr merge --auto --squash    入 auto-merge 队列，合并后自动删远端分支
 *   3. 轮询 gh pr view 的 state       每 15 秒查一次，直到 MERGED / CLOSED / 超时
 *   4. git checkout main && pull      拉回已包含本次合并的最新 main
 *   5. git branch -D <feature>        清理本地功能分支
 *
 * 用法：
 *   pnpm ship                              # 最常见：全流程跑到本地干净
 *   pnpm ship --title "..." --body "..."   # 覆盖 title / body
 *   pnpm ship --base release/v1            # 改目标分支（默认 main）
 *   pnpm ship --no-wait                    # 只做 1–2 步，不轮询、不清理本地
 *
 *   其他 --xxx 参数原样透传给 `gh pr create`。
 *
 * 退出行为：
 *   - 第 3 步默认等待上限 30 分钟；超时后退出，PR 仍会在 GitHub 后台自动合并
 *   - Ctrl+C 中断安全：PR 已进队列，回头手动切回 main + 删本地分支即可
 *   - 若 PR 变为 CLOSED（CI 失败被打回、人为关闭）：不清理本地，便于继续修
 *
 * 前置条件：
 *   - gh CLI 已登录（gh auth status 确认）
 *   - 仓库开启了 Allow auto-merge（Settings → General → Pull Requests）
 *   - 当前分支已 push 到 origin（本脚本不负责 push）
 */
import { spawnSync } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const rawArgs = process.argv.slice(2);
const noWait = rawArgs.includes('--no-wait');
const extraArgs = rawArgs.filter((a) => a !== '--no-wait');

const hasBase = extraArgs.some((arg) => arg === '--base' || arg === '-B');

// 0. 开车前先扫僵尸：清理本地已陈旧的 remote-tracking ref
//    场景：上一轮 ship 走的是 --no-wait / 被 Ctrl+C 中断 / 在别的设备上完成了
//    合并，本机 .git/refs/remotes/origin/ 下还留着已不存在的分支指针。VSCode
//    等 UI 会继续显示这些分支。step 4 的 prune 只能处理"本轮刚删的分支"，
//    处理不了跨会话遗留的僵尸——所以这里显式再扫一次，覆盖所有历史退出路径。
spawnSync('git', ['fetch', '--prune'], { stdio: 'inherit' });

// 1. 建 PR
const createArgs = ['pr', 'create', '--fill', ...(hasBase ? [] : ['--base', 'main']), ...extraArgs];
const create = spawnSync('gh', createArgs, { stdio: 'inherit' });
if (create.status !== 0) {
  process.exit(create.status ?? 1);
}

// 2. 入 auto-merge 队列（--delete-branch 会在合并后自动删远端分支）
const merge = spawnSync('gh', ['pr', 'merge', '--auto', '--squash', '--delete-branch'], {
  stdio: 'inherit',
});
if (merge.status !== 0) {
  process.exit(merge.status ?? 1);
}

if (noWait) {
  process.exit(0);
}

// 3. 记下当前分支，合并后要删
const branch = spawnSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], {
  encoding: 'utf8',
}).stdout.trim();
if (!branch || branch === 'main') {
  process.exit(0);
}

// 4. 轮询 PR 状态，等 CI + merge 完成
console.log(
  '\n⏳ 已入 auto-merge 队列，等待合并完成后自动清理本地分支',
  '\n   （Ctrl+C 可随时退出，PR 仍会在后台自动合并）\n',
);

const POLL_INTERVAL_MS = 15_000;
const TIMEOUT_MS = 30 * 60 * 1000;
const start = Date.now();

function getState() {
  const r = spawnSync('gh', ['pr', 'view', '--json', 'state', '-q', '.state'], {
    encoding: 'utf8',
  });
  return r.status === 0 ? r.stdout.trim() : null;
}

let state = getState();
while (state === 'OPEN') {
  if (Date.now() - start > TIMEOUT_MS) {
    console.log('\n⚠️  30 分钟仍未合并，退出等待。合并后手动切回 main 删本地分支即可。');
    process.exit(0);
  }
  await sleep(POLL_INTERVAL_MS);
  state = getState();
}

if (state !== 'MERGED') {
  console.log(`\nPR 状态变为 ${state ?? '未知'}，不做清理。`);
  process.exit(0);
}

// 5. 收尾：切回 main、拉最新并 prune、删本地分支
//    注意用 -D 强删：GitHub squash merge 会生成新 commit，原分支的 commit SHA
//    不在 main 上，`-d` 会判定为 "not fully merged" 拒删。此处已轮询确认
//    state === MERGED，内容必在 main 里，-D 是安全且必要的。
//
//    ⚠️ 这里必须拆成「不带 refspec 的 fetch --prune」+「ff-only 合入」，不能
//    直接用 `git pull --prune origin main`。原因：git 在 fetch/pull 带具体
//    refspec 时，会把 --prune 的作用域也收窄到那条 refspec 上，只清 main 自己，
//    不会清 origin/feat-xxx。刚被 GitHub auto-delete-branch 干掉的当前分支
//    tracking ref 就会留下来——正是我们要根治的问题。
//    `git fetch --prune origin`（不带具体 ref）才会按配置的完整 fetch refspec
//    清理所有 stale remote-tracking refs。
console.log('\n✅ PR 已合并，清理本地…');
spawnSync('git', ['checkout', 'main'], { stdio: 'inherit' });
spawnSync('git', ['fetch', '--prune', 'origin'], { stdio: 'inherit' });
spawnSync('git', ['merge', '--ff-only', 'origin/main'], { stdio: 'inherit' });
spawnSync('git', ['branch', '-D', branch], { stdio: 'inherit' });
console.log('🎉 Done.');
