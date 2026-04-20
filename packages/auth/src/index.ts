/**
 * Kitora 认证封装（占位）
 *
 * Phase 0 只建目录骨架。Phase 1 在此实现：
 * - Supabase Auth 客户端与服务端封装（见 CONTRIBUTING.md §Package 内部结构
 *   推荐的 client.ts / server.ts 拆分）
 * - 基于 Organization + Role 的 RBAC 工具函数（见 ARCHITECTURE.md §7.2）
 * - Session 校验中间件
 *
 * 保留一个类型导出，避免 `export {}` 被工具链视为空模块。
 */

/** Membership 角色，与 packages/db 中 Membership.role 的允许取值保持同源 */
export type Role = 'owner' | 'admin' | 'member';
