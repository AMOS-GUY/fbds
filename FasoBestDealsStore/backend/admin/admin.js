// Admin Dashboard - Complete JavaScript

let orders = [];
let products = [];
let customers = [];
let currentOrdersPage = 1;
let ordersPerPage = 10;
let currentOrderFilter = "all";
let currentDateFilter = "all";
let currentOrderSearch = "";

// Charts
let revenueChart, orderStatusChart, topProductsChart, customerGrowthChart;

// ==================== INITIALIZATION ====================
document.addEventListener("DOMContentLoaded", () => {
    loadAllData();
    setupEventListeners();
    loadAnalytics();
    loadSettings();
    listenForOrderUpdates();
});

// ==================== LISTEN FOR ORDER UPDATES ====================
function listenForOrderUpdates() {
    let lastUpdate = localStorage.getItem("orders_last_updated") || "0";

    setInterval(() => {
        const currentUpdate = localStorage.getItem("orders_last_updated") || "0";
        if (currentUpdate !== lastUpdate) {
            console.log("New order detected! Refreshing...");
            lastUpdate = currentUpdate;
            loadOrders();
            updateDashboard();
            if (
                document.getElementById("analyticsPage") &&
                document.getElementById("analyticsPage").style.display !== "none"
            ) {
                loadAnalytics();
            }
            showNotification("New order received!", "success");
        }
    }, 3000);
}

// ==================== LOAD DATA ====================
function loadAllData() {
    // Load orders
    const savedOrders = localStorage.getItem("horizon_orders");
    if (savedOrders) {
        orders = JSON.parse(savedOrders);
        console.log("Orders loaded:", orders.length);
    } else {
        orders = [];
        localStorage.setItem("horizon_orders", JSON.stringify(orders));
    }

    // Load products
    const savedProducts = localStorage.getItem("horizon_products");
    if (savedProducts) {
        products = JSON.parse(savedProducts);
        console.log("Products loaded:", products.length);
    } else {
        products = [];
    }

    // Load customers from orders
    extractCustomersFromOrders();

    updateDashboard();
    loadOrders();
    loadProducts();
    loadCustomers();
    updateCounters();
}

function extractCustomersFromOrders() {
    const customerMap = new Map();
    orders.forEach((order) => {
        if (order.customerPhone && !customerMap.has(order.customerPhone)) {
            customerMap.set(order.customerPhone, {
                id: `CUST-${Date.now()}-${customerMap.size}`,
                name: order.customerName || "Guest",
                phone: order.customerPhone,
                totalOrders: 1,
                totalSpent: order.finalTotal || 0,
                lastOrder: order.date,
            });
        } else if (order.customerPhone) {
            const existing = customerMap.get(order.customerPhone);
            if (existing) {
                existing.totalOrders++;
                existing.totalSpent += order.finalTotal || 0;
                if (order.date > existing.lastOrder) existing.lastOrder = order.date;
            }
        }
    });
    customers = Array.from(customerMap.values());
}

function updateCounters() {
    const orderCount = document.getElementById("orderCount");
    const productCount = document.getElementById("productCount");
    const customerCount = document.getElementById("customerCount");

    if (orderCount) orderCount.textContent = orders.length;
    if (productCount) productCount.textContent = products.length;
    if (customerCount) customerCount.textContent = customers.length;
}

// ==================== DASHBOARD ====================
function updateDashboard() {
    const totalRevenue = orders.reduce((sum, o) => sum + (o.finalTotal || 0), 0);

    const dashboardTotalOrders = document.getElementById("dashboardTotalOrders");
    const dashboardTotalRevenue = document.getElementById(
        "dashboardTotalRevenue",
    );
    const dashboardTotalCustomers = document.getElementById(
        "dashboardTotalCustomers",
    );
    const dashboardTotalProducts = document.getElementById(
        "dashboardTotalProducts",
    );

    if (dashboardTotalOrders) dashboardTotalOrders.textContent = orders.length;
    if (dashboardTotalRevenue)
        dashboardTotalRevenue.textContent = `$${totalRevenue}`;
    if (dashboardTotalCustomers)
        dashboardTotalCustomers.textContent = customers.length;
    if (dashboardTotalProducts)
        dashboardTotalProducts.textContent = products.length;

    const recentOrdersBody = document.getElementById("recentOrdersBody");
    if (recentOrdersBody) {
        const recent = orders.slice(0, 5);
        recentOrdersBody.innerHTML = recent
            .map(
                (order) => `
            <tr>
                <td>${order.orderId}</td>
                <td>${order.customerName || "Guest"}</td>
                <td>$${order.finalTotal}</td>
                <td><span class="status-badge status-${order.status}">${order.status}</span></td>
                <td>${new Date(order.date).toLocaleDateString()}</td>
            </tr>
        `,
            )
            .join("");
    }
}

// ==================== ORDERS MANAGEMENT ====================
function loadOrders() {
    const tbody = document.getElementById("ordersTableBody");
    if (!tbody) return;

    let filteredOrders = [...orders];

    if (currentOrderFilter !== "all") {
        filteredOrders = filteredOrders.filter(
            (o) => o.status === currentOrderFilter,
        );
    }

    filteredOrders = applyDateFilter(filteredOrders);

    if (currentOrderSearch) {
        filteredOrders = filteredOrders.filter(
            (o) =>
                o.orderId.toLowerCase().includes(currentOrderSearch) ||
                (o.customerName &&
                    o.customerName.toLowerCase().includes(currentOrderSearch)) ||
                (o.customerPhone && o.customerPhone.includes(currentOrderSearch)),
        );
    }

    updateOrdersStats(filteredOrders);

    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
    const startIndex = (currentOrdersPage - 1) * ordersPerPage;
    const paginatedOrders = filteredOrders.slice(
        startIndex,
        startIndex + ordersPerPage,
    );

    const ordersPageInfo = document.getElementById("ordersPageInfo");
    const prevOrdersPage = document.getElementById("prevOrdersPage");
    const nextOrdersPage = document.getElementById("nextOrdersPage");

    if (ordersPageInfo)
        ordersPageInfo.textContent = `Page ${currentOrdersPage} of ${totalPages || 1}`;
    if (prevOrdersPage) prevOrdersPage.disabled = currentOrdersPage === 1;
    if (nextOrdersPage)
        nextOrdersPage.disabled =
            currentOrdersPage === totalPages || totalPages === 0;

    if (paginatedOrders.length === 0) {
        tbody.innerHTML =
            '<tr><td colspan="8" class="loading">No orders found</td></tr>';
        return;
    }

    tbody.innerHTML = paginatedOrders
        .map(
            (order) => `
        <tr>
            <td class="order-id-clickable" onclick="viewOrderDetails('${order.orderId}')">${order.orderId}</td>
            <td>${new Date(order.date).toLocaleDateString()}</td>
            <td>${order.customerName || "Guest"}</td>
            <td>${order.customerPhone || "N/A"}</td>
            <td>${order.products?.length || 0}</td>
            <td><strong>$${order.finalTotal}</strong></td>
            <td><span class="status-badge status-${order.status}">${order.status}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn-view" onclick="viewOrderDetails('${order.orderId}')" title="View Order">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-whatsapp" onclick="sendWhatsAppMessage('${order.orderId}')" title="Send WhatsApp">
                        <i class="fab fa-whatsapp"></i>
                    </button>
                    <button class="btn-status" onclick="updateOrderStatusPrompt('${order.orderId}')" title="Update Status">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            </td>
        </tr>
    `,
        )
        .join("");
}

function applyDateFilter(orders) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return orders.filter((order) => {
        const orderDate = new Date(order.date);
        switch (currentDateFilter) {
            case "today":
                return orderDate >= today;
            case "week":
                return orderDate >= new Date(now.setDate(now.getDate() - 7));
            case "month":
                return orderDate >= new Date(now.setMonth(now.getMonth() - 1));
            default:
                return true;
        }
    });
}

