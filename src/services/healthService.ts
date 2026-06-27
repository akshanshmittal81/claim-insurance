const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface ServiceHealth {
  id: string;
  name: string;
  status: 'ok' | 'warn' | 'error';
  ping: number | null;
  message: string;
}

async function checkWebhook(name: string, id: string, path: string): Promise<ServiceHealth> {
  const start = Date.now();
  try {
    const res = await fetch(`${BASE_URL}/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ healthCheck: true }),
      signal: AbortSignal.timeout(5000), // 5 sec timeout
    });
    const ping = Date.now() - start;
    if (res.ok) {
      return { id, name, status: ping > 2000 ? 'warn' : 'ok', ping, message: ping > 2000 ? 'Slow response' : 'Healthy' };
    }
    return { id, name, status: 'error', ping, message: `HTTP ${res.status}` };
  } catch (e: any) {
    return { id, name, status: 'error', ping: null, message: e.name === 'TimeoutError' ? 'Timeout — no response in 5s' : 'Unreachable' };
  }
}

export async function runDiagnostics(): Promise<ServiceHealth[]> {
  return Promise.all([
    checkWebhook('YOLOv8 Damage AI',    'yolo',    import.meta.env.VITE_DAMAGE_WEBHOOK_ID),
    checkWebhook('Fraud Detection ML',  'fraud',   import.meta.env.VITE_FRAUD_WEBHOOK_ID),
    checkWebhook('Decision Engine',     'decision',import.meta.env.VITE_DECISION_WEBHOOK_ID),
    checkWebhook('Policy Validator',    'policy',  import.meta.env.VITE_POLICY_WEBHOOK_ID),
    checkWebhook('Payment Gateway',     'payment', import.meta.env.VITE_PAYMENT_WEBHOOK_ID),
    checkWebhook('OTP Service',         'otp',     import.meta.env.VITE_OTP_REQUEST_WEBHOOK),
  ]);
}