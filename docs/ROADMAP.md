# Kitora 开发路线图

> 本文档按阶段定义 Kitora 从 0 到 1 的开发计划。每个阶段包含**目标**、**交付物**、**完成定义（Definition of Done）**、**预估时间**。时间估算按独立开发者全职工作测算；兼职投入需按实际比例延长。
>
> 路线图是活文档，根据实际进度和反馈持续调整。Phase 之间可有少量并行，但原则上不允许"跳过 Phase 进入下一阶段"。

---

## 总览

| 阶段     | 名称                    | 时间    | 核心目标                           |
| -------- | ----------------------- | ------- | ---------------------------------- |
| Phase 0  | 仓库基建 + 开发环境     | 1-2 周  | 让"开始写业务代码"前的基建就绪     |
| Phase 1  | MVP 核心闭环            | 6-10 周 | 实现从访问到付费的完整用户旅程     |
| Phase 2  | 公测（Beta）            | 4-6 周  | 真实用户验证，打磨产品和漏斗       |
| Phase 3  | 付费开放（Launch）      | 4-6 周  | 正式开售，建立首批 MRR 和内容飞轮  |
| Phase 4+ | 持续增长（Post-Launch） | 持续    | 按数据驱动迭代，扩展国际化和新功能 |

**全周期预估**：15-24 周（约 4-6 个月），从 Phase 0 启动到 Phase 3 完成。

**独立开发者节奏建议**：

- 全职投入：按上面估算执行
- 兼职（每周 20 小时）：时间 × 1.8-2.0 倍
- 业余（每周 10 小时以下）：时间 × 3.5-4.0 倍，且每阶段加一层"保持动力"的心理预期

---

## 核心原则

贯穿所有阶段的执行原则：

1. **做减法优先**：MVP 范围从"完成核心闭环"定义，而不是"把想到的功能都做掉"。
2. **可测可见**：每个阶段结束前，关键指标必须可观测（PostHog 事件、Sentry 错误、Uptime）。
3. **文档驱动**：每引入一个新依赖、每做一个重大决策，要么写进 ARCHITECTURE.md，要么写一份 ADR。
4. **小步提交**：单次 PR 不超过 400 行变更，commit message 遵循 Conventional Commits。
5. **不追求完美**：Phase 1-3 的目标是跑通流程和建立反馈循环，不是代码艺术。性能和代码质量放在 Post-Launch 持续优化。

---

## Phase 0：仓库基建 + 开发环境

**预估时间**：1-2 周

### 目标

让"开始写业务代码"前的所有基础设施和开发环境准备到位。Phase 0 结束时，新开一个功能分支后应该能立刻开始写业务代码，不再被任何"基建"问题阻塞。

### 交付物

**仓库骨架**

- [ ] 初始化 Git 仓库，创建 GitHub private repo
- [ ] pnpm workspace 配置（`pnpm-workspace.yaml`、根 `package.json`）
- [ ] Turborepo 配置（`turbo.json`），定义 `dev` / `build` / `lint` / `test` 任务
- [ ] 目录结构按 ARCHITECTURE.md §4.3 创建：`apps/web`、`apps/admin`、`apps/marketing`、`packages/*`

**三个 app 的初始 scaffold**

- [ ] `apps/web`：Next.js 16 App Router 脚手架，访问根路径显示 "Hello Web"
- [ ] `apps/admin`：同上
- [ ] `apps/marketing`：同上
- [ ] 三者共享 Tailwind preset，引用 `packages/config/tailwind-preset.ts`

**共享 packages**

- [ ] `packages/config`：tsconfig、eslint、prettier、tailwind preset
- [ ] `packages/db`：Prisma 初始化，schema 含 User / Organization / Membership / Subscription / Invitation 骨架
- [ ] `packages/ui`：shadcn/ui 初始化（至少 Button / Input / Dialog 三个组件验证通路）
- [ ] `packages/i18n`：next-intl 配置 + 英语 messages 空壳
- [ ] `packages/email`：React Email + Resend SDK 初始化
- [ ] `packages/auth`、`packages/utils`、`packages/types`：空目录 + package.json 占位

**代码规范**

