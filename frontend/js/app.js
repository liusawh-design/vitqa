/**
 * vitqa Frontend Application v2 - Wallet Auth
 * HPSS AI Music Humanizer - Client-Side Logic
 */

const API_BASE = '/api';
let token = localStorage.getItem('vitqa_token');
let currentUploadId = null;
let isMember = false;
let walletAddress = null;

// ─── Init ────────────────────────────────────────────────────────
function init() {
    if (token) {
        loadProfile();
    }
    updateUI();
    setupFileUpload();
    setupModeCards();
}

function updateUI() {
    const isLoggedIn = !!token && !!walletAddress;
    document.getElementById('connectWalletBtn').classList.toggle('hidden', isLoggedIn);
    document.getElementById('userMenu').classList.toggle('hidden', !isLoggedIn);

    if (token && walletAddress) {
        document.getElementById('userWallet').textContent =
            walletAddress.slice(0, 6) + '...' + walletAddress.slice(-4);
        document.getElementById('memberBadge').classList.toggle('hidden', !isMember);
    }
}

function loadProfile() {
    if (!token) return;
    fetch(`${API_BASE}/profile?token=${encodeURIComponent(token)}`)
        .then(r => r.ok ? r.json() : Promise.reject('Auth failed'))
        .then(data => {
            isMember = data.is_member;
            walletAddress = data.wallet_address;
            if (walletAddress) {
                localStorage.setItem('vitqa_wallet', walletAddress);
            }
            localStorage.setItem('vitqa_is_member', data.is_member);
            updateUI();

            document.getElementById('converterGuest').classList.toggle('hidden', isMember);
            document.getElementById('converterPanel').classList.toggle('hidden', !isMember);
            document.getElementById('pricingCta').innerHTML = isMember
                ? '✅ 已是会员' : '💎 立即购买';
        })
        .catch(() => {
            // Token expired
            localStorage.removeItem('vitqa_token');
            localStorage.removeItem('vitqa_wallet');
            localStorage.removeItem('vitqa_is_member');
            token = null;
            walletAddress = null;
            isMember = false;
            updateUI();
        });
}

// ─── Wallet Auth ─────────────────────────────────────────────────
async function connectMetaMask() {
    if (typeof window.ethereum === 'undefined') {
        toast('请先安装 MetaMask 浏览器扩展', true);
        return;
    }

    try {
        // Step 1: Request accounts
        const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts'
        });
        const addr = accounts[0].toLowerCase();

        // Step 2: Get nonce from server
        toast('请求签名验证...');
        const nonceResp = await fetch(`${API_BASE}/wallet/nonce`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `wallet_address=${encodeURIComponent(addr)}`
        });
        if (!nonceResp.ok) throw new Error('Failed to get nonce');
        const nonceData = await nonceResp.json();

        // Step 3: Sign the message with MetaMask
        const message = nonceData.message;
        toast('请在 MetaMask 中签名...');
        const signature = await window.ethereum.request({
            method: 'personal_sign',
            params: [message, addr]
        });

        // Step 4: Verify signature and login
        toast('验证签名...');
        const loginResp = await fetch(`${API_BASE}/wallet/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `wallet_address=${encodeURIComponent(addr)}&signature=${encodeURIComponent(signature)}`
        });

        if (!loginResp.ok) {
            const err = await loginResp.json();
            throw new Error(err.detail || 'Login failed');
        }

        const loginData = await loginResp.json();

        // Step 5: Save auth state
        token = loginData.token;
        walletAddress = loginData.wallet_address;
        isMember = loginData.is_member;

        localStorage.setItem('vitqa_token', token);
        localStorage.setItem('vitqa_wallet', walletAddress);
        localStorage.setItem('vitqa_is_member', isMember);

        closeModal('walletModal');
        updateUI();
        loadProfile();
        toast('✅ 登录成功！' + (isMember ? ' 已是会员' : ''));

    } catch (err) {
        console.error('Wallet auth error:', err);
        toast(err.message || '钱包登录失败', true);
    }
}

function connectWalletConnect() {
    toast('请在钱包 App 中连接并签名', true);
    // For production: integrate WalletConnect SDK
    // Fallback: MetaMask
    connectMetaMask();
}

// ─── Logout ──────────────────────────────────────────────────────
function logout() {
    localStorage.removeItem('vitqa_token');
    localStorage.removeItem('vitqa_wallet');
    localStorage.removeItem('vitqa_is_member');
    token = null;
    walletAddress = null;
    isMember = false;
    updateUI();
    document.getElementById('converterGuest').classList.remove('hidden');
    document.getElementById('converterPanel').classList.add('hidden');
    toast('已退出');
}

// ─── Modal ───────────────────────────────────────────────────────
function openModal(id) {
    document.getElementById(id).classList.add('open');
}
function closeModal(id) {
    document.getElementById(id).classList.remove('open');
}
document.querySelectorAll('.modal-overlay').forEach(el => {
    el.addEventListener('click', e => {
        if (e.target === el) el.classList.remove('open');
    });
});

// ─── Payment ─────────────────────────────────────────────────────
function handlePricingClick() {
    if (!token) {
        connectMetaMask();
    } else {
        showPayment();
    }
}

function showPayment() {
    if (!token) { connectMetaMask(); return; }

    fetch(`${API_BASE}/payment-info`)
        .then(r => r.json())
        .then(info => {
            document.getElementById('walletAddress').textContent = info.wallet_address;
            openModal('paymentModal');
        })
        .catch(() => toast('获取支付信息失败', true));
}

function copyAddress() {
    const addr = document.getElementById('walletAddress').textContent;
    navigator.clipboard.writeText(addr).then(() => toast('地址已复制'));
}

function verifyPayment() {
    const txHash = document.getElementById('txHashInput').value.trim();
    if (!txHash) { toast('请输入交易哈希', true); return; }

    const statusEl = document.getElementById('paymentStatus');
    statusEl.className = 'payment-status';
    statusEl.textContent = '验证中...';
    statusEl.classList.remove('hidden');

    fetch(`${API_BASE}/verify-payment?token=${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `tx_hash=${encodeURIComponent(txHash)}`
    })
    .then(r => r.json())
    .then(data => {
        if (data.status === 'ok') {
            statusEl.style.background = 'rgba(0,206,201,0.1)';
            statusEl.style.border = '1px solid rgba(0,206,201,0.3)';
            statusEl.style.color = '#00cec9';
            statusEl.textContent = '🎉 ' + data.message;
            isMember = true;
            localStorage.setItem('vitqa_is_member', 'true');
            loadProfile();
            setTimeout(() => closeModal('paymentModal'), 3000);
        } else {
            statusEl.style.background = 'rgba(255,71,87,0.1)';
            statusEl.style.border = '1px solid rgba(255,71,87,0.3)';
            statusEl.style.color = '#ff6b81';
            statusEl.textContent = data.message || '验证中，请稍后重试';
        }
    })
    .catch(() => {
        const statusEl = document.getElementById('paymentStatus');
        statusEl.style.background = 'rgba(255,71,87,0.1)';
        statusEl.style.border = '1px solid rgba(255,71,87,0.3)';
        statusEl.style.color = '#ff6b81';
        statusEl.textContent = '验证请求失败';
    });
}

