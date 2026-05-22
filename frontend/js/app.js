/**
 * vitqa Frontend Application v6 - 48 Modes
 * Collapsible families, mode detail modal, compact cards
 */

const API_BASE = '/api';
// Security: prevent XSS in user-controlled content

function safeText(el, val) {
    if (el) el.textContent = val;
}
function safeId(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
}

function sanitizeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}
let token = localStorage.getItem('vitqa_token');
let currentUploadId = null;
let isMember = false;
let userEmail = localStorage.getItem('vitqa_email') || null;

// ─── 48 Mode Architecture ─────────────────────────────────────
const FAMILIES = [
    { id: 'spectral', color: '#8b5cf6', colorClass: 'family-spectral', glowColor: 'rgba(139,92,246,0.5)' },
    { id: 'temporal', color: '#06b6d4', colorClass: 'family-temporal', glowColor: 'rgba(6,182,212,0.5)' },
    { id: 'psycho',   color: '#f59e0b', colorClass: 'family-psycho',  glowColor: 'rgba(245,158,11,0.5)' },
    { id: 'hybrid',   color: '#ec4899', colorClass: 'family-hybrid',  glowColor: 'rgba(236,72,153,0.5)' },
];

const SUB_NAMES = ['hpss', 'perturb', 'resynth', 'formant', 'jitter', 'transient', 'stretch', 'saturate', 'noise', 'mask', 'multiband', 'decorr', 'standard', 'deep', 'oblivion', 'nova'];
const SUB_I18N_KEYS = ['subs.0', 'subs.1', 'subs.2', 'subs.3', 'subs.4', 'subs.5', 'subs.6', 'subs.7', 'subs.8', 'subs.9', 'subs.10', 'subs.11', 'subs.12', 'subs.13', 'subs.14', 'subs.15'];
const STRENGTHS = ['light', 'medium', 'heavy'];
const STRENGTH_BARS = [1, 2, 3];

const MODES = [];
for (let f = 0; f < 4; f++) {
    for (let s = 0; s < 4; s++) {
        for (let st = 0; st < 3; st++) {
            const familyId = FAMILIES[f].id;
            const subName = SUB_NAMES[f * 4 + s];
            const strength = STRENGTHS[st];
            const modeKey = familyId + '_' + subName + '_' + strength;
            const idx = f * 12 + s * 3 + st;
            MODES.push({
                key: modeKey,
                family: f,
                sub: f * 4 + s,
                strength: st,
                idx: idx
            });
        }
    }
}

function getModeText(idx, field) {
    return t('converter.modes.' + idx + '.' + field);
}

function getModeDetail(idx, field) {
    return t('converter.modes.' + idx + '.detail.' + field);
}

function getFamilyName(familyIdx) {
    return t('converter.families.' + familyIdx + '.name');
}

function getFamilyDesc(familyIdx) {
    return t('converter.families.' + familyIdx + '.desc');
}

function getSubName(subIdx) {
    return t('converter.' + SUB_I18N_KEYS[subIdx]);
}

function getStrengthName(strengthIdx) {
    const names = t('strength_names');
    if (Array.isArray(names)) return names[strengthIdx] || STRENGTHS[strengthIdx];
    return STRENGTHS[strengthIdx];
}

// ─── Init ────────────────────────────────────────────────────────
function init() {
    if (token) {
        loadProfile();
    } else {
        document.getElementById('converterGuest').classList.remove('hidden');
        document.getElementById('converterPanel').classList.add('hidden');
    }
    updateUI();
    loadAnnouncement();
    setupFileUpload();
    buildModeCards();
    setupDetailModal();
    checkUrlHash();
    window.addEventListener('hashchange', checkUrlHash);
}

// ─── URL Hash Navigation ──────────────────────────────────────
function checkUrlHash() {
    const hash = window.location.hash;
    if (hash.startsWith('#mode=')) {
        const modeKey = decodeURIComponent(hash.substring(6));
        const card = document.querySelector('.mc-gallery-card[data-mode="' + modeKey + '"]');
        if (card) {
            selectModeCard(card);
            // Expand the parent family
            const section = card.closest('.mc-family-section');
            if (section) {
                const body = section.querySelector('.mc-family-body');
                const toggle = section.querySelector('.mc-family-toggle');
                if (body && body.classList.contains('collapsed')) {
                    body.classList.remove('collapsed');
                    body.style.maxHeight = body.scrollHeight + 'px';
                    if (toggle) toggle.classList.remove('collapsed');
                }
            }
            // Open detail modal after a brief delay for render
            setTimeout(function() {
                openModeDetail(modeKey);
            }, 100);
        }
    }
}

