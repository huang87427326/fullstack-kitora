/**
 * Resend 客户端单例。
 *
 * 运行时才读取 RESEND_API_KEY——这样在没有密钥的构建环境（CI / Vercel
 * Preview 未接入 Resend）也不会在加载模块时就抛错。
 */
import { Resend } from 'resend';

let client: Resend | null = null;

export function getResendClient(): Resend {
  if (!client) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error(
        'RESEND_API_KEY is not set. Configure it in .env.local or Vercel env before sending email.',
      );
    }
    client = new Resend(apiKey);
  }
  return client;
}
