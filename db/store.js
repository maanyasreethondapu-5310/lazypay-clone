// Simple file-backed "database" for the prototype.
// Good enough to demonstrate the flows without needing a real DB engine.

const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data.json');

const DEFAULT_DATA = {
  user: {
    id: 1,
    name: 'Srikar',
    creditLimit: 20000, // ₹ mock credit line
    billingCycleDays: 15, // days until a purchase's due date
    lateFeeFlat: 100 // ₹ flat late fee if a due txn goes overdue
  },
  transactions: [],
  nextTxnId: 1
};

function readDB() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(DEFAULT_DATA, null, 2));
  }
  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(raw);
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// Recompute derived status (due -> overdue) based on current time.
// Mutates and persists if anything changed.
function refreshStatuses(data) {
  const now = Date.now();
  let changed = false;
  for (const txn of data.transactions) {
    if (txn.status === 'due' && new Date(txn.dueDate).getTime() < now) {
      txn.status = 'overdue';
      changed = true;
    }
  }
  if (changed) writeDB(data);
  return data;
}

function getUser() {
  const data = refreshStatuses(readDB());
  return data.user;
}

function listTransactions() {
  const data = refreshStatuses(readDB());
  return [...data.transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
}

function getSummary() {
  const data = refreshStatuses(readDB());
  const outstanding = data.transactions
    .filter((t) => t.status === 'due' || t.status === 'overdue')
    .reduce((sum, t) => sum + t.amount + (t.lateFee || 0), 0);

  const nextDue = data.transactions
    .filter((t) => t.status === 'due' || t.status === 'overdue')
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0];

  return {
    creditLimit: data.user.creditLimit,
    usedCredit: outstanding,
    availableCredit: Math.max(data.user.creditLimit - outstanding, 0),
    nextDueDate: nextDue ? nextDue.dueDate : null,
    overdueCount: data.transactions.filter((t) => t.status === 'overdue').length
  };
}

function createTransaction({ merchant, amount, category }) {
  const data = refreshStatuses(readDB());
  const summary = getSummary(); // uses its own fresh read, fine for a prototype

  if (amount <= 0) {
    throw new Error('Amount must be greater than zero.');
  }
  if (amount > summary.availableCredit) {
    throw new Error(
      `Amount exceeds your available credit of ₹${summary.availableCredit.toLocaleString('en-IN')}.`
    );
  }

  const now = new Date();
  const dueDate = new Date(now.getTime() + data.user.billingCycleDays * 24 * 60 * 60 * 1000);

  const txn = {
    id: data.nextTxnId++,
    merchant: merchant || 'Merchant',
    category: category || 'General',
    amount: Math.round(amount * 100) / 100,
    date: now.toISOString(),
    dueDate: dueDate.toISOString(),
    status: 'due',
    lateFee: 0,
    paidDate: null
  };

  data.transactions.push(txn);
  writeDB(data);
  return txn;
}

function payTransaction(id) {
  const data = refreshStatuses(readDB());
  const txn = data.transactions.find((t) => t.id === Number(id));
  if (!txn) throw new Error('Transaction not found.');
  if (txn.status === 'paid') return txn;

  txn.status = 'paid';
  txn.paidDate = new Date().toISOString();
  writeDB(data);
  return txn;
}

function resetDemo() {
  writeDB(DEFAULT_DATA);
  return readDB();
}

module.exports = {
  getUser,
  listTransactions,
  getSummary,
  createTransaction,
  payTransaction,
  resetDemo
};
