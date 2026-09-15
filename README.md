# DueLater — Pay-Later Prototype (like LazyPay / Slice)

A basic, self-contained prototype of a "pay later" / consumer credit-line app.
It simulates the core loop: a mock credit limit, paying merchants/bills on
credit ("Pay Later"), tracking what's due, and marking dues as repaid. No
real money, KYC, or payment gateway is involved — it's for demoing the
product flow only.

## Features

- **Dashboard** — available credit, credit limit, next amount due, recent activity.
- **Pay Later checkout** — pay a merchant/bill on credit; blocked if it would exceed your available credit.
- **Statement / history** — full transaction list with status (`due`, `overdue`, `paid`) and a one-click "Mark paid" action to simulate repayment.
- **Auto overdue detection** — a `due` transaction flips to `overdue` once its due date (15 days after purchase) passes.
- **Reset demo data** — button on the dashboard to wipe transactions and start over.

## Tech

- Node.js + Express
- EJS templates (server-rendered, no build step)
- A tiny JSON file (`db/data.json`) as the "database" — easy to read/reset, swap for a real DB later
- Plain CSS, mobile-sized layout (max-width ~430px) styled like a fintech app

## Run it

```bash
npm install
npm start
```

Then open **http://localhost:3000** in your browser.

The first run creates `db/data.json` with a demo user who has a ₹20,000
credit limit. Delete that file (or click "Reset demo data" on the
dashboard) to start fresh.

## Where to extend this next

- Swap `db/store.js` for a real database (SQLite/Postgres) behind the same function signatures.
- Add real user accounts/auth instead of the single hardcoded demo user.
- Add EMI conversion (split a due amount into installments with interest).
- Add interest/late-fee calculation on overdue amounts (a flat fee field already exists on the user record).
- Add a real KYC/onboarding flow before assigning a credit limit.

## Disclaimer

This is a UI/flow prototype only. It does not process real payments, does
not connect to any bank or UPI rail, and should not be used to actually
extend credit to anyone.
