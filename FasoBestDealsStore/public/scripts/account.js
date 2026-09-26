// Account Page JavaScript

let currentUser = null;
let userOrders = [];
let userAddresses = [];
let userWishlist = [];

document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    currentUser = checkAuth();
    
    if (currentUser) {
        loadUserData();
        setupEventListeners();
        loadDashboard();
    }
});

function loadUserData() {
    // Load user's orders
    const allOrders = JSON.parse(localStorage.getItem('horizon_orders') || '[]');
    userOrders = allOrders.filter(order => order.customerPhone === currentUser.phone || order.customerEmail === currentUser.email);
    
    // Load user's addresses
    const users = getUsers();
    const userData = users.find(u => u.id === currentUser.id);
    userAddresses = userData?.addresses || [];
    userWishlist = userData?.wishlist || [];
    
    // Update UI with user info
    document.getElementById('userName').textContent = `${currentUser.firstName} ${currentUser.lastName}`;
    document.getElementById('userEmail').textContent = currentUser.email;
    document.getElementById('welcomeName').textContent = currentUser.firstName;
}

function loadDashboard() {
    const totalOrders = userOrders.length;
    const totalSpent = userOrders.reduce((sum, order) => sum + order.finalTotal, 0);
    const pendingOrders = userOrders.filter(order => order.status === 'pending').length;
    
    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('totalSpent').textContent = `$${totalSpent}`;
    document.getElementById('pendingOrders').textContent = pendingOrders;
    
    // Recent orders (last 5)
    const recentOrders = userOrders.slice(0, 5);
    displayOrders(recentOrders, 'recentOrdersList');
}

function displayOrders(orders, containerId) {
    const container = document.getElementById(containerId);
    
    if (!orders || orders.length === 0) {
        container.innerHTML = '<p>No orders found. <a href="products.html">Start shopping!</a></p>';
        return;
    }
    
    container.innerHTML = orders.map(order => `
        <div class="order-card">
            <div class="order-header">
                <span class="order-id">${order.orderId}</span>
                <span class="order-status status-${order.status}">${order.status.toUpperCase()}</span>
            </div>
            <div class="order-date">${new Date(order.date).toLocaleDateString()}</div>
            <div class="order-products">
                ${order.products.map(product => `
                    <div class="order-product-item">
                        <span>${product.name} (${product.size}) x ${product.quantity}</span>
                        <span>$${product.totalPrice}</span>
                    </div>
                `).join('')}
            </div>
            <div class="order-total">
                Total: <strong>$${order.finalTotal}</strong>
            </div>
        </div>
    `).join('');
}

function loadOrders() {
    const statusFilter = document.getElementById('orderStatusFilter').value;
    let filteredOrders = userOrders;
    
    if (statusFilter !== 'all') {
        filteredOrders = userOrders.filter(order => order.status === statusFilter);
    }
    
    displayOrders(filteredOrders, 'allOrdersList');
}

function loadProfile() {
    document.getElementById('profileFirstName').value = currentUser.firstName;
    document.getElementById('profileLastName').value = currentUser.lastName;
    document.getElementById('profileEmail').value = currentUser.email;
    document.getElementById('profilePhone').value = currentUser.phone || '';
}

function updateProfile(e) {
    e.preventDefault();
    
    const firstName = document.getElementById('profileFirstName').value;
    const lastName = document.getElementById('profileLastName').value;
    const email = document.getElementById('profileEmail').value;
    const phone = document.getElementById('profilePhone').value;
    
    // Update in users array
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    
    if (userIndex !== -1) {
        users[userIndex].firstName = firstName;
        users[userIndex].lastName = lastName;
        users[userIndex].email = email;
        users[userIndex].phone = phone;
        saveUsers(users);
        
        // Update current user
        currentUser.firstName = firstName;
        currentUser.lastName = lastName;
        currentUser.email = email;
        currentUser.phone = phone;
        setCurrentUser(currentUser);
        
        showToast('Profile updated successfully!', 'success');
        loadUserData();
    }
}

function loadAddresses() {
    const container = document.getElementById('addressesList');
    
    if (!userAddresses || userAddresses.length === 0) {
        container.innerHTML = '<p>No addresses saved. Add your first address!</p>';
        return;
    }
    
    container.innerHTML = userAddresses.map((address, index) => `
        <div class="address-card ${address.isDefault ? 'default' : ''}">
            ${address.isDefault ? '<div class="address-badge">Default</div>' : ''}
            <h4>${address.name}</h4>
            <p>${address.street}</p>
            <p>${address.city}, ${address.postalCode}</p>
            <p>${address.country}</p>
            <p>📞 ${address.phone}</p>
            <div class="address-actions">
                ${!address.isDefault ? `<button onclick="setDefaultAddress(${index})">Set as Default</button>` : ''}
                <button onclick="deleteAddress(${index})" style="background:#dc3545; color:white;">Delete</button>
            </div>
        </div>
    `).join('');
}

