'use client';

import React, { useState } from 'react';
import {
  UPayments,
  PaymentMethods,
  ApplePayButton,
  type PaymentMethodId,
  type PayOptions,
} from '@upayments-kw/react';

type Environment = 'sandbox' | 'production';

export const CheckoutClient: React.FC = () => {
  const [sdk, setSdk] = useState<UPayments<'uapi'> | null>(null);
  const [environment, setEnvironment] = useState<Environment>('sandbox');
  const [token, setToken] = useState<string>('');
  const [amount, setAmount] = useState<number>(25.0);
  const [availableMethods, setAvailableMethods] = useState<PaymentMethodId[]>([]);
  const [status, setStatus] = useState<string>('Enter your Bearer API Token to initialize SDK');
  const [logs, setLogs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'grouped' | 'standalone'>('grouped');

  const addLog = (msg: string) => {
    setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
  };

  const initSdk = async (authToken: string, env: Environment = environment) => {
    const trimmedToken = authToken.trim();
    if (!trimmedToken) {
      setSdk(null);
      setAvailableMethods([]);
      setStatus('Enter Bearer API Token to initialize');
      addLog('No token provided. Payment methods disabled.');
      return;
    }

    try {
      setStatus(`Initializing SDK (${env})...`);
      addLog(`Initializing UPayments SDK in ${env} mode...`);

      // Initialize UPayments SDK
      const instance = UPayments.create({
        from: 'uapi',
        environment: env,
        token: trimmedToken,
        debug: true,
      });

      // Event: SDK Ready
      instance.on('upay:ready', (event) => {
        addLog(
          `Event [upay:ready]: Available methods -> ${event.availablePaymentMethods.join(', ') || 'None'}`,
        );
      });

      // Event: Payment Failed
      instance.on('upay:payment-failed', (event) => {
        addLog(
          `Event [upay:payment-failed]: ${event.error?.userMessage || event.error?.code || 'Payment failed'}`,
        );
      });

      // Await network handshake & fetch available payment methods
      await instance.initialize();

      setSdk(instance);
      const methods = instance.getAvailablePaymentMethods();
      setAvailableMethods(methods);

      setStatus(
        methods.length > 0
          ? `Ready for checkout (${env})`
          : 'SDK initialized (No payment methods available on this browser/device)',
      );
      addLog(`SDK initialized successfully. Available methods: ${methods.join(', ') || 'none'}`);
    } catch (err: unknown) {
      setSdk(null);
      setAvailableMethods([]);
      const message = err instanceof Error ? err.message : String(err);
      setStatus(`Init failed: ${message}`);
      addLog(`Error during initialization: ${message}`);
    }
  };

  const handleApplyConfig = (e: React.FormEvent) => {
    e.preventDefault();
    initSdk(token, environment);
  };

  /**
   * Constructs the payment request payload.
   */
  const buildPaymentPayload = (currentAmount: number): PayOptions<'uapi'>['payload'] => {
    const orderId = `ORD_${Date.now()}`;
    let domainName = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    if (domainName.match(/localhost/)) domainName = 'sdkweb.upaytest.com';

    return {
      amount: Number(currentAmount),
      products: [
        {
          name: 'Classic White Sneakers',
          description: 'Size 42 - White Leather',
          price: Number(currentAmount),
          quantity: 1,
        },
      ],
      order: {
        id: orderId,
        reference: orderId,
        description: 'Payment for Order #10024',
        currency: 'KWD',
        amount: Number(currentAmount),
      },
      language: 'en',
      reference: {
        id: orderId,
      },
      customer: {
        uniqueId: 'cust_987',
        name: 'Ahmed Al-Sabah',
        mobile: '+96560000000',
        email: 'customer@example.com',
      },
      returnUrl:
        typeof window !== 'undefined'
          ? `${window.location.origin}/return`
          : 'https://localhost:3000/return',
      cancelUrl:
        typeof window !== 'undefined'
          ? `${window.location.origin}/cancel`
          : 'https://localhost:3000/cancel',
      notificationUrl: 'https://webhook.site/demo-endpoint',
      domainName,
      isSaveCard: false,
    };
  };

  const handlePayment = async (method: PaymentMethodId) => {
    if (!sdk) {
      alert('Please configure and initialize the SDK first.');
      return;
    }

    addLog(`Initiating payment for ${method} (${amount} KWD)...`);

    try {
      const payload = buildPaymentPayload(amount);
      const result = await sdk.pay({
        paymentMethod: method,
        payload,
      });

      addLog(`Payment success: ${JSON.stringify(result)}`);
      alert(`Payment Successful!\nTransaction ID: ${result.transactionId}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      addLog(`Payment failed: ${message}`);
    }
  };

  return (
    <div style={{ maxWidth: 840, margin: '0 auto', padding: '2rem 1rem' }}>
      <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#0f172a' }}>
          UPayments Web SDK (Next.js Example)
        </h1>
        <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.875rem' }}>
          Next.js App Router merchant integration with Apple Pay &amp; Apple Pay KNET
        </p>
      </header>

      {/* Configuration Form Card */}
      <section
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 12,
          padding: '1.5rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          marginBottom: '1.5rem',
        }}
      >
        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem' }}>
          Merchant Configuration
        </h2>

        <form onSubmit={handleApplyConfig}>
          {/* Environment */}
          <div style={{ marginBottom: '0.875rem' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: '#475569',
                marginBottom: 4,
              }}
            >
              Environment:
            </label>
            <select
              value={environment}
              onChange={(e) => setEnvironment(e.target.value as Environment)}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: 6,
                border: '1px solid #cbd5e1',
                fontSize: '0.875rem',
                backgroundColor: '#ffffff',
              }}
            >
              <option value="sandbox">Sandbox (Testing)</option>
              <option value="production">Production (Live)</option>
            </select>
          </div>

          {/* Amount */}
          <div style={{ marginBottom: '0.875rem' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: '#475569',
                marginBottom: 4,
              }}
            >
              Order Amount (KWD):
            </label>
            <input
              type="number"
              step="0.001"
              min="0.001"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: 6,
                border: '1px solid #cbd5e1',
                fontSize: '0.875rem',
                fontWeight: 600,
              }}
            />
          </div>

          {/* Bearer Token */}
          <div style={{ marginBottom: '0.875rem' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: '#475569',
                marginBottom: 4,
              }}
            >
              Merchant Bearer API Token:
            </label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter your API Bearer Token"
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: 6,
                border: '1px solid #cbd5e1',
                fontSize: '0.875rem',
                fontFamily: 'monospace',
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: 8,
              border: 'none',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              marginTop: '0.5rem',
            }}
          >
            Apply &amp; Initialize SDK
          </button>
        </form>
      </section>

      {/* Status Bar */}
      <div
        style={{
          padding: '0.75rem 1rem',
          borderRadius: 8,
          fontSize: '0.875rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          backgroundColor: availableMethods.length > 0 ? '#f0fdf4' : '#f8fafc',
          border: `1px solid ${availableMethods.length > 0 ? '#bbf7d0' : '#e2e8f0'}`,
          color: availableMethods.length > 0 ? '#166534' : '#475569',
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: availableMethods.length > 0 ? '#22c55e' : '#94a3b8',
            display: 'inline-block',
          }}
        />
        <span>{status}</span>
      </div>

      {/* Checkout Component Section */}
      {sdk && (
        <section
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 12,
            padding: '1.5rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            marginBottom: '1.5rem',
          }}
        >
          <div
            style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: '1.25rem' }}
          >
            <button
              onClick={() => setActiveTab('grouped')}
              style={{
                padding: '8px 16px',
                border: 'none',
                background: 'none',
                borderBottom: activeTab === 'grouped' ? '2px solid #2563eb' : '2px solid transparent',
                color: activeTab === 'grouped' ? '#2563eb' : '#64748b',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              Grouped Payment Methods
            </button>
            <button
              onClick={() => setActiveTab('standalone')}
              style={{
                padding: '8px 16px',
                border: 'none',
                background: 'none',
                borderBottom:
                  activeTab === 'standalone' ? '2px solid #2563eb' : '2px solid transparent',
                color: activeTab === 'standalone' ? '#2563eb' : '#64748b',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              Standalone Apple Pay Button
            </button>
          </div>

          {activeTab === 'grouped' ? (
            <div>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '0 0 1rem' }}>
                The <code>&lt;PaymentMethods /&gt;</code> container renders all supported payment
                methods detected on this browser:
              </p>
              <div style={{ maxWidth: 400, margin: '0 auto' }}>
                <PaymentMethods
                  availableMethods={availableMethods}
                  onMethodSelected={(method) => handlePayment(method)}
                />
              </div>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '0 0 1rem' }}>
                Standalone <code>&lt;ApplePayButton /&gt;</code> button:
              </p>
              <div style={{ maxWidth: 300, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <ApplePayButton
                  variant="black"
                  buttonStyle="buy"
                  onClick={() => handlePayment('apple_pay')}
                />
                <ApplePayButton
                  variant="white-with-line"
                  buttonStyle="plain"
                  onClick={() => handlePayment('apple_pay')}
                />
              </div>
            </div>
          )}
        </section>
      )}

      {/* Live Event Console */}
      <section
        style={{
          borderRadius: 12,
          padding: '1rem',
          border: '1px solid #e2e8f0',
          backgroundColor: '#ffffff',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.5rem',
          }}
        >
          <h3 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>
            Live Event Logs
          </h3>
          <button
            onClick={() => setLogs([])}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              fontSize: '0.75rem',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Clear Logs
          </button>
        </div>

        <div
          style={{
            backgroundColor: '#0f172a',
            color: '#38bdf8',
            padding: '0.75rem',
            borderRadius: 6,
            fontSize: '0.75rem',
            fontFamily: 'monospace',
            maxHeight: 180,
            overflowY: 'auto',
            lineHeight: 1.5,
          }}
        >
          {logs.length === 0 ? (
            <span style={{ color: '#64748b' }}>No events recorded yet.</span>
          ) : (
            logs.map((log, idx) => <div key={idx}>{log}</div>)
          )}
        </div>
      </section>
    </div>
  );
};
