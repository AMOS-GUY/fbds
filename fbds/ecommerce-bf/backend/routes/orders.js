const express = require('express');
const Order = require('../models/Order');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const { sendWhatsAppOrderNotification } = require('../utils/sendWhatsApp');
const router = express.Router();

router.post('/', verifyToken, async (req, res) => {
  try {
    const { items, total, paymentMethod, shippingAddress, phone } = req.body;
    const order = new Order({
      user: req.user.id,
      items,
      total,
      paymentMethod,
      shippingAddress,
      phone
    });
    await order.save();
    await sendWhatsAppOrderNotification(order);
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name email').populate('items.product', 'name price');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.put('/:id/status', verifyToken, isAdmin, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body.status, { new: true });
    res.json(order);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;