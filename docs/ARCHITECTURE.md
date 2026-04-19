# Kitora 架构文档

> 本文档记录 Kitora 项目的技术架构、关键决策和设计原则。它不是教程，面向的读者是未来的你自己、团队成员或合作者。任何重大架构变更都应先更新本文档。

---

## 1. 项目概述

**产品定位**：`{{PRODUCT_DESCRIPTION}}`（待补充）

**运营主体**：独立开发者模式，暂不注册公司。通过 Lemon Squeezy 作为 Merchant of Record 处理全球收款、开票和税务合规。提现通过 Payoneer 结算到国内招商银行个人账户。

**目标市场**：一期聚焦欧美北美（英语市场），二期逐步扩展到欧洲主要语言（西班牙语、德语、法语），三期视数据扩展到日本、巴西、中文市场等。

**运营原则**：

- **独立开发者节奏**：不堆技术栈，不过度工程。每个决策都考虑"如果只有我一个人维护，3 年后还能看懂吗"。
- **Building in Public**：代码虽然私有，但进展、指标、踩坑在社交媒体公开分享。
- **文档先行**：重大决策先写 ADR，再动代码。
- **国际化先行**：即使 MVP 只上英语，所有代码从 day 1 按多语言设计，避免后续重构。

---

## 2. 整体架构速览

```
┌─────────────────────────────────────────────────────────────┐
│                        用户浏览器                             │
└────────────────────────┬────────────────────────────────────┘
                         │
          ┌──────────────┼──────────────┐
          │              │              │
          ▼              ▼              ▼
   ┌──────────┐   ┌──────────┐   ┌──────────┐
   │ marketing│   │   web    │   │  admin   │
   │  官网    │   │  主应用   │   │  管理台   │
   │(Next.js) │   │(Next.js) │   │(Next.js) │
   └────┬─────┘   └────┬─────┘   └────┬─────┘
        │              │              │
        └──────────────┼──────────────┘
                       │
          ┌────────────┼────────────┐
          │            │            │
          ▼            ▼            ▼
     ┌────────┐  ┌─────────┐  ┌──────────┐
     │Postgres│  │ Resend  │  │  Lemon   │
     │(Supa-  │  │ 邮件    │  │ Squeezy  │
     │ base)  │  │         │  │ 支付     │
     └────────┘  └─────────┘  └──────────┘

观测层（横切）：Sentry（错误） + PostHog（产品分析） + Better Stack（Uptime）
部署平台：Vercel
```

---

## 3. 技术栈清单

| 类别          | 选型                                     | 说明               |
| ------------- | ---------------------------------------- | ------------------ |
| 语言          | TypeScript（严格模式）                   | 全栈统一           |
| 框架          | Next.js 15 (App Router)                  | 前后端一体         |
| UI            | React + Tailwind CSS + shadcn/ui         |                    |
| 数据库        | PostgreSQL                               | 通过 Supabase 托管 |
| ORM           | Prisma                                   |                    |
| 认证          | Supabase Auth（默认选择，见 §7）         |                    |
| 支付          | Lemon Squeezy                            | Merchant of Record |
| 事务邮件      | Resend                                   |                    |
| 营销邮件      | 初期复用 Resend Broadcasts               | 规模化后评估 Loops |
| 文件存储      | Supabase Storage（默认）或 Cloudflare R2 |                    |
| 国际化        | next-intl                                | URL sub-path 策略  |
| 错误监控      | Sentry                                   |                    |
| 产品分析      | PostHog                                  |                    |
| Uptime 监控   | Better Stack                             |                    |
| 部署          | Vercel                                   |                    |
| 包管理        | pnpm                                     |                    |
| Monorepo 工具 | Turborepo                                |                    |
| 代码规范      | ESLint + Prettier + Husky + lint-staged  |                    |
| 测试          | Vitest（单元）+ Playwright（E2E）        |                    |
| Secrets 管理  | Doppler（备选 1Password Secrets）        |                    |
| Git 提交规范  | Conventional Commits                     |                    |

---

## 4. 仓库架构：Monorepo

### 4.1 为什么从 Day 1 就用 Monorepo

项目从第一天就明确需要三个独立的前端应用（web / admin / marketing），并且三者之间共享数据库 schema、UI 组件、类型定义、认证逻辑、邮件模板。这种场景下，Monorepo 是自然选择，反而 Polyrepo 会带来版本同步、依赖漂移的问题。

**说明**：通常建议的"不要过早 Monorepo"适用于"不确定未来是否需要多应用"的团队。Kitora 属于"明确知道需要多应用"的场景，不受这条通用建议约束。

