function fmtMoney(n) {
  return '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function qs(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function renderAlerts() {
  const success = qs('success');
  const error = qs('error');
  const container = document.getElementById('alerts');
  if (!container) return;
  if (success) {
    container.insertAdjacentHTML('beforeend', `<div class="alert success">${success}</div>`);
  }
  if (error) {
    container.insertAdjacentHTML('beforeend', `<div class="alert error">${error}</div>`);
  }
  if (success || error) {
    const url = new URL(window.location.href);
    url.searchParams.delete('success');
    url.searchParams.delete('error');
    window.history.replaceState({}, '', url);
  }
}