function showAddressModal() {
    const modal = document.getElementById('addressModal');
    modal.style.display = 'flex';
}

function saveAddress(e) {
    e.preventDefault();
    
    const newAddress = {
        name: document.getElementById('addressName').value,
        street: document.getElementById('addressStreet').value,
        city: document.getElementById('addressCity').value,
        postalCode: document.getElementById('addressPostal').value,
        country: document.getElementById('addressCountry').value,
        phone: document.getElementById('addressPhone').value,
        isDefault: userAddresses.length === 0
    };
    
    userAddresses.push(newAddress);
    
    // Save to users array
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex].addresses = userAddresses;
        saveUsers(users);
    }
    
    closeAddressModal();
    loadAddresses();
    showToast('Address saved successfully!', 'success');
}

function setDefaultAddress(index) {
    userAddresses.forEach((addr, i) => {
        addr.isDefault = (i === index);
    });
    
    // Save to users array
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex].addresses = userAddresses;
        saveUsers(users);
    }
    
    loadAddresses();
    showToast('Default address updated!', 'success');
}

function deleteAddress(index) {
    if (confirm('Are you sure you want to delete this address?')) {
        userAddresses.splice(index, 1);
        
        // Save to users array
        const users = getUsers();
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            users[userIndex].addresses = userAddresses;
            saveUsers(users);
        }
        
        loadAddresses();
        showToast('Address deleted!', 'success');
    }
}

function closeAddressModal() {
    const modal = document.getElementById('addressModal');
    modal.style.display = 'none';
    document.getElementById('addressForm').reset();
}

function loadWishlist() {
    const container = document.getElementById('wishlistGrid');
    
    if (!userWishlist || userWishlist.length === 0) {
        container.innerHTML = '<p>Your wishlist is empty. <a href="products.html">Browse products!</a></p>';
        return;
    }
    
    // Get product details from products list
    const allProducts = JSON.parse(localStorage.getItem('horizon_products') || '[]');
    const wishlistProducts = userWishlist.map(wishId => allProducts.find(p => p.id == wishId)).filter(p => p);
    
    container.innerHTML = wishlistProducts.map(product => `
        <div class="product-card">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" onerror="this.src='https://placehold.co/300x300'">
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <div class="product-price">$${product.price}</div>
                <button class="btn-add-to-cart" onclick="addToCartFromWishlist(${product.id})">
                    Add to Cart
                </button>
                <button class="btn-remove" onclick="removeFromWishlist(${product.id})">
                    Remove
                </button>
            </div>
        </div>
    `).join('');
}

function addToCartFromWishlist(productId) {
    // Add to cart logic here
    showToast('Product added to cart!', 'success');
}

function removeFromWishlist(productId) {
    userWishlist = userWishlist.filter(id => id != productId);
    
    // Save to users array
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex].wishlist = userWishlist;
        saveUsers(users);
    }
    
    loadWishlist();
    showToast('Removed from wishlist', 'success');
}

function setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.account-nav .nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tab = link.dataset.tab;
            
            document.querySelectorAll('.account-nav .nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            document.getElementById(`${tab}Tab`).classList.add('active');
            
            // Load tab-specific data
            if (tab === 'orders') loadOrders();
            if (tab === 'profile') loadProfile();
            if (tab === 'addresses') loadAddresses();
            if (tab === 'wishlist') loadWishlist();
        });
    });
    
    // Profile form
    const profileForm = document.getElementById('profileForm');
    if (profileForm) profileForm.addEventListener('submit', updateProfile);
    
    // Order filter
    const orderFilter = document.getElementById('orderStatusFilter');
    if (orderFilter) orderFilter.addEventListener('change', loadOrders);
    
    // Address modal
    const addAddressBtn = document.getElementById('addAddressBtn');
    if (addAddressBtn) addAddressBtn.addEventListener('click', showAddressModal);
    
    const addressForm = document.getElementById('addressForm');
    if (addressForm) addressForm.addEventListener('submit', saveAddress);
    
    const modalClose = document.querySelector('#addressModal .modal-close');
    if (modalClose) modalClose.addEventListener('click', closeAddressModal);
    
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('addressModal');
        if (e.target === modal) closeAddressModal();
    });
    
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
}

// Make functions global
window.setDefaultAddress = setDefaultAddress;
window.deleteAddress = deleteAddress;
window.addToCartFromWishlist = addToCartFromWishlist;
window.removeFromWishlist = removeFromWishlist;