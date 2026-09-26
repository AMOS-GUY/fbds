export const cart = {
  items: JSON.parse(localStorage.getItem('cart')) || [],
  
  save() {
    localStorage.setItem('cart', JSON.stringify(this.items));
    window.dispatchEvent(new Event('cart:updated'));
  },
  
  add(product) {
    const existing = this.items.find(i => i._id === product._id);
    if (existing) existing.quantity++;
    else this.items.push({ ...product, quantity: 1 });
    this.save();
  },
  
  remove(id) {
    this.items = this.items.filter(i => i._id !== id);
    this.save();
  },
  
  clear() {
    this.items = [];
    this.save();
  },
  
  getTotal() {
    return this.items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  }
};