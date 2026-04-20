import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * 合并 className，带 Tailwind 感知的去重语义。
 *
 * - clsx 负责处理条件 / 数组 / 对象形式的类名输入
 * - twMerge 对冲突的 Tailwind 工具类做去重（例如 `p-2 p-4` → `p-4`）
 *
 * shadcn/ui 的标准 `cn` 辅助函数，所有 shadcn 组件都依赖它。
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
