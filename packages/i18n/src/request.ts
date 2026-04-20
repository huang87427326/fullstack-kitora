/**
 * next-intl 的 request 配置工厂。
 *
 * 在各 app 的 `i18n/request.ts` 中引用：
 *
 *   import { createRequestConfig } from '@kitora/i18n';
 *   import { getRequestConfig } from 'next-intl/server';
 *
 *   export default getRequestConfig(createRequestConfig);
 *
 * 实际 locale 由 next-intl middleware 从 URL / cookie / Accept-Language
 * 推断（完整优先级见 ARCHITECTURE.md §10.4），这里只负责按 locale 加载
 * 对应的消息字典。
 */
import type { GetRequestConfigParams, RequestConfig } from 'next-intl/server';

import { defaultLocale, isLocale } from './config';
import { loadMessages } from './messages';

export async function createRequestConfig({
  requestLocale,
}: GetRequestConfigParams): Promise<RequestConfig> {
  const requested = await requestLocale;
  const locale = requested && isLocale(requested) ? requested : defaultLocale;

  return {
    locale,
    messages: await loadMessages(locale),
  };
}
