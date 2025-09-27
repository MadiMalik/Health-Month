# Health Month

A simple, privacy-first health journal built with React and Node.

Log daily signals like pain, period, sleep, hydration, mood, and energy. The app generates:

- A plain-language monthly summary
- Helpful doctor prompts
- Simple visual charts
- One-click export (Copy / Print / Save to PDF)

By default, all data stays in your browser (localStorage). You can optionally enable a small Express API for cross-device use.

Live demo: https://health-month.netlify.app/

---

## Table of Contents

- [Health Month](#health-month)
  - [Table of Contents](#table-of-contents)
  - [Description](#description)
  - [Setup](#setup)
  - [Run](#run)
  - [Test](#test)
  - [Build](#build)
  - [API](#api)
  - [Server-backed Mode](#server-backed-mode)
  - [Technologies](#technologies)
  - [Project Structure](#project-structure)
  - [Privacy](#privacy)

---

## Description

Health Month is designed to empower women with clear, organized health information to support better doctor conversations. It’s an educational demo, not medical advice.

Key features:

- Daily entry logging (period, pain, sleep, hydration, BP, mood, energy, notes)
- 30-day insights: typical pain, trends, simple correlations (e.g., sleep vs pain)
- Charts: pain trend, sleep/pain scatter, mood by period, energy by period
- Export: plain text or PDF, with charts and text in a print-ready layout
- Privacy-first: data stays local unless you enable your own API server

---

## Setup

Install project dependencies:

```bash
npm install
```

Environment variables:

- None required for local-only mode.
- To enable server-backed mode, see [Server-backed Mode](#server-backed-mode).

Notes:

- The app uses localStorage for persistence in local-only mode.
- Clearing site data will remove your entries.
- Optional: change the dev port with `npm run dev -- --port 5174`.

---

## Run

Make sure that you have done the [Setup](#setup) step before proceeding.

Start the development server (Vite):

```bash
npm run dev
```

Open the printed URL (typically http://localhost:5173) in your browser.

Start the optional API server:

```bash
npm run server
# Default: http://localhost:4000  (set PORT to override)
```

---

## Test

Make sure that you have done the [Setup](#setup) step before proceeding.

Run the Jest suite for the insights logic:

```bash
npm test
```

Notes:

- Tests cover summary flags, prompts, and printable text.
- Located in `src/lib/insights.test.js`.
- Jest runs in ESM mode with `NODE_OPTIONS=--experimental-vm-modules`.

---

## Build

Make sure that you have done the [Setup](#setup) step before proceeding.

Create a production build and preview it locally:

```bash
npm run build
npm run preview
```

The build outputs static assets into `dist/`.

---

## API

The optional Express API provides persistence and cross-device sync.

Endpoints:

- POST `/entries` — add a single entry
- POST `/entries/bulk` — add multiple entries
- GET `/entries` — list all entries
- GET `/summary` — return summary using the same logic as the client
- PUT `/entries/:id` — update entry
- DELETE `/entries/:id` — delete entry

Data is persisted to `server/data/entries.json`.

Run the API server:

```bash
npm run server
```

---

## Server-backed Mode

Make sure that you have done the [Setup](#setup) step before proceeding.

1) Start the API server:

```bash
npm run server
```

2) Create `.env.local` in the project root:

```env
VITE_API_URL=http://localhost:4000
```

3) Restart dev server:

```bash
npm run dev
```

Behavior in server-backed mode:

- Client loads entries from `GET /entries`.
- Changes are synced to your server (optimistic UI, local cache).
- You can still print/export locally.

---

## Technologies

- Frontend: React, Vite, React Router, Tailwind CSS, Recharts
- Backend (optional): Node.js, Express
- Testing: Jest (insights logic)

---

## Project Structure

```
health-month/
├── index.html
├── package.json
├── tailwind.config.js
├── src/
│   ├── App.jsx
│   ├── index.css
│   ├── main.jsx
│   ├── components/
│   │   ├── Charts.jsx
│   │   ├── EntryForm.jsx
│   │   └── EntryList.jsx
│   ├── hooks/
│   │   └── useEntries.js
│   ├── lib/
│   │   ├── insights.js
│   │   ├── insights.test.js
│   │   └── range.js
│   └── pages/
│       ├── Journal.jsx
│       └── Summary.jsx
└── server/
    └── index.js
```

Printing:

- Use Print / Save PDF on the Summary page.
- Charts print in a 2×2 grid alongside text.
- Chart height adjustable in `src/index.css` print styles.

---

## Privacy

- Local-only mode: data saved in localStorage (`health_month_entries_v1`).
- No analytics, no third-party services.
- A `sessionId` (`health_month_session_id`) is generated but not transmitted.
- Server-backed mode is opt-in; if enabled, data is stored in `server/data/entries.json`.

---
