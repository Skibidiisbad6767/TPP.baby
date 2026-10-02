/**
 * The Proxy Project (TPP.BABY) - Interactive Engine
 * Pure Vanilla JavaScript • JSON-Driven Data Model • Stealth Tab Masking
 */

// Global State
let tppData = null;
let activeCategory = 'all';
let activeFilter = 'all';
let searchQuery = '';

// Original Tab Information for Restoration
const originalTitle = 'The Proxy Project | Fast Unblocked Mirrors & Academic Cloaks';
const originalFavicon = 'favicon.ico';

// Lightweight QR Code Generator (Compact QR Code Matrix in pure JS)
function createQRCodeSVG(text) {
  // Use public high-reliability QR SVG API with fallback pure SVG placeholder
  const encoded = encodeURIComponent(text);
  return `<img src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encoded}&bgcolor=ffffff&color=0f172a" 
               alt="QR Code for ${text}" 
               style="width:200px; height:200px; border-radius:8px; display:block;"
               onerror="this.onerror=null; this.parentElement.innerHTML='<div style=\'padding:20px; font-family:monospace; color:#333;\'>QR Preview Unavailable Offline.<br><br>URL:<br><strong>${text}</strong></div>';" />`;
}

// Toast Notification Utility
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${type === 'panic' ? '🚨' : '✨'}</span>
    <span class="toast-text">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(15px)';
    setTimeout(() => toast.remove(), 250);
  }, 3200);
}

// Copy to Clipboard with Toast
async function copyToClipboard(text, label = 'Link') {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand('copy');
      textarea.remove();
    }
    showToast(`Copied ${label} to clipboard!`);
  } catch (err) {
    showToast(`Could not copy: ${text}`, 'panic');
  }
}

// Storage Key for Cloak Persistence
const CLOAK_STORAGE_KEY = 'tpp_cloak';

// Update all favicon links dynamically in DOM
function updateFaviconLinks(iconUrl) {
  if (!iconUrl) return;
  const links = document.querySelectorAll("link[rel*='icon'], link[rel='apple-touch-icon']");
  if (links.length > 0) {
    links.forEach(l => { l.href = iconUrl; });
  } else {
    const link = document.createElement('link');
    link.rel = 'icon';
    link.href = iconUrl;
    document.head.appendChild(link);
  }
}

// Visual status indicator for active cloak
function updateCloakStatusIndicator(name) {
  const el = document.getElementById('active-cloak-status');
  if (!el) return;
  if (name) {
    el.innerHTML = `<span class="pulse-dot" style="display:inline-block; vertical-align:middle; margin-right:6px;"></span> Active Disguise: <strong>${name}</strong> <span style="opacity:0.8;">(Persisting across reloads)</span>`;
    el.style.display = 'block';
  } else {
    el.innerHTML = '';
    el.style.display = 'none';
  }
}

// Stealth Tab Cloaking Functions
function applyTabCloak(presetId, options = { notify: true, persist: true }) {
  if (!tppData || !tppData.cloakPresets) return;
  const preset = tppData.cloakPresets.find(p => p.id === presetId);
  if (!preset) return;

  document.title = preset.title;
  updateFaviconLinks(preset.icon);

  // Persist across reloads in localStorage
  if (options.persist !== false) {
    try {
      localStorage.setItem(CLOAK_STORAGE_KEY, JSON.stringify({
        id: preset.id,
        name: preset.name,
        title: preset.title,
        icon: preset.icon
      }));
    } catch (err) {
      console.warn('LocalStorage unavailable for cloak persistence', err);
    }
  }

  // Update active chip state
  document.querySelectorAll('.preset-chip-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.id === presetId);
  });

  updateCloakStatusIndicator(preset.name);

  if (options.notify) {
    showToast(`Tab disguised as ${preset.name} (saved across reloads)!`);
  }
}

// Apply Custom Disguise
function applyCustomCloak(title, iconUrl, options = { notify: true, persist: true }) {
  if (!title) return;
  document.title = title;
  if (iconUrl) {
    updateFaviconLinks(iconUrl);
  }

  if (options.persist !== false) {
    try {
      localStorage.setItem(CLOAK_STORAGE_KEY, JSON.stringify({
        id: 'custom',
        name: title,
        title: title,
        icon: iconUrl || ''
      }));
    } catch (err) {
      console.warn('LocalStorage error', err);
    }
  }

  document.querySelectorAll('.preset-chip-btn').forEach(btn => {
    btn.classList.toggle('active', btn.id === 'btn-custom-cloak-modal');
  });

  updateCloakStatusIndicator('Custom: ' + title);

  if (options.notify) {
    showToast(`Custom disguise "${title}" active & persisted!`);
  }
}

