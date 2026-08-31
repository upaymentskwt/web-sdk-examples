# Vanilla HTML / CDN Example (UAPI)

This example demonstrates how to integrate the **UPayments Web SDK** in plain HTML and JavaScript using a CDN script tag.

## Features
- **Zero Build Tools Required**: Works with standard HTML and modern browser JavaScript.
- **UAPI Authentication**: Authenticates with merchant Bearer API Token.
- **Web Component**: Uses the custom element `<upayments-payment-methods>` for automatic rendering.
- **Payment Methods Supported**:
  - `apple_pay` (Apple Pay)
  - `apple_pay_knet` (Apple Pay KNET Debit)

---

## Getting Started

### 1. Install Dev Server Dependencies (Optional for local testing)
```bash
npm install
# or
pnpm install
```

### 2. Run Local Development Server
```bash
npm run dev
# or
pnpm dev
```

The app will start at `https://localhost:5174` (with HTTPS enabled via `@vitejs/plugin-basic-ssl`).

---

## Direct HTML Integration Snippet

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>UPayments Checkout</title>

  <!-- 1. Include UPayments Web SDK via CDN -->
  <script src="https://cdn.jsdelivr.net/npm/@upayments-kw/web-sdk/dist/upayments.js"></script>
</head>
<body>

  <h2>Checkout</h2>

  <!-- 2. Declare payment methods element -->
  <upayments-payment-methods id="payment-methods-el"></upayments-payment-methods>

  <script>
    // 3. Initialize SDK
    const sdk = window.UPayments.create({
      from: 'uapi',
      environment: 'sandbox', // or 'production'
      auth: {
        type: 'bearer',
        token: 'YOUR_MERCHANT_BEARER_TOKEN'
      }
    });

    // 4. Attach SDK to UI element
    const el = document.getElementById('payment-methods-el');
    el.sdk = sdk;

    // 5. Handle payment method selection
    el.addEventListener('upay:payment-method-selected', async (e) => {
      const selectedMethod = e.detail.paymentMethod;

      try {
        const result = await sdk.pay({
          paymentMethod: selectedMethod,
          payload: {
            amount: 15.0,
            products: [{ name: 'Test Product', price: 15.0, quantity: 1 }],
            order: {
              id: 'ORD_' + Date.now(),
              currency: 'KWD',
              amount: 15.0
            },
            customer: {
              name: 'John Doe',
              email: 'john@example.com',
              mobile: '+96560000000'
            },
            returnUrl: 'https://yourdomain.com/success',
            cancelUrl: 'https://yourdomain.com/cancel'
          }
        });

        console.log('Payment result:', result);
      } catch (err) {
        console.error('Payment error:', err);
      }
    });
  </script>
</body>
</html>
```
