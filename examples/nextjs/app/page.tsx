'use client';

import dynamic from 'next/dynamic';

// Next.js dynamic import with ssr: false for client-side DOM/Web SDK checkout
const CheckoutClient = dynamic(
  () => import('../components/CheckoutClient').then((mod) => mod.CheckoutClient),
  {
    ssr: false,
    loading: () => (
      <div style={{ maxWidth: 840, margin: '4rem auto', textAlign: 'center', color: '#64748b' }}>
        <p>Loading UPayments Checkout...</p>
      </div>
    ),
  },
);

export default function HomePage() {
  return (
    <main>
      <CheckoutClient />
    </main>
  );
}
