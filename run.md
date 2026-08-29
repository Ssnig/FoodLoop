# How to run FoodLoop

## Prerequisites

- Node.js 18+ (npm included)
- n8n already running locally (this project does **not** start n8n)
- Repo root `.env` present (webhook URL / keys — do not commit)

## Quick start (Windows)

From the repo root:

```bat
run.cmd
```

What it does:

1. Installs `Frontend` deps if `node_modules` is missing
2. Starts the Vite React app on port **5173**
3. Skips n8n (assumes you already started it)

Open: **http://localhost:5173** — you will land on **Login**.

### Demo login (default restaurant owner)

| Field | Value |
|-------|--------|
| Email | `owner@abcbakery.com` |
| Password | `demo1234` |
| Restaurant | ABC Bakery |

Or use **Create an account** on `/signup` for a new restaurant workspace.

Stop: close the terminal window running Vite.

---

## Manual run (Frontend)

```bash
cd Frontend
npm install
npm run dev
```

Port **5173** is set in `Frontend/vite.config.ts` (do not pass `--port` through npm — newer npm can break it into `vite 5173`).

Same URL: **http://localhost:5173**

Optional production check:

```bash
cd Frontend
npm run build
npm run preview
```

---

## Backend (no server)

Backend is in-memory JS imported by the Frontend. There is nothing to “start” for the API.

Useful checks:

```bash
cd Backend
npm test
npm run demo
```

---

## n8n (cloud)

Primary instance: **https://kyawsanhtun.app.n8n.cloud**

Required for rescue notifications:

1. Workflow **FoodLoop - Rescue Coordinator** is **Published/Active**
2. Webhook path: `/webhook/foodloop-rescue-created`
3. Full production URL used by Backend:

   `https://kyawsanhtun.app.n8n.cloud/webhook/foodloop-rescue-created`

Frontend proxies browser calls:

- Vite path: `/api/n8n/webhook/foodloop-rescue-created`
- Proxies to: `https://kyawsanhtun.app.n8n.cloud/webhook/foodloop-rescue-created`

Config sources:

| File | Purpose |
|------|---------|
| `.env` (repo root) | `N8N_RESCUE_WEBHOOK_URL`, optional local `N8N_API_KEY` |
| `Frontend/.env` | `VITE_N8N_RESCUE_WEBHOOK_URL=/api/n8n/webhook/foodloop-rescue-created` |

Workflow editor: https://kyawsanhtun.app.n8n.cloud/workflow/tmaRn25UogtLWYrW

---

## Ports cheat sheet

| Service | URL |
|---------|-----|
| Frontend (Vite) | http://localhost:5173 |
| n8n (cloud) | https://kyawsanhtun.app.n8n.cloud |
| Rescue webhook | https://kyawsanhtun.app.n8n.cloud/webhook/foodloop-rescue-created |

---

## Demo click path

1. Open http://localhost:5173 → **Login** with `owner@abcbakery.com` / `demo1234`
2. **Surplus** — use seed Chicken Sandwiches or log a new item for ABC Bakery
3. **Matching** — expect donate **15** / discount **5**; pick Community Food Center
4. **Rescue** — mark complete
5. **Impact** — meals / kg / value update; n8n badge may show coordinator notified

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Port 5173 in use | Stop the other Vite process, or change port in `run.cmd` |
| Blank / import errors | `cd Frontend && npm install` then restart |
| n8n not notified | Confirm workflow Active + webhook URL; check browser Network for `/api/n8n/...` |
| WebMCP skip in console | Normal if Chrome WebMCP is unavailable — UI still works |