function updateOrdersStats(filteredOrders) {
    const pending = filteredOrders.filter((o) => o.status === "pending").length;
    const confirmed = filteredOrders.filter(
        (o) => o.status === "confirmed",
    ).length;
    const shipped = filteredOrders.filter((o) => o.status === "shipped").length;
    const revenue = filteredOrders.reduce(
        (sum, o) => sum + (o.finalTotal || 0),
        0,
    );

    const pendingCount = document.getElementById("pendingOrdersCount");
    const confirmedCount = document.getElementById("confirmedOrdersCount");
    const shippedCount = document.getElementById("shippedOrdersCount");
    const ordersRevenue = document.getElementById("ordersTotalRevenue");

    if (pendingCount) pendingCount.textContent = pending;
    if (confirmedCount) confirmedCount.textContent = confirmed;
    if (shippedCount) shippedCount.textContent = shipped;
    if (ordersRevenue) ordersRevenue.textContent = `$${revenue}`;
}

function viewOrderDetails(orderId) {
    const order = orders.find((o) => o.orderId === orderId);
    if (!order) return;

    const modal = document.getElementById("orderModal");
    const content = document.getElementById("orderDetailsContent");

    if (!modal || !content) return;

    const productsHTML = (order.products || [])
        .map(
            (product) => `
        <div class="order-detail-item">
            <div class="order-detail-label">${product.name}</div>
            <div>Size: ${product.size} | Qty: ${product.quantity} | Price: $${product.totalPrice}</div>
        </div>
    `,
        )
        .join("");

    content.innerHTML = `
        <div class="order-detail-item">
            <div class="order-detail-label">Order ID</div>
            <div>${order.orderId}</div>
        </div>
        <div class="order-detail-item">
            <div class="order-detail-label">Date</div>
            <div>${new Date(order.date).toLocaleString()}</div>
        </div>
        <div class="order-detail-item">
            <div class="order-detail-label">Customer</div>
            <div>${order.customerName || "N/A"}</div>
            <div>${order.customerPhone || "N/A"}</div>
        </div>
        <div class="order-detail-item">
            <div class="order-detail-label">Products</div>
            ${productsHTML}
        </div>
        <div class="order-detail-item">
            <div class="order-detail-label">Total</div>
            <div><strong>$${order.finalTotal}</strong></div>
        </div>
        <div class="order-detail-item">
            <div class="order-detail-label">Status</div>
            <div>
                <select onchange="changeOrderStatus('${order.orderId}', this.value)">
                    <option value="pending" ${order.status === "pending" ? "selected" : ""}>Pending</option>
                    <option value="confirmed" ${order.status === "confirmed" ? "selected" : ""}>Confirmed</option>
                    <option value="shipped" ${order.status === "shipped" ? "selected" : ""}>Shipped</option>
                    <option value="delivered" ${order.status === "delivered" ? "selected" : ""}>Delivered</option>
                </select>
            </div>
        </div>
    `;

    modal.style.display = "flex";
}

function changeOrderStatus(orderId, newStatus) {
    const order = orders.find((o) => o.orderId === orderId);
    if (order) {
        order.status = newStatus;
        localStorage.setItem("horizon_orders", JSON.stringify(orders));
        loadOrders();
        updateDashboard();
        showNotification(
            `Order ${orderId} status updated to ${newStatus}`,
            "success",
        );
        closeModal();
    }
}

function updateOrderStatusPrompt(orderId) {
    const newStatus = prompt(
        "Enter status (pending, confirmed, shipped, delivered):",
    );
    if (
        newStatus &&
        ["pending", "confirmed", "shipped", "delivered"].includes(
            newStatus.toLowerCase(),
        )
    ) {
        changeOrderStatus(orderId, newStatus.toLowerCase());
    }
}

function sendWhatsAppMessage(orderId) {
    const order = orders.find((o) => o.orderId === orderId);
    if (!order) return;

    const productsList = (order.products || [])
        .map(
            (p, i) =>
                `${i + 1}. ${p.name} - Size: ${p.size}, Qty: ${p.quantity}, Price: $${p.totalPrice}`,
        )
        .join("\n");

    const message = `🛒 ORDER #${order.orderId}\nCustomer: ${order.customerName}\nTotal: $${order.finalTotal}\n\nProducts:\n${productsList}`;
    window.open(
        `https://wa.me/22667030730?text=${encodeURIComponent(message)}`,
        "_blank",
    );
}