// ─── Build Mode Cards (5-col gallery, 48 modes in 4 families) ────
function buildModeCards() {
    const container = document.getElementById('modeGridContainer');
    if (!container) return;

    const FAMILY_ICONS = ['🌌', '⏱', '🧠', '⚡'];
    let html = '';

    for (let f = 0; f < 4; f++) {
        const familyName = getFamilyName(f);
        const familyDesc = getFamilyDesc(f);
        const colorClass = FAMILIES[f].colorClass;
        const familyIcon = FAMILY_ICONS[f];
        const familyColor = FAMILIES[f].color;
        const isFirst = f === 0;

        // Family section
        html += '<div class="mc-family-section ' + colorClass + '">';
        html += '<div class="mc-family-header ' + colorClass + '" data-family="' + f + '" onclick="toggleFamily(this)" style="--mc-accent:' + familyColor + '">';
        html += '<div class="mc-family-header-left">';
        html += '<div class="mc-family-icon">' + familyIcon + '</div>';
        html += '<div class="mc-family-info">';
        html += '<span class="mc-family-name">' + familyName + '</span>';
        html += '<span class="mc-family-desc">' + familyDesc + '</span>';
        html += '</div>';
        html += '</div>';
        html += '<div class="mc-family-actions">';
        html += '<span class="mc-family-count">12</span>';
        html += '<span class="mc-family-toggle ' + (isFirst ? '' : 'collapsed') + '">▼</span>';
        html += '</div>';
        html += '</div>';

        // Family body (collapsible)
        html += '<div class="mc-family-body' + (isFirst ? '' : ' collapsed') + '" style="' + (isFirst ? '' : 'max-height:0;overflow:hidden;') + '">';

        // Flat 5-col grid of all 12 modes in this family
        html += '<div class="mc-gallery-grid">';
        for (let s = 0; s < 4; s++) {
            const subIdx = f * 4 + s;
            const subName = getSubName(subIdx);

            for (let st = 0; st < 3; st++) {
                const mode = MODES[f * 12 + s * 3 + st];
                const idx = mode.idx;
                const name = getModeText(idx, 'name');
                const badge = getModeText(idx, 'badge');
                const isNova = mode.key.startsWith('hybrid_nova');
                const isDefault = mode.key === 'hybrid_nova_medium';
                const barCount = STRENGTH_BARS[st];
                const strengthName = getStrengthName(st);

                const qualityVal = getModeDetail(idx, 'quality');
                const detectionVal = getModeDetail(idx, 'detection');
                const qShow = typeof qualityVal === 'number' ? qualityVal : 3;
                const dShow = typeof detectionVal === 'number' ? detectionVal : 3;

                // Strength label
                const strengthIcon = ['☁️', '🌤', '🔥'][st];

                html += '<div class="mc-gallery-card ' + colorClass + (isNova ? ' mc-gallery-nova' : '') + '" data-mode="' + mode.key + '" data-family="' + f + '" data-sub="' + s + '" data-strength="' + st + '" data-idx="' + idx + '" onclick="onModeCardClick(this)" style="--mc-accent:' + familyColor + '">';
                html += '<input type="radio" name="mode" value="' + mode.key + '" ' + (isDefault ? 'checked' : '') + ' hidden>';

                // Top row: badge + bitrate
                html += '<div class="mc-g-top">';
                html += '<span class="mc-g-badge ' + colorClass + '-badge">' + badge + '</span>';
                html += '<span class="mc-g-bitrate">256k</span>';
                html += '</div>';

                // Center: mode icon + name
                html += '<div class="mc-g-center">';
                html += '<div class="mc-g-icon">' + strengthIcon + '</div>';
                html += '<span class="mc-g-name">' + name + '</span>';
                html += '</div>';

                // Bottom: sub-type + strength
                html += '<div class="mc-g-bottom">';
                html += '<span class="mc-g-meta">' + subName + '</span>';
                html += '<div class="mc-g-bars">';
                for (let b = 0; b < 3; b++) {
                    html += '<span class="mc-g-bar ' + (b < barCount ? 'mc-g-bar-fill' : 'mc-g-bar-empty') + '"></span>';
                }
                html += '</div>';
                html += '</div>';

                // Hover detail: Q/D bars
                html += '<div class="mc-g-hover-info">';
                html += '<div class="mc-g-hover-row"><span class="mc-g-hover-label">Q</span><div class="mc-g-hover-track"><div class="mc-g-hover-fill" style="width:' + (qShow / 5 * 100) + '%;background:' + familyColor + '"></div></div></div>';
                html += '<div class="mc-g-hover-row"><span class="mc-g-hover-label">D</span><div class="mc-g-hover-track"><div class="mc-g-hover-fill" style="width:' + (dShow / 5 * 100) + '%;background:' + familyColor + '"></div></div></div>';
                html += '</div>';

                html += '</div>'; // mc-gallery-card
            }
        }
        html += '</div>'; // mc-gallery-grid

        html += '</div>'; // mc-family-body
        html += '</div>'; // mc-family-section
    }

    container.innerHTML = html;

    // Default select Nova中度
    const defaultCard = container.querySelector('.mc-gallery-card[data-mode="hybrid_nova_medium"]');
    if (defaultCard) {
        defaultCard.classList.add('selected');
        defaultCard.querySelector('input').checked = true;
        updateSelectedModeDisplay(defaultCard);
    } else {
        const firstCard = container.querySelector('.mc-gallery-card');
        if (firstCard) {
            firstCard.classList.add('selected');
            firstCard.querySelector('input').checked = true;
            updateSelectedModeDisplay(firstCard);
        }
    }
}

// ─── Toggle Family Collapse ────────────────────────────────────
function toggleFamily(headerEl) {
    const section = headerEl.closest('.mc-family-section');
    if (!section) return;
    const body = section.querySelector('.mc-family-body');
    const toggle = headerEl.querySelector('.mc-family-toggle');
    if (!body) return;

    const isCollapsed = body.classList.contains('collapsed');

    if (isCollapsed) {
        // Expand
        body.classList.remove('collapsed');
        body.style.maxHeight = body.scrollHeight + 'px';
        body.style.overflow = 'visible';
        if (toggle) toggle.classList.remove('collapsed');
    } else {
        // Collapse
        body.style.maxHeight = body.scrollHeight + 'px'; // set to current first
        requestAnimationFrame(function() {
            body.classList.add('collapsed');
            body.style.maxHeight = '0';
            body.style.overflow = 'hidden';
            if (toggle) toggle.classList.add('collapsed');
        });
    }
}

// ─── Mode Card Click Handler ──────────────────────────────────
function onModeCardClick(cardEl) {
    selectModeCard(cardEl);
    const modeKey = cardEl.getAttribute('data-mode');
    if (modeKey) {
        openModeDetail(modeKey);
    }
}

function selectModeCard(cardEl) {
    const container = document.getElementById('modeGridContainer');
    container.querySelectorAll('.mc-gallery-card').forEach(function(c) {
        c.classList.remove('selected');
    });
    cardEl.classList.add('selected');
    cardEl.querySelector('input').checked = true;
    updateSelectedModeDisplay(cardEl);
}