- [ ] TypeScript 严格模式（`strict: true`、`noUncheckedIndexedAccess`）
- [ ] ESLint：基于 `@typescript-eslint` + `eslint-config-next` + Prettier 集成
- [ ] Husky + lint-staged：pre-commit 跑 lint + format
- [ ] commitlint：强制 Conventional Commits 规范
- [ ] `.editorconfig` 统一编辑器行为

**CI / CD**

- [ ] GitHub Actions：`.github/workflows/ci.yml`（lint、type check、build）
- [ ] Vercel Project 创建（三个 app 分别接入）
- [ ] Branch protection：`main` 分支禁止直推，要求 CI 通过 + 至少 1 个 review（自己 review 也行）
- [ ] `main` 合并触发生产部署，PR 自动生成 Preview

**数据库连通**

- [ ] Supabase 账号注册，创建 dev 和 prod 两个项目
- [ ] 本地连通：`pnpm db:migrate:dev` 能跑
- [ ] Prisma Studio 能启动
- [ ] 初版 schema 应用到 dev 数据库

**环境变量管理**

- [ ] `.env.example` 列出所有变量（不含值）
- [ ] `.env.local` 本地开发值（git ignore）
- [ ] Vercel 各环境变量配置完成
- [ ] 决定：Doppler 是否立即启用（可延后到 Phase 2）

**文档**

- [ ] `README.md` 含本地开发 quick start
- [ ] `CONTRIBUTING.md` 含 git workflow、commit 规范、代码风格约定
- [ ] `docs/adr/README.md` 就位，目录为 Phase 1+ 过程中出现的新决策预留；基线决策已写入 ARCHITECTURE.md，不单独开 ADR

### 完成定义（DoD）

- `pnpm install && pnpm dev` 能同时启动三个 app，对应端口访问都显示 "Hello" 页面
- `git commit` 会触发 lint + format + commit message 校验
- 推 PR 到 GitHub，CI 自动跑通过
- PR 合并到 main，三个 app 在 Vercel 自动部署成功
- `pnpm db:migrate:dev` 能成功迁移 schema 到 Supabase dev 项目
- Prisma Studio 能打开并看到初版表结构

### 风险与注意

- **陷阱**：Phase 0 容易"完美主义"，一直在调配置不开始写业务。**硬性约束：Phase 0 不超过 2 周**，即使有瑕疵先进入 Phase 1，边写业务边补基建。
- **依赖上游**：Supabase 和 Vercel 账号开通顺畅（通常当天），但 Resend、Lemon Squeezy 的域名验证和账号审核可能需要 1-3 天。

---

## Phase 1：MVP 核心闭环

**预估时间**：6-10 周（取决于核心产品功能复杂度）

### 目标

实现从"访客看到落地页"到"完成付费并使用付费功能"的完整用户旅程。Phase 1 结束时，你可以邀请第一个真实用户完成这个闭环。

### 交付物

**认证系统**

- [ ] Supabase Auth 集成，封装在 `packages/auth`
- [ ] 注册流程：Email + 密码，立即发送邮箱验证邮件
- [ ] 登录流程：Email + 密码，错误信息友好
- [ ] 忘记密码流程：发送重置链接 → 设置新密码
- [ ] 邮箱验证流程
- [ ] OAuth 社交登录：Google + GitHub（至少一个）
- [ ] Session 管理、登出
- [ ] 注册时自动创建一个默认 Organization，用户自动成为 `owner`

**核心产品功能（MVP 内容占位）**

- [ ] `{{MVP_CORE_FEATURE_1}}`
- [ ] `{{MVP_CORE_FEATURE_2}}`
- [ ] `{{MVP_CORE_FEATURE_3}}`
- [ ] 核心功能的权限检查（按 Subscription 状态和 Plan 区分免费 / 付费功能）

**用户中心**

- [ ] 设置页：修改个人资料、密码、邮箱
- [ ] 偏好页：语言（locale）、时区（timezone）、邮件通知开关
- [ ] Organization 设置：组织名称、logo（即使 MVP 不开放团队邀请，预留界面）
- [ ] 账户删除流程（含数据导出选项）

**支付与订阅**

