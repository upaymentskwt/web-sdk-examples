import React, { useState } from 'react';
import {
  UPayments,
  PaymentMethods,
  ApplePayButton,
  type PaymentMethodId,
  type PayOptions,
} from '@upayments-kw/react';

type BoundPayHandler = (options: { payload: Record<string, unknown> }) => Promise<unknown>;

type Environment = 'sandbox' | 'production';

export const App: React.FC = () => {
  const [sdk, setSdk] = useState<UPayments<'uapi'> | null>(null);
  const [environment, setEnvironment] = useState<Environment>('sandbox');
  const [token, setToken] = useState<string>('');
  const [amount, setAmount] = useState<number>(25.0);
  const [availableMethods, setAvailableMethods] = useState<PaymentMethodId[]>([]);
  const [status, setStatus] = useState<string>('Enter Bearer API Token to initialize');
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

      // Initialize UPayments SDK for UAPI
      const instance = UPayments.create({
        from: 'uapi',
        environment: env,
        token: trimmedToken,
        debug: true,
      });

      // Event listener: ready
      instance.on('upay:ready', (event: { availablePaymentMethods: PaymentMethodId[] }) => {
        addLog(
          `Event [upay:ready]: Available methods -> ${event.availablePaymentMethods.join(', ') || 'None'}`,
        );
      });

      // Event listener: payment failed
      instance.on('upay:payment-failed', (event: any) => {
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

  const buildUapiPayload = (currentAmount: number): PayOptions<'uapi'>['payload'] => {
    const orderId = `ORD_${Date.now()}`;
    let domainName = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    if (domainName.match(/localhost/)) domainName = 'sdkweb.upaytest.com';

    return {
      amount: Number(currentAmount),
      products: [
        {
          name: 'Demo Product Item',
          description: 'Example checkout item description',
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
        uniqueId: 'cust_101',
        name: 'Demo Customer',
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

  const handlePay = async (method: PaymentMethodId, pay?: BoundPayHandler) => {
    if (!sdk) return;

    try {
      addLog(`Initiating payment for ${method} (${amount} KWD)...`);
      const payload = buildUapiPayload(amount);

      let result;
      if (typeof pay === 'function') {
        // Direct execution inside user gesture handler
        result = await pay({ payload });
      } else if (typeof (sdk as any).createPayHandler === 'function') {
        const payHandler = (sdk as any).createPayHandler(method);
        result = await payHandler({ payload });
      } else if (typeof (sdk as any).pay === 'function') {
        result = await (sdk as any).pay({ paymentMethod: method, payload });
      }

      addLog(`Payment completed: ${JSON.stringify(result)}`);
      alert(`Payment successful! Track ID / Order: ${JSON.stringify(result)}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      addLog(`Payment failed: ${message}`);
    }
  };

  const isReady = Boolean(sdk && availableMethods.length > 0);

  return (
    <div style={{ maxWidth: 520, margin: '2rem auto', padding: '1.25rem' }}>
      <header style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#0f172a', fontWeight: 700 }}>
          UPayments Web SDK
        </h1>
        <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.875rem' }}>
          Merchant Example Application (React + Vite)
        </p>
      </header>

      {/* Configuration Box */}
      <section
        style={{
          border: '1px solid #e2e8f0',
          borderRadius: 12,
          padding: '1.25rem',
          backgroundColor: '#ffffff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          marginBottom: '1.5rem',
        }}
      >
        <h2 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 600, color: '#1e293b' }}>
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
                backgroundColor: '#f8fafc',
                fontWeight: 500,
              }}
            >
              <option value="sandbox">Sandbox (Testing)</option>
              <option value="production">Production (Live)</option>
              <option value="development">Development (Internal)</option>
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
              placeholder="Paste your API Bearer Token here"
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

      {/* Status Banner */}
      <div
        style={{
          padding: '0.75rem 1rem',
          borderRadius: 8,
          backgroundColor: isReady ? '#f0fdf4' : '#f8fafc',
          border: `1px solid ${isReady ? '#bbf7d0' : '#e2e8f0'}`,
          color: isReady ? '#166534' : '#475569',
          fontSize: '0.875rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span
          style={{
            display: 'inline-block',
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: isReady ? '#22c55e' : '#94a3b8',
          }}
        />
        <span>{status}</span>
      </div>

      {/* Checkout Display */}
      {sdk ? (
        <section
          style={{
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: '1.25rem',
            backgroundColor: '#ffffff',
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
                flex: 1,
                padding: '8px 0',
                border: 'none',
                background: 'none',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: activeTab === 'grouped' ? '#2563eb' : '#64748b',
                borderBottom: activeTab === 'grouped' ? '2px solid #2563eb' : 'none',
                cursor: 'pointer',
              }}
            >
              Grouped Element
            </button>
            <button
              onClick={() => setActiveTab('standalone')}
              style={{
                flex: 1,
                padding: '8px 0',
                border: 'none',
                background: 'none',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: activeTab === 'standalone' ? '#2563eb' : '#64748b',
                borderBottom: activeTab === 'standalone' ? '2px solid #2563eb' : 'none',
                cursor: 'pointer',
              }}
            >
              Standalone Button
            </button>
          </div>

          {activeTab === 'grouped' ? (
            <div>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '0 0 1rem' }}>
                Renders all available payment methods supported by the merchant and user device.
              </p>
              <PaymentMethods
                {...({ sdk } as any)}
                availableMethods={availableMethods}
                onMethodSelected={((method: PaymentMethodId, pay?: any) => handlePay(method, pay)) as any}
              />
            </div>
          ) : (
            <div>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '0 0 1rem' }}>
                Renders a standalone branded Apple Pay button.
              </p>
              <ApplePayButton
                {...({ sdk, paymentMethod: 'apple_pay' } as any)}
                variant="black"
                buttonStyle="buy"
                onClick={((pay?: any) => handlePay('apple_pay', pay)) as any}
              />
            </div>
          )}
        </section>
      ) : null}

      {/* Live Logs */}
      <section
        style={{
          border: '1px solid #e2e8f0',
          borderRadius: 12,
          padding: '1rem',
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
              border: 'none',
              background: 'none',
              fontSize: '0.75rem',
              color: '#64748b',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Clear
          </button>
        </div>
        <div
          style={{
            maxHeight: 180,
            overflowY: 'auto',
            backgroundColor: '#0f172a',
            color: '#38bdf8',
            padding: '0.75rem',
            borderRadius: 6,
            fontSize: '0.75rem',
            fontFamily: 'monospace',
            lineHeight: 1.5,
          }}
        >
          {logs.length === 0 ? (
            <span style={{ color: '#64748b' }}>No events recorded yet.</span>
          ) : (
            logs.map((log, index) => <div key={index}>{log}</div>)
          )}
        </div>
      </section>
    </div>
  );
};
