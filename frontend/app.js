// ═══════════════════════════════════════════════════════════════
//  CampusClaim — Frontend Application
//  Connects to Express backend via fetch() API calls
// ═══════════════════════════════════════════════════════════════

const API_BASE = 'https://foundit-web.onrender.com';

// ── State ────────────────────────────────────────────────────
let items = [];
let activeTab = 'lost';
let activeCategory = 'all';
let searchQuery = '';
let selectedImageFile = null;
let activeDialogItemId = null;
let activeVerifyItemId = null;
let currentUser = null;
let debounceTimer = null;

// ── DOM Elements ─────────────────────────────────────────────
const mainView = document.getElementById('main-view');
const verificationView = document.getElementById('verify-view');
const successView = document.getElementById('success-view');
const profileView = document.getElementById('profile-view');
const activityView = document.getElementById('inbox-view'); // Reusing activity variable for inbox
const reviewClaimsView = document.getElementById('claims-view');
const impactView = document.getElementById('impact-view');

const itemsGrid = document.getElementById('itemsGrid');
const emptyState = document.getElementById('emptyState');
const loadingState = document.getElementById('loadingState');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabIndicator = document.querySelector('.tab-indicator');
const catBtns = document.querySelectorAll('.cat-btn');
const searchInput = document.getElementById('searchInput');

const fabBtn = document.getElementById('fabBtn');
const formOverlay = document.getElementById('formOverlay');
const formPanel = document.getElementById('formPanel');
const closePanelBtn = document.getElementById('closePanelBtn');
const reportForm = document.getElementById('reportForm');
const itemImageInput = document.getElementById('itemImage');
const imagePreview = document.getElementById('imagePreview');
const imagePreviewImg = document.getElementById('imagePreviewImg');
const removeImageBtn = document.getElementById('removeImageBtn');

const itemDialogOverlay = document.getElementById('itemDialogOverlay');
const itemDialog = document.getElementById('itemDialog');
const dialogContent = document.getElementById('dialogContent');
const closeDialogBtn = document.getElementById('closeDialogBtn');

const statActive = document.getElementById('stat-active');
const statReturned = document.getElementById('stat-returned');

// Verification View
const verifyBackBtn = document.getElementById('verifyBackBtn');
const verifyItemMedia = document.getElementById('verifyItemMedia');
const verifyItemType = document.getElementById('verifyItemType');
const verifyItemName = document.getElementById('verifyItemName');
const verifyItemDesc = document.getElementById('verifyItemDesc');
const verifyItemCategory = document.getElementById('verifyItemCategory');
const verifyItemDate = document.getElementById('verifyItemDate');
const verifyItemLocation = document.getElementById('verifyItemLocation');

const verifyContactLabel = document.getElementById('verifyContactLabel');
const verifyContactValue = document.getElementById('verifyContactValue');
const copyContactBtn = document.getElementById('copyContactBtn');
const verifyQuestionLabel = document.getElementById('verifyQuestionLabel');
const verifyQuestionText = document.getElementById('verifyQuestionText');
const verifyAnswerInput = document.getElementById('verifyAnswerInput');
const verifyErrorMsg = document.getElementById('verifyErrorMsg');
const submitVerifyBtn = document.getElementById('submitVerifyBtn');
const verifySummaryIcon = document.querySelector('.summary-icon');
const verifyBadge = document.querySelector('.verify-badge');
const cancelVerifyBtn = document.querySelector('.verify-actions .cancel-btn');

// Success View
const successContactValue = document.getElementById('successContactValue');
const emailContactBtn = document.getElementById('emailContactBtn');
const successDoneBtn = document.getElementById('successDoneBtn');

// Auth elements
const authArea = document.getElementById('authArea');
const signInBtn = document.getElementById('signInBtn');
const authOverlay = document.getElementById('authOverlay');
const authModal = document.getElementById('authModal');
const closeAuthBtn = document.getElementById('closeAuthBtn');
const authTabBtns = document.querySelectorAll('.auth-tab-btn');
const authTabIndicator = document.querySelector('.auth-tab-indicator');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginError = document.getElementById('loginError');
const registerError = document.getElementById('registerError');
const profileName = document.getElementById('profileName');
const profileEmail = document.getElementById('profileEmail');
const profileAvatar = document.getElementById('profileAvatar');

