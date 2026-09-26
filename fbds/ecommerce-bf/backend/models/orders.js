const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
  }],
  total: { type: Number, required: true },
  status: { type: String, enum: ['pending_payment', 'paid', 'shipped', 'delivered', 'cancelled'], default: 'pending_payment' },
  paymentMethod: { type: String, enum: ['cod', 'whatsapp', 'wechat', 'bank_transfer'], required: true },
  paymentStatus: { type: String, enum: ['pending', 'verified'], default: 'pending' },
  shippingAddress: { type: String, required: true },
  phone: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);