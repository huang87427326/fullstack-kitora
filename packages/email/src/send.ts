/**
 * 统一的事务邮件发送入口。
 *
 * 使用方式：
 *
 *   import { sendEmail, getTemplate } from '@kitora/email';
 *
 *   await sendEmail({
 *     to: user.email,
 *     subject: 'Welcome to Kitora',
 *     react: getTemplate('welcome', user.locale, { name: user.name }),
 *   });
 *
 * 营销邮件走 Resend Broadcasts API（见 ARCHITECTURE.md §9.2），
 * 不要复用这个函数，避免污染事务邮件的发送 IP 信誉。
 */
import type { ReactElement } from 'react';

import { getResendClient } from './client';

export interface SendEmailParams {
  to: string | string[];
  subject: string;
  react: ReactElement;
  from?: string;
  replyTo?: string;
}

export async function sendEmail(params: SendEmailParams): Promise<{ id: string }> {
  const client = getResendClient();
  const from = params.from ?? process.env.EMAIL_FROM ?? 'Kitora <hello@mail.kitora.co>';
  const replyTo = params.replyTo ?? process.env.EMAIL_REPLY_TO;

  const result = await client.emails.send({
    from,
    to: params.to,
    subject: params.subject,
    react: params.react,
    ...(replyTo ? { replyTo } : {}),
  });

  if (result.error) {
    throw new Error(`Resend send failed: ${result.error.message}`);
  }
  if (!result.data) {
    throw new Error('Resend returned no data and no error.');
  }
  return { id: result.data.id };
}
