// Products Page - Complete JavaScript

// Product Data (will be loaded from localStorage)
let products = [];
let cart = [];
let currentCartCount = 0;

// DOM Elements
const productsGrid = document.getElementById('productsGrid');
const searchInput = document.getElementById('searchProducts');
const categoryFilter = document.getElementById('categoryFilter');
const sortFilter = document.getElementById('sortFilter');
const productsCount = document.getElementById('productsCount');
const cartCount = document.getElementById('cartCount');
const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');
const cartSidebarContent = document.getElementById('cartSidebarContent');
const cartFooter = document.getElementById('cartFooter');
const cartTotalAmount = document.getElementById('cartTotalAmount');
const toastNotification = document.getElementById('toastNotification');

let previousFocusElement = null;

function handleCartKeydown(event) {
    if (event.key === 'Escape') {
        closeCart();
    }
}

// ==================== LOAD PRODUCTS ====================
function loadProducts() {
    console.log('Loading products...');

    // Try to load products from localStorage
    const savedProducts = localStorage.getItem('horizon_products');

    if (savedProducts) {
        const parsedProducts = JSON.parse(savedProducts);
        if (parsedProducts && parsedProducts.length > 0) {
            products = parsedProducts;
            console.log('Products loaded from localStorage:', products.length);
        } else {
            loadDefaultProducts();
        }
    } else {
        loadDefaultProducts();
    }

    displayProducts();
}

function loadDefaultProducts() {
    console.log('Loading default products...');
    products = [
        {
            id: 1,
            name: 'Stainless Steel Bottle 1L',
            category: 'Bottles',
            price: 118,
            stock: 45,
            description: 'Premium stainless steel water bottle with double-wall insulation, keeps drinks cold for 24 hours or hot for 12 hours.',
            image: '../media/bottles.jpg',
            sizes: ['XS', 'S', 'M', 'L', 'XL']
        },
        {
            id: 2,
            name: 'Premium Glass Water Bottle',
            category: 'Bottles',
            price: 98,
            stock: 32,
            description: 'Eco-friendly glass bottle with protective silicone sleeve, BPA-free, dishwasher safe.',
            image: '../media/siyuan-g_V2rt6iG7A-unsplash.jpg',
            sizes: ['S', 'M', 'L']
        }
    ];
    localStorage.setItem('horizon_products', JSON.stringify(products));
}

// ==================== DISPLAY PRODUCTS ====================
function getProductImageUrl(imagePath) {
    if (!imagePath) return 'https://placehold.co/300x300/e0e0e0/666?text=No+Image';

    // If it's a full URL, use it directly
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }

    // For paths from backend (../public/media/...), convert to ../media/...
    if (imagePath.startsWith('../public/media/')) {
        return imagePath.replace('../public/media/', '../media/');
    }

    // If it's already correct for products page (../media/...), keep it
    if (imagePath.startsWith('../media/')) {
        return imagePath;
    }

    // If it's just a filename, assume it's in media folder
    if (!imagePath.includes('/')) {
        return '../media/' + imagePath;
    }

    return imagePath;
}

