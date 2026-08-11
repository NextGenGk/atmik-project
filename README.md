# Atmik Inventory Console

MERN stack **Enterprise Asset Management** web application tailored for Atmik Bharat Industries Pvt. Ltd.

Features a premium dark-glass UI, Code 128 barcode generation & printing, a **Smart Scan** optical barcode scanner (supporting camera, image upload, and wedge scanners), **Atmik Stock Intelligence** analytics, and an integrated **SiteBot AI Chatbot** widget for support. 

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS v4 + TanStack Query + jsbarcode + ZXing + SiteBot |
| Backend | Node 20 + Express 4 + TypeScript + Mongoose + Zod + Clerk verification |
| Database | MongoDB Atlas (M0 free tier) |
| Auth | Clerk (optional — dev mode runs without keys) |

---

## Prerequisites

- Node **>= 20** and npm
- A MongoDB Atlas URI (`MONGO_URI`) — see [deployment](docs/deployment.md)
- (Optional) a Clerk app if you want real authentication — see [deployment](docs/deployment.md)
- (Optional) SiteBot configuration variables for the chatbot widget.

## Quick Start

```bash
# 1. install everything
npm run install:all

# 2. configure the server env
cp server/.env.example server/.env
#    → edit server/.env with your MONGO_URI (+ CLERK_SECRET_KEY if using Clerk)

# 3. configure the client env
cp client/.env.example client/.env
#    → add VITE_CLERK_PUBLISHABLE_KEY if using Clerk
#    → verify VITE_SITEBOT_SCRIPT_URL and VITE_SITEBOT_NAMESPACE for the chatbot

# 4. seed sample inventory (18 items)
npm run seed

# 5. run both dev servers
npm run dev
#    server  → http://localhost:5000/api/health
#    client  → http://localhost:5173
```

> **No Clerk keys?** The app runs in demo mode: authentication middleware and the sign-in gate are disabled, so you can evaluate the full flow immediately. Add keys later to switch on real auth.

## Scripts

| Command | What it does |
|---------|--------------|
| `npm run install:all` | Install root, server and client dependencies |
| `npm run dev` | Run server (`tsx watch`) + client (Vite) together |
| `npm run seed` | Seed the database (18 realistic assets) |
| `npm run build` | Type-check + build server and client |
| `npm run typecheck` | `tsc --noEmit` in both packages |
| `npm run lint` | ESLint in both packages |

## API Summary

See [docs/api_spec.md](docs/api_spec.md) for the full contract. All endpoints are behind `/api` and (when Clerk is configured) require a `Bearer` token.

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/health` | Liveness + DB state |
| GET | `/api/inventory` | List, search, filter, sort, paginate |
| GET | `/api/inventory/stats` | Atmik Stock Intelligence aggregates |
| GET | `/api/inventory/sku/:sku/check` | SKU uniqueness probe |
| GET | `/api/inventory/:id` | Asset details |
| POST | `/api/inventory` | Register asset |
| PUT | `/api/inventory/:id` | Update asset |
| DELETE | `/api/inventory/:id` | Retire asset |
| GET | `/api/barcode/:barcode` | Smart Scan lookup (value = SKU) |

## Documentation

Full engineering docs live in [docs/](docs/index.md):

- [Design / UI spec](docs/design_ui.md)
- [Tech stack](docs/tech_stack.md)
- [Architecture](docs/architecture.md)
- [System design](docs/system_design.md)
- [Edge cases](docs/edge_cases.md)
- [Constraints](docs/constraints.md)
- [API spec](docs/api_spec.md)
- [Data model](docs/data_model.md)
- [Security](docs/security.md)
- [Deployment](docs/deployment.md)
- [Project plan](docs/project_plan.md)

## Project Structure

```
├─ client/     # React + Vite frontend
├─ server/     # Express + Mongoose backend
└─ docs/       # engineering documentation
```