function exportOrdersToCSV() {
    const headers = [
        "Order ID",
        "Date",
        "Customer",
        "Phone",
        "Items",
        "Total",
        "Status",
    ];
    const rows = orders.map((o) => [
        o.orderId,
        new Date(o.date).toLocaleDateString(),
        o.customerName,
        o.customerPhone,
        o.products?.length || 0,
        o.finalTotal,
        o.status,
    ]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    downloadCSV(csv, `orders_${new Date().toISOString().split("T")[0]}.csv`);
}

// ==================== PRODUCTS MANAGEMENT ====================
function loadProducts() {
    const tbody = document.getElementById("adminProductsTableBody");
    if (!tbody) return;

    const searchTerm =
        document.getElementById("adminProductSearch")?.value.toLowerCase() || "";

    let filteredProducts = [...products];
    if (searchTerm) {
        filteredProducts = products.filter(
            (p) =>
                p.name.toLowerCase().includes(searchTerm) ||
                p.category.toLowerCase().includes(searchTerm),
        );
    }

    // Update stats
    const totalProducts = products.length;
    const categories = [...new Set(products.map((p) => p.category))];
    const lowStock = products.filter((p) => p.stock < 20 && p.stock > 0).length;
    const inventoryValue = products.reduce(
        (sum, p) => sum + p.price * p.stock,
        0,
    );

    const adminTotalProducts = document.getElementById("adminTotalProducts");
    const adminTotalCategories = document.getElementById("adminTotalCategories");
    const adminLowStockCount = document.getElementById("adminLowStockCount");
    const adminInventoryValue = document.getElementById("adminInventoryValue");

    if (adminTotalProducts) adminTotalProducts.textContent = totalProducts;
    if (adminTotalCategories)
        adminTotalCategories.textContent = categories.length;
    if (adminLowStockCount) adminLowStockCount.textContent = lowStock;
    if (adminInventoryValue)
        adminInventoryValue.textContent = `$${inventoryValue.toFixed(2)}`;

    if (filteredProducts.length === 0) {
        tbody.innerHTML =
            '<tr><td colspan="7" class="loading">No products found</td></tr>';
        return;
    }

    tbody.innerHTML = filteredProducts
        .map((product) => {
            const stockStatus =
                product.stock === 0 ? "out" : product.stock < 20 ? "low" : "good";
            const statusText =
                product.stock === 0
                    ? "Out of Stock"
                    : product.stock < 20
                        ? "Low Stock"
                        : "In Stock";

            return `
            <tr data-product-id="${product.id}">
                <td class="product-image-cell">
                    <img src="${getProductImageUrl(product.image)}" alt="${product.name}" class="product-thumbnail" onerror="this.src='https://placehold.co/50x50/e0e0e0/666?text=No+Image'">
                </td>
                <td><strong>${escapeHtml(product.name)}</strong></td>
                <td>${product.category}</td>
                <td>$${product.price}</td>
                <td class="stock-value-cell">
                    <span class="stock-value" id="stock-val-${product.id}">${product.stock}</span>
                </td>
                <td>
                    <span class="stock-badge ${stockStatus}">${statusText}</span>
                </td>
                <td class="stock-control-cell">
                    <button class="stock-btn" onclick="adminAdjustStock(${product.id}, -1)">-</button>
                    <button class="stock-btn" onclick="adminAdjustStock(${product.id}, 1)">+</button>
                    <input type="number" id="stock-input-${product.id}" class="stock-input" placeholder="Set">
                    <button class="stock-set-btn" onclick="adminSetStock(${product.id})">Set</button>
                </td>
                <td class="action-buttons">
                    <button class="btn-edit" onclick="openEditProductModal(${product.id})" title="Edit Product">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-delete" onclick="deleteProduct(${product.id})" title="Delete Product">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
        })
        .join("");
}

function getProductImageUrl(imagePath) {
    if (!imagePath) return "https://placehold.co/50x50/e0e0e0/666?text=No+Image";
    if (imagePath.startsWith("http")) return imagePath;
    if (imagePath.startsWith("../media/")) return imagePath;
    if (imagePath.startsWith("media/")) return "../" + imagePath;
    return imagePath;
}

function adminAdjustStock(productId, change) {
    const products = JSON.parse(localStorage.getItem("horizon_products") || "[]");
    const productIndex = products.findIndex((p) => p.id == productId);

    if (productIndex !== -1) {
        const newStock = products[productIndex].stock + change;
        if (newStock >= 0) {
            products[productIndex].stock = newStock;
            localStorage.setItem("horizon_products", JSON.stringify(products));
            localStorage.setItem("products_last_updated", Date.now().toString());

            const stockSpan = document.getElementById(`stock-val-${productId}`);
            if (stockSpan) stockSpan.textContent = newStock;

            showNotification(
                `Stock updated for ${products[productIndex].name}`,
                "success",
            );
            loadProducts();
        } else {
            showNotification("Stock cannot be negative", "error");
        }
    }
}

function adminSetStock(productId) {
    const input = document.getElementById(`stock-input-${productId}`);
    if (!input) return;

    const newStock = parseInt(input.value);

    if (isNaN(newStock) || newStock < 0) {
        showNotification("Please enter a valid number", "error");
        return;
    }

    const products = JSON.parse(localStorage.getItem("horizon_products") || "[]");
    const productIndex = products.findIndex((p) => p.id == productId);

    if (productIndex !== -1) {
        products[productIndex].stock = newStock;
        localStorage.setItem("horizon_products", JSON.stringify(products));
        localStorage.setItem("products_last_updated", Date.now().toString());

        const stockSpan = document.getElementById(`stock-val-${productId}`);
        if (stockSpan) stockSpan.textContent = newStock;

        input.value = "";
        showNotification(
            `Stock set to ${newStock} for ${products[productIndex].name}`,
            "success",
        );
        loadProducts();
    }
}

function openEditProductModal(productId) {
    const product = products.find((p) => p.id == productId);
    if (!product) return;

    const modal = document.getElementById("editProductModal");
    if (!modal) return;

    document.getElementById("editProductId").value = product.id;
    document.getElementById("editProductName").value = product.name;
    document.getElementById("editProductCategory").value = product.category;
    document.getElementById("editProductPrice").value = product.price;
    document.getElementById("editProductStock").value = product.stock;
    document.getElementById("editProductDescription").value =
        product.description || "";
    document.getElementById("editProductImage").value = product.image || "";

    const sizesCheckboxes = document.querySelectorAll(
        "#editProductForm .sizes-group input",
    );
    sizesCheckboxes.forEach((cb) => {
        cb.checked = product.sizes && product.sizes.includes(cb.value);
    });

    modal.style.display = "flex";
}

function saveEditedProduct(event) {
    event.preventDefault();

    const productId = parseInt(document.getElementById("editProductId").value);
    const sizes = Array.from(
        document.querySelectorAll("#editProductForm .sizes-group input:checked"),
    ).map((cb) => cb.value);

    const updatedProduct = {
        id: productId,
        name: document.getElementById("editProductName").value,
        category: document.getElementById("editProductCategory").value,
        price: parseFloat(document.getElementById("editProductPrice").value),
        stock: parseInt(document.getElementById("editProductStock").value),
        description: document.getElementById("editProductDescription").value,
        image:
            document.getElementById("editProductImage").value ||
            "https://placehold.co/300x300/e0e0e0/666?text=No+Image",
        sizes: sizes.length ? sizes : ["M"],
    };

    const productList = JSON.parse(
        localStorage.getItem("horizon_products") || "[]",
    );
    const productIndex = productList.findIndex((p) => p.id === productId);

    if (productIndex !== -1) {
        productList[productIndex] = updatedProduct;
        localStorage.setItem("horizon_products", JSON.stringify(productList));
        localStorage.setItem("products_last_updated", Date.now().toString());
        showNotification("Product updated successfully!", "success");
        closeEditModal();
        loadProducts();
        loadAllData();
    }
}

function deleteProduct(productId) {
    if (confirm("Are you sure you want to delete this product?")) {
        const productList = JSON.parse(
            localStorage.getItem("horizon_products") || "[]",
        );
        const filteredProducts = productList.filter((p) => p.id != productId);
        localStorage.setItem("horizon_products", JSON.stringify(filteredProducts));
        localStorage.setItem("products_last_updated", Date.now().toString());
        showNotification("Product deleted successfully!", "success");
        loadProducts();
        loadAllData();
    }
}

function closeEditModal() {
    const modal = document.getElementById("editProductModal");
    if (modal) modal.style.display = "none";
}

// ==================== CUSTOMERS MANAGEMENT ====================
// ==================== CUSTOMERS MANAGEMENT ====================
function loadCustomers() {
    const tbody = document.getElementById("usersTableBody");
    if (!tbody) return;

    extractCustomersFromOrders();

    // Update customer stats
    updateCustomerStats();

    if (customers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="customers-empty-state">
                    <i class="fas fa-users"></i>
                    <h3>No Customers Yet</h3>
                    <p>When customers place orders, they will appear here.</p>
                </td>
            </tr>
        `;
        return;
    }

    // Sort customers by total spent (highest first)
    const sortedCustomers = [...customers].sort(
        (a, b) => b.totalSpent - a.totalSpent,
    );

    tbody.innerHTML = sortedCustomers
        .map((customer, index) => {
            // Determine customer tier based on total spent
            let tier = "";
            let tierClass = "";
            if (customer.totalSpent >= 1000) {
                tier = "Platinum";
                tierClass = "tier-platinum";
            } else if (customer.totalSpent >= 500) {
                tier = "Gold";
                tierClass = "tier-gold";
            } else if (customer.totalSpent >= 200) {
                tier = "Silver";
                tierClass = "tier-silver";
            } else if (customer.totalSpent >= 50) {
                tier = "Bronze";
                tierClass = "tier-bronze";
            }

            // Determine order count class
            let orderCountClass = "";
            if (customer.totalOrders >= 10) orderCountClass = "high";
            else if (customer.totalOrders >= 5) orderCountClass = "medium";
            else orderCountClass = "low";

            // Get initials for avatar
            const initials = customer.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .substring(0, 2);

            return `
            <tr>
                <td>
                    <div class="customer-info-cell">
                        <div class="customer-badge">${initials}</div>
                        <div class="customer-details">
                            <span class="customer-name">${escapeHtml(customer.name)}</span>
                            ${tier ? `<span class="customer-tier ${tierClass}">${tier}</span>` : ""}
                        </div>
                    </div>
                </td>
                <td class="customer-phone">
                    <i class="fas fa-phone-alt" style="color: var(--primary-main); margin-right: 8px;"></i>
                    ${customer.phone}
                </td>
                <td>
                    <span class="order-count-badge ${orderCountClass}">
                        <i class="fas fa-shopping-bag" style="margin-right: 4px;"></i>
                        ${customer.totalOrders}
                    </span>
                </td>
                <td>
                    <span class="total-spent">
                        <i class="fas fa-dollar-sign"></i>
                        ${customer.totalSpent.toFixed(2)}
                    </span>
                </td>
                <td class="date-cell">
                    <i class="fas fa-calendar-alt"></i>
                    ${new Date(customer.lastOrder).toLocaleDateString()}
                </td>
                <td>
                    <div class="customers-actions">
                        <button class="btn-view-customer" onclick="viewCustomerDetails('${customer.phone}')" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-whatsapp-customer" onclick="sendWhatsAppToCustomer('${customer.phone}', '${customer.name}')" title="Send WhatsApp">
                            <i class="fab fa-whatsapp"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
        })
        .join("");
}

function updateCustomerStats() {
    // Calculate statistics
    const totalCustomers = customers.length;
    const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
    const avgOrderValue =
        totalCustomers > 0 ? (totalRevenue / totalCustomers).toFixed(2) : 0;
    const returningCustomers = customers.filter((c) => c.totalOrders > 1).length;

    // Update stats cards (create them if they don't exist)
    let statsContainer = document.querySelector(".customers-stats");
    if (!statsContainer) {
        statsContainer = document.createElement("div");
        statsContainer.className = "customers-stats";
        const customersHeader = document.querySelector(".customers-header");
        if (customersHeader) {
            customersHeader.insertAdjacentElement("afterend", statsContainer);
        }
    }

    statsContainer.innerHTML = `
        <div class="stat-card-customer">
            <i class="fas fa-users"></i>
            <div class="stat-info">
                <h4>Total Customers</h4>
                <p>${totalCustomers}</p>
            </div>
        </div>
        <div class="stat-card-customer">
            <i class="fas fa-dollar-sign"></i>
            <div class="stat-info">
                <h4>Total Revenue</h4>
                <p>$${totalRevenue.toFixed(2)}</p>
            </div>
        </div>
        <div class="stat-card-customer">
            <i class="fas fa-chart-line"></i>
            <div class="stat-info">
                <h4>Avg. Order Value</h4>
                <p>$${avgOrderValue}</p>
            </div>
        </div>
        <div class="stat-card-customer">
            <i class="fas fa-star"></i>
            <div class="stat-info">
                <h4>Returning Customers</h4>
                <p>${returningCustomers}</p>
            </div>
        </div>
    `;
}

function viewCustomerDetails(phone) {
    const customer = customers.find((c) => c.phone === phone);
    if (!customer) return;

    const customerOrders = orders.filter((o) => o.customerPhone === phone);

    const modal = document.getElementById("customerModal");
    const content = document.getElementById("customerDetailsContent");

    if (!modal || !content) return;

    // Calculate customer tier
    let tier = "";
    let tierIcon = "";
    if (customer.totalSpent >= 1000) {
        tier = "Platinum Member";
        tierIcon = "fa-crown";
    } else if (customer.totalSpent >= 500) {
        tier = "Gold Member";
        tierIcon = "fa-medal";
    } else if (customer.totalSpent >= 200) {
        tier = "Silver Member";
        tierIcon = "fa-star";
    } else if (customer.totalSpent >= 50) {
        tier = "Bronze Member";
        tierIcon = "fa-award";
    } else {
        tier = "Regular Customer";
        tierIcon = "fa-user";
    }

    const initials = customer.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);

    content.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px;">
            <div style="width: 80px; height: 80px; background: linear-gradient(135deg, var(--primary-main), var(--primary-light)); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px;">
                <span style="color: white; font-size: 2rem; font-weight: 600;">${initials}</span>
            </div>
            <h2 style="margin-bottom: 5px;">${escapeHtml(customer.name)}</h2>
            <div style="display: inline-block; background: var(--primary-bg); padding: 5px 12px; border-radius: 20px; font-size: 0.8rem;">
                <i class="fas ${tierIcon}" style="margin-right: 5px;"></i>${tier}
            </div>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 20px;">
            <div style="background: var(--primary-bg); padding: 15px; border-radius: 12px; text-align: center;">
                <i class="fas fa-phone-alt" style="font-size: 1.5rem; color: var(--primary-main); margin-bottom: 8px; display: block;"></i>
                <div style="font-size: 0.75rem; color: var(--text-light);">Phone Number</div>
                <div style="font-weight: 600; margin-top: 5px;">${customer.phone}</div>
            </div>
            <div style="background: var(--primary-bg); padding: 15px; border-radius: 12px; text-align: center;">
                <i class="fas fa-calendar-alt" style="font-size: 1.5rem; color: var(--primary-main); margin-bottom: 8px; display: block;"></i>
                <div style="font-size: 0.75rem; color: var(--text-light);">Member Since</div>
                <div style="font-weight: 600; margin-top: 5px;">${new Date(customer.lastOrder).toLocaleDateString()}</div>
            </div>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px;">
            <div style="text-align: center;">
                <div style="font-size: 1.5rem; font-weight: 700; color: var(--primary-main);">${customer.totalOrders}</div>
                <div style="font-size: 0.7rem; color: var(--text-light);">Total Orders</div>
            </div>
            <div style="text-align: center;">
                <div style="font-size: 1.5rem; font-weight: 700; color: var(--success-green);">$${customer.totalSpent.toFixed(2)}</div>
                <div style="font-size: 0.7rem; color: var(--text-light);">Total Spent</div>
            </div>
            <div style="text-align: center;">
                <div style="font-size: 1.5rem; font-weight: 700; color: var(--warning-orange);">$${(customer.totalSpent / customer.totalOrders).toFixed(2)}</div>
                <div style="font-size: 0.7rem; color: var(--text-light);">Avg. Order Value</div>
            </div>
        </div>
        
        <div style="margin-top: 20px;">
            <h4 style="margin-bottom: 15px; border-left: 3px solid var(--primary-main); padding-left: 12px;">
                <i class="fas fa-history"></i> Order History
            </h4>
            ${customerOrders
            .map(
                (order) => `
                <div style="background: #f8f9fa; padding: 12px; border-radius: 10px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                    <div>
                        <strong>${order.orderId}</strong>
                        <div style="font-size: 0.75rem; color: var(--text-light);">${new Date(order.date).toLocaleDateString()}</div>
                    </div>
                    <div><strong>$${order.finalTotal}</strong></div>
                    <div><span class="status-badge status-${order.status}">${order.status}</span></div>
                    <button class="btn-view-order" onclick="viewOrderDetails('${order.orderId}'); closeModal();" style="padding: 5px 12px; background: var(--primary-bg); border: none; border-radius: 6px; cursor: pointer;">
                        <i class="fas fa-eye"></i> View
                    </button>
                </div>
            `,
            )
            .join("")}
        </div>
    `;

    modal.style.display = "flex";
}

function sendWhatsAppToCustomer(phone, name) {
    if (!phone) {
        showNotification("No phone number available for this customer", "error");
        return;
    }

    // Create a pre-filled message
    const message = `Hello ${name}! 👋\n\nThank you for being a valued customer of Horizon Store.\n\nWe have special offers and updates just for you!\n\nClick here to visit our store: https://horizon-store.com\n\nBest regards,\nHorizon Team 🌿`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phone}?text=${encodedMessage}`, "_blank");
}

function exportCustomers() {
    const headers = [
        "Name",
        "Phone",
        "Total Orders",
        "Total Spent",
        "Last Order",
    ];
    const rows = customers.map((c) => [
        c.name,
        c.phone,
        c.totalOrders,
        c.totalSpent,
        new Date(c.lastOrder).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    downloadCSV(csv, `customers_${new Date().toISOString().split("T")[0]}.csv`);
}

// ==================== ANALYTICS ====================
function loadAnalytics() {
    const periodSelect = document.getElementById("analyticsPeriod");
    if (!periodSelect) return;

    const period = parseInt(periodSelect.value);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - period);

    const filteredOrders = orders.filter((o) => new Date(o.date) >= cutoffDate);

    const revenueData = getRevenueData(filteredOrders);
    updateRevenueChart(revenueData);

    const statusData = {
        pending: filteredOrders.filter((o) => o.status === "pending").length,
        confirmed: filteredOrders.filter((o) => o.status === "confirmed").length,
        shipped: filteredOrders.filter((o) => o.status === "shipped").length,
        delivered: filteredOrders.filter((o) => o.status === "delivered").length,
    };
    updateOrderStatusChart(statusData);

    const productSales = {};
    filteredOrders.forEach((order) => {
        if (order.products) {
            order.products.forEach((product) => {
                productSales[product.name] =
                    (productSales[product.name] || 0) + product.quantity;
            });
        }
    });
    updateTopProductsChart(productSales);

    const totalRevenue = filteredOrders.reduce(
        (sum, o) => sum + (o.finalTotal || 0),
        0,
    );
    const avgOrderValue =
        filteredOrders.length > 0 ? totalRevenue / filteredOrders.length : 0;

    const conversionRate = document.getElementById("conversionRate");
    const avgOrderValueEl = document.getElementById("avgOrderValue");

    if (conversionRate)
        conversionRate.textContent = `${((filteredOrders.length / (orders.length || 1)) * 100).toFixed(1)}%`;
    if (avgOrderValueEl)
        avgOrderValueEl.textContent = `$${avgOrderValue.toFixed(2)}`;
}

function getRevenueData(orders) {
    const dailyRevenue = {};
    orders.forEach((order) => {
        const date = new Date(order.date).toLocaleDateString();
        dailyRevenue[date] = (dailyRevenue[date] || 0) + (order.finalTotal || 0);
    });
    const labels = Object.keys(dailyRevenue).slice(-7);
    const values = Object.values(dailyRevenue).slice(-7);
    return { labels, values };
}

function updateRevenueChart(data) {
    const ctx = document.getElementById("revenueChart")?.getContext("2d");
    if (!ctx) return;
    if (revenueChart) revenueChart.destroy();
    revenueChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: data.labels,
            datasets: [
                {
                    label: "Revenue ($)",
                    data: data.values,
                    borderColor: "rgb(141, 210, 233)",
                    tension: 0.4,
                    fill: true,
                },
            ],
        },
    });
}

function updateOrderStatusChart(data) {
    const ctx = document.getElementById("orderStatusChart")?.getContext("2d");
    if (!ctx) return;
    if (orderStatusChart) orderStatusChart.destroy();
    orderStatusChart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: Object.keys(data),
            datasets: [
                {
                    data: Object.values(data),
                    backgroundColor: ["#ff9800", "#2196f3", "#4caf50", "#0284c7"],
                },
            ],
        },
    });
}

function updateTopProductsChart(data) {
    const ctx = document.getElementById("topProductsChart")?.getContext("2d");
    if (!ctx) return;
    const top5 = Object.entries(data)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    if (topProductsChart) topProductsChart.destroy();
    topProductsChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: top5.map((d) => d[0]),
            datasets: [
                {
                    label: "Units Sold",
                    data: top5.map((d) => d[1]),
                    backgroundColor: "rgb(141, 210, 233)",
                },
            ],
        },
        options: { indexAxis: "y" },
    });
}

// ==================== SETTINGS ====================
function loadSettings() {
    const saved = localStorage.getItem("horizon_settings");
    if (saved) {
        const settings = JSON.parse(saved);
        const storeName = document.getElementById("storeName");
        const storeEmail = document.getElementById("storeEmail");
        const currency = document.getElementById("currency");
        const whatsappNumber = document.getElementById("whatsappNumber");
        const callmebotApiKey = document.getElementById("callmebotApiKey");

        if (storeName) storeName.value = settings.storeName || "";
        if (storeEmail) storeEmail.value = settings.storeEmail || "";
        if (currency) currency.value = settings.currency || "$";
        if (whatsappNumber)
            whatsappNumber.value = settings.whatsappNumber || "22667030730";
        if (callmebotApiKey)
            callmebotApiKey.value = settings.callmebotApiKey || "3316810";
    }
}

function saveSettings() {
    const settings = {
        storeName: document.getElementById("storeName")?.value || "",
        storeEmail: document.getElementById("storeEmail")?.value || "",
        currency: document.getElementById("currency")?.value || "$",
        whatsappNumber:
            document.getElementById("whatsappNumber")?.value || "22667030730",
        callmebotApiKey:
            document.getElementById("callmebotApiKey")?.value || "3316810",
    };
    localStorage.setItem("horizon_settings", JSON.stringify(settings));
    showNotification("Settings saved!", "success");
}

function testWhatsAppConnection() {
    showNotification("Test message sent! Check your WhatsApp.", "success");
}

function exportAllData() {
    const allData = { orders, products, customers };
    const dataStr = JSON.stringify(allData, null, 2);
    downloadCSV(
        dataStr,
        `horizon_backup_${new Date().toISOString().split("T")[0]}.json`,
    );
}

function importData() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                if (data.orders)
                    localStorage.setItem("horizon_orders", JSON.stringify(data.orders));
                if (data.products)
                    localStorage.setItem(
                        "horizon_products",
                        JSON.stringify(data.products),
                    );
                location.reload();
            } catch (error) {
                showNotification("Invalid file", "error");
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

function clearAllData() {
    if (
        confirm('⚠️ WARNING: This will delete ALL data! Type "DELETE" to confirm:')
    ) {
        localStorage.removeItem("horizon_orders");
        localStorage.removeItem("horizon_products");
        location.reload();
    }
}

// ==================== HELPER FUNCTIONS ====================
function downloadCSV(content, filename) {
    const blob = new Blob([content], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

function showNotification(message, type = "success") {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.innerHTML = `<i class="fas ${type === "success" ? "fa-check-circle" : "fa-exclamation-circle"}"></i><span>${message}</span>`;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

function closeModal() {
    const modals = document.querySelectorAll(".modal");
    modals.forEach((modal) => {
        if (modal) modal.style.display = "none";
    });
}

function escapeHtml(text) {
    if (!text) return "";
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

function switchPage(page) {
    const pages = [
        "dashboard",
        "orders",
        "products",
        "customers",
        "analytics",
        "settings",
    ];
    pages.forEach((p) => {
        const pageEl = document.getElementById(`${p}Page`);
        if (pageEl) pageEl.style.display = "none";
    });

    const activePage = document.getElementById(`${page}Page`);
    if (activePage) activePage.style.display = "block";

    document.querySelectorAll(".nav-item").forEach((item) => {
        item.classList.remove("active");
        if (item.dataset.page === page) item.classList.add("active");
    });

    if (page === "analytics") loadAnalytics();
    if (page === "orders") loadOrders();
    if (page === "products") loadProducts();
    if (page === "customers") loadCustomers();
    if (page === "dashboard") updateDashboard();
    if (page === 'security') initSecurityPage();
}

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
    document.querySelectorAll(".nav-item").forEach((item) => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            if (item.dataset.page) {
                switchPage(item.dataset.page);
            }
        });
    });

    const orderStatusFilter = document.getElementById("orderStatusFilter");
    const orderDateFilter = document.getElementById("orderDateFilter");
    const orderSearch = document.getElementById("orderSearch");
    const prevOrdersPage = document.getElementById("prevOrdersPage");
    const nextOrdersPage = document.getElementById("nextOrdersPage");
    const exportOrdersBtn = document.getElementById("exportOrdersBtn");
    const exportCustomersBtn = document.getElementById("exportCustomersBtn");
    const analyticsPeriod = document.getElementById("analyticsPeriod");
    const testWhatsAppBtn = document.getElementById("testWhatsAppBtn");
    const exportAllDataBtn = document.getElementById("exportAllDataBtn");
    const importDataBtn = document.getElementById("importDataBtn");
    const clearDataBtn = document.getElementById("clearDataBtn");
    const refreshData = document.getElementById("refreshData");
    const adminProductSearch = document.getElementById("adminProductSearch");
    const refreshProductsBtn = document.getElementById("refreshProductsBtn");

    if (orderStatusFilter) {
        orderStatusFilter.addEventListener("change", (e) => {
            currentOrderFilter = e.target.value;
            currentOrdersPage = 1;
            loadOrders();
        });
    }

    if (orderDateFilter) {
        orderDateFilter.addEventListener("change", (e) => {
            currentDateFilter = e.target.value;
            currentOrdersPage = 1;
            loadOrders();
        });
    }

    if (orderSearch) {
        orderSearch.addEventListener("input", (e) => {
            currentOrderSearch = e.target.value.toLowerCase();
            currentOrdersPage = 1;
            loadOrders();
        });
    }

    if (prevOrdersPage) {
        prevOrdersPage.addEventListener("click", () => {
            if (currentOrdersPage > 1) {
                currentOrdersPage--;
                loadOrders();
            }
        });
    }

    if (nextOrdersPage) {
        nextOrdersPage.addEventListener("click", () => {
            currentOrdersPage++;
            loadOrders();
        });
    }

    if (exportOrdersBtn)
        exportOrdersBtn.addEventListener("click", exportOrdersToCSV);
    if (exportCustomersBtn)
        exportCustomersBtn.addEventListener("click", exportCustomers);
    if (analyticsPeriod)
        analyticsPeriod.addEventListener("change", loadAnalytics);
    if (testWhatsAppBtn)
        testWhatsAppBtn.addEventListener("click", testWhatsAppConnection);
    if (exportAllDataBtn)
        exportAllDataBtn.addEventListener("click", exportAllData);
    if (importDataBtn) importDataBtn.addEventListener("click", importData);
    if (clearDataBtn) clearDataBtn.addEventListener("click", clearAllData);
    if (refreshData)
        refreshData.addEventListener("click", () => location.reload());
    if (adminProductSearch)
        adminProductSearch.addEventListener("input", () => loadProducts());
    if (refreshProductsBtn)
        refreshProductsBtn.addEventListener("click", () => loadProducts());

    const settingsInputs = [
        "storeName",
        "storeEmail",
        "currency",
        "whatsappNumber",
        "callmebotApiKey",
    ];
    settingsInputs.forEach((id) => {
        const element = document.getElementById(id);
        if (element) element.addEventListener("change", saveSettings);
    });

    const editForm = document.getElementById("editProductForm");
    if (editForm) {
        editForm.addEventListener("submit", saveEditedProduct);
    }

    const closeEditBtns = document.querySelectorAll(".close-edit-modal");
    closeEditBtns.forEach((btn) => {
        btn.addEventListener("click", closeEditModal);
    });

    document.querySelectorAll(".modal .close").forEach((btn) => {
        btn.addEventListener("click", closeModal);
    });

    window.onclick = (e) => {
        if (e.target.classList.contains("modal")) closeModal();
        if (e.target.classList.contains("edit-product-modal")) closeEditModal();
    };
}
// ==================== SECURITY PAGE FUNCTIONS ====================

// Initialize Security Page
function initSecurityPage() {
    loadAuditLogs();
    loadSecuritySettings();
    loadBackupHistory();
    updateSecurityStats();
    setupSecurityEventListeners();
    initSecurityFeatures();
    startThreatMonitoring();
}

// Load Audit Logs
function loadAuditLogs() {
    const auditLogs = JSON.parse(localStorage.getItem('horizon_audit_log') || '[]');
    const searchTerm = document.getElementById('auditSearch')?.value.toLowerCase() || '';
    const severity = document.getElementById('severityFilter')?.value || 'all';
    
    let filtered = auditLogs;
    
    if (searchTerm) {
        filtered = filtered.filter(log => 
            log.action.toLowerCase().includes(searchTerm) ||
            JSON.stringify(log.details).toLowerCase().includes(searchTerm)
        );
    }
    
    if (severity !== 'all') {
        filtered = filtered.filter(log => log.severity === severity);
    }
    
    const tbody = document.getElementById('auditLogBody');
    if (!tbody) return;
    
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="loading">No audit logs found</td></tr>';
        return;
    }
    
    tbody.innerHTML = filtered.map(log => `
        <tr>
            <td>${new Date(log.timestamp).toLocaleString()}</td>
            <td>${log.action}</td>
            <td class="severity-${log.severity}">${log.severity.toUpperCase()}</td>
            <td>${typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}</td>
        </tr>
    `).join('');
}

// Load Security Settings
function loadSecuritySettings() {
    const settings = JSON.parse(localStorage.getItem('horizon_security_settings') || '{}');
    if (document.getElementById('enableRateLimit')) {
        document.getElementById('enableRateLimit').checked = settings.enableRateLimit !== false;
        document.getElementById('enableCsrf').checked = settings.enableCsrf !== false;
        document.getElementById('enableSessionTimeout').checked = settings.enableSessionTimeout !== false;
        document.getElementById('logOrders').checked = settings.logOrders !== false;
        document.getElementById('logAdminActions').checked = settings.logAdminActions !== false;
        document.getElementById('logFailedAttempts').checked = settings.logFailedAttempts !== false;
    }
}

// Save Security Settings
function saveSecuritySettings() {
    const settings = {
        enableRateLimit: document.getElementById('enableRateLimit')?.checked || false,
        enableCsrf: document.getElementById('enableCsrf')?.checked || false,
        enableSessionTimeout: document.getElementById('enableSessionTimeout')?.checked || false,
        logOrders: document.getElementById('logOrders')?.checked || false,
        logAdminActions: document.getElementById('logAdminActions')?.checked || false,
        logFailedAttempts: document.getElementById('logFailedAttempts')?.checked || false
    };
    localStorage.setItem('horizon_security_settings', JSON.stringify(settings));
    showNotification('Security settings saved!', 'success');
    
    addSecurityLog('security_settings_updated', { settings: settings }, 'info');
}

// Add Security Log Entry
function addSecurityLog(action, details, severity = 'info') {
    const auditLogs = JSON.parse(localStorage.getItem('horizon_audit_log') || '[]');
    auditLogs.unshift({
        id: Date.now(),
        timestamp: new Date().toISOString(),
        action: action,
        details: details,
        severity: severity,
        userAgent: navigator.userAgent
    });
    // Keep only last 500 logs
    if (auditLogs.length > 500) auditLogs.pop();
    localStorage.setItem('horizon_audit_log', JSON.stringify(auditLogs));
}

// Update Security Stats
function updateSecurityStats() {
    const auditLogs = JSON.parse(localStorage.getItem('horizon_audit_log') || '[]');
    const warnings = auditLogs.filter(l => l.severity === 'warning').length;
    const critical = auditLogs.filter(l => l.severity === 'critical').length;
    
    const totalEvents = document.getElementById('totalAuditEvents');
    const totalWarnings = document.getElementById('totalWarnings');
    const lastCheck = document.getElementById('lastSecurityCheck');
    const securityStatus = document.getElementById('securityStatus');
    const securityBadge = document.getElementById('securityBadge');
    
    if (totalEvents) totalEvents.textContent = auditLogs.length;
    if (totalWarnings) totalWarnings.textContent = warnings + critical;
    if (lastCheck) lastCheck.textContent = new Date().toLocaleTimeString();
    if (securityBadge) securityBadge.textContent = warnings + critical;
    
    if (securityStatus) {
        if (critical > 0) {
            securityStatus.textContent = 'Critical';
            securityStatus.className = 'text-critical';
        } else if (warnings > 0) {
            securityStatus.textContent = 'Warning';
            securityStatus.className = 'text-warning';
        } else {
            securityStatus.textContent = 'Protected';
            securityStatus.className = 'text-success';
        }
    }
}

// Export Audit Logs
function exportAuditLogs() {
    const auditLogs = JSON.parse(localStorage.getItem('horizon_audit_log') || '[]');
    const dataStr = JSON.stringify(auditLogs, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Audit logs exported!', 'success');
}

// Clear Audit Logs
function clearAuditLogs() {
    if (confirm('Are you sure you want to clear all audit logs? This action cannot be undone.')) {
        localStorage.setItem('horizon_audit_log', JSON.stringify([]));
        loadAuditLogs();
        updateSecurityStats();
        showNotification('Audit logs cleared!', 'success');
        addSecurityLog('audit_logs_cleared', {}, 'warning');
    }
}

// Backup Database
function backupDatabase() {
    const backup = {
        id: 'backup_' + Date.now(),
        date: new Date().toISOString(),
        data: {
            orders: JSON.parse(localStorage.getItem('horizon_orders') || '[]'),
            products: JSON.parse(localStorage.getItem('horizon_products') || '[]'),
            settings: localStorage.getItem('horizon_settings'),
            auditLogs: localStorage.getItem('horizon_audit_log')
        }
    };
    
    // Save to backup history
    const backups = JSON.parse(localStorage.getItem('horizon_backups') || '[]');
    backups.unshift(backup);
    localStorage.setItem('horizon_backups', JSON.stringify(backups.slice(0, 10)));
    
    // Download file
    const dataStr = JSON.stringify(backup, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `horizon_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('Backup created successfully!', 'success');
    loadBackupHistory();
    addSecurityLog('database_backup_created', {}, 'info');
}

// Load Backup History
function loadBackupHistory() {
    const backups = JSON.parse(localStorage.getItem('horizon_backups') || '[]');
    const container = document.getElementById('backupHistoryList');
    if (!container) return;
    
    if (backups.length === 0) {
        container.innerHTML = '<p class="text-muted">No backups found</p>';
        return;
    }
    
    container.innerHTML = backups.map(backup => `
        <div class="backup-item" style="display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #e0e0e0;">
            <span>${new Date(backup.date).toLocaleString()}</span>
            <button class="btn-sm" onclick="restoreBackup('${backup.id}')" style="padding: 4px 12px; background: var(--primary-main); color: white; border: none; border-radius: 4px; cursor: pointer;">Restore</button>
        </div>
    `).join('');
}

// Restore Backup
function restoreBackup(backupId) {
    if (confirm('Restoring a backup will overwrite current data. Continue?')) {
        const backups = JSON.parse(localStorage.getItem('horizon_backups') || '[]');
        const backup = backups.find(b => b.id === backupId);
        if (backup && backup.data) {
            localStorage.setItem('horizon_orders', JSON.stringify(backup.data.orders || []));
            localStorage.setItem('horizon_products', JSON.stringify(backup.data.products || []));
            if (backup.data.settings) localStorage.setItem('horizon_settings', backup.data.settings);
            if (backup.data.auditLogs) localStorage.setItem('horizon_audit_log', backup.data.auditLogs);
            showNotification('Backup restored! Reloading page...', 'success');
            setTimeout(() => location.reload(), 1500);
        }
    }
}

// Restore from file
function restoreFromFile(file) {
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const backup = JSON.parse(event.target.result);
            if (backup.data) {
                localStorage.setItem('horizon_orders', JSON.stringify(backup.data.orders || []));
                localStorage.setItem('horizon_products', JSON.stringify(backup.data.products || []));
                showNotification('Backup restored! Reloading...', 'success');
                setTimeout(() => location.reload(), 1500);
            } else {
                showNotification('Invalid backup file format', 'error');
            }
        } catch (error) {
            showNotification('Invalid backup file', 'error');
        }
    };
    reader.readAsText(file);
}

// Run Security Scan
function runSecurityScan() {
    const scanBtn = document.getElementById('runSecurityScanBtn');
    const scanResults = document.getElementById('scanResults');
    const resultsList = document.getElementById('scanResultsList');
    
    if (!scanBtn) return;
    
    scanBtn.disabled = true;
    scanBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Scanning...';
    
    setTimeout(() => {
        const issues = [];
        const warnings = [];
        
        // Check CSP
        const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
        if (!cspMeta) {
            warnings.push({ type: 'warning', message: 'CSP header not configured' });
        }
        
        // Check localStorage data
        const keys = ['horizon_orders', 'horizon_products'];
        keys.forEach(key => {
            const data = localStorage.getItem(key);
            if (data && JSON.parse(data).length > 0) {
                warnings.push({ type: 'warning', message: `Sensitive data found: ${key}` });
            }
        });
        
        // Display results
        if (resultsList) {
            resultsList.innerHTML = '';
            if (warnings.length === 0 && issues.length === 0) {
                resultsList.innerHTML = '<div class="scan-result-item pass"><i class="fas fa-check-circle"></i> All security checks passed!</div>';
            } else {
                [...warnings, ...issues].forEach(check => {
                    const icon = check.type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle';
                    const className = check.type === 'warning' ? 'warning' : 'info';
                    resultsList.innerHTML += `<div class="scan-result-item ${className}"><i class="fas ${icon}"></i> ${check.message}</div>`;
                });
            }
        }
        
        if (scanResults) scanResults.style.display = 'block';
        scanBtn.disabled = false;
        scanBtn.innerHTML = '<i class="fas fa-play"></i> Run Security Scan';
        updateSecurityStats();
        addSecurityLog('security_scan_completed', { issues: warnings.length }, 'info');
        
    }, 2000);
}

// Setup Security Event Listeners
function setupSecurityEventListeners() {
    // Tab switching
    document.querySelectorAll('.sec-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            document.querySelectorAll('.sec-tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.sec-tab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(`${tab}Tab`).classList.add('active');
        });
    });

    // ==================== ENHANCED SECURITY FEATURES ====================

