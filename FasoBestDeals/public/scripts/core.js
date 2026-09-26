/**
 * FasoBestDeals — Core Utilities & Security Layer
 * Shared across all pages: auth, security, cart, toast, nav, theming
 */

'use strict';

// ═══════════════════════════════════════════════════════
//  SECURITY UTILITIES
// ═══════════════════════════════════════════════════════
const Security = (() => {
  const RATE_LIMIT_MAP = new Map();

  function sanitize(str) {
    if (typeof str !== 'string') return str;
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '');
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(email).trim());
  }

  function validatePassword(pw) {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(pw);
  }

  function validatePhone(phone) {
    if (!phone) return true;
    return /^[\+]?[\d\s\-\(\)]{7,20}$/.test(phone);
  }

  function csrfToken() {
    let t = sessionStorage.getItem('fbds_csrf');
    if (!t) {
      t = crypto.getRandomValues(new Uint8Array(16)).reduce((s, b) => s + b.toString(16).padStart(2, '0'), '');
      sessionStorage.setItem('fbds_csrf', t);
    }
    return t;
  }

  function rateLimit(key, maxAttempts = 5, windowMs = 60000) {
    const now = Date.now();
    const data = RATE_LIMIT_MAP.get(key) || { count: 0, windowStart: now };
    if (now - data.windowStart > windowMs) {
      data.count = 0;
      data.windowStart = now;
    }
    data.count++;
    RATE_LIMIT_MAP.set(key, data);
    return data.count > maxAttempts;
  }

  function sanitizeObject(obj) {
    if (typeof obj !== 'object' || obj === null) return sanitize(String(obj));
    return Object.fromEntries(Object.entries(obj).map(([k, v]) => [sanitize(k), sanitize(String(v))]));
  }

  function generateId(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }

  function logEvent(action, details = {}, severity = 'info') {
    try {
      const logs = JSON.parse(localStorage.getItem('fbds_audit') || '[]');
      logs.unshift({
        id: generateId('log'),
        timestamp: new Date().toISOString(),
        action,
        details,
        severity,
        page: location.pathname.split('/').pop()
      });
      localStorage.setItem('fbds_audit', JSON.stringify(logs.slice(0, 500)));
    } catch (_) {}
  }

  return { sanitize, validateEmail, validatePassword, validatePhone, csrfToken, rateLimit, sanitizeObject, generateId, logEvent };
})();


