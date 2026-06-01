# Mindset Career — Placement Portal

A two-part web app built by [Reframe Studios](https://reframestudios.in) for **M/s. Mindset Eduhub** (operating as Mindset Career), Guwahati. Tracks employers, candidates, and registration receipts for a placement consultancy.

| | |
|---|---|
| **Client** | M/s. Mindset Eduhub |
| **Designer / Developer** | M/s. Reframe Studios (Raktim Mahanta) |
| **Agreement** | Web Development Agreement dated 29 April 2026 (Pilot / Phase 1) |
| **Live demo** | https://mindset-reframestudios.vercel.app |
| **API** | https://mindset-career-api.onrender.com *(after first deploy)* |

---

## Stack

- **Frontend**: pure HTML / CSS / vanilla JS — no build step. Three CDN scripts loaded on the relevant pages (`papaparse`, `xlsx`, `jspdf`). Deployed to **Vercel**.
- **Backend**: Express 4 + file-based JSON storage (`server/data/db.json`). Deployed to **Render**.
- **Auth**: bearer-token sessions, two pre-configured roles — `admin` (full access) and `po` (no archive / delete).

---

## Files

```
mindset-demo/
├── index.html               Public landing page
├── login.html               Portal sign-in
├── dashboard.html           Overview / hub
├── employers.html           Employer ledger (CRUD + bulk import + exports)
├── employees.html           Candidate ledger (same shape)
├── register.html            New-candidate registration + ₹300 receipt
├── activity.html            Activity log
├── settings.html            Password change + admin reset
│
├── css/styles.css           Design system (Mindset Career palette)
├── js/app.js                Frontend client — API.* + DB cache + UI helpers
├── js/data.js               Dropdown enums (states, departments)
├── assets/logo.png          Mindset Career logo (web-optimised)
│
├── server/index.js          Express backend — REST API + auth + JSON store
├── server/data/db.json      Live data (gitignored — runtime only)
│
├── package.json             Backend deps (express, cors)
├── render.yaml              Render service config
└── DEPLOYMENT.md            Deployment guide (Render + Vercel)
```

---

## Quick start (local development)

```bash
# Install backend deps
npm install

# Terminal 1 — backend on port 4000
npm run server

# Terminal 2 — static file server on port 8765
python3 -m http.server 8765
```

Open <http://localhost:8765/login.html> and sign in:
- Admin: `admin` / `mindset2025`
- Placement Officer: `po` / `mindset2025`

> Change these default passwords on the **Settings** page on first login. The admin can reset the PO password from the same page.

---

## Features

| | |
|---|---|
| Public landing page | Marketing copy, services, contact details |
| Login + role-based access | Admin vs Placement Officer |
| Employer module | CRUD, search, filter (active / archived), inline remarks, follow-up notes, bulk CSV import, CSV / Excel / PDF export |
| Candidate module | CRUD, search, filter (paid / pending / archived), inline remarks, follow-up notes, bulk CSV import, exports |
| Registration page | 3-step flow → records ₹300 payment, generates server-issued receipt number, printable receipt |
| Activity log | Server-side timeline of every mutation (last 150 entries) |
| Settings | Self-service password change; admin can reset another user's password |
| Dashboard | Live stats (employer count, candidate count, pending verifications, revenue, active districts) + recent activity |

See the [Annexure-I scope document](#) for the full feature contract.

---

## Deploying

See [DEPLOYMENT.md](./DEPLOYMENT.md).
