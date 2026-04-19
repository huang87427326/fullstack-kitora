/**
 * Kitora 跨 app 共享类型
 *
 * 这里放确实需要被多个 app / package 引用的类型定义。
 * 单一 app 内部使用的类型请就地定义，不要污染这个包。
 */

/**
 * 领域实体的通用审计字段，对应 ARCHITECTURE.md §6.3 数据库命名约定：
 * 数据库列以 snake_case 存储，代码层通过 Prisma @map 暴露为 camelCase。
 */
export interface AuditFields {
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 分页查询的标准响应结构。
 */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