- [ ] Lemon Squeezy Store 创建，产品（Plan）配置
- [ ] 定价方案：至少 Free + Pro 两档，月付 + 年付（年付 20% 折扣）
- [ ] 按区域多货币定价（USD / EUR 起步）
- [ ] Checkout 流程：用户点击升级 → Lemon Squeezy 托管结账 → 返回成功页
- [ ] Webhook handler：签名校验、幂等处理、状态同步到 `Subscription` 表
- [ ] 账单页：查看当前订阅、下次续费日期、发票历史（Lemon Squeezy 提供）
- [ ] 订阅管理：升级 / 降级 / 取消 / 重新激活
- [ ] Grace period 处理：付费失败后的降级逻辑

**邮件系统**

- [ ] Resend 域名配置（`mail.kitora.co` + SPF / DKIM / DMARC）
- [ ] 事务邮件模板（英语版）：
  - [ ] 欢迎邮件
  - [ ] 邮箱验证
  - [ ] 密码重置
  - [ ] 订阅确认
  - [ ] 付费收据
  - [ ] 订阅即将到期 / 付费失败提醒
- [ ] 所有邮件按用户 `locale` 选择模板（MVP 只有英语模板，但代码路径支持）

**营销官网（apps/marketing）**

- [ ] 首页（Hero + 核心价值主张 + 社会证明位预留 + CTA）
- [ ] 功能页（Features）
- [ ] 定价页（Pricing）
- [ ] FAQ 页
- [ ] About / 联系方式
- [ ] Legal 页：Privacy Policy、Terms of Service、Cookie Policy、Refund Policy（可用 Termly 或 iubenda 生成）
- [ ] Blog 框架（即使 MVP 不写内容，结构要就位）
- [ ] 404 / 500 错误页

**i18n 基础**

- [ ] next-intl 在三个 app 中配置完成
- [ ] URL sub-path 策略生效（`/en/*` 和 `/zh/*`）
- [ ] 所有用户可见文案走翻译字典（禁止硬编码）
- [ ] 日期 / 数字 / 货币格式用 `Intl.*` API
- [ ] 英语 messages 完整（默认语言，面向目标市场）
- [ ] 简体中文 messages 完整（开发辅助，与英语同步维护）
- [ ] 邮件模板至少覆盖 en + zh-CN 两种 locale

**可观测性**

- [ ] Sentry 接入三个 app，上传 source map
- [ ] PostHog 接入，完成以下埋点：
  - [ ] 注册漏斗：`landing_view` → `signup_start` → `signup_complete`
  - [ ] 激活事件：`first_aha_moment`（产品特定，在 Phase 1 定义）
  - [ ] 付费漏斗：`pricing_view` → `checkout_start` → `checkout_complete`
  - [ ] 核心功能使用事件
  - [ ] 退订漏斗：`cancel_start` → `cancel_complete`（含原因）
- [ ] Better Stack Uptime 监控三个域名
- [ ] Sentry 告警规则：新错误、错误率尖峰

**管理后台（apps/admin）**

- [ ] Admin 登录（只允许特定邮箱白名单 + IP 限制，MVP 阶段简单粗暴）
- [ ] 用户列表 + 详情查看
- [ ] 订阅状态查看
- [ ] 手动给用户开通 / 延长订阅（用于运营支持和 bug 补偿）
- [ ] 基础数据看板：今日注册数、活跃用户数、MRR

### 完成定义（DoD）

**功能闭环可跑**：新用户能从 marketing 首页开始，完成以下完整流程：

1. 访问首页 → 理解产品价值
2. 点击 CTA → 注册（Email 或 OAuth）
3. 收到验证邮件 → 点击验证
4. 登录 → 看到 dashboard
5. 试用核心功能（Free 档可用部分）
6. 触发付费墙 → 进入 Pricing 页
7. 选择 Pro 档月付 → Lemon Squeezy Checkout
8. 付款成功 → 返回 dashboard，订阅状态变为 `active`
9. 使用付费功能
10. 收到付费收据邮件
11. 在账单页可以看到订阅和历史
12. 可以无障碍取消订阅

**可观测性**：

