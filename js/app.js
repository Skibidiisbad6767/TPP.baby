/**
 * The Proxy Project (tpp.baby) - Shared Application Logic
 * Clean, lightweight, multi-page engine with persistent tab cloaking.
 */

// Global State
let tppData = null;
let activeCategory = 'all';
let activeFilter = 'all';
let searchQuery = '';

const CLOAK_STORAGE_KEY = 'tpp_cloak';
const originalTitle = 'The Proxy Project | tpp.baby';
const originalFavicon = 'favicon.ico';

// Update all favicon links in DOM
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
    el.innerHTML = `<span class="pulse-dot"></span> Active Disguise: <strong>${name}</strong> (saved across reloads)`;
    el.style.display = 'flex';
  } else {
    el.innerHTML = '';
    el.style.display = 'none';
  }
}

// Toast Notifications
function showToast(message) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 200);
  }, 2800);
}

// Copy to Clipboard
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
    showToast(`Could not copy link`);
  }
}

// Apply Tab Cloak Preset
function applyTabCloak(presetId, options = { notify: true, persist: true }) {
  if (!tppData || !tppData.cloakPresets) return;
  const preset = tppData.cloakPresets.find(p => p.id === presetId);
  if (!preset) return;

  document.title = preset.title;
  updateFaviconLinks(preset.icon);

  if (options.persist !== false) {
    try {
      localStorage.setItem(CLOAK_STORAGE_KEY, JSON.stringify({
        id: preset.id,
        name: preset.name,
        title: preset.title,
        icon: preset.icon
      }));
    } catch (err) {
      console.warn('LocalStorage error', err);
    }
  }

  document.querySelectorAll('.preset-chip[data-id]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.id === presetId);
  });

  updateCloakStatusIndicator(preset.name);

  if (options.notify) {
    showToast(`Disguised as ${preset.name} (persisted)`);
  }
}

// Apply Custom Cloak
function applyCustomCloak(title, iconUrl, options = { notify: true, persist: true }) {
  if (!title) return;
  document.title = title;
  if (iconUrl) updateFaviconLinks(iconUrl);

  if (options.persist !== false) {
    try {
      localStorage.setItem(CLOAK_STORAGE_KEY, JSON.stringify({
        id: 'custom',
        name: title,
        title: title,
        icon: iconUrl || ''
      }));
    } catch (err) {}
  }

  document.querySelectorAll('.preset-chip').forEach(btn => {
    btn.classList.toggle('active', btn.id === 'btn-custom-cloak-modal');
  });

  updateCloakStatusIndicator('Custom: ' + title);

  if (options.notify) {
    showToast(`Custom disguise "${title}" applied!`);
  }
}

// Restore Persisted Cloak on load
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
  } catch (err) {}
}

// Reset Tab Cloak
function resetTabCloak() {
  document.title = originalTitle;
  updateFaviconLinks(originalFavicon);

  try {
    localStorage.removeItem(CLOAK_STORAGE_KEY);
  } catch (err) {}

  document.querySelectorAll('.preset-chip').forEach(btn => btn.classList.remove('active'));
  updateCloakStatusIndicator(null);
  showToast('Restored default tab identity.');
}

// Stealth about:blank Launcher
function launchInAboutBlank(url, customTitle = 'Classes', customIcon = 'https://ssl.gstatic.com/classroom/favicon.png') {
  try {
    const saved = localStorage.getItem(CLOAK_STORAGE_KEY);
    let title = customTitle;
    let icon = customIcon;

    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.title) title = parsed.title;
      if (parsed.icon) icon = parsed.icon;
    }

    const win = window.open('about:blank', '_blank');
    if (!win) {
      alert('Popup was blocked by your browser. Please allow popups to open about:blank.');
      return;
    }

    const doc = win.document;
    doc.title = title;

    if (icon) {
      const favicon = doc.createElement('link');
      favicon.rel = 'icon';
      favicon.href = icon;
      doc.head.appendChild(favicon);
    }

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

    showToast('Launched in about:blank container');
  } catch (err) {
    window.open(url, '_blank');
  }
}

