/**
 * Kitora 种子脚本
 *
 * 仅在本地 dev 数据库运行，用于快速造一套可登录 / 可看 dashboard 的
 * 基线数据。**禁止**在 production 或 staging 数据库上跑。
 *
 * 触发方式：
 *   pnpm db:seed
 *
 * 当前阶段（Phase 0）仅占位，Phase 1 认证系统落地后补真正的 seed 数据。
 */
import { prisma } from '../src';

function main(): Promise<void> {
  // Phase 0 占位——没有真正的异步操作，保持签名返回 Promise 以兼容下方 .then/.catch 链
  console.log('⏳ Seed script scaffold — no-op in Phase 0.');
  return Promise.resolve();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
