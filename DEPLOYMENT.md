# Deployment

The Mindset Career portal is split across two hosts:

| Layer | Host | URL |
|---|---|---|
| **Frontend** (static HTML / CSS / JS) | Vercel | https://mindset-reframestudios.vercel.app |
| **Backend** (Express + JSON file storage) | Render | https://mindset-career-api.onrender.com *(after first deploy)* |

The frontend talks to the backend by setting `window.MINDSET_API_BASE` before `js/app.js` loads. In development this defaults to `http://localhost:4000`.

---

## First-time backend deploy (Render)

1. **Sign up / log in** at <https://render.com> (free tier is fine for the pilot).
2. Click **New → Web Service**.
3. **Connect GitHub** and pick the `Mindset-Career-Portal` repo.
4. Render auto-detects [`render.yaml`](./render.yaml) and asks to apply it. Click **Apply**.
5. Render builds + boots the service in 2–3 minutes. When done, copy the URL it shows you — something like `https://mindset-career-api.onrender.com`.
6. Test it: `curl https://mindset-career-api.onrender.com/api/health` → `{"ok":true}`

> **Free-tier note:** Render free-tier services sleep after 15 minutes of inactivity. First request after a sleep takes ~30 seconds to wake up. For production use, upgrade to the $7/month "Starter" plan to keep it always-on.

After the first deploy, **every `git push` to `main` rebuilds and restarts the service automatically** (per `autoDeploy: true` in render.yaml).

---

## First-time frontend deploy (Vercel — replacing the existing demo URL)

Atikur already has the URL <https://mindset-reframestudios.vercel.app>. We're going to update that same project so the URL doesn't change.

1. **Log in** at <https://vercel.com> using the account that owns the existing `mindset-reframe` project.
2. Project settings → **Git** → if not already connected, link the GitHub repo `Mindset-Career-Portal`. If a different repo was connected before, change it.
3. **Root directory**: leave blank (project root).
4. **Framework Preset**: "Other" (or "Static").
5. **Build Command**: leave blank (no build step — pure HTML).
6. **Output Directory**: leave blank (root).
7. Go to **Settings → Environment Variables** and add (these aren't read by Vercel — they're embedded in a small JS shim, see below).
8. Trigger a deploy from the **Deployments** tab.

### Connecting the frontend to the Render backend

Before deploying to Vercel, edit `index.html`, `dashboard.html`, `login.html`, `employers.html`, `employees.html`, `register.html`, `activity.html`, `settings.html` to add **one line** above `<script src="js/app.js">`:

```html
<script>window.MINDSET_API_BASE = "https://mindset-career-api.onrender.com";</script>
```

Or — cleaner — add the same line **once** at the top of `js/app.js`, conditional on `location.hostname`:

```js
// Auto-detect production: use Render backend when not on localhost
if (typeof window !== "undefined" && location.hostname && location.hostname !== "localhost" && !location.hostname.startsWith("127.")) {
  window.MINDSET_API_BASE = "https://mindset-career-api.onrender.com";
}
```

(This is already wired up — see top of `js/app.js`. Just update the URL string after the first Render deploy gives you the actual URL.)

---

## Running locally (development)

**Terminal 1 — backend (port 4000):**
```
npm run server
```

**Terminal 2 — static file server (port 8765):**
```
python3 -m http.server 8765
```

Then open <http://localhost:8765/login.html>. Default credentials:
- Admin: `admin` / `mindset2025`
- Placement Officer: `po` / `mindset2025`

---

## Backups

The "database" is a single JSON file at `server/data/db.json`. On Render, it lives on the 1 GB persistent disk mounted at `/opt/render/project/src/server/data` (configured in render.yaml).

To download a backup at any time, log into the Render service shell and `cat server/data/db.json`. For automated backups, add a cron job that pushes the file to S3 / Google Drive nightly — out of scope for Phase 1.
