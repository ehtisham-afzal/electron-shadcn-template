# Product Roadmap

Updated: 2025-10-18

Legend:
- ✅ Done
- 🛠️ In progress
- ⏭️ Planned
- 🌟 Stretch

## 0) Current state snapshot (today)

- ✅ Auth: Supabase email/password, session persistence, OTP signup support
- ✅ Local DB: per-user SQLite via better-sqlite3 + Drizzle; migrations bundled in build
- ✅ App scaffold: Electron + React 19 + Vite + ShadCN + Tailwind
- ✅ Routing/Data: TanStack Router + TanStack Query
- ✅ IPC foundation: window.api.db.initializeUser/closeUser
- ⏭️ Core CRUD UIs: Products, Customers, Invoices (+ returns)
- ⏭️ Basic Reports: Sales summary by date/product/customer
- ⏭️ Hardening: Preload typing, minimal IPC surface docs, zod validation at boundaries
- ⏭️ Packaging: Windows installer flow, auto-update channel
- ⏭️ Phase 1.1 features: Sync (LWW), CSV/PDF/XLS exports, manual backup/import

Reference: see docs/PRD.md and docs/MVP.md for scope/criteria.

## 1) Release plan

### v1.0.0 (MVP: Offline billing) — 2–3 weeks
- Products CRUD (SKU unique, stock_qty) — UI + IPC + schema constraints
- Customers CRUD — UI + IPC
- Invoices (sale/purchase/return) — totals calc, stock_movements, draft → saved
- Sales summary report — filter by date, product, customer
- Settings: theme switch
- Reliability: logging, basic error handling, DB corruption recovery path
- Packaging: Windows installer, app starts < 3s
- Security: contextIsolation on, no nodeIntegration, minimal IPC surface

Acceptance: All MVP stories in docs/MVP.md pass offline.

### v1.1.0 (Sync + Export) — +2 weeks
- Background sync service (main): push/pull by updated_at, tombstones, LWW
- Manual “Sync now” button and status indicator
- CSV export (products, customers, invoices); JSON backup/import
- PDF invoice export (template) via jsPDF or @react-pdf/renderer
- Basic conflict resolution UX (last-write-wins surfaced)

### v1.2.0 (POS + Barcode) — +3 weeks
- POS screen (fast item add, keyboard-first)
- Barcode scanning input support
- Printable invoice template improvement

### v1.3.0 (Roles + Multi-branch groundwork) — +3 weeks
- Roles/permissions (viewer/cashier/manager) scope and enforcement
- Data model additions for branch_id (no cross-branch sharing yet)
- Branch selector and isolation rules

### v1.4.0 (Cloud Dashboard preview) — +3 weeks
- Read-only web dashboard for sales and inventory
- Basic auth integration with Supabase

### v1.5+ (Accounting/ledgers, WhatsApp, E‑Way Bill, Android) — ongoing
- Iterative delivery based on usage data and feedback

Note: Dates are indicative for planning; re-baseline after v1.0.0.

## 2) Milestone breakdown (matches MVP.md)

- M0 Foundations: Auth + per-user DB + schema/migrations
- M1 Products & Customers: CRUD + validation + IPC + tests
- M2 Invoices: sales/purchase/return + totals + stock movements + tests
- M3 Reports: sales summary + filters + tests
- M4 Polish & Packaging: logging, error states, installer, update channel

## 3) Dependencies and enablers

- Drizzle schema completeness for products/customers/invoices/stock_movements
- Preload IPC contracts for CRUD + reports (typed, documented)
- Renderer validation with zod; main-side input guards
- Optional libs for v1.1:
  - CSV/JSON: native or small helper
  - PDF: jsPDF or @react-pdf/renderer
- Sync requires:
  - updated_at/deleted_at across tables
  - last_sync checkpoints per table
  - simple outbox or change tracking table

## 4) Risks and mitigations

- Sync complexity — keep v1.1 minimal: LWW, per-table checkpoints, tombstones
- Local encryption not ready — document limitation; plan SQLCipher/DPAPI later
- Stock integrity (returns/adjustments) — schema constraints + tests + review
- Electron attack surface — keep IPC minimal, validate inputs, sanitize outputs

## 5) KPIs per release

- v1.0: startup < 3s; invoice save < 2s; offline CRUD passes; <1% DB-op crash rate
- v1.1: >95% sync success; export/import fidelity >99%
- v1.2: POS invoice time-to-complete < 60s; barcode scan to add < 300ms

## 6) Tracking

- Roadmap items tracked as GitHub issues:
  - v1.0 label for MVP issues
  - v1.1 label for Sync/Export
  - epics: Products, Customers, Invoices, Reports, Sync, POS, Security
- Definition of Done: aligns to docs/MVP.md “DoD” + PRD success metrics
