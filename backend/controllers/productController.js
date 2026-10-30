const mongoose = require('mongoose');

const Product = require('../models/Product');
const Category = require('../models/Category');

// Validate MongoDB ID
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// GET /api/products/categories
const getCategories = async (req, res) => {
  try {
    const filter = {};

    if (req.query.includeInactive !== 'true') {
      filter.isActive = { $ne: false };
    }

    const categories = await Category.find(filter).sort({ name: 1 });

    return res.json({
      success: true,
      count: categories.length,
      categories
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// POST /api/products/categories
const createCategory = async (req, res) => {
  try {
    const { name, icon, description, isActive = true } = req.body;

    if (!name) {
      return res.status(400).json({
        message: 'Category name is required'
      });
    }

    const slug = name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const category = await Category.create({
      name,
      slug,
      icon: icon || '📁',
      description: description || '',
      isActive: Boolean(isActive)
    });

    return res.status(201).json({
      success: true,
      category
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// PUT /api/products/categories/:id
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }

    const updated = await Category.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Category not found' });
    }

    return res.json({
      success: true,
      category: updated
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// DELETE /api/products/categories/:id
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }

    const deleted = await Category.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Category not found' });
    }

    return res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// GET /api/products
const getAllProducts = async (req, res) => {
  try {
    const { category, search, includeDisabled } = req.query;

    const filter = {};

    if (includeDisabled !== 'true') {
      filter.isUsed = { $ne: false };
    }

    if (category && category !== 'ALL') {
      filter.category = category;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(
        search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        'i'
      );

      filter.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { category: searchRegex }
      ];
    }

    const products = await Product.find(filter).sort({
      createdAt: -1
    });

    return res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.json({
      success: true,
      product
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// POST /api/products
const createProduct = async (req, res) => {
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
      return res.status(400).json({
        message: 'Name, Category, and Base Price are required'
      });
    }

    const price = Number(basePrice);

    if (!Number.isFinite(price) || price < 0) {
      return res.status(400).json({
        message: 'Base price must be a valid non-negative number'
      });
    }

    const product = await Product.create({
      name,
      category,
      basePrice: price,
      unit,
      minQuantity: Number(minQuantity) || 1,
      description,
      features: Array.isArray(features) ? features : [],
      badge,
      leadTimeDays: Number(leadTimeDays) || 1,
      image,
      isUsed: Boolean(isUsed),
      isActive: Boolean(isUsed)
    });

    return res.status(201).json({
      success: true,
      product
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const updateData = { ...req.body };

    if (updateData.basePrice !== undefined) {
      updateData.basePrice = Number(updateData.basePrice);

      if (!Number.isFinite(updateData.basePrice) || updateData.basePrice < 0) {
        return res.status(400).json({
          message: 'Invalid product price'
        });
      }
    }

    const product = await Product.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.json({
      success: true,
      product
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// PATCH /api/products/:id/toggle-used
const toggleProductUsed = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const existing = await Product.findById(id);

    if (!existing) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const newStatus = existing.isUsed === false;

    const updated = await Product.findByIdAndUpdate(
      id,
      {
        $set: {
          isUsed: newStatus,
          isActive: newStatus
        }
      },
      { new: true }
    );

    return res.json({
      success: true,
      message: `Product "${existing.name}" is now ${
        newStatus
          ? 'USED (Visible to Customers)'
          : 'NOT USED (Disabled for Customers)'
      }`,
      product: updated
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const deleted = await Product.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// POST /api/products/calculate-price
const calculateCustomPrice = async (req, res) => {
  try {
    const {
      productId,
      width,
      height,
      quantity = 1,
      options = {}
    } = req.body;

    if (!isValidId(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let calculatedSqFt = 0;
    let unitPrice = Number(product.basePrice ?? product.price ?? 0);
    let total = 0;

    const qty = Number(quantity);

    if (!Number.isFinite(qty) || qty <= 0) {
      return res.status(400).json({
        message: 'Quantity must be greater than zero'
      });
    }

    if (product.unit === 'sq.ft') {
      const w = Number(width) || 1;
      const h = Number(height) || 1;

      calculatedSqFt = Math.max(1, w * h);

      let optionMultiplier = 1;

      if (
        options.gsm === 'Heavy 380 GSM' ||
        options.gsm === 'Heavy 440 GSM'
      ) {
        optionMultiplier += 0.2;
      }

      if (
        options.lamination === 'Gloss' ||
        options.lamination === 'Matte'
      ) {
        optionMultiplier += 0.25;
      }

      if (
        options.finish === 'Framed Iron Pipe' ||
        options.finish === 'LED Backlit Box'
      ) {
        unitPrice += 30;
      }

      const pricePerPiece = Math.round(
        calculatedSqFt * unitPrice * optionMultiplier
      );

      total = pricePerPiece * qty;
    } else {
      total = unitPrice * qty;
    }

    return res.json({
      success: true,
      productId: product._id,
      name: product.name,
      width: width || null,
      height: height || null,
      sqft: calculatedSqFt,
      quantity: qty,
      unitPrice,
      totalAmount: total
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
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