// ── Icons & Helpers ──────────────────────────────────────────
const categoryIcons = {
    'electronics': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect></svg>',
    'clothing': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.38 3.46L16 2a8.5 8.5 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"></path></svg>',
    'accessories': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>',
    'keys': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path></svg>',
    'other': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>'
};

const clockIcon = `<svg class="meta-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`;
const pinIcon = `<svg class="meta-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`;

function escapeHtml(value = '') {
    return String(value).replace(/[&<>"']/g, (character) => {
        const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
        return entities[character];
    });
}

function formatItemDate(date) {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getDialogAction(item) {
    if (item.type === 'lost') {
        return {
            label: 'I found this item',
            note: 'We will mark this listing as reunited and show the owner contact details.'
        };
    }
    return {
        label: 'This item is mine',
        note: 'We will mark this listing as claimed and show the finder contact details.'
    };
}

/**
 * Map API response fields to the frontend's expected property names.
 */
function mapItem(apiItem) {
    return {
        id: apiItem.id,
        type: apiItem.type,
        name: apiItem.title,
        category: apiItem.category,
        date: apiItem.date_reported,
        location: apiItem.location,
        description: apiItem.description || '',
        contact: apiItem.contact_info,
        contactName: apiItem.contact_name,
        icon: apiItem.emoji,
        image: apiItem.image_url,
        question: apiItem.verification_question,
        status: apiItem.status,
        variance: Math.floor(Math.random() * 3) + 1,
    };
}

// ── Toast Notification ───────────────────────────────────────
function showToast(message, duration = 3000) {
    let toast = document.querySelector('.toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    
    // Clear any existing timeout on this toast
    if (toast.hideTimeout) clearTimeout(toast.hideTimeout);
    
    // Force reflow
    void toast.offsetWidth;
    toast.classList.add('visible');
    
    toast.hideTimeout = setTimeout(() => toast.classList.remove('visible'), duration);
}

// ── Auth Helpers ─────────────────────────────────────────────
function getToken() {
    return localStorage.getItem('cc_token');
}

function setToken(token) {
    localStorage.setItem('cc_token', token);
}

function clearToken() {
    localStorage.removeItem('cc_token');
}

function authHeaders() {
    const token = getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

function updateAuthUI() {
    if (currentUser) {
        authArea.innerHTML = `
            <div class="auth-session">
                <button class="auth-profile-trigger" id="profileTriggerBtn" type="button" aria-label="Open profile">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <span class="auth-user-name">${escapeHtml(currentUser.name)}</span>
                </button>
                <button class="auth-signout" id="signOutBtn" type="button">Sign out</button>
            </div>
        `;
        document.getElementById('profileTriggerBtn').addEventListener('click', () => showView('profile'));
        document.getElementById('signOutBtn').addEventListener('click', signOut);
        renderProfile();
    } else {
        authArea.innerHTML = `
            <button class="auth-btn" id="signInBtn">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
                Sign in
            </button>
        `;
        document.getElementById('signInBtn').addEventListener('click', openAuthModal);
    }
}

function renderProfile() {
    if (!currentUser) return;

    if (profileName) profileName.textContent = currentUser.name || 'Student';
    if (profileEmail) {
        profileEmail.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round">
                <path d="M4 4h16v16H4z"></path>
                <path d="m22 6-10 7L2 6"></path>
            </svg>
            ${escapeHtml(currentUser.email || 'No email on file')}
        `;
    }
    if (profileAvatar) {
        profileAvatar.alt = currentUser.name || 'Student profile';
        profileAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || 'Student')}&background=c7d2fe&color=3730a3&size=80`;
    }
}

async function checkAuth() {
    const token = getToken();
    if (!token) {
        currentUser = null;
        updateAuthUI();
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/api/auth/me`, {
            headers: authHeaders(),
        });
        if (res.ok) {
            currentUser = await res.json();
        } else {
            clearToken();
            currentUser = null;
        }
    } catch (_) {
        currentUser = null;
    }
    updateAuthUI();
}

function requireAuthAction(actionName) {
    if (!getToken()) {
        showToast(`Please sign in to ${actionName}`);
        openAuthModal();
        return false;
    }
    return true;
}

function signOut() {
    clearToken();
    currentUser = null;
    updateAuthUI();
    showToast('Signed out');
}

// ── Auth Modal ───────────────────────────────────────────────
function openAuthModal() {
    authOverlay.classList.add('active');
    authModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    loginError.style.display = 'none';
    registerError.style.display = 'none';
}

function closeAuthModal() {
    authOverlay.classList.remove('active');
    authModal.classList.remove('active');
    document.body.style.overflow = '';
    loginForm.reset();
    registerForm.reset();
    loginError.style.display = 'none';
    registerError.style.display = 'none';
}

// ── API Calls ────────────────────────────────────────────────
async function fetchItems() {
    try {
        itemsGrid.style.display = 'none';
        emptyState.style.display = 'none';
        loadingState.style.display = 'block';

        const params = new URLSearchParams();
        if (activeTab !== 'all') params.set('type', activeTab);
        if (activeCategory !== 'all') params.set('category', activeCategory);
        if (searchQuery.trim()) params.set('q', searchQuery.trim());

        const res = await fetch(`${API_BASE}/api/items?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch items');

        const apiItems = await res.json();
        items = apiItems.map(mapItem);

        loadingState.style.display = 'none';
        updateStats();
        updateNotificationBadge();
        renderItems();
    } catch (err) {
        console.error('Fetch items error:', err);
        loadingState.style.display = 'none';
        items = [];
        renderItems();
        showToast('Failed to load items. Is the server running?');
    }
}

async function createItem(formData) {
    const res = await fetch(`${API_BASE}/api/items`, {
        method: 'POST',
        headers: authHeaders(),
        body: formData,
    });

    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to create item');
    }

    return res.json();
}

async function claimItem(itemId, answer) {
    const res = await fetch(`${API_BASE}/api/items/${itemId}/claim`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            ...authHeaders(),
        },
        body: JSON.stringify({ answer }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Claim failed');
    return data;
}

// ── Initialize ───────────────────────────────────────────────
async function init() {
    await checkAuth();
    setupEventListeners();
    fetchItems();
}

// ── Render Logic ─────────────────────────────────────────────
function renderItems() {
    itemsGrid.innerHTML = '';

    // Items already filtered server-side; just render them
    const filteredItems = items;

    if (filteredItems.length === 0) {
        itemsGrid.style.display = 'none';
        emptyState.style.display = 'block';
    } else {
        itemsGrid.style.display = 'grid';
        emptyState.style.display = 'none';

        filteredItems.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = `item-card`;
            card.tabIndex = 0;
            card.setAttribute('role', 'button');
            card.setAttribute('aria-label', `Open details for ${item.name}`);
            card.style.animationDelay = `${index * 0.05}s`;

            const dateStr = formatItemDate(item.date);
            const cardMedia = item.image
                ? `<div class="item-photo"><img src="${item.image}" alt="${escapeHtml(item.name)}"></div>`
                : `<div class="item-icon-wrapper">${categoryIcons[item.category] || categoryIcons['other']}</div>`;

            card.innerHTML = `
                <div class="item-card-image-container">
                    ${cardMedia}
                    <div class="item-status ${item.type}">${escapeHtml(item.type)}</div>
                </div>
                <div class="item-card-content">
                    <h3 class="item-title">${escapeHtml(item.name)}</h3>
                    <p class="item-desc">${escapeHtml(item.description)}</p>
                    
                    <div class="item-meta">
                        <div class="meta-row">
                            ${pinIcon}
                            <span>${escapeHtml(item.location)}</span>
                        </div>
                        <div class="meta-row">
                            ${clockIcon}
                            <span>${dateStr}</span>
                        </div>
                    </div>
                </div>
            `;

            card.addEventListener('click', () => openItemDialog(item.id));
            card.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openItemDialog(item.id);
                }
            });

            itemsGrid.appendChild(card);
        });
    }
}

