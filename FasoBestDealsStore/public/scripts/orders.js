// orders.js - Complete Cart Functionality (No Login Required)

// Cart array to store all products
let cartItems = [];

// ==================== LOAD CART FROM PRODUCTS PAGE ====================
function loadCartFromProductsPage() {
    const savedCart = localStorage.getItem('checkout_cart');

    if (savedCart) {
        const loadedCart = JSON.parse(savedCart);
        console.log('Loading cart from products page:', loadedCart);

        cartItems = loadedCart.map((item, index) => ({
            id: `product_${index + 1}`,
            name: item.name,
            image: item.image,
            quantity: item.quantity,
            size: item.selectedSize || 'M',
            unitPrice: item.price,
            totalPrice: item.price * item.quantity
        }));

        localStorage.removeItem('checkout_cart');
        renderOrderDetails();
    } else {
        loadStaticProducts();
    }

    updateCartSummary();
}

// ==================== RENDER ORDER DETAILS ====================
function renderOrderDetails() {
    const container = document.querySelector('.order-details-container');
    if (!container) return;

    if (cartItems.length === 0) {
        container.innerHTML = `
            <div class="empty-cart-state">
                <i class="fas fa-shopping-cart"></i>
                <h3>Your cart is empty</h3>
                <p>Add some products to your cart from the <a href="products.html">Products Page</a></p>
                <button onclick="window.location.href='products.html'" class="btn-primary">Browse Products</button>
            </div>
        `;
        return;
    }

    container.innerHTML = cartItems.map((item, index) => `
        <div class="order-details" data-product-id="${item.id}" data-product-index="${index}">
            <div class="product-display product-display-js">
                <img src="${getCorrectImagePath(item.image)}" alt="${item.name}" class="product-image product-image-js" onerror="this.src='https://placehold.co/300x300/e0e0e0/666?text=No+Image'">
            </div>
            <div class="product-name product-name-js">
                ${item.name}
                <div class="product-description">
                    ${getProductDescription(item.name)}
                </div>
                <div class="color-selected color-selected-js">
                    Color:
                    <div class="selected-color" style="background: #1a1a1a"></div>
                </div>
                <div class="sizes">
                    ${generateSizeButtons(item.size)}
                </div>
                <div class="quantity-select">
                    <button class="minus-quantity minus-quantity-js">-</button>
                    <div class="quantity quantity-js">${item.quantity}</div>
                    <button class="add-quantity add-quantity-js">+</button>
                    <div class="quantity-message-display-js"></div>
                </div>
            </div>
            <div class="pricing-details price-details-js">
                <div class="right-price-element">
                    <div class="total-price titles">Total price of goods:</div>
                    <div class="price-title titles">Store Discount:</div>
                    <div class="platform-offers titles">Platform Offers:</div>
                    <div class="gold-coin titles">Gold Coin Planning:</div>
                </div>
                <div class="left-price-element">
                    <div class="total-price titles">CFA ${item.totalPrice}</div>
                    <div class="store-discount titles">CFA 0</div>
                    <div class="platform-offers-value titles">CFA 0</div>
                    <div class="gold-coin-value titles">Not Used</div>
                </div>
            </div>
        </div>
    `).join('');

    initializeProductInteractions();
}

function getCorrectImagePath(imagePath) {
    if (!imagePath) return 'https://placehold.co/300x300/e0e0e0/666?text=No+Image';
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('../media/')) return imagePath;
    if (imagePath.startsWith('media/')) return '../' + imagePath;
    return '../media/' + imagePath;
}

function generateSizeButtons(selectedSize) {
    const sizes = ['XS', 'S', 'M', 'L', 'XL'];
    return sizes.map(size => `
        <button class="extra-small size-button size-button-js ${size === selectedSize ? 'active-size' : ''}">
            ${size}
        </button>
    `).join('');
}

