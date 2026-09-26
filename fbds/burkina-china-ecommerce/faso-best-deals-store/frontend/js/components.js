export const Navbar = () => {
  const token = localStorage.getItem('token');
  const isAdmin = localStorage.getItem('role') === 'admin';
  return `
    <div class="container mx-auto px-4 py-3 flex justify-between items-center">
      <a href="#home" class="text-xl font-bold text-primary-700">BurkinaChina</a>
      <div class="flex items-center gap-4">
        <a href="#products" class="hover:text-primary-600">Products</a>
        <a href="#cart" class="relative hover:text-primary-600">
          🛒 Cart
          <span id="cart-count" class="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">0</span>
        </a>
        ${token ? (isAdmin ? `<a href="#admin" class="hover:text-primary-600">Admin</a>` : '') : `<a href="#login" class="hover:text-primary-600">Login</a>`}
        ${token ? `<button onclick="window.logout()" class="text-red-500 hover:text-red-600">Logout</button>` : ''}
      </div>
    </div>
  `;
};

export const Footer = () => `
  <div class="container mx-auto px-4 text-center">
    <p class="mb-2">© ${new Date().getFullYear()} BurkinaChina Connect. Secure cross-border trade.</p>
    <p class="text-sm text-gray-400">Email verification enabled • WhatsApp order coordination • Cash/Mobile payments supported</p>
  </div>
`;

export const showToast = (message, type = 'success') => {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `px-4 py-3 rounded-lg shadow-md text-white text-sm ${type === 'error' ? 'bg-red-500' : 'bg-green-500'} animate-fade-in-up`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
};

window.logout = () => {
  localStorage.clear();
  location.hash = '#home';
  location.reload();
};