/**
 * Prisma 配置文件
 *
 * 用途：
 *   1. 替代已 deprecated 的 `package.json#prisma` 配置（主要是 seed 脚本）
 *   2. 显式加载 .env——CLI 一旦检测到 prisma.config.ts，就会跳过自动 env 加载，
 *      所以必须在这里 `import 'dotenv/config'`，schema.prisma 里的
 *      `env("DATABASE_URL")` / `env("DIRECT_URL")` 才能拿到值
 *
 * 当前保持 "classic" 连接模式：url / directUrl 仍然写在 schema.prisma 里
 * （CLI 6.19.3 的 WASM schema 校验器仍强制要求这两个字段）。
 * 等 CLI 正式支持 `engine: 'js'` + driver adapter 时，再迁到 adapter 模式。
 *
 * 参考：https://pris.ly/prisma-config
 */
import 'dotenv/config';
import path from 'node:path';

import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  migrations: {
    path: path.join('prisma', 'migrations'),
    seed: 'tsx prisma/seed.ts',
  },
});