function getProductDescription(productName) {
    const descriptions = {
        'Stainless Steel Bottles 1L': 'Premium stainless steel water bottle, double-wall insulation, keeps drinks cold for 24 hours or hot for 12 hours.',
        'Premium Glass Water Bottle': 'Eco-friendly glass bottle with protective silicone sleeve, BPA-free, dishwasher safe.'
    };
    return descriptions[productName] || 'High-quality product for your everyday needs.';
}

function loadStaticProducts() {
    const existingProducts = document.querySelectorAll('.order-details');
    if (existingProducts.length > 0) {
        initializeCartFromDOM();
    } else {
        cartItems = [
            {
                id: 'product_1',
                name: 'Stainless Steel Bottles 1L',
                image: '../media/bottles.jpg',
                quantity: 2,
                size: 'M',
                unitPrice: 118,
                totalPrice: 236
            },
            {
                id: 'product_2',
                name: 'Premium Glass Water Bottle',
                image: '../media/siyuan-g_V2rt6iG7A-unsplash.jpg',
                quantity: 1,
                size: 'S',
                unitPrice: 118,
                totalPrice: 118
            }
        ];
        renderOrderDetails();
    }
}

function initializeCartFromDOM() {
    const productCards = document.querySelectorAll('.order-details');
    cartItems = [];

    productCards.forEach((card, index) => {
        const productId = `product_${index + 1}`;
        const productName = card.querySelector('.product-name-js')?.innerText.split('\n')[0] || 'Product';
        const productImage = card.querySelector('.product-image-js')?.src || '';
        const quantityElement = card.querySelector('.quantity-js');
        const sizeButtons = card.querySelectorAll('.size-button-js');
        const totalPriceElement = card.querySelector('.left-price-element .total-price');

        let activeSize = 'M';
        sizeButtons.forEach(btn => {
            if (btn.classList.contains('active-size')) {
                activeSize = btn.innerText;
            }
        });

        const quantity = parseInt(quantityElement?.innerText || 1);
        const unitPrice = 118;

        cartItems.push({
            id: productId,
            name: productName,
            image: productImage,
            quantity: quantity,
            size: activeSize,
            unitPrice: unitPrice,
            totalPrice: unitPrice * quantity
        });
    });
}

// ==================== UPDATE PRICE ====================
function updateProductPrice(card, productId) {
    const product = cartItems.find(item => item.id === productId);
    if (product) {
        const totalPriceElement = card.querySelector('.left-price-element .total-price');
        if (totalPriceElement) {
            totalPriceElement.innerHTML = `CFA ${product.totalPrice}`;
        }
    }
    updateCartSummary();
}

