/**
 * Kitora 通用工具函数
 *
 * 这里放 runtime agnostic 的纯函数：既能在 Node 服务端跑，
 * 也能在浏览器 / Server Component / Server Action 里跑。
 * 绑定到 DOM / 绑定到 React 的工具请放在 packages/ui。
 */

/**
 * 将任意可能为空的值断言为非空，并返回原值。
 * 若值为 null / undefined，抛出带上下文的错误——比裸写 `value!` 更安全。
 *
 * @example
 * const user = assertDefined(await getUser(id), `user ${id} not found`);
 */
export function assertDefined<T>(value: T | null | undefined, message: string): T {
  if (value === null || value === undefined) {
    throw new Error(message);
  }
  return value;
}

/**
 * 延迟指定毫秒数，返回 Promise。用于测试、节流降级等场景。
 * 生产代码中请谨慎使用，优先考虑事件驱动实现。
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