// ═══════════════════════════════════════════════════════
//  AUTH MODULE
// ═══════════════════════════════════════════════════════
const Auth = (() => {
  const USERS_KEY = 'fbds_users';
  const SESSION_KEY = 'fbds_session';
  const REMEMBER_KEY = 'fbds_remember';

  function getUsers() {
    try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); } catch { return []; }
  }

  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  function getCurrentUser() {
    try {
      let u = sessionStorage.getItem(SESSION_KEY);
      if (u) return JSON.parse(u);
      const token = localStorage.getItem(REMEMBER_KEY);
      if (token) {
        const found = getUsers().find(u => u.rememberToken === token && u.tokenExpiry > Date.now());
        if (found) { setCurrentUser(found, false); return found; }
        localStorage.removeItem(REMEMBER_KEY);
      }
    } catch (_) {}
    return null;
  }

  function setCurrentUser(user, remember = false) {
    const safe = { id: user.id, name: user.name, email: user.email, phone: user.phone, joinDate: user.joinDate, avatar: user.avatar };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(safe));
    if (remember) {
      const token = Security.generateId('rt');
      const tokenExpiry = Date.now() + 30 * 24 * 3600 * 1000;
      localStorage.setItem(REMEMBER_KEY, token);
      const users = getUsers();
      const idx = users.findIndex(u => u.id === user.id);
      if (idx !== -1) { users[idx].rememberToken = token; users[idx].tokenExpiry = tokenExpiry; saveUsers(users); }
    }
  }

  function register(data) {
    if (Security.rateLimit('register', 5, 3600000)) return { ok: false, error: 'Trop de tentatives. Réessayez plus tard.' };
    const users = getUsers();
    if (users.find(u => u.email.toLowerCase() === data.email.toLowerCase())) return { ok: false, error: 'Cet email est déjà utilisé.' };
    if (!Security.validateEmail(data.email)) return { ok: false, error: 'Email invalide.' };
    if (!Security.validatePassword(data.password)) return { ok: false, error: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre.' };
    const user = {
      id: Security.generateId('usr'),
      name: Security.sanitize(data.name.trim()),
      email: data.email.toLowerCase().trim(),
      phone: Security.sanitize(data.phone || ''),
      passwordHash: simpleHash(data.password),
      joinDate: new Date().toISOString(),
      orders: [],
      wishlist: [],
      addresses: [],
      avatar: null
    };
    users.push(user);
    saveUsers(users);
    Security.logEvent('user_register', { email: user.email });
    setCurrentUser(user, false);
    return { ok: true, user };
  }

  function login(email, password, remember = false) {
    if (Security.rateLimit('login', 10, 600000)) return { ok: false, error: 'Trop de tentatives. Attendez 10 minutes.' };
    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!user || user.passwordHash !== simpleHash(password)) {
      Security.logEvent('login_fail', { email }, 'warning');
      return { ok: false, error: 'Email ou mot de passe incorrect.' };
    }
    Security.logEvent('login_success', { email: user.email });
    setCurrentUser(user, remember);
    return { ok: true, user };
  }

  function logout() {
    const user = getCurrentUser();
    if (user) {
      const users = getUsers();
      const idx = users.findIndex(u => u.id === user.id);
      if (idx !== -1) { delete users[idx].rememberToken; saveUsers(users); }
      Security.logEvent('logout', { userId: user.id });
    }
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(REMEMBER_KEY);
    location.href = 'login.html';
  }

  function updateProfile(updates) {
    const user = getCurrentUser();
    if (!user) return { ok: false, error: 'Non connecté.' };
    const users = getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx === -1) return { ok: false, error: 'Utilisateur introuvable.' };
    const allowed = ['name', 'phone', 'avatar', 'addresses'];
    allowed.forEach(k => { if (updates[k] !== undefined) users[idx][k] = updates[k]; });
    saveUsers(users);
    setCurrentUser(users[idx], false);
    return { ok: true };
  }

  function simpleHash(str) {
    // Note: in production, use bcrypt server-side. This is client-side demo only.
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return 'h_' + Math.abs(hash).toString(36) + '_' + str.length;
  }

  return { getCurrentUser, register, login, logout, updateProfile, getUsers };
})();


// ═══════════════════════════════════════════════════════
//  CART MODULE
// ═══════════════════════════════════════════════════════
const Cart = (() => {
  const KEY = 'fbds_cart';

  function get() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
  }

  function save(items) {
    localStorage.setItem(KEY, JSON.stringify(items));
    updateBadges();
    window.dispatchEvent(new CustomEvent('cart:updated', { detail: { items } }));
  }

  function add(product, qty = 1, size = null) {
    const items = get();
    const key = `${product.id}_${size || 'default'}`;
    const existing = items.find(i => i._key === key);
    if (existing) {
      existing.quantity = Math.min(existing.quantity + qty, 99);
    } else {
      items.push({
        _key: key,
        id: product.id,
        name: Security.sanitize(product.name),
        price: Number(product.price),
        image: product.image,
        size: size,
        quantity: qty,
        category: product.category
      });
    }
    save(items);
    Security.logEvent('cart_add', { productId: product.id, qty });
  }

  function remove(key) {
    const items = get().filter(i => i._key !== key);
    save(items);
  }

  function update(key, qty) {
    const items = get();
    const item = items.find(i => i._key === key);
    if (item) {
      if (qty <= 0) { remove(key); return; }
      item.quantity = Math.min(qty, 99);
      save(items);
    }
  }

  function clear() { save([]); }

  function total() {
    return get().reduce((sum, i) => sum + i.price * i.quantity, 0);
  }

  function count() {
    return get().reduce((sum, i) => sum + i.quantity, 0);
  }

  function updateBadges() {
    const n = count();
    document.querySelectorAll('[data-cart-count]').forEach(el => {
      el.textContent = n;
      el.style.display = n > 0 ? '' : 'none';
    });
  }

  return { get, add, remove, update, clear, total, count, updateBadges };
})();


