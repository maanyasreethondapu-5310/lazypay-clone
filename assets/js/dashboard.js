renderAlerts();

const user = Store.getUser();
const summary = Store.getSummary();
const recent = Store.listTransactions().slice(0, 5);

document.getElementById('greeting').textContent = `Hi ${user.name}, here's your credit line`;
document.getElementById('available-amount').textContent = fmtMoney(summary.availableCredit);
document.getElementById('bar-fill').style.width =
  Math.round((summary.availableCredit / summary.creditLimit) * 100) + '%';
document.getElementById('limit-label').textContent = `Limit: ${fmtMoney(summary.creditLimit)}`;
document.getElementById('used-label').textContent = `Used: ${fmtMoney(summary.usedCredit)}`;

const nextDueSection = document.getElementById('next-due-section');
if (summary.nextDueDate) {
  nextDueSection.innerHTML = `
    <div class="section-title">Next payment due</div>
    <div class="card">
      <div class="txn-row">
        <div class="txn-main">
          <div class="merchant">Total outstanding</div>
          <div class="meta">Due on ${fmtDate(summary.nextDueDate)}${summary.overdueCount > 0 ? ' · ' + summary.overdueCount + ' overdue' : ''}</div>
        </div>
        <div class="txn-right">
          <div class="amt">${fmtMoney(summary.usedCredit)}</div>
          <a href="history.html" class="badge due">View & pay</a>
        </div>
      </div>
    </div>`;
}

const recentActivity = document.getElementById('recent-activity');
if (recent.length === 0) {
  recentActivity.innerHTML = `<div class="empty">No transactions yet.<br/>Try "Pay Later" to simulate a purchase.</div>`;
} else {
  recentActivity.innerHTML = recent
    .map(
      (txn) => `
    <div class="txn-row">
      <div class="txn-main">
        <div class="merchant">${txn.merchant}</div>
        <div class="meta">${txn.category} · ${fmtDate(txn.date)}</div>
      </div>
      <div class="txn-right">
        <div class="amt">${fmtMoney(txn.amount)}</div>
        <span class="badge ${txn.status}">${txn.status}</span>
      </div>
    </div>`
    )
    .join('');
}

document.getElementById('reset-form').addEventListener('submit', (e) => {
  e.preventDefault();
  Store.resetDemo();
  window.location.href = 'index.html?success=Demo data reset.';
});
