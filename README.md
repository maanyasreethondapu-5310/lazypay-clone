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

- Plain HTML/CSS/JavaScript — no build step, no server, no framework
- `localStorage` as the "database" — data lives in your browser, easy to reset
- Plain CSS, mobile-sized layout (max-width ~430px) styled like a fintech app

This runs entirely client-side, so it's hosted directly on **GitHub Pages**:
`index.html`, `checkout.html`, and `history.html` are the three pages, and
`assets/js/store.js` holds the same credit-line logic that used to live in
the server. Open `index.html` (or the Pages URL) and go.

A previous version of this prototype used Node.js + Express + EJS with a
server-side JSON file as the "database" (`server.js`, `views/`, `db/`).
Those files are still in the repo for reference / local use:

```bash
npm install
npm start
```

Then open **http://localhost:3000**. The first run creates `db/data.json`
with a demo user who has a ₹20,000 credit limit. This is unrelated to the
static site above — the two versions don't share data.

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