// ═══════════════════════════════════════════════════════
//  PRODUCTS MODULE
// ═══════════════════════════════════════════════════════
const Products = (() => {
  const KEY = 'fbds_products';

  const DEFAULTS = [
    { id: 1, name: 'Bouteille Inox 1L Premium', category: 'Bouteilles', price: 7900, stock: 45, rating: 4.8, reviews: 127, description: 'Bouteille en acier inoxydable à double paroi, maintient les boissons froides 24h ou chaudes 12h. Écologique et durable.', image: '../media/bottles.jpg', sizes: ['S','M','L'], badge: 'Bestseller' },
    { id: 2, name: 'Bouteille en Verre Premium', category: 'Bouteilles', price: 6500, stock: 32, rating: 4.6, reviews: 89, description: 'Bouteille en verre éco-responsable avec manchon en silicone protecteur, sans BPA, compatible lave-vaisselle.', image: '../media/siyuan-g_V2rt6iG7A-unsplash.jpg', sizes: ['S','M'], badge: 'Nouveau' },
    { id: 3, name: 'Support Téléphone Pro', category: 'Accessoires', price: 3500, stock: 60, rating: 4.5, reviews: 203, description: 'Support téléphone universel réglable, compatible avec tous les smartphones. Stable et élégant.', image: '../media/phone-stand.jpg', sizes: null, badge: null },
    { id: 4, name: 'Gourde de Randonnée', category: 'Équipement', price: 5200, stock: 28, rating: 4.7, reviews: 56, description: 'Gourde robuste idéale pour le sport et la randonnée. Légère, résistante, capacité 750ml.', image: '../media/gourde.jpg', sizes: ['M','L','XL'], badge: 'Promo' },
  ];

  function get() {
    try {
      const s = localStorage.getItem(KEY);
      if (s) { const p = JSON.parse(s); if (p && p.length > 0) return p; }
    } catch (_) {}
    save(DEFAULTS);
    return DEFAULTS;
  }

  function save(products) { localStorage.setItem(KEY, JSON.stringify(products)); }

  function getById(id) { return get().find(p => p.id == id) || null; }

  function search(query, category = 'all', sort = 'default') {
    let results = get();
    if (query) {
      const q = query.toLowerCase();
      results = results.filter(p =>
        p.name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
      );
    }
    if (category !== 'all') results = results.filter(p => p.category === category);
    switch (sort) {
      case 'price-asc': results.sort((a, b) => a.price - b.price); break;
      case 'price-desc': results.sort((a, b) => b.price - a.price); break;
      case 'name-asc': results.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'rating': results.sort((a, b) => (b.rating||0) - (a.rating||0)); break;
    }
    return results;
  }

  function imageUrl(path) {
    if (!path) return 'https://placehold.co/400x400/f0f0f0/999?text=Produit';
    if (path.startsWith('http')) return path;
    if (path.startsWith('../media/')) return path;
    return '../media/' + path.replace('../public/media/', '').replace('media/', '');
  }

  function formatPrice(amount) {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' CFA';
  }

  return { get, save, getById, search, imageUrl, formatPrice };
})();


// ═══════════════════════════════════════════════════════
//  TOAST NOTIFICATIONS
// ═══════════════════════════════════════════════════════
const Toast = (() => {
  let container;

  function init() {
    if (document.getElementById('fbds-toast-container')) return;
    container = document.createElement('div');
    container.id = 'fbds-toast-container';
    container.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:10px;';
    document.body.appendChild(container);
  }

  function show(message, type = 'success', duration = 3500) {
    init();
    const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
    const colors = { success: '#10b981', error: '#ef4444', warning: '#f59e0b', info: '#3b82f6' };
    const toast = document.createElement('div');
    toast.style.cssText = `
      display:flex;align-items:center;gap:12px;padding:14px 18px;
      background:#1a1a2e;color:#fff;border-radius:12px;
      box-shadow:0 8px 30px rgba(0,0,0,0.3);min-width:260px;max-width:380px;
      border-left:4px solid ${colors[type]};
      transform:translateX(120%);transition:transform .35s cubic-bezier(.34,1.56,.64,1);
      font-family:inherit;font-size:14px;font-weight:500;
    `;
    toast.innerHTML = `<span style="color:${colors[type]};font-size:18px;flex-shrink:0;">${icons[type]}</span><span>${Security.sanitize(message)}</span>`;
    container.appendChild(toast);
    requestAnimationFrame(() => { toast.style.transform = 'translateX(0)'; });
    setTimeout(() => {
      toast.style.transform = 'translateX(120%)';
      toast.addEventListener('transitionend', () => toast.remove());
    }, duration);
  }

  return { show };
})();


