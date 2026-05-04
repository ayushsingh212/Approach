// popup.js — Two-tab popup for Approach Scraper
// Tab 1: Quick Scan (direct LinkedIn DOM scan)
// Tab 2: Auto Pipeline (12h LinkedIn Jobs → Google → Website → DB)

// ─── Shared state ─────────────────────────────────────────────────────────────
let currentTabId = null;
let isLinkedIn = false;

// ─── Tab switching ────────────────────────────────────────────────────────────
document.getElementById('tabQuick').addEventListener('click', () => switchTab('Quick'));
document.getElementById('tabPipeline').addEventListener('click', () => switchTab('Pipeline'));

function switchTab(name) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.getElementById(`tab${name}`).classList.add('active');
  document.getElementById(`panel${name}`).classList.add('active');
}

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  currentTabId = tab?.id ?? null;
  isLinkedIn = !!(tab?.url && tab.url.includes('linkedin.com'));

  // ── Quick Scan tab init ────────────────────────────────────────────────────
  if (!isLinkedIn) {
    document.getElementById('notLinkedin').style.display = 'block';
    document.getElementById('mainUI').style.display = 'none';
  } else {
    document.getElementById('notLinkedin').style.display = 'none';
    document.getElementById('mainUI').style.display = 'block';

    // Load stored emails from background
    chrome.runtime.sendMessage({ type: 'GET_ALL_EMAILS' }, (res) => {
      if (res) {
        quickEmails = res.emails || [];
        quickScraping = res.scraping || false;
        updateScanCounter();
        renderEmails();
        if (quickScraping) setQuickUI(true);
      }
    });
  }

  // ── Auto Pipeline tab init ─────────────────────────────────────────────────
  chrome.runtime.sendMessage({ type: 'GET_STATUS' }, (res) => {
    if (!res) return;
    document.getElementById('emailCount').textContent = res.emailCount ?? '—';
    document.getElementById('lastRun').textContent = res.lastAutoScrapeAt
      ? formatRelative(res.lastAutoScrapeAt)
      : 'Never';
    document.getElementById('nextAlarm').textContent = res.nextAlarmAt
      ? formatRelative(res.nextAlarmAt)
      : 'Not scheduled';
    setGlobalBadge(res.isRunning);
  });

  // ── Speed buttons ──────────────────────────────────────────────────────────
  document.querySelectorAll('.speed-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedDelay = parseInt(btn.dataset.delay);
      document.getElementById('warningMsg').classList.toggle('show', selectedDelay < 1500);
    });
  });

  // ── Quick Scan buttons ─────────────────────────────────────────────────────
  document.getElementById('btnStart').addEventListener('click', startQuickScan);
  document.getElementById('btnStop').addEventListener('click', stopQuickScan);
  document.getElementById('btnExport').addEventListener('click', exportCSV);
  document.getElementById('btnClear').addEventListener('click', clearQuickEmails);

  // ── Pipeline buttons ───────────────────────────────────────────────────────
  document.getElementById('btnRun').addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'RUN_MANUAL' });
    setGlobalBadge(true);
    document.getElementById('btnRun').disabled = true;
    document.getElementById('btnRun').textContent = '⏳ Running…';
  });

  document.getElementById('btnClearPipeline').addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'CLEAR_DATA' }, () => {
      document.getElementById('emailCount').textContent = '0';
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// QUICK SCAN
// ═══════════════════════════════════════════════════════════════════════════════

let quickEmails = [];
let quickScraping = false;
let selectedDelay = 2500;

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'EMAIL_UPDATE') {
    if (!quickEmails.includes(message.email)) {
      quickEmails.push(message.email);
      updateScanCounter();
      addEmailToList(message.email);
    }
  }
  if (message.type === 'SCRAPE_COMPLETE') {
    quickScraping = false;
    setQuickUI(false);
    quickEmails = message.emails || quickEmails;
    updateScanCounter();
    renderEmails();
    document.getElementById('scanStatusText').textContent = `Done — ${quickEmails.length} emails found`;
  }
});