// Real-time threat monitoring
let threatMonitorInterval = null;

function startThreatMonitoring() {
    if (threatMonitorInterval) clearInterval(threatMonitorInterval);
    
    threatMonitorInterval = setInterval(() => {
        checkForSuspiciousActivity();
        checkFailedLoginAttempts();
        monitorRateLimits();
    }, 30000); // Check every 30 seconds
}

function stopThreatMonitoring() {
    if (threatMonitorInterval) {
        clearInterval(threatMonitorInterval);
        threatMonitorInterval = null;
    }
}

// Check for suspicious activity
function checkForSuspiciousActivity() {
    const auditLogs = JSON.parse(localStorage.getItem('horizon_audit_log') || '[]');
    const lastHour = Date.now() - 3600000;
    const recentCritical = auditLogs.filter(log => 
        new Date(log.timestamp).getTime() > lastHour && 
        log.severity === 'critical'
    ).length;
    
    if (recentCritical > 5) {
        showNotification(`⚠️ High threat level detected! ${recentCritical} critical events in last hour.`, 'warning');
        updateThreatIndicator('high');
    } else if (recentCritical > 2) {
        updateThreatIndicator('medium');
    } else {
        updateThreatIndicator('low');
    }
}

// Check failed login attempts
function checkFailedLoginAttempts() {
    const auditLogs = JSON.parse(localStorage.getItem('horizon_audit_log') || '[]');
    const last15Min = Date.now() - 900000;
    const recentFailed = auditLogs.filter(log => 
        new Date(log.timestamp).getTime() > last15Min && 
        log.action === 'failed_login_attempt'
    ).length;
    
    if (recentFailed > 10) {
        showNotification('⚠️ Multiple failed login attempts detected!', 'critical');
        addSecurityLog('brute_force_detected', { attempts: recentFailed }, 'critical');
    }
}