// ─── Selected Mode Display ──────────────────────────────────────
function updateSelectedModeDisplay(card) {
    const display = document.getElementById('selectedModeDisplay');
    if (!display) return;

    const family = parseInt(card.getAttribute('data-family'));
    const strength = parseInt(card.getAttribute('data-strength'));
    const idx = parseInt(card.getAttribute('data-idx'));
    const modeKey = card.getAttribute('data-mode');
    const modeName = card.querySelector('.mc-g-name').textContent;

    const familyName = getFamilyName(family);
    const familyIcons = ['🌌', '⏱', '🧠', '⚡'];

    // Basic info
    display.querySelector('.sel-mode-name').textContent = modeName;
    display.querySelector('.sel-mode-family').textContent = familyIcons[family] + ' ' + familyName;

    // Detail button
    const detailBtn = display.querySelector('.sel-detail-btn');
    if (detailBtn) {
        detailBtn.setAttribute('data-mode', modeKey);
    }

    // Strength bars
    const barsContainer = display.querySelector('.sel-strength-bars');
    barsContainer.innerHTML = '';
    for (let i = 0; i < 3; i++) {
        const bar = document.createElement('span');
        bar.className = 'sel-strength-bar ' + (i <= strength ? 'filled' : 'empty');
        bar.style.background = i <= strength ? FAMILIES[family].color : 'rgba(255,255,255,0.1)';
        barsContainer.appendChild(bar);
    }

    // Quality vs Detection bars
    const detail = getModeDetail(idx, 'quality');
    const qualityVal = typeof detail === 'number' ? detail : 3;
    const detectionVal = typeof getModeDetail(idx, 'detection') === 'number' ? getModeDetail(idx, 'detection') : 3;

    const qBar = display.querySelector('.sel-quality-bar');
    const dBar = display.querySelector('.sel-detection-bar');
    if (qBar) { qBar.style.width = (qualityVal / 5 * 100) + '%'; }
    if (dBar) { dBar.style.width = (detectionVal / 5 * 100) + '%'; }

    // Badge
    const badgeText = getModeText(idx, 'badge');
    const badge = display.querySelector('.sel-mode-badge');
    if (badge) {
        badge.textContent = badgeText;
        badge.className = 'sel-mode-badge ' + FAMILIES[family].colorClass + '-badge';
    }

    // Family glow
    display.style.setProperty('--sel-glow-color', FAMILIES[family].glowColor);
    display.className = 'selected-mode-display ' + FAMILIES[family].colorClass;
}

// ─── Mode Detail Modal ─────────────────────────────────────────
function setupDetailModal() {
    const modal = document.getElementById('modeDetailModal');
    if (!modal) return;

    // Close button
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            closeModeDetail();
        });
    }

    // Backdrop click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModeDetail();
        }
    });

    // Select button
    const selectBtn = modal.querySelector('.modal-select-btn');
    if (selectBtn) {
        selectBtn.addEventListener('click', function() {
            const modeKey = modal.getAttribute('data-mode-key');
            if (modeKey) {
                const card = document.querySelector('.mc-gallery-card[data-mode="' + modeKey + '"]');
                if (card) {
                    selectModeCard(card);
                }
            }
            closeModeDetail();
            toast('✅ 已选择模式');
        });
    }
}

// Keyboard escape
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModeDetail();
    }
});

function openModeDetail(modeKey) {
    const modal = document.getElementById('modeDetailModal');
    if (!modal) return;

    // Find mode data
    const card = document.querySelector('.mc-gallery-card[data-mode="' + modeKey + '"]');
    if (!card) return;

    const family = parseInt(card.getAttribute('data-family'));
    const sub = parseInt(card.getAttribute('data-sub'));
    const strength = parseInt(card.getAttribute('data-strength'));
    const idx = parseInt(card.getAttribute('data-idx'));

    const modeName = getModeText(idx, 'name');
    const badge = getModeText(idx, 'badge');
    const desc = getModeText(idx, 'desc');
    const result = getModeText(idx, 'result');
    const familyName = getFamilyName(family);
    const subName = getSubName(sub);
    const strengthName = getStrengthName(strength);
    const familyIcons = ['🌌', '⏱', '🧠', '⚡'];

    const bestFor = getModeDetail(idx, 'best_for');
    const pipelineStr = getModeDetail(idx, 'pipeline');
    const qualityVal = typeof getModeDetail(idx, 'quality') === 'number' ? getModeDetail(idx, 'quality') : 3;
    const detectionVal = typeof getModeDetail(idx, 'detection') === 'number' ? getModeDetail(idx, 'detection') : 3;
    const longDesc = getModeDetail(idx, 'long_desc');

    // Update URL hash
    window.location.hash = 'mode=' + modeKey;

    // Store mode key on modal
    modal.setAttribute('data-mode-key', modeKey);

    // Populate modal content
    const familyBadge = modal.querySelector('.modal-family-badge');
    if (familyBadge) {
        familyBadge.textContent = familyIcons[family] + ' ' + familyName;
        familyBadge.className = 'modal-family-badge ' + FAMILIES[family].colorClass;
    }

    const nameEl = modal.querySelector('.modal-mode-name');
    if (nameEl) nameEl.textContent = modeName;

    const badgeEl = modal.querySelector('.modal-mode-badge');
    if (badgeEl) {
        badgeEl.textContent = badge;
        badgeEl.className = 'modal-mode-badge ' + FAMILIES[family].colorClass + '-badge';
    }

    const bitrateEl = modal.querySelector('.modal-bitrate');
    if (bitrateEl) bitrateEl.textContent = '256k CBR';

    const strengthEl = modal.querySelector('.modal-strength');
    if (strengthEl) strengthEl.textContent = strengthName;

    const subEl = modal.querySelector('.modal-sub');
    if (subEl) subEl.textContent = subName;

    const descEl = modal.querySelector('.modal-desc');
    if (descEl) descEl.textContent = desc;

    // Quality bar
    const qFill = modal.querySelector('.quality-bar .modal-bar-fill');
    if (qFill) {
        qFill.style.width = (qualityVal / 5 * 100) + '%';
        qFill.style.background = qualityVal >= 4 ? 'linear-gradient(90deg, #06b6d4, #22d3ee)' :
                                 qualityVal >= 3 ? 'linear-gradient(90deg, #84cc16, #a3e635)' :
                                 'linear-gradient(90deg, #f59e0b, #fbbf24)';
    }

    // Detection bar
    const dFill = modal.querySelector('.detection-bar .modal-bar-fill');
    if (dFill) {
        dFill.style.width = (detectionVal / 5 * 100) + '%';
        dFill.style.background = detectionVal >= 4 ? 'linear-gradient(90deg, #ec4899, #f472b6)' :
                                 detectionVal >= 3 ? 'linear-gradient(90deg, #f59e0b, #fbbf24)' :
                                 'linear-gradient(90deg, #84cc16, #a3e635)';
    }

    // Quality label
    const qLabel = modal.querySelector('.modal-bar-row.quality-bar-row .modal-bar-label');
    if (qLabel) qLabel.textContent = qualityVal + '/5';

    const dLabel = modal.querySelector('.modal-bar-row.detection-bar-row .modal-bar-label');
    if (dLabel) dLabel.textContent = detectionVal + '/5';

    // Pipeline steps
    const pipelineList = modal.querySelector('.pipeline-list');
    if (pipelineList) {
        pipelineList.innerHTML = '';
        if (pipelineStr && pipelineStr !== 'converter.modes.' + idx + '.detail.pipeline') {
            const steps = pipelineStr.split(', ');
            steps.forEach(function(step) {
                const li = document.createElement('li');
                li.textContent = step.trim();
                pipelineList.appendChild(li);
            });
        } else {
            const li = document.createElement('li');
            li.textContent = '归一化, 处理, 编码输出';
            pipelineList.appendChild(li);
        }
    }

    // Best for / When to use
    const bestForEl = modal.querySelector('.modal-best-for');
    if (bestForEl) {
        if (bestFor && bestFor !== 'converter.modes.' + idx + '.detail.best_for') {
            bestForEl.innerHTML = '<strong>🎯 适用场景：</strong> ' + bestFor;
        } else {
            bestForEl.innerHTML = '<strong>🎯 适用场景：</strong> ' + desc;
        }
    }

    // Long description
    const longDescEl = modal.querySelector('.modal-long-desc');
    if (longDescEl) {
        if (longDesc && longDesc !== 'converter.modes.' + idx + '.detail.long_desc') {
            longDescEl.textContent = longDesc;
        } else {
            longDescEl.textContent = desc;
        }
    }

    // Update family color on modal
    modal.className = 'modal-overlay ' + FAMILIES[family].colorClass;
    modal.classList.remove('hidden');

    // Trigger animation
    requestAnimationFrame(function() {
        modal.classList.add('open');
    });
}

