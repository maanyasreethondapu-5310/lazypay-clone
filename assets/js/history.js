renderAlerts();

function render() {
  const transactions = Store.listTransactions();
  const list = document.getElementById('transaction-list');

  if (transactions.length === 0) {
    list.innerHTML = `<div class="empty">No transactions yet.<br/>Try "Pay Later" to simulate a purchase.</div>`;
    return;
  }

  list.innerHTML = transactions
    .map((txn) => {
      const dateInfo =
        txn.status !== 'paid' ? `· due ${fmtDate(txn.dueDate)}` : `· paid ${fmtDate(txn.paidDate)}`;
      const payButton =
        txn.status !== 'paid'
          ? `<form class="pay-inline" data-id="${txn.id}"><button type="submit" class="btn small">Mark paid</button></form>`
          : '';
      return `
      <div class="txn-row">
        <div class="txn-main">
          <div class="merchant">${txn.merchant}</div>
          <div class="meta">${txn.category} · ${fmtDate(txn.date)} ${dateInfo}</div>
        </div>
        <div class="txn-right">
          <div class="amt">${fmtMoney(txn.amount)}</div>
          <span class="badge ${txn.status}">${txn.status}</span>
          ${payButton}
        </div>
      </div>`;
    })
    .join('');

  list.querySelectorAll('form.pay-inline').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      try {
        const txn = Store.payTransaction(form.dataset.id);
        const message = `Marked ${fmtMoney(txn.amount)} to ${txn.merchant} as paid.`;
        window.location.href = `history.html?success=${encodeURIComponent(message)}`;
      } catch (err) {
        window.location.href = `history.html?error=${encodeURIComponent(err.message)}`;
      }
    });
  });
}

render();
