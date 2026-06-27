import { useEffect, useState } from "react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface ServiceHealth {
  id: string;
  name: string;
  status: "ok" | "warn" | "error";
  ping: number | null;
  message: string;
}

async function checkWebhook(name: string, id: string, path: string): Promise<ServiceHealth> {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${BASE_URL}/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ healthCheck: true }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    const ping = Date.now() - start;
    if (res.ok) {
      return { id, name, status: ping > 2000 ? "warn" : "ok", ping, message: ping > 2000 ? "Slow response" : "Healthy" };
    }
    return { id, name, status: "error", ping, message: `HTTP ${res.status}` };
  } catch {
    return { id, name, status: "error", ping: null, message: "Unreachable / Timeout" };
  }
}

const SERVICES = [
  { id: "yolo",     name: "YOLOv8 Damage AI",   path: import.meta.env.VITE_DAMAGE_WEBHOOK_ID },
  { id: "fraud",    name: "Fraud Detection",     path: import.meta.env.VITE_FRAUD_WEBHOOK_ID },
  { id: "decision", name: "Decision Engine",     path: import.meta.env.VITE_DECISION_WEBHOOK_ID },
  { id: "policy",   name: "Policy Validator",    path: import.meta.env.VITE_POLICY_WEBHOOK_ID },
  { id: "payment",  name: "Payment Gateway",     path: import.meta.env.VITE_PAYMENT_WEBHOOK_ID },
  { id: "otp",      name: "OTP Service",         path: import.meta.env.VITE_OTP_REQUEST_WEBHOOK },
];

const ICONS: Record<string, string> = {
  yolo: "🤖", fraud: "🛡️", decision: "⚖️",
  policy: "📋", payment: "💳", otp: "🔐",
};

export default function HealthDashboard() {
  const [services, setServices] = useState<ServiceHealth[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const runCheck = async () => {
    setLoading(true);
    const results = await Promise.all(
      SERVICES.map((s) => checkWebhook(s.name, s.id, s.path))
    );
    setServices(results);
    setLastCheck(new Date());
    setLoading(false);
  };

  useEffect(() => {
    runCheck();
    const interval = setInterval(runCheck, 30000);
    return () => clearInterval(interval);
  }, []);

  const hasError = services.some((s) => s.status === "error");
  const hasWarn = services.some((s) => s.status === "warn");

  return (
    <div style={{ padding: "24px", maxWidth: "700px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 600 }}>🩺 System Health</h2>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#888" }}>
            {lastCheck ? `Last checked: ${lastCheck.toLocaleTimeString()}` : "Checking..."}
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <span style={{
            padding: "4px 12px", borderRadius: "20px", fontSize: "13px", fontWeight: 500,
            background: hasError ? "#fee2e2" : hasWarn ? "#fef9c3" : "#dcfce7",
            color: hasError ? "#dc2626" : hasWarn ? "#ca8a04" : "#16a34a",
          }}>
            {hasError ? "⚠️ Issue Detected" : hasWarn ? "🔶 Degraded" : "✅ All Healthy"}
          </span>
          <button onClick={runCheck} disabled={loading} style={{
            padding: "4px 12px", borderRadius: "8px", border: "1px solid #ddd",
            background: "#fff", cursor: "pointer", fontSize: "13px",
          }}>
            {loading ? "Checking..." : "↻ Refresh"}
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {loading && services.length === 0 ? (
          <p style={{ textAlign: "center", color: "#aaa", padding: "32px 0" }}>Running diagnostics...</p>
        ) : (
          services.map((svc) => (
            <div key={svc.id} style={{
              display: "flex", alignItems: "center", gap: "14px",
              padding: "14px 16px", borderRadius: "12px", border: "1px solid",
              borderColor: svc.status === "error" ? "#fecaca" : svc.status === "warn" ? "#fde68a" : "#e5e7eb",
              background: svc.status === "error" ? "#fef2f2" : svc.status === "warn" ? "#fffbeb" : "#fff",
            }}>
              <span style={{ fontSize: "22px" }}>{ICONS[svc.id]}</span>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 500, fontSize: "14px" }}>{svc.name}</p>
                <p style={{
                  margin: "2px 0 0", fontSize: "12px",
                  color: svc.status === "error" ? "#dc2626" : svc.status === "warn" ? "#ca8a04" : "#6b7280",
                }}>{svc.message}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{
                  padding: "2px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 600,
                  background: svc.status === "error" ? "#fee2e2" : svc.status === "warn" ? "#fef9c3" : "#dcfce7",
                  color: svc.status === "error" ? "#dc2626" : svc.status === "warn" ? "#ca8a04" : "#16a34a",
                }}>
                  {svc.status === "error" ? "DOWN" : svc.status === "warn" ? "SLOW" : "OK"}
                </span>
                <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#9ca3af" }}>
                  {svc.ping !== null ? `${svc.ping}ms` : "timeout"}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}