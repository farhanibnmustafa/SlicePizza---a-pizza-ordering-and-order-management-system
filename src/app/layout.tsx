import type { Metadata } from 'next';
import './globals.css';
import { MainLayout } from '@/components/layout/MainLayout';

export const metadata: Metadata = {
  title: 'SlicePizza - Premium Ordering & Management System',
  description: 'Order your favorite artisan pizzas with the best-in-class SlicePizza experience.',
  icons: {
    icon: '/icon.svg',
  },
};

import NextAuthProvider from '@/components/providers/NextAuthProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <NextAuthProvider>
          <MainLayout>{children}</MainLayout>
        </NextAuthProvider>
      </body>
    </html>
  );
}