function displayProducts() {
    if (!productsGrid) {
        console.error('Products grid element not found!');
        return;
    }

    let filteredProducts = [...products];

    // Apply search filter
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    if (searchTerm) {
        filteredProducts = filteredProducts.filter(p =>
            p.name.toLowerCase().includes(searchTerm) ||
            (p.description && p.description.toLowerCase().includes(searchTerm))
        );
    }

    // Apply category filter
    const category = categoryFilter ? categoryFilter.value : 'all';
    if (category !== 'all') {
        filteredProducts = filteredProducts.filter(p => p.category === category);
    }

    // Apply sort
    const sortBy = sortFilter ? sortFilter.value : 'default';
    switch (sortBy) {
        case 'price-asc':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'name-asc':
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-desc':
            filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
            break;
    }

    // Update count
    if (productsCount) {
        productsCount.textContent = `Showing ${filteredProducts.length} products`;
    }

    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-box-open"></i>
                <h3>No products found</h3>
                <p>Try adjusting your search or filter criteria</p>
            </div>
        `;
        return;
    }

    productsGrid.innerHTML = filteredProducts.map(product => {
        const imageUrl = getProductImageUrl(product.image);
        return `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-image">
                    <img src="${imageUrl}" alt="${product.name}" onerror="this.src='https://placehold.co/300x300/e0e0e0/666?text=Image+Not+Found'">
                    ${product.stock < 20 ? '<span class="product-badge">Low Stock</span>' : ''}
                </div>
                <div class="product-info">
                    <div class="product-category">${product.category}</div>
                    <h3 class="product-title">${escapeHtml(product.name)}</h3>
                    <p class="product-description">${product.description ? product.description.substring(0, 80) : 'No description'}${product.description && product.description.length > 80 ? '...' : ''}</p>
                    <div class="product-price">$${product.price}</div>
                    <div class="product-sizes" data-product-id="${product.id}">
                        ${product.sizes.map(size => `
                            <span class="size-option" data-size="${size}">${size}</span>
                        `).join('')}
                    </div>
                    <div class="product-actions">
                        <button class="btn-add-to-cart" onclick="addToCart(${product.id})">
                            <i class="fas fa-shopping-cart"></i> Add to Cart
                        </button>
                        <button class="btn-quick-view" onclick="quickView(${product.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Add size selection event listeners
    document.querySelectorAll('.product-sizes').forEach(container => {
        const sizeOptions = container.querySelectorAll('.size-option');
        sizeOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                sizeOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
            });
        });
        // Select first size by default
        if (sizeOptions.length > 0 && !container.querySelector('.size-option.selected')) {
            sizeOptions[0].classList.add('selected');
        }
    });
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==================== CART MANAGEMENT ====================
function loadCart() {
    const savedCart = localStorage.getItem('horizon_cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    } else {
        cart = [];
    }
    updateCartUI();
}

function saveCart() {
    localStorage.setItem('horizon_cart', JSON.stringify(cart));
    updateCartUI();
}

function updateCartUI() {
    currentCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCount) cartCount.textContent = currentCartCount;

    if (!cartSidebarContent) return;

    if (cart.length === 0) {
        cartSidebarContent.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-bag"></i>
                <p>Your cart is empty</p>
                <button class="btn-primary" onclick="closeCart()">Continue Shopping</button>
            </div>
        `;
        if (cartFooter) cartFooter.style.display = 'none';
    } else {
        cartSidebarContent.innerHTML = cart.map(item => `
            <div class="cart-item" data-product-id="${item.id}">
                <img src="${getProductImageUrl(item.image)}" alt="${item.name}" class="cart-item-image" onerror="this.src='https://placehold.co/80x80/e0e0e0/666?text=No+Image'">
                <div class="cart-item-details">
                    <div class="cart-item-name">${escapeHtml(item.name)}</div>
                    <div class="cart-item-price">$${item.price}</div>
                    <div class="cart-item-quantity">
                        <button onclick="updateQuantity(${item.id}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="updateQuantity(${item.id}, 1)">+</button>
                    </div>
                    <div class="cart-item-size">Size: ${item.selectedSize}</div>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');

        if (cartFooter) cartFooter.style.display = 'block';

        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        if (cartTotalAmount) cartTotalAmount.textContent = `$${total}`;
    }
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    // Get selected size
    const productCard = document.querySelector(`.product-card[data-product-id="${productId}"]`);
    const selectedSizeElement = productCard?.querySelector('.size-option.selected');
    const selectedSize = selectedSizeElement ? selectedSizeElement.dataset.size : (product.sizes ? product.sizes[0] : 'M');

    const existingItem = cart.find(item => item.id === productId && item.selectedSize === selectedSize);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1,
            selectedSize: selectedSize
        });
    }

    saveCart();
    showToast(`${product.name} added to cart!`);
}

function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCart();
        }
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    showToast('Item removed from cart', 'info');
}