function closeModeDetail() {
    const modal = document.getElementById('modeDetailModal');
    if (!modal) return;
    modal.classList.remove('open');
    setTimeout(function() {
        modal.classList.add('hidden');
        // Restore hash to just # if it was #mode=xxx
        if (window.location.hash.startsWith('#mode=')) {
            history.replaceState(null, '', ' ');
        }
    }, 300);
}

// ─── Announcement Banner ──────────────────────────────────────
function loadAnnouncement() {
    const dismissed = localStorage.getItem('vitqa_announce_dismissed');
    const bar = document.getElementById('announcementBar');
    if (!bar) return;
    if (dismissed && Date.now() - parseInt(dismissed) < 86400000) return;
    fetch(API_BASE + '/announcement')
        .then(function(r) { return r.ok ? r.json() : null; })
        .then(function(data) {
            if (!data || !data.title) return;
            var announceBadge = document.getElementById('announceBadge');
            if (announceBadge) announceBadge.textContent = data.badge || '📢';
            var announceText = document.getElementById('announceText');
            if (announceText) announceText.textContent = data.content;
            var link = document.getElementById('announceLink');
            if (data.link_url) {
                link.href = data.link_url;
                link.textContent = data.link_text || '查看详情';
                link.style.display = '';
            } else {
                link.style.display = 'none';
            }
            bar.style.display = '';
        })
        .catch(function() {});
}
function closeAnnouncement() {
    var bar = document.getElementById('announcementBar');
    if (bar) bar.style.display = 'none';
    localStorage.setItem('vitqa_announce_dismissed', Date.now().toString());
}

function updateUI() {
    var isLoggedIn = !!token;
    document.getElementById('loginBtn').classList.toggle('hidden', isLoggedIn);
    document.getElementById('userMenu').classList.toggle('hidden', !isLoggedIn);
    if (token && userEmail) {
        var userEmail = document.getElementById('userEmail');
        if (userEmail) userEmail.textContent = userEmail;
        document.getElementById('memberBadge').classList.toggle('hidden', !isMember);
    }
}

function loadProfile() {
    if (!token) return;
    fetch(API_BASE + '/user/status?token=' + encodeURIComponent(token))
        .then(function(r) { return r.ok ? r.json() : Promise.reject('Auth failed'); })
        .then(function(data) {
            isMember = data.is_member;
            userEmail = data.email || userEmail;
            if (userEmail) localStorage.setItem('vitqa_email', userEmail);
            localStorage.setItem('vitqa_is_member', data.is_member);
            updateUI();
            var guest = document.getElementById('converterGuest');
            var panel = document.getElementById('converterPanel');
            if (guest) guest.classList.toggle('hidden', isMember);
            if (panel) panel.classList.toggle('hidden', !isMember);
            var cta = document.getElementById('pricingCta');
            if (cta) cta.innerHTML = isMember ? '✅ 已是会员' : '💎 立即购买';
            loadReferralStats();
        })
        .catch(function() {
            localStorage.removeItem('vitqa_token');
            localStorage.removeItem('vitqa_email');
            localStorage.removeItem('vitqa_is_member');
            token = null;
            userEmail = null;
            isMember = false;
            updateUI();
            var guest = document.getElementById('converterGuest');
            var panel = document.getElementById('converterPanel');
            if (guest) guest.classList.remove('hidden');
            if (panel) panel.classList.add('hidden');
        });
}

// ─── Email Auth ─────────────────────────────────────────────────
function showLoginModal() {
    openModal('loginModal');
    document.getElementById('loginTab').classList.add('active');
    document.getElementById('registerTab').classList.remove('active');
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
}

function showRegisterModal() {
    openModal('loginModal');
    document.getElementById('registerTab').classList.add('active');
    document.getElementById('loginTab').classList.remove('active');
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
}

