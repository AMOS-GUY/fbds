import { mockProducts, mockUser } from './mockData.js';

// Simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  async login({ email, password }) {
    await delay(300);
    if (email === 'admin@faso.com' && password === 'admin123') {
      return { token: 'mock_admin_token', user: { ...mockUser, role: 'admin' } };
    }
    if (email && password) {
      return { token: 'mock_user_token', user: mockUser };
    }
    throw new Error('Invalid credentials');
  },

  async register(userData) {
    await delay(400);
    // In real app: save to DB, send verification email
    return { message: 'Registration successful! Check your email to verify.' };
  },

  async getProducts(filters = {}) {
    await delay(200);
    let results = [...mockProducts];
    if (filters.category) results = results.filter(p => p.category === filters.category);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      results = results.filter(p => 
        p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }
    return { products: results };
  },

  async getProduct(id) {
    await delay(150);
    const product = mockProducts.find(p => p._id === id);
    if (!product) throw new Error('Product not found');
    return product;
  },

  async createOrder(orderData) {
    await delay(500);
    console.log('📦 Mock order created:', orderData);
    return { 
      message: 'Order received! We will contact you via WhatsApp.', 
      orderId: 'ORD-' + Date.now().toString().slice(-6) 
    };
  },

  async uploadProduct(formData) {
    await delay(600);
    console.log('📤 Mock product upload:', Object.fromEntries(formData));
    return { message: 'Product added successfully!' };
  },

  async uploadCsv(formData) {
    await delay(800);
    console.log('📥 Mock CSV import');
    return { message: 'CSV imported successfully!', count: 5 };
  }
};