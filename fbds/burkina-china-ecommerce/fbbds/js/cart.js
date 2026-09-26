export const cart = {
  items: JSON.parse(localStorage.getItem('cart')) || [],

  save() {
    localStorage.setItem('cart', JSON.stringify(this.items));
    window.dispatchEvent(new CustomEvent('cart:updated', { detail: { count: this.getCount() } }));
  },

  add(product) {
    const existing = this.items.find(i => i._id === product._id);
    if (existing) {
      existing.quantity += 1;
    } else {
      this.items.push({ ...product, quantity: 1 });
    }
    this.save();
  },

  remove(id) {
    this.items = this.items.filter(i => i._id !== id);
    this.save();
  },

  updateQuantity(id, qty) {
    const item = this.items.find(i => i._id === id);
    if (item) {
      item.quantity = Math.max(1, qty);
      this.save();
    }
  },

  clear() {
    this.items = [];
    this.save();
  },

  getCount() {
    return this.items.reduce((sum, i) => sum + i.quantity, 0);
  },

  getTotal() {
    return this.items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  }
};

// Initialize cart count in navbar
window.addEventListener('DOMContentLoaded', () => {
  const countEl = document.getElementById('cart-count');
  if (countEl) {
    countEl.textContent = cart.getCount();
  }
});
window.addEventListener('cart:updated', (e) => {
  const countEl = document.getElementById('cart-count');
  if (countEl) countEl.textContent = e.detail.count;
});