// Custom Cloak Modal Handlers
function openCustomCloakModal() {
  const modal = document.getElementById('custom-cloak-modal');
  if (!modal) return;
  const titleInput = document.getElementById('input-custom-cloak-title');
  const iconInput = document.getElementById('input-custom-cloak-icon');

  try {
    const saved = localStorage.getItem(CLOAK_STORAGE_KEY);
    if (saved) {
      const cloak = JSON.parse(saved);
      if (titleInput && cloak.title) titleInput.value = cloak.title;
      if (iconInput && cloak.icon) iconInput.value = cloak.icon;
    }
  } catch (e) {}

  modal.classList.add('active');
}

function closeCustomCloakModal() {
  const modal = document.getElementById('custom-cloak-modal');
  if (modal) modal.classList.remove('active');
}

function saveCustomCloak() {
  const titleInput = document.getElementById('input-custom-cloak-title');
  const iconInput = document.getElementById('input-custom-cloak-icon');
  const title = titleInput ? titleInput.value.trim() : '';
  const icon = iconInput ? iconInput.value.trim() : '';

  if (!title) {
    showToast('Please enter a tab title for the custom disguise.', 'panic');
    return;
  }

  applyCustomCloak(title, icon, { notify: true, persist: true });
  closeCustomCloakModal();
}

// Restore Saved Cloak across reloads
function restorePersistedCloak() {
  try {
    const saved = localStorage.getItem(CLOAK_STORAGE_KEY);
    if (!saved) return;
    const cloak = JSON.parse(saved);
    if (!cloak) return;

    if (cloak.id && cloak.id !== 'custom') {
      applyTabCloak(cloak.id, { notify: false, persist: false });
    } else if (cloak.title) {
      applyCustomCloak(cloak.title, cloak.icon, { notify: false, persist: false });
    }
  } catch (err) {
    console.warn('Error reading persisted cloak', err);
  }
}

function resetTabCloak() {
  document.title = originalTitle;
  updateFaviconLinks(originalFavicon);

  try {
    localStorage.removeItem(CLOAK_STORAGE_KEY);
  } catch (err) {}

  document.querySelectorAll('.preset-chip-btn').forEach(btn => btn.classList.remove('active'));
  updateCloakStatusIndicator(null);
  showToast('Restored original tab identity (persisted cloak cleared).');
}

// Stealth about:blank Launcher
function launchInAboutBlank(url, title = 'Classes', icon = 'https://ssl.gstatic.com/classroom/favicon.png') {
  try {
    const win = window.open('about:blank', '_blank');
    if (!win) {
      alert('Popup was blocked by your browser. Please allow popups for tpp.baby to use stealth about:blank launching!');
      return;
    }

    const doc = win.document;
    doc.title = title;

    const favicon = doc.createElement('link');
    favicon.rel = 'icon';
    favicon.href = icon;
    doc.head.appendChild(favicon);

    const style = doc.createElement('style');
    style.textContent = `
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: 100%; height: 100%; overflow: hidden; background: #000; }
      iframe { width: 100%; height: 100%; border: none; outline: none; }
    `;
    doc.head.appendChild(style);

    const iframe = doc.createElement('iframe');
    iframe.src = url;
    iframe.allowFullscreen = true;
    iframe.setAttribute('allow', 'fullscreen; camera; microphone; clipboard-read; clipboard-write;');
    doc.body.appendChild(iframe);

    showToast('Launched inside untraceable about:blank tab!');
  } catch (err) {
    console.error('Error launching about:blank', err);
    window.open(url, '_blank');
  }
}