function doLogin() {
    var email = document.getElementById('loginEmail').value.trim();
    var password = document.getElementById('loginPassword').value;
    if (!email || !password) { toast('请填写邮箱和密码', true); return; }
    var statusEl = document.getElementById('loginStatus');
    statusEl.textContent = '登录中...';
    statusEl.classList.remove('hidden');
    fetch(API_BASE + '/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'email=' + encodeURIComponent(email) + '&password=' + encodeURIComponent(password)
    })
    .then(function(r) { return r.ok ? r.json() : r.json().then(function(e) { return Promise.reject(e.detail || '登录失败'); }); })
    .then(function(data) {
        token = data.token;
        userEmail = data.email;
        isMember = data.is_member;
        localStorage.setItem('vitqa_token', token);
        localStorage.setItem('vitqa_email', userEmail);
        localStorage.setItem('vitqa_is_member', isMember);
        closeModal('loginModal');
        updateUI();
        loadProfile();
        toast('✅ ' + data.message);
    })
    .catch(function(err) { statusEl.textContent = '❌ ' + (err.message || err || '登录失败'); });
}

var codeCountdown = 0;

function sendVerifyCode() {
    var email = document.getElementById('regEmail').value.trim();
    if (!email) { toast('请先输入邮箱地址', true); return; }
    var btn = document.getElementById('sendCodeBtn');
    btn.disabled = true;
    btn.textContent = '发送中...';
    fetch(API_BASE + '/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'email=' + encodeURIComponent(email)
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
        if (data.status === 'ok') {
            toast('✅ ' + data.message);
            codeCountdown = 60;
            btn.textContent = codeCountdown + 's';
            var timer = setInterval(function() {
                codeCountdown--;
                if (codeCountdown <= 0) { clearInterval(timer); btn.disabled = false; btn.textContent = '重新发送'; }
                else { btn.textContent = codeCountdown + 's'; }
            }, 1000);
        } else { toast(data.message || '发送失败', true); btn.disabled = false; btn.textContent = '发送验证码'; }
    })
    .catch(function() { toast('网络错误', true); btn.disabled = false; btn.textContent = '发送验证码'; });
}

function getReferralRef() {
    var urlParams = new URLSearchParams(window.location.search);
    var ref = urlParams.get('ref');
    if (ref) { sessionStorage.setItem('vitqa_ref', ref); return ref; }
    return sessionStorage.getItem('vitqa_ref') || '';
}

function doRegister() {
    var email = document.getElementById('regEmail').value.trim();
    var password = document.getElementById('regPassword').value;
    var confirm = document.getElementById('regConfirm').value;
    var code = document.getElementById('regCode').value.trim();
    var ref = getReferralRef();
    if (!email || !password) { toast('请填写邮箱和密码', true); return; }
    if (password !== confirm) { toast('两次密码不一致', true); return; }
    if (password.length < 6) { toast('密码至少6位', true); return; }
    if (!code) { toast('请输入验证码', true); return; }
    var statusEl = document.getElementById('loginStatus');
    statusEl.textContent = '注册中...';
    statusEl.classList.remove('hidden');
    var body = 'email=' + encodeURIComponent(email) + '&password=' + encodeURIComponent(password) + '&code=' + encodeURIComponent(code);
    if (ref) body += '&ref=' + encodeURIComponent(ref);
    fetch(API_BASE + '/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body
    })
    .then(function(r) { return r.ok ? r.json() : r.json().then(function(e) { return Promise.reject(e.detail || '注册失败'); }); })
    .then(function(data) {
        token = data.token; userEmail = data.email; isMember = false;
        localStorage.setItem('vitqa_token', token); localStorage.setItem('vitqa_email', userEmail);
        closeModal('loginModal'); updateUI(); loadProfile();
        toast('✅ ' + data.message);
    })
    .catch(function(err) { statusEl.textContent = '❌ ' + (err.message || err || '注册失败'); });
}

function logout() {
    localStorage.removeItem('vitqa_token'); localStorage.removeItem('vitqa_email'); localStorage.removeItem('vitqa_is_member');
    token = null; userEmail = null; isMember = false;
    updateUI();
    document.getElementById('converterGuest').classList.remove('hidden');
    document.getElementById('converterPanel').classList.add('hidden');
    toast('已退出');
}

// ─── Modal ───────────────────────────────────────────────────────
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
document.querySelectorAll('.modal-overlay').forEach(function(el) {
    el.addEventListener('click', function(e) { if (e.target === el) el.classList.remove('open'); });
});

// ─── WeChat Pay via XorPay ──────────────────────────────────
function showWechatPay() {
    if (!token) {
        openModal('paymentModal');
        document.getElementById('pmtQrContainer').style.display = 'none';
        document.getElementById('pmtLoading').style.display = 'block';
        document.getElementById('pmtError').style.display = 'none';
        toast('请先登录后购买会员');
        setTimeout(function() { closeModal('paymentModal'); showLoginModal(); }, 1500);
        return;
    }
    var qrContainer = document.getElementById('pmtQrContainer');
    var loading = document.getElementById('pmtLoading');
    var errorEl = document.getElementById('pmtError');
    var qrCodeDiv = document.getElementById('pmtQrCode');
    var statusEl = document.getElementById('pmtStatus');
    var discInfo = document.getElementById('paymentDiscountInfo');
    var desc = document.getElementById('paymentModalDesc');
    qrContainer.style.display = 'none';
    loading.style.display = 'block';
    errorEl.style.display = 'none';
    statusEl.textContent = '';
    openModal('paymentModal');

    fetch(API_BASE + '/referral/stats?token=' + encodeURIComponent(token))
        .then(function(r) { return r.json(); })
        .then(function(stats) {
            var discPct = stats.discount_percent || 0;
            var discPrice = 198 * (100 - discPct) / 100;
            if (discPct > 0) {
                discInfo.classList.remove('hidden');
                discInfo.innerHTML = '🎉 当前折扣: -' + discPct + '%  →  <strong>¥' + discPrice.toFixed(1) + '</strong>';
                desc.innerHTML = t('payment.modalDesc').replace('¥198', '<strong>¥' + discPrice.toFixed(1) + '</strong>');
            } else {
                discInfo.classList.add('hidden');
                desc.innerHTML = t('payment.modalDesc').replace('¥198', '<strong>¥198</strong>');
            }
        })
        .catch(function() {
            document.getElementById('paymentDiscountInfo').classList.add('hidden');
            desc.innerHTML = t('payment.modalDesc').replace('¥198', '<strong>¥198</strong>');
        });

    fetch(API_BASE + '/xorpay/pay?token=' + encodeURIComponent(token), {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: 'tier=perm'
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
        loading.style.display = 'none';
        if (data.status === 'ok') {
            qrContainer.style.display = 'block';
            qrCodeDiv.innerHTML = '';
            new QRCode(qrCodeDiv, { text: data.qr_url, width: 220, height: 220, colorDark: '#000000', colorLight: '#ffffff', correctLevel: QRCode.CorrectLevel.H });
            statusEl.textContent = '⏳ 等待微信扫码支付...';
            statusEl.style.color = '#fdcb6e';
            pollXorpayOrder(data.order_id);
        } else {
            errorEl.style.display = 'block';
            errorEl.textContent = '❌ ' + (data.message || '创建支付失败，请重试');
        }
    })
    .catch(function() { loading.style.display = 'none'; errorEl.style.display = 'block'; errorEl.textContent = '❌ 网络错误，请检查连接后重试'; });
}

