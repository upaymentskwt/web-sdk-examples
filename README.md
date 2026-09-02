# UPayments Web SDK - Merchant Integration Examples

Welcome to the official **UPayments Web SDK** merchant examples repository. This repository contains ready-to-run example applications and an end-to-end integration guide for accepting online payments using the UPayments platform.

---

## Supported Payment Methods

- **Apple Pay** (`apple_pay`): One-touch checkout for Apple devices (Safari on iOS & macOS).
- **Apple Pay KNET** (`apple_pay_knet`): Apple Pay tailored specifically for Kuwait National Electronic Transfer (KNET) debit card processing.
- **Credit/Debit Cards & Direct KNET**: *Coming Soon in next release*.

---

## Table of Contents
1. [Requirements & Prerequisites](#requirements--prerequisites)
2. [UI Component Previews](#ui-component-previews)
3. [Example Applications](#example-applications)
4. [Integration Guide](#integration-guide)
   - [A. React Integration](#a-react-integration)
   - [B. Next.js (App Router) & SSR](#b-nextjs-app-router--ssr)
   - [C. Vanilla JavaScript & HTML (CDN)](#c-vanilla-javascript--html-cdn)
5. [Events & Callbacks Reference](#events--callbacks-reference)
6. [Payment Payload Reference](#payment-payload-reference)
7. [Apple Pay Domain Verification](#apple-pay-domain-verification)
8. [Troubleshooting & FAQ](#troubleshooting--faq)
9. [Support & Documentation](#support--documentation)

---

## Requirements & Prerequisites

| Requirement | Minimum Version / Specification | Details |
|---|---|---|
| **Node.js** | `>= 18.0.0` | Required for building React & Next.js applications. |
| **React / React DOM** | `>= 18.0.0` | Minimum version for `@upayments-kw/react`. |
| **Browsers** | Safari 13+ (macOS / iOS) | Required for Apple Pay web sheets. |
| **HTTPS Protocol** | Valid SSL / TLS Certificate | Required by Apple for Apple Pay transactions (except `localhost`). |
| **Domain Association** | Apple Merchant ID Association | File must be hosted at `https://yourdomain.com/.well-known/apple-developer-merchantid-domain-association`. |
| **Merchant Credentials** | API Bearer Token | Obtained from the [UPayments Merchant Dashboard](https://merchant.upayments.com). |

---

## UI Component Previews

### 1. Group Payment Container (`<PaymentMethods />`)
Displays all payment methods currently enabled and verified for the merchant and customer device.

```
┌───────────────────────────────────────────────────────────┐
│  Payment Methods                                          │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                     Pay                        │  │  <-- Apple Pay
│  └─────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                 Pay  |  KNET                   │  │  <-- Apple Pay KNET
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  [ Credit / Debit Card (Coming Soon) ]                    │
└───────────────────────────────────────────────────────────┘
```

### 2. Standalone Apple Pay Button (`<ApplePayButton />`)
Direct branded button for express single-click checkout.

```
┌───────────────────────────────────────────────┐
│                      Pay                 │  (Default / Black)
└───────────────────────────────────────────────┘

┌───────────────────────────────────────────────┐
│                      Pay                 │  (White with line)
└───────────────────────────────────────────────┘
```

---

## Example Applications

This repository contains ready-to-run example implementations:

| Directory | Framework | Description |
|---|---|---|
| [`examples/react-vite`](./examples/react-vite) | **React + Vite** | Complete React integration using `@upayments-kw/react`. |
| [`examples/nextjs`](./examples/nextjs) | **Next.js (App Router)** | Next.js 14 App Router integration with client components. |
| [`examples/vanilla-cdn`](./examples/vanilla-cdn) | **HTML + Vanilla JS** | Zero-build integration using CDN script tag. |

### Running Examples Locally

Clone this repository:
```bash
git clone https://github.com/upaymentskwt/web-sdk-examples.git
cd web-sdk-examples
```

Install dependencies and run:
```bash
pnpm install

# Run the React + Vite example
pnpm dev:react

# Run the Next.js App Router example
pnpm dev:next

# Run the Vanilla HTML/CDN example
pnpm dev:vanilla
```

All examples start with local **HTTPS** enabled (required for Apple Pay sheet rendering).

---

## Integration Guide

### A. React Integration

React users only need to install `@upayments-kw/react`. **Do not install `@upayments-kw/web-sdk` separately**, as `@upayments-kw/react` already includes and re-exports everything required.

#### 1. Install Package
```bash
npm install @upayments-kw/react
# or
pnpm add @upayments-kw/react
```

#### 2. Group Payments Usage (`<PaymentMethods />`)

```tsx
import React, { useEffect, useState } from 'react';
import {
  UPayments,
  PaymentMethods,
  type PaymentMethodId,
  type PayOptions,
} from '@upayments-kw/react';

export const CheckoutPage = () => {
  const [sdk, setSdk] = useState<UPayments | null>(null);
  const [availableMethods, setAvailableMethods] = useState<PaymentMethodId[]>([]);

  useEffect(() => {
    async function init() {
      // 1. Initialize SDK (Bearer token is handled automatically)
      const instance = UPayments.create({
        environment: 'sandbox', // 'sandbox' or 'production'
        token: 'YOUR_MERCHANT_API_TOKEN',
      });

      await instance.initialize();
      setSdk(instance);
      setAvailableMethods(instance.getAvailablePaymentMethods());
    }

    init();
  }, []);

  const handlePay = async (method: PaymentMethodId, pay?: BoundPayHandler<'uapi'>) => {
    if (!sdk || !pay) return;

    try {
      const payload: PayOptions['payload'] = {
        amount: 25.0,
        products: [
          {
            name: 'Classic White Sneakers',
            description: 'Size 42 - White',
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
        returnUrl: `${window.location.origin}/orders/success`,
        cancelUrl: `${window.location.origin}/orders/cancel`,
        notificationUrl: 'https://api.yourstore.com/webhooks/upayments',
      };

      // Execute payment directly inside the user click gesture
      const result = await pay({ payload });

      console.log('Payment Success:', result);
      window.location.href = '/orders/success';
    } catch (error) {
      console.error('Payment Failed:', error);
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: '2rem auto' }}>
      <h2>Complete Checkout</h2>
      {sdk ? (
        <PaymentMethods
          sdk={sdk}
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

#### 3. Standalone Payment Method Usage (`<ApplePayButton />`)

```tsx
import React, { useEffect, useState } from 'react';
import {
  UPayments,
  ApplePayButton,
  type BoundPayHandler,
  type PayOptions,
} from '@upayments-kw/react';

export const StandalonePayment = () => {
  const [sdk, setSdk] = useState<UPayments | null>(null);

  useEffect(() => {
    async function init() {
      const instance = UPayments.create({
        environment: 'sandbox',
        token: 'YOUR_MERCHANT_API_TOKEN',
      });
      await instance.initialize();
      setSdk(instance);
    }
    init();
  }, []);

  const handleApplePay = async (pay: BoundPayHandler<'uapi'>) => {
    const payload: PayOptions['payload'] = {
      amount: 15.0,
      products: [{ name: 'Espresso Beans', price: 15.0, quantity: 1 }],
      order: {
        id: `ORD_${Date.now()}`,
        currency: 'KWD',
        amount: 15.0,
      },
      customer: {
        name: 'Sara Ahmad',
        mobile: '+96590000000',
        email: 'sara@example.com',
      },
      returnUrl: `${window.location.origin}/orders/success`,
      cancelUrl: `${window.location.origin}/orders/cancel`,
    };

    await pay({ payload });
  };

  return (
    <div>
      <h3>Express Apple Pay</h3>
      <ApplePayButton
        sdk={sdk}
        buttonStyle="buy"
        variant="black"
        onClick={handleApplePay}
      />
    </div>
  );
};
```

---

### B. Next.js (App Router) & SSR

#### SSR Compatibility
The SDK is designed to be SSR-safe: importing `@upayments-kw/react` will not break Node.js server pre-rendering. However, payment sheets (such as `window.ApplePaySession`) and interactive payment buttons require a client-side browser runtime.

In Next.js App Router, render your checkout inside a client component dynamically imported with `{ ssr: false }`:

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

In `next.config.mjs`:
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@upayments-kw/react'],
};

export default nextConfig;
```

---

### C. Vanilla JavaScript & HTML (CDN)

#### 1. Include Script in your HTML
```html
<script src="https://cdn.jsdelivr.net/npm/@upayments-kw/web-sdk/dist/upayments.js"></script>
```

#### 2. Container & Initialization
```html
<!-- Payment Container Web Component -->
<upay-payment-methods id="payment-methods-element"></upay-payment-methods>

<script>
  async function startCheckout() {
    // 1. Initialize SDK — token is automatically handled as Bearer
    const sdk = window.UPayments.create({
      environment: 'sandbox',
      token: 'YOUR_MERCHANT_API_TOKEN'
    });

    await sdk.initialize();

    // 2. Connect SDK instance to web component
    const element = document.getElementById('payment-methods-element');
    element.sdk = sdk;

    // 3. Listen for method click and trigger payment via the user-gesture pay handler
    element.addEventListener('upay:method-selected', async (event) => {
      const { paymentMethod, pay } = event.detail;

      try {
        const response = await pay({
          payload: {
            amount: 50.0,
            products: [
              { name: 'Leather Bag', price: 50.0, quantity: 1 }
            ],
            order: {
              id: 'ORD_' + Date.now(),
              currency: 'KWD',
              amount: 50.0
            },
            customer: {
              name: 'Fatima Al-Kandari',
              email: 'fatima@example.com',
              mobile: '+96590000000'
            },
            returnUrl: window.location.origin + '/checkout/complete',
            cancelUrl: window.location.origin + '/checkout/cancel'
          }
        });

        console.log('Payment successful:', response);
      } catch (err) {
        console.error('Payment error:', err);
      }
    });
  }

  startCheckout();
</script>
```

---

## Events & Callbacks Reference

| Event Name | Trigger Condition | Payload Details |
|---|---|---|
| `upay:ready` | Fired when SDK has initialized, validated credentials, and identified available payment methods. | `{ availablePaymentMethods: PaymentMethodId[] }` |
| `upay:payment-methods-loaded` | Fired when payment capabilities are received from the backend. | `{ availablePaymentMethods: PaymentMethodId[], merchantId: string }` |
| `upay:payment-started` | Fired immediately when payment authorization begins. | `{ paymentMethod: PaymentMethodId }` |
| `upay:payment-method-opened` | Fired when the payment sheet (e.g. Apple Pay native sheet) is presented to the user. | `{ paymentMethod: PaymentMethodId }` |
| `upay:payment-processing` | Fired when the token is submitted to the gateway for capture. | `{ paymentMethod: PaymentMethodId }` |
| `upay:payment-success` | Fired when payment is successfully captured and completed. | `{ paymentMethod: PaymentMethodId, result: PaymentResult }` |
| `upay:payment-failed` | Fired when a payment attempt fails or is declined by the gateway/bank. | `{ paymentMethod: PaymentMethodId, error: SDKError }` |
| `upay:payment-cancelled` | Fired when customer cancels or closes the payment sheet without authorizing. | `{ paymentMethod: PaymentMethodId }` |
| `upay:error` | Fired when an initialization or runtime error occurs. | `SDKError` |

---

## Payment Payload Reference

| Field | Type | Required | Description |
|---|---|---|---|
| `amount` | `number` | **Yes** | Total order amount in KWD (e.g. `25.000`). |
| `order` | `object` | **Yes** | Contains `id`, `currency` (`"KWD"`), `amount`, and optional `description`. |
| `products` | `array` | **Yes** | Array of product items (`name`, `price`, `quantity`, `description`). |
| `customer` | `object` | **Yes** | Customer information (`name`, `email`, `mobile`, `uniqueId`). |
| `returnUrl` | `string` | **Yes** | URL where customer is redirected after successful payment. |
| `cancelUrl` | `string` | **Yes** | URL where customer is redirected if payment is cancelled. |
| `notificationUrl` | `string` | No | Server-to-server webhook endpoint for async payment status updates. |
| `language` | `string` | No | Language code (`'en'` or `'ar'`). Defaults to `'en'`. |
| `domainName` | `string` | No | Web domain initiating the transaction (defaults to `window.location.hostname`). |

---

## Apple Pay Domain Verification

To enable Apple Pay on your domain:
1. Register your web domain (e.g. `yourstore.com`) in the [UPayments Merchant Dashboard](https://merchant.upayments.com).
2. Download the Apple domain association file provided by UPayments.
3. Host the file on your public web server at:
   ```
   https://yourstore.com/.well-known/apple-developer-merchantid-domain-association
   ```
4. Verify that the URL returns the raw association file over valid HTTPS.

---

## Troubleshooting & FAQ

#### Why is the Apple Pay button not showing up?
1. Ensure your environment runs over **HTTPS**.
2. Open the page in **Safari** on macOS or iOS.
3. Verify that your device has an active card configured in Apple Wallet.
4. Ensure your domain is registered in the UPayments Merchant Dashboard.

#### What is the difference between `apple_pay` and `apple_pay_knet`?
- `apple_pay`: Standard international credit/debit card processing via Apple Pay.
- `apple_pay_knet`: Specific routing for Kuwait KNET debit cards via Apple Pay.

#### How do I switch to live production?
Change `environment` from `'sandbox'` to `'production'` in `UPayments.create()`, and provide your live Bearer API token.

---

## Support & Documentation

- **Developer Documentation**: [https://developers.upayments.com](https://developers.upayments.com)
- **Merchant Dashboard**: [https://merchant.upayments.com](https://merchant.upayments.com)
- **Technical Support**: [support@upayments.com](mailto:support@upayments.com)
- **Official Website**: [https://upayments.com](https://upayments.com)