- Sentry 能看到真实错误堆栈 + source map 解析
- PostHog 能看到上述漏斗各步骤的事件
- Better Stack 能在模拟 down 时 5 分钟内通知

**代码质量**：

- CI 全绿（lint + type check + build + test）
- 核心流程有 E2E 测试（至少 signup + checkout 两条链路）
- 关键包有单元测试（`packages/auth`、`packages/db` 工具函数）

### 风险与注意

- **陷阱 1**：Lemon Squeezy Webhook 的幂等处理是 P0，处理不好会导致重复计费或状态错乱。务必在单元测试中覆盖"同一 event 重复收到"的场景。
- **陷阱 2**：i18n 的硬编码文案是"debt 之王"，Phase 1 发现一处立即修一处，不要留到 Phase 2。
- **依赖上游**：Lemon Squeezy 账号审核可能需要 2-5 天，涉及身份验证、税务信息填写。提前在 Phase 0 末尾开始办。

---

## Phase 2：公测（Beta）

**预估时间**：4-6 周

### 目标

从"产品能用"过渡到"真实用户跑通"。通过 Closed Beta 发现产品问题，通过 Open Beta 验证获客漏斗，为 Phase 3 的付费开放铺路。

### 子阶段

**2.1 Closed Beta（2-3 周）**

邀请 10-30 个早期用户使用（从 waitlist、Twitter 关注者、朋友圈专业联系人中挑选）。Closed Beta 用户免费使用所有功能，作为交换他们提供反馈。

**2.2 Open Beta（2-3 周）**

免费公开，任何人都可以注册。在 IndieHackers、Reddit 相关社区、Twitter #buildinpublic 宣传。仍然免费，目的是增加注册量积累反馈和 SEO 入口。

### 交付物

**用户反馈机制**

- [ ] 客服工具（Crisp 免费版）接入 dashboard
- [ ] 用户反馈收集（自建页面 or Canny 功能投票）
- [ ] 在 dashboard 显眼处放"反馈"入口
- [ ] 每周定期 1:1 访谈 3-5 个 Beta 用户

**性能与稳定**

- [ ] Lighthouse 分数（marketing 页面）≥ 90
- [ ] Core Web Vitals 绿色
- [ ] 修复 Beta 阶段发现的所有 P0 / P1 bug
- [ ] Sentry 错误率降到可接受水平（新错误每天 < 5 个）

**SEO 基础**

- [ ] `sitemap.xml` 自动生成
- [ ] `robots.txt`
- [ ] OG 图（每页有合适的社交分享卡片）
- [ ] meta title / description 优化
- [ ] 结构化数据（JSON-LD）：至少 Organization、WebSite
- [ ] hreflang 标签（为未来多语言准备）

**数据分析**

- [ ] PostHog 搭建仪表盘：注册漏斗、激活率、7 日留存、28 日留存
- [ ] 建立 baseline：每个关键漏斗步骤的转化率
- [ ] 识别最大漏斗损失点（例如"注册到激活"的流失）

**安全自查**

- [ ] 依赖漏洞扫描（`pnpm audit`、Dependabot 启用）
- [ ] OWASP Top 10 self-check（SQL 注入、XSS、CSRF 等）
- [ ] 认证与授权测试：跨租户访问、权限提升
- [ ] Rate limiting（登录、注册、API 关键端点）

**Launch 预热**

- [ ] Product Hunt "Coming Soon" 页创建
- [ ] Twitter、IndieHackers 预热帖计划
- [ ] 收集邮件列表（Resend Broadcasts）
- [ ] 准备首批 blog content 大纲（Phase 3 用）

**环境升级（按需）**

独立开发者 Phase 0-1 阶段采用 Development + Production 二环境模型。Phase 2 出现以下情况时，评估是否引入 staging 长期环境（详见 [ARCHITECTURE.md §12.2](ARCHITECTURE.md)）：

- [ ] 若 Beta 用户需要稳定长期访问地址，且 PR Preview 的生命周期不适合 → 启用 `staging` 分支
- [ ] 若启用 staging：创建独立 Vercel Project + 独立 Supabase 项目 + 配置 `staging.kitora.co`（或 `beta.kitora.co`）域名
- [ ] 若启用 staging：CI 配置 `staging` 分支自动执行 `prisma migrate deploy`
- [ ] 若不启用 staging：继续沿用"PR Preview 冒烟 + 生产 Instant Rollback 兜底"的双保险模型

