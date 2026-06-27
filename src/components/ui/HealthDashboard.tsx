import { useEffect, useState } from "react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const SERVICES = [
  { id: "yolo",     name: "YOLOv8 Damage AI",   path: import.meta.env.VITE_DAMAGE_WEBHOOK_ID },
  { id: "fraud",    name: "Fraud Detection",     path: import.meta.env.VITE_FRAUD_WEBHOOK_ID },
  { id: "decision", name: "Decision Engine",     path: import.meta.env.VITE_DECISION_WEBHOOK_ID },
  { id: "policy",   name: "Policy Validator",    path: import.meta.env.VITE_POLICY_WEBHOOK_ID },
  { id: "payment",  name: "Payment Gateway",     path: import.meta.env.VITE_PAYMENT_WEBHOOK_ID },
  { id: "otp",      name: "OTP Service",         path: import.meta.env.VITE_OTP_REQUEST_WEBHOOK },
]

const ICONS: { [key: string]: string } = {
  yolo: "🤖", fraud: "🛡️", decision: "⚖️",
  policy: "📋", payment: "💳", otp: "🔐",
}

type Status = "ok" | "warn" | "error"

interface ServiceHealth {
  id: string
  name: string
  status: Status
  ping: number | null
  message: string
}

async function checkWebhook(name: string, id: string, path: string): Promise<ServiceHealth> {
  const start = Date.now()
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 5000)
    const res = await fetch(`${BASE_URL}/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ healthCheck: true }),
      signal: controller.signal,
    })
    clearTimeout(timer)
    const ping = Date.now() - start
    if (res.ok) {
      return { id, name, status: ping > 2000 ? "warn" : "ok", ping, message: ping > 2000 ? "Slow response" : "Healthy" }
    }
    return { id, name, status: "error", ping, message: `HTTP ${res.status}` }
  } catch (_e) {
    return { id, name, status: "error", ping: null, message: "Unreachable / Timeout" }
  }
}

export default function HealthDashboard() {  const [services, setServices] = useState<ServiceHealth[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [lastCheck, setLastCheck] = useState<Date | null>(null)

  const runCheck = async (): Promise<void> => {
    setLoading(true)
    const results = await Promise.all(SERVICES.map((s) => checkWebhook(s.name, s.id, s.path)))
    setServices(results)
    setLastCheck(new Date())
    setLoading(false)
  }

  useEffect(() => {
    runCheck()
    const interval = setInterval(runCheck, 30000)
    return () => clearInterval(interval)
  }, [])

  const hasError = services.some((s) => s.status === "error")
  const hasWarn = services.some((s) => s.status === "warn")

  return (
    <div style={{ padding: "16px", borderRadius: "16px", border: "1px solid #DBEAFE", background: "rgba(255,255,255,0.9)", marginBottom: "4px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
        <div>
          <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "#0F172A" }}>🩺 System Health</p>
          <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#94A3B8" }}>
            {lastCheck ? `Last checked: ${lastCheck.toLocaleTimeString()}` : "Checking..."}
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span style={{
            padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 500,
            background: hasError ? "#FEE2E2" : hasWarn ? "#FEF9C3" : "#DCFCE7",
            color: hasError ? "#DC2626" : hasWarn ? "#CA8A04" : "#16A34A",
          }}>
            {hasError ? "⚠️ Issue" : hasWarn ? "🔶 Degraded" : "✅ Healthy"}
          </span>
          <button
            onClick={runCheck}
            disabled={loading}
            style={{ padding: "3px 10px", borderRadius: "8px", border: "1px solid #E2E8F0", background: "#fff", cursor: "pointer", fontSize: "12px", color: "#475569" }}
          >
            {loading ? "..." : "↻"}
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {loading && services.length === 0 ? (
          <p style={{ textAlign: "center", color: "#CBD5E1", fontSize: "13px", padding: "16px 0" }}>Running diagnostics...</p>
        ) : (
          services.map((svc) => (
            <div key={svc.id} style={{
              display: "flex", alignItems: "center", gap: "12px",
              padding: "10px 12px", borderRadius: "10px", border: "1px solid",
              borderColor: svc.status === "error" ? "#FECACA" : svc.status === "warn" ? "#FDE68A" : "#E2E8F0",
              background: svc.status === "error" ? "#FEF2F2" : svc.status === "warn" ? "#FFFBEB" : "#F8FAFC",
            }}>
              <span style={{ fontSize: "18px" }}>{ICONS[svc.id]}</span>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 500, fontSize: "13px", color: "#0F172A" }}>{svc.name}</p>
                <p style={{ margin: "1px 0 0", fontSize: "11px", color: svc.status === "error" ? "#DC2626" : svc.status === "warn" ? "#CA8A04" : "#64748B" }}>
                  {svc.message}
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{
                  padding: "2px 8px", borderRadius: "20px", fontSize: "11px", fontWeight: 600,
                  background: svc.status === "error" ? "#FEE2E2" : svc.status === "warn" ? "#FEF9C3" : "#DCFCE7",
                  color: svc.status === "error" ? "#DC2626" : svc.status === "warn" ? "#CA8A04" : "#16A34A",
                }}>
                  {svc.status === "error" ? "DOWN" : svc.status === "warn" ? "SLOW" : "OK"}
                </span>
                <p style={{ margin: "3px 0 0", fontSize: "10px", color: "#94A3B8" }}>
                  {svc.ping !== null ? `${svc.ping}ms` : "timeout"}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}