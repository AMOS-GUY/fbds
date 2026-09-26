const express = require('express');
const Product = require('../models/Product');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const products = await Product.find({ status: 'available' }).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ msg: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/request', verifyToken, async (req, res) => {
  try {
    const { name, description, category } = req.body;
    let product = await Product.findOne({ name });
    if (product) {
      if (!product.requestedBy.includes(req.user.id)) {
        product.requestedBy.push(req.user.id);
        await product.save();
      }
      return res.json({ msg: 'Request added to existing product.' });
    }
    product = new Product({ name, description, category, status: 'requested', requestedBy: [req.user.id] });
    await product.save();
    res.status(201).json({ msg: 'Product request submitted successfully.' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;