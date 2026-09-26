import * as Auth from './auth.js';
import { cart } from './cart.js';
import { Footer, Navbar } from './components.js';
import * as Admin from './views/admin.js';
import * as Checkout from './views/checkout.js';
import * as Products from './views/products.js';

document.getElementById('navbar').innerHTML = Navbar();
document.getElementById('footer').innerHTML = Footer();

window.addEventListener('cart:updated', () => {
  const count = document.getElementById('cart-count');
  if (count) count.textContent = cart.items.reduce((s, i) => s + i.quantity, 0);
});
window.dispatchEvent(new Event('cart:updated'));

const routes = {
  '#home': () => Products.render(),
  '#products': () => Products.render(),
  '#cart': () => Checkout.renderCartPreview(),
  '#checkout': () => (localStorage.getItem('token') ? Checkout.render() : showToast('Please login first', 'error')),
  '#admin': () => (localStorage.getItem('role') === 'admin' ? Admin.render() : showToast('Unauthorized', 'error')),
  '#login': () => Auth.renderLogin(),
  '#register': () => Auth.renderRegister(),
  '#verify': (token) => Auth.renderVerify(token)
};

window.handleRoute = () => {
  const hash = window.location.hash || '#home';
  const [path, param] = hash.split('?')[0].split('/');
  const app = document.getElementById('app');
  app.innerHTML = '<p class="text-center py-10">Loading...</p>';
  
  try {
    if (routes[path]) routes[path](param);
    else app.innerHTML = '<h2 class="text-2xl text-center py-10">Page not found</h2>';
  } catch (err) {
    app.innerHTML = `<p class="text-center text-red-500 py-10">${err.message}</p>`;
  }
};

window.addEventListener('hashchange', window.handleRoute);
window.addEventListener('DOMContentLoaded', window.handleRoute);