### 完成定义（DoD）

- **活跃用户**：至少 30 个注册用户完成核心流程并使用超过 1 周
- **留存**：D7 留存率 > 20%（B2B SaaS 初期基准）
- **反馈**：至少 10 条有质量的用户反馈并分类（bug / feature request / confusion）
- **性能**：所有关键页面 Lighthouse 90+
- **稳定**：连续 2 周无 P0 bug，Sentry 错误率稳定
- **Launch 就绪**：Product Hunt 页准备好、媒体 / 社群预热完成

### 风险与注意

- **陷阱 1**：Beta 期间容易陷入"用户提什么加什么"的陷阱。保持产品焦点，按 ROI 排序反馈。
- **陷阱 2**：Closed Beta 的免费用户不等于付费用户，他们的反馈有偏差（尤其"如果不收费我会用"类的伪信号）。
- **心态**：Beta 期间反馈经常是"产品太复杂 / 太简单 / 不够好看"，不要被情绪化反馈打乱节奏，只关注可验证的具体问题。

---

## Phase 3：付费开放（Public Launch）

**预估时间**：4-6 周

### 目标

正式开售，产生第一批 MRR（Monthly Recurring Revenue）。建立可重复的获客循环（内容 SEO + 社交 building in public + 口碑），为 Phase 4 持续增长铺基础。

### 交付物

**正式定价生效**

- [ ] Beta 期间免费的高级功能进入付费墙
- [ ] 现有 Beta 用户的优惠处理（例如早期用户终身 50% off，用 Lemon Squeezy 的 discount code）
- [ ] Annual 订阅强力推广（首年折扣、Pro 档默认推荐年付）
- [ ] 定价心理锚点调整（A/B 测试空间）

**Launch 活动**

- [ ] Product Hunt 正式 Launch（选周二或周三上午 12:01 PST）
- [ ] Launch 当天在 Twitter、IndieHackers、Hacker News、Reddit 相关 sub 发 launch post
- [ ] 邮件给 waitlist 全员发 launch 通知
- [ ] 视频 demo（1-2 分钟 Loom，放首页和 launch 帖里）

**内容与 SEO**

- [ ] 首批 5-10 篇 blog post 发布（产品介绍 + 使用教程 + SEO 关键词布局）
- [ ] Changelog 页（每次发布更新公开记录，作为 SEO 和信任度信号）
- [ ] 公开路线图页（可用 Canny）

**用户运营**

- [ ] 新用户欢迎 drip campaign（D0 欢迎 → D2 使用指南 → D5 进阶技巧 → D14 反馈邀请）
- [ ] 付费用户专属 onboarding
- [ ] 流失挽回邮件（取消订阅后 D3 / D14 发送挽回邮件）

**增长基础设施**

- [ ] 推荐计划（Affiliate，可选）：Lemon Squeezy 原生支持
- [ ] 客户案例页（第一个客户开始做 case study）
- [ ] 用户社区（Discord 或 Slack，可选）

**分析与 KPI**

- [ ] MRR 追踪看板
- [ ] Churn 率监控
- [ ] CAC（获客成本）与 LTV（用户生命周期价值）初步测算
- [ ] 每周产出指标周报（自用）

**客服 SLA**

- [ ] 付费用户首次响应时间 < 24 小时
- [ ] 工作日内首次响应 < 8 小时
- [ ] FAQ 和 Help Center（用 Mintlify 或 Nextra）建立

### 完成定义（DoD）

- **第一个付费用户**：完成首单付费（可能是你自己的朋友，也算数但要真实付款）
- **MRR ≥ $100**：第一个可度量的商业化里程碑
- **Launch 数据**：Product Hunt launch 取得前 20 名或 500+ upvote（B2B SaaS 常见）
- **内容运营**：至少 3 篇 blog 获得 Google 自然流量
- **用户运营**：drip campaign 全部自动化运行
- **客服**：积累前 10 个客服工单的响应模板