// Panic Key Handler (Esc or ~ key)
function triggerPanic() {
  window.location.replace('https://classroom.google.com');
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' || e.key === '`') {
    const tag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
    if (tag !== 'input' && tag !== 'textarea') {
      e.preventDefault();
      triggerPanic();
    }
  }

  if ((e.ctrlKey && e.key === 'k') || (e.key === '/' && document.activeElement.tagName.toLowerCase() !== 'input')) {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      e.preventDefault();
      searchInput.focus();
    }
  }
});

// Render Proxies Grid (used on proxies.html and featured on index.html)
function renderProxiesGrid(isFeaturedOnly = false) {
  const container = document.getElementById('proxies-grid');
  if (!container || !tppData || !tppData.services) return;

  let services = tppData.services;

  if (isFeaturedOnly) {
    // Show top 2 or 3 on home page
    services = services.slice(0, 4);
  } else {
    // Filter by category & search
    services = services.filter(service => {
      const catMatch = (activeCategory === 'all') || 
        (service.category.toLowerCase().replace(/\s+/g, '-') === activeCategory);

      const filterMatch = (activeFilter === 'all') || 
        service.testedFilters.some(f => f.name.toLowerCase() === activeFilter.toLowerCase() && f.status === 'working');

      const q = searchQuery.toLowerCase().trim();
      const searchMatch = !q || 
        service.name.toLowerCase().includes(q) ||
        service.description.toLowerCase().includes(q) ||
        service.category.toLowerCase().includes(q) ||
        service.mirrors.some(m => m.url.toLowerCase().includes(q));

      return catMatch && filterMatch && searchMatch;
    });
  }

  if (services.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; background: var(--bg-card); border-radius: var(--radius-md); border: 1px dashed var(--border-default);">
        <p style="color: var(--text-muted); font-size: 0.95rem;">No proxies found matching your filter criteria.</p>
        <button class="btn btn-secondary btn-sm" onclick="resetDirectoryFilters()" style="margin-top: 0.75rem;">Reset Filters</button>
      </div>
    `;
    return;
  }

  container.innerHTML = services.map(service => {
    const mirrorCount = service.mirrors ? service.mirrors.length : 0;

    const filterBadgesHtml = (service.testedFilters || []).map(f => {
      let statusClass = 'status-working';
      let icon = '✓';
      if (f.status === 'warning') {
        statusClass = 'status-warning';
        icon = '⚠️';
      } else if (f.status === 'blocked') {
        statusClass = 'status-blocked';
        icon = '✕';
      }
      return `
        <span class="fw-tag ${statusClass}" title="${f.label}">
          <span>${f.name}</span>
          <span>${icon}</span>
        </span>
      `;
    }).join('');

    const mirrorsListHtml = (service.mirrors || []).map(m => `
      <div class="mirror-item">
        <span class="mirror-item-url" title="${m.url}">${m.url}</span>
        <div class="mirror-item-actions">
          <button class="btn-tiny" onclick="copyToClipboard('${m.url}', 'Mirror URL')">Copy</button>
          <button class="btn-tiny" onclick="launchInAboutBlank('${m.url}')">Stealth</button>
          <a href="${m.url}" target="_blank" rel="noopener noreferrer" class="btn-tiny">Open ↗</a>
        </div>
      </div>
    `).join('');

    return `
      <div class="proxy-card" id="proxy-${service.id}">
        <div class="card-top">
          <div>
            <h3 class="card-title">${service.name}</h3>
            <span class="card-category">${service.category}</span>
          </div>
          <span class="category-tag">${mirrorCount} ${mirrorCount === 1 ? 'Mirror' : 'Mirrors'}</span>
        </div>

        <p class="card-desc">${service.description}</p>

        <div class="firewall-tags-wrap">
          ${filterBadgesHtml}
        </div>

        <div class="card-actions-row">
          <a href="${service.primaryUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">
            <span>Launch ${service.name}</span>
            <span>↗</span>
          </a>

          <button class="btn btn-secondary btn-sm" onclick="launchInAboutBlank('${service.primaryUrl}')">
            <span>🕶️ about:blank</span>
          </button>

          <button class="btn btn-secondary btn-sm" onclick="copyToClipboard('${service.primaryUrl}', '${service.name}')">
            <span>📋 Copy</span>
          </button>

          <button class="mirrors-drawer-btn" onclick="toggleMirrorsDrawer('${service.id}')">
            <span id="label-${service.id}">View all ${mirrorCount} mirrors</span>
            <span id="chevron-${service.id}">▾</span>
          </button>

          <div class="mirrors-list" id="mirrors-${service.id}">
            ${mirrorsListHtml}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function toggleMirrorsDrawer(serviceId) {
  const list = document.getElementById(`mirrors-${serviceId}`);
  const chevron = document.getElementById(`chevron-${serviceId}`);
  if (!list) return;

  const isOpen = list.classList.contains('open');
  list.classList.toggle('open');
  if (chevron) {
    chevron.textContent = isOpen ? '▾' : '▴';
  }
}

function resetDirectoryFilters() {
  activeCategory = 'all';
  activeFilter = 'all';
  searchQuery = '';
  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.value = '';

  document.querySelectorAll('.pill-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.category === 'all' || btn.dataset.firewall === 'all');
  });

  renderProxiesGrid(false);
}

// Render Rules (on rules.html)
function renderRulesPage() {
  const container = document.getElementById('rules-list');
  if (!container || !tppData || !tppData.rules) return;

  container.innerHTML = tppData.rules.map(r => `
    <div class="rule-row">
      <h3 class="rule-header">
        <span>${r.title}</span>
      </h3>
      <p class="rule-desc">${r.summary}</p>
    </div>
  `).join('');
}

// Render Booster Perks (on premium.html)
function renderPremiumPage() {
  const container = document.getElementById('perks-grid');
  if (!container || !tppData || !tppData.boosterPerks) return;

  container.innerHTML = tppData.boosterPerks.perks.map(p => `
    <div class="perk-box">
      <h3 class="perk-name">${p.title}</h3>
      <p class="perk-text">${p.desc}</p>
    </div>
  `).join('');
}

// Custom Cloak Modal Handlers
function openCustomCloakModal() {
  const modal = document.getElementById('custom-cloak-modal');
  if (!modal) return;
  const titleInput = document.getElementById('input-custom-title');
  const iconInput = document.getElementById('input-custom-icon');

  try {
    const saved = localStorage.getItem(CLOAK_STORAGE_KEY);
    if (saved) {
      const c = JSON.parse(saved);
      if (titleInput && c.title) titleInput.value = c.title;
      if (iconInput && c.icon) iconInput.value = c.icon;
    }
  } catch (e) {}

  modal.classList.add('active');
}

function closeCustomCloakModal() {
  const modal = document.getElementById('custom-cloak-modal');
  if (modal) modal.classList.remove('active');
}

function saveCustomCloakForm() {
  const titleInput = document.getElementById('input-custom-title');
  const iconInput = document.getElementById('input-custom-icon');
  const title = titleInput ? titleInput.value.trim() : '';
  const icon = iconInput ? iconInput.value.trim() : '';

  if (!title) {
    showToast('Please specify a title for the tab disguise');
    return;
  }

  applyCustomCloak(title, icon, { notify: true, persist: true });
  closeCustomCloakModal();
}

// Setup Shared Event Listeners
function setupEvents() {
  // Mobile Nav Toggle
  const toggle = document.getElementById('mobile-toggle');
  const menu = document.getElementById('nav-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', () => menu.classList.toggle('mobile-open'));
  }

  // Preset Cloak Buttons
  document.querySelectorAll('.preset-chip[data-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      applyTabCloak(btn.dataset.id, { notify: true, persist: true });
    });
  });

  // Custom Cloak Modal Triggers
  const customModalBtn = document.getElementById('btn-custom-cloak-modal');
  if (customModalBtn) {
    customModalBtn.addEventListener('click', openCustomCloakModal);
  }

  const customModal = document.getElementById('custom-cloak-modal');
  if (customModal) {
    customModal.addEventListener('click', (e) => {
      if (e.target === customModal) closeCustomCloakModal();
    });
  }

  // Panic button clicks
  document.querySelectorAll('.btn-panic-action').forEach(btn => {
    btn.addEventListener('click', triggerPanic);
  });

  // Search input on directory page
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderProxiesGrid(false);
    });
  }

  // Category filter pills
  document.querySelectorAll('.pill-btn[data-category]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pill-btn[data-category]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.dataset.category;
      renderProxiesGrid(false);
    });
  });

  // Firewall filter pills
  document.querySelectorAll('.pill-btn[data-firewall]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pill-btn[data-firewall]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.firewall;
      renderProxiesGrid(false);
    });
  });

  // Custom about:blank form launcher
  const customLauncherBtn = document.getElementById('btn-launch-sandbox');
  const customUrlInput = document.getElementById('input-sandbox-url');
  if (customLauncherBtn && customUrlInput) {
    const launchHandler = () => {
      let url = customUrlInput.value.trim();
      if (!url) {
        showToast('Please enter a target URL');
        return;
      }
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      launchInAboutBlank(url);
    };

    customLauncherBtn.addEventListener('click', launchHandler);
    customUrlInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') launchHandler();
    });
  }
}

// Fallback Data in case fetch is blocked by file://
const embeddedFallback = {
  "cloakPresets": [
    { "id": "classroom", "name": "Google Classroom", "title": "Classes", "icon": "https://ssl.gstatic.com/classroom/favicon.png" },
    { "id": "drive", "name": "Google Drive", "title": "My Drive - Google Drive", "icon": "https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_32dp.png" },
    { "id": "docs", "name": "Google Docs", "title": "Google Docs", "icon": "https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico" },
    { "id": "ixl", "name": "IXL Learning", "title": "IXL | Math, Language Arts, Science, Social Studies, and Spanish", "icon": "https://www.ixl.com/favicon.ico" },
    { "id": "canvas", "name": "Canvas LMS", "title": "Dashboard", "icon": "https://du11hjcvx0uqb.cloudfront.net/dist/images/favicon-e10d657a73.ico" },
    { "id": "desmos", "name": "Desmos Graphing", "title": "Desmos | Graphing Calculator", "icon": "https://www.desmos.com/favicon.ico" },
    { "id": "wikipedia", "name": "Wikipedia", "title": "Wikipedia, the free encyclopedia", "icon": "https://en.wikipedia.org/static/favicon/wikipedia.ico" }
  ],
  "services": [
    {
      "id": "truffled",
      "name": "Truffled",
      "category": "Web Proxy",
      "description": "Ultra-fast node unblocker with modern interface, customizable disguise tabs, and rapid SSL cipher switching.",
      "primaryUrl": "https://truffled.cv/",
      "testedFilters": [
        { "name": "GoGuardian", "status": "working", "label": "Bypassed" },
        { "name": "iBoss", "status": "warning", "label": "Partial (Use alternate mirrors)" },
        { "name": "Lightspeed", "status": "working", "label": "Bypassed" },
        { "name": "FortiGuard", "status": "working", "label": "Bypassed" }
      ],
      "mirrors": [
        { "url": "https://truffled.cv/", "type": "Primary Domain" },
        { "url": "https://snoopylovestruffle.getinspiredflight.com/", "type": "Stealth Subdomain" },
        { "url": "https://drpepper.kwgranitecountertops.com/", "type": "Commercial Decoy" },
        { "url": "https://wandlyninns.com/", "type": "Hospitality Decoy" },
        { "url": "https://stalbansepiscopal.com/", "type": "Civic Decoy" },
        { "url": "https://best95trend.com/", "type": "Lifestyle Mirror" },
        { "url": "https://health.wvpreschool.org/", "type": "Educational Mirror (Blocked on iBoss)" }
      ]
    },
    {
      "id": "figure",
      "name": "Figure Cloud",
      "category": "Cloud Edge",
      "description": "Serverless edge worker proxy running on global Cloudflare Workers infrastructure for zero-fingerprint lightweight browsing.",
      "primaryUrl": "https://figure-cloud.figure-softwares.workers.dev/",
      "testedFilters": [
        { "name": "GoGuardian", "status": "working", "label": "Bypassed" },
        { "name": "iBoss", "status": "working", "label": "Bypassed" },
        { "name": "Lightspeed", "status": "working", "label": "Bypassed" },
        { "name": "FortiGuard", "status": "working", "label": "Bypassed" }
      ],
      "mirrors": [
        { "url": "https://figure-cloud.figure-softwares.workers.dev/", "type": "Workers Edge" }
      ]
    },
    {
      "id": "nth",
      "name": "Noah's Tutoring Hub (NTH)",
      "category": "Educational Camouflage",
      "description": "Deep disguise academic network featuring realistic curriculum subdomains, lecture paths, and BunnyCDN acceleration.",
      "primaryUrl": "https://education.kchcs.org/",
      "testedFilters": [
        { "name": "GoGuardian", "status": "working", "label": "Bypassed" },
        { "name": "iBoss", "status": "working", "label": "Bypassed" },
        { "name": "Lightspeed", "status": "working", "label": "Bypassed" },
        { "name": "FortiGuard", "status": "working", "label": "Bypassed" }
      ],
      "mirrors": [
        { "url": "https://education.kchcs.org/", "type": "Main Academic Hub" },
        { "url": "https://sloths-back.b-cdn.net/", "type": "BunnyCDN Edge Node" },
        { "url": "http://seminar.lecture.english.assignment.studying.mcneillderm.com/", "type": "Seminar Decoy" },
        { "url": "http://math.lecture.geometry.music.literature.9dejulio.gob.ar/", "type": "Geometry Decoy" },
        { "url": "http://calculus.english.teacher.art.homework.9dejulio.gob.ar/", "type": "Calculus Decoy" },
        { "url": "http://studying.math.physics.lecture.campus.mcneillderm.com/", "type": "Physics Decoy" },
        { "url": "http://physics.homework.classroom.vocabulary.library.mcneillderm.com/", "type": "Library Decoy" },
        { "url": "http://classroom.reading.homework.music.technology.mcneillderm.com/", "type": "Tech Decoy" },
        { "url": "http://lecture.homework.literature.chemistry.reading.mcneillderm.com/", "type": "Chemistry Decoy" },
        { "url": "http://math.algebra.literature.vocabulary.homework.mcneillderm.com/", "type": "Algebra Decoy" }
      ]
    },
    {
      "id": "froggies",
      "name": "Froggies Arcade & Media",
      "category": "Arcade & Media",
      "description": "Full-featured web arcade and streaming library disguised behind authentic IXL Learning metadata and school district masks.",
      "primaryUrl": "https://nick.allys.love/",
      "testedFilters": [
        { "name": "GoGuardian", "status": "working", "label": "Bypassed" },
        { "name": "iBoss", "status": "working", "label": "Bypassed" },
        { "name": "FortiGuard", "status": "working", "label": "Bypassed" },
        { "name": "Lightspeed", "status": "working", "label": "Bypassed" }
      ],
      "mirrors": [
        { "url": "https://nick.allys.love/", "type": "IXL Mask Mirror 1" },
        { "url": "https://ally.nickys.love/", "type": "IXL Mask Mirror 2" },
        { "url": "https://hally.nickys.love/", "type": "IXL Mask Mirror 3" },
        { "url": "https://parkviewpylusd.org/", "type": "District Decoy 1" },
        { "url": "https://denisonisd.org/", "type": "District Decoy 2" },
        { "url": "https://gloverschool.org/", "type": "School Decoy 3" }
      ]
    }
  ],
  "rules": [
    { "title": "Ethical Use", "summary": "Proxies must be used strictly for ethical purposes (research, privacy, testing). No unauthorized access, fraud, or destructive activities." },
    { "title": "Privacy & Credentials", "summary": "Do not share personal passwords or credentials. Use strong, unique passwords across web services." },
    { "title": "Zero Harassment", "summary": "Zero tolerance for harassment, spam, malware distribution, phishing, or malicious scripts." },
    { "title": "Node Fair Use", "summary": "Respect mirror rate limits and report broken or blocked domains promptly to administrators." },
    { "title": "Legal Compliance", "summary": "Adhere to applicable local regulations. Maintainers assume no liability for individual misuse." },
    { "title": "Community Integrity", "summary": "Be respectful, assist peers with knowledge sharing, and avoid fraudulent schemes or scams." },
    { "title": "No Botting or Scraping", "summary": "No bot abuse, bandwidth hogging, scraping, or perimeter probe attempts on proxy infrastructure." },
    { "title": "Leak Prevention", "summary": "Audit your browser connection (WebRTC / DNS) to ensure your real client IP remains unexposed." }
  ],
  "boosterPerks": {
    "promoTitle": "1 For 2 Server Booster Sale",
    "promoDescription": "Boost the Discord server with 1 boost and automatically receive both Discord Booster and Premium VIP perks!",
    "perks": [
      { "title": "Louder Voice Channels", "desc": "Enhanced audio presence in Discord voice channels." },
      { "title": "Bypass Slowmodes", "desc": "No chat cooldowns across community text channels." },
      { "title": "Fast Staff Support", "desc": "Expedited replies from server administrators and moderators." },
      { "title": "Priority Ticket Queue", "desc": "Front-of-the-line ticket handling for unblock requests." },
      { "title": "VIP Lounge & Chat", "desc": "Access to private Premium chat and voice lounges." },
      { "title": "Private Stealth Links", "desc": "Access unlisted high-speed VIP mirrors and stealth domains." }
    ]
  }
};

// Initialize Application
async function initApp() {
  try {
    const res = await fetch('./data/data.json');
    if (!res.ok) throw new Error('Failed to load JSON');
    tppData = await res.json();
  } catch (e) {
    tppData = embeddedFallback;
  }

  // Detect which page we are on and render appropriate components
  const isProxiesPage = !!document.getElementById('proxies-page-indicator');
  const isHomePage = !!document.getElementById('home-page-indicator');
  const isRulesPage = !!document.getElementById('rules-list');
  const isPremiumPage = !!document.getElementById('perks-grid');

  if (isProxiesPage) {
    renderProxiesGrid(false);
  } else if (isHomePage) {
    renderProxiesGrid(true); // featured only
  }

  if (isRulesPage) {
    renderRulesPage();
  }

  if (isPremiumPage) {
    renderPremiumPage();
  }

  setupEvents();
  restorePersistedCloak();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