var xorpayPollTimer = null;
function pollXorpayOrder(orderId) {
    if (xorpayPollTimer) clearTimeout(xorpayPollTimer);
    var statusEl = document.getElementById('pmtStatus');
    fetch(API_BASE + '/xorpay/status?token=' + encodeURIComponent(token), {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'order_id=' + encodeURIComponent(orderId)
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
        if (data.status === 'confirmed') {
            statusEl.textContent = '🎉 支付成功！会员已激活！';
            statusEl.style.color = '#00cec9';
            isMember = true;
            localStorage.setItem('vitqa_is_member', 'true');
            loadProfile();
            setTimeout(function() { closeModal('paymentModal'); }, 3000);
            if (xorpayPollTimer) clearTimeout(xorpayPollTimer);
        } else if (data.status === 'pending') {
            statusEl.textContent = '⏳ 等待支付确认...';
            xorpayPollTimer = setTimeout(function() { pollXorpayOrder(orderId); }, 5000);
        } else {
            statusEl.textContent = '⏳ 已生成支付二维码，请用微信扫码';
            xorpayPollTimer = setTimeout(function() { pollXorpayOrder(orderId); }, 10000);
        }
    })
    .catch(function() { xorpayPollTimer = setTimeout(function() { pollXorpayOrder(orderId); }, 10000); });
}

// ─── Tiered Payment Functions ────────────────────────────────
function showPayModal(tier) {
    if (!token) { showLoginModal(); return; }
    if (tier === 'perm') { showWechatPay(); return; }
    if (tier === 'usdt') { showUsdtPay(); return; }
    closeModal('shareModal');
    fetch('/api/xorpay/pay?token=' + encodeURIComponent(token), {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: 'tier=' + tier
    })
    .then(function(r) { return r.json(); })
    .then(function(d) {
        if (d.status === 'already_member') { toast(t('already_member')); return; }
        if (d.status === 'ok') { showQRModal(d.qr_url || d.info?.qrcode || '', d.order_id || ''); }
        else { toast('❌ ' + t('pay_failed') + ': ' + (d.message || '')); }
    })
    .catch(function(err) { toast('❌ ' + t('pay_failed') + ': ' + (err.message || '网络错误')); });
}

function showUsdtPay() {
    if (!token) { showLoginModal(); return; }
    openModal('usdtModal');
    // Generate QR for USDT wallet address
    setTimeout(function() {
        var el = document.getElementById('usdtQrCode');
        if (el && typeof QRCode !== 'undefined') {
            el.innerHTML = '';
            new QRCode(el, { text: 'TBjQRf2DY1Vxi9yrvKYhifumcuz8rUrcwm', width: 180, height: 180, colorDark: '#000000', colorLight: '#ffffff', correctLevel: QRCode.CorrectLevel.H });
        }
    }, 200);
    // Select perm tier by default
    document.getElementById('usdtTierPerm').checked = true;
    updateUsdtTier();
}

function updateUsdtTier() {
    var tiers = { 'usdtTier1d': { price: '1', label: '1天' }, 'usdtTier1m': { price: '10', label: '1月' }, 'usdtTierPerm': { price: '20', label: '永久' } };
    for (var id in tiers) {
        var radio = document.getElementById(id);
        if (radio && radio.checked) {
            var usdtPriceDisplay = document.getElementById('usdtPriceDisplay');
            if (usdtPriceDisplay) usdtPriceDisplay.textContent = tiers[id].price + ' USDT';
            var usdtTierLabel = document.getElementById('usdtTierLabel');
            if (usdtTierLabel) usdtTierLabel.textContent = tiers[id].label;
            break;
        }
    }
}

function submitUsdtPayment() {
    var txHash = document.getElementById('usdtTxHash').value.trim();
    if (!txHash || txHash.length !== 64) { toast('请填写正确的交易哈希（64位十六进制）', true); return; }
    var tier = 'perm';
    if (document.getElementById('usdtTier1d').checked) tier = '1d';
    else if (document.getElementById('usdtTier1m').checked) tier = '1m';
    fetch('/api/verify-payment?token=' + encodeURIComponent(token), {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: 'tx_hash=' + encodeURIComponent(txHash) + '&tier=' + tier
    })
    .then(function(r) { return r.json(); })
    .then(function(d) {
        if (d.status === 'ok' || d.is_member) {
            toast('✅ USDT支付验证成功！会员已激活');
            isMember = true;
            localStorage.setItem('vitqa_is_member', 'true');
            loadProfile();
            closeModal('usdtModal');
        } else {
            toast('❌ ' + (d.message || '验证失败，请确认交易哈希正确'));
        }
    })
    .catch(function(err) { toast('❌ 验证失败: ' + (err.message || '网络错误')); });
}

function showQRModal(qrUrl, orderId) {
    var modal = document.getElementById('qrModal');
    if (!modal) return;
    document.getElementById('qrImage').src = qrUrl || '';
    var qrOrderId = document.getElementById('qrOrderId');
    if (qrOrderId) qrOrderId.textContent = orderId ? orderId.slice(0, 30) + '...' : '';
    modal.classList.add('open');
    pollQRPayment(orderId);
}