async function startQuickScan() {
  if (!currentTabId || !isLinkedIn) return;

  quickScraping = true;
  setQuickUI(true);
  document.getElementById('scanStatusText').textContent = 'Scanning…';
  chrome.runtime.sendMessage({ type: 'SET_SCRAPING', value: true });

  // Inject content script (safe to call even if already injected)
  try {
    await chrome.scripting.executeScript({
      target: { tabId: currentTabId },
      files: ['dist/content.js'],
    });
  } catch (e) { /* already injected */ }

  chrome.tabs.sendMessage(currentTabId, {
    type: 'START_LINKEDIN_EMAIL_SCAN',
    delay: selectedDelay,
  }, (res) => {
    if (chrome.runtime.lastError) {
      console.error('[Approach Popup] Content script error:', chrome.runtime.lastError.message);
      setQuickUI(false);
    }
  });
}

function stopQuickScan() {
  if (!currentTabId) return;
  quickScraping = false;
  setQuickUI(false);
  chrome.runtime.sendMessage({ type: 'SET_SCRAPING', value: false });
  chrome.tabs.sendMessage(currentTabId, { type: 'STOP_LINKEDIN_EMAIL_SCAN' });
  document.getElementById('scanStatusText').textContent = `Stopped — ${quickEmails.length} emails`;
}

function clearQuickEmails() {
  quickEmails = [];
  chrome.runtime.sendMessage({ type: 'CLEAR_EMAILS' });
  updateScanCounter();
  renderEmails();
  document.getElementById('scanStatusText').textContent = 'Ready to scan';
}

function exportCSV() {
  if (quickEmails.length === 0) return;
  const csvContent = 'Email\n' + quickEmails.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `linkedin_emails_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── UI helpers ────────────────────────────────────────────────────────────────

function setQuickUI(active) {
  document.getElementById('btnStart').disabled = active;
  document.getElementById('btnStop').disabled = !active;
  setGlobalBadge(active);
}

function setGlobalBadge(active) {
  const badge = document.getElementById('statusBadge');
  const dot = document.getElementById('statusDot');
  const label = document.getElementById('statusLabel');
  badge.className = `badge ${active ? 'badge-running' : 'badge-idle'}`;
  dot.className = `dot ${active ? 'pulse' : ''}`;
  label.textContent = active ? 'Running' : 'Idle';
}

function updateScanCounter() {
  document.getElementById('scanCounter').textContent = quickEmails.length;
  document.getElementById('btnExport').disabled = quickEmails.length === 0;
}

function renderEmails() {
  const list = document.getElementById('emailList');
  if (quickEmails.length === 0) {
    list.innerHTML = '<div class="empty-state">No emails yet.<br/>Press Start Scan to begin.</div>';
    return;
  }
  list.innerHTML = '';
  [...quickEmails].reverse().forEach(email => {
    list.appendChild(createEmailItem(email));
  });
}

function addEmailToList(email) {
  const list = document.getElementById('emailList');
  const emptyState = list.querySelector('.empty-state');
  if (emptyState) emptyState.remove();
  list.insertBefore(createEmailItem(email), list.firstChild);
}

function createEmailItem(email) {
  const item = document.createElement('div');
  item.className = 'email-item';
  item.innerHTML = `
    <div class="email-dot"></div>
    <span class="email-text" title="${email}">${email}</span>
    <button class="email-copy" title="Copy">⎘</button>
  `;
  item.querySelector('.email-copy').addEventListener('click', () => {
    navigator.clipboard.writeText(email).then(() => {
      item.querySelector('.email-copy').textContent = '✓';
      setTimeout(() => { item.querySelector('.email-copy').textContent = '⎘'; }, 1000);
    });
  });
  return item;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED UTILS
// ═══════════════════════════════════════════════════════════════════════════════

function formatRelative(isoString) {
  try {
    const diff = new Date(isoString) - Date.now();
    const abs = Math.abs(diff);
    const mins = Math.round(abs / 60000);
    const hrs  = Math.round(abs / 3600000);
    if (abs < 60000)   return diff > 0 ? 'in < 1 min' : 'just now';
    if (abs < 3600000) return diff > 0 ? `in ${mins}m` : `${mins}m ago`;
    return diff > 0 ? `in ${hrs}h` : `${hrs}h ago`;
  } catch {
    return isoString;
  }
}