// ==================== UPDATE CART SUMMARY ====================
function updateCartSummary() {
    const storeDiscountInput = document.getElementById('storeDiscountInput');
    const platformOffersInput = document.getElementById('platformOffersInput');
    const goldCoinSelect = document.getElementById('goldCoinSelect');

    let storeDiscount = storeDiscountInput ? parseInt(storeDiscountInput.value) || 0 : 0;
    let platformOffers = platformOffersInput ? parseInt(platformOffersInput.value) || 0 : 0;
    let goldCoinText = goldCoinSelect ? goldCoinSelect.value : 'Not Used';

    let goldCoinDiscount = 0;
    if (goldCoinText.includes('CFA 10')) goldCoinDiscount = 10;
    else if (goldCoinText.includes('CFA 25')) goldCoinDiscount = 25;
    else if (goldCoinText.includes('CFA 50')) goldCoinDiscount = 50;

    let subtotal = 0;
    let totalQuantity = 0;

    cartItems.forEach(item => {
        subtotal += item.totalPrice;
        totalQuantity += item.quantity;
    });

    const finalTotal = subtotal - storeDiscount - platformOffers - goldCoinDiscount;

    const storeDiscountDisplay = document.querySelector('.store-discount');
    const platformOffersDisplay = document.querySelector('.platform-offers-value');
    const goldCoinDisplay = document.querySelector('.gold-coin-value');

    if (storeDiscountDisplay) storeDiscountDisplay.innerHTML = `CFA ${storeDiscount}`;
    if (platformOffersDisplay) platformOffersDisplay.innerHTML = `CFA ${platformOffers}`;
    if (goldCoinDisplay) goldCoinDisplay.innerHTML = goldCoinText;

    let cartSummary = document.querySelector('.cart-summary');
    if (!cartSummary) {
        cartSummary = document.createElement('div');
        cartSummary.className = 'cart-summary';
        const middleSection = document.querySelector('.middle-section');
        if (middleSection) {
            middleSection.parentNode.insertBefore(cartSummary, middleSection);
        }
    }

    cartSummary.innerHTML = `
        <div class="cart-summary-card">
            <h2><i class="fas fa-shopping-cart"></i> Cart Summary</h2>
            <div class="cart-items-count">
                <span>Total Items:</span>
                <span class="total-items-count">${cartItems.length} ${cartItems.length === 1 ? 'Product' : 'Products'}</span>
            </div>
            <div class="cart-total-quantity">
                <span>Total Quantity:</span>
                <span class="total-quantity">${totalQuantity} units</span>
            </div>
            <div class="cart-subtotal">
                <span>Subtotal:</span>
                <span>CFA ${subtotal}</span>
            </div>
            <div class="cart-discount">
                <span>Store Discount:</span>
                <span>-CFA ${storeDiscount}</span>
            </div>
            <div class="cart-platform-offers">
                <span>Platform Offers:</span>
                <span>-CFA ${platformOffers}</span>
            </div>
            <div class="cart-gold-coin">
                <span>Gold Coin:</span>
                <span>-CFA ${goldCoinDiscount}</span>
            </div>
            <div class="cart-total">
                <span>Total Amount:</span>
                <span class="final-total">CFA ${finalTotal}</span>
            </div>
            <button class="checkout-all-btn">Proceed to Checkout All</button>
        </div>
    `;

    const checkoutBtn = cartSummary.querySelector('.checkout-all-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            showCheckoutPage(storeDiscount, platformOffers, goldCoinDiscount, goldCoinText, subtotal, finalTotal, totalQuantity);
        });
    }
}

// ==================== UPDATE QUANTITY ====================
function updateQuantity(card, productId, change) {
    const product = cartItems.find(item => item.id === productId);
    if (product) {
        const newQuantity = product.quantity + change;
        if (newQuantity >= 1 && newQuantity <= 99) {
            product.quantity = newQuantity;
            product.totalPrice = product.unitPrice * newQuantity;

            const quantityElement = card.querySelector('.quantity-js');
            if (quantityElement) {
                quantityElement.innerHTML = newQuantity;
            }

            updateProductPrice(card, productId);
            showTemporaryMessage(`${product.name}: Quantity changed to ${newQuantity}`, 'success');
        }
    }
}

// ==================== UPDATE SIZE ====================
function updateSize(card, productId, newSize) {
    const product = cartItems.find(item => item.id === productId);
    if (product) {
        product.size = newSize;
        showTemporaryMessage(`${product.name}: Size changed to ${newSize}`, 'success');
    }
}

