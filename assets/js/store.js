const STORAGE_KEY = 'duelater_data';

const DEFAULT_DATA = {
  user: {
    id: 1,
    name: 'Srikar',
    creditLimit: 20000,
    billingCycleDays: 15,
    lateFeeFlat: 100
  },
  transactions: [],
  nextTxnId: 1
};

function cloneDefault() {
  return JSON.parse(JSON.stringify(DEFAULT_DATA));
}

function readDB() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const fresh = cloneDefault();
    writeDB(fresh);
    return fresh;
  }
  return JSON.parse(raw);
}

function writeDB(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

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
  return refreshStatuses(readDB()).user;
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
  const summary = getSummary();

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
  writeDB(cloneDefault());
}

const Store = { getUser, listTransactions, getSummary, createTransaction, payTransaction, resetDemo };
