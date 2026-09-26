// Home Page JavaScript

// DOM Elements
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const navLinks = document.getElementById('navLinks');
const backToTop = document.getElementById('backToTop');
const newsletterForm = document.getElementById('newsletterForm');
const toastNotification = document.getElementById('toastNotification');
const featuredProductsContainer = document.getElementById('featuredProducts');

// ==================== NAVBAR ====================
function setupMobileMenu() {
    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const isExpanded = navLinks.classList.contains('active');
            mobileMenuToggle.setAttribute('aria-expanded', isExpanded);
        });
        
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                mobileMenuToggle.setAttribute('aria-expanded', false);
            });
        });
    }
}

// ==================== BACK TO TOP ====================
function setupBackToTop() {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTop.classList.add('show');
        } else {
            backToTop.classList.remove('show');
        }
    });
    
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ==================== LOAD FEATURED PRODUCTS ====================
function loadFeaturedProducts() {
    if (!featuredProductsContainer) return;
    
    const products = JSON.parse(localStorage.getItem('horizon_products') || '[]');
    const featuredProducts = products.slice(0, 4);
    
    if (featuredProducts.length === 0) {
        featuredProductsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-box-open"></i>
                <p>No products available yet. Check back soon!</p>
            </div>
        `;
        return;
    }
    
    featuredProductsContainer.innerHTML = featuredProducts.map(product => `
        <div class="product-card" data-product-id="${product.id}">
            <div class="product-image">
                <img src="${getProductImageUrl(product.image)}" alt="${product.name}" onerror="this.src='https://placehold.co/300x300/e0e0e0/666?text=No+Image'">
                ${product.stock < 20 ? '<span class="product-badge">Low Stock</span>' : ''}
            </div>
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <h3 class="product-title">${product.name}</h3>
                <div class="product-price">$${product.price}</div>
                <button class="btn-add-to-cart" onclick="addToCart(${product.id})">
                    <i class="fas fa-shopping-cart"></i> Add to Cart
                </button>
            </div>
        </div>
    `).join('');
}

function getProductImageUrl(imagePath) {
    if (!imagePath) return 'https://placehold.co/300x300/e0e0e0/666?text=No+Image';
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('../media/')) return imagePath;
    if (imagePath.startsWith('media/')) return '../' + imagePath;
    return '../media/' + imagePath;
}

// ==================== ADD TO CART ====================
let cart = [];

function loadCart() {
    const savedCart = localStorage.getItem('horizon_cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}

function saveCart() {
    localStorage.setItem('horizon_cart', JSON.stringify(cart));
}

function addToCart(productId) {
    const products = JSON.parse(localStorage.getItem('horizon_products') || '[]');
    const product = products.find(p => p.id === productId);
    
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1,
            selectedSize: product.sizes ? product.sizes[0] : 'M'
        });
    }
    
    saveCart();
    showToast(`${product.name} added to cart!`, 'success');
    
    // Update cart count in navbar if exists
    updateCartCount();
}

function updateCartCount() {
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    // You can add a cart icon with count in navbar if desired
}

// ==================== PROMO TIMER ====================
function startPromoTimer() {
    // Set end date (7 days from now)
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);
    
    function updateTimer() {
        const now = new Date();
        const diff = endDate - now;
        
        if (diff <= 0) {
            document.getElementById('timer').innerHTML = '<div class="timer-block"><span>00</span><label>Days</label></div><div class="timer-block"><span>00</span><label>Hours</label></div><div class="timer-block"><span>00</span><label>Minutes</label></div><div class="timer-block"><span>00</span><label>Seconds</label></div>';
            return;
        }
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        document.getElementById('days').textContent = days.toString().padStart(2, '0');
        document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
        document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
        document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
    }
    
    updateTimer();
    setInterval(updateTimer, 1000);
}

// ==================== NEWSLETTER ====================
function setupNewsletter() {
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('newsletterEmail').value;
            
            if (email) {
                // Save to localStorage
                const subscribers = JSON.parse(localStorage.getItem('newsletter_subscribers') || '[]');
                if (!subscribers.includes(email)) {
                    subscribers.push(email);
                    localStorage.setItem('newsletter_subscribers', JSON.stringify(subscribers));
                }
                
                showToast('Subscribed successfully! Check your email for updates.', 'success');
                newsletterForm.reset();
            }
        });
    }
}

// ==================== CATEGORY NAVIGATION ====================
function setupCategoryNavigation() {
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            const category = card.dataset.category;
            if (category) {
                window.location.href = `products.html?category=${category}`;
            }
        });
    });
}

// ==================== SMOOTH SCROLL ====================
function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// ==================== TOAST NOTIFICATION ====================
function showToast(message, type = 'success') {
    if (!toastNotification) return;
    
    const icon = toastNotification.querySelector('i');
    const span = toastNotification.querySelector('span');
    
    if (type === 'success') {
        icon.className = 'fas fa-check-circle';
        toastNotification.style.borderLeftColor = '#28a745';
    } else {
        icon.className = 'fas fa-exclamation-circle';
        toastNotification.style.borderLeftColor = '#ff9800';
    }
    
    span.textContent = message;
    toastNotification.classList.add('show');
    
    setTimeout(() => {
        toastNotification.classList.remove('show');
    }, 3000);
}

// ==================== DEMO ALERT ====================
function setupDemoAlert() {
    const demoBtn = document.getElementById('demoAlertBtn');
    if (demoBtn) {
        demoBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showToast('Welcome to Horizon! Explore our products.', 'info');
        });
    }
}

// ==================== ANIMATIONS ON SCROLL ====================
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.feature-card, .product-card, .category-card, .testimonial-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
}

// ==================== INITIALIZATION ====================
function init() {
    loadCart();
    loadFeaturedProducts();
    setupMobileMenu();
    setupBackToTop();
    setupNewsletter();
    setupCategoryNavigation();
    setupSmoothScroll();
    setupDemoAlert();
    setupScrollAnimations();
    startPromoTimer();
    
    console.log('Home page initialized');
}

// Make functions global for onclick handlers
window.addToCart = addToCart;

// Start the app
init();