// ==================== SHOW CHECKOUT PAGE ====================
function showCheckoutPage(storeDiscount, platformOffers, goldCoinDiscount, goldCoinText, subtotal, finalTotal, totalQuantity) {
    const selectedDestination = document.querySelector('.destination-select-js')?.value || 'Standard Shipping (3-5 days)';

    const productsHTML = cartItems.map((item, index) => `
        <div class="checkout-product-item">
            <div class="product-item-header">
                <strong>Product ${index + 1}:</strong> ${item.name}
            </div>
            <div class="product-item-details">
                <div class="detail-row"><span>Size:</span><span>${item.size}</span></div>
                <div class="detail-row"><span>Quantity:</span><span>${item.quantity}</span></div>
                <div class="detail-row"><span>Unit Price:</span><span>CFA ${item.unitPrice}</span></div>
                <div class="detail-row"><span>Total:</span><span>CFA ${item.totalPrice}</span></div>
            </div>
        </div>
    `).join('');

    const checkoutHTML = `
        <div class="checkout-overlay" id="checkoutOverlay">
            <div class="checkout-modal">
                <div class="checkout-header">
                    <h2><i class="fas fa-shopping-cart"></i> Checkout Summary (${cartItems.length} Products)</h2>
                    <button class="close-checkout" id="closeCheckoutBtn">&times;</button>
                </div>
                <div class="checkout-content">
                    <div class="checkout-all-products">
                        <h3><i class="fas fa-box"></i> All Products (${totalQuantity} total units)</h3>
                        <div class="products-list">${productsHTML}</div>
                    </div>
                    <div class="checkout-price-breakdown">
                        <h3><i class="fas fa-calculator"></i> Price Breakdown</h3>
                        <div class="price-row"><span>Subtotal:</span><span>CFA ${subtotal}</span></div>
                        <div class="price-row discount"><span>Store Discount:</span><span>-CFA ${storeDiscount}</span></div>
                        <div class="price-row discount"><span>Platform Offers:</span><span>-CFA ${platformOffers}</span></div>
                        <div class="price-row discount"><span>Gold Coin:</span><span>-CFA ${goldCoinDiscount}</span></div>
                        <div class="price-row"><span>Destination:</span><span>${selectedDestination}</span></div>
                        <div class="price-row total"><span>Total Amount:</span><span>CFA ${finalTotal}</span></div>
                    </div>
                    <div class="checkout-actions">
                        <button class="confirm-order-btn" id="confirmOrderBtn">
                            <i class="fas fa-check-circle"></i> Confirm Order
                        </button>
                        <button class="cancel-order-btn" id="cancelOrderBtn">
                            <i class="fas fa-times-circle"></i> Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', checkoutHTML);

    const closeBtn = document.getElementById('closeCheckoutBtn');
    const cancelBtn = document.getElementById('cancelOrderBtn');
    const overlay = document.getElementById('checkoutOverlay');
    const confirmBtn = document.getElementById('confirmOrderBtn');

    function closeModal() { overlay.remove(); }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    if (overlay) overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });

    if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
            // Check stock before proceeding
            if (!checkStockAvailability(cartItems)) {
                return;
            }

            // Ask for customer details
            const customerName = prompt('Enter your name:', 'Customer');
            const customerPhone = prompt('Enter your phone number (with country code):', '+250...');

            if (!customerPhone) {
                alert('Phone number is required!');
                return;
            }

            // Update product stock
            updateProductStock(cartItems);

            // Format WhatsApp message
            const productsList = cartItems.map((item, index) =>
                `${index + 1}. ${item.name}\n   Size: ${item.size}\n   Quantity: ${item.quantity}\n   Price: CFA ${item.totalPrice}`
            ).join('\n\n');

            const message = `🛒 *NEW ORDER!* 🛒\n\n━━━━━━━━━━━━━━━━━━━━━━━━\n*CUSTOMER DETAILS:*\n━━━━━━━━━━━━━━━━━━━━━━━━\n\n*Name:* ${customerName}\n*Phone:* ${customerPhone}\n*Destination:* ${selectedDestination}\n\n━━━━━━━━━━━━━━━━━━━━━━━━\n*PRODUCTS:*\n━━━━━━━━━━━━━━━━━━━━━━━━\n\n${productsList}\n\n━━━━━━━━━━━━━━━━━━━━━━━━\n*PRICE BREAKDOWN:*\n━━━━━━━━━━━━━━━━━━━━━━━━\n\nSubtotal: CFA ${subtotal}\nStore Discount: -CFA ${storeDiscount}\nPlatform Offers: -CFA ${platformOffers}\nGold Coin: -CFA ${goldCoinDiscount}\n\n*TOTAL: CFA ${finalTotal}*\n━━━━━━━━━━━━━━━━━━━━━━━━`;

            const encodedMessage = encodeURIComponent(message);
            const whatsappNumber = '22667030730'; // Changed from 250792854755
            const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

            // Save order to admin panel
            const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            const existingOrders = JSON.parse(localStorage.getItem('horizon_orders') || '[]');

            existingOrders.unshift({
                orderId: orderId,
                date: new Date().toISOString(),
                customerName: customerName,
                customerPhone: customerPhone,
                products: cartItems,
                subtotal: subtotal,
                storeDiscount: storeDiscount,
                platformOffers: platformOffers,
                goldCoinDiscount: goldCoinDiscount,
                finalTotal: finalTotal,
                destination: selectedDestination,
                status: 'pending',
                source: 'whatsapp'
            });

            localStorage.setItem('horizon_orders', JSON.stringify(existingOrders));
            localStorage.setItem('orders_last_updated', Date.now().toString());

            closeModal();

            // Show success and open WhatsApp
            const userConfirmed = confirm(`Order placed!\n\nOrder ID: ${orderId}\nTotal: CFA ${finalTotal}\n\nStock has been updated.\n\nClick OK to send order via WhatsApp`);

            if (userConfirmed) {
                window.open(whatsappUrl, '_blank');
                alert('Order sent! Our team will contact you shortly.');

                // Clear cart
                localStorage.removeItem('horizon_cart');
                localStorage.removeItem('checkout_cart');
                window.location.href = 'products.html';
            }
        });
    }
}

// ==================== HELPER FUNCTIONS ====================
function showTemporaryMessage(message, type = 'info') {
    const existingMessage = document.querySelector('.temporary-message');
    if (existingMessage) existingMessage.remove();

    const messageDiv = document.createElement('div');
    messageDiv.className = `temporary-message ${type}`;
    messageDiv.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i><span>${message}</span>`;
    document.body.appendChild(messageDiv);

    setTimeout(() => {
        messageDiv.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => messageDiv.remove(), 300);
    }, 3000);
}