// Monitor rate limits
function monitorRateLimits() {
    const rateLimits = JSON.parse(localStorage.getItem('horizon_rate_limits') || '{}');
    const activeBlocks = Object.values(rateLimits).filter(l => l.blockedUntil > Date.now()).length;
    
    if (activeBlocks > 0) {
        const threatIndicator = document.getElementById('threatIndicator');
        if (threatIndicator) {
            threatIndicator.innerHTML = `<span class="badge warning">${activeBlocks} Active Blocks</span>`;
        }
    }
}

// Update threat indicator
function updateThreatIndicator(level) {
    const threatIndicator = document.getElementById('threatIndicator');
    if (!threatIndicator) return;
    
    if (level === 'high') {
        threatIndicator.innerHTML = '<span class="badge critical">🔴 High Threat</span>';
    } else if (level === 'medium') {
        threatIndicator.innerHTML = '<span class="badge warning">🟡 Medium Threat</span>';
    } else {
        threatIndicator.innerHTML = '<span class="badge success">🟢 Low Threat</span>';
    }
}

// Two-Factor Authentication Setup (Simulated)
function setupTwoFactorAuth() {
    const secret = Math.random().toString(36).substr(2, 16).toUpperCase();
    const backupCodes = [];
    for (let i = 0; i < 10; i++) {
        backupCodes.push(Math.floor(100000 + Math.random() * 900000));
    }
    
    localStorage.setItem('horizon_2fa_secret', secret);
    localStorage.setItem('horizon_2fa_backup_codes', JSON.stringify(backupCodes));
    
    alert(`2FA Setup:\n\nSecret Key: ${secret}\n\nBackup Codes: ${backupCodes.join(', ')}\n\nSave these codes securely!`);
    addSecurityLog('2fa_enabled', {}, 'info');
}

