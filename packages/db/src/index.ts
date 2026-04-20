/**
 * Kitora 数据库层入口
 *
 * 提供一个全局 PrismaClient 单例：
 * - 生产环境：进程内一次 `new PrismaClient()` 足够，HMR 无风险
 * - 开发环境：热更新会重复执行模块顶层代码，若每次 new 会泄漏连接。这里
 *   把实例挂到 globalThis 上重用，保证整个 dev server 生命周期内只
 *   有一份连接池
 *
 * 同时把 Prisma 生成的全部类型和命名空间 re-export 出去，调用方只需要
 * `import { prisma, type User } from '@kitora/db'` 即可，不必再直接
 * 依赖 `@prisma/client`。
 */
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export * from '@prisma/client';