// ═══════════════════════════════════════════════════════
//  PAGE TRANSITION
// ═══════════════════════════════════════════════════════
const PageTransition = (() => {
  function init() {
    const overlay = document.createElement('div');
    overlay.id = 'page-overlay';
    overlay.style.cssText = `
      position:fixed;inset:0;background:var(--brand-gold,#d4a843);z-index:9000;
      transform:translateY(-100%);transition:transform .45s cubic-bezier(.7,0,.3,1);pointer-events:none;
    `;
    document.body.appendChild(overlay);

    // Animate in
    requestAnimationFrame(() => {
      overlay.style.transform = 'translateY(0)';
      requestAnimationFrame(() => {
        setTimeout(() => { overlay.style.transform = 'translateY(100%)'; }, 50);
      });
    });

    // Intercept local links
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href]');
      if (!a) return;
      const href = a.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('http') || a.target === '_blank') return;
      e.preventDefault();
      overlay.style.transform = 'translateY(0)';
      setTimeout(() => { location.href = href; }, 450);
    });
  }

  return { init };
})();


// ═══════════════════════════════════════════════════════
//  NAVBAR COMPONENT
// ═══════════════════════════════════════════════════════
const Navbar = (() => {
  function init() {
    const toggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    const navbar = document.querySelector('.navbar');

    // Mobile toggle
    if (toggle && navLinks) {
      toggle.addEventListener('click', () => {
        const open = navLinks.classList.toggle('nav-open');
        toggle.setAttribute('aria-expanded', open);
        toggle.innerHTML = open ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
      });
    }

    // Scroll behavior
    if (navbar) {
      let lastY = 0;
      window.addEventListener('scroll', () => {
        const y = window.scrollY;
        if (y > 80) navbar.classList.add('nav-scrolled');
        else navbar.classList.remove('nav-scrolled');
        lastY = y;
      }, { passive: true });
    }

    // Active link
    const page = location.pathname.split('/').pop();
    document.querySelectorAll('.nav-links a').forEach(a => {
      if (a.getAttribute('href') === page) a.classList.add('active');
    });

    // Auth state in nav
    const user = Auth.getCurrentUser();
    const authBtn = document.getElementById('navAuthBtn');
    if (authBtn) {
      if (user) {
        authBtn.innerHTML = `<i class="fas fa-user-circle"></i> ${user.name.split(' ')[0]}`;
        authBtn.href = 'account.html';
      } else {
        authBtn.innerHTML = `<i class="fas fa-sign-in-alt"></i> Connexion`;
        authBtn.href = 'login.html';
      }
    }

    // Cart count
    Cart.updateBadges();
  }

  return { init };
})();


// ═══════════════════════════════════════════════════════
//  WISHLIST MODULE
// ═══════════════════════════════════════════════════════
const Wishlist = (() => {
  const KEY = 'fbds_wishlist';

  function get() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
  }

  function toggle(productId) {
    const list = get();
    const idx = list.indexOf(productId);
    if (idx > -1) { list.splice(idx, 1); localStorage.setItem(KEY, JSON.stringify(list)); return false; }
    else { list.push(productId); localStorage.setItem(KEY, JSON.stringify(list)); return true; }
  }

  function has(productId) { return get().includes(productId); }

  return { get, toggle, has };
})();


// ═══════════════════════════════════════════════════════
//  ORDERS MODULE
// ═══════════════════════════════════════════════════════
const Orders = (() => {
  const KEY = 'fbds_orders';

  function get() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
  }

  function create(orderData) {
    const orders = get();
    const order = {
      id: 'FBD-' + Date.now().toString(36).toUpperCase(),
      ...orderData,
      status: 'En attente',
      statusHistory: [{ status: 'En attente', date: new Date().toISOString() }],
      createdAt: new Date().toISOString()
    };
    orders.unshift(order);
    localStorage.setItem(KEY, JSON.stringify(orders));
    Security.logEvent('order_created', { orderId: order.id, amount: order.total });
    return order;
  }

  function getById(id) { return get().find(o => o.id === id) || null; }

  function getByEmail(email) {
    return get().filter(o => o.customerEmail && o.customerEmail.toLowerCase() === email.toLowerCase());
  }

  return { get, create, getById, getByEmail };
})();


// ═══════════════════════════════════════════════════════
//  BOOT
// ═══════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  PageTransition.init();
  Navbar.init();
});
