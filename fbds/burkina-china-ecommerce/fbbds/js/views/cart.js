import { cart } from '../cart.js';

export function render() {
  const app = document.getElementById('app');
  
  if (cart.items.length === 0) {
    app.innerHTML = `
      <div class="text-center py-16">
        <div class="text-6xl mb-4">🛒</div>
        <h2 class="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p class="text-gray-500 mb-6">Add some products to get started</p>
        <a href="#products" class="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition">Browse Products</a>
      </div>
    `;
    return;
  }

  app.innerHTML = `
    <div class="max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold mb-6">Your Cart (${cart.getCount()} items)</h1>
      
      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <ul class="divide-y">
          ${cart.items.map(item => `
            <li class="p-4 flex items-center gap-4">
              <img src="${item.images?.[0] || 'https://placehold.co/80x80'}" alt="${item.name}" class="w-16 h-16 object-cover rounded-lg">
              <div class="flex-1 min-w-0">
                <h3 class="font-medium line-clamp-1">${item.name}</h3>
                <p class="text-sm text-gray-500">${item.price.toLocaleString()} XOF each</p>
              </div>
              <div class="flex items-center gap-3">
                <button onclick="window.updateQty('${item._id}', ${item.quantity - 1})" class="w-8 h-8 rounded-full border hover:bg-gray-50">-</button>
                <span class="w-8 text-center">${item.quantity}</span>
                <button onclick="window.updateQty('${item._id}', ${item.quantity + 1})" class="w-8 h-8 rounded-full border hover:bg-gray-50">+</button>
              </div>
              <div class="font-bold min-w-[100px] text-right">${(item.price * item.quantity).toLocaleString()} XOF</div>
              <button onclick="window.removeItem('${item._id}')" class="text-red-500 hover:text-red-600 ml-2">✕</button>
            </li>
          `).join('')}
        </ul>
        
        <div class="p-4 bg-gray-50 border-t flex justify-between items-center">
          <span class="text-lg font-bold">Total:</span>
          <span class="text-2xl font-bold text-primary-700">${cart.getTotal().toLocaleString()} XOF</span>
        </div>
      </div>
      
      <div class="mt-6 flex flex-col sm:flex-row gap-3">
        <a href="#products" class="flex-1 text-center py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition">Continue Shopping</a>
        <a href="#checkout" class="flex-1 text-center py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium">Proceed to Checkout</a>
      </div>
    </div>
  `;

  // Global handlers for cart actions
  window.removeItem = (id) => {
    cart.remove(id);
  };
  
  window.updateQty = (id, qty) => {
    if (qty < 1) return;
    cart.updateQuantity(id, qty);
  };
}