function updateStats() {
    const activeCount = items.length;
    if (statActive) statActive.textContent = activeCount;
    // Returned count: keep the original seed of 24 + any we don't have visibility into
    if (statReturned) statReturned.textContent = 24;
}

function updateNotificationBadge() {
    const badgeEl = document.getElementById('notificationBadge');
    if (!badgeEl) return;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const unreadCount = items.filter(item => {
        const reportDate = new Date(item.date);
        return reportDate >= sevenDaysAgo;
    }).length;

    if (unreadCount > 0) {
        badgeEl.textContent = unreadCount;
        badgeEl.style.display = 'flex';
    } else {
        badgeEl.style.display = 'none';
    }
}

// ── Event Listeners ──────────────────────────────────────────
function setupEventListeners() {
    // Navigation Links
    const navLinks = document.querySelectorAll('.nav-link[data-nav]');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const viewName = link.dataset.nav;
            showView(viewName);
        });
    });

    const navReportBtn = document.getElementById('navReportBtn');
    if (navReportBtn) {
        navReportBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (!requireAuthAction('report an item')) return;
            formOverlay.classList.add('active');
            formPanel.classList.add('active');
            document.body.classList.add('panel-open');
            document.body.style.overflow = 'hidden';
        });
    }

    // Tabs
    tabBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeTab = btn.dataset.tab;

            if (activeTab === 'found') {
                tabIndicator.style.transform = 'translateX(100%)';
            } else {
                tabIndicator.style.transform = 'translateX(0)';
            }

            fetchItems(); // Re-fetch from API with new filter
        });
    });

    // Categories
    catBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            catBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeCategory = btn.dataset.cat;
            fetchItems(); // Re-fetch from API with new filter
        });
    });

    // Search with debounce (300ms)
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            fetchItems();
        }, 300);
    });

    // Form Panel — require auth
    fabBtn.addEventListener('click', () => {
        if (!requireAuthAction('report an item')) return;
        formOverlay.classList.add('active');
        formPanel.classList.add('active');
        document.body.classList.add('panel-open');
        document.body.style.overflow = 'hidden'; 
    });
    closePanelBtn.addEventListener('click', closePanel);
    formOverlay.addEventListener('click', closePanel);
    itemImageInput.addEventListener('change', handleImageSelection);
    removeImageBtn.addEventListener('click', clearSelectedImage);

    // Detail Dialog
    closeDialogBtn.addEventListener('click', closeItemDialog);
    itemDialogOverlay.addEventListener('click', closeItemDialog);
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closePanel();
            closeItemDialog();
            closeAuthModal();
        }
    });
    dialogContent.addEventListener('click', (event) => {
        const actionButton = event.target.closest('[data-dialog-action]');
        if (!actionButton) return;
        if (!requireAuthAction('claim this item')) return;
        initiateVerification(actionButton.dataset.itemId);
    });

    // Verification View
    verifyBackBtn.addEventListener('click', () => showView('main'));
    if (copyContactBtn) copyContactBtn.addEventListener('click', copyContactToClipboard);
    submitVerifyBtn.addEventListener('click', submitVerification);
    if (cancelVerifyBtn) cancelVerifyBtn.addEventListener('click', () => showView('main'));
    verifyAnswerInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') submitVerification();
    });

    // Success View
    successDoneBtn.addEventListener('click', () => {
        fetchItems(); // Refresh the list
        showView('main');
        activeVerifyItemId = null;
    });

    // Report Form Submit — POST to API
    reportForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!requireAuthAction('submit a report')) return;

        const submitBtn = reportForm.querySelector('.submit-btn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';

        try {
            const formData = new FormData();
            formData.append('type', document.querySelector('input[name="reportType"]:checked').value);
            formData.append('title', document.getElementById('itemName').value);
            formData.append('category', document.getElementById('itemCategory').value);
            formData.append('date_reported', document.getElementById('itemDate').value);
            formData.append('location', document.getElementById('itemLocation').value);
            formData.append('description', document.getElementById('itemDesc').value);
            formData.append('contact_info', document.getElementById('contactInfo').value);
            formData.append('verification_question', document.getElementById('verificationQuestion').value);
            formData.append('secret_answer', document.getElementById('verificationAnswer').value);

            const category = document.getElementById('itemCategory').value;
            formData.append('emoji', categoryIcons[category] || '📦');

            // Attach image file if selected
            if (selectedImageFile) {
                formData.append('image', selectedImageFile);
            }

            const newApiItem = await createItem(formData);
            const newItem = mapItem(newApiItem);

            // Switch to the tab of the submitted item
            const targetTabBtn = document.querySelector(`.tab-btn[data-tab="${newItem.type}"]`);
            targetTabBtn.click(); // This triggers fetchItems()

            closePanel();
            reportForm.reset();
            clearSelectedImage();
            showToast('Item reported successfully!');
        } catch (err) {
            console.error('Submit error:', err);
            showToast(err.message || 'Failed to submit report');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Report';
        }
    });

    // Auth Modal Events
    closeAuthBtn.addEventListener('click', closeAuthModal);
    authOverlay.addEventListener('click', closeAuthModal);

    // Auth Tabs
    authTabBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            authTabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const tab = btn.dataset.authTab;

            if (tab === 'login') {
                loginForm.style.display = 'flex';
                registerForm.style.display = 'none';
                authTabIndicator.style.transform = 'translateX(0)';
            } else {
                loginForm.style.display = 'none';
                registerForm.style.display = 'flex';
                authTabIndicator.style.transform = 'translateX(100%)';
            }
            loginError.style.display = 'none';
            registerError.style.display = 'none';
        });
    });

    // Login Form
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        loginError.style.display = 'none';
        const btn = loginForm.querySelector('.submit-btn');
        btn.disabled = true;
        btn.textContent = 'Signing in...';

        try {
            const res = await fetch(`${API_BASE}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: document.getElementById('loginEmail').value,
                    password: document.getElementById('loginPassword').value,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Login failed');

            setToken(data.token);
            currentUser = data.user;
            updateAuthUI();
            closeAuthModal();
            showToast(`Welcome back, ${data.user.name}!`);
        } catch (err) {
            loginError.textContent = err.message;
            loginError.style.display = 'block';
        } finally {
            btn.disabled = false;
            btn.textContent = 'Sign In';
        }
    });

    // Register Form
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        registerError.style.display = 'none';
        const btn = registerForm.querySelector('.submit-btn');
        btn.disabled = true;
        btn.textContent = 'Creating account...';

        try {
            const res = await fetch(`${API_BASE}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: document.getElementById('registerName').value,
                    email: document.getElementById('registerEmail').value,
                    password: document.getElementById('registerPassword').value,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Registration failed');

            setToken(data.token);
            currentUser = data.user;
            updateAuthUI();
            closeAuthModal();
            showToast(`Welcome, ${data.user.name}!`);
        } catch (err) {
            registerError.textContent = err.message;
            registerError.style.display = 'block';
        } finally {
            btn.disabled = false;
            btn.textContent = 'Create Account';
        }
    });

    // Sign in button (initial)
    signInBtn.addEventListener('click', openAuthModal);

    // Notification Bell Click Handler
    const notificationBellBtn = document.getElementById('notificationBellBtn');
    if (notificationBellBtn) {
        notificationBellBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showView('activity');
        });
    }
}

