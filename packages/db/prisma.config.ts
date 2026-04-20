/**
 * Prisma 配置文件
 *
 * 用途：
 *   1. 替代已 deprecated 的 `package.json#prisma` 配置（主要是 seed 脚本）
 *   2. 显式加载 .env——CLI 一旦检测到 prisma.config.ts，就会跳过自动 env 加载，
 *      所以必须在这里 `import 'dotenv/config'`，下面的 datasource 以及运行时
 *      `@prisma/client` 才能拿到 DATABASE_URL / DIRECT_URL
 *   3. 集中声明数据源连接（engine: 'classic' + datasource），覆盖 schema.prisma
 *      里的 `datasource db { url ... }` 字段——这是 Prisma 6 推荐的做法，
 *      schema.prisma 不再承载连接配置
 *
 * 参考：https://pris.ly/prisma-config
 */
import 'dotenv/config';
import path from 'node:path';

import { defineConfig } from 'prisma/config';

// Supabase 连接：
//   - DATABASE_URL：运行时连接（pgbouncer 6543，transaction mode）
//   - DIRECT_URL：DDL / migrate / studio（direct 5432）
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is required but not set. Check your .env file.');
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
