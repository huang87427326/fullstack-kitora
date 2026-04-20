import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

import type { WelcomeEmailProps } from './en';

const previewProps: WelcomeEmailProps = {
  name: '朋友',
  appUrl: 'https://app.kitora.co',
};

export default function WelcomeEmail({
  name = previewProps.name,
  appUrl = previewProps.appUrl,
}: WelcomeEmailProps) {
  return (
    <Html lang="zh-CN">
      <Head />
      <Preview>欢迎使用 Kitora，你的工作区已就绪。</Preview>
      <Body
        style={{ backgroundColor: '#ffffff', fontFamily: 'system-ui, -apple-system, sans-serif' }}
      >
        <Container style={{ maxWidth: 560, margin: '0 auto', padding: '40px 24px' }}>
          <Heading style={{ fontSize: 24, fontWeight: 600 }}>{name}，欢迎。</Heading>
          <Text style={{ fontSize: 16, lineHeight: 1.6, color: '#3f3f46' }}>
            感谢注册 Kitora。你的工作区已经准备好，可以直接进入使用。
          </Text>
          <Section style={{ margin: '32px 0' }}>
            <Button
              href={appUrl}
              style={{
                backgroundColor: '#18181b',
                color: '#fafafa',
                padding: '12px 20px',
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              打开 Kitora
            </Button>
          </Section>
          <Text style={{ fontSize: 14, color: '#71717a' }}>
            如果不是你本人注册，忽略这封邮件即可。
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

WelcomeEmail.PreviewProps = previewProps;