function closeQRModal() {
    document.getElementById('qrModal').classList.remove('open');
    if (window._qrPollTimer) { clearTimeout(window._qrPollTimer); window._qrPollTimer = null; }
}

function pollQRPayment(orderId) {
    if (!orderId || !token) return;
    if (window._qrPollTimer) clearTimeout(window._qrPollTimer);
    var statusEl = document.getElementById('qrStatus');
    fetch('/api/xorpay/status?token=' + encodeURIComponent(token), {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: 'order_id=' + encodeURIComponent(orderId)
    })
    .then(function(r) { return r.json(); })
    .then(function(d) {
        if (d.status === 'confirmed') {
            statusEl.textContent = '🎉 支付成功！会员已激活！';
            statusEl.style.color = '#00cec9';
            isMember = true;
            localStorage.setItem('vitqa_is_member', 'true');
            loadProfile();
            setTimeout(closeQRModal, 3000);
        } else if (d.status === 'pending') {
            statusEl.textContent = '⏳ 等待支付确认...';
            window._qrPollTimer = setTimeout(function() { pollQRPayment(orderId); }, 5000);
        } else {
            statusEl.textContent = '⏳ 已生成二维码，请用微信扫码';
            window._qrPollTimer = setTimeout(function() { pollQRPayment(orderId); }, 10000);
        }
    })
    .catch(function() { window._qrPollTimer = setTimeout(function() { pollQRPayment(orderId); }, 10000); });
}

// ─── Referral / Fission ─────────────────────────────────────────
var referralStatsCache = null;
function openShareModal() {
    if (!token) { showLoginModal(); return; }
    openModal('shareModal');
    loadReferralStats();
}
function loadReferralStats() {
    if (!token) return;
    fetch(API_BASE + '/referral/stats?token=' + encodeURIComponent(token))
        .then(function(r) { return r.ok ? r.json() : Promise.reject('Failed'); })
        .then(function(data) {
            referralStatsCache = data;
            showReferralProgress(data);
            updateDiscountDisplay(data);
        })
        .catch(function() {});
}
function updateDiscountDisplay(data) {
    var discountPercent = data.discount_percent || 0;
    var discountedPrice = 198 * (100 - discountPercent) / 100;
    var saved = 198 - discountedPrice;
    var el = document.getElementById('referralDiscountInfo');
    if (el) {
        if (discountPercent > 0) {
            el.classList.remove('hidden');
            el.innerHTML = discountPercent >= 50
                ? '<span style="font-size:1.5rem;font-weight:700;color:#00cec9;">🎉 半价折扣! ¥' + discountedPrice.toFixed(1) + '</span>'
                : '<span style="font-weight:600;">' + t('referral.current_discount') + ': <span style="color:#00cec9;">-' + discountPercent + '%</span></span> <span style="color:var(--text-muted);font-size:0.9rem;">¥' + discountedPrice.toFixed(1) + ' (' + t('referral.saved') + ' ¥' + saved.toFixed(1) + ')</span>';
        } else { el.classList.add('hidden'); }
    }
    var pricingRow = document.getElementById('pricingDiscountRow');
    var pricingDisplay = document.getElementById('pricingDiscountDisplay');
    if (pricingRow && pricingDisplay) {
        if (discountPercent > 0) { pricingRow.classList.remove('hidden'); pricingDisplay.textContent = '-' + discountPercent + '%  →  ¥' + discountedPrice.toFixed(1); }
        else { pricingRow.classList.add('hidden'); }
    }
}
function showReferralProgress(data) {
    var count = data.referral_count || 0;
    var maxRef = data.max_referrals || 10;
    var discountPercent = data.discount_percent || 0;
    var percent = Math.min((count / maxRef) * 100, 100);
    var referralProgressText = document.getElementById('referralProgressText');
    if (referralProgressText) referralProgressText.textContent = count + '/' + maxRef;
    document.getElementById('referralProgressBar').style.width = percent + '%';
    var referralDiscountPercent = document.getElementById('referralDiscountPercent');
    if (referralDiscountPercent) referralDiscountPercent.textContent = discountPercent + '%';
    document.getElementById('referralShareLink').value = data.share_link || '';
}
function copyShareLinkManual() {
    var input = document.getElementById('referralShareLink');
    if (!input || !input.value) { toast('请先登录', true); return; }
    navigator.clipboard.writeText(input.value).then(function() { toast('✅ 链接已复制！'); })
    .catch(function() { input.select(); document.execCommand('copy'); toast('✅ 链接已复制！'); });
}
function copyShareText(platform) {
    if (!referralStatsCache || !referralStatsCache.share_texts) { loadReferralStats(); toast('加载中...'); return; }
    var text = referralStatsCache.share_texts[platform];
    if (!text) { toast('无法获取分享文案', true); return; }
    navigator.clipboard.writeText(text).then(function() { toast('✅ 分享文案已复制！'); })
    .catch(function() { var ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); toast('✅ 分享文案已复制！'); });
}

// Member badge update
(function() {
    var origLoadProfile = window.loadProfile;
    if (origLoadProfile) {
        window._origLoadProfile = origLoadProfile;
        window.loadProfile = function() {
            window._origLoadProfile();
            if (token) {
                fetch('/api/user/status?token=' + encodeURIComponent(token))
                    .then(function(r) { return r.json(); })
                    .then(function(data) {
                        var badge = document.getElementById('memberBadge');
                        if (badge && data.is_member) {
                            var tier = data.membership_tier;
                            if (tier === '1d') badge.textContent = t('vip_1d_member');
                            else if (tier === '1m') badge.textContent = t('vip_1m_member');
                            else badge.textContent = t('permanent_member');
                            badge.style.display = 'inline';
                            var payBtn = document.getElementById('payBtn');
                            if (payBtn) payBtn.style.display = tier === 'perm' || !tier ? 'none' : 'inline-flex';
                        }
                    })
                    .catch(function() {});
            }
        };
    }
})();

