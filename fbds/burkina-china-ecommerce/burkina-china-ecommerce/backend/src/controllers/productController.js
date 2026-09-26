const Product = require('../models/Product');
const { io } = require('../app'); // Socket.io instance for real-time

// Upload new product (Admin only)
exports.createProduct = async (req, res) => {
  try {
    const { 
      name, description, price, category, 
      images, stock, supplier, originCountry 
    } = req.body;
    
    const product = await Product.create({
      name,
      description,
      price: parseFloat(price),
      category,
      images: images || [],
      stock: parseInt(stock),
      supplier,
      originCountry: originCountry || 'China',
      createdBy: req.user._id
    });
    
    // Emit real-time update to connected clients
    io.emit('product:created', product);
    
    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating product', error: error.message });
  }
};

// Get all products with filters
exports.getProducts = async (req, res) => {
  try {
    const { 
      category, search, minPrice, maxPrice, 
      inStock, page = 1, limit = 20 
    } = req.query;
    
    let query = {};
    
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    if (inStock === 'true') query.stock = { $gt: 0 };
    
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v');
    
    const count = await Product.countDocuments(query);
    
    res.json({
      products,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalProducts: count
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
};