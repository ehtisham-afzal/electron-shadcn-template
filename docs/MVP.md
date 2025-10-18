# MVP Specification v1.0

Updated: 2025-10-18

## 0. Summary
An offline-first Electron desktop app for billing and inventory. MVP includes products, customers, invoices (sales/purchase/returns), and a basic sales summary. Local-first with SQLite (better-sqlite3) and Drizzle. Auth via Supabase. Sync/export in Phase 1.1+.

## 1. Goals (MVP)
- Operate fully offline for core flows (products, customers, invoices).
- Per-user local DB initialized on sign-in.
- Fast invoice creation (<2s to save locally).
- Basic sales summary report.

Non-goals (deferred to future phases):
- Multi-branch, POS UI, accounting/ledgers, barcode, WhatsApp sharing, exports (CSV/PDF/XLS), cloud dashboard, advanced analytics.

## 2. User Stories + Acceptance Criteria

1) Sign in/out
- As a user, I can sign in with email/password and remain signed in across restarts.
- Acceptance:
  - Supabase session persists; user DB is initialized on sign-in and closed on sign-out.
  - Network loss after sign-in does not block local app usage.
  - Password reset flow available.

2) Manage products
- As a manager, I can create/update/delete products with unique SKU and stock quantity.
- Acceptance:
  - SKU uniqueness enforced locally.
  - Stock changes recorded via stock_movements.
  - Validation: required fields (name, price >= 0).

3) Manage customers
- As a manager, I can create/update/delete customers.
- Acceptance:
  - Required fields: name; optional phone/email.
  - Safe deletes (set deleted_at).

4) Create and manage invoices
- As a cashier, I can create sales, purchase, and returns invoices with line items and taxes.
- Acceptance:
  - Totals auto-calculated; cannot save with empty items or negative totals.
  - Saving an invoice updates stock_movements.
  - Returns reduce stock appropriately.
  - Draft → Saved status supported.

5) Sales summary report
- As an owner, I can view sales totals by date range and by product/customer.
- Acceptance:
  - Filters by date range; totals match saved invoices.
  - Works offline.

## 3. Scope (In/Out)

In:
- Auth (Supabase email/password + email OTP verification on signup).
- Per-user local SQLite DB, Drizzle schema/migrations.
- CRUD for products, customers, invoices (+ returns).
- Basic sales summary report.
- Light settings: theme switch.

Out (Phase 1.1+):
- Sync (Supabase Postgres push/pull, LWW), backups/exports, barcode, POS, ledgers, multi-branch, WhatsApp, E‑Way Bill.

## 4. Architecture Constraints

- Electron + React 19 + Vite + ShadCN + Tailwind.
- Routing: TanStack Router; Data fetching: TanStack Query.
- State: Zustand (UI/auth state).
- DB: better-sqlite3 + Drizzle; per-user DB file: userData/databases/user_{supabaseId}.db.
- Auth: Supabase; session persisted locally (renderer).
- IPC: Minimal, hardened; no nodeIntegration; contextIsolation enabled.

## 5. Data Model (MVP)

Common fields: id (uuid/text or int), business_id (text, reserved), updated_at (timestamp), deleted_at (nullable).

- products(id, business_id, sku UNIQUE, name, price, tax_rate, stock_qty, updated_at, deleted_at)
- customers(id, business_id, name, phone, email, updated_at, deleted_at)
- invoices(id, business_id, customer_id, type[sale|purchase|return], total, tax_total, status[draft|saved|canceled], issued_at, updated_at, deleted_at)
- invoice_items(id, invoice_id, product_id, qty, unit_price, tax_rate, updated_at)
- stock_movements(id, product_id, type[sale|purchase|adjustment|return], qty SIGNED, ref_id (invoice_id), created_at)
- user_preferences(id, supabase_id UNIQUE, theme, language, notifications, created_at, updated_at)

Validation highlights:
- price >= 0, qty > 0 for sales/purchase; returns use negative movement or explicit type=return with signed qty.
- totals: sum(invoice_items.qty*unit_price) + tax.

## 6. Screens and Routes (Renderer)

- /auth/login: email/password + sign up link + password reset.
- /dashboard: quick stats (today’s invoices/total).
- /products: list + search + CRUD.
- /products/:id: edit.
- /customers: list + search + CRUD.
- /customers/:id: edit.
- /invoices: list + filters.
- /invoices/new?sale|purchase|return: create flow.
- /invoices/:id: view/edit.
- /reports/sales: by date range, product, customer.
- /settings: theme.

UI requirements:
- Keyboard-first forms, optimistic UI where safe, loading/error states, dark/light themes.

## 7. IPC Contract (Preload/Main)

Current:
- window.api.db.initializeUser(userId): Promise<{ success: boolean; error?: string }>
- window.api.db.closeUser(): Promise<{ success: boolean; error?: string }>

MVP to add:
- window.api.products.{list, get, create, update, remove}
- window.api.customers.{list, get, create, update, remove}
- window.api.invoices.{list, get, create, update, remove}
- window.api.reports.salesSummary({ from, to, groupBy }): totals

Notes:
- Validate/normalize inputs in main before DB writes.
- Return Result-like shapes: { success, data?, error? }.
- Log and surface errors via user-friendly toasts.

Security:
- Schema-level constraints in Drizzle + runtime validation (zod) in renderer before IPC.

## 8. Performance and Reliability

- Startup < 3s (defer heavy loads until after first paint).
- Invoice save < 2s (local write).
- Handle DB corruption: backup last good copy, recreate schema, and report error.
- Structured logging for DB/IPC errors (file-based log).

## 9. Testing

Unit (renderer):
- Form validation (products, invoices).
- Totals calculation for invoices (with/without tax, returns).

Integration (main):
- Products CRUD, SKU uniqueness.
- Invoice create updates stock_movements correctly.

E2E (smoke, manual acceptable for MVP):
- Auth flow → create product → create customer → create sale invoice → verify stock and report.

Acceptance checks:
- Offline mode: disable network, run full CRUD + report.
- Persistence: restart app, data persists.

## 10. Milestones

M0: Foundations (2–3 days)
- Supabase auth wired; per-user DB init/close.
- Drizzle schema + migrations; copy migrations in build (already configured).

M1: Products & Customers (3–4 days)
- UI CRUD + validation; IPC endpoints; tests.

M2: Invoices (4–6 days)
- UI flow for sale/purchase/return; totals; stock movements; tests.

M3: Reports (2–3 days)
- Sales summary by date/product/customer; tests.

M4: Polish & Packaging (2 days)
- Error states, loading, logging, basic settings, Windows installer, auto-update channel.

## 11. Config and Commands

Environment (.env)
- VITE_SUPABASE_URL=
- VITE_SUPABASE_ANON_KEY=

Development (PowerShell):
```powershell
# install
npm ci

# typecheck and lint
npm run typecheck
npm run lint

# dev
npm run dev

# build app
npm run build
npm run build:win