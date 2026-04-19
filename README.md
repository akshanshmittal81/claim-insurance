<div align="center">

# ⚡ ClaimTitans
### *AI-Powered Vehicle Insurance Claims — Automated. Intelligent. Instant.*

[![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite_5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![n8n](https://img.shields.io/badge/n8n-EA4B71?style=for-the-badge&logo=n8n&logoColor=white)](https://n8n.io)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)

<br/>

> 🏆 **Cognizant Technoverse 2026** &nbsp;|&nbsp; Team ClaimTitans &nbsp;|&nbsp; MIET Meerut

<br/>

```
📸 Capture Damage  →  🤖 AI Analysis  →  🔍 Fraud Detection  →  ✅ Instant Decision  →  ⛓️ Blockchain Record
```

</div>

---

## 🚀 What is ClaimTitans?

ClaimTitans is a **next-generation insurance claims platform** that eliminates the 15-day manual claims process and replaces it with a **fully automated AI pipeline** that delivers decisions in minutes.

- 📸 **Capture** — Live camera, video recording, GPS metadata
- 🤖 **AI Analysis** — Damage detection + severity classification
- 🕵️ **Fraud Detection** — GAN-based fake image detection
- ⛓️ **Blockchain** — Immutable claim records on-chain
- 💸 **Instant Payout** — Automated payment release

---

## 🧠 Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| ⚛️ Framework | React 18 + Vite 5 | Blazing fast frontend |
| 🔷 Language | TypeScript (strict) | Type-safe codebase |
| 🎨 Styling | Tailwind CSS | Utility-first design |
| 🔀 Routing | React Router DOM v6 | SPA navigation |
| 🗃️ State | Zustand (persisted) | Global state management |
| 🌐 API | Axios + Interceptors | Smart retry logic |
| 📋 Forms | React Hook Form + Zod | Validation & schema |
| ✨ Animation | Framer Motion | Smooth UI transitions |
| 🔔 Toasts | React Hot Toast | User notifications |
| ⚙️ Backend | n8n Workflows | Automation engine |
| 🗄️ Database | Supabase (PostgreSQL) | Real-time data |
| 📱 SMS | Twilio | OTP delivery |

---

## 📁 Project Structure

```
claim-insurance/
├── src/
│   ├── 🧩 components/
│   │   ├── ui/              # Button, Input, Badge, ProgressBar, Skeleton
│   │   ├── layout/          # AppLayout, ProtectedRoute, Breadcrumb
│   │   └── claim/           # ClaimStepper
│   │
│   ├── 📄 pages/
│   │   ├── LandingPage.tsx        # Hero + Features + CTA
│   │   ├── AuthPage.tsx           # OTP Authentication
│   │   ├── DashboardPage.tsx      # Claims Overview
│   │   ├── ClaimCapturePage.tsx   # Camera + Upload
│   │   ├── ClaimProcessingPage.tsx # Live Progress Stepper
│   │   ├── ClaimResultPage.tsx    # Decision + Payout
│   │   └── BlockchainPage.tsx     # On-chain Records
│   │
│   ├── 🌐 services/
│   │   └── api.ts           # Centralized Axios API layer
│   │
│   ├── 🗃️ store/
│   │   └── index.ts         # Zustand global store
│   │
│   ├── 🪝 hooks/
│   │   ├── useClaimPolling.ts
│   │   └── useCamera.ts
│   │
│   ├── 📐 types/index.ts
│   ├── 📌 constants/index.ts
│   └── 🛠️ utils/index.ts
│
├── public/
├── .env.example
├── package.json
└── vite.config.ts
```


## 🔌 API Endpoints (n8n Webhooks)

All requests use `VITE_API_BASE_URL` as base URL.

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/request-otp` | 📲 Send OTP to phone |
| `POST` | `/auth/verify-otp` | ✅ Verify OTP → JWT + user |
| `GET` | `/user` | 👤 Get user profile |
| `POST` | `/auth/logout` | 🚪 Invalidate session |
| `POST` | `/claim` | 📝 Submit new claim |
| `GET` | `/claim` | 📋 List all claims |
| `GET` | `/claim/:id/status` | 🔄 Poll claim status |
| `GET` | `/claim/:id/result` | 🏁 Get final result |
| `GET` | `/claim/:id/garage` | 🔧 Assigned garage info |
| `GET` | `/claim/:id/payment` | 💰 Payment status |
| `GET` | `/claim/:id/blockchain` | ⛓️ Blockchain record |

---

## 🔄 Claim Processing Pipeline

```
uploaded
   ↓
ai_analysis          🤖 Damage detection + severity
   ↓
insurance_check      📋 Policy validation
   ↓
fraud_detection      🕵️ GAN-based fake image detection
   ↓
decision             ⚖️ Approve / Reject
   ↓
garage_assigned      🔧 Nearest garage allocated
   ↓
payment_processing   💸 Automated payout
   ↓
completed ✅  |  rejected ❌
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│                  React Frontend                  │
│         (Vite + TypeScript + Tailwind)           │
└────────────────────┬────────────────────────────┘
                     │ Axios (JWT interceptor)
                     ▼
┌─────────────────────────────────────────────────┐
│              n8n Workflow Engine                 │
│   OTP Auth → AI Analysis → Fraud → Blockchain   │
└──────┬──────────────┬──────────────┬────────────┘
       │              │              │
       ▼              ▼              ▼
  Supabase DB     Twilio SMS     GAN Detector API
  (PostgreSQL)   (OTP Delivery)  (Railway.app)
```

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 📸 **Live Camera** | MediaDevices API — capture photo + video + GPS |
| 🔐 **OTP Auth** | Vehicle number + phone with Twilio SMS |
| 📊 **Real-time Polling** | Auto-updates every 4s via `useClaimPolling` hook |
| 🤖 **AI Damage Analysis** | Severity classification with confidence scores |
| 🕵️ **Fraud Detection** | GAN detector — blocks AI-generated fake images |
| ⛓️ **Blockchain Records** | Immutable claim audit trail |
| 💸 **Auto Payments** | Instant payout on approval |
| 📱 **Fully Responsive** | Works on mobile + desktop |
| ⚡ **Skeleton Loaders** | Smooth loading states everywhere |
| 🔄 **Retry Logic** | Exponential backoff on all API calls |

---

## 👥 Team ClaimTitans

<div align="center">

| Member | Role |
|---|---|
| 🧑‍💻 **Aniket Kansal** | Team Lead + n8n Workflows |
| 🧑‍💻 **Akshansh Mittal** | Full Stack |
| 👩‍💻 **Disha** | AI Integration + Testing |
| 👩‍💻 **Saumya** | Frontend + UI/UX |

**MIET Meerut** &nbsp;|&nbsp; Cognizant Technoverse 2026

</div>

---

<div align="center">

**Built with ❤️ by Team ClaimTitans**

*Turning 15-day claims into 15-minute decisions.*

</div>