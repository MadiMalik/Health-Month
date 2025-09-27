# Health Month

A simple, privacy-first health journal for one month. Log daily pain, period, sleep, hydration, mood, and energy. The app shows a plain-language summary, helpful prompts for a visit, and simple charts. All data is stored locally in your browser (no server).

## Table of Contents
- [Setup](#setup)
- [Run](#run)
- [Test](#test)
- [Build](#build)
- [Technologies](#technologies)
- [Project Structure](#project-structure)

## Setup

Install project dependencies.

```bash
npm install
```

Environment variables: none required.

Notes:
- The app uses localStorage for persistence; clearing site data will remove your entries.
- Optional: If you need to change the dev server port, run `npm run dev -- --port 5174`.

## Run

Make sure that you have done the [Setup](#setup) step before proceeding.

Start the development server (Vite):

```bash
npm run dev
```

Then open the printed URL (typically http://localhost:5173) in your browser.

## Test

Make sure that you have done the [Setup](#setup) step before proceeding.

This project includes a small Jest suite for the `insights` logic.

```bash
npm test
```

Notes:
- Uses ESM and runs Jest with `NODE_OPTIONS=--experimental-vm-modules` as configured in `package.json`.
- Tests live in `src/lib/insights.test.js` and cover flags, prompts, and the printable summary text.

## Build

Make sure that you have done the [Setup](#setup) step before proceeding.

Create a production build and preview it locally:

```bash
npm run build
npm run preview
```

The built assets are output by Vite into `dist/`.

## Technologies

- React + Vite
- React Router
- Tailwind CSS
- Recharts (charts)
- Jest (unit tests for insights)

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
│   │   ├── date.js (if present)
│   │   ├── insights.js
│   │   ├── insights.test.js
│   │   └── range.js
│   └── pages/
│       ├── Journal.jsx
│       └── Summary.jsx
└── ...
```

### Printing

Use the Summary page’s “Print / Save PDF” button. Charts and text are optimized to print together. If charts extend to a new page, see `@media print` rules in `src/index.css` to adjust chart height.
