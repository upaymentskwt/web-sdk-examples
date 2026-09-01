# UPayments Web SDK - Next.js Example

This example demonstrates how to integrate the **UPayments Web SDK** into a modern **Next.js (App Router)** application using `@upayments-kw/react`.

---

## Features

- **Next.js App Router**: Client-side payment integration with `ssr: false` dynamic loading for Apple Pay.
- **Single Dependency**: Only `@upayments-kw/react` is required.
- **Automated Bearer Auth**: Simply pass `token: '...'` during initialization.
- **Apple Pay & Apple Pay KNET**: Automatic detection and rendering of supported payment options.
- **Local HTTPS Ready**: Pre-configured with Next.js experimental HTTPS support (`next dev --experimental-https`) for testing Apple Pay locally.

---

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Run Development Server

```bash
pnpm dev
# or from repo root:
pnpm dev:next
```

The Next.js app will start at `https://localhost:3000`.

> **Note**: Always test Apple Pay in **Safari on iOS or macOS** over HTTPS.

---

## Code Overview

### 1. Dynamic Client Component Import (`app/page.tsx`)

Because Apple Pay and DOM elements require browser APIs (`window`, `ApplePaySession`), import the checkout component dynamically with `ssr: false`:

```tsx
// app/page.tsx
'use client';

import dynamic from 'next/dynamic';

const CheckoutClient = dynamic(
  () => import('../components/CheckoutClient').then((mod) => mod.CheckoutClient),
  {
    ssr: false,
    loading: () => <p>Loading checkout...</p>,
  }
);

export default function HomePage() {
  return (
    <main>
      <CheckoutClient />
    </main>
  );
}
```

### 2. Client Checkout Component (`components/CheckoutClient.tsx`)

```tsx
'use client';

import React, { useEffect, useState } from 'react';
import {
  UPayments,
  PaymentMethods,
  type PaymentMethodId,
  type PayOptions,
} from '@upayments-kw/react';

export const CheckoutClient = () => {
  const [sdk, setSdk] = useState<UPayments | null>(null);
  const [availableMethods, setAvailableMethods] = useState<PaymentMethodId[]>([]);

  useEffect(() => {
    async function init() {
      const instance = UPayments.create({
        environment: 'sandbox', // or 'production'
        token: 'YOUR_MERCHANT_BEARER_TOKEN',
      });

      await instance.initialize();
      setSdk(instance);
      setAvailableMethods(instance.getAvailablePaymentMethods());
    }

    init();
  }, []);

  const handlePay = async (method: PaymentMethodId) => {
    if (!sdk) return;

    try {
      const payload: PayOptions['payload'] = {
        amount: 25.0,
        products: [
          { name: 'Subscription Plan', price: 25.0, quantity: 1 },
        ],
        order: {
          id: `ORD_${Date.now()}`,
          description: 'Payment for Order #10024',
          currency: 'KWD',
          amount: 25.0,
        },
        customer: {
          name: 'Ahmed Al-Sabah',
          mobile: '+96560000000',
          email: 'ahmed@example.com',
        },
        returnUrl: `${window.location.origin}/orders/success`,
        cancelUrl: `${window.location.origin}/orders/cancel`,
      };

      const result = await sdk.pay({ paymentMethod: method, payload });
      console.log('Payment Success:', result);
    } catch (error) {
      console.error('Payment Failed:', error);
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: '2rem auto' }}>
      <h2>Next.js Checkout</h2>
      {sdk ? (
        <PaymentMethods
          availableMethods={availableMethods}
          onMethodSelected={handlePay}
        />
      ) : (
        <p>Loading payment methods...</p>
      )}
    </div>
  );
};
```

---

## Support & Documentation
- **Developer Documentation**: [https://developers.upayments.com](https://developers.upayments.com)
- **Technical Support**: [support@upayments.com](mailto:support@upayments.com)