### 4.2 工具链

- **包管理器**：pnpm（磁盘占用低、依赖隔离严格、比 npm/yarn 快）
- **任务编排**：Turborepo（构建缓存、并行任务、依赖图感知）
- **远程缓存**：启用 Turborepo Remote Cache，让 CI、本地、Vercel 三方共享构建缓存

不选 Nx 的原因：Nx 功能更全但更重，自带插件体系和代码生成器，对独立开发者偏 overkill。Turborepo + pnpm 是独立开发者 / 小团队的主流组合，与 Vercel 官方模板一致。

### 4.3 目录结构

```
kitora/
├── apps/
│   ├── web/                  # 主 SaaS 应用（登录后的 dashboard）
│   ├── admin/                # 内部管理后台（运营/客服）
│   └── marketing/            # 营销官网（landing、pricing、blog、docs）
│
├── packages/
│   ├── db/                   # Prisma schema + client 封装
│   ├── auth/                 # 认证逻辑封装
│   ├── ui/                   # 共享 React 组件（shadcn/ui 基础）
│   ├── email/                # Resend + React Email 模板
│   ├── i18n/                 # next-intl 配置与消息字典
│   ├── config/               # 共享配置（tsconfig / eslint / tailwind preset）
│   ├── utils/                # 通用工具函数
│   └── types/                # 跨 app 的共享 TypeScript 类型
│
├── docs/                     # 本目录：所有项目文档
│   ├── ARCHITECTURE.md
│   ├── ROADMAP.md
│   └── adr/                  # Architecture Decision Records
│
├── .github/                  # GitHub Actions workflows
├── turbo.json                # Turborepo 配置
├── pnpm-workspace.yaml
├── package.json
├── tsconfig.base.json
├── README.md
├── CONTRIBUTING.md
└── .env.example
```

### 4.4 应用职责划分

**apps/web**

- 登录后的产品主体（dashboard、核心功能、用户设置、账单页）
- 路由：`app.kitora.co`（建议子域名部署）
- 渲染策略：以 Server Components + Server Actions 为主，客户端交互部分按需 `"use client"`
- 对 SEO 无要求，可以重度依赖客户端逻辑

**apps/admin**

- 内部管理后台：用户管理、订阅状态查看、内容审核、数据看板
- 路由：`admin.kitora.co` 或以 IP 白名单/VPN 保护
- 访问控制：只允许特定角色（`admin` / `support`）登录
- 优先功能正确性，UI 可以粗糙

**apps/marketing**

- 未登录用户看的公开官网：首页、定价、功能页、博客、文档
- 路由：根域名 `kitora.co`
- 渲染策略：以 SSG / ISR 为主，追求极致加载速度和 SEO
- 多语言 URL 策略（`/en/`、`/zh/` 等）在此应用展开

拆分的核心好处：

- marketing 改文案不触发 web 部署，web 改逻辑不触发 marketing 重建
- 三个应用可以独立调整性能优化策略（缓存、ISR、边缘部署）
- 未来如果 web 拆微服务或换技术栈，marketing 和 admin 不受影响

---

## 5. 前端架构

### 5.1 渲染策略

- **优先 Server Components**：所有组件默认是 Server Component，只有需要交互（state、effect、浏览器 API）时才加 `"use client"`
- **Server Actions 优先于 API Routes**：表单提交、mutation 用 Server Actions；需要对外暴露标准 HTTP API 时才建 Route Handler
- **缓存策略**：显式声明每个 fetch 的 cache 行为，不依赖默认值

### 5.2 UI 组件策略

- **shadcn/ui 作为基础组件库**：通过 CLI 复制到 `packages/ui`，不作为 npm 依赖。需要定制时直接改源码，避免外部库升级风险。
- **Tailwind 作为唯一样式方案**：不引入 CSS-in-JS、CSS Modules 或其他样式方案。保持单一来源。
- **设计 tokens 统一**：颜色、字体、间距、圆角等在 `packages/config/tailwind-preset.ts` 定义，三个 app 共享。

### 5.3 表单处理

- React Hook Form + Zod 做表单状态和校验
- Server Actions 内部二次校验（永远不信任客户端）

### 5.4 服务端代码的落地位置

Next.js App Router 是全栈框架，没有"独立后端目录"这个概念。对于从 Midway / NestJS / Koa 等专职后端框架迁移过来的开发者，这一节说明三类服务端代码的具体位置和职责划分。

**apps/web 目录示意：**

