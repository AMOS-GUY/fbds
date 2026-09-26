import { api } from '../api.js';
import { cart } from '../cart.js';
import { showToast } from '../components.js';

export function renderCartPreview() {
  const app = document.getElementById('app');
  if (cart.items.length === 0) {
    app.innerHTML = `<div class="text-center py-16"><h2 class="text-2xl font-bold mb-4">Your cart is empty</h2><a href="#products" class="text-primary-600 hover:underline">Browse Products</a></div>`;
    return;
  }
  app.innerHTML = `
    <div class="max-w-3xl mx-auto bg-white rounded-xl shadow p-6">
      <h2 class="text-xl font-bold mb-4">Cart (${cart.items.reduce((s,i)=>s+i.quantity,0)} items)</h2>
      <ul class="divide-y mb-6">${cart.items.map(i => `<li class="py-3 flex justify-between"><span>${i.name} x${i.quantity}</span><span class="font-medium">${(i.price * i.quantity).toLocaleString()} XOF</span></li>`).join('')}</ul>
      <div class="flex justify-between font-bold text-lg border-t pt-4"><span>Total</span><span>${cart.getTotal().toLocaleString()} XOF</span></div>
      <a href="#checkout" class="mt-6 block w-full text-center py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition">Proceed to Checkout</a>
    </div>
  `;
}

export function render() {
  const app = document.getElementById('app');
  let step = 1;
  const form = { fullName: '', phone: '+226', address: '', note: '', payment: 'whatsapp' };

  const renderStep = () => {
    if (step === 1) {
      app.innerHTML = `
        <div class="max-w-2xl mx-auto bg-white rounded-xl shadow p-6">
          <h2 class="text-xl font-bold mb-4">Delivery Details</h2>
          <div class="space-y-4">
            <input id="name" value="${form.fullName}" placeholder="Full Name" class="w-full p-3 border rounded-lg">
            <input id="phone" value="${form.phone}" placeholder="Phone (+226...)" class="w-full p-3 border rounded-lg">
            <textarea id="address" placeholder="Address & Landmark" class="w-full p-3 border rounded-lg h-24">${form.address}</textarea>
            <textarea id="note" placeholder="Delivery notes (optional)" class="w-full p-3 border rounded-lg h-20">${form.note}</textarea>
          </div>
          <button id="next" class="mt-6 w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Continue</button>
        </div>
      `;
      document.getElementById('next').onclick = () => {
        form.fullName = document.getElementById('name').value;
        form.phone = document.getElementById('phone').value;
        form.address = document.getElementById('address').value;
        form.note = document.getElementById('note').value;
        if (!form.fullName || form.phone.length < 10 || !form.address) return showToast('Fill all required fields', 'error');
        step = 2; renderStep();
      };
    } else if (step === 2) {
      app.innerHTML = `
        <div class="max-w-2xl mx-auto bg-white rounded-xl shadow p-6">
          <h2 class="text-xl font-bold mb-4">Payment Method</h2>
          <div class="space-y-3 mb-6">
            ${['whatsapp','cod','custom'].map(m => `
              <label class="flex items-center p-4 border rounded-lg cursor-pointer ${form.payment===m?'border-primary-600 bg-primary-50':''}">
                <input type="radio" name="pay" value="${m}" ${form.payment===m?'checked':''} class="mr-3">
                <span class="capitalize">${m === 'whatsapp' ? '💬 WhatsApp Confirmation' : m === 'cod' ? '🤝 Cash on Delivery' : '🏦 Bank/Mobile Transfer'}</span>
              </label>
            `).join('')}
          </div>
          <div class="flex gap-3">
            <button id="back" class="flex-1 py-3 border rounded-lg hover:bg-gray-50">Back</button>
            <button id="submit" class="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700">Place Order</button>
          </div>
        </div>
      `;
      document.querySelectorAll('input[name="pay"]').forEach(r => r.onchange = e => form.payment = e.target.value);
      document.getElementById('back').onclick = () => { step = 1; renderStep(); };
      document.getElementById('submit').onclick = submitOrder;
    }
  };

  const submitOrder = async () => {
    try {
      await api.createOrder({
        customerName: form.fullName,
        customerPhone: form.phone,
        deliveryAddress: form.address,
        deliveryNote: form.note,
        paymentMethod: form.payment,
        items: cart.items.map(i => ({ product: i._id, quantity: i.quantity, price: i.price })),
        totalAmount: cart.getTotal()
      });
      cart.clear();
      app.innerHTML = `
        <div class="max-w-2xl mx-auto bg-white rounded-xl shadow p-6 text-center">
          <div class="text-5xl mb-4">✅</div>
          <h2 class="text-2xl font-bold mb-2">Order Received!</h2>
          <p class="text-gray-500 mb-6">We'll coordinate payment & delivery via WhatsApp.</p>
          <a id="wa-confirm" href="#" target="_blank" class="inline-block px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600">Confirm on WhatsApp</a>
          <a href="#home" class="block mt-3 text-primary-600 hover:underline">Return Home</a>
        </div>
      `;
      const msg = encodeURIComponent(`🛒 *NEW ORDER*\n👤 ${form.fullName}\n📱 ${form.phone}\n📍 ${form.address}\n💰 Total: ${cart.getTotal().toLocaleString()} XOF\n💳 ${form.payment.toUpperCase()}\n\nItems:\n${cart.items.map(i=>`• ${i.name} x${i.quantity}`).join('\n')}`);
      document.getElementById('wa-confirm').href = `https://wa.me/${import.meta.env.VITE_ADMIN_PHONE || '226XXXXXXXXXX'}?text=${msg}`;
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  renderStep();
}