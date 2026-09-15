renderAlerts();

const greetingEl = document.getElementById('greeting');
const overlay = document.getElementById('onboarding-overlay');
const onboardingTitle = document.getElementById('onboarding-title');
const nameForm = document.getElementById('name-form');
const nameInput = document.getElementById('name-input');

function showNamePrompt(isEdit) {
  onboardingTitle.textContent = isEdit ? 'Update your name' : "What's your name?";
  nameInput.value = isEdit ? Store.getUser().name || '' : '';
  overlay.classList.remove('hidden');
  nameInput.focus();
}

function hideNamePrompt() {
  overlay.classList.add('hidden');
}

nameForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = nameInput.value.trim();
  if (!name) return;
  Store.setUserName(name);
  hideNamePrompt();
  renderDashboard();
});

greetingEl.addEventListener('click', () => showNamePrompt(true));

function renderDashboard() {
  const user = Store.getUser();
  const summary = Store.getSummary();
  const recent = Store.listTransactions().slice(0, 5);

  greetingEl.innerHTML = `Hi ${user.name || 'there'}, here's your credit line <span class="edit-hint">✏️</span>`;
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
  } else {
    nextDueSection.innerHTML = '';
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
}

document.getElementById('reset-form').addEventListener('submit', (e) => {
  e.preventDefault();
  Store.resetDemo();
  window.location.href = 'index.html?success=Demo data reset.';
});

renderDashboard();
if (!Store.getUser().name) {
  showNamePrompt(false);
}