```
apps/web/
├── app/
│   ├── (dashboard)/                      # 路由分组（括号目录不进 URL）
│   │   ├── projects/
│   │   │   ├── page.tsx                  # 页面（默认 Server Component）
│   │   │   ├── actions.ts                # Server Actions（该路由的写操作）
│   │   │   └── _components/              # 路由私有组件（下划线前缀不参与路由）
│   │   └── layout.tsx
│   │
│   ├── api/
│   │   ├── webhooks/
│   │   │   └── lemonsqueezy/
│   │   │       └── route.ts              # Route Handler（支付 webhook 接收）
│   │   └── internal/
│   │       └── export/route.ts           # Route Handler（导出、下载等）
│   │
│   └── layout.tsx
│
├── lib/                                  # apps/web 内部共享
│   ├── db.ts                             # 基于 @kitora/db 的 app 层封装
│   ├── auth.ts                           # 服务端鉴权工具（从 @kitora/auth 组装）
│   └── services/                         # 领域服务（跨多个 action / route 复用）
│       ├── subscription.ts
│       └── invitation.ts
│
├── middleware.ts                         # 请求拦截（auth、locale、重定向）
└── next.config.mjs
```

**三类服务端代码：**

1. **Server Components（`*.tsx` 默认）**
   - 文件不加 `"use client"` 时，组件在服务端执行，可直接 `import { prisma } from "@kitora/db"` 查数据库
   - 职责：页面首屏数据查询 + 初始 HTML 渲染
   - 类比 Midway：Controller 返回页面的场景，但没有 Controller 这一层

2. **Server Actions（`"use server"` 函数）**
   - 函数首行声明 `"use server"` 后，客户端组件可以像调用本地函数一样调用，Next.js 自动生成 RPC 通道
   - 职责：表单提交、资源创建/更新/删除，用户交互触发的写操作
   - 类比 Midway：Controller + Service 的组合，但无需手写路由

3. **Route Handlers（`app/api/**/route.ts`）\*\*
   - 导出 `GET` / `POST` 等函数实现标准 HTTP 接口
   - 职责：第三方 webhook、对外 OpenAPI、下载/导出、Cron 触发、非 Next.js 客户端调用
   - 类比 Midway：Controller，在需要稳定 URL 路径时使用

**判断该用哪一个：**

- 页面打开时要展示的数据 → Server Component 直接查
- 用户点按钮触发的操作（提交表单、删除、更新）→ Server Action
- 第三方系统要调用 / 需要稳定对外 URL → Route Handler

**共享业务逻辑**：三者都调用 `apps/web/lib/services/*` 里的领域服务函数。领域服务是纯 TypeScript 函数，不绑定 HTTP 上下文，既能在 Server Component 里跑，也能在 Server Action 和 Route Handler 里复用——这避免了业务逻辑散落在页面或路由文件里。

**关键差异（对比 Midway）：**

- Midway 是"路由 → Controller → Service"的经典分层；Next.js 把路由从 Controller 里拿走交给文件系统（约定优于配置）
- Midway 通常是独立进程，Next.js 前后端合并在同一 Node 进程部署
- Midway 的 DI 容器在这里不需要，直接 `import` 即可——服务是无状态纯函数
- Midway 的 middleware 链对应 Next.js 的 `middleware.ts`（单一文件，基于路径匹配）
- Midway 的全局异常过滤器对应 Next.js 的 `error.tsx` 和 `not-found.tsx`（按路由层级生效）

---

## 6. 数据层

### 6.1 数据库

**选型**：PostgreSQL，通过 Supabase 托管。

Supabase 的优势：Postgres + Storage + Realtime + Auth 一站式提供，免费额度对 MVP 足够，连接池（Supavisor）对 Vercel Serverless 友好，未来可无痛迁移（纯 Postgres，不锁定）。

备选：Neon（serverless Postgres，冷启动快）、Railway Postgres、阿里云 RDS（面向中国市场时切换）。

**为什么不选 MySQL**：MySQL 技术上完全能做 SaaS，但在 2026 年 TypeScript / Node.js 生态下，Postgres 是摩擦最小的默认选择，具体原因：

