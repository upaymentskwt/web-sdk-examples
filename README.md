# UPayments Web SDK - Merchant Integration Examples

Welcome to the official **UPayments Web SDK** merchant examples repository. This repository contains ready-to-run example applications and an end-to-end integration guide for accepting online payments using the UPayments platform.

---

## Supported Payment Methods

- **Apple Pay** (`apple_pay`): One-touch checkout for Apple devices (Safari on iOS & macOS).
- **Apple Pay KNET** (`apple_pay_knet`): Apple Pay tailored specifically for Kuwait National Electronic Transfer (KNET) debit card processing.
- **Credit/Debit Cards & Direct KNET**: _Coming Soon_.

---

## Table of Contents

1. [Requirements &amp; Prerequisites](#requirements--prerequisites)
2. [UI Component Previews](#ui-component-previews)
3. [Example Applications](#example-applications)
4. [Integration Guide](#integration-guide)
   - [A. React Integration](#a-react-integration)
     - [1. Install Package](#1-install-package)
     - [2. Group Payments Usage (`<PaymentMethods />`)](#2-group-payments-usage-paymentmethods-)
     - [3. Standalone Payment Method Usage (`<ApplePayButton />`)](#3-standalone-payment-method-usage-applepaybutton-)
     - [Apple Pay Button Customization Guide (HIG Types, Sizing, Styles, RTL)](#apple-pay-button-customization-guide)
   - [B. Next.js (App Router) &amp; SSR](#b-nextjs-app-router--ssr)
   - [C. Vanilla JavaScript &amp; HTML (CDN)](#c-vanilla-javascript--html-cdn)
5. [Events &amp; Callbacks Reference](#events--callbacks-reference)
6. [Payment Payload Reference](#payment-payload-reference)
7. [Apple Pay Domain Verification](#apple-pay-domain-verification)
8. [Troubleshooting &amp; FAQ](#troubleshooting--faq)
9. [Support &amp; Documentation](#support--documentation)

---

## Requirements & Prerequisites

| Requirement              | Minimum Version / Specification | Details                                                                                                   |
| ------------------------ | ------------------------------- | --------------------------------------------------------------------------------------------------------- |
| **Node.js**              | `>= 18.0.0`                     | Required for building React & Next.js applications.                                                       |
| **React / React DOM**    | `>= 18.0.0`                     | Minimum version for`@upayments-kw/react`.                                                                 |
| **Browsers**             | Safari 13+ (macOS / iOS)        | Required for Apple Pay web sheets.                                                                        |
| **HTTPS Protocol**       | Valid SSL / TLS Certificate     | Required by Apple for Apple Pay transactions (except`localhost`).                                         |
| **Domain Association**   | Apple Merchant ID Association   | File must be hosted at`https://yourdomain.com/.well-known/apple-developer-merchantid-domain-association`. |
| **Merchant Credentials** | API Bearer Token                | Obtained from the[UPayments Merchant Dashboard](https://merchant.upayments.com).                          |

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

| Directory                                        | Framework                | Description                                               |
| ------------------------------------------------ | ------------------------ | --------------------------------------------------------- |
| [`examples/react-vite`](./examples/react-vite)   | **React + Vite**         | Complete React integration using`@upayments-kw/react`.    |
| [`examples/nextjs`](./examples/nextjs)           | **Next.js (App Router)** | Next.js 14 App Router integration with client components. |
| [`examples/vanilla-cdn`](./examples/vanilla-cdn) | **HTML + Vanilla JS**    | Zero-build integration using CDN script tag.              |

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
      <ApplePayButton sdk={sdk} type="buy" buttonStyle="black" onClick={handleApplePay} />
    </div>
  );
};
```

#### Apple Pay Button Customization Guide

The `<ApplePayButton />` component (and `<upay-apple-pay-button>` web component) is fully customisable according to **Apple's Human Interface Guidelines (HIG)** and the official Apple Pay JS specifications.

##### 1. Button Types (`type`)

Controls the action text displayed on the button. Supports all 16 official Apple Pay button types:

| Type                  | Action Text (English)   | Action Text (Arabic)    | Typical Use Case                        |
| --------------------- | ----------------------- | ----------------------- | --------------------------------------- |
| `'plain'` _(default)_ | _(Apple Pay logo only)_ | _(Apple Pay logo only)_ | Generic payment or compact UI           |
| `'buy'`               | Buy with Pay           | شراء بواسطة Pay        | E-commerce purchase                     |
| `'check-out'`         | Check out with Pay     | إتمام الدفع بواسطة Pay | Cart / multi-item checkout              |
| `'donate'`            | Donate with Pay        | تبرع بواسطة Pay        | Non-profit and charity donations        |
| `'book'`              | Book with Pay          | حجز بواسطة Pay         | Flights, hotels, tickets, reservations  |
| `'subscribe'`         | Subscribe with Pay     | اشتراك بواسطة Pay      | Recurring subscriptions                 |
| `'order'`             | Order with Pay         | طلب بواسطة Pay         | Food ordering, delivery, takeout        |
| `'reload'`            | Reload with Pay        | إعادة تعبئة بواسطة Pay | Wallet / prepaid card balance reload    |
| `'add-money'`         | Add Money with Pay     | إضافة أموال بواسطة Pay | Stored-value account balance            |
| `'top-up'`            | Top Up with Pay        | شحن رصيد بواسطة Pay    | Mobile credit or gaming cards           |
| `'rent'`              | Rent with Pay          | استئجار بواسطة Pay     | Vehicle, equipment, or property rental  |
| `'support'`           | Support with Pay       | دعم بواسطة Pay         | Creator / project patronage             |
| `'contribute'`        | Contribute with Pay    | مساهمة بواسطة Pay      | Crowdfunding or community contributions |
| `'tip'`               | Tip with Pay           | إكرامية بواسطة Pay     | Gratuity payments                       |
| `'continue'`          | Continue with Pay      | متابعة بواسطة Pay      | Multi-step checkout review              |
| `'set-up'`            | Set up Pay             | إعداد Pay              | Apple Wallet card setup prompt          |

> [!NOTE]
> For backward compatibility, `buttonStyle="buy"` is also accepted as an alias for `type="buy"`.

##### 2. Visual Styles / Colors (`buttonStyle` or `variant`)

| Style                 | Appearance                                            | Recommended Background                               |
| --------------------- | ----------------------------------------------------- | ---------------------------------------------------- |
| `'black'` _(default)_ | Black button with white lettering & Apple logo        | White or light backgrounds                           |
| `'white'`             | White button with black lettering & Apple logo        | Dark, colored, or high-contrast backgrounds          |
| `'white-outline'`     | White button with fine black border & black lettering | Light or white backgrounds needing border definition |

##### 3. Custom Sizing & Corner Radius

You can configure dimensions directly via props or CSS custom properties:

- **Height** (`height`): Apple specifies a minimum height of 30px (standard recommended: 44px–64px; default: 48px). Accepts numbers (e.g. `52` -> `'52px'`) or strings (e.g. `'54px'`).
- **Width** (`width`): Apple recommends a minimum width of 140px. Defaults to `'100%'`.
- **Border Radius** (`borderRadius`): Custom corner rounding (e.g. `8` for 8px, `50` or `9999` for a pill button).
- **Padding** (`padding`): Custom inner padding (e.g. `'0 16px'`).

```tsx
// Example: Pill-shaped "Buy with Apple Pay" button
<ApplePayButton
  sdk={sdk}
  type="buy"
  buttonStyle="black"
  height={54}
  borderRadius={9999}
  onClick={handleApplePay}
/>

// Example: White-outline "Check out with Apple Pay" button in Arabic
<ApplePayButton
  sdk={sdk}
  type="check-out"
  buttonStyle="white-outline"
  locale="ar"
  width={320}
  height={48}
  borderRadius={8}
  onClick={handleApplePay}
/>
```

##### 4. React Props Reference (`<ApplePayButton />`)

| Prop           | Type                                    | Default        | Description                                                |
| -------------- | --------------------------------------- | -------------- | ---------------------------------------------------------- |
| `sdk`          | `UPayments`                             | `null`         | UPayments SDK instance for payment execution               |
| `type`         | `ApplePayButtonType`                    | `'plain'`      | Apple Pay button action type                               |
| `buttonStyle`  | `'black' \| 'white' \| 'white-outline'` | `'black'`      | Button visual appearance                                   |
| `variant`      | `'black' \| 'white' \| 'white-outline'` | `'black'`      | Alias for`buttonStyle`                                     |
| `locale`       | `string`                                | `'en'`         | BCP 47 language tag (`'en'`, `'en-US'`, `'ar'`, `'ar-SA'`) |
| `width`        | `string \| number`                      | `'100%'`       | Button width (min recommended: 140px)                      |
| `height`       | `string \| number`                      | `'48px'`       | Button height (min: 30px, standard: 44px–64px)             |
| `borderRadius` | `string \| number`                      | `'8px'`        | Corner border radius                                       |
| `padding`      | `string \| number`                      | `'0px 0px'`    | Inner button padding                                       |
| `boxSizing`    | `'border-box' \| 'content-box'`         | `'border-box'` | CSS box-sizing                                             |
| `loading`      | `boolean`                               | `false`        | Displays spinner overlay and disables clicks               |
| `disabled`     | `boolean`                               | `false`        | Disables button and dims opacity                           |
| `ariaLabel`    | `string`                                | _(auto)_       | Custom accessible label for screen readers                 |
| `onClick`      | `(pay) => void`                         | `undefined`    | Click callback providing bound`pay` handler                |
| `style`        | `CSSProperties`                         | `undefined`    | Custom inline styles                                       |
| `className`    | `string`                                | `undefined`    | Custom CSS class names                                     |

##### 5. Web Component Usage (`<upay-apple-pay-button>`)

In Vanilla HTML or non-React applications:

```html
<!-- HTML markup with attributes -->
<upay-apple-pay-button
  id="apple-pay-btn"
  type="buy"
  buttonstyle="black"
  width="100%"
  height="52px"
  border-radius="12px"
  locale="ar"
></upay-apple-pay-button>

<!-- Or styling via official Apple Pay CSS Custom Properties -->
<style>
  #apple-pay-btn {
    --apple-pay-button-width: 320px;
    --apple-pay-button-height: 54px;
    --apple-pay-button-border-radius: 27px;
  }
</style>
```

##### 6. Shadow DOM CSS Parts (`::part()`)

Target internal elements directly from external stylesheets:

- `upay-apple-pay-button::part(button)`: The active button (Apple Pay or fallback).
- `upay-apple-pay-button::part(apple-pay-button)`: Native `<apple-pay-button>` element.
- `upay-apple-pay-button::part(fallback-button)`: High-fidelity fallback button.
- `upay-apple-pay-button::part(spinner)`: Loading spinner element.
- `upay-apple-pay-button::part(logo)`: Official vector SVG Apple Pay logo.
- `upay-apple-pay-button::part(text)`: Action text label span.

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
  },
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
      token: 'YOUR_MERCHANT_API_TOKEN',
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
            products: [{ name: 'Leather Bag', price: 50.0, quantity: 1 }],
            order: {
              id: 'ORD_' + Date.now(),
              currency: 'KWD',
              amount: 50.0,
            },
            customer: {
              name: 'Fatima Al-Kandari',
              email: 'fatima@example.com',
              mobile: '+96590000000',
            },
            returnUrl: window.location.origin + '/checkout/complete',
            cancelUrl: window.location.origin + '/checkout/cancel',
          },
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

| Event Name                    | Trigger Condition                                                                                | Payload Details                                                      |
| ----------------------------- | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| `upay:ready`                  | Fired when SDK has initialized, validated credentials, and identified available payment methods. | `{ availablePaymentMethods: PaymentMethodId[] }`                     |
| `upay:payment-methods-loaded` | Fired when payment capabilities are received from the backend.                                   | `{ availablePaymentMethods: PaymentMethodId[], merchantId: string }` |
| `upay:payment-started`        | Fired immediately when payment authorization begins.                                             | `{ paymentMethod: PaymentMethodId }`                                 |
| `upay:payment-method-opened`  | Fired when the payment sheet (e.g. Apple Pay native sheet) is presented to the user.             | `{ paymentMethod: PaymentMethodId }`                                 |
| `upay:payment-processing`     | Fired when the token is submitted to the gateway for capture.                                    | `{ paymentMethod: PaymentMethodId }`                                 |
| `upay:payment-success`        | Fired when payment is successfully captured and completed.                                       | `{ paymentMethod: PaymentMethodId, result: PaymentResult }`          |
| `upay:payment-failed`         | Fired when a payment attempt fails or is declined by the gateway/bank.                           | `{ paymentMethod: PaymentMethodId, error: SDKError }`                |
| `upay:payment-cancelled`      | Fired when customer cancels or closes the payment sheet without authorizing.                     | `{ paymentMethod: PaymentMethodId }`                                 |
| `upay:error`                  | Fired when an initialization or runtime error occurs.                                            | `SDKError`                                                           |

---

## Payment Payload Reference

| Field             | Type     | Required | Description                                                                    |
| ----------------- | -------- | -------- | ------------------------------------------------------------------------------ |
| `amount`          | `number` | **Yes**  | Total order amount in KWD (e.g.`25.000`).                                      |
| `order`           | `object` | **Yes**  | Contains`id`, `currency` (`"KWD"`), `amount`, and optional `description`.      |
| `products`        | `array`  | **Yes**  | Array of product items (`name`, `price`, `quantity`, `description`).           |
| `customer`        | `object` | **Yes**  | Customer information (`name`, `email`, `mobile`, `uniqueId`).                  |
| `returnUrl`       | `string` | **Yes**  | URL where customer is redirected after successful payment.                     |
| `cancelUrl`       | `string` | **Yes**  | URL where customer is redirected if payment is cancelled.                      |
| `notificationUrl` | `string` | No       | Server-to-server webhook endpoint for async payment status updates.            |
| `language`        | `string` | No       | Language code (`'en'` or `'ar'`). Defaults to `'en'`.                          |
| `domainName`      | `string` | No       | Web domain initiating the transaction (defaults to`window.location.hostname`). |

---

## Apple Pay Domain Verification

To enable Apple Pay on your domain:

1. Register your web domain (e.g. `yourstore.com`) in the [UPayments Merchant Dashboard](https://my.upayments.com).
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
- **Merchant Dashboard**: [https://my.upayments.com](https://my.upayments.com)
- **Technical Support**: [support@upayments.com](mailto:support@upayments.com)
- **Official Website**: [https://upayments.com](https://upayments.com)
