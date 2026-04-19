# Kitora

> `{{PRODUCT_DESCRIPTION}}`（产品定位待补充）

[![Status](https://img.shields.io/badge/status-in%20development-yellow)]()
[![License](https://img.shields.io/badge/license-proprietary-red)]()

Kitora 是一个面向全球市场的 SaaS 产品，采用 Next.js 全栈 + Monorepo 架构，独立开发者模式运营。

**主站**：https://kitora.co（待上线）

---

## 目录

- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [环境要求](#环境要求)
- [快速开始](#快速开始)
- [常用命令](#常用命令)
- [开发工作流](#开发工作流)
- [部署](#部署)
- [文档](#文档)

---

## 技术栈

| 类别     | 选型                             |
| -------- | -------------------------------- |
| 语言     | TypeScript（严格模式）           |
| 框架     | Next.js 16（App Router）         |
| UI       | React + Tailwind CSS + shadcn/ui |
| 数据库   | PostgreSQL（Supabase 托管）      |
| ORM      | Prisma                           |
| 认证     | Supabase Auth                    |
| 支付     | Lemon Squeezy                    |
| 邮件     | Resend + React Email             |
| 国际化   | next-intl                        |
| 监控观测 | Sentry + PostHog + Better Stack  |
| 部署     | Vercel                           |
| 包管理   | pnpm                             |
| 构建工具 | Turborepo                        |

完整架构说明见 [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)。

---

## 项目结构

```
kitora/
├── apps/
│   ├── web/                  # 主 SaaS 应用（登录后的 dashboard）
│   ├── admin/                # 内部管理后台
│   └── marketing/            # 营销官网（landing / pricing / blog）
│
├── packages/
│   ├── db/                   # Prisma schema + client
│   ├── auth/                 # 认证逻辑封装
│   ├── ui/                   # 共享 React 组件（shadcn/ui 基础）
│   ├── email/                # Resend + React Email 模板
│   ├── i18n/                 # next-intl 配置与消息字典
│   ├── config/               # 共享配置（tsconfig / eslint / tailwind preset）
│   ├── utils/                # 通用工具函数
│   └── types/                # 跨 app 的共享 TypeScript 类型
│
├── docs/                     # 项目文档
│   ├── ARCHITECTURE.md       # 技术架构与决策
│   ├── ROADMAP.md            # 开发路线图
│   └── adr/                  # Architecture Decision Records
│
├── .github/                  # GitHub Actions workflows
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
├── tsconfig.base.json
├── CONTRIBUTING.md
└── .env.example
```

---

## 环境要求

本地开发前请确保已安装：

- **Node.js** ≥ 22（推荐使用 [fnm](https://github.com/Schniz/fnm) 或 [nvm](https://github.com/nvm-sh/nvm) 管理版本，仓库根目录的 `.nvmrc` 固定了版本）
- **pnpm** ≥ 9（通过 `corepack enable` 启用，版本由 `package.json` 的 `packageManager` 字段固定）
- **Git** ≥ 2.40

可选但推荐：

- **Docker Desktop**：用于本地 Postgres（如不使用 Supabase Cloud 的 dev 项目）
- **VS Code** + 推荐扩展：ESLint、Prettier、Tailwind CSS IntelliSense、Prisma

---

## 快速开始

### 1. 克隆仓库

```bash
git clone git@github.com:{{GITHUB_ORG}}/kitora.git
cd kitora
```

### 2. 启用 pnpm 并安装依赖

```bash
corepack enable
pnpm install
```

### 3. 配置环境变量

```bash
cp .env.example .env.local
```

编辑 `.env.local`，填入以下关键变量（详见 `.env.example` 注释）：

- `DATABASE_URL`：Supabase 或本地 Postgres 连接串
- `DIRECT_URL`：Supabase 直连 URL（用于 Prisma migrate）
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`：Supabase 项目配置
- `RESEND_API_KEY`：Resend API 密钥
- `LEMONSQUEEZY_API_KEY` / `LEMONSQUEEZY_WEBHOOK_SECRET`：Lemon Squeezy 配置
- `SENTRY_DSN` / `NEXT_PUBLIC_POSTHOG_KEY` / `POSTHOG_HOST`：监控服务

### 4. 初始化数据库

```bash
pnpm db:migrate:dev
```

首次运行会创建 schema 并生成 Prisma Client。

### 5. 启动开发服务器

```bash
pnpm dev
```

Turborepo 会并行启动三个 app：

| App       | 本地地址              |
| --------- | --------------------- |
| web       | http://localhost:3000 |
| admin     | http://localhost:3001 |
| marketing | http://localhost:3002 |

首次启动耗时约 30 秒（编译 + 首次渲染），后续热更新秒级。

---

## 常用命令

所有命令在仓库根目录执行，通过 Turborepo 分发到对应 app / package。

### 开发

```bash
pnpm dev                    # 并行启动所有 app 的 dev server
pnpm dev --filter=web       # 只启动 web
pnpm dev --filter=marketing # 只启动 marketing
```

### 构建

```bash
pnpm build                  # 构建所有 app
pnpm build --filter=web     # 只构建 web
```

### 代码质量

```bash
pnpm lint                   # ESLint 全仓库
pnpm typecheck              # TypeScript 类型检查
pnpm format                 # Prettier 格式化
pnpm format:check           # 只检查格式不修改
```

### 测试

```bash
pnpm test                   # 跑所有 Vitest 单元测试
pnpm test:e2e               # 跑 Playwright E2E 测试
pnpm test --filter=@kitora/auth  # 指定 package 测试
```

### 数据库

```bash
pnpm db:migrate:dev         # 开发环境创建并应用迁移
pnpm db:migrate:deploy      # 生产环境应用已有迁移
pnpm db:studio              # 启动 Prisma Studio（GUI 查看/编辑数据）
pnpm db:seed                # 跑种子数据脚本（如有）
pnpm db:reset               # 清空并重新应用所有迁移（仅 dev 环境）
```

### 邮件模板开发

```bash
pnpm email:dev              # 启动 React Email 预览服务器
```

### 清理

```bash
pnpm clean                  # 清理所有 build 产物和 node_modules
```

---

## 开发工作流

详细规范见 [CONTRIBUTING.md](CONTRIBUTING.md)。简要流程：

1. **起分支**：从 `main` 拉新分支，命名规范 `<type>/<short-description>`（如 `feat/add-pricing-page`）
2. **开发**：本地修改，`pnpm dev` 验证
3. **提交**：commit 信息遵循 [Conventional Commits](https://www.conventionalcommits.org/)（如 `feat(web): add pricing page`）
4. **推送 + PR**：推到远程后在 GitHub 提 PR，CI 会自动跑 lint / typecheck / test / build
5. **合并**：CI 通过后合入 `main`，Vercel 自动部署

---

## 部署

三个 app 在 Vercel 各自独立部署：

| App       | 域名            | Vercel Project Root |
| --------- | --------------- | ------------------- |
| web       | app.kitora.co   | `apps/web`          |
| admin     | admin.kitora.co | `apps/admin`        |
| marketing | kitora.co       | `apps/marketing`    |

### 分支策略

- `main` → Production（自动部署到 `kitora.co` / `app.kitora.co` / `admin.kitora.co`）
- 任何 PR → Vercel Preview 环境（自动生成临时 URL，PR 关闭后回收）
- `staging` → Staging 环境（**Phase 2 Beta 阶段再启用**，MVP 期间不需要）

独立开发者初期采用 **Development + Production 二环境模型**，Preview 覆盖"临时验证"需求。详见 [docs/ARCHITECTURE.md §12.2](docs/ARCHITECTURE.md)。

### 数据库迁移

生产环境迁移**不自动执行**。发版流程：

1. 本地 Supabase dev 项目验证迁移无误
2. 合并到 main
3. 手动执行 `pnpm db:migrate:deploy`（或通过带审批的 pipeline 触发）

详见 [docs/ARCHITECTURE.md §6.4](docs/ARCHITECTURE.md)。

---

## 文档

| 文档                                    | 内容                               |
| --------------------------------------- | ---------------------------------- |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | 技术架构、选型理由、决策依据       |
| [ROADMAP.md](docs/ROADMAP.md)           | 开发路线图，阶段划分与 DoD         |
| [CONTRIBUTING.md](CONTRIBUTING.md)      | 开发规范、Git workflow、代码风格   |
| [docs/adr/](docs/adr/)                  | Architecture Decision Records 历史 |

---

## 运营信息

- **运营主体**：独立开发者模式，Merchant of Record 为 Lemon Squeezy
- **目标市场**：一期欧美北美，二期欧洲主要语言，三期全球扩展
- **支持语言**：MVP 英语（默认）+ 简体中文（开发辅助），后续按访问数据扩展其他语言

---

## License

Proprietary. 本仓库代码为私有项目，未经授权禁止任何形式的复制、分发、使用。

© 2026 Kitora. All rights reserved.
