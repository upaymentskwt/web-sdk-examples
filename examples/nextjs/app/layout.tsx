import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'UPayments Web SDK - Next.js Example (UAPI)',
  description: 'Next.js App Router merchant integration example for UPayments Web SDK',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
