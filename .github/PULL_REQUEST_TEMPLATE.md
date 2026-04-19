<!--
  Kitora PR 模板
  详细规范见 /CONTRIBUTING.md
  标题需遵循 Conventional Commits：<type>(<scope>): <subject>
-->

## 变更内容

<!-- 简要说明这个 PR 做了什么（1-3 句话） -->

## 动机 / 背景

<!-- 为什么要做？关联 issue 或需求。格式示例：Closes #123 / Refs #456 -->

## 测试方式

- [ ] 单元测试已补充或更新
- [ ] E2E 测试已补充或更新（涉及关键用户流程时必选）
- [ ] 手动测试步骤：
  1.
  2.

## 自检清单

对照 [CONTRIBUTING.md §代码审查标准](/CONTRIBUTING.md#代码审查标准) 勾选：

### 功能性

- [ ] 无 scope creep，严格对应 PR 描述目标
- [ ] 边界情况已处理（空值、并发、网络错误、超时、权限不足）
- [ ] 错误信息对用户友好
- [ ] 用户可见文案走 next-intl 字典，无硬编码

### 安全

- [ ] 代码中无 secrets
- [ ] 外部输入有 Zod 校验
- [ ] 权限检查到位（租户隔离、RBAC）
- [ ] SQL 通过 Prisma，无字符串拼接

### 性能

- [ ] 无 N+1 查询
- [ ] 必要字段有索引支持
- [ ] 大列表有分页 / 虚拟滚动

### 可观测性

- [ ] 关键事件有 PostHog 埋点
- [ ] 异常有 Sentry 捕获
- [ ] 日志不含敏感信息

### 代码质量

- [ ] 命名清晰，无空洞命名
- [ ] 无未使用的 import / 变量 / 函数
- [ ] 复杂逻辑有注释说明"为什么"

### 数据库变更（如涉及）

- [ ] `schema.prisma` 变更遵循 [ARCHITECTURE.md §6.3](/docs/ARCHITECTURE.md) 命名规范（snake_case 物理层 + `@map` 映射）
- [ ] 生成的 `migration.sql` 已 review，无意外的破坏性操作
- [ ] 业务表已加 `organization_id` 外键（租户隔离）
- [ ] 迁移已在本地 Supabase dev 项目验证

## 截图 / 录屏

<!-- 涉及 UI 变更时必附。移动端 / 桌面端都要覆盖 -->

## 需要注意的点

<!--
  以下任一情况，请在此明确说明：
  - 破坏性变更（BREAKING CHANGE）
  - 数据库迁移步骤
  - 新增依赖（说明选型理由）
  - 环境变量新增 / 变更
  - 需要手动执行的运维步骤
-->

---

<!--
  合并前确认：
  - [ ] PR 标题遵循 Conventional Commits
  - [ ] commit 消息无 Co-Authored-By 尾缀
  - [ ] CI 全绿
  - [ ] 分支已 rebase 到最新 main（如需要）
-->
