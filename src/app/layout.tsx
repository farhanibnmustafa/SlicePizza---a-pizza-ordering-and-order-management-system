import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import { MainLayout } from '@/components/layout/MainLayout';

const outfit = Outfit({ 
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SlicePizza - Premium Ordering & Management System',
  description: 'Order your favorite artisan pizzas with the best-in-class SlicePizza experience.',
};

import NextAuthProvider from '@/components/providers/NextAuthProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={outfit.className} suppressHydrationWarning>
        <NextAuthProvider>
          <MainLayout>{children}</MainLayout>
        </NextAuthProvider>
      </body>
    </html>
  );
}
