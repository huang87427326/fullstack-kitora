/**
 * Kitora 全站支持的语言列表与默认语言。
 *
 * - en：默认语言 + 目标市场语言（北美 / 欧洲）
 * - zh-CN：开发辅助语言，与英语同步维护
 *
 * 扩展到更多语言见 ARCHITECTURE.md §10.6。
 */
export const locales = ['en', 'zh-CN'] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

/** 判断输入字符串是否是我们支持的 locale（用于运行时校验 URL 段 / cookie） */
export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
