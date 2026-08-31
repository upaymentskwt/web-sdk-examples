# React + Vite Example (UAPI)

This example demonstrates how to integrate the **UPayments Web SDK** in a modern React application using `@upayments-kw/web-sdk` and `@upayments-kw/react`.

## Features
- **UAPI Authentication**: Connects using merchant Bearer API token.
- **Payment Methods Supported**:
  - `apple_pay` (Apple Pay)
  - `apple_pay_knet` (Apple Pay KNET Debit)
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

The app will start at `https://localhost:5173`. Open this URL in **Safari on macOS or iOS** (with a configured Apple Pay wallet).

### 3. Usage & Testing
1. Select your target environment (**Sandbox** or **Production**).
2. Enter your merchant **Bearer API Token**.
3. Click **Apply & Initialize SDK**.
4. Test initiating payment using the **Grouped Element** or **Standalone Apple Pay Button**.

---

## Code Example

```tsx
import React, { useEffect, useState } from 'react';
import { UPayments, type PayOptions } from '@upayments-kw/web-sdk';
import { PaymentMethods } from '@upayments-kw/react';

export const Checkout = () => {
  const [sdk, setSdk] = useState<UPayments<'uapi'> | null>(null);

  useEffect(() => {
    const instance = UPayments.create({
      from: 'uapi',
      environment: 'sandbox', // or 'production'
      auth: {
        type: 'bearer',
        token: 'YOUR_MERCHANT_BEARER_TOKEN',
      },
    });

    setSdk(instance);
  }, []);

  const handlePayment = async (method: string) => {
    if (!sdk) return;

    const payload: PayOptions<'uapi'>['payload'] = {
      amount: 25.0,
      products: [
        {
          name: 'Item Title',
          description: 'Description',
          price: 25.0,
          quantity: 1,
        },
      ],
      order: {
        id: 'ORD_12345',
        reference: 'ORD_12345',
        description: 'Order Payment',
        currency: 'KWD',
        amount: 25.0,
      },
      language: 'en',
      customer: {
        uniqueId: 'cust_001',
        name: 'Customer Name',
        mobile: '+96560000000',
        email: 'customer@example.com',
      },
      returnUrl: 'https://yourdomain.com/order-success',
      cancelUrl: 'https://yourdomain.com/order-cancel',
      notificationUrl: 'https://api.yourdomain.com/webhook',
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
      {sdk && (
        <PaymentMethods
          sdk={sdk}
          onMethodSelected={(e) => handlePayment(e.detail.paymentMethod)}
        />
      )}
    </div>
  );
};
```
