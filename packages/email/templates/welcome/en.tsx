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

export interface WelcomeEmailProps {
  name: string;
  appUrl: string;
}

/**
 * 用 react-email dev 本地预览时的默认 props。
 * 注册到 default export 上，让预览服务器能无参数渲染。
 */
const previewProps: WelcomeEmailProps = {
  name: 'Friend',
  appUrl: 'https://app.kitora.co',
};

export default function WelcomeEmail({
  name = previewProps.name,
  appUrl = previewProps.appUrl,
}: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to Kitora — your workspace is ready.</Preview>
      <Body
        style={{ backgroundColor: '#ffffff', fontFamily: 'system-ui, -apple-system, sans-serif' }}
      >
        <Container style={{ maxWidth: 560, margin: '0 auto', padding: '40px 24px' }}>
          <Heading style={{ fontSize: 24, fontWeight: 600 }}>Welcome, {name}.</Heading>
          <Text style={{ fontSize: 16, lineHeight: 1.6, color: '#3f3f46' }}>
            Thanks for signing up for Kitora. Your workspace is ready, and you can jump straight in.
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
              Open Kitora
            </Button>
          </Section>
          <Text style={{ fontSize: 14, color: '#71717a' }}>
            If you didn&apos;t create this account, you can safely ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

WelcomeEmail.PreviewProps = previewProps;
