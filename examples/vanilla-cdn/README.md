# Vanilla HTML / CDN Example

This example demonstrates how to integrate the **UPayments Web SDK** in plain HTML and JavaScript using a CDN script tag.

## Features
- **Zero Build Tools Required**: Works with standard HTML and modern browser JavaScript.
- **Automated Bearer Auth**: Simply pass `token: '...'`.
- **Web Component**: Uses the custom element `<upayments-payment-methods>` for automatic rendering.
- **Payment Methods Supported**:
  - `apple_pay` (Apple Pay)
  - `apple_pay_knet` (Apple Pay KNET Debit)
  - *Credit Card & KNET Direct: Coming Soon*

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
    async function init() {
      const sdk = window.UPayments.create({
        environment: 'sandbox', // or 'production'
        token: 'YOUR_MERCHANT_BEARER_TOKEN', // Automatically handled as Bearer
      });

      await sdk.initialize();

      // 4. Attach SDK to element
      const element = document.getElementById('payment-methods-el');
      element.sdk = sdk;

      // 5. Listen for payment selection
      element.addEventListener('upay:payment-method-selected', async (e) => {
        const method = e.detail.paymentMethod;

        try {
          const result = await sdk.pay({
            paymentMethod: method,
            payload: {
              amount: 25.0,
              products: [{ name: 'Product Name', price: 25.0, quantity: 1 }],
              order: { id: 'ORD_' + Date.now(), currency: 'KWD', amount: 25.0 },
              customer: { name: 'Customer Name', email: 'customer@example.com', mobile: '+96560000000' },
              returnUrl: window.location.origin + '/success',
              cancelUrl: window.location.origin + '/cancel',
            }
          });

          console.log('Payment result:', result);
        } catch (err) {
          console.error('Payment failed:', err);
        }
      });
    }

    init();
  </script>
</body>
</html>
```

---

## Support & Documentation
- **Developer Documentation**: [https://developers.upayments.com](https://developers.upayments.com)
- **Technical Support**: [support@upayments.com](mailto:support@upayments.com)
