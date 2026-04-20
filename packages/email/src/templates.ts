/**
 * 邮件模板按 locale 分发。
 *
 * 约定（ARCHITECTURE.md §9.3）：
 *   packages/email/templates/<template-name>/<locale>.tsx
 *
 * 任一 locale 缺失时回落到英语版，保证发送链路不因为翻译未到位而失败。
 *
 * 新增模板的步骤：
 *   1. 在 templates/<name>/ 下放 en.tsx + zh-CN.tsx（至少这两份）
 *   2. 在本文件的 templates 注册表里登记 props 类型
 *   3. 使用方 `getTemplate('<name>', locale, props)` 得到可直接传给
 *      `sendEmail` 的 React 元素
 */
import type { ReactElement } from 'react';

import { defaultLocale, isLocale, type Locale } from '@kitora/i18n';

import WelcomeEn, { type WelcomeEmailProps } from '../templates/welcome/en';
import WelcomeZhCN from '../templates/welcome/zh-CN';

type Registry = {
  welcome: {
    props: WelcomeEmailProps;
    locales: Record<Locale, (props: WelcomeEmailProps) => ReactElement>;
  };
};

const registry: Registry = {
  welcome: {
    // props 字段仅用于类型占位，不在运行时使用
    props: undefined as unknown as WelcomeEmailProps,
    locales: {
      en: WelcomeEn,
      'zh-CN': WelcomeZhCN,
    },
  },
};

export type TemplateName = keyof Registry;
export type TemplateProps<T extends TemplateName> = Registry[T]['props'];

export function getTemplate<T extends TemplateName>(
  name: T,
  locale: string,
  props: TemplateProps<T>,
): ReactElement {
  const resolved: Locale = isLocale(locale) ? locale : defaultLocale;
  const render = registry[name].locales[resolved] ?? registry[name].locales[defaultLocale];
  return render(props);
}
