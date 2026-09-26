import { api } from '../api.js';
import { cart } from '../cart.js';
import { showToast } from '../components.js';

export async function render(params) {
  const id = params.get('id');
  if (!id) {
    location.hash = '#products';
    return;
  }

  const app = document.getElementById('app');
  
  try {
    const product = await api.getProduct(id);
    
    app.innerHTML = `
      <div class="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 bg-white rounded-2xl shadow-sm p-6">
        <!-- Image Gallery -->
        <div class="space-y-4">
          <div class="relative aspect-square bg-gray-100 rounded-xl overflow-hidden">
            <img src="${product.images?.[0] || 'https://placehold.co/600x600'}" alt="${product.name}" class="w-full h-full object-cover">
          </div>
          <div class="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            ${product.images?.map((img, i) => `
              <img src="${img}" class="w-16 h-16 object-cover rounded-lg cursor-pointer border-2 border-transparent hover:border-primary-500" alt="thumb ${i}">
            `).join('') || ''}
          </div>
        </div>

        <!-- Product Info -->
        <div>
          <span class="text-sm text-primary-600 font-medium uppercase tracking-wide">${product.category}</span>
          <h1 class="text-2xl font-bold text-gray-900 mt-2">${product.name}</h1>
          <p class="text-gray-600 mt-4 leading-relaxed">${product.description}</p>
          
          <div class="mt-6 flex items-baseline gap-3">
            <span class="text-3xl font-bold text-gray-900">${product.price.toLocaleString()} XOF</span>
            ${product.stock > 0 && product.stock <= 5 ? `<span class="px-2 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full font-medium">Only ${product.stock} left</span>` : ''}
          </div>

          <div class="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div class="p-3 bg-gray-50 rounded-lg"><span class="text-gray-500">Origin:</span> <span class="font-medium">${product.originCountry || 'China'}</span></div>
            <div class="p-3 bg-gray-50 rounded-lg"><span class="text-gray-500">Supplier:</span> <span class="font-medium">${product.supplier || 'Official'}</span></div>
          </div>

          <div class="mt-8 flex items-center gap-4">
            <div class="flex items-center border rounded-lg">
              <button id="qty-minus" class="px-4 py-3 hover:bg-gray-100">-</button>
              <span id="qty" class="px-4 font-medium">1</span>
              <button id="qty-plus" class="px-4 py-3 hover:bg-gray-100">+</button>
            </div>
            
            ${product.stock > 0 ? `
              <button id="add-cart" class="flex-1 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition flex items-center justify-center gap-2">
                🛒 Add to Cart
              </button>
            ` : `
              <button onclick="showToast('We will notify you when this is back in stock!')" class="flex-1 py-3 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-900 transition flex items-center justify-center gap-2">
                🔔 Notify When Available
              </button>
            `}
          </div>
          
          <p class="mt-4 text-xs text-gray-400">
            📦 Shipping coordinated via WhatsApp • 💳 Cash/Mobile/Bank payments accepted • 🔐 Secure transactions
          </p>
        </div>
      </div>
    `;

    // Quantity controls
    let qty = 1;
    const qtyEl = document.getElementById('qty');
    document.getElementById('qty-minus').onclick = () => {
      if (qty > 1) { qty--; qtyEl.textContent = qty; }
    };
    document.getElementById('qty-plus').onclick = () => {
      if (qty < product.stock) { qty++; qtyEl.textContent = qty; }
    };

    // Add to cart
    document.getElementById('add-cart')?.addEventListener('click', () => {
      for (let i = 0; i < qty; i++) cart.add(product);
      showToast(`Added ${qty} x ${product.name} to cart`);
    });

  } catch (err) {
    app.innerHTML = `<p class="text-red-500 text-center py-10">${err.message}</p>`;
    showToast('Product not found', 'error');
    setTimeout(() => location.hash = '#products', 2000);
  }
}