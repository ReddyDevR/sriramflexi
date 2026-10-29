const store = require('../config/store');

// GET /api/products/categories
const getCategories = (req, res) => {
  try {
    const { includeInactive } = req.query;
    let categories = store.getCollection('categories');
    if (includeInactive !== 'true') {
      categories = categories.filter(c => c.isActive !== false);
    }
    res.json({ success: true, count: categories.length, categories });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/products/categories (Admin)
const createCategory = (req, res) => {
  try {
    const { name, icon, description, isActive = true } = req.body;
    if (!name) return res.status(400).json({ message: 'Category name is required' });

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const newCat = store.create('categories', {
      name,
      slug,
      icon: icon || '📁',
      description: description || '',
      isActive: Boolean(isActive)
    });

    res.status(201).json({ success: true, category: newCat });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/products/categories/:id (Admin)
const updateCategory = (req, res) => {
  try {
    const { id } = req.params;
    const existing = store.findById('categories', id);
    if (!existing) return res.status(404).json({ message: 'Category not found' });

    const updated = store.findByIdAndUpdate('categories', id, req.body);
    res.json({ success: true, category: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/products/categories/:id (Admin)
const deleteCategory = (req, res) => {
  try {
    const { id } = req.params;
    const existing = store.findById('categories', id);
    if (!existing) return res.status(404).json({ message: 'Category not found' });

    store.deleteById('categories', id);
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/products
// Customer view: only isUsed !== false
// Admin view: includeDisabled=true returns all
const getAllProducts = (req, res) => {
  try {
    const { category, search, includeDisabled } = req.query;
    let products = store.getCollection('products');

    // Customer filter: only active/used products
    if (includeDisabled !== 'true') {
      products = products.filter(p => p.isUsed !== false);
    }

    // Category filter
    if (category && category !== 'ALL') {
      products = products.filter(p => p.category === category);
    }

    // Search query filter
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      products = products.filter(p =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q))
      );
    }

    res.json({ success: true, count: products.length, products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/products/:id
const getProductById = (req, res) => {
  try {
    const product = store.findById('products', req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/products (Admin)
const createProduct = (req, res) => {
  try {
    const {
      name,
      category,
      basePrice,
      unit = 'sq.ft',
      minQuantity = 1,
      description = '',
      features = [],
      badge = 'New',
      leadTimeDays = 1,
      image = '/images/products/flex-printing.svg',
      isUsed = true
    } = req.body;

    if (!name || !category || basePrice === undefined) {
      return res.status(400).json({ message: 'Name, Category, and Base Price are required' });
    }

    const newProduct = store.create('products', {
      name,
      category,
      basePrice: Number(basePrice),
      unit,
      minQuantity: Number(minQuantity) || 1,
      description,
      features: Array.isArray(features) ? features : [],
      badge,
      leadTimeDays: Number(leadTimeDays) || 1,
      image,
      isUsed: Boolean(isUsed)
    });

    res.status(201).json({ success: true, product: newProduct });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/products/:id (Admin)
const updateProduct = (req, res) => {
  try {
    const { id } = req.params;
    const existing = store.findById('products', id);
    if (!existing) return res.status(404).json({ message: 'Product not found' });

    const updated = store.findByIdAndUpdate('products', id, req.body);
    res.json({ success: true, product: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/products/:id/toggle-used (Admin)
const toggleProductUsed = (req, res) => {
  try {
    const { id } = req.params;
    const existing = store.findById('products', id);
    if (!existing) return res.status(404).json({ message: 'Product not found' });

    const newStatus = existing.isUsed === false ? true : false;
    const updated = store.findByIdAndUpdate('products', id, { isUsed: newStatus });

    res.json({
      success: true,
      message: `Product "${existing.name}" is now ${newStatus ? 'USED (Visible to Customers)' : 'NOT USED (Disabled for Customers)'}`,
      product: updated
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/products/:id (Admin)
const deleteProduct = (req, res) => {
  try {
    const { id } = req.params;
    const existing = store.findById('products', id);
    if (!existing) return res.status(404).json({ message: 'Product not found' });

    store.deleteById('products', id);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/products/calculate-price
const calculateCustomPrice = (req, res) => {
  try {
    const { productId, width, height, quantity = 1, options = {} } = req.body;
    const product = store.findById('products', productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    let calculatedSqFt = 0;
    let unitPrice = product.basePrice;
    let total = 0;

    if (product.unit === 'sq.ft') {
      const w = Number(width) || 1;
      const h = Number(height) || 1;
      calculatedSqFt = Math.max(1, w * h);

      // Media option surcharge
      let optionMultiplier = 1;
      if (options.gsm === 'Heavy 380 GSM' || options.gsm === 'Heavy 440 GSM') optionMultiplier += 0.2;
      if (options.lamination === 'Gloss' || options.lamination === 'Matte') optionMultiplier += 0.25;
      if (options.finish === 'Framed Iron Pipe' || options.finish === 'LED Backlit Box') unitPrice += 30;

      const pricePerPiece = Math.round(calculatedSqFt * unitPrice * optionMultiplier);
      total = pricePerPiece * Number(quantity);
    } else {
      total = unitPrice * Number(quantity);
    }

    res.json({
      success: true,
      productId: product._id,
      name: product.name,
      width: width || null,
      height: height || null,
      sqft: calculatedSqFt,
      quantity: Number(quantity),
      unitPrice,
      totalAmount: total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  toggleProductUsed,
  deleteProduct,
  calculateCustomPrice
};
