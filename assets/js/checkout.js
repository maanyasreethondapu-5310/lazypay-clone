renderAlerts();

const summary = Store.getSummary();
document.getElementById('available-amount').textContent = fmtMoney(summary.availableCredit);

document.getElementById('checkout-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const form = e.target;
  const merchant = form.merchant.value;
  const category = form.category.value;
  const amount = parseFloat(form.amount.value);

  try {
    const txn = Store.createTransaction({ merchant, category, amount });
    const message = `Paid ${fmtMoney(txn.amount)} to ${txn.merchant} using your credit line. Due ${fmtDate(txn.dueDate)}.`;
    window.location.href = `index.html?success=${encodeURIComponent(message)}`;
  } catch (err) {
    window.location.href = `checkout.html?error=${encodeURIComponent(err.message)}`;
  }
});
