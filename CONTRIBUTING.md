# 贡献规范

> 本文档定义 Kitora 项目的开发规范。即使当前是单人开发，遵守规范能保持代码一致性，也为未来加入协作者做好准备。

---

## 目录

- [分支策略](#分支策略)
- [Git 提交规范](#git-提交规范)
- [PR 流程](#pr-流程)
- [代码风格](#代码风格)
- [命名规范](#命名规范)
- [目录约定](#目录约定)
- [依赖管理](#依赖管理)
- [测试要求](#测试要求)
- [数据库变更](#数据库变更)
- [ADR（架构决策记录）](#adr架构决策记录)
- [代码审查标准](#代码审查标准)
- [常见反模式](#常见反模式)

---

## 分支策略

采用**轻量 GitHub Flow**：`main` 是唯一长期分支，所有变更通过短命功能分支合入。

### 分支命名

格式：`<type>/<short-description>`

- `feat/` — 新功能：`feat/add-pricing-page`
- `fix/` — Bug 修复：`fix/checkout-webhook-duplicate`
- `refactor/` — 重构（不改行为）：`refactor/extract-auth-utils`
- `docs/` — 文档变更：`docs/update-roadmap`
- `chore/` — 工程杂项（依赖升级、配置调整）：`chore/upgrade-nextjs-15`
- `test/` — 测试相关：`test/add-checkout-e2e`
- `perf/` — 性能优化：`perf/optimize-dashboard-query`

短描述使用小写 + 连字符，不超过 50 字符。

### 分支生命周期

- 每个分支只对应一个逻辑变更
- 分支存活时间尽量短（建议 < 3 天），长寿分支容易产生合并冲突
- 合并后立即删除远程分支（GitHub 可配置自动删除）

### 保护规则（main 分支）

**基本规则：**

- **禁止直推**：所有变更必须通过 PR 合入，即使是单人开发阶段也保持此流程（保留完整变更历史、CI 校验、未来可追溯）
- **要求 CI 绿**：lint + typecheck + test + build 全部通过
- **禁止 force push**
- **Review approval**：单人开发阶段**暂不强制**。后续有协作者加入时，开启"至少 1 个 approval"规则并配置 `CODEOWNERS`

### GitHub 仓库设置清单

仓库创建后，在 `Settings → Branches → Add branch protection rule` 按以下勾选（Branch name pattern 填 `main`）：

- [x] **Require a pull request before merging**
  - [x] Require approvals：协作者阶段开启，单人阶段关闭
  - [x] Dismiss stale pull request approvals when new commits are pushed
- [x] **Require status checks to pass before merging**
  - [x] Require branches to be up to date before merging ← **关键项，见下方"并发 PR 的冲突处理"**
  - 勾选必须通过的 check：`lint` / `typecheck` / `test` / `build`
- [x] **Require conversation resolution before merging**
- [x] **Do not allow bypassing the above settings**（包含仓库管理员自己）
- [ ] Require signed commits（可选，团队安全要求高时启用）
- [ ] Require linear history（与下方 Squash and Merge 策略配合使用时可开启）
- [x] **Restrict who can push to matching branches** → 清空（相当于只允许 PR 合入）
- [x] **Rules applied to everyone**（包括你自己）

另外在 `Settings → General → Pull Requests` 区域：

- [x] **Allow squash merging**（保留）
- [ ] Allow merge commits（关闭）
- [ ] Allow rebase merging（关闭）
- [x] **Always suggest updating pull request branches**
- [x] **Allow auto-merge**
- [x] **Automatically delete head branches**（合并后自动删源分支）

### 并发 PR 的冲突处理

当同时有多个 PR 基于同一个 main commit 开发时，存在两类风险：

**文本冲突（Git 可检测）**：多个 PR 改同一文件的同几行。GitHub 会直接阻止合并，作者手动 resolve 后重跑 CI 即可。不会造成线上事故。

**语义冲突 / Merge Skew（Git 检测不到）**：PR-A 和 PR-B 改的是不同文件，但存在隐性依赖——比如 PR-A 改了函数签名，PR-B 新增的代码还在用旧签名。两者各自 CI 都能过，合到一起 main 就炸了。原因在于 PR 的 CI 是在"旧 main + PR"上跑的，没人跑过"合并后 main + 下一个 PR"的组合。

**强制"Require branches to be up to date before merging"可以消除 Merge Skew**：

- 开启后，PR-A 合入 main 后，PR-B 的 Merge 按钮会自动变灰
- PR-B 作者必须先 `git fetch origin && git rebase origin/main`（或用 GitHub UI 的 "Update branch" 按钮）
- 同步后 CI 自动重跑，绿了才允许合入
- 这样每个进入 main 的变更都是"在最新 main 上验证过的"

### 本地 rebase 操作规范

当 GitHub 提示分支过时，处理流程：

```bash
# 拉取最新 main
git fetch origin

# 将当前 PR 分支 rebase 到最新 main
git rebase origin/main

# 若出现冲突，解决后
git add <resolved-files>
git rebase --continue

# 强制推送（此时 force push 安全，因为这是自己的 feature 分支）
git push --force-with-lease
```

**注意 `--force-with-lease` 而不是 `--force`**：前者在远程被别人更新时会拒绝推送，防止覆盖协作者的新 commit。即使是自己开的分支也建议养成这个习惯。

### 协作阶段的进阶方案：GitHub Merge Queue

当同时存在 3+ 个并行 PR 时，手动 rebase 会变成负担。此时启用 GitHub Merge Queue：

- PR 审核通过后点击 "Merge when ready"，进入队列而非立即合并
- 队列按顺序模拟"rebase 到最新 main + 跑完整 CI"，全绿才真正合入
- CI 失败的 PR 自动踢出队列，通知作者修复
- 作者无需手动 rebase

启用路径：`Settings → Branches → main 保护规则 → Require merge queue`。

**单人开发阶段不启用**（没有真正并发），待协作者加入或自己同时开 3-4 个 PR 时再开。

### 兜底：Vercel Instant Rollback

即便上述防线全部穿透，main 坏了也不等于生产宕机：

- Vercel 保留所有历史部署
- 在 Vercel Dashboard 找到上一个正常部署，点 "Promote to Production"
- 30 秒内生产回滚到稳定版本
- 同步在 Git 上 `git revert <bad-commit>` 提个 hotfix PR 修复

完整防线层级：

```
PR CI                       → 拦文本冲突 + 单元测试
Branches up to date 要求    → 拦 merge skew
Preview 环境手工冒烟         → 拦 CI 覆盖不到的集成问题
Vercel Instant Rollback     → 最后兜底
```

---

## Git 提交规范

采用 [Conventional Commits](https://www.conventionalcommits.org/zh-hans/) 规范，通过 commitlint 强制校验。

### 格式

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### type（必填）

| type       | 用途                                         |
| ---------- | -------------------------------------------- |
| `feat`     | 新功能                                       |
| `fix`      | Bug 修复                                     |
| `docs`     | 文档变更                                     |
| `style`    | 代码格式变更（不影响行为，如 Prettier 调整） |
| `refactor` | 重构（不改功能，不修 bug）                   |
| `perf`     | 性能优化                                     |
| `test`     | 新增或修改测试                               |
| `chore`    | 构建流程、工具链、依赖更新等杂项             |
| `ci`       | CI 配置变更                                  |
| `revert`   | 回滚之前的 commit                            |

### scope（可选但推荐）

指明影响范围，通常是 app 或 package 名：

- `web` / `admin` / `marketing` — 对应 app
- `db` / `auth` / `ui` / `email` / `i18n` / `config` — 对应 package
- `deps` — 依赖相关
- `release` — 发版相关

### subject（必填）

- 使用英文或中文均可，**项目统一选中文**（保持一致性）
- 动词开头，句末不加句号
- 不超过 72 字符
- 描述"做了什么"，不是"为什么"

### 示例

```
feat(web): 新增 Pricing 页面
fix(db): 修复 Organization 软删除过滤失效
docs(roadmap): 调整 Phase 2 时间估算
refactor(auth): 提取 session 校验逻辑到共享工具
chore(deps): 升级 Next.js 到 15.2
```

### 破坏性变更

在 footer 加 `BREAKING CHANGE:` 说明：

```
feat(api): 重构用户 API 返回结构

BREAKING CHANGE: `GET /api/users/me` 移除了 `fullName` 字段，
改用 `firstName` + `lastName`。
```

### 禁止项

- **提交消息末尾不要包含 `Co-Authored-By` 行。** 作者信息统一以 `git config user.name` / `user.email` 为准，不在 commit body / footer 里追加 `Co-Authored-By: xxx <xxx@xxx>` 这类尾缀。使用 AI 辅助工具（如 Claude Code）生成 commit 时需显式去除该尾缀。
- 不在提交消息里带 emoji prefix（如 `✨ feat: ...`、`🐛 fix: ...`），保持纯文本格式以便 commitlint 校验和自动化脚本解析。
- 不在 subject 里带 issue 号前缀（如 `[#123] feat: ...`），需要关联 issue 时写在 body 或 footer 的 `Refs:` / `Closes:` 行。

---

## PR 流程

### 提交 PR 前自检

- [ ] 本地 `pnpm lint && pnpm typecheck && pnpm test` 全绿
- [ ] 新增功能有对应测试（至少覆盖核心路径）
- [ ] 文档已更新（如涉及用户可见变更或架构变更）
- [ ] 自己先过一遍 diff，确认没有临时调试代码、console.log、TODO 等

### PR 标题

与 commit 规范一致，使用 Conventional Commits 格式。该标题会作为 squash merge 的 commit message。

### PR 描述模板

PR 描述由 [`.github/PULL_REQUEST_TEMPLATE.md`](.github/PULL_REQUEST_TEMPLATE.md) 定义，新建 PR 时 GitHub 会自动把模板填入描述输入框。模板包含：

- **变更内容**：简要说明做了什么
- **动机 / 背景**：为什么要做，关联 issue / 需求
- **测试方式**：单测 / E2E / 手动测试步骤（checkbox 可勾选）
- **自检清单**：功能性 / 安全 / 性能 / 可观测性 / 代码质量五个维度的 checkbox，对应 [代码审查标准](#代码审查标准)
- **截图 / 录屏**：UI 变更时附上
- **需要注意的点**：破坏性变更、迁移步骤、依赖新增、环境变量变化

维护这份模板的原则：**每个 checkbox 必须有意义**。如果一条勾选对所有 PR 都毫无鉴别度（比如"代码没有 bug"这种正确的废话），就删掉。模板太长会导致 reviewer 机械勾选，失去价值。

### Merge 策略

- **默认使用 Squash and Merge**：保持 main 分支历史线性、每个 PR 一个 commit
- Merge commit 使用 PR 标题作为 message
- 合并后删除源分支

---

## 代码风格

### TypeScript

- **严格模式**：`strict: true`、`noUncheckedIndexedAccess: true`、`noImplicitOverride: true`
- **禁止 `any`**：确实需要用 `unknown` + 类型守卫；特殊情况必须加 `// eslint-disable-next-line` 注释说明原因
- **禁止 `@ts-ignore`**：用 `@ts-expect-error` 替代（强制你在问题消失时删除注释）
- **偏好 type alias 而非 interface**：除非需要 `extends` 多继承或声明合并
- **导出显式类型**：公开 API 的参数和返回值类型显式声明，不依赖推导

### 格式化

Prettier 配置在 `packages/config/prettier.config.mjs`。禁止在代码中手动调整格式（多空格、对齐等），统一由 Prettier 处理。

提交前自动格式化：Husky + lint-staged 会在 `git commit` 时自动跑 `prettier --write` 和 `eslint --fix`。

### 组件规范（React）

- **默认 Server Component**：除非需要交互，才加 `"use client"`
- **避免 `useEffect` 做数据获取**：Server Component 直接 `async/await`；客户端交互用 Server Actions
- **Props 命名**：组件 props type 使用 `<ComponentName>Props`
- **组件文件结构**：一个文件一个组件，文件名使用 kebab-case 或 PascalCase（本项目统一 **kebab-case**）

### 样式规范

- **唯一样式方案**：Tailwind CSS，不引入 CSS-in-JS、CSS Modules、SASS
- **避免任意值**：`className="p-[17px]"` 应改用最接近的 Tailwind scale（`p-4` 或扩展 config）
- **响应式优先移动端**：从 `sm:` 开始向上叠加断点
- **暗色模式**：通过 `dark:` 前缀，不用手动切换 class

### 函数与文件

- **函数长度**：超过 50 行考虑拆分
- **文件长度**：超过 300 行考虑拆分
- **圈复杂度**：ESLint 规则限制单函数圈复杂度 ≤ 10

---

## 命名规范

### 变量与函数

- 变量、函数：`camelCase`
- 常量（真正的常量）：`SCREAMING_SNAKE_CASE`
- 类型、接口、枚举：`PascalCase`
- 布尔值变量：以 `is`/`has`/`can`/`should` 开头（`isLoading`、`hasPermission`）
- 事件处理函数：以 `handle` 开头（`handleSubmit`、`handleClose`）
- React 组件：`PascalCase`

### 文件与目录

- 普通 TS 文件、工具函数：`kebab-case.ts`（`user-utils.ts`）
- React 组件文件：`kebab-case.tsx`（`pricing-card.tsx`，导出 `PricingCard`）
- 测试文件：`<source-name>.test.ts` 或 `<source-name>.spec.ts`
- 类型定义文件：`<domain>.types.ts`（`user.types.ts`）

### 数据库

采用"**DB 物理层 snake_case + Prisma/TS 层 PascalCase/camelCase**"的双层命名，通过 Prisma 的 `@map` 和 `@@map` 显式映射。方案对比与选择理由见 [ARCHITECTURE.md §6.3](docs/ARCHITECTURE.md)。

**DB 物理层**（实际存储在 Postgres 里的名字）：

- 表名：`snake_case` **复数**（`users`、`organizations`、`organization_memberships`）
- 字段名：`snake_case`（`created_at`、`organization_id`）
- 索引名：`<table>_<column(s)>_idx`（`users_email_idx`、`memberships_org_id_user_id_idx`）
- 外键约束名：`<table>_<column>_fkey`（Prisma 默认命名，保留即可）
- 枚举类型名：`snake_case`（`user_role`、`subscription_status`）
- 枚举值：`SCREAMING_SNAKE_CASE`（`ADMIN`、`PENDING_VERIFICATION`）

**Prisma / TypeScript 层**（代码里看到的名字）：

- Model 名：`PascalCase` **单数**（`User`、`Organization`、`OrganizationMembership`）
- 字段名：`camelCase`（`createdAt`、`organizationId`）

**映射规范**：每个字段和表都必须写映射，不允许让 Prisma 直接使用默认名字：

```prisma
model User {
  id             String   @id @default(uuid())
  email          String   @unique
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt        @map("updated_at")
  deletedAt      DateTime?                  @map("deleted_at")
  organizationId String                     @map("organization_id")

  organization Organization @relation(fields: [organizationId], references: [id])

  @@map("users")
  @@index([organizationId], map: "users_organization_id_idx")
}
```

**强制字段**（所有业务表必须包含）：

- `id`：主键，`uuid` 类型（不使用自增 int，避免泄漏数据量信息）
- `created_at` / `updated_at`：时间戳，`timestamptz` 类型，存 UTC
- `deleted_at`：软删除时间戳，允许 `NULL`
- `organization_id`：租户隔离外键（`users` 和 `organizations` 表本身除外）

**禁止项**：

- 不使用 `VARCHAR(n)` 限长，统一用 `TEXT`（Postgres 下性能等价）
- 不使用数据库层 `ENUM`（改用字符串 + Zod 校验，方便未来扩展）—— 例外：真正稳定的业务枚举可用 Prisma `enum`
- 不使用 camelCase 的 DB 物理列名（强制 `@map` 映射）

### 环境变量

- 服务端变量：`SCREAMING_SNAKE_CASE`（`DATABASE_URL`）
- 客户端变量：以 `NEXT_PUBLIC_` 前缀（`NEXT_PUBLIC_POSTHOG_KEY`）
- 不要在变量名里写敏感信息（`TOKEN`、`SECRET`、`KEY` 等命名 OK，但值不能泄漏）

### Git 分支

见 [分支命名](#分支命名)。

---

## 目录约定

### App 内部结构（`apps/web` 示例）

```
apps/web/
├── app/                    # Next.js App Router
│   ├── [locale]/           # i18n 动态段
│   │   ├── (auth)/         # 路由组（auth 相关页面）
│   │   ├── (dashboard)/    # 路由组（登录后页面）
│   │   └── layout.tsx
│   └── api/                # Route Handlers
│       └── webhooks/
├── components/             # 本 app 专属组件
├── lib/                    # 本 app 工具函数
├── hooks/                  # 自定义 React hooks
├── messages/               # next-intl 消息字典（或从 packages/i18n 引）
└── public/                 # 静态资源
```

### Package 内部结构（`packages/auth` 示例）

```
packages/auth/
├── src/
│   ├── index.ts            # 入口，re-export 公开 API
│   ├── client.ts           # 客户端用
│   ├── server.ts           # 服务端用
│   └── __tests__/          # 测试文件
├── package.json
└── tsconfig.json
```

### Import 路径优先级

1. 内部绝对路径：`@/components/...`（通过 tsconfig paths 配置）
2. 跨 package 引用：`@kitora/auth`、`@kitora/db`
3. 三方库：`react`、`next/navigation`
4. 相对路径：`./utils`、`../types`（只用于同目录或上一级，多级相对路径用绝对路径替代）

---

## 依赖管理

### 新增依赖前先问

- 是否真的需要？能用原生 API 或已有依赖解决吗？
- 依赖活跃度如何？（npm 周下载、最近 commit 时间、issue 响应速度）
- 包体积？（用 https://bundlephobia.com 查，前端包尤其关注 tree-shakable）
- License 是否合适？（避免 GPL 等 copyleft license）

### 安装位置

- 只在某个 app 用的依赖：装到该 app 的 `package.json`
- 多个 app 共用的依赖：装到对应 `packages/*` 里，由 app 引用 package
- **避免**把只有 web 用的包装到根目录

### 升级策略

- Dependabot 自动开 PR 升级 patch 版本
- Minor 版本每 2-4 周批量评估升级
- Major 版本评估 breaking changes 后单独升级
- **不升级不提交**：升级完必须跑完整测试 + 人工回归关键路径

---

## 测试要求

### 覆盖策略

测试是手段不是目的。不追求覆盖率数字，但以下**必须**有测试：

- 支付 webhook 的幂等性
- 权限检查（RBAC、租户隔离）
- 核心业务算法（定价计算、配额计算等）
- 签名 / 加密 / 密码哈希相关逻辑
- 用户核心流程（注册、付费、取消）

### 测试类型

- **单元测试（Vitest）**：`packages/*` 的工具函数、hooks
- **集成测试（Vitest）**：涉及数据库的 repo 层逻辑（用测试数据库）
- **E2E 测试（Playwright）**：关键用户流程，MVP 阶段至少覆盖 signup + checkout

### 测试原则

- 测试文件与源文件放在一起或 `__tests__` 目录，不集中放 `tests/`
- **不 mock 自己写的代码**：mock 第三方 SDK 即可
- **AAA 模式**：Arrange / Act / Assert 结构清晰
- **测试描述完整句子**：`describe('createUser')` + `it('returns error when email is invalid')`

---

## 数据库变更

### 新增 / 修改 schema 流程

1. 修改 `packages/db/prisma/schema.prisma`
2. 本地运行 `pnpm db:migrate:dev --name <描述性名字>`
3. Prisma 生成 `packages/db/prisma/migrations/<timestamp>_<name>/migration.sql`
4. **检查生成的 SQL**：特别关注删列、改类型、加 NOT NULL 这类破坏性操作
5. 迁移文件和 schema 变更一起提交到 Git
6. CI 跑 staging 迁移验证
7. 合并到 main 后，手动触发生产迁移

### 破坏性变更注意

- **删列 / 改列类型**：先发版新代码停止写入该列 → 等数据稳定 → 再发迁移删列（两阶段部署）
- **加 NOT NULL 字段**：先用 `@default` 或允许 null 过渡
- **大表加索引**：使用 `CREATE INDEX CONCURRENTLY`（Postgres 特性），避免锁表

### 禁止的行为

- 直接在生产数据库执行手写 SQL（除紧急事故外）
- 跳过 Prisma 直接改表结构（会与 schema.prisma 失去同步）
- 删除已应用到生产的迁移文件（会导致 migration history 错乱）

---

## ADR（架构决策记录）

**ADR 用于记录项目基线建立之后新产生的决策**。项目初版的基线决策（技术栈、目录结构、命名约定、环境分层等）全部写在 [ARCHITECTURE.md](docs/ARCHITECTURE.md) 中，不为它们单独开 ADR。

以下场景必须写一份 ADR：

- 引入新的技术栈组件（新框架、新数据库、新服务）
- 重大架构调整（拆分服务、重构核心模块、升级主要依赖到 major 版本）
- 推翻 ARCHITECTURE.md 中已有决策（同时把 ARCHITECTURE.md 对应章节标为 Superseded，加链接指向新 ADR）
- 选择方案时有多个候选且需要记录权衡过程

### ADR 文件命名

`docs/adr/<序号>-<短描述>.md`，序号四位数字递增：

- `0001-switch-to-drizzle.md`（示例：推翻"用 Prisma"的初版决策）
- `0002-adopt-merge-queue.md`（示例：Phase 2 协作者加入时启用 Merge Queue）
- `0003-add-spanish-locale.md`（示例：Phase 2 基于数据扩展语言）

### ADR 模板

```markdown
# ADR-0001: {决策标题}

- **状态**：Accepted / Superseded by ADR-XXXX / Deprecated
- **日期**：YYYY-MM-DD
- **决策者**：{作者}

## 背景（Context）

为什么需要做这个决策？当时面临什么问题或约束？

## 决策（Decision）

最终选择了什么方案？一两句话说明。

## 候选方案（Considered Alternatives）

列出评估过的其他方案及其优缺点。

## 权衡（Consequences）

这个决策带来的好处是什么？接受了什么代价？未来可能产生的约束？

## 相关链接

参考资料、benchmark、讨论链接等。
```

---

## 代码审查标准

本章节描述代码审查时对照的**标准与关注点**，属于参考型文档。真正每个 PR 需要逐项勾选的**可交互清单**在 [`.github/PULL_REQUEST_TEMPLATE.md`](.github/PULL_REQUEST_TEMPLATE.md) 中，新建 PR 时 GitHub 会自动填入描述。

### 功能性

- 实现了 PR 描述的目标，没有 scope creep
- 边界情况处理到位：空值、并发、网络错误、超时、权限不足
- 错误信息对用户友好，不直接暴露技术堆栈或内部实现细节
- 所有用户可见文案走 next-intl 字典，没有硬编码的中英文

### 安全

- 代码和提交历史中没有 secrets（API key、token、连接串）
- 所有外部输入经过 Zod schema 校验
- 权限检查到位：租户隔离（`organizationId` 过滤）、角色权限（RBAC）
- 数据库查询全部通过 Prisma，没有字符串拼接的 SQL
- 用户输入 / 第三方 API 响应不直接拼到 HTML、SQL、shell 命令

### 性能

- 没有 N+1 查询：需要关联数据时用 Prisma `include` 或 `select`
- 数据库查询有必要的索引支持（常用查询字段、外键、排序字段）
- 重复计算加缓存或 memoization
- 大列表用分页或虚拟滚动，不一次性加载全部

### 可观测性

- 关键业务事件有 PostHog 埋点（注册、付费、取消、核心功能使用）
- 异常情况有错误日志并被 Sentry 捕获
- 日志中不打印敏感信息：密码、token、身份证、完整邮箱、支付卡号

### 代码质量

- 命名清晰，避免 `data`、`info`、`temp`、`result` 这类空洞命名
- 没有未使用的 import、变量、函数、注释
- 复杂逻辑有注释说明"为什么这样做"（业务背景 / 历史决策），而不是"做了什么"（代码本身就能看出来）
- 核心流程有对应的单元测试或集成测试

---

## 常见反模式

本章节列出容易踩的具体坑，是 [代码审查标准](#代码审查标准) 的**具体化案例**——审查时重点关注这些形态是否出现。每个反模式下的写法**禁止出现在提交中**。

### React / Next.js

- 在 Server Component 使用 `useState` / `useEffect`（这俩是客户端 hooks，必须加 `"use client"` 才能用）
- 在 `app/` 目录混用 Pages Router 的 `getServerSideProps` / `getStaticProps`
- Client Component 直接 `fetch` 到自己的 API Route（应该用 Server Action，或直接在 Server Component 查数据传下来）
- 给 Server Component 传客户端不可序列化的 props（函数、class 实例、Date 对象、Map / Set）
- 在 Server Component 里读 `document` / `window` / `localStorage`（服务端没有浏览器 API）
- 所有组件默认加 `"use client"`（失去 Server Component 的性能优势，只有需要交互时才加）

### 数据库

- 查询忘记 `organizationId` 过滤（租户隔离漏洞，P0 级）
- 使用 `findUnique` 但目标字段没有 unique 约束或索引
- 在循环里跑 Prisma 查询（N+1，应该用 `include` 或批量查询）
- 删除用户 / 组织但不处理关联数据（产生孤立记录，建议用软删除 + 级联处理）
- 在代码中拼接 raw SQL 字符串（SQL 注入风险，必须用 Prisma 或参数化查询）
- `schema.prisma` 新增字段忘记写 `@map`（违反 [ARCHITECTURE.md §6.3](docs/ARCHITECTURE.md) 命名规范）
- 用自增 `int` 作为业务表主键（泄漏业务量，用 `uuid`）

### 认证 / 权限

- 权限检查放在客户端（攻击者绕过前端直接调接口就能提权）
- 用 `useUser()` 的结果判断权限（应该在 Server Component / Server Action / Route Handler 里从 session 重新读取）
- 忘记校验 webhook 签名（任何人都能伪造 webhook 改你的数据）
- Session 信息写在 localStorage（应该用 HttpOnly Cookie）
- 敏感操作不二次验证（删除账号、改邮箱、导出数据）

### 支付

- Webhook handler 不幂等（同一 event 重复处理导致重复计费 / 状态错乱）
- 先更新本地订阅状态，再调 Lemon Squeezy API（顺序反了，应该外部 API 成功后再更新本地）
- 定价数字硬编码在前端（应该从后端或配置来，避免前后不一致 / 改价要重新发版）
- 没有处理 Grace Period（付费失败直接切 Free，用户体验差且可能误杀）
- Webhook 处理超时（Lemon Squeezy 会重试，若处理非幂等就会出问题）

### i18n

- `<button>Submit</button>` 这种硬编码文案
- 拼接字符串造句（`"Hello " + name + "!"`）—— 应该用 ICU 参数 `t("greeting", { name })`
- `new Date().toLocaleString()` 不传 locale 参数（会用运行环境 locale，SSR 会不一致）
- 用 `Intl.NumberFormat` / `Intl.DateTimeFormat` 硬编码 locale 而不是读用户偏好
- 邮件模板只写英文版不做 locale 分支
- 在 Server Component 里用 `useTranslations`（这是客户端 hook，Server 端要用 `getTranslations`）

### 可观测性

- 打印 `console.log` 到生产（应该用结构化日志库，或 Sentry breadcrumb）
- 日志里打印完整用户邮箱、手机号、身份证、支付卡号
- 业务关键路径没埋点（事后想看漏斗却没数据）
- Sentry 里大量 `unhandled rejection` 没人处理（噪音淹没真问题）

### 代码组织

- 新增功能不写测试就合入 main
- 一个 PR 改 500+ 行，reviewer 无法仔细看（应该拆分）
- 复制粘贴代码形成三处相同逻辑（应该提取到 `packages/utils` 或领域服务）
- 在 `apps/web/lib` 下写的工具函数其他 app 也想用（应该放 `packages/utils`）

---

## 变更记录

| 日期       | 变更     | 作者       |
| ---------- | -------- | ---------- |
| 2026-04-20 | 初版起草 | {{AUTHOR}} |
