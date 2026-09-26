import { api } from '../api.js';
import { cart } from '../cart.js';
import { showToast } from '../components.js';

export async function render() {
  const app = document.getElementById('app');
  
  try {
    const { products } = await api.getProducts({ limit: 4 });
    
    app.innerHTML = `
      <!-- Hero Section -->
      <section class="text-center py-12 px-4 bg-gradient-to-r from-primary-50 to-blue-50 rounded-2xl mb-10">
        <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Quality Products from China <br/>
          <span class="text-primary-600">Delivered to Burkina Faso</span>
        </h1>
        <p class="text-gray-600 mb-6 max-w-2xl mx-auto">
          Browse our curated selection. Order via WhatsApp. Pay with cash, mobile money, or bank transfer.
        </p>
        <a href="#products" class="inline-block px-8 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition">
          Browse Products →
        </a>
      </section>

      <!-- Featured Products -->
      <section>
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold">Featured Products</h2>
          <a href="#products" class="text-primary-600 hover:underline text-sm">View All →</a>
        </div>
        <div id="featured-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"></div>
      </section>

      <!-- How It Works -->
      <section class="mt-16 bg-white rounded-xl shadow-sm p-6">
        <h2 class="text-xl font-bold mb-6 text-center">How It Works</h2>
        <div class="grid md:grid-cols-3 gap-6 text-center">
          <div class="p-4">
            <div class="text-3xl mb-3">🔍</div>
            <h3 class="font-medium mb-2">Browse or Request</h3>
            <p class="text-sm text-gray-500">Find products or tell us what you need</p>
          </div>
          <div class="p-4">
            <div class="text-3xl mb-3">💬</div>
            <h3 class="font-medium mb-2">Confirm via WhatsApp</h3>
            <p class="text-sm text-gray-500">We coordinate payment & delivery details</p>
          </div>
          <div class="p-4">
            <div class="text-3xl mb-3">📦</div>
            <h3 class="font-medium mb-2">Receive in Burkina</h3>
            <p class="text-sm text-gray-500">Cash on delivery or mobile payment</p>
          </div>
        </div>
      </section>
    `;

    const grid = document.getElementById('featured-grid');
    grid.innerHTML = products.map(p => `
      <div class="bg-white rounded-xl shadow-sm border overflow-hidden group cursor-pointer" onclick="location.hash='#product?id=${p._id}'">
        <div class="relative aspect-[4/3] bg-gray-100">
          <img src="${p.images?.[0] || 'https://placehold.co/400x300'}" alt="${p.name}" class="w-full h-full object-cover group-hover:scale-105 transition">
          ${p.stock <= 5 && p.stock > 0 ? `<span class="absolute top-2 left-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Only ${p.stock} left</span>` : ''}
          ${p.stock === 0 ? `<div class="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-medium">Out of Stock</div>` : ''}
        </div>
        <div class="p-4">
          <h3 class="font-medium line-clamp-1">${p.name}</h3>
          <p class="text-sm text-gray-500 line-clamp-2 mt-1">${p.description}</p>
          <div class="flex justify-between items-center mt-3">
            <span class="font-bold text-lg">${p.price.toLocaleString()} XOF</span>
            <button onclick="event.stopPropagation(); window.cartAdd('${p._id}')" ${p.stock === 0 ? 'disabled class="opacity-50"' : ''} class="px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm">
              ${p.stock === 0 ? 'Notify' : 'Add'}
            </button>
          </div>
        </div>
      </div>
    `).join('');

    // Add to cart handler
    window.cartAdd = (id) => {
      const product = products.find(p => p._id === id);
      if (product) {
        cart.add(product);
        showToast('Added to cart');
      }
    };

  } catch (err) {
    app.innerHTML = `<p class="text-red-500 text-center py-10">Failed to load products: ${err.message}</p>`;
    showToast('Could not load products', 'error');
  }
}