- **JSONB 字段**：Postgres 的 JSONB 支持索引、表达式查询、部分更新，适合 SaaS 中普遍的"半结构化数据"（用户偏好、feature flags、审计日志元数据），MySQL 的 JSON 支持相对弱。
- **Row Level Security（RLS）**：Postgres 原生支持行级权限，Supabase 利用该特性实现多租户数据隔离，MySQL 无原生对等能力。
- **pgvector 扩展**：未来若加入 AI 特性（语义搜索、RAG、嵌入向量存储），Postgres 装 pgvector 即用，MySQL 需要拼凑方案。
- **事务性 DDL**：Postgres 的 schema 变更语句可包在事务里，失败能回滚；MySQL 的 DDL 是隐式提交的，迁移失败难以回退。
- **生态适配**：Supabase / Neon / Railway 等独立开发者友好的托管平台均为 Postgres 优先，托管 MySQL 选择少。
- **Prisma 支持**：两者都支持，但 Postgres 在类型映射（特别是 `DateTime`、`Decimal` 精度）上坑更少。

### 6.2 ORM：Prisma

**选型理由**：

- DX 和生态成熟，社区和教程最多
- Prisma Migrate 工作流清晰，迁移文件可读
- Prisma Studio 开箱即用的 DB GUI
- 类型安全，和 TypeScript 集成顺畅

**已知权衡**：

- 生成的 Client 体积较大（几 MB），但在 Node runtime 下可以接受
- 历史上 Serverless 冷启动较慢，Prisma 6 已显著改善
- Edge Runtime 场景需要 Prisma Accelerate（付费）或 Prisma Postgres。本项目目前不在边缘跑 DB 查询，暂不需要

**备选**：Drizzle ORM。性能更优、Edge 友好，但生态较新，迁移工具不如 Prisma 成熟。若未来 Prisma 成本或性能成为瓶颈，可考虑切换。

### 6.3 Schema 组织与多租户模型

所有 schema 统一在 `packages/db/prisma/schema.prisma`，不按 app 分拆。三个 app 都从 `@kitora/db` 引用 Prisma Client。