// ─── File Upload ─────────────────────────────────────────────────
function setupFileUpload() {
    var zone = document.getElementById('uploadZone');
    var input = document.getElementById('fileInput');
    zone.addEventListener('click', function() { input.click(); });
    zone.addEventListener('dragover', function(e) { e.preventDefault(); zone.classList.add('dragover'); });
    zone.addEventListener('dragleave', function() { zone.classList.remove('dragover'); });
    zone.addEventListener('drop', function(e) {
        e.preventDefault();
        zone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
    });
    input.addEventListener('change', function() { if (input.files.length > 0) handleFile(input.files[0]); });
}

function handleFile(file) {
    if (file.size > 100 * 1024 * 1024) { toast('文件过大，最大 100MB', true); return; }
    var ext = file.name.split('.').pop().toLowerCase();
    if (!['wav','mp3','flac','m4a','ogg','aac'].includes(ext)) { toast('不支持的格式', true); return; }
    var fileName = document.getElementById('fileName');
    if (fileName) fileName.textContent = file.name;
    var fileSize = document.getElementById('fileSize');
    if (fileSize) fileSize.textContent = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
    document.getElementById('fileInfo').classList.remove('hidden');
    if (!token) { showLoginModal(); return; }
    if (!isMember) { toast('请先购买会员', true); return; }
    uploadFile(file);
}

function uploadFile(file) {
    var formData = new FormData();
    formData.append('file', file);
    showProgress('上传中...', 20);
    fetch(API_BASE + '/upload?token=' + encodeURIComponent(token), { method: 'POST', body: formData })
    .then(function(r) { return r.ok ? r.json() : r.json().then(function(e) { return Promise.reject(e.detail); }); })
    .then(function(data) { currentUploadId = data.upload_id; showProgress('上传完成', 40); convertAudio(); })
    .catch(function(err) { hideProgress(); toast(err || '上传失败', true); });
}

// ─── Convert Audio ──────────────────────────────────────────────
function convertAudio() {
    if (!currentUploadId) { toast('请先上传文件', true); return; }
    if (!token || !isMember) { toast('请先购买会员', true); return; }

    var selected = document.querySelector('input[name="mode"]:checked');
    var mode = selected ? selected.value : 'hybrid_nova_medium';
    var btn = document.getElementById('convertBtn');
    btn.disabled = true;
    btn.textContent = '⏳ 处理中...';
    showProgress('处理中...', 50);

    fetch(API_BASE + '/convert?token=' + encodeURIComponent(token), {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'upload_id=' + currentUploadId + '&mode=' + mode
    })
    .then(function(r) { return r.ok ? r.json() : r.json().then(function(e) { return Promise.reject(e.detail); }); })
    .then(function(data) {
        showProgress('处理完成', 100);
        setTimeout(function() { showResult(data); }, 300);
    })
    .catch(function(err) { hideProgress(); toast(err || '处理失败', true); })
    .finally(function() { btn.disabled = false; btn.textContent = '✨ 开始转换'; });
}

function showProgress(text, percent) {
    var area = document.getElementById('progressArea');
    area.classList.remove('hidden');
    var progressText = document.getElementById('progressText');
    if (progressText) progressText.textContent = text;
    document.getElementById('progressBar').style.width = percent + '%';
}

function hideProgress() {
    document.getElementById('progressArea').classList.add('hidden');
    document.getElementById('progressBar').style.width = '0%';
}

function showResult(data) {
    hideProgress();
    document.getElementById('resultArea').classList.remove('hidden');
    var resultDuration = document.getElementById('resultDuration');
    if (resultDuration) resultDuration.textContent = data.duration_seconds + 's';
    var resultSize = document.getElementById('resultSize');
    if (resultSize) resultSize.textContent = data.file_size_mb + ' MB';
    var link = document.getElementById('downloadLink');
    link.href = data.download_url + '?token=' + encodeURIComponent(token);
    link.style.display = 'inline-flex';
    document.getElementById('resultArea').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function resetConverter() {
    currentUploadId = null;
    document.getElementById('resultArea').classList.add('hidden');
    document.getElementById('fileInfo').classList.add('hidden');
    document.getElementById('fileInput').value = '';
}

function scrollToConverter() {
    if (token && isMember) { document.getElementById('converter').scrollIntoView({ behavior: 'smooth' }); }
    else { showLoginModal(); }
}

// ─── Share ──────────────────────────────────────────────────────
function shareTo(platform) {
    var url = encodeURIComponent('https://vitqa.com');
    var text = encodeURIComponent('让你的AI音乐通过检测！vitqa - 48种模式去AI处理平台 🎵');
    var links = {
        twitter: 'https://twitter.com/intent/tweet?text=' + text + '&url=' + url,
        reddit: 'https://reddit.com/submit?url=' + url + '&title=' + text,
        telegram: 'https://t.me/share/url?url=' + url + '&text=' + text,
        copy: ''
    };
    if (platform === 'copy') {
        navigator.clipboard.writeText('https://vitqa.com').then(function() { toast('✅ ' + t('share.linkCopied')); });
        return;
    }
    window.open(links[platform], '_blank', 'width=600,height=400');
}

function toggleFaq(el) {
    el.classList.toggle('open');
    var answer = el.nextElementSibling;
    if (el.classList.contains('open')) { answer.style.maxHeight = answer.scrollHeight + 'px'; }
    else { answer.style.maxHeight = '0'; }
}

function toast(msg, isError) {
    var el = document.getElementById('toast');
    el.textContent = msg;
    el.className = 'toast show' + (isError ? ' error' : '');
    clearTimeout(el._timer);
    el._timer = setTimeout(function() { el.classList.remove('show'); }, 3500);
}

document.addEventListener('DOMContentLoaded', init);

console.log('vitqa v6 init starting...');
try {
    init();
    console.log('vitqa v6 init OK');
} catch(e) {
    console.error('vitqa v6 init FAILED:', e);
    var dbg = document.getElementById('debugInfo') || document.createElement('div');
    dbg.id = 'debugInfo';
    dbg.style.cssText = 'position:fixed;bottom:0;left:0;right:0;background:red;color:white;padding:8px;z-index:9999;font-size:12px;';
    dbg.textContent = 'JS Error: ' + (e.message || e);
    document.body.appendChild(dbg);
}