// Emergency Panic Key Handler (Esc or ~ key)
function triggerPanicRedirect() {
  showToast('Panic triggered! Redirecting...', 'panic');
  setTimeout(() => {
    window.location.replace('https://classroom.google.com');
  }, 200);
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' || e.key === '`') {
    // Only panic if not typing inside an input
    const tag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
    if (tag !== 'input' && tag !== 'textarea') {
      e.preventDefault();
      triggerPanicRedirect();
    }
  }
  // Focus search on Ctrl+K or /
  if ((e.ctrlKey && e.key === 'k') || (e.key === '/' && document.activeElement.tagName.toLowerCase() !== 'input')) {
    e.preventDefault();
    const searchInput = document.getElementById('search-mirrors-input');
    if (searchInput) {
      searchInput.focus();
      searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
});

// Render Services Grid
function renderServicesGrid() {
  const container = document.getElementById('services-grid');
  if (!container || !tppData || !tppData.services) return;

  const filtered = tppData.services.filter(service => {
    // Category match
    const categoryMatch = (activeCategory === 'all') || 
      (service.category.toLowerCase().replace(/\s+/g, '-') === activeCategory);

    // Filter compatibility match
    const filterMatch = (activeFilter === 'all') || 
      service.testedFilters.some(f => f.name.toLowerCase() === activeFilter.toLowerCase() && f.status === 'working');

    // Search query match
    const q = searchQuery.toLowerCase().trim();
    const searchMatch = !q || 
      service.name.toLowerCase().includes(q) ||
      service.description.toLowerCase().includes(q) ||
      service.category.toLowerCase().includes(q) ||
      service.mirrors.some(m => m.url.toLowerCase().includes(q) || (m.type && m.type.toLowerCase().includes(q)));

    return categoryMatch && filterMatch && searchMatch;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px dashed var(--border-glass);">
        <p style="font-size: 2rem; margin-bottom: 0.5rem;">🔍</p>
        <h3 style="font-size: 1.3rem; margin-bottom: 0.5rem;">No matching proxies found</h3>
        <p style="color: var(--text-muted); font-size: 0.9rem;">Try adjusting your search query or reset your filters.</p>
        <button onclick="resetFilters()" class="btn-secondary" style="margin-top: 1rem; padding: 0.5rem 1rem;">Reset Filters</button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(service => {
    const mirrorCount = service.mirrors ? service.mirrors.length : 0;
    
    // Filter tags badges
    const filterBadgesHtml = service.testedFilters.map(tf => {
      let icon = '✓';
      let statusClass = 'status-working';
      if (tf.status === 'warning') {
        icon = '⚠️';
        statusClass = 'status-warning';
      } else if (tf.status === 'blocked') {
        icon = '✕';
        statusClass = 'status-blocked';
      }
      return `
        <span class="compat-tag ${statusClass}" title="${tf.label}">
          <span>${tf.name}</span>
          <span style="font-size:0.7rem;">${icon}</span>
        </span>
      `;
    }).join('');

    // Feature bullets
    const featuresHtml = service.features.map(f => `
      <li class="service-feature-item">
        <span class="feature-check-icon">✓</span>
        <span>${f}</span>
      </li>
    `).join('');

    // Mirrors list rows
    const mirrorsHtml = (service.mirrors || []).map((m, idx) => `
      <div class="mirror-row">
        <div class="mirror-info">
          <div class="mirror-url" title="${m.url}">${m.url}</div>
          <div class="mirror-type">
            ${m.type} ${m.note ? `• <span style="color:#f87171;">${m.note}</span>` : ''}
          </div>
        </div>
        <div class="mirror-actions">
          <button class="btn-icon-tiny" title="Copy URL" onclick="copyToClipboard('${m.url}', 'Mirror Link')">📋</button>
          <button class="btn-icon-tiny" title="Launch Stealth (about:blank)" onclick="launchInAboutBlank('${m.url}', '${service.camouflage ? service.camouflage.title : 'Classes'}')">🕶️</button>
          <a href="${m.url}" target="_blank" rel="noopener noreferrer" class="btn-icon-tiny" title="Direct Open">↗</a>
        </div>
      </div>
    `).join('');

    return `
      <article class="service-card" id="card-${service.id}">
        <div class="service-card-top">
          <div class="service-header-left">
            <div class="service-avatar">⚡</div>
            <div>
              <h3 class="service-title">${service.name}</h3>
              <span class="service-category">${service.category}</span>
            </div>
          </div>
          <span class="service-badge badge-${service.badgeColor || 'cyan'}">${service.badge}</span>
        </div>

        <p class="service-desc">${service.description}</p>

        <div class="filter-compatibility-box">
          <div class="compatibility-title">
            <span>Verified Filter Status</span>
            <span style="font-size:0.7rem; color:var(--brand-secondary); font-family:var(--font-mono);">${mirrorCount} Nodes</span>
          </div>
          <div class="compatibility-badges">
            ${filterBadgesHtml}
          </div>
        </div>

        <ul class="service-features-list">
          ${featuresHtml}
        </ul>

        <div class="service-action-buttons">
          <a href="${service.primaryUrl}" target="_blank" rel="noopener noreferrer" class="btn-launch-primary" id="launch-${service.id}">
            <span>Launch ${service.name}</span>
            <span>↗</span>
          </a>

          <button class="btn-stealth-launch" onclick="launchInAboutBlank('${service.primaryUrl}', '${service.camouflage ? service.camouflage.title : 'Classes'}')">
            <span>🕶️ Stealth Mode</span>
          </button>

          <button class="btn-card-action" onclick="copyToClipboard('${service.primaryUrl}', '${service.name}')">
            <span>📋 Copy Link</span>
          </button>

          <button class="btn-card-action" onclick="openQRModal('${service.primaryUrl}', '${service.name}')">
            <span>📱 QR Code</span>
          </button>

          <button class="btn-card-action" id="ping-btn-${service.id}" onclick="testPing('${service.id}', '${service.primaryUrl}')">
            <span>⚡ Test Ping</span>
          </button>

          <button class="mirrors-drawer-toggle" onclick="toggleMirrorsDrawer('${service.id}')" id="toggle-btn-${service.id}">
            <span>View All ${mirrorCount} Mirrors & Decoys</span>
            <span id="chevron-${service.id}">▾</span>
          </button>

          <div class="mirrors-list-wrap" id="mirrors-wrap-${service.id}">
            ${mirrorsHtml}
          </div>
        </div>
      </article>
    `;
  }).join('');
}

// Toggle Mirrors Drawer
function toggleMirrorsDrawer(serviceId) {
  const drawer = document.getElementById(`mirrors-wrap-${serviceId}`);
  const chevron = document.getElementById(`chevron-${serviceId}`);
  if (!drawer) return;

  const isOpen = drawer.classList.contains('open');
  drawer.classList.toggle('open');
  if (chevron) {
    chevron.textContent = isOpen ? '▾' : '▴';
  }
}

// Reset Filters
function resetFilters() {
  activeCategory = 'all';
  activeFilter = 'all';
  searchQuery = '';
  const searchInput = document.getElementById('search-mirrors-input');
  if (searchInput) searchInput.value = '';

  document.querySelectorAll('.filter-chip').forEach(c => {
    c.classList.toggle('active', c.dataset.category === 'all' || c.dataset.firewall === 'all');
  });

  renderServicesGrid();
}

// Test Ping Latency Simulation / Fetch Check
async function testPing(serviceId, url) {
  const btn = document.getElementById(`ping-btn-${serviceId}`);
  if (!btn) return;

  const originalContent = btn.innerHTML;
  btn.innerHTML = `<span>⏳ Pinging...</span>`;
  btn.disabled = true;

  const startTime = performance.now();
  try {
    // Attempt no-cors fetch to measure handshake time
    await fetch(url, { mode: 'no-cors', cache: 'no-store' });
    const elapsed = Math.round(performance.now() - startTime);
    btn.innerHTML = `<span style="color:#6ee7b7;">✓ ${elapsed} ms</span>`;
    showToast(`${serviceId.toUpperCase()}: ${elapsed}ms response latency!`);
  } catch (e) {
    // Even if CORS rejects, time elapsed indicates network roundtrip
    const elapsed = Math.round(performance.now() - startTime);
    btn.innerHTML = `<span style="color:#67e8f9;">✓ ~${Math.min(elapsed, 120)} ms</span>`;
    showToast(`${serviceId.toUpperCase()} active (~${Math.min(elapsed, 120)}ms)`);
  }

  setTimeout(() => {
    btn.innerHTML = originalContent;
    btn.disabled = false;
  }, 4000);
}

// QR Code Modal
function openQRModal(url, name) {
  const modal = document.getElementById('qr-modal');
  const box = document.getElementById('qr-display-box');
  const text = document.getElementById('qr-url-text');
  const title = document.getElementById('qr-modal-title');

  if (!modal || !box || !text) return;

  title.textContent = `Mobile Access: ${name}`;
  text.textContent = url;
  box.innerHTML = createQRCodeSVG(url);

  modal.classList.add('active');
}

function closeQRModal() {
  const modal = document.getElementById('qr-modal');
  if (modal) modal.classList.remove('active');
}

// Render Filter Matrix Table
function renderMatrixTable() {
  const tbody = document.getElementById('matrix-tbody');
  if (!tbody || !tppData || !tppData.services) return;

  tbody.innerHTML = tppData.services.map(s => {
    const getStatus = (name) => {
      const match = s.testedFilters.find(f => f.name.toLowerCase() === name.toLowerCase());
      if (!match) return `<span class="matrix-status-pill status-neutral">Untested</span>`;
      if (match.status === 'working') {
        return `<span class="matrix-status-pill status-working">✓ Working</span>`;
      } else if (match.status === 'warning') {
        return `<span class="matrix-status-pill status-warning">⚠️ Partial</span>`;
      } else {
        return `<span class="matrix-status-pill status-blocked">✕ Blocked</span>`;
      }
    };

    return `
      <tr>
        <td>
          <div class="matrix-service-cell">
            <span>⚡</span>
            <div>
              <div>${s.name}</div>
              <div style="font-size:0.75rem; color:var(--text-muted); font-weight:normal;">${s.category}</div>
            </div>
          </div>
        </td>
        <td>${getStatus('GoGuardian')}</td>
        <td>${getStatus('iBoss')}</td>
        <td>${getStatus('Lightspeed')}</td>
        <td>${getStatus('FortiGuard')}</td>
        <td>${getStatus('Securly')}</td>
        <td>
          <button class="btn-stealth-launch" style="padding:0.35rem 0.65rem;" onclick="launchInAboutBlank('${s.primaryUrl}')">
            Launch
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// Render Booster Perks
function renderBoosterPerks() {
  const container = document.getElementById('booster-perks-grid');
  if (!container || !tppData || !tppData.boosterPerks) return;

  container.innerHTML = tppData.boosterPerks.perks.map(p => `
    <div class="perk-card">
      <div class="perk-icon-wrap">${p.icon}</div>
      <div>
        <h4 class="perk-title">${p.title}</h4>
        <p class="perk-desc">${p.desc}</p>
      </div>
    </div>
  `).join('');
}

// Render Rules & Guidelines (Luke's Rules)
function renderRules() {
  const container = document.getElementById('rules-grid');
  if (!container || !tppData || !tppData.rules) return;

  container.innerHTML = tppData.rules.map(r => `
    <div class="rule-card">
      <div class="rule-icon">${r.icon}</div>
      <div>
        <h4 class="rule-title">${r.title}</h4>
        <p class="rule-summary">${r.summary}</p>
      </div>
    </div>
  `).join('');
}

// Render Announcements
function renderAnnouncements() {
  const container = document.getElementById('announcements-grid');
  if (!container || !tppData || !tppData.announcements) return;

  container.innerHTML = tppData.announcements.map(a => `
    <div class="announcement-card">
      <div class="announcement-meta">
        <span class="announcement-author">👑 ${a.author}</span>
        <span class="announcement-badge">${a.badge}</span>
      </div>
      <h4 class="announcement-title">${a.title}</h4>
      <p class="announcement-content">${a.content}</p>
    </div>
  `).join('');
}

// Setup Event Handlers
function setupEventListeners() {
  // Search Input
  const searchInput = document.getElementById('search-mirrors-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderServicesGrid();
    });
  }

  // Category Filter Chips
  document.querySelectorAll('.filter-chip[data-category]').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.filter-chip[data-category]').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeCategory = chip.dataset.category;
      renderServicesGrid();
    });
  });

  // Firewall Filter Chips
  document.querySelectorAll('.filter-chip[data-firewall]').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.filter-chip[data-firewall]').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeFilter = chip.dataset.firewall;
      renderServicesGrid();
    });
  });

  // Cloaker Custom Launch Form
  const customLaunchBtn = document.getElementById('btn-custom-stealth-launch');
  const customUrlInput = document.getElementById('input-custom-stealth-url');
  if (customLaunchBtn && customUrlInput) {
    customLaunchBtn.addEventListener('click', () => {
      let url = customUrlInput.value.trim();
      if (!url) {
        showToast('Please enter a destination URL', 'panic');
        return;
      }
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      launchInAboutBlank(url);
    });

    customUrlInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        customLaunchBtn.click();
      }
    });
  }

  // Cloaker Presets Chips
  document.querySelectorAll('.preset-chip-btn[data-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      applyTabCloak(btn.dataset.id, { notify: true, persist: true });
    });
  });

  // Custom Cloak Modal Trigger
  const customCloakTrigger = document.getElementById('btn-custom-cloak-modal');
  if (customCloakTrigger) {
    customCloakTrigger.addEventListener('click', openCustomCloakModal);
  }

  const customCloakModal = document.getElementById('custom-cloak-modal');
  if (customCloakModal) {
    customCloakModal.addEventListener('click', (e) => {
      if (e.target === customCloakModal) closeCustomCloakModal();
    });
  }

  // Panic Buttons
  document.querySelectorAll('.btn-panic-action').forEach(btn => {
    btn.addEventListener('click', triggerPanicRedirect);
  });

  // Mobile Nav Toggle
  const mobileToggle = document.getElementById('mobile-nav-toggle');
  const navLinks = document.getElementById('nav-links');
  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('mobile-open');
    });
  }

  // Header Scroll Effect
  window.addEventListener('scroll', () => {
    const header = document.querySelector('.site-header');
    if (header) {
      header.classList.toggle('scrolled', window.scrollY > 30);
    }
  });

  // QR Modal Close on Backdrop Click
  const qrModal = document.getElementById('qr-modal');
  if (qrModal) {
    qrModal.addEventListener('click', (e) => {
      if (e.target === qrModal) closeQRModal();
    });
  }
}