// ─── File Upload ─────────────────────────────────────────────────
function setupFileUpload() {
    const zone = document.getElementById('uploadZone');
    const input = document.getElementById('fileInput');

    zone.addEventListener('click', () => input.click());
    zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('dragover'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
    zone.addEventListener('drop', e => {
        e.preventDefault();
        zone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
    });
    input.addEventListener('change', () => {
        if (input.files.length > 0) handleFile(input.files[0]);
    });
}

function handleFile(file) {
    if (file.size > 100 * 1024 * 1024) { toast('文件过大，最大 100MB', true); return; }
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['wav','mp3','flac','m4a','ogg','aac'].includes(ext)) { toast('不支持的格式', true); return; }

    document.getElementById('fileName').textContent = file.name;
    document.getElementById('fileSize').textContent = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
    document.getElementById('fileInfo').classList.remove('hidden');

    if (!token) { connectMetaMask(); return; }
    if (!isMember) { toast('请先购买会员', true); return; }

    uploadFile(file);
}

function uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    showProgress('上传中...', 20);

    fetch(`${API_BASE}/upload?token=${encodeURIComponent(token)}`, {
        method: 'POST',
        body: formData
    })
    .then(r => r.ok ? r.json() : r.json().then(e => Promise.reject(e.detail)))
    .then(data => {
        currentUploadId = data.upload_id;
        showProgress('上传完成', 40);
        convertAudio();
    })
    .catch(err => { hideProgress(); toast(err || '上传失败', true); });
}

function setupModeCards() {
    document.querySelectorAll('.mode-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.mode-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            card.querySelector('input').checked = true;
        });
    });
}

function convertAudio() {
    if (!currentUploadId) { toast('请先上传文件', true); return; }
    if (!token || !isMember) { toast('请先购买会员', true); return; }

    const mode = document.querySelector('input[name="mode"]:checked')?.value || 'standard';
    const btn = document.getElementById('convertBtn');
    btn.disabled = true;
    btn.textContent = '⏳ 处理中...';
    showProgress('处理中...', 50);

    fetch(`${API_BASE}/convert?token=${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `upload_id=${currentUploadId}&mode=${mode}`
    })
    .then(r => r.ok ? r.json() : r.json().then(e => Promise.reject(e.detail)))
    .then(data => {
        showProgress('处理完成', 100);
        setTimeout(() => showResult(data), 300);
    })
    .catch(err => { hideProgress(); toast(err || '处理失败', true); })
    .finally(() => { btn.disabled = false; btn.textContent = '✨ 开始转换'; });
}

function showProgress(text, percent) {
    const area = document.getElementById('progressArea');
    area.classList.remove('hidden');
    document.getElementById('progressText').textContent = text;
    document.getElementById('progressBar').style.width = percent + '%';
}

function hideProgress() {
    document.getElementById('progressArea').classList.add('hidden');
    document.getElementById('progressBar').style.width = '0%';
}

function showResult(data) {
    hideProgress();
    document.getElementById('resultArea').classList.remove('hidden');
    document.getElementById('resultDuration').textContent = data.duration_seconds + 's';
    document.getElementById('resultSize').textContent = data.file_size_mb + ' MB';

    const link = document.getElementById('downloadLink');
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
    if (token && isMember) {
        document.getElementById('converter').scrollIntoView({ behavior: 'smooth' });
    } else {
        connectMetaMask();
    }
}

function toast(msg, isError = false) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.className = 'toast show' + (isError ? ' error' : '');
    clearTimeout(el._timer);
    el._timer = setTimeout(() => el.classList.remove('show'), 3500);
}

document.addEventListener('DOMContentLoaded', init);
