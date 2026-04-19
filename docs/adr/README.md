# Architecture Decision Records

本目录记录 Kitora 项目**基线建立之后**新产生的架构决策。

## 什么在这里，什么不在这里

**在这里（未来添加）：**

- 推翻 [ARCHITECTURE.md](../ARCHITECTURE.md) 中某个初版决策（例如将 Prisma 切换到 Drizzle）
- 引入新的技术栈组件（新数据库、新服务、新工具链）
- 重大架构调整（拆服务、引入消息队列、切换认证方案）
- 有多个候选方案且需要记录权衡过程的决策

**不在这里：**

- 项目初版的基线决策——目录结构、技术栈选型、命名约定、环境分层、多租户模型等——这些都是 [ARCHITECTURE.md](../ARCHITECTURE.md) 的内容。ADR 的价值在于"项目演进过程中某个时间点的决策留痕"，把初版架构拆分成几十个 ADR 反而稀释了这层价值。

## 写一份 ADR

- 文件命名：`<序号>-<短描述>.md`，序号四位数字递增（`0001-*.md`、`0002-*.md`）
- 模板：见 [CONTRIBUTING.md §ADR](../../CONTRIBUTING.md#adr架构决策记录)
- 被推翻时：旧 ADR 状态改为 `Superseded by ADR-XXXX`，同时在 ARCHITECTURE.md 对应章节加提示

## 现状

目前还没有 ADR。项目正处于 Phase 0 基线阶段，所有决策都沉淀在 ARCHITECTURE.md 中。Phase 1 开始后，第一个真正的决策权衡出现时再建 `0001-*.md`。
