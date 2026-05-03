// ─── Approach Lead Gen Agent — Popup Controller ───────────────────────────────

const btnRun      = document.getElementById('btnRun');
const btnClear    = document.getElementById('btnClear');
const emailCountEl= document.getElementById('emailCount');
const lastRunEl   = document.getElementById('lastRun');
const nextAlarmEl = document.getElementById('nextAlarm');
const statusBadge = document.getElementById('statusBadge');
const statusDot   = document.getElementById('statusDot');
const statusLabel = document.getElementById('statusLabel');
const footer      = document.getElementById('footer');

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRelative(isoString) {
  if (!isoString) return 'Never';
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return hrs < 24 ? `${hrs}h ago` : `${Math.floor(hrs / 24)}d ago`;
}

function formatCountdown(isoString) {
  if (!isoString) return 'Not scheduled';
  const diff = new Date(isoString).getTime() - Date.now();
  if (diff <= 0) return 'Imminent';
  const totalMins = Math.floor(diff / 60_000);
  const hrs = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  return hrs > 0 ? `in ${hrs}h ${mins}m` : `in ${mins}m`;
}

function setRunning(running) {
  if (running) {
    statusBadge.className = 'badge badge-running';
    statusDot.classList.add('pulse');
    statusLabel.textContent = 'Running…';
    btnRun.disabled = true;
    btnRun.textContent = '⏳ Running…';
  } else {
    statusBadge.className = 'badge badge-idle';
    statusDot.classList.remove('pulse');
    statusLabel.textContent = 'Idle';
    btnRun.disabled = false;
    btnRun.textContent = '▶ Run Now';
  }
}

function showFooter(msg) {
  footer.textContent = msg;
  footer.style.color = '#6ee7b7';
  setTimeout(() => {
    footer.textContent = 'Discovers tech companies via Google • Extracts emails • Syncs to DB';
    footer.style.color = '';
  }, 3000);
}

// ─── Status Refresh ───────────────────────────────────────────────────────────

function refreshStatus() {
  chrome.runtime.sendMessage({ type: 'GET_STATUS' }, (res) => {
    if (chrome.runtime.lastError || !res) {
      statusLabel.textContent = 'Error — reload extension';
      return;
    }
    emailCountEl.textContent = res.emailCount ?? 0;
    lastRunEl.textContent    = formatRelative(res.lastAutoScrapeAt);
    nextAlarmEl.textContent  = formatCountdown(res.nextAlarmAt);
    setRunning(res.isRunning);
  });
}

refreshStatus();
setInterval(refreshStatus, 5000);

// ─── Buttons ──────────────────────────────────────────────────────────────────

btnRun.addEventListener('click', () => {
  // ✅ FIXED: now sends RUN_MANUAL to match the new background.js
  chrome.runtime.sendMessage({ type: 'RUN_MANUAL' }, (res) => {
    if (chrome.runtime.lastError) {
      showFooter('❌ Error — try reloading extension');
      return;
    }
    if (res?.started) {
      setRunning(true);
      showFooter('✔ Session started — searching Google for tech companies…');
    }
  });
});

btnClear.addEventListener('click', () => {
  if (!confirm('Clear all locally stored emails?')) return;
  chrome.storage.local.set({ emailStore: {}, crawlQueue: [] }, () => {
    emailCountEl.textContent = '0';
    showFooter('✔ Store cleared.');
  });
});