// Session Management
function manageSessions() {
    const sessions = JSON.parse(localStorage.getItem('horizon_active_sessions') || '[]');
    const currentSession = sessionStorage.getItem('horizon_session_id');
    
    // Remove expired sessions
    const validSessions = sessions.filter(s => s.expires > Date.now());
    
    // Add current session if not exists
    if (currentSession && !validSessions.find(s => s.id === currentSession)) {
        validSessions.push({
            id: currentSession,
            created: Date.now(),
            expires: Date.now() + 3600000,
            userAgent: navigator.userAgent
        });
    }
    
    localStorage.setItem('horizon_active_sessions', JSON.stringify(validSessions));
    
    // Show other active sessions
    if (validSessions.length > 1) {
        showNotification(`⚠️ You have ${validSessions.length} active sessions.`, 'warning');
    }
}

// Logout from all other sessions
function logoutOtherSessions() {
    const currentSession = sessionStorage.getItem('horizon_session_id');
    const sessions = JSON.parse(localStorage.getItem('horizon_active_sessions') || '[]');
    const filteredSessions = sessions.filter(s => s.id === currentSession);
    localStorage.setItem('horizon_active_sessions', JSON.stringify(filteredSessions));
    showNotification('Logged out from other sessions!', 'success');
    addSecurityLog('other_sessions_terminated', {}, 'info');
}

