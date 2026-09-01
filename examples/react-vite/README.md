# React + Vite Example

This example demonstrates how to integrate the **UPayments Web SDK** in a modern React application using `@upayments-kw/react`.

> [!NOTE]
> React applications only need to install `@upayments-kw/react`. It re-exports all required SDK classes, methods, and TypeScript definitions.

## Features
- **All-in-one React Package**: Only `@upayments-kw/react` is required.
- **Automated Bearer Auth**: Pass `token: '...'` directly without needing `{ type: 'bearer' }`.
- **Payment Methods Supported**:
  - `apple_pay` (Apple Pay)
  - `apple_pay_knet` (Apple Pay KNET Debit)
  - *Credit Card & KNET Direct: Coming Soon*
- **UI Components**:
  - `<PaymentMethods />`: Unified multi-method responsive container.
  - `<ApplePayButton />`: Standalone customized Apple Pay button.
- **HTTPS Enabled**: Configured with `@vitejs/plugin-basic-ssl` for local Apple Pay testing on Safari.

---

## Getting Started

### 1. Install Dependencies
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

The app will start at `https://localhost:5173`. Open this URL in **Safari on macOS or iOS** (with an active card in Apple Wallet).

### 3. Usage & Testing
1. Select your target environment (**Sandbox** or **Production**).
2. Enter your merchant **API Bearer Token**.
3. Click **Apply & Initialize SDK**.
4. Test initiating payment using the **Grouped Element** or **Standalone Apple Pay Button**.

---

## Code Example

```tsx
import React, { useEffect, useState } from 'react';
import {
  UPayments,
  PaymentMethods,
  type PaymentMethodId,
  type PayOptions,
} from '@upayments-kw/react';

export const Checkout = () => {
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
          { name: 'Classic Sneakers', price: 25.0, quantity: 1 },
        ],
        order: {
          id: `ORD_${Date.now()}`,
          description: 'Payment for Order #10024',
          currency: 'KWD',
          amount: 25.0,
        },
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
