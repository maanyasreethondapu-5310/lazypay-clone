const express = require('express');
const path = require('path');
const store = require('./db/store');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

function fmtMoney(n) {
  return '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });
}
function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
app.locals.fmtMoney = fmtMoney;
app.locals.fmtDate = fmtDate;

// ---- Dashboard ----
app.get('/', (req, res) => {
  const user = store.getUser();
  const summary = store.getSummary();
  const recent = store.listTransactions().slice(0, 5);
  res.render('dashboard', {
    user,
    summary,
    recent,
    error: req.query.error,
    success: req.query.success
  });
});

// ---- Pay-later checkout ----
app.get('/checkout', (req, res) => {
  const summary = store.getSummary();
  res.render('checkout', { summary, error: req.query.error });
});

app.post('/checkout', (req, res) => {
  const { merchant, amount, category } = req.body;
  try {
    const txn = store.createTransaction({
      merchant,
      category,
      amount: parseFloat(amount)
    });
    res.redirect(
      `/?success=${encodeURIComponent(
        `Paid ${fmtMoney(txn.amount)} to ${txn.merchant} using your credit line. Due ${fmtDate(txn.dueDate)}.`
      )}`
    );
  } catch (err) {
    res.redirect(`/checkout?error=${encodeURIComponent(err.message)}`);
  }
});

// ---- Transaction history ----
app.get('/history', (req, res) => {
  const transactions = store.listTransactions();
  res.render('history', { transactions, success: req.query.success });
});

app.post('/transactions/:id/pay', (req, res) => {
  try {
    const txn = store.payTransaction(req.params.id);
    res.redirect(`/history?success=${encodeURIComponent(`Marked ${fmtMoney(txn.amount)} to ${txn.merchant} as paid.`)}`);
  } catch (err) {
    res.redirect(`/history?error=${encodeURIComponent(err.message)}`);
  }
});

// ---- Reset demo data ----
app.post('/reset', (req, res) => {
  store.resetDemo();
  res.redirect('/?success=Demo data reset.');
});

app.listen(PORT, () => {
  console.log(`DueLater prototype running at http://localhost:${PORT}`);
});