### 风险与注意

- **陷阱 1**：Launch 过度关注单日数字（Product Hunt 名次），但真正重要的是 launch 后 30 天的留存和付费转化。
- **陷阱 2**：首个付费用户到第 10 个付费用户之间通常有 2-3 个月"死亡低谷"，需要心理准备。独立开发者的 SaaS 平均需要 18 个月到 $1K MRR，Kitora 不例外。

---

## Phase 4+：持续增长（Post-Launch）

**时间**：持续，按月度 / 季度迭代

### 方向（按优先级参考，实际根据数据决定）

**产品扩展**

- 基于 PostHog 数据迭代核心功能
- 新功能按月发布节奏
- 开放团队 / 协作功能（若 MVP 阶段是单人产品）

**国际化扩展**

- MVP 已支持：英语（默认，面向目标市场）+ 简体中文（开发辅助，与英语同步维护）
- Post-Launch 早期：基于访问数据决定加哪些语言，候选顺序按欧美优先 — 西班牙语 → 德语 → 法语
- 中期：日语、葡萄牙语（巴西）、繁体中文（若有流量信号）
- 后期：RTL 语言（阿拉伯语、希伯来语），涉及 UI 方向翻转、需单独评估成本

**渠道多样化**

- SEO 长尾内容（每周 1-2 篇）
- YouTube / X 视频内容
- 付费广告测试（Google Ads、Reddit Ads，小预算试错）
- 开源 side project 引流（独立开发者经典套路）

**产品 API / 生态**

- 对外开放 API（Pro 档权益）
- Zapier / Make 集成
- 浏览器扩展 / CLI（若适用）

**团队扩张**

- 到 $10K MRR 考虑招第一个兼职：客服或内容
- 到 $30K MRR 考虑招第一个兼职：开发者
- 到 $50K MRR 考虑注册公司实体，把 Lemon Squeezy 替换为 Stripe 降低费率

### 关键指标长期目标（参考）

| 指标           | 3 个月 | 6 个月 | 12 个月 | 18 个月 |
| -------------- | ------ | ------ | ------- | ------- |
| MRR            | $100   | $500   | $2,000  | $5,000+ |
| 付费用户数     | 5      | 30     | 120     | 300+    |
| 月新增注册     | 50     | 300    | 1,000   | 3,000+  |
| Churn 率（月） | < 15%  | < 10%  | < 7%    | < 5%    |

这些是**参考目标**，不是硬性 KPI。独立开发者 SaaS 的增长曲线高度不确定，目标是建立"每月都在增长"的趋势。

---

## 路线图外（Non-Goals）

为防止失焦，以下事项在 Launch 后 12 个月内**明确不做**：

- **企业版 / SSO / SAML**：需要显著的合规和销售投入，等 MRR 稳定再说
- **手机原生 App**
- **本地化部署 / 私有云**
- **复杂微服务拆分**
- **换语言 / 换框架重构**（除非遇到根本性瓶颈）
- **融资**：独立开发者模式运营，保持小而美

---

## 附录 A：阶段间的 Gate 检查

每个 Phase 结束前，必须通过以下检查才能进入下一 Phase：

**Phase 0 → Phase 1 Gate**

- 基建完成度自检（全部 DoD 条目打勾）
- 已经写过至少一次完整的 PR 流程（branch → commit → PR → CI → review → merge → deploy）

**Phase 1 → Phase 2 Gate**

- 新用户完整闭环走通（注册 → 付费 → 使用付费功能 → 取消）
- 可观测性三件套全接入且有数据
- 所有 legal 页准备好

**Phase 2 → Phase 3 Gate**

- 活跃 Beta 用户 ≥ 30
- D7 留存 > 20%
- Lighthouse ≥ 90
- 连续 2 周无 P0 bug

**Phase 3 → Phase 4 Gate**

- 第一个真实付费用户
- MRR ≥ $100
- 增长漏斗数据建立 baseline

---

## 附录 B：变更记录

| 日期       | 变更     | 作者       |
| ---------- | -------- | ---------- |
| 2026-04-20 | 初版起草 | {{AUTHOR}} |
