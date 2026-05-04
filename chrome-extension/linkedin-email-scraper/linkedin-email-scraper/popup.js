// popup.js - Controls the extension popup UI

let emails = [];
let scraping = false;
let selectedDelay = 2500;
let currentTabId = null;

// ── Init ───────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  currentTabId = tab.id;

  const isLinkedIn = tab.url && tab.url.includes('linkedin.com');

  if (!isLinkedIn) {
    document.getElementById('notLinkedin').style.display = 'block';
    document.getElementById('mainUI').style.display = 'none';
    return;
  }

  // Load stored emails from background
  chrome.runtime.sendMessage({ type: 'GET_ALL_EMAILS' }, (res) => {
    if (res) {
      emails = res.emails || [];
      scraping = res.scraping || false;
      updateCounter();
      renderEmails();
      if (scraping) setScrapingUI(true);
    }
  });

  // Speed buttons
  document.querySelectorAll('.speed-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedDelay = parseInt(btn.dataset.delay);
      document.getElementById('warningMsg').classList.toggle('show', selectedDelay < 1500);
    });
  });

  document.getElementById('btnStart').addEventListener('click', startScraping);
  document.getElementById('btnStop').addEventListener('click', stopScraping);
  document.getElementById('btnExport').addEventListener('click', exportCSV);
  document.getElementById('btnClear').addEventListener('click', clearAll);
});

// ── Listen for live updates ────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'EMAIL_UPDATE') {
    if (!emails.includes(message.email)) {
      emails.push(message.email);
      updateCounter();
      addEmailToList(message.email);
    }
  }

  if (message.type === 'SCRAPE_COMPLETE') {
    scraping = false;
    setScrapingUI(false);
    emails = message.emails || emails;
    updateCounter();
    renderEmails();
  }
});

// ── Start scraping ─────────────────────────────────────────────────────────
async function startScraping() {
  if (!currentTabId) return;

  scraping = true;
  setScrapingUI(true);
  chrome.runtime.sendMessage({ type: 'SET_SCRAPING', value: true });

  // Inject content script just in case it's not there
  try {
    await chrome.scripting.executeScript({
      target: { tabId: currentTabId },
      files: ['content.js']
    });
  } catch (e) {
    // Already injected, that's fine
  }

  chrome.tabs.sendMessage(currentTabId, {
    type: 'START_SCRAPE',
    delay: selectedDelay
  }, (res) => {
    if (chrome.runtime.lastError) {
      console.error('Could not connect to content script:', chrome.runtime.lastError.message);
      setScrapingUI(false);
    }
  });
}

// ── Stop scraping ──────────────────────────────────────────────────────────
function stopScraping() {
  if (!currentTabId) return;
  scraping = false;
  setScrapingUI(false);
  chrome.runtime.sendMessage({ type: 'SET_SCRAPING', value: false });
  chrome.tabs.sendMessage(currentTabId, { type: 'STOP_SCRAPE' });
}

// ── Clear all ──────────────────────────────────────────────────────────────
function clearAll() {
  emails = [];
  chrome.runtime.sendMessage({ type: 'CLEAR_EMAILS' });
  updateCounter();
  renderEmails();
}

// ── Export CSV ─────────────────────────────────────────────────────────────
function exportCSV() {
  if (emails.length === 0) return;

  const csvContent = 'Email\n' + emails.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `linkedin_emails_${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── UI helpers ─────────────────────────────────────────────────────────────
function setScrapingUI(active) {
  const dot = document.getElementById('statusDot');
  const label = document.getElementById('statusLabel');
  const btnStart = document.getElementById('btnStart');
  const btnStop = document.getElementById('btnStop');

  dot.classList.toggle('active', active);
  label.classList.toggle('active', active);
  label.innerHTML = `<div class="status-dot ${active ? 'active' : ''}"></div>${active ? 'SCRAPING...' : 'IDLE'}`;
  btnStart.disabled = active;
  btnStop.disabled = !active;
}

function updateCounter() {
  document.getElementById('counter').textContent = emails.length;
  document.getElementById('btnExport').disabled = emails.length === 0;
}

function renderEmails() {
  const list = document.getElementById('emailList');

  if (emails.length === 0) {
    list.innerHTML = '<div class="empty-state">No emails yet.<br/>Press START to begin.</div>';
    return;
  }

  list.innerHTML = '';
  // Show newest first
  [...emails].reverse().forEach(email => {
    list.appendChild(createEmailItem(email));
  });
}

function addEmailToList(email) {
  const list = document.getElementById('emailList');
  const emptyState = list.querySelector('.empty-state');
  if (emptyState) emptyState.remove();

  const item = createEmailItem(email);
  list.insertBefore(item, list.firstChild); // prepend (newest first)
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