// ── Image Handling ───────────────────────────────────────────
function handleImageSelection(event) {
    const file = event.target.files[0];
    if (!file) {
        clearSelectedImage();
        return;
    }

    if (!file.type.startsWith('image/')) {
        alert('Please choose an image file.');
        clearSelectedImage();
        return;
    }

    selectedImageFile = file;

    const reader = new FileReader();
    reader.addEventListener('load', () => {
        imagePreviewImg.src = reader.result;
        imagePreview.hidden = false;
    });
    reader.readAsDataURL(file);
}

function clearSelectedImage() {
    selectedImageFile = null;
    itemImageInput.value = '';
    imagePreviewImg.removeAttribute('src');
    imagePreview.hidden = true;
}

// ── Item Dialog ──────────────────────────────────────────────
function openItemDialog(itemId) {
    const item = items.find(currentItem => currentItem.id === itemId);
    if (!item) return;

    activeDialogItemId = itemId;
    const action = getDialogAction(item);
    const dateStr = new Date(item.date).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
    const dialogMedia = item.image
        ? `<div class="dialog-photo"><img src="${item.image}" alt="${escapeHtml(item.name)}"></div>`
        : `<div class="dialog-icon">${categoryIcons[item.category] || categoryIcons['other']}</div>`;

    dialogContent.innerHTML = `
        <div class="dialog-hero ${item.type}">
            ${dialogMedia}
            <div>
                <span class="item-status ${item.type}">${escapeHtml(item.type)} item</span>
                <h2 id="dialogTitle">${escapeHtml(item.name)}</h2>
                <p>${escapeHtml(item.description)}</p>
            </div>
        </div>
        <div class="dialog-details">
            <div>
                <span>Category</span>
                <strong>${escapeHtml(item.category)}</strong>
            </div>
            <div>
                <span>Date</span>
                <strong>${dateStr}</strong>
            </div>
            <div>
                <span>Location</span>
                <strong>${escapeHtml(item.location)}</strong>
            </div>
            <div>
                <span>Contact</span>
                <strong>${escapeHtml(item.contact)}</strong>
            </div>
        </div>
        <div class="dialog-action-box">
            <p>${action.note}</p>
            <button type="button" class="submit-btn dialog-action-btn" data-dialog-action="reunited" data-item-id="${item.id}">
                ${action.label}
            </button>
        </div>
    `;

    itemDialogOverlay.classList.add('active');
    itemDialog.classList.add('active');
    document.body.style.overflow = 'hidden';
    closeDialogBtn.focus();
}