function openCart() {
    previousFocusElement = document.activeElement;
    if (cartSidebar) {
        cartSidebar.classList.add('open');
        cartSidebar.focus();
        cartSidebar.addEventListener('keydown', handleCartKeydown);
    }
    if (cartOverlay) cartOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCart() {
    if (cartSidebar) {
        cartSidebar.classList.remove('open');
        cartSidebar.removeEventListener('keydown', handleCartKeydown);
    }
    if (cartOverlay) cartOverlay.classList.remove('active');
    document.body.style.overflow = '';
    if (previousFocusElement) {
        previousFocusElement.focus();
        previousFocusElement = null;
    }
}

function showToast(message, type = 'success') {
    if (!toastNotification) return;

    toastNotification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;
    toastNotification.classList.add('show');
    setTimeout(() => {
        toastNotification.classList.remove('show');
    }, 3000);
}

// ==================== QUICK VIEW MODAL ====================
function quickView(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const imageUrl = getProductImageUrl(product.image);

    const modal = document.createElement('div');
    modal.className = 'quick-view-modal';
    modal.innerHTML = `
        <div class="quick-view-content">
            <button class="quick-view-close">&times;</button>
            <div class="quick-view-grid">
                <div class="quick-view-image">
                    <img src="${imageUrl}" alt="${product.name}" onerror="this.src='https://placehold.co/400x400/e0e0e0/666?text=No+Image'">
                </div>
                <div class="quick-view-info">
                    <div class="product-category">${product.category}</div>
                    <h2>${escapeHtml(product.name)}</h2>
                    <div class="product-price">$${product.price}</div>
                    <p class="product-description-full">${product.description || 'No description available.'}</p>
                    <div class="product-stock-info">
                        <i class="fas ${product.stock > 0 ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                        <span>${product.stock > 0 ? `${product.stock} units in stock` : 'Out of stock'}</span>
                    </div>
                    <div class="product-sizes-label">Select Size:</div>
                    <div class="product-sizes quick-view-sizes">
                        ${product.sizes.map(size => `
                            <span class="size-option" data-size="${size}">${size}</span>
                        `).join('')}
                    </div>
                    <button class="btn-add-to-cart" onclick="addToCart(${product.id}); document.querySelector('.quick-view-modal').remove();">
                        <i class="fas fa-shopping-cart"></i> Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Add size selection
    const sizeOptions = modal.querySelectorAll('.size-option');
    sizeOptions.forEach(option => {
        option.addEventListener('click', () => {
            sizeOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
        });
    });
    if (sizeOptions.length > 0) sizeOptions[0].classList.add('selected');

    // Close modal
    modal.querySelector('.quick-view-close').onclick = () => modal.remove();
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
}

// ==================== CHECKOUT ====================
function checkout() {
    if (cart.length === 0) {
        showToast('Your cart is empty!', 'info');
        return;
    }
    
    // Save cart to localStorage for orders page
    localStorage.setItem('checkout_cart', JSON.stringify(cart));
    
    // Redirect to orders page
    window.location.href = 'orders.html';
}

// ==================== LISTEN FOR UPDATES ====================
function listenForProductUpdates() {
    let lastUpdate = localStorage.getItem('products_last_updated') || '0';

    setInterval(() => {
        const currentUpdate = localStorage.getItem('products_last_updated') || '0';
        if (currentUpdate !== lastUpdate) {
            console.log('Products updated! Reloading...');
            lastUpdate = currentUpdate;
            loadProducts();
            showToast('Products have been updated!', 'info');
        }
    }, 3000);

    window.addEventListener('storage', (e) => {
        if (e.key === 'horizon_products' || e.key === 'products_last_updated') {
            console.log('Products changed in another tab, reloading...');
            loadProducts();
            showToast('Products have been updated!', 'info');
        }
    });
}

function addRefreshButton() {
    const productsHeader = document.querySelector('.products-header');
    if (productsHeader && !document.getElementById('manualRefreshBtn')) {
        const refreshBtn = document.createElement('button');
        refreshBtn.id = 'manualRefreshBtn';
        refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh Products';
        refreshBtn.style.cssText = `
            background: var(--primary-main);
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 8px;
            cursor: pointer;
            margin-left: 15px;
            font-size: 0.9rem;
        `;
        refreshBtn.onclick = () => {
            loadProducts();
            showToast('Products refreshed!', 'success');
        };
        productsHeader.appendChild(refreshBtn);
    }
}

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
    // Search input
    if (searchInput) {
        searchInput.addEventListener('input', () => displayProducts());
    }

    // Filters
    if (categoryFilter) {
        categoryFilter.addEventListener('change', () => displayProducts());
    }
    if (sortFilter) {
        sortFilter.addEventListener('change', () => displayProducts());
    }

    // Cart toggle
    const cartIconBtn = document.getElementById('cartIconBtn');
    const closeCartBtn = document.getElementById('closeCartBtn');
    const continueShoppingBtn = document.getElementById('continueShoppingBtn');

    if (cartIconBtn) cartIconBtn.addEventListener('click', openCart);
    if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
    if (continueShoppingBtn) continueShoppingBtn.addEventListener('click', closeCart);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) checkoutBtn.addEventListener('click', checkout);

    // Mobile menu
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navLinks = document.getElementById('navLinks');
    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const isExpanded = navLinks.classList.contains('active');
            mobileMenuToggle.setAttribute('aria-expanded', isExpanded);
        });
    }

    // Close mobile menu when clicking a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            if (navLinks) navLinks.classList.remove('active');
        });
    });
}

// ==================== INITIALIZATION ====================
function init() {
    console.log('Initializing products page...');
    loadProducts();
    loadCart();
    setupEventListeners();
    listenForProductUpdates();
    addRefreshButton();
}

// Add quick view styles
const quickViewStyles = document.createElement('style');
quickViewStyles.textContent = `
    .quick-view-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        z-index: 2000;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.3s ease;
    }
    
    .quick-view-content {
        background: white;
        border-radius: 20px;
        max-width: 900px;
        width: 90%;
        max-height: 85vh;
        overflow-y: auto;
        position: relative;
        animation: slideUp 0.3s ease;
    }
    
    .quick-view-close {
        position: absolute;
        top: 15px;
        right: 20px;
        background: none;
        border: none;
        font-size: 2rem;
        cursor: pointer;
        color: var(--text-light);
        z-index: 10;
    }
    
    .quick-view-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 30px;
        padding: 30px;
    }
    
    .quick-view-image img {
        width: 100%;
        height: auto;
        border-radius: 15px;
    }
    
    .product-description-full {
        color: var(--text-light);
        line-height: 1.6;
        margin: 15px 0;
    }
    
    .product-stock-info {
        display: flex;
        align-items: center;
        gap: 10px;
        margin: 15px 0;
        padding: 10px;
        background: var(--primary-bg);
        border-radius: 8px;
    }
    
    .product-sizes-label {
        font-weight: 600;
        margin: 15px 0 10px;
    }
    
    .quick-view-sizes {
        margin-bottom: 20px;
    }
    
    .empty-state {
        text-align: center;
        padding: 60px;
        grid-column: 1 / -1;
    }
    
    .empty-state i {
        font-size: 4rem;
        color: var(--border-light);
        margin-bottom: 1rem;
    }
    
    @keyframes slideUp {
        from {
            transform: translateY(50px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @media (max-width: 768px) {
        .quick-view-grid {
            grid-template-columns: 1fr;
            gap: 20px;
            padding: 20px;
        }
    }
`;
document.head.appendChild(quickViewStyles);
// Add this to your products.js init function
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// In your init function, add:
const categoryParam = getUrlParameter('category');
if (categoryParam && categoryFilter) {
    categoryFilter.value = categoryParam;
    displayProducts();
}

// Make functions global for onclick handlers
window.addToCart = addToCart;
window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;
window.quickView = quickView;
window.closeCart = closeCart;
window.checkout = checkout;

// Start the app
init();