# UPayments Web SDK - Next.js Example (UAPI)

This example demonstrates how to integrate the **UPayments Web SDK** and **React Components** into a modern **Next.js (App Router)** application.

---

## Features

- **Next.js App Router**: Client-side payment integration with `ssr: false` dynamic loading for Apple Pay and Web SDK.
- **Unified UAPI integration**: Accepts online payments using merchant UAPI credentials.
- **Apple Pay & Apple Pay KNET**: Automatic detection and rendering of supported payment options.
- **Local HTTPS Ready**: Pre-configured with Next.js experimental HTTPS support (`next dev --experimental-https`) for testing Apple Pay locally.

---

## Quick Start

### 1. Install Dependencies

From the root workspace directory or within `examples/nextjs`:
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

Because Apple Pay and DOM Custom Elements require browser APIs (`window`, `ApplePaySession`), import the checkout component dynamically with `ssr: false`:

```tsx
// app/page.tsx
import dynamic from 'next/dynamic';

const CheckoutClient = dynamic(
  () => import('../components/CheckoutClient').then((mod) => mod.CheckoutClient),
  { ssr: false }
);

export default function HomePage() {
  return (
    <main>
      <CheckoutClient />
    </main>
  );
}
```

### 2. Initializing UPayments & Initiating Payment (`components/CheckoutClient.tsx`)

```tsx
'use client';

import React, { useEffect, useState } from 'react';
import { UPayments, type PaymentMethodId, type PayOptions } from '@upayments-kw/web-sdk';
import { PaymentMethods } from '@upayments-kw/react';

export const CheckoutClient: React.FC = () => {
  const [sdk, setSdk] = useState<UPayments<'uapi'> | null>(null);
  const [availableMethods, setAvailableMethods] = useState<PaymentMethodId[]>([]);

  useEffect(() => {
    async function init() {
      // 1. Initialize SDK
      const instance = UPayments.create({
        from: 'uapi',
        environment: 'sandbox', // 'sandbox' or 'production'
        auth: {
          type: 'bearer',
          token: 'YOUR_MERCHANT_BEARER_TOKEN',
        },
      });

      // 2. Await initialization handshake
      await instance.initialize();

      setSdk(instance);
      setAvailableMethods(instance.getAvailablePaymentMethods());
    }

    init();
  }, []);

  const handlePayment = async (method: PaymentMethodId) => {
    if (!sdk) return;

    const payload: PayOptions<'uapi'>['payload'] = {
      amount: 25.0,
      products: [
        {
          name: 'Demo Product',
          description: 'Example product item',
          price: 25.0,
          quantity: 1,
        },
      ],
      order: {
        id: `ORD_${Date.now()}`,
        reference: `REF_${Date.now()}`,
        description: 'Payment for Order #10024',
        currency: 'KWD',
        amount: 25.0,
      },
      language: 'en',
      customer: {
        uniqueId: 'cust_987',
        name: 'Ahmed Al-Sabah',
        mobile: '+96560000000',
        email: 'ahmed@example.com',
      },
      returnUrl: `${window.location.origin}/return`,
      cancelUrl: `${window.location.origin}/cancel`,
      notificationUrl: 'https://api.yourstore.com/webhooks/upayments',
      domainName: window.location.hostname,
      isSaveCard: false,
    };

    const result = await sdk.pay({
      paymentMethod: method,
      payload,
    });

    console.log('Payment result:', result);
  };

  return (
    <div>
      <h2>Complete Purchase</h2>
      {sdk ? (
        <PaymentMethods
          availableMethods={availableMethods}
          onMethodSelected={(method) => handlePayment(method)}
        />
      ) : (
        <p>Loading payment methods...</p>
      )}
    </div>
  );
};
```
