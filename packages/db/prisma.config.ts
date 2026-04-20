/**
 * Prisma 配置文件
 *
 * 用途：
 *   1. 替代已 deprecated 的 `package.json#prisma` 配置（主要是 seed 脚本）
 *   2. 显式加载 .env——CLI 一旦检测到 prisma.config.ts，就会跳过自动 env 加载
 *      （日志里能看到 "Prisma config detected, skipping environment variable
 *      loading."），schema.prisma 里的 `env("DATABASE_URL")` / `env("DIRECT_URL")`
 *      要靠这里来喂
 *
 * 关于连接模式：
 *   本来 Prisma 6 提供了 `engine: 'classic'` + `datasource: { url, directUrl }`
 *   可以把 URL 迁到这里集中管理，但 CLI 6.19.3 的 WASM schema 校验器仍然
 *   强制要求 schema.prisma 的 datasource 块里有 `url`，所以暂不迁，保持
 *   schema env(...) 这套写法。
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

export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  migrations: {
    path: path.join('prisma', 'migrations'),
    seed: 'tsx prisma/seed.ts',
  },
});
