# Product Requirements Document (PRD)

## Project: Offline-First Billing Software for Retail Businesses

### Version: 1.0
### Author: Ehtisham Afzal
### Updated: 2025-10-18

***

## 1. Overview

A modern, offline-first billing and inventory management desktop application for small and mid-sized retail businesses. The app provides invoice creation, inventory management, and customer tracking with a local SQLite database and optional cloud sync.

Core philosophy: “Simplicity with Power” — modern UX, fast, minimal, and reliable.

***

## 2. Objectives

- Build a billing app optimized for local/offline-first usage.
- Provide core business tools: invoicing, stock management, customer tracking.
- Offer data safety via local-first design with optional cloud backup/sync.
- Deliver an installable Electron app for Windows (macOS/Linux later).

***

## 3. Target Users

- Mobile shops
- Pharmacies
- Jewelry
- Clothing
- Retail shop owners
- Small and medium businesses
- Users with unreliable internet connectivity
- Non-technical users who need a fast, simple billing tool

***

## 4. Key Features (MVP)

### 4.1 Core Features (MVP)

- Invoice creation (sales, purchase, returns)
- Products & inventory management (stock, stock movements)
- Customer management
- Basic reports: sales summary by date/product/customer

Moved to Phase 1.1+:
- Import/export (CSV, PDF, XLS)
- WhatsApp invoice sharing
- Barcode scanner input
- POS UI
- Accounting/ledgers
- Multi-branch data access
- E‑Way Bill

### 4.2 Offline-first Functionality

- Fully offline CRUD against a local SQLite database.
- Per-user database file initialized after authentication.

Background sync (Phase 1.1):
- Push/pull changes between local SQLite and Supabase Postgres on an interval (default 5 min).
- Conflict resolution: last-write-wins via updated_at.
- Soft deletes via deleted_at tombstones.
- Manual sync trigger in UI.

### 4.3 Backup & Sync

- Local database stored in the Electron userData directory (per user).
- Optional cloud sync with Supabase Postgres (Phase 1.1).
- Manual backup/export to .csv/.json (Phase 1.1).

### 4.4 User Management

- Supabase Auth:
  - Email/password with email OTP verification on signup.
  - Session persisted locally; auto-refresh enabled.
  - Optional OAuth providers if configured (post-MVP).
- Per-user local DB initialization on sign-in; closed on sign-out.
- No role-based restrictions in MVP (roles/permissions in Future Phases).

### 4.5 Reports

- Sales summary (by date range, product, or customer)
- Stock reports (basic)
- Exports to PDF/CSV/XLS (Phase 1.1)

***

## 5. Technical Architecture

### 5.1 App Type

- Electron Desktop App
  - Renderer: React + Vite + ShadCN UI
  - Main Process: Node.js
  - Language: TypeScript
  - ORM: Drizzle ORM

### 5.2 Database

| Layer | Database           | Library            |
| ----- | ------------------ | ------------------ |
| Local | SQLite             | better-sqlite3     |
| Cloud | Supabase Postgres  | @supabase/supabase-js |
| ORM   | Drizzle ORM        | Unified schema     |

Minimal data model (MVP):
- products: id, business_id, sku, name, price, tax_rate, stock_qty, updated_at, deleted_at
- customers: id, business_id, name, phone, email, updated_at, deleted_at
- invoices: id, business_id, customer_id, total, tax_total, status, issued_at, updated_at, deleted_at
- invoice_items: id, invoice_id, product_id, qty, unit_price, tax_rate, updated_at
- stock_movements: id, product_id, type[sale|purchase|adjustment|return], qty, ref_id, created_at
- payments (optional for MVP): id, invoice_id, method[cash|card|upi], amount, received_at, updated_at

Note: business_id reserved for future multi-branch; branch_id can be added in Phase 2.

#### Sync Model (Phase 1.1)

- Writes occur locally (offline-first).
- Background service:
  - Push new/updated local records to Supabase by table using updated_at and a simple outbox.
  - Pull remote records updated since last_sync and apply locally.
- Conflict resolution: latest timestamp wins.
- Interval: configurable (default 5 min). Manual “Sync now” button.

***

## Tech Stack Summary

| Layer             | Technology                  |
| ----------------- | --------------------------- |
| UI                | React + ShadCN + Tailwind   |
| Desktop Framework | Electron + electron-vite     |
| Routing           | TanStack Router             |
| Data Fetching     | TanStack Query              |
| State Management  | Zustand                     |
| ORM               | Drizzle ORM                 |
| Local DB          | SQLite (better-sqlite3)     |
| Cloud DB          | Supabase Postgres           |
| Auth              | Supabase Auth               |
| Build             | Vite + Electron Builder     |
| Language          | TypeScript                  |

***

## 6. UI & UX Guidelines

- Design language: ShadCN UI + Tailwind CSS
- Principles:
  - Fast keyboard operations
  - Accessible, simple forms
  - Minimal color palette (clarity-first)
  - Dark/light mode support

***

## 7. Non-Functional Requirements

- App must start in < 3s (cold start on mid-range Windows PC)
- Must run offline indefinitely
- Database corruption recovery support
- Local data security:
  - At rest: Planned encryption (SQLCipher or OS-level DPAPI/EFS)
  - In transit: HTTPS to Supabase
- Cloud sync optional and transparent (Phase 1.1)
- Electron hardening: contextIsolation, no nodeIntegration, minimal IPC surface

Appendix: IPC surface (current)
- window.api.db.initializeUser(userId)
- window.api.db.closeUser()

Planned:
- window.api.sync.push(), window.api.sync.pull()
- window.api.backup.export(), window.api.backup.import()

***

## 8. Future Phases

- Role-based user permissions
- Advanced analytics & dashboards
- Multi-branch data access (add branch_id, sharing rules)
- Cloud dashboard (web)
- Subscription-based pricing model
- Barcode generator/scanner
- POS UI
- Accounting/ledgers
- WhatsApp invoice sharing
- E‑Way Bill
- Android companion app

***

## 10. Success Metrics

- App usable fully offline (CRUD on products/customers/invoices with no network)
- Startup < 3s
- Invoice creation flow < 2s (new → save locally)
- < 10 MB install size increase per major update
- < 1% crash rate during DB operations
- Sync success rate > 95% (Phase 1.1)

***