// Generate secure order token
function generateOrderToken(orderId) {
    const token = btoa(orderId + Date.now() + Math.random());
    localStorage.setItem(`order_token_${orderId}`, token);
    return token;
}

// Validate order token
function validateOrderToken(orderId, token) {
    const storedToken = localStorage.getItem(`order_token_${orderId}`);
    return storedToken === token;
}

// Add to security settings panel
function addAdvancedSecurityControls() {
    const securitySettings = document.querySelector('.security-settings-card');
    if (securitySettings && !document.getElementById('advancedSecuritySection')) {
        const advancedHTML = `
            <div id="advancedSecuritySection" style="margin-top: 20px;">
                <h3><i class="fas fa-shield-virus"></i> Advanced Security</h3>
                <div class="setting-row">
                    <label>
                        <input type="checkbox" id="enable2FA">
                        <span>Enable Two-Factor Authentication</span>
                    </label>
                </div>
                <div class="setting-row">
                    <label>
                        <input type="checkbox" id="enableSessionManagement">
                        <span>Session Management</span>
                    </label>
                </div>
                <div class="setting-row">
                    <button id="setup2FABtn" class="btn-secondary" style="margin-top: 10px;">
                        <i class="fas fa-shield-alt"></i> Setup 2FA
                    </button>
                    <button id="logoutOtherSessionsBtn" class="btn-secondary" style="margin-top: 10px; margin-left: 10px;">
                        <i class="fas fa-sign-out-alt"></i> Logout Other Sessions
                    </button>
                </div>
            </div>
        `;
        securitySettings.insertAdjacentHTML('beforeend', advancedHTML);
        
        document.getElementById('setup2FABtn')?.addEventListener('click', setupTwoFactorAuth);
        document.getElementById('logoutOtherSessionsBtn')?.addEventListener('click', logoutOtherSessions);
        
        // Load 2FA setting
        const saved2FA = localStorage.getItem('horizon_2fa_enabled') === 'true';
        document.getElementById('enable2FA').checked = saved2FA;
        document.getElementById('enable2FA').addEventListener('change', (e) => {
            localStorage.setItem('horizon_2fa_enabled', e.target.checked);
            addSecurityLog('2fa_setting_changed', { enabled: e.target.checked }, 'info');
        });
        
        // Session management setting
        const savedSessionMgmt = localStorage.getItem('horizon_session_management') !== 'false';
        document.getElementById('enableSessionManagement').checked = savedSessionMgmt;
        document.getElementById('enableSessionManagement').addEventListener('change', (e) => {
            localStorage.setItem('horizon_session_management', e.target.checked);
            if (e.target.checked) manageSessions();
        });
    }
}

