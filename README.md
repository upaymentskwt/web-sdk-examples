# UPayments Web SDK - Merchant Integration Examples (UAPI)

Welcome to the official **UPayments Web SDK** merchant examples repository. This repository contains ready-to-run example applications and a comprehensive integration guide for accepting online payments using the **UPayments UAPI** platform.

---

## Supported Payment Methods
The Web SDK natively integrates:
- 🍎 **Apple Pay** (`apple_pay`): One-touch checkout for Apple devices (Safari on iOS & macOS).
- 💳 **Apple Pay KNET** (`apple_pay_knet`): Apple Pay tailored specifically for Kuwait National Electronic Transfer (KNET) debit card processing.

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Apple Pay Domain Verification](#apple-pay-domain-verification)
3. [Example Applications](#example-applications)
4. [Integration Guide](#integration-guide)
   - [A. React Integration](#a-react-integration)
   - [B. Vanilla JavaScript & HTML (CDN)](#b-vanilla-javascript--html-cdn)
5. [UAPI Payment Payload Reference](#uapi-payment-payload-reference)
6. [SDK Events & Lifecycle](#sdk-events--lifecycle)
7. [Local Testing with HTTPS](#local-testing-with-https)
8. [Troubleshooting & FAQ](#troubleshooting--faq)

---

## Prerequisites

Before integrating, ensure you have:
1. **UPayments Merchant Account**:
   - Access to the [UPayments Merchant Dashboard](https://merchant.upayments.com).
2. **API Credentials**:
   - **Bearer API Token** for the **UAPI** service.
   - Separate tokens are issued for **Sandbox (Testing)** and **Production (Live)** environments.
3. **Registered Domain for Apple Pay**:
   - Apple requires all domains processing Apple Pay transactions to be verified by Apple and hosted over HTTPS.

---

## Apple Pay Domain Verification

To enable Apple Pay on your domain:
1. Contact UPayments support or configure your merchant dashboard to register your web domain (e.g. `yourstore.com`).
2. Download the Apple domain association file provided by UPayments.
3. Host the file on your public web server at:
   ```
   https://yourstore.com/.well-known/apple-developer-merchantid-domain-association
   ```
4. Verify that the URL returns the raw association file over valid HTTPS.

---

## Example Applications

This repository contains two example implementations:

| Directory | Framework | Description |
|---|---|---|
| [`examples/react-vite`](./examples/react-vite) | **React + Vite** | Complete React integration using `@upayments-kw/react` and `@upayments-kw/web-sdk`. |
| [`examples/vanilla-cdn`](./examples/vanilla-cdn) | **HTML + Vanilla JS** | Zero-build integration using the CDN script tag and Web Components. |

### Running Examples Locally

Clone this repository:
```bash
git clone https://github.com/upaymentskwt/web-sdk-examples.git
cd web-sdk-examples
```

Install dependencies and run:
```bash
pnpm install

# Run the React example
pnpm dev:react

# Run the Vanilla HTML/CDN example
pnpm dev:vanilla
```

Both examples will start with local **HTTPS** enabled (required for Apple Pay sheet rendering).

---

## Integration Guide

### A. React Integration

#### 1. Install packages
```bash
npm install @upayments-kw/web-sdk @upayments-kw/react
# or
pnpm add @upayments-kw/web-sdk @upayments-kw/react
```

#### 2. Initialize SDK & Render Payment Element
```tsx
import React, { useEffect, useState } from 'react';
import { UPayments, type PaymentMethodId, type PayOptions } from '@upayments-kw/web-sdk';
import { PaymentMethods, ApplePayButton } from '@upayments-kw/react';

export const CheckoutPage = () => {
  const [sdk, setSdk] = useState<UPayments<'uapi'> | null>(null);

  useEffect(() => {
    // 1. Initialize SDK in UAPI mode
    const instance = UPayments.create({
      from: 'uapi',
      environment: 'sandbox', // 'sandbox' or 'production'
      auth: {
        type: 'bearer',
        token: 'YOUR_MERCHANT_BEARER_TOKEN',
      },
      debug: false,
    });

    setSdk(instance);
  }, []);

  const handlePay = async (method: PaymentMethodId) => {
    if (!sdk) return;

    try {
      // 2. Prepare order payload
      const payload: PayOptions<'uapi'>['payload'] = {
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
        returnUrl: 'https://yourstore.com/orders/success',
        cancelUrl: 'https://yourstore.com/orders/cancel',
        notificationUrl: 'https://api.yourstore.com/webhooks/upayments',
      };

      // 3. Initiate payment
      const result = await sdk.pay({
        paymentMethod: method,
        payload,
      });

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
          onMethodSelected={(e) => handlePay(e.detail.paymentMethod)}
        />
      ) : (
        <p>Loading payment methods...</p>
      )}
    </div>
  );
};
```

---

### B. Vanilla JavaScript & HTML (CDN)

#### 1. Include Script in your HTML
```html
<script src="https://cdn.jsdelivr.net/npm/@upayments-kw/web-sdk/dist/upayments.js"></script>
```

#### 2. Add UI Container and JavaScript
```html
<!-- Payment Container Web Component -->
<upayments-payment-methods id="payment-methods-element"></upayments-payment-methods>

<script>
  // 1. Initialize SDK
  const sdk = window.UPayments.create({
    from: 'uapi',
    environment: 'sandbox', // 'sandbox' or 'production'
    auth: {
      type: 'bearer',
      token: 'YOUR_MERCHANT_BEARER_TOKEN'
    }
  });

  // 2. Connect SDK instance to web component
  const element = document.getElementById('payment-methods-element');
  element.sdk = sdk;

  // 3. Listen for method click and trigger payment
  element.addEventListener('upay:payment-method-selected', async (event) => {
    const selectedMethod = event.detail.paymentMethod;

    try {
      const response = await sdk.pay({
        paymentMethod: selectedMethod,
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
          returnUrl: 'https://yourstore.com/checkout/complete',
          cancelUrl: 'https://yourstore.com/checkout/cancel'
        }
      });

      console.log('Payment successful:', response);
    } catch (err) {
      console.error('Payment error:', err);
    }
  });
</script>
```

---

## UAPI Payment Payload Reference

When calling `sdk.pay({ paymentMethod, payload })`, provide the following parameters:

| Field | Type | Required | Description |
|---|---|---|---|
| `amount` | `number` | **Yes** | Total order amount in KWD (e.g. `25.000`). |
| `order` | `object` | **Yes** | Contains `id`, `currency` (`"KWD"`), `amount`, and optional `description`. |
| `products` | `array` | **Yes** | Array of product items (`name`, `price`, `quantity`, `description`). |
| `customer` | `object` | **Yes** | Customer information (`name`, `email`, `mobile`, `uniqueId`). |
| `returnUrl` | `string` | **Yes** | URL where the customer will be redirected upon payment completion. |
| `cancelUrl` | `string` | **Yes** | URL where the customer will be redirected if payment is cancelled. |
| `notificationUrl` | `string` | No | Server-to-server webhook endpoint for async payment status updates. |
| `language` | `string` | No | Language code (`'en'` or `'ar'`). Defaults to `'en'`. |
| `domainName` | `string` | No | Web domain initiating the transaction (defaults to `window.location.hostname`). |

---

## SDK Events & Lifecycle

You can listen to lifecycle events emitted by the SDK:

```typescript
// Fired when payment adapters are verified and ready
sdk.on('upay:ready', (data) => {
  console.log('Available payment methods:', data.availablePaymentMethods);
});

// Fired if a fatal initialization or runtime error occurs
sdk.on('upay:error', (error) => {
  console.error('UPayments SDK Error:', error);
});
```

---

## Local Testing with HTTPS

Apple Pay requires an active **HTTPS** context and a supported Apple device (Safari on macOS with Apple Pay enabled, or Safari on iOS).

Both example applications in this repository include `@vitejs/plugin-basic-ssl` to automatically start a local HTTPS development server:
```bash
pnpm dev:react
# Starts at https://localhost:5173
```

When accessing `https://localhost:5173`, accept the self-signed developer certificate in Safari to test Apple Pay sheets locally.

---

## Troubleshooting & FAQ

#### Why is the Apple Pay button not showing up?
1. Ensure you are running on **HTTPS**.
2. Open the page in **Safari** on macOS or iOS.
3. Verify that your device has an active card configured in Apple Wallet.
4. Ensure your domain is registered in the UPayments Merchant Dashboard.

#### What is the difference between `apple_pay` and `apple_pay_knet`?
- `apple_pay`: Standard international credit/debit card processing via Apple Pay.
- `apple_pay_knet`: Specific routing for Kuwait KNET debit cards via Apple Pay.

#### How do I switch to live production?
Change the `environment` parameter in `UPayments.create` from `'sandbox'` to `'production'`, and provide your live Bearer API token.

---

## Support & Documentation
For technical inquiries or merchant integration support, contact [support@upayments.com](mailto:support@upayments.com) or visit [upayments.com](https://upayments.com).