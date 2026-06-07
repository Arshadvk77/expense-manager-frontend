# Khaleej — Gulf Expense & Income Manager (Modern)

A dual-currency ledger for Gulf workers — track salary, expenses, and savings in **AED / OMR / SAR / QAR** with live **INR** equivalents. Modern fintech UI (soft rounded cards, floating sidebar, inline sparklines, gradient charts) in a **burgundy + cream** theme. Built with **React + Vite + React Router**.

## Run

```bash
cd khaleej-modern
npm install
npm run dev
```

Opens at <http://localhost:5173>. Land on sign-in → **Continue** to enter the app.

## Scripts

| Command | Does |
| --- | --- |
| `npm run dev` | Vite dev server (hot reload) |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview the build |

## Routes (each screen is its own page)

| Path | Screen |
| --- | --- |
| `/` | Sign in — split layout |
| `/dashboard` | Highlights, net-savings chart, spending split, activity, wallets |
| `/income` | Add income — big amount + live INR card |
| `/expense` | Add expense — category cards + budget pacing |
| `/transactions` | Search, filters, AED + INR columns |
| `/reports` | KPIs, income/expense bars, category donut, savings trend |
| `/convert` | Send/receive, rate, 30-day trend, history |
| `/settings` | Profile, appearance, notifications, data |

The **floating sidebar** routes between pages and holds the primary-currency switcher (AED/OMR/SAR/QAR). Dark mode toggles from Settings. Both live in a small React context (`src/context.jsx`).

## Structure

```
khaleej-modern/
├─ index.html · package.json · vite.config.js
└─ src/
   ├─ main.jsx           ← HashRouter + AppProvider
   ├─ App.jsx            ← <Routes> (Login standalone; the rest nested in <Layout>)
   ├─ context.jsx        ← currency + dark-mode state
   ├─ styles/theme.css   ← burgundy/cream tokens + component classes
   ├─ lib/currency.js    ← FX rates, INR conversion, formatter
   ├─ components/
   │  ├─ Icon.jsx        ← stroke icon set
   │  ├─ Layout.jsx      ← floating Sidebar + Outlet + shared Topbar (exports usePage())
   │  └─ Charts.jsx      ← Sparkline, AreaChart, Bars, Donut, Ring (all inline SVG, no deps)
   └─ screens/           ← Login, Dashboard, AddIncome, AddExpense,
                            Transactions, Reports, Convert, Settings
```

## Theme

Design tokens are CSS custom properties in `src/styles/theme.css`. Dark mode = `.theme-dark` on `<html>` (set by `App.jsx` from context).

| Token | Light | Dark |
| --- | --- | --- |
| `--bg` (cream) | `#f3ece1` | `#1a1213` |
| `--wine` (burgundy) | `#7a2738` | `#c97a89` |
| `--ink` | `#2a201d` | `#f4eae5` |

Accents (warm, muted): `--gold`, `--green`, `--clay`, `--plum`, `--teal`. Type: **Plus Jakarta Sans** (UI + numbers), **JetBrains Mono** (codes/timestamps).

## Data

`src/lib/currency.js` has illustrative FX rates — wire `RATES` to a live API. Screen data is inline; lift into a data layer when you connect a backend.