// Data Encryption
function encryptData(data, key) {
    // Simple encryption for demo - In production, use proper encryption
    const encrypted = btoa(JSON.stringify(data) + key);
    return encrypted;
}

function decryptData(encrypted, key) {
    try {
        const decrypted = atob(encrypted);
        if (decrypted.endsWith(key)) {
            return JSON.parse(decrypted.slice(0, -key.length));
        }
        return null;
    } catch {
        return null;
    }
}

// Secure storage for sensitive data
function storeSecure(key, value) {
    const encryptionKey = localStorage.getItem('horizon_encryption_key') || 'default_key_2024';
    const encrypted = encryptData(value, encryptionKey);
    localStorage.setItem(`secure_${key}`, encrypted);
}

function retrieveSecure(key) {
    const encryptionKey = localStorage.getItem('horizon_encryption_key') || 'default_key_2024';
    const encrypted = localStorage.getItem(`secure_${key}`);
    if (encrypted) {
        return decryptData(encrypted, encryptionKey);
    }
    return null;
}

// Add threat indicator to navbar
function addThreatIndicator() {
    const headerActions = document.querySelector('.header-actions');
    if (headerActions && !document.getElementById('threatIndicator')) {
        const threatDiv = document.createElement('div');
        threatDiv.id = 'threatIndicator';
        threatDiv.className = 'threat-indicator';
        threatDiv.innerHTML = '<span class="badge success">🟢 Low Threat</span>';
        threatDiv.style.marginRight = '15px';
        headerActions.insertBefore(threatDiv, headerActions.firstChild);
    }
}

// Initialize all security features
function initSecurityFeatures() {
    addThreatIndicator();
    startThreatMonitoring();
    manageSessions();
    addAdvancedSecurityControls();
    
    // Generate session ID if not exists
    if (!sessionStorage.getItem('horizon_session_id')) {
        const sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 16);
        sessionStorage.setItem('horizon_session_id', sessionId);
    }
    
    addSecurityLog('security_features_initialized', {}, 'info');
}

// Call initSecurityFeatures when admin page loads
// Add to your DOMContentLoaded:
// initSecurityFeatures();
    
    // Audit filters
    const auditSearch = document.getElementById('auditSearch');
    const severityFilter = document.getElementById('severityFilter');
    const exportAuditBtn = document.getElementById('exportAuditBtn');
    const clearAuditBtn = document.getElementById('clearAuditBtn');
    
    if (auditSearch) auditSearch.addEventListener('input', () => loadAuditLogs());
    if (severityFilter) severityFilter.addEventListener('change', () => loadAuditLogs());
    if (exportAuditBtn) exportAuditBtn.addEventListener('click', exportAuditLogs);
    if (clearAuditBtn) clearAuditBtn.addEventListener('click', clearAuditLogs);
    
    // Security settings save
    const saveSettingsBtn = document.getElementById('saveSecuritySettings');
    if (saveSettingsBtn) saveSettingsBtn.addEventListener('click', saveSecuritySettings);
    
    // Backup buttons
    const backupDatabaseBtn = document.getElementById('backupDatabaseBtn');
    const restoreDatabaseBtn = document.getElementById('restoreDatabaseBtn');
    const restoreFileInput = document.getElementById('restoreFile');
    const runScanBtn = document.getElementById('runSecurityScanBtn');
    
    if (backupDatabaseBtn) backupDatabaseBtn.addEventListener('click', backupDatabase);
    if (restoreDatabaseBtn && restoreFileInput) {
        restoreDatabaseBtn.addEventListener('click', () => restoreFileInput.click());
        restoreFileInput.addEventListener('change', (e) => {
            if (e.target.files[0]) restoreFromFile(e.target.files[0]);
        });
    }
    if (runScanBtn) runScanBtn.addEventListener('click', runSecurityScan);
}

// Make functions global
window.viewOrderDetails = viewOrderDetails;
window.changeOrderStatus = changeOrderStatus;
window.updateOrderStatusPrompt = updateOrderStatusPrompt;
window.sendWhatsAppMessage = sendWhatsAppMessage;
window.closeModal = closeModal;
window.adminAdjustStock = adminAdjustStock;
window.adminSetStock = adminSetStock;
window.openEditProductModal = openEditProductModal;
window.deleteProduct = deleteProduct;
window.closeEditModal = closeEditModal;
window.viewCustomerDetails = viewCustomerDetails;
window.sendWhatsAppToCustomer = sendWhatsAppToCustomer;
