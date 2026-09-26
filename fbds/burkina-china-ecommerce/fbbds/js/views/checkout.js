import { api } from '../api.js';
import { cart } from '../cart.js';
import { showToast } from '../components.js';

export function render() {
  const app = document.getElementById('app');
  
  if (!localStorage.getItem('token')) {
    showToast('Please login to checkout');
    setTimeout(() => location.hash = '#login', 1000);
    return;
  }
  
  if (cart.items.length === 0) {
    location.hash = '#cart';
    return;
  }

  let step = 1;
  const form = {
    fullName: localStorage.getItem('userName') || '',
    phone: '+226',
    address: '',
    note: '',
    payment: 'whatsapp'
  };

  const renderStep = () => {
    if (step === 1) {
      app.innerHTML = `
        <div class="max-w-2xl mx-auto bg-white rounded-xl shadow p-6">
          <h2 class="text-xl font-bold mb-4">📍 Delivery Details</h2>
          <div class="space-y-4">
            <input id="name" value="${form.fullName}" placeholder="Full Name *" class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" required>
            <input id="phone" value="${form.phone}" placeholder="Phone (+226...) *" class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" required>
            <textarea id="address" placeholder="Address & Landmark *" class="w-full p-3 border rounded-lg h-24 focus:ring-2 focus:ring-primary-500 outline-none" required>${form.address}</textarea>
            <textarea id="note" placeholder="Delivery notes (optional)" class="w-full p-3 border rounded-lg h-20 focus:ring-2 focus:ring-primary-500 outline-none">${form.note}</textarea>
          </div>
          <button id="next" class="mt-6 w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium">Continue to Payment →</button>
        </div>
      `;
      
      document.getElementById('next').onclick = () => {
        form.fullName = document.getElementById('name').value.trim();
        form.phone = document.getElementById('phone').value.trim();
        form.address = document.getElementById('address').value.trim();
        form.note = document.getElementById('note').value.trim();
        
        if (!form.fullName || form.phone.length < 10 || !form.address) {
          return showToast('Please fill all required fields', 'error');
        }
        step = 2;
        renderStep();
      };
      
    } else if (step === 2) {
      app.innerHTML = `
        <div class="max-w-2xl mx-auto bg-white rounded-xl shadow p-6">
          <h2 class="text-xl font-bold mb-4">💳 Payment Method</h2>
          <div class="space-y-3 mb-6">
            ${['whatsapp','cod','mobile'].map(m => `
              <label class="flex items-start p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition ${form.payment===m ? 'border-primary-500 bg-primary-50' : ''}">
                <input type="radio" name="pay" value="${m}" ${form.payment===m ? 'checked' : ''} class="mt-1 mr-3">
                <div>
                  <p class="font-medium capitalize">${m === 'whatsapp' ? '💬 WhatsApp Confirmation' : m === 'cod' ? '🤝 Cash on Delivery' : '📱 Mobile Money (Orange/Moov)'}</p>
                  <p class="text-sm text-gray-500 mt-1">
                    ${m === 'whatsapp' ? 'We confirm order details via WhatsApp, then arrange payment' : 
                      m === 'cod' ? 'Pay when your order arrives in Burkina Faso' : 
                      'We send payment details via WhatsApp after order confirmation'}
                  </p>
                </div>
              </label>
            `).join('')}
          </div>
          <div class="flex gap-3">
            <button id="back" class="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition">← Back</button>
            <button id="submit" class="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium">Place Order</button>
          </div>
        </div>
      `;
      
      document.querySelectorAll('input[name="pay"]').forEach(r => {
        r.onchange = e => form.payment = e.target.value;
      });
      document.getElementById('back').onclick = () => { step = 1; renderStep(); };
      document.getElementById('submit').onclick = submitOrder;
    }
  };

  const submitOrder = async () => {
    try {
      const res = await api.createOrder({
        customerName: form.fullName,
        customerPhone: form.phone,
        deliveryAddress: form.address,
        deliveryNote: form.note,
        paymentMethod: form.payment,
        items: cart.items.map(i => ({ product: i._id, quantity: i.quantity, price: i.price })),
        totalAmount: cart.getTotal()
      });
      
      cart.clear();
      
      // Success view
      app.innerHTML = `
        <div class="max-w-2xl mx-auto bg-white rounded-xl shadow p-6 text-center">
          <div class="text-5xl mb-4">✅</div>
          <h2 class="text-2xl font-bold mb-2">Order Placed Successfully!</h2>
          <p class="text-gray-500 mb-2">Order ID: <span class="font-mono">${res.orderId}</span></p>
          <p class="text-gray-500 mb-6">We will contact you via WhatsApp within 1 hour to confirm payment & delivery.</p>
          
          <a id="wa-confirm" href="#" target="_blank" class="inline-block px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center gap-2 mx-auto">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Confirm on WhatsApp
          </a>
          <a href="#home" class="block mt-4 text-primary-600 hover:underline">Return Home</a>
        </div>
      `;
      
      // WhatsApp redirect
      const adminPhone = '22670000000'; // Replace with your number
      const itemLines = cart.items.map(i => `• ${i.name} x${i.quantity} = ${(i.price * i.quantity).toLocaleString()} XOF`).join('\n');
      const msg = encodeURIComponent(
        `🛒 *NEW ORDER*\n\n👤 ${form.fullName}\n📱 ${form.phone}\n📍 ${form.address}\n💰 *Total: ${cart.getTotal().toLocaleString()} XOF*\n💳 *Payment: ${form.payment.toUpperCase()}*\n\n📦 *Items:*\n${itemLines}\n\n📝 Note: ${form.note || 'None'}`
      );
      document.getElementById('wa-confirm').href = `https://wa.me/${adminPhone}?text=${msg}`;
      
    } catch (err) {
      showToast(err.message || 'Checkout failed', 'error');
    }
  };

  renderStep();
}