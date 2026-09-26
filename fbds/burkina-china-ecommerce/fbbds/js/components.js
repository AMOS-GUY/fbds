import { cart } from './cart.js';

export const Navbar = () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const cartCount = cart.getCount();

  return `
    <div class="container mx-auto px-4 py-3 flex justify-between items-center">
      <a href="#home" class="text-xl font-bold text-primary-700 flex items-center gap-2">
        <span class="text-burkina-red">Faso</span>
        <span class="text-burkina-green">Best</span>
        <span class="text-burkina-yellow">Deals</span>
      </a>
      
      <div class="hidden md:flex items-center gap-6">
        <a href="#products" class="hover:text-primary-600 transition">Products</a>
        <a href="#request" class="hover:text-primary-600 transition">Request Product</a>
        ${role === 'admin' ? `<a href="#admin" class="hover:text-primary-600 transition">Admin</a>` : ''}
      </div>
      
      <div class="flex items-center gap-3">
        <a href="#cart" class="relative hover:text-primary-600 transition">
          <span class="text-xl">🛒</span>
          <span id="cart-count" class="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">${cartCount}</span>
        </a>
        
        ${token ? `
          <div class="relative group">
            <button class="flex items-center gap-1 hover:text-primary-600">
              👤 ${localStorage.getItem('userName') || 'User'}
            </button>
            <div class="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg py-2 hidden group-hover:block border">
              <a href="#orders" class="block px-4 py-2 hover:bg-gray-50">My Orders</a>
              <button onclick="window.logout()" class="block w-full text-left px-4 py-2 hover:bg-gray-50 text-red-600">Logout</button>
            </div>
          </div>
        ` : `
          <a href="#login" class="px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition">Login</a>
          <a href="#register" class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition">Sign Up</a>
        `}
      </div>
    </div>
  `;
};

export const Footer = () => `
  <div class="container mx-auto px-4 text-center">
    <p class="mb-2 font-medium">© ${new Date().getFullYear()} Faso Best Deals</p>
    <p class="text-sm text-gray-400 mb-4">Secure Burkina Faso ↔ China cross-border trade</p>
    <div class="flex justify-center gap-4 text-sm text-gray-300">
      <span>✅ Email Verified Accounts</span>
      <span>✅ WhatsApp Order Coordination</span>
      <span>✅ Cash/Mobile Payments Supported</span>
    </div>
  </div>
`;

export const showToast = (message, type = 'success') => {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `px-4 py-3 rounded-lg shadow-md text-white text-sm flex items-center gap-2 animate-fade-in-up ${
    type === 'error' ? 'bg-red-500' : 'bg-green-500'
  }`;
  toast.innerHTML = `
    <span>${type === 'error' ? '❌' : '✅'}</span>
    <span>${message}</span>
  `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};

window.logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('userName');
  showToast('Logged out successfully');
  setTimeout(() => {
    location.hash = '#home';
    location.reload();
  }, 500);
};