function initializeProductInteractions() {
    const productCards = document.querySelectorAll('.order-details');

    productCards.forEach((card, index) => {
        const productId = `product_${index + 1}`;

        const minusBtn = card.querySelector('.minus-quantity-js');
        const addBtn = card.querySelector('.add-quantity-js');

        if (minusBtn) {
            minusBtn.addEventListener('click', () => updateQuantity(card, productId, -1));
        }
        if (addBtn) {
            addBtn.addEventListener('click', () => updateQuantity(card, productId, 1));
        }

        const sizeBtns = card.querySelectorAll('.size-button-js');
        sizeBtns.forEach(btn => {
            btn.addEventListener('click', function () {
                sizeBtns.forEach(b => b.classList.remove('active-size'));
                this.classList.add('active-size');
                updateSize(card, productId, this.innerText);
            });
        });
    });
}

function initializeDiscounts() {
    const storeDiscountInput = document.getElementById('storeDiscountInput');
    const platformOffersInput = document.getElementById('platformOffersInput');
    const goldCoinSelect = document.getElementById('goldCoinSelect');

    if (storeDiscountInput) storeDiscountInput.addEventListener('input', () => updateCartSummary());
    if (platformOffersInput) platformOffersInput.addEventListener('input', () => updateCartSummary());
    if (goldCoinSelect) goldCoinSelect.addEventListener('change', () => updateCartSummary());
}

function initializeDestination() {
    const destinationSelect = document.querySelector('.destination-select-js');
    const submitBtn = document.querySelector('.submit-destination');

    if (submitBtn) {
        submitBtn.addEventListener('click', () => {
            const selectedDestination = destinationSelect?.options[destinationSelect.selectedIndex]?.text || 'Standard Shipping';
            showTemporaryMessage(`Shipping destination set to: ${selectedDestination}`, 'success');
        });
    }
}

function initializeMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navLinks = document.getElementById('navLinks');

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

