const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/productController');
const { protect, requireAdmin } = require('../middleware/auth');

// Categories
router.get('/categories', getCategories);
router.post('/categories', protect, requireAdmin, createCategory);
router.put('/categories/:id', protect, requireAdmin, updateCategory);
router.delete('/categories/:id', protect, requireAdmin, deleteCategory);

// Products
router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.post('/calculate-price', calculateCustomPrice);

// Admin Product Management
router.post('/', protect, requireAdmin, createProduct);
router.put('/:id', protect, requireAdmin, updateProduct);
router.delete('/:id', protect, requireAdmin, deleteProduct);
router.patch('/:id/toggle-used', protect, requireAdmin, toggleProductUsed);

module.exports = router;