function closeItemDialog() {
    if (!itemDialog.classList.contains('active')) return;

    activeDialogItemId = null;
    itemDialogOverlay.classList.remove('active');
    itemDialog.classList.remove('active');
    document.body.style.overflow = formPanel.classList.contains('active') ? 'hidden' : '';
}

// ── Views ────────────────────────────────────────────────────
function showView(viewName) {
    const aliases = {
        inbox: 'activity',
        claims: 'review-claims',
    };
    viewName = aliases[viewName] || viewName;

    if (['profile', 'activity', 'review-claims'].includes(viewName)) {
        const actionName = viewName === 'profile'
            ? 'view your profile'
            : viewName === 'activity'
                ? 'view activity'
                : 'review claims';
        if (!requireAuthAction(actionName)) return;
    }

    if (viewName === 'verification' && !activeVerifyItemId && items.length > 0) {
        activeVerifyItemId = items[0].id;
        populateVerification(items[0]);
    }

    // Hide all views
    [mainView, verificationView, successView, profileView, activityView, reviewClaimsView, impactView].forEach(view => {
        if (view) view.classList.remove('active-view');
    });
    
    // Update active state in nav
    document.querySelectorAll('.nav-link[data-nav]').forEach(link => {
        if (link.dataset.nav === viewName) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    if (viewName === 'main') {
        mainView.classList.add('active-view');
    } else if (viewName === 'profile') {
        renderProfile();
        profileView.classList.add('active-view');
    } else if (viewName === 'activity') {
        activityView.classList.add('active-view');
    } else if (viewName === 'review-claims') {
        reviewClaimsView.classList.add('active-view');
    } else if (viewName === 'verification') {
        if (verifyAnswerInput) {
            verifyAnswerInput.value = '';
            verifyAnswerInput.classList.remove('input-error', 'input-success');
        }
        if (verifyErrorMsg) verifyErrorMsg.style.display = 'none';
        verificationView.classList.add('active-view');
        if (verifyAnswerInput) verifyAnswerInput.focus();
    } else if (viewName === 'success') {
        successView.classList.add('active-view');
    } else if (viewName === 'impact') {
        impactView.classList.add('active-view');
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
}

// ── Verification Flow ────────────────────────────────────────
function populateVerification(item) {
    const verifyMedia = item.image
        ? `<img src="${item.image}" alt="${escapeHtml(item.name)}">`
        : `<div class="verify-item-icon">${categoryIcons[item.category] || categoryIcons['other']}</div>`;
    if (verifyItemMedia) verifyItemMedia.innerHTML = verifyMedia;
    if (verifySummaryIcon) verifySummaryIcon.innerHTML = verifyMedia;

    if (verifyItemType) {
        verifyItemType.className = `item-status ${item.type}`;
        verifyItemType.textContent = `${item.type} item`;
    }
    if (verifyBadge) {
        verifyBadge.className = `verify-badge ${item.type}`;
        verifyBadge.textContent = `${item.type} item`;
    }

    verifyItemName.textContent = item.name;
    if (verifyItemDesc) verifyItemDesc.textContent = item.description;

    if (verifyItemCategory) verifyItemCategory.textContent = item.category;
    if (verifyItemDate) {
        verifyItemDate.textContent = new Date(item.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }
    verifyItemLocation.textContent = item.location;

    if (verifyContactLabel) verifyContactLabel.textContent = item.type === 'lost' ? 'Owner Contact' : 'Finder Contact';
    if (verifyContactValue) verifyContactValue.textContent = item.contact;

    const question = item.question || 'What color or distinguishing feature does this item have?';
    if (verifyQuestionLabel) verifyQuestionLabel.textContent = question;
    if (verifyQuestionText) verifyQuestionText.textContent = question;
}

function initiateVerification(itemId) {
    const item = items.find(currentItem => currentItem.id === itemId);
    if (!item) return;

    activeVerifyItemId = itemId;
    populateVerification(item);

    closeItemDialog();
    showView('verification');
}

async function submitVerification() {
    const item = items.find(currentItem => currentItem.id === activeVerifyItemId);
    if (!item) return;

    const userAnswer = verifyAnswerInput.value.trim();
    if (!userAnswer) {
        verifyAnswerInput.classList.add('input-error');
        if (verifyErrorMsg) verifyErrorMsg.style.display = 'flex';
        return;
    }

    // Disable button during API call
    submitVerifyBtn.disabled = true;
    submitVerifyBtn.textContent = 'Verifying...';

    try {
        const data = await claimItem(item.id, userAnswer);

        verifyAnswerInput.classList.remove('input-error');
        verifyAnswerInput.classList.add('input-success');
        if (verifyErrorMsg) verifyErrorMsg.style.display = 'none';

        // Show success screen
        successContactValue.textContent = item.contact;
        emailContactBtn.href = `mailto:${item.contact}?subject=Re: ${encodeURIComponent(item.name)} Match on FoundIt`;

        setTimeout(() => {
            showView('success');
        }, 400);
    } catch (err) {
        verifyAnswerInput.classList.remove('input-success', 'input-error');
        void verifyAnswerInput.offsetWidth; // Force reflow
        verifyAnswerInput.classList.add('input-error');
        if (verifyErrorMsg) verifyErrorMsg.style.display = 'flex';

        if (err.message && !err.message.includes('Incorrect')) {
            showToast(err.message);
        }
    } finally {
        submitVerifyBtn.disabled = false;
        submitVerifyBtn.textContent = 'Submit Claim Request';
    }
}

// ── Clipboard ────────────────────────────────────────────────
function copyContactToClipboard() {
    const contactText = verifyContactValue.textContent;
    navigator.clipboard.writeText(contactText).then(() => {
        const originalHTML = copyContactBtn.innerHTML;
        copyContactBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
        `;
        copyContactBtn.style.color = 'var(--found-color)';
        setTimeout(() => {
            copyContactBtn.innerHTML = originalHTML;
            copyContactBtn.style.color = '';
        }, 1500);
    }).catch(err => {
        console.error('Failed to copy contact details: ', err);
    });
}

// ── Panel ────────────────────────────────────────────────────
function openPanel() {
    formOverlay.classList.add('active');
    formPanel.classList.add('active');
    document.body.classList.add('panel-open');
    document.body.style.overflow = 'hidden';
}

function closePanel() {
    formOverlay.classList.remove('active');
    formPanel.classList.remove('active');
    document.body.classList.remove('panel-open');
    document.body.style.overflow = '';
}

// ── Run ──────────────────────────────────────────────────────
init();
