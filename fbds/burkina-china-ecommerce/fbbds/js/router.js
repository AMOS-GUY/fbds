import { Footer, Navbar, showToast } from './components.js';
import * as Admin from './views/admin.js';
import * as CartView from './views/cart.js';
import * as Checkout from './views/checkout.js';
import * as Home from './views/home.js';
import * as Login from './views/login.js';
import * as ProductDetail from './views/productDetail.js';
import * as Products from './views/products.js';
import * as Register from './views/register.js';

// Render static parts
document.getElementById('navbar').innerHTML = Navbar();
document.getElementById('footer').innerHTML = Footer();

// Route definitions
const routes = {
  '#home': Home.render,
  '#products': Products.render,
  '#product': ProductDetail.render,
  '#cart': CartView.render,
  '#checkout': Checkout.render,
  '#login': Login.render,
  '#register': Register.render,
  '#admin': Admin.render,
  '#request': () => showToast('Product request feature coming soon!')
};

// Router logic
const handleRoute = () => {
  const hash = window.location.hash || '#home';
  const app = document.getElementById('app');
  
  // Show loading
  app.innerHTML = '<p class="text-center py-10 text-gray-500">Loading...</p>';
  
  // Parse route and params
  const [path, queryString] = hash.split('?');
  const params = new URLSearchParams(queryString || '');
  
  // Execute route handler
  try {
    if (routes[path]) {
      routes[path](params);
    } else {
      app.innerHTML = `
        <div class="text-center py-16">
          <h2 class="text-2xl font-bold mb-4">Page not found</h2>
          <a href="#home" class="text-primary-600 hover:underline">Return Home</a>
        </div>
      `;
    }
  } catch (err) {
    console.error('Route error:', err);
    app.innerHTML = `<p class="text-center text-red-500 py-10">${err.message || 'An error occurred'}</p>`;
    showToast('Page load failed', 'error');
  }
};

// Listen for navigation
window.addEventListener('hashchange', handleRoute);
window.addEventListener('DOMContentLoaded', handleRoute);

// Expose global helpers
window.addToCart = (productId) => {
  // Handled in product views
};