# Xidaa Discount Calculator

> **"RIDE THE ELECTRIC THUNDER"** — Official Commercial Discount, Freight Logistics & B2B Settlement Calculation Engine for **Xidaa Moto Pvt. Ltd.**

A full-stack, enterprise-grade automotive calculation and quotation application built with **React 19**, **TypeScript**, **Tailwind CSS v4**, and **Vitest**.

---

## ⚡ Core Business Capabilities

### 1. Smart Transport-Sharing Engine
- **Business Rule**: The scooter discount allowance can optionally cover **50% of the transport charge** if $S \ge H$ ($H = T \times 0.50$).
- **Battery Separation**: Battery discounts are strictly segregated and are **never** utilized to qualify or fund transport sharing.
- **Budget Integrity**: The total customer discount benefit is strictly capped by the authorized discount budget ($S + B$). No discount amount is ever counted twice.
- **Three Allocation Modes**:
  1. **Automatic Mode (Recommended)**: Automatically detects if $S \ge H$. If eligible, company absorbs 50% freight and applies remaining scooter discount $(S - H)$ to the vehicle invoice. If $S < H$, falls back safely to Full Scooter Discount on the invoice with the customer paying 100% transport.
  2. **Full Scooter Discount**: 100% of the scooter discount allowance is applied to the vehicle invoice; customer pays 100% of freight.
  3. **Share Transport**: Explicit sharing mode with live validation. If selected when $S < H$, displays an alert detailing the exact monetary deficit and offers a 1-click fallback.

### 2. Complete Catalogue Model Lineup
Populated directly from official Xidaa product literature and authorized price lists:
- **DL Models** (default ₹500 max discount):
  - `X-Single Light`
  - `X-Double Light`
- **Other Models** (default ₹1,000 max discount):
  - `X-Torvo`
  - `X-E4`
  - `X-FH (Big Activa)`
  - `X-Ozone`
  - `X-CS3`
  - `X-ORL Cheetah`
  - `X-Robox`
  - `X-Ambretta (X-Lambretta)`
  - `X-Tank`
  - `X-Yokozuna`
  - `X-Boston (X-Beta)`
  - `X-ZL-9`
  - `X-2 Wheel Loader`
  - `X-3 Wheel Loader`
  - `X-FX-K195 (CKD)`
  - `X-FS-K051 (CKD)`

### 3. Battery Variants & Separate Discount Quota
- `Without Battery` (zero battery discount)
- `60V 30Ah LFP` (additional ₹500/battery discount allowance)
- `60V 45Ah LFP` (additional ₹500/battery discount allowance)
- `60V 55Ah pouch cell` (additional ₹500/battery discount allowance)
- Strict validation ensures orders "Without Battery" never receive battery discounts.

### 4. Transport & Fleet Optimizer
- **Default Fleet Rates**:
  - 12-Scooter Truck: ₹40 / km
  - 32-Scooter Truck: ₹55 / km
  - 55-Scooter Truck: ₹65 / km
- **Smart Fleet Planner**: Automatically computes optimal multi-truck combinations for large distributor orders (e.g. 60+ scooters). Prevents distance double-counting.

### 5. Automated Verification Test Suite
- Built-in test runner for the specification scenarios:
  - **Example A**: 20 scooters, Other Model, ₹50,000 unit price, 1,000 km, 12-truck, no batteries -> ₹10,20,000 final payable.
  - **Example B**: 10 scooters, DL Model, 1,000 km, 12-truck -> $S = ₹5,000 < H = ₹20,000$, sharing ineligible, customer pays full transport.
  - **Example C**: 10 scooters, Other Model, with 10 batteries, 200 km, 12-truck -> $S = ₹10,000 \ge H = ₹4,000$, company support ₹4,000, remaining scooter discount ₹6,000, battery discount ₹5,000.
  - **Edge cases**: Zero distance, battery exclusion, strict validation.

### 6. Order History & Export
- Local persistent storage with search, filters (date, model, reference).
- Duplicate, reopen, edit, and delete saved calculations.
- One-click JSON export and import.
- Print-ready official commercial quote sheet with brand watermark: **"Internal Calculation / Subject to Approval — Not a Tax Invoice"**.

### 7. Protected Admin Rules Panel
- Passcode-protected admin settings (PIN: `9999` or `admin`).
- Configurable per-scooter discount limits, per-battery discount limits, truck capacities & rates, DL model mappings, custom base prices, and GST rules (Exclusive / Inclusive / None).

---

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript + Vite 8
- **Styling**: Tailwind CSS v4 + Lucide Icons + Canvas Confetti
- **Testing**: Vitest (`npm test`)
- **Arithmetic**: Pure integer-paise calculations preventing floating-point rounding errors.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 2. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Run Automated Tests
```bash
npm test
```

### 4. Production Build
```bash
npm run build
```

---

## 🔒 Confidentiality & Brand Compliance
*Designed exclusively for Xidaa Moto Pvt. Ltd. internal B2B commercial authorization.*