function updateProgressBar() {
    const progressBar = document.querySelector('.progress-bar');
    if (progressBar) {
        let progress = 33;
        if (cartItems.length > 0) progress = 66;
        if (document.querySelector('.destination-select-js')?.value) progress = 100;
        progressBar.value = progress;
    }
}

// ==================== INITIALIZE ====================
document.addEventListener('DOMContentLoaded', function () {
    loadCartFromProductsPage();
    initializeDiscounts();
    initializeDestination();
    initializeMobileMenu();
    updateProgressBar();
    console.log('Orders page initialized with', cartItems.length, 'products');
});

// Add this function to orders.js
function updateProductStock(orderItems) {
    // Get current products from localStorage
    let products = JSON.parse(localStorage.getItem('horizon_products') || '[]');
    let stockUpdated = false;

    // Update stock for each ordered item
    orderItems.forEach(orderItem => {
        const productIndex = products.findIndex(p => p.name === orderItem.name);

        if (productIndex !== -1) {
            const oldStock = products[productIndex].stock;
            const newStock = oldStock - orderItem.quantity;

            if (newStock >= 0) {
                products[productIndex].stock = newStock;
                stockUpdated = true;
                console.log(`Stock updated for ${orderItem.name}: ${oldStock} → ${newStock}`);
            } else {
                console.warn(`Insufficient stock for ${orderItem.name}. Available: ${oldStock}, Requested: ${orderItem.quantity}`);
                showTemporaryMessage(`Warning: Low stock for ${orderItem.name}!`, 'warning');
            }
        }
    });

    // Save updated products back to localStorage
    if (stockUpdated) {
        localStorage.setItem('horizon_products', JSON.stringify(products));
        localStorage.setItem('products_last_updated', Date.now().toString());
        console.log('Product stock updated successfully');
    }

    return stockUpdated;
}

// Also add a function to check stock before ordering
function checkStockAvailability(orderItems) {
    const products = JSON.parse(localStorage.getItem('horizon_products') || '[]');
    let allAvailable = true;
    const unavailableItems = [];

    orderItems.forEach(orderItem => {
        const product = products.find(p => p.name === orderItem.name);
        if (!product || product.stock < orderItem.quantity) {
            allAvailable = false;
            unavailableItems.push({
                name: orderItem.name,
                available: product ? product.stock : 0,
                requested: orderItem.quantity
            });
        }
    });

    if (!allAvailable) {
        let message = 'Insufficient stock for:\n';
        unavailableItems.forEach(item => {
            message += `\n- ${item.name}: Only ${item.available} available (requested ${item.requested})`;
        });
        alert(message);
        return false;
    }

    return true;
}

// Order security validation
function validateOrderSecurity(orderData) {
    const securityChecks = {
        isValid: true,
        issues: []
    };
    
    // Check for rapid ordering
    const lastOrderTime = localStorage.getItem('last_order_time');
    if (lastOrderTime && (Date.now() - parseInt(lastOrderTime)) < 60000) {
        securityChecks.isValid = false;
        securityChecks.issues.push('Please wait before placing another order');
    }
    
    // Check order total limits
    const total = orderData.finalTotal;
    if (total > 10000) {
        securityChecks.isValid = false;
        securityChecks.issues.push('Order amount exceeds maximum limit');
    }
    if (total < 1) {
        securityChecks.isValid = false;
        securityChecks.issues.push('Invalid order amount');
    }
    
    // Check quantity limits
    for (const item of orderData.products) {
        if (item.quantity > 99) {
            securityChecks.isValid = false;
            securityChecks.issues.push(`Maximum quantity for ${item.name} is 99`);
        }
    }
    
    return securityChecks;
}

// Add this to your order confirmation
// Add order token to order
function addOrderSecurityToken(orderId) {
    const token = 'ord_tok_' + Date.now() + '_' + Math.random().toString(36).substr(2, 16);
    localStorage.setItem(`order_secure_${orderId}`, token);
    return token;
}

