
# Ledger — Personal Finance Tracker

A calm, daylight-clear personal finance console. Warm neutral ramp, one electric-orange accent, single local user (no auth in v1).

## Stack note
Your PRD calls out Next.js, but this Lovable project is built on **TanStack Start** (React 19 + Vite). I'll build on TanStack Start — the UX, design system, data model, and shadcn components map 1:1. Supabase comes from **Lovable Cloud** (zero-setup; same Postgres under the hood).

## Scope for v1 (this build)
Fully functional:
- **Overview** — KPI cards (Balance, Income, Expenses, Saving rate) with period deltas, spending trend bar, top-categories donut, recent transactions, goals snapshot, period selector (1Y/6M/3M/1M).
- **Transactions** — Filterable table (date range, type, category, search), add/edit dialog, detail sheet with edit + delete confirm.
- **Goals** — Card grid with progress, create/edit dialog.

Navigable shells with placeholder empty-states:
- **Account**, **Analytics**, **Budget**.

## Design system (ledger)
- Tokens in `src/styles.css` (Tailwind v4 `@theme inline`):
  - `--background` white, `--sidebar` Fog `#fafaf9`, ink ramp `#1a1a1a → #9ca3af`.
  - `--primary` electric orange `#f97316` (the single accent).
  - `--success` `#16a34a` (income/positive), `--destructive` `#dc2626`.
  - Border/ring ink-10% `#efefec`, radius 8px (14px cards, 999px pills).
- Inter Variable only (loaded via `<link>` in `__root.tsx`), 400/500/600, -0.02em tracking.
- Chart palette: `--chart-1 #f97316`, then `#525252 / #737373 / #a1a1a1`, error `#dc2626`.
- Rules enforced: max one filled CTA per view (ink-black header CTA), ghost secondaries, hairline rings instead of shadows, deltas pair color + arrow + sign.

## Layout
- 240px Fog sidebar with grouped nav (MAIN / PLAN), active item = `#f3f4f6` fill + orange icon.
- 56px sticky top bar: centered global search (⌘K hint), notifications, account menu.
- Content panel: inset white, rounded 18px left edge, 1px ink-10% ring.
- Responsive: sidebar collapses to icon rail < 1024px, drawer < 768px; KPI row 4→1 col.

## Data (Lovable Cloud / Postgres)
Tables: `profiles`, `categories`, `transactions`, `goals` — exactly as PRD specifies. No `user_id`, no RLS in v1 (single local user). `numeric(14,2)` amounts, `date` for `occurred_on`, index on `transactions(occurred_on)`. Public GRANTs so the Data API can reach them.

Seed: a starter `profiles` row + standard expense/income categories (Food, Transport, Bills, Shopping, Entertainment, Health, Salary, Freelance, Investment, Other) with lucide icon names.

Derived in queries: total balance, saving rate, top categories, goal progress.

## Components
shadcn already in the project: sidebar, card, button, table, badge, dialog, sheet, form, input, label, textarea, select, toggle-group, calendar, popover, dropdown-menu, tabs, progress, avatar, separator, scroll-area, skeleton, pagination, sonner, chart, breadcrumb. No new installs needed.

## Routes (TanStack Start)
```
src/routes/
  __root.tsx          (shell: sidebar + topbar + Outlet)
  index.tsx           → /            Overview
  transactions.tsx    → /transactions
  analytics.tsx       → /analytics   (shell)
  account.tsx         → /account     (shell)
  goals.tsx           → /goals
  budget.tsx          → /budget      (shell)
```
Each route has its own `head()` metadata.

## Server functions
- `listTransactions({ filters })`, `createTransaction`, `updateTransaction`, `deleteTransaction`
- `listCategories`
- `listGoals`, `createGoal`, `updateGoal`, `deleteGoal`
- `getOverview({ period })` — returns KPIs, deltas, trend buckets, top categories, recent txns, goals.

All via `createServerFn` reading through the authenticated supabase client (publishable key; no RLS needed in v1).

## Non-functional
- Optimistic UI on add/edit/delete (TanStack Query mutations + invalidate).
- IDR currency formatting (PRD `base_currency` default).
- Accessibility: visible focus ring, color never the sole signal, `prefers-reduced-motion` respected.

## What I'll deliver in this turn
1. Enable Lovable Cloud + migration for the 4 tables + seed categories.
2. Design tokens in `src/styles.css` + Inter via `<link>`.
3. App shell (sidebar + topbar) in `__root.tsx`.
4. Six route files (3 full, 3 shells).
5. Server functions + TanStack Query wiring.
6. Components: KPI card, period selector, spending-trend chart, top-categories donut, recent-transactions list, goals progress, transactions table + add/edit dialog + detail sheet, goal card + dialog.

Out of scope (deferred): Auth, bank sync, multi-currency, recurring txns, Budget logic, deep Analytics charts beyond shells.