**命名约定**：采用 **双层命名 + 显式映射**——DB 物理层 `snake_case`（表名复数、字段 `snake_case`），Prisma / TypeScript 层 `PascalCase` 单数 + `camelCase`，两层之间通过 Prisma 的 `@map`（字段）和 `@@map`（表）强制显式映射。具体规则（主键 / 时间戳 / 枚举 / 索引命名）见 [CONTRIBUTING.md §数据库](../CONTRIBUTING.md#数据库)。

**为什么选这个方案（考虑过的三种方案）：**

| 方案                                               | DB 侧                | 代码侧            | 主要问题                                                      |
| -------------------------------------------------- | -------------------- | ----------------- | ------------------------------------------------------------- |
| A. 纯 `snake_case`（DB 和代码一致）                | `users.created_at`   | `user.created_at` | 与 TS / React / Next.js 生态 camelCase 惯例冲突，代码风格割裂 |
| B. Prisma 默认（`PascalCase` 表 + camelCase 字段） | `"User"."createdAt"` | `user.createdAt`  | 所有手写 SQL / RLS 必须加双引号包围，易忘易错；BI 工具体验差  |
| **C. 双层映射（本项目选中）**                      | `users.created_at`   | `user.createdAt`  | schema 文件需每字段写 `@map`，略冗长，但一次性换取长期可读性  |

**选择方案 C 的核心理由：**

- **RLS 策略好写**：Kitora 多租户方案强依赖 Row Level Security，RLS 策略都是纯 SQL，`snake_case` 免去双引号
- **Supabase 生态一致**：Supabase 官方 schema 示例、SQL Editor、Dashboard 均默认 `snake_case`
- **代码侧保留惯例**：React / Next.js / Zod / tRPC 周边库全部 camelCase，代码层零割裂
- **未来互操作成本低**：未来接入 Metabase / Redash BI、Python 数据脚本、其他语言服务时无需处理引号
- **代价可控**：新增字段要写 `@map`，通过 pre-commit 脚本扫描 `schema.prisma`（任何 model 没有 `@@map`、任何非关系字段没有 `@map` 即判违规）兜底

这个选择从 Day 1 锁定，全项目遵循。若未来推翻，迁移策略为写一次性 rename migration + Prisma generator 自动补齐映射。

示例：

```prisma
model Organization {
  id        String   @id @default(uuid())
  name      String
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt        @map("updated_at")

  members  Membership[]

  @@map("organizations")
}

model Membership {
  id             String   @id @default(uuid())
  userId         String   @map("user_id")
  organizationId String   @map("organization_id")
  role           String   // 见下方"枚举策略"
  createdAt      DateTime @default(now()) @map("created_at")

  user         User         @relation(fields: [userId], references: [id])
  organization Organization @relation(fields: [organizationId], references: [id])

  @@unique([userId, organizationId], map: "memberships_user_id_organization_id_key")
  @@map("memberships")
}
```

**多租户架构**：Kitora 采用**共享数据库 + tenant_id 隔离**的多租户模式——所有租户的数据存在同一个 Postgres 实例，通过 `Organization.id` 作为租户标识符，业务表以 `organizationId` 外键关联实现数据隔离。这是 SaaS 领域的标准做法，兼顾成本、运维简单和数据隔离可靠性。未来如需更强隔离（合规客户、企业私有化部署），再评估升级到"schema-per-tenant"或"db-per-tenant"。

**核心表**（初版设计）：

- `User`：用户主表，含 `locale`、`timezone`、`currency` 字段支持 i18n
- `Organization`：租户（团队/工作区），即使 MVP 不开放团队功能，schema 先预留
- `Membership`：User × Organization 关联与角色（`owner` / `admin` / `member`）
- `Subscription`：订阅状态（归属于 Organization，不归属于 User），由 Lemon Squeezy webhook 同步
- `Invitation`：团队邀请
- 业务领域表：MVP 内容确定后补充，**所有业务表强制带 `organizationId` 外键**

**数据隔离策略**：

- 应用层：所有数据库查询默认通过封装好的 `organizationId` 作用域工具函数执行，杜绝"忘记加过滤条件"
- 数据库层：未来可启用 Supabase 的 Row Level Security（RLS）作为第二道防线

**时间戳规范**：所有 timestamp 字段用 `DateTime` 类型，存 UTC，显示时根据用户时区转换。

**软删除**：业务表统一使用 `deletedAt DateTime?` 模式，中间件过滤。

### 6.4 迁移工作流

**标准流程**：

- 本地开发：改 `schema.prisma` → 运行 `pnpm db:migrate:dev` → Prisma 生成 SQL 迁移文件
- 迁移文件提交 Git，和代码变更一起走 PR review
- Staging 环境：CI 自动执行 `prisma migrate deploy`
- 生产环境：**不启用自动迁移**，手动触发或通过带审批 gate 的 pipeline 执行

**为什么生产环境手动执行**：

- 破坏性迁移（drop column、改类型、rename）一旦自动执行，回滚代价高。手动触发让你有机会在 staging 先验证。
- 长时间运行的迁移（给大表加索引等）会阻塞部署，自动执行可能造成用户短暂不可用。
- 多实例并发部署时，自动迁移可能出现竞态。
- 独立开发者场景下，手动执行 `prisma migrate deploy` 只需 5 秒，换取可控性很划算。

**未来升级路径**：有团队或流量规模后，可升级为"pipeline 自动迁移 + 人工审批 gate"模式，既自动化又有审批把关。

---

## 7. 认证与授权

### 7.1 认证方案（默认 Supabase Auth）

**默认选择**：Supabase Auth。因为已经用 Supabase 作为数据库和存储，Auth 集成顺畅，所有数据在同一个 Postgres 实例，无供应商切换成本。

**备选**：Clerk。DX 更好，UI 组件更精致，但定价对规模化项目偏贵（10K MAU 免费，超出后按 $0.02/MAU 计费）。如果对用户体验有极致要求或不想自己做登录/注册 UI，Clerk 是更省心的选择。

**⚠️ 待决策**：正式动手前需要确定。建议先用 Supabase Auth 起步，见 §14 待决策项。

### 7.2 授权模型

基于 Organization + Role 的 RBAC：

- 每个 User 属于 0 或多个 Organization
- 每次会话在某个 Organization 上下文下（active org）
- 角色：`owner` / `admin` / `member`（初版三个角色足够）
- 权限检查封装在 `packages/auth` 的工具函数里，Server Components 和 Server Actions 统一调用

### 7.3 Session 管理

- Cookie-based session（HttpOnly、Secure、SameSite=Lax）
- 服务端验证，不在客户端存 JWT

---

## 8. 支付系统

### 8.1 Lemon Squeezy 为什么

- Merchant of Record 模式，帮独立开发者处理全球税务和合规（EU VAT、US Sales Tax 等）
- 不需要注册公司即可使用
- 支持多种货币分层定价
- 费率 5% + $0.50/笔（贵于 Stripe 但包含税务服务，综合更划算）

### 8.2 订阅状态同步

- Lemon Squeezy 通过 webhook 推送订阅变化
- Webhook handler 在 `apps/web/app/api/webhooks/lemonsqueezy/route.ts`
- 必须处理：
  - 签名校验（用 signing secret）
  - **幂等性**：同一 event_id 只处理一次（数据库层 unique 约束）
  - 失败重试：Lemon Squeezy 会重发，handler 要幂等
- 状态同步到 `Subscription` 表

### 8.3 订阅状态模型

```
Subscription 状态机：
  pending → active → past_due → cancelled
         ↘ (paused) → active
         ↘ (unpaid) → cancelled
```

用户的"当前可用功能"由 `Subscription.status` 和 `plan` 决定，权限检查封装为 `canAccess(feature)` 工具函数。

### 8.4 提现路径

Lemon Squeezy → Payoneer USD Receiving Account → 招商银行个人账户（人民币结汇或美元账户）。

---

## 9. 邮件系统

### 9.1 事务邮件与营销邮件分离

- **事务邮件**：用户行为触发的 1:1 邮件（验证、重置密码、收据、通知）。质量和到达率优先。
- **营销邮件**：批量推送的 1:N 邮件（newsletter、产品更新、promotion）。支持列表管理和退订。

两类混用会污染发送 IP 信誉，MVP 阶段虽然都用 Resend，但代码层面严格区分。

### 9.2 Resend 作为统一服务

- 事务邮件用 Resend 标准 API
- 营销邮件初期用 Resend Broadcasts（内置列表和退订管理）
- 规模化后（订阅者破几万）评估迁移到 Loops 或 ConvertKit

### 9.3 邮件模板

- 基于 React Email（`@react-email/components`）
- 模板放在 `packages/email/templates/{template-name}/{locale}.tsx`
- 按用户 `locale` 字段选择对应语言版本
- 模板预览：`react-email dev` 本地起预览服务器

### 9.4 发送域名配置

- 发送域名：`mail.kitora.co`（子域名专用于发邮件，与主站域名的邮件声誉隔离）
- 必须配置：SPF / DKIM / DMARC 三件套
- 回信地址：`hello@kitora.co` 或 `support@kitora.co`

---

## 10. 国际化（i18n）

### 10.1 设计原则

**i18n 从 Day 1 启用**：所有用户可见字符串都走翻译字典，禁止在组件里硬编码英文或中文文案。

**MVP 初期支持两种语言**：英语（`en`，默认）+ 简体中文（`zh-CN`）。

- **英语是目标市场语言**：作为默认语言，服务北美 / 欧洲用户，决定了所有文案以"英语优先"撰写和打磨
- **中文是开发辅助语言**：作为独立开发者的母语，同步维护一份中文翻译有三层价值——
  1. 开发者本人在本地联调 / demo / 录屏时可直接切到中文校验业务表达是否到位
  2. 强制从 day 1 验证 i18n 管道正常工作（字典加载、URL 切换、SSR 一致性、邮件模板 locale 分发）
  3. 避免 Phase 2 首次新增语言时发现架构有隐性耦合问题——"两种语言"和"三种语言"的技术改动几乎为零，"一种语言"和"两种语言"才是本质跨越

### 10.2 技术选型：next-intl

- App Router 场景下事实标准，支持 Server Components 和 Server Actions
- 类型安全：从 messages 文件推导出所有 key
- 支持 ICU MessageFormat（复数、性别、嵌套）

### 10.3 URL 策略：Sub-path

- 格式：`kitora.co/en/pricing`、`kitora.co/zh/pricing`
- 理由：SEO 权重集中单域名、部署简单、next-intl 支持最佳
- 未来扩展到 Country TLD（如 `kitora.jp`）时，marketing 独立部署即可

### 10.4 语言检测优先级

1. URL 中的 locale 段（最高优先级，允许直链指定语言）
2. 登录用户数据库 `User.locale` 字段
3. Cookie `NEXT_LOCALE`（记住用户上次选择）
4. `Accept-Language` header
5. 默认 `en`

### 10.5 国际化涉及的层次

不仅仅是文案翻译，以下都要设计好：

- 文案（next-intl 消息字典）
- 单复数和性别（ICU 语法）
- 日期 / 时间 / 数字 / 货币格式（用 `Intl.*` 原生 API，避免引入 moment）
- 时区（数据库存 UTC，前端转换）
- 货币和定价（Lemon Squeezy 支持多区域分层定价，前端用 `Intl.NumberFormat` 显示）
- RTL 布局（阿拉伯语、希伯来语阶段再启用，Tailwind 原生支持 `dir` 属性）
- SEO（hreflang 标签、每语言独立 sitemap）
- 邮件模板（每语言一份模板）
- 后端错误信息（API 返回错误码 + 参数，前端翻译）

### 10.6 支持语言的演进

- **Phase 1 MVP 上线**：英语（`en`，默认）+ 简体中文（`zh-CN`，开发辅助 / 对外附带能力）
- **Phase 2（3-6 个月）**：根据 PostHog 流量数据加 2-3 种（候选：西班牙语、德语、法语）
- **Phase 3**：按需扩展（日语、葡萄牙语巴西变体、繁体中文）
- **后期**：RTL 语言（阿拉伯语、希伯来语）

**语言对外展示策略**：虽然中文在 MVP 就可用，但对北美 / 欧洲市场的 SEO 和营销文案**仍以英语为第一视角**撰写，中文翻译作为"同步产物"。落地页的 `hreflang` 标签声明 `en` 为主、`zh-CN` 为备，避免 Google 误判为"中文市场主站"。

### 10.7 翻译工作流

- 初期：自己翻 + AI 辅助（Claude 翻 JSON 后人工校对）
- 规模化后：Crowdin（有开源/小项目免费计划）或 Inlang（git-native）

---

## 11. 可观测性

### 11.1 三件套

- **Sentry**：前端 + 后端错误捕获、堆栈、breadcrumbs、source map 上传
- **PostHog**：产品分析（事件追踪、漏斗、留存、session replay、feature flags）
- **Better Stack**：Uptime 监控 + 日志聚合

三者都有慷慨免费层，MVP 阶段成本为 0。

### 11.2 关键事件埋点清单

MVP 上线前至少覆盖：

- 注册漏斗：landing_view → signup_start → signup_complete
- 激活漏斗：first_action、aha_moment（产品特定）
- 付费漏斗：pricing_view → checkout_start → checkout_complete
- 核心功能使用：每个核心功能调用一次
- 退订：cancel_start → cancel_complete + 原因

### 11.3 告警规则

- Sentry：新错误、错误率尖峰 → 邮件/Slack 通知
- Better Stack：网站 down > 1 分钟 → 短信/邮件通知
- PostHog：关键指标异常（付费转化率暴跌等）→ 邮件通知

---

## 12. 部署和环境

### 12.1 部署平台

- Vercel 部署三个 app，独立 Project
- 每个 Project 的 Root Directory 指向对应 `apps/*`
- Build Command：`cd ../.. && pnpm turbo run build --filter={app-name}`
- 启用 Turborepo Remote Cache 减少构建时间

### 12.2 环境分层

**独立开发者初期采用二环境模型**：Development + Production，Preview 作为 PR 临时环境自动生成，不单独维护 staging。

- **Development**：本地 `.env.local` + Supabase dev 项目（独立于生产的 Supabase 实例，用于本地开发和迁移验证）
- **Preview**：每个 PR 自动起 Vercel Preview 环境。URL 形如 `kitora-git-<branch>.vercel.app`，PR 合并或关闭后自动回收。可选绑定 Supabase Preview Branch。
- **Production**：`main` 分支自动部署，连生产 Supabase

**为什么不设 staging**：

- Vercel Preview 已经覆盖"接近生产环境的临时验证"这一核心诉求
- 独立开发者无团队协作 / Beta 用户 / 第三方联调等需要长期稳定预生产环境的场景
- 维护 staging 意味着多一套部署、环境变量、Supabase 实例、seed 数据，ROI 不合算
- 数据库迁移验证通过独立的 Supabase dev 项目完成，不需要 staging

**引入 staging 的时机**：Phase 2（Beta）阶段，当出现以下任一情况时再启用：

- 招募了 Beta 用户，他们需要稳定长期的访问地址
- 需要在接近生产数据规模的环境下验证性能
- 集成的第三方系统只有生产级接口，没有沙箱
- 引入了 cron / 后台 Worker，Preview 的冷启动不适合长期运行
- 有了协作者，多个并行 PR 需要一个集成环境汇总验证

届时新增 `staging` 长期分支 + 独立 Vercel Project + 独立 Supabase 项目，按 `staging` 分支自动部署。

### 12.3 Secrets 管理

- 开发：`.env.local`（git ignore）
- 线上：Vercel Environment Variables
- 团队协作阶段：Doppler 或 1Password Secrets Automation
- **禁止**：secrets 写入代码、提交到 git、打印到日志

### 12.4 域名规划

- `kitora.co` → apps/marketing（根域名，营销官网）
- `app.kitora.co` → apps/web（登录后主应用）
- `admin.kitora.co` → apps/admin（管理后台，访问受限）
- `docs.kitora.co` → 产品文档（未来用 Mintlify 或 Nextra）
- `mail.kitora.co` → 邮件发送子域名（Resend 配置）

---

## 13. 开发工具链

### 13.1 本地开发

- Node 版本：LTS（通过 `.nvmrc` 固定）
- 包管理：pnpm（通过 `packageManager` 字段固定版本）
- 启动所有 app：`pnpm dev`（Turborepo 并行启动）

### 13.2 代码质量

- TypeScript 严格模式（`strict: true`）
- ESLint：基于 `@typescript-eslint` + Next.js 推荐规则 + 项目定制
- Prettier：统一格式化，CI 校验
- Husky + lint-staged：commit 前自动 lint + format
- `commitlint`：强制 Conventional Commits 规范

### 13.3 测试策略

- 单元测试：Vitest，覆盖 `packages/*` 核心工具函数
- E2E 测试：Playwright，覆盖关键用户流程（注册、付费、核心功能）
- 组件测试：非强制，对复杂交互组件补充
- CI 每个 PR 运行全量测试

### 13.4 CI / CD

- GitHub Actions：lint、type check、测试、构建
- 主分支合并自动部署到 Vercel
- 失败的 PR 禁止合并（branch protection）

---

## 14. 待决策项（Open Decisions）

以下是当前尚未完全确定、需要在动工前或早期明确的决策。每项决策一旦确定，应当补充一份 ADR。

### 14.1 认证服务（Supabase Auth vs Clerk）

- **建议默认**：Supabase Auth
- **理由**：已选用 Supabase，避免引入额外供应商
- **触发切换的条件**：Supabase Auth 在社交登录、MFA、用户管理 UI 上体验不佳时考虑切到 Clerk

### 14.2 Monorepo 是否立即启用 Turborepo Remote Cache

- **建议**：项目初期本地缓存足够，Vercel 部署时启用 Remote Cache 即可。
- **免费额度**：Turborepo Remote Cache 对个人使用完全免费。

### 14.3 i18n 启动语言列表

- **MVP 确定**：英语（`en`，默认）+ 简体中文（`zh-CN`）
- **Phase 2 候选**：基于 PostHog 访问数据加 2-3 种（西班牙语 / 德语 / 法语优先）

### 14.4 营销邮件是否立即分离出 Loops

- **建议**：MVP 用 Resend Broadcasts，订阅者超过 5000 或需要复杂 drip campaign 时再迁移

---

## 15. 范围边界（In Scope / Out of Scope）

### 15.1 明确在范围内（避免误解）

作为 SaaS 系统，以下是**本项目确认要做**的核心架构能力：

- **多租户架构**：共享数据库 + `organizationId` 隔离，见 §6.3
- **订阅制付费**：多层级定价、升级/降级/取消、按区域货币分层（Lemon Squeezy 实现）
- **全球化**：多语言（next-intl）、多时区、多货币格式
- **团队/协作**：Organization + Membership，MVP 阶段不对外开放，schema 和代码先预留
- **基于角色的访问控制（RBAC）**：`owner` / `admin` / `member` 三角色

### 15.2 不在范围内的事项（防止 scope creep）

明确**不做**的事情：

- **多数据库方言支持**：只支持 Postgres，不考虑 MySQL / SQLite
- **手机原生 App**：MVP 阶段纯 Web，PWA 可选优化，iOS / Android 原生 App 不做
- **离线支持**：不做本地存储 / 同步队列等离线能力
- **自建 Auth 系统**：使用第三方服务（Supabase Auth / Clerk），不自己写密码哈希和 session 管理
- **复杂微服务拆分**：单体 Next.js + Monorepo 共享包足够，不做 gRPC / 独立消息队列 / 服务网格，直到业务规模确实要求
- **Schema-per-tenant / DB-per-tenant**：不采用强隔离多租户模式，除非未来有合规或企业私有化部署需求

---

## 附录 A：关键参考链接

- Next.js 文档：https://nextjs.org/docs
- Prisma 文档：https://www.prisma.io/docs
- Supabase 文档：https://supabase.com/docs
- Lemon Squeezy 文档：https://docs.lemonsqueezy.com
- Resend 文档：https://resend.com/docs
- next-intl 文档：https://next-intl.dev
- Turborepo 文档：https://turborepo.com/docs
- shadcn/ui：https://ui.shadcn.com
- React Email：https://react.email

## 附录 B：文档变更记录

| 日期       | 变更     | 作者       |
| ---------- | -------- | ---------- |
| 2026-04-20 | 初版起草 | {{AUTHOR}} |
