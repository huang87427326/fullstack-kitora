/**
 * Prisma 配置文件
 *
 * 用途：
 *   1. 替代已 deprecated 的 `package.json#prisma` 配置（主要是 seed 脚本）
 *   2. 显式加载 .env——CLI 一旦检测到 prisma.config.ts，就会跳过自动 env 加载，
 *      所以必须在这里调用 dotenv，下面的 datasource 以及运行时 `@prisma/client`
 *      才能拿到 DATABASE_URL / DIRECT_URL
 *   3. 集中声明数据源连接（engine: 'classic' + datasource），覆盖 schema.prisma
 *      里的 `datasource db { url ... }` 字段——这是 Prisma 6 推荐的做法，
 *      schema.prisma 不再承载连接配置
 *
 * 参考：https://pris.ly/prisma-config
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { config as loadEnv } from 'dotenv';
import { defineConfig } from 'prisma/config';

// Monorepo 约定：.env 放在仓库根，所有 package 共享一份。pnpm 跑 postinstall /
// prisma CLI 时 cwd 是 packages/db，所以 dotenv 的默认行为（从 cwd 找 .env）
// 找不到。这里显式从当前文件往上走两层找根 .env；packages/db/.env 作为本地
// 覆盖后加载（override=true 允许覆盖根 .env 的同名 key）。
const here = path.dirname(fileURLToPath(import.meta.url));
loadEnv({ path: path.resolve(here, '..', '..', '.env') });
loadEnv({ path: path.resolve(here, '.env'), override: true });

// Supabase 连接：
//   - DATABASE_URL：运行时连接（pgbouncer 6543，transaction mode）
//   - DIRECT_URL：DDL / migrate / studio（direct 5432）
//
// 若 DATABASE_URL 未设置（首次 clone / CI 装依赖时很常见），退化成一个
// 明显不可用的占位值：prisma generate 不需要真实数据库也能跑通（postinstall
// 不会被阻塞），真正需要连接的命令（migrate / push / studio）会在执行阶段
// 由 Prisma 自己报 "can't reach database" 之类的错——比在 config 里硬抛更
// 贴近用户意图。
const DATABASE_URL_PLACEHOLDER = 'postgresql://placeholder:placeholder@localhost:5432/placeholder';
const databaseUrl = process.env.DATABASE_URL ?? DATABASE_URL_PLACEHOLDER;

if (!process.env.DATABASE_URL) {
  console.warn(
    '[prisma] DATABASE_URL 未设置，使用占位 URL。generate 可以继续，' +
      'migrate / push / studio 等需要连 DB 的命令会失败——请在 .env 中配置后重试。',
  );
}

export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  engine: 'classic',
  datasource: {
    url: databaseUrl,
    directUrl: process.env.DIRECT_URL,
  },
  migrations: {
    path: path.join('prisma', 'migrations'),
    seed: 'tsx prisma/seed.ts',
  },
});
