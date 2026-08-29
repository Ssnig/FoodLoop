# Running FoodLoop

## Prerequisites

- Node.js 18 or later (npm included)
- Optional: an active n8n workflow for rescue notifications (the app runs without it)
- Repository root `.env` present when using webhook notifications (do not commit secrets)

## Quick start (Windows)

From the repository root:

```bat
run.cmd
```

This will:

1. Install Frontend dependencies if `node_modules` is missing
2. Start the Vite React application on port **5173**

Open: **http://localhost:5173**

### Sign-in credentials

| Field | Value |
|-------|--------|
| Email | `owner@abcbakery.com` |
| Password | `demo1234` |
| Business | ABC Bakery |

Or create a new business account from **Sign up**.

Stop the app by closing the terminal window running Vite.

---

## Manual run (Frontend)

```bash
cd Frontend
npm install
npm run dev
```

Port **5173** is set in `Frontend/vite.config.ts`. Do not pass `--port` through npm; newer npm versions can break that into an invalid `vite 5173` command.

Optional production check:

```bash
cd Frontend
npm run build
npm run preview
```

---

## Backend

Backend logic is in-memory JavaScript imported by the Frontend. There is no separate API server to start.

Useful checks:

```bash
cd Backend
npm test
npm run demo
```

---

## Optional n8n notifications

If configured, completing a rescue can notify an n8n webhook. See environment variables in the repository `.env` and `Frontend/.env`. The UI remains fully usable when the webhook is unavailable.

---

## Suggested walkthrough

1. Open http://localhost:5173 and sign in
2. **Surplus inventory** — submit a batch with original and sale prices
3. **Partner matching** — review the donation / discount split and select a partner
4. **Rescue** — confirm pickup, then mark complete
5. **Impact** — verify meals, diverted weight, and recovered value

---

## Troubleshooting

| Issue | Resolution |
|-------|------------|
| Port 5173 in use | Stop the other Vite process, or change the port in `Frontend/vite.config.ts` |
| Blank page / import errors | Run `cd Frontend && npm install`, then restart |
| Rescue notification missing | Confirm webhook URL and workflow status if you rely on n8n |