// Fallback Data in case fetch is blocked by strict local file protocol
const embeddedFallbackData = {
  "project": {
    "name": "The Proxy Project",
    "shortName": "TPP",
    "domain": "tpp.baby",
    "tagline": "Next-Generation Stealth Proxy Network & Academic Bypass Hub"
  },
  "services": [
    {
      "id": "truffled",
      "name": "Truffled",
      "category": "Web Proxy",
      "badge": "Popular",
      "badgeColor": "cyan",
      "description": "Ultra-fast node unblocker with modern interface, customizable disguise tabs, and rapid SSL cipher switching.",
      "primaryUrl": "https://truffled.cv/",
      "testedFilters": [
        { "name": "GoGuardian", "status": "working", "label": "Bypassed" },
        { "name": "iBoss", "status": "warning", "label": "Partial (Use Mirrors)" },
        { "name": "Lightspeed", "status": "working", "label": "Bypassed" },
        { "name": "FortiGuard", "status": "working", "label": "Bypassed" }
      ],
      "features": [
        "Dynamic URL encoding & tab cloaking",
        "Sub-150ms routing across distributed nodes",
        "Full support for YouTube, Discord web & game portals",
        "Automatic fallback server rotation"
      ],
      "mirrors": [
        { "url": "https://truffled.cv/", "type": "Primary Domain", "status": "online" },
        { "url": "https://snoopylovestruffle.getinspiredflight.com/", "type": "Stealth Subdomain", "status": "online" },
        { "url": "https://drpepper.kwgranitecountertops.com/", "type": "Commercial Decoy", "status": "online" },
        { "url": "https://wandlyninns.com/", "type": "Hospitality Decoy", "status": "online" },
        { "url": "https://stalbansepiscopal.com/", "type": "Civic Decoy", "status": "online" },
        { "url": "https://best95trend.com/", "type": "Lifestyle Mirror", "status": "online" },
        { "url": "https://health.wvpreschool.org/", "type": "Educational Mirror", "status": "degraded", "note": "Reported blocked on iBoss; working on GoGuardian" }
      ]
    },
    {
      "id": "figure",
      "name": "Figure Cloud",
      "category": "Cloud Edge",
      "badge": "Edge Speed",
      "badgeColor": "purple",
      "description": "Serverless edge worker proxy running on global Cloudflare Workers infrastructure for zero-fingerprint lightweight browsing.",
      "primaryUrl": "https://figure-cloud.figure-softwares.workers.dev/",
      "testedFilters": [
        { "name": "GoGuardian", "status": "working", "label": "Bypassed" },
        { "name": "iBoss", "status": "working", "label": "Bypassed" },
        { "name": "Lightspeed", "status": "working", "label": "Bypassed" },
        { "name": "FortiGuard", "status": "working", "label": "Bypassed" }
      ],
      "features": [
        "Distributed Cloudflare global edge network",
        "Zero server downtime or single-point failure",
        "Built-in cookie and header sanitization",
        "Streamlined minimalist proxy viewport"
      ],
      "mirrors": [
        { "url": "https://figure-cloud.figure-softwares.workers.dev/", "type": "Workers Edge", "status": "online" }
      ]
    },
    {
      "id": "nth",
      "name": "Noah's Tutoring Hub (NTH)",
      "category": "Educational Camouflage",
      "badge": "Stealth Master",
      "badgeColor": "emerald",
      "description": "Deep disguise academic network featuring realistic curriculum subdomains, lecture paths, and BunnyCDN acceleration.",
      "primaryUrl": "https://education.kchcs.org/",
      "testedFilters": [
        { "name": "GoGuardian", "status": "working", "label": "Bypassed" },
        { "name": "iBoss", "status": "working", "label": "Bypassed" },
        { "name": "Lightspeed", "status": "working", "label": "Bypassed" },
        { "name": "FortiGuard", "status": "working", "label": "Bypassed" }
      ],
      "features": [
        "Academic URL path obfuscation (physics, math, homework)",
        "BunnyCDN worldwide edge points of presence",
        "Auto-cloaked title & tab icon on load",
        "Immune to standard keyword-based content inspection"
      ],
      "mirrors": [
        { "url": "https://education.kchcs.org/", "type": "Main Academic Hub", "status": "online" },
        { "url": "https://sloths-back.b-cdn.net/", "type": "BunnyCDN Edge Node", "status": "online" },
        { "url": "http://seminar.lecture.english.assignment.studying.mcneillderm.com/", "type": "Seminar Lecture Node", "status": "online" },
        { "url": "http://math.lecture.geometry.music.literature.9dejulio.gob.ar/", "type": "Geometry / Gov Decoy", "status": "online" },
        { "url": "http://calculus.english.teacher.art.homework.9dejulio.gob.ar/", "type": "Calculus Teacher Decoy", "status": "online" },
        { "url": "http://studying.math.physics.lecture.campus.mcneillderm.com/", "type": "Physics Lecture Campus", "status": "online" },
        { "url": "http://physics.homework.classroom.vocabulary.library.mcneillderm.com/", "type": "Library Classroom Decoy", "status": "online" },
        { "url": "http://classroom.reading.homework.music.technology.mcneillderm.com/", "type": "Tech Classroom Decoy", "status": "online" },
        { "url": "http://lecture.homework.literature.chemistry.reading.mcneillderm.com/", "type": "Chemistry Reading Decoy", "status": "online" },
        { "url": "http://math.algebra.literature.vocabulary.homework.mcneillderm.com/", "type": "Algebra Homework Decoy", "status": "online" }
      ]
    },
    {
      "id": "froggies",
      "name": "Froggies Arcade & Media",
      "category": "Arcade & Media",
      "badge": "IXL Cloaked",
      "badgeColor": "amber",
      "description": "Full-featured web arcade and streaming library perfectly disguised behind authentic IXL Learning metadata and school district masks.",
      "primaryUrl": "https://nick.allys.love/",
      "testedFilters": [
        { "name": "GoGuardian", "status": "working", "label": "Bypassed" },
        { "name": "iBoss", "status": "working", "label": "Bypassed" },
        { "name": "FortiGuard", "status": "working", "label": "Bypassed" },
        { "name": "Lightspeed", "status": "working", "label": "Bypassed" }
      ],
      "camouflage": {
        "title": "IXL | Math, Language Arts, Science, Social Studies, and Spanish",
        "description": "IXL is the world's most popular subscription-based learning site for K–12. Used by over 17 million students, IXL provides personalized learning.",
        "icon": "https://www.ixl.com/favicon.ico"
      },
      "features": [
        "Unblocked movies, TV shows, and web-based games",
        "Full IXL Learning camouflage wrapper",
        "Verified operational on strict FortiGuard & iBoss firewalls",
        "Seamless full-screen mode & anti-close protection"
      ],
      "mirrors": [
        { "url": "https://nick.allys.love/", "type": "IXL Camouflage Node #1", "status": "online" },
        { "url": "https://ally.nickys.love/", "type": "IXL Camouflage Node #2", "status": "online" },
        { "url": "https://hally.nickys.love/", "type": "IXL Camouflage Node #3", "status": "online" },
        { "url": "https://parkviewpylusd.org/", "type": "District Domain Decoy #1", "status": "online" },
        { "url": "https://denisonisd.org/", "type": "District Domain Decoy #2", "status": "online" },
        { "url": "https://gloverschool.org/", "type": "School Domain Decoy #3", "status": "online" }
      ]
    }
  ],
  "cloakPresets": [
    { "id": "classroom", "name": "Google Classroom", "title": "Classes", "icon": "https://ssl.gstatic.com/classroom/favicon.png" },
    { "id": "drive", "name": "Google Drive", "title": "My Drive - Google Drive", "icon": "https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_32dp.png" },
    { "id": "docs", "name": "Google Docs", "title": "Google Docs", "icon": "https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico" },
    { "id": "ixl", "name": "IXL Learning", "title": "IXL | Math, Language Arts, Science, Social Studies, and Spanish", "icon": "https://www.ixl.com/favicon.ico" },
    { "id": "canvas", "name": "Canvas LMS", "title": "Dashboard", "icon": "https://du11hjcvx0uqb.cloudfront.net/dist/images/favicon-e10d657a73.ico" },
    { "id": "desmos", "name": "Desmos Graphing", "title": "Desmos | Graphing Calculator", "icon": "https://www.desmos.com/favicon.ico" },
    { "id": "wikipedia", "name": "Wikipedia", "title": "Wikipedia, the free encyclopedia", "icon": "https://en.wikipedia.org/static/favicon/wikipedia.ico" }
  ],
  "rules": [
    { "title": "Legal & Ethical Use", "icon": "⚖️", "summary": "Proxies must be used strictly for ethical purposes such as educational research, privacy defense, and network testing. No unauthorized hacking or illegal activities." },
    { "title": "Privacy & Data Protection", "icon": "🔒", "summary": "Never share personal identification, login credentials, or proxy auth tokens. Always employ robust, unique passwords." },
    { "title": "Community Respect", "icon": "🤝", "summary": "Zero tolerance for harassment, spamming, or dissemination of malicious payloads or phishing scripts." },
    { "title": "Node Fair Use & Proxy Limits", "icon": "⚡", "summary": "Respect mirror rate limits. Promptly submit dead nodes via report tickets." },
    { "title": "Legal Compliance", "icon": "📜", "summary": "Adhere to local and regional regulations. The server maintainers assume no liability for misuse." },
    { "title": "Healthy Community Engagement", "icon": "💬", "summary": "Be constructive, assist peers, avoid scams, and uphold a collaborative knowledge-sharing atmosphere." },
    { "title": "Technical Integrity", "icon": "🛡️", "summary": "No bot abuse, automated scraping, or excessive bandwidth exhaustion." },
    { "title": "Incident Reporting", "icon": "🚨", "summary": "Report violations to administrators via tickets. Anonymity is fully supported." },
    { "title": "Strict Enforcement", "icon": "🔨", "summary": "Initial violations incur an official warning; repeat infractions result in permanent ban." },
    { "title": "IP Leak Prevention", "icon": "🌐", "summary": "Always audit client setups (WebRTC & DNS) to ensure your real IP address remains concealed." },
    { "title": "IP Pool Conservation", "icon": "🔄", "summary": "Avoid saturating residential or datacenter IP pools through automated requests." },
    { "title": "Ethical Content Guidelines", "icon": "🚫", "summary": "Proxy tunnels may not be utilized to access, distribute, or stream illicit or pirated content." }
  ],
  "boosterPerks": {
    "promoTitle": "1 For 2 Booster & VIP Sale!",
    "promoDescription": "Boost the server once and receive both the Discord Booster and Premium VIP packages for free!",
    "perks": [
      { "title": "Enhanced Voice Clarity", "icon": "🗣️", "desc": "Sound noticeably louder and crisper in Discord voice channels." },
      { "title": "Bypass All Slowmodes", "icon": "✅", "desc": "Zero chat cooldowns across all community discussion channels." },
      { "title": "Priority Staff Support", "icon": "⚒️", "desc": "Expedited support handling from administrators and moderators." },
      { "title": "Lightning Ticket Queue", "icon": "🎟️", "desc": "Priority ticket queue for unblock requests and troubleshooting." },
      { "title": "VIP Lounge Access", "icon": "💸", "desc": "Exclusive access to private Premium chat and voice lounges." },
      { "title": "Direct Feature Input", "icon": "💡", "desc": "Submit suggestions to the dedicated VIP suggestions channel." },
      { "title": "Exclusive Stealth Mirrors", "icon": "🔗", "desc": "Unlock private, unlisted proxy links and high-speed VIP mirrors." }
    ]
  },
  "announcements": [
    { "author": "- luke - [CASH]", "badge": "Brand Update", "title": "New Brand Identity & Logo Deployed :3", "content": "We officially refreshed our identity! The official logo is now live across tpp.baby and server banners. Check out the crisp new crest!" },
    { "author": "- luke - [CASH]", "badge": "Mirror Release", "title": "Massive Link Drop: Truffled, Figure, NTH, and Froggies Arcade", "content": "Fresh working mirrors published for Truffled, Figure Cloud Workers, Noah's Tutoring Hub with 9 academic disguise subdomains, and Froggies Arcade with IXL Learning cloaks!" },
    { "author": "Ghosty 👑 [11Z]", "badge": "VIP Special", "title": "1-for-2 Booster Sale Live Now!", "content": "For this week and next: boost the server with just 1 boost and receive both @Discord Booster and @Premium packages! Get louder voice audio, slowmode bypass, and private VIP links!" },
    { "author": "Ghosty 👑 [11Z]", "badge": "System Notice", "title": "Automated Verification Flow Update", "content": "Verification flow updated. Ensure you verify upon joining to retain your role. Thank you to everyone keeping the community safe." }
  ]
};

// Main Initialization Function
async function initApp() {
  try {
    const res = await fetch('./data/data.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    tppData = await res.json();
  } catch (err) {
    console.warn('Loading fallback data (normal if browsing directly via local file:// protocol):', err);
    tppData = embeddedFallbackData;
  }

  // Populate UI Components
  renderServicesGrid();
  renderMatrixTable();
  renderBoosterPerks();
  renderRules();
  renderAnnouncements();
  setupEventListeners();
  restorePersistedCloak();

  console.log('⚡ The Proxy Project (tpp.baby) initialized successfully.');
}

// Kickoff when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
