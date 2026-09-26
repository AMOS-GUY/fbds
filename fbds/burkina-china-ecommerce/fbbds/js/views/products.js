import { api } from '../api.js';
import { cart } from '../cart.js';
import { showToast } from '../components.js';

export async function render() {
  const app = document.getElementById('app');
  
  try {
    const { products } = await api.getProducts();
    
    app.innerHTML = `
      <div class="mb-6 flex flex-col sm:flex-row gap-3">
        <input id="search" type="text" placeholder="Search products..." class="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
        <select id="category" class="p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
          <option value="">All Categories</option>
          <option value="Electronics">Electronics</option>
          <option value="Fashion">Fashion</option>
          <option value="Home">Home & Garden</option>
          <option value="Health">Health & Beauty</option>
        </select>
      </div>
      <div id="grid" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"></div>
    `;

    const grid = document.getElementById('grid');
    
    const renderCards = (items) => {
      if (items.length === 0) {
        grid.innerHTML = '<p class="col-span-full text-center py-10 text-gray-500">No products found</p>';
        return;
      }
      
      grid.innerHTML = items.map(p => `
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
    };

    renderCards(products);

    // Handlers
    window.cartAdd = (id) => {
      const product = products.find(p => p._id === id);
      if (product) {
        cart.add(product);
        showToast('Added to cart');
      }
    };

    document.getElementById('search').addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      const filtered = products.filter(p => 
        p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
      renderCards(filtered);
    });

    document.getElementById('category').addEventListener('change', (e) => {
      const cat = e.target.value;
      const filtered = cat ? products.filter(p => p.category === cat) : products;
      renderCards(filtered);
    });

  } catch (err) {
    app.innerHTML = `<p class="text-red-500 text-center py-10">Failed to load products: ${err.message}</p>`;
    showToast('Could not load products', 'error');
  }
}