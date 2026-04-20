/**
 * 加载指定 locale 的消息字典。
 *
 * next-intl 的 Server Components / Server Actions 在运行时按需加载 messages，
 * 避免打包所有语言进同一个 bundle。
 *
 * 消息文件放在 `packages/i18n/messages/<locale>.json`。
 */
import { defaultLocale, isLocale, type Locale } from './config';

export type Messages = Record<string, unknown>;

export async function loadMessages(locale: string): Promise<Messages> {
  const target: Locale = isLocale(locale) ? locale : defaultLocale;
  const mod = (await import(`../messages/${target}.json`)) as { default: Messages };
  return mod.default;
}
