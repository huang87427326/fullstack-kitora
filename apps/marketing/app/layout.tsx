import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Kitora',
  description: 'Kitora SaaS — public website',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-screen flex flex-col bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
        {children}
      </body>
    </html>
  );
}
