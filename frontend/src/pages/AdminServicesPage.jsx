import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Filter, 
  Sparkles, 
  Sliders, 
  Tag, 
  FolderPlus, 
  Check, 
  X, 
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';

export default function AdminServicesPage() {
  const [activeTab, setActiveTab] = useState('services'); // 'services' | 'categories'
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [toastMessage, setToastMessage] = useState(null);

  // Modals state
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);

  // Product Form state
  const [productForm, setProductForm] = useState({
    name: '',
    category: '',
    basePrice: '',
    unit: 'sq.ft',
    minQuantity: 1,
    description: '',
    features: '',
    badge: '',
    leadTimeDays: 1,
    image: '/images/products/flex-printing.svg',
    isUsed: true
  });

  // Category Form state
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    icon: '📁',
    description: '',
    isActive: true
  });

  const token = localStorage.getItem('sri_ramu_token');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Load products (all, including disabled for Admin)
  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/products?includeDisabled=true');
      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Load categories
  const fetchCategories = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/products/categories?includeInactive=true');
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories || []);
        if (data.categories.length > 0 && !productForm.category) {
          setProductForm(prev => ({ ...prev, category: data.categories[0].name }));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    Promise.all([fetchProducts(), fetchCategories()]).finally(() => setLoading(false));
  }, []);

  // Toggle "Used / Not Used" status of a product
  const handleToggleUsed = async (product) => {
    try {
      const res = await fetch(`http://localhost:5000/api/products/${product._id}/toggle-used`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setProducts(prev => prev.map(p => p._id === product._id ? data.product : p));
        showToast(data.message);
      }
    } catch (e) {
      console.error(e);
      showToast('Failed to update service status');
    }
  };

  // Delete product
  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      const res = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setProducts(prev => prev.filter(p => p._id !== id));
        showToast(`Product "${name}" deleted`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Open Product Modal
  const openProductModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        category: product.category,
        basePrice: product.basePrice,
        unit: product.unit || 'sq.ft',
        minQuantity: product.minQuantity || 1,
        description: product.description || '',
        features: (product.features || []).join('\n'),
        badge: product.badge || '',
        leadTimeDays: product.leadTimeDays || 1,
        image: product.image || '/images/products/flex-printing.svg',
        isUsed: product.isUsed !== false
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        name: '',
        category: categories[0]?.name || 'Flex & Sign Boards',
        basePrice: '',
        unit: 'sq.ft',
        minQuantity: 1,
        description: '',
        features: '',
        badge: 'New',
        leadTimeDays: 1,
        image: '/images/products/flex-printing.svg',
        isUsed: true
      });
    }
    setProductModalOpen(true);
  };

  // Submit Product Form
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const payload = {
      ...productForm,
      basePrice: Number(productForm.basePrice),
      minQuantity: Number(productForm.minQuantity) || 1,
      leadTimeDays: Number(productForm.leadTimeDays) || 1,
      features: productForm.features.split('\n').map(f => f.trim()).filter(Boolean)
    };

    try {
      if (editingProduct) {
        const res = await fetch(`http://localhost:5000/api/products/${editingProduct._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          setProducts(prev => prev.map(p => p._id === editingProduct._id ? data.product : p));
          showToast(`Service "${data.product.name}" updated successfully`);
        }
      } else {
        const res = await fetch('http://localhost:5000/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          setProducts(prev => [data.product, ...prev]);
          showToast(`New service "${data.product.name}" added`);
        }
      }
      setProductModalOpen(false);
    } catch (e) {
      console.error(e);
      showToast('Error saving product');
    }
  };

  // Category Modal
  const openCategoryModal = (cat = null) => {
    if (cat) {
      setEditingCategory(cat);
      setCategoryForm({
        name: cat.name,
        icon: cat.icon || '📁',
        description: cat.description || '',
        isActive: cat.isActive !== false
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({
        name: '',
        icon: '📁',
        description: '',
        isActive: true
      });
    }
    setCategoryModalOpen(true);
  };

  // Save Category Form
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        const res = await fetch(`http://localhost:5000/api/products/categories/${editingCategory._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(categoryForm)
        });
        const data = await res.json();
        if (data.success) {
          setCategories(prev => prev.map(c => c._id === editingCategory._id ? data.category : c));
          showToast(`Category "${data.category.name}" updated`);
        }
      } else {
        const res = await fetch('http://localhost:5000/api/products/categories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(categoryForm)
        });
        const data = await res.json();
        if (data.success) {
          setCategories(prev => [...prev, data.category]);
          showToast(`Category "${data.category.name}" created`);
        }
      }
      setCategoryModalOpen(false);
    } catch (e) {
      console.error(e);
      showToast('Error saving category');
    }
  };

  // Delete Category
  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"? Products in this category will remain.`)) return;
    try {
      const res = await fetch(`http://localhost:5000/api/products/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setCategories(prev => prev.filter(c => c._id !== id));
        showToast(`Category "${name}" deleted`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Filtered Products
  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesSearch = !search.trim() || 
      p.name?.toLowerCase().includes(search.toLowerCase()) || 
      p.description?.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const usedCount = products.filter(p => p.isUsed !== false).length;
  const notUsedCount = products.filter(p => p.isUsed === false).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-sm px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-sky-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-sky-600 uppercase tracking-wider">
            <Sliders className="w-3.5 h-3.5" />
            <span>Sri Ramu Digital Catalog Administration</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-1">Services &amp; Category Manager</h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure all 30 printing services, toggle customer visibility (Used / Not Used), and manage press categories.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => openCategoryModal()}
            className="px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition"
          >
            <FolderPlus className="w-4 h-4 text-slate-500" />
            + New Category
          </button>
          <button
            onClick={() => openProductModal()}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-sky-600 hover:bg-sky-700 text-white shadow-sm flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            + Add New Service
          </button>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs font-bold text-slate-500">Total Print Services</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{products.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">30 Core Factory Offerings</div>
        </div>
        <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200">
          <div className="text-xs font-bold text-emerald-800">Used (Customer Visible)</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{usedCount}</div>
          <div className="text-[11px] text-emerald-700 mt-0.5">Active in customer store</div>
        </div>
        <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200">
          <div className="text-xs font-bold text-amber-800">Not Used (Disabled)</div>
          <div className="text-2xl font-black text-amber-600 mt-1">{notUsedCount}</div>
          <div className="text-[11px] text-amber-700 mt-0.5">Hidden from customers</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs font-bold text-slate-500">Total Categories</div>
          <div className="text-2xl font-black text-sky-600 mt-1">{categories.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Pressroom Sections</div>
        </div>
      </div>

      {/* Tabs Switcher: Services vs Categories */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('services')}
          className={`pb-3 font-bold text-sm border-b-2 flex items-center gap-2 transition ${
            activeTab === 'services'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          Printing Services ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`pb-3 font-bold text-sm border-b-2 flex items-center gap-2 transition ${
            activeTab === 'categories'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Tag className="w-4 h-4" />
          Categories Management ({categories.length})
        </button>
      </div>

      {/* TAB 1: SERVICES LIST */}
      {activeTab === 'services' && (
        <div className="space-y-4">
          {/* Filters & Search */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by service name or description..."
                className="w-full text-xs font-medium bg-transparent focus:outline-none"
              />
              {search && (
                <button onClick={() => setSearch('')} className="text-xs text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
              >
                <option value="ALL">All Categories ({categories.length})</option>
                {categories.map((c) => (
                  <option key={c._id} value={c.name}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Services Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Service</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Base Rate</th>
                    <th className="py-3 px-4">Status (Used / Disabled)</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-slate-400">Loading printing services...</td>
                    </tr>
                  ) : filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-slate-400">No services match your filters.</td>
                    </tr>
                  ) : (
                    filteredProducts.map((prod) => {
                      const isUsed = prod.isUsed !== false;
                      return (
                        <tr 
                          key={prod._id} 
                          className={`hover:bg-slate-50/80 transition ${!isUsed ? 'bg-slate-50/50 opacity-75' : ''}`}
                        >
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-lg bg-slate-900 border border-slate-800 p-1 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                <img
                                  src={prod.image}
                                  alt={prod.name}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                                  <span>{prod.name}</span>
                                  {prod.badge && (
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-sky-100 text-sky-800">
                                      {prod.badge}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-500 line-clamp-1 max-w-sm">
                                  {prod.description}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px] border border-slate-200">
                              {prod.category}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="font-bold text-slate-900">
                              ₹{prod.basePrice} <span className="text-slate-400 font-normal">/ {prod.unit}</span>
                            </div>
                            <div className="text-[10px] text-slate-400">Min: {prod.minQuantity} {prod.unit}</div>
                          </td>

                          {/* TOGGLE USED / NOT USED OPTION */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleToggleUsed(prod)}
                                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                  isUsed ? 'bg-emerald-500' : 'bg-slate-300'
                                }`}
                                title={isUsed ? 'Click to disable for customers' : 'Click to enable for customers'}
                              >
                                <span
                                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                    isUsed ? 'translate-x-5' : 'translate-x-0'
                                  }`}
                                />
                              </button>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                  isUsed
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                                }`}
                              >
                                {isUsed ? 'USED (Customer Visible)' : 'NOT USED (Disabled)'}
                              </span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openProductModal(prod)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition"
                                title="Edit Product"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(prod._id, prod.name)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                                title="Delete Product"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CATEGORIES LIST */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => {
              const count = products.filter(p => p.category === cat.name).length;
              return (
                <div
                  key={cat._id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between hover:border-sky-300 hover:shadow-sm transition"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-sky-50 text-xl flex items-center justify-center border border-sky-100">
                        {cat.icon || '📁'}
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                        {count} Service{count !== 1 ? 's' : ''}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-slate-900 mt-3">{cat.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {cat.description || 'General commercial printing category.'}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-400">
                      Slug: <code className="text-slate-600">{cat.slug || cat.name.toLowerCase()}</code>
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openCategoryModal(cat)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition"
                        title="Edit Category"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat._id, cat.name)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Delete Category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PRODUCT MODAL */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-lg font-extrabold text-slate-900">
                {editingProduct ? 'Edit Printing Service' : 'Add New Printing Service'}
              </h2>
              <button onClick={() => setProductModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Service Name (with Emoji)</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="e.g. 🖨️ Flex Printing or 🪪 ID Cards"
                  className="w-full text-sm border border-slate-300 rounded-lg p-2.5 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full text-sm border border-slate-300 rounded-lg p-2.5 font-medium bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c.name}>
                        {c.icon} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pricing Unit</label>
                  <select
                    value={productForm.unit}
                    onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                    className="w-full text-sm border border-slate-300 rounded-lg p-2.5 font-medium bg-white"
                  >
                    <option value="sq.ft">sq.ft (Square Foot)</option>
                    <option value="page">page (Per Page)</option>
                    <option value="sheet">sheet (Per Sheet)</option>
                    <option value="card">card (Per Card)</option>
                    <option value="box">box (100 pcs)</option>
                    <option value="book">book (Per Book)</option>
                    <option value="copy">copy (Per Copy)</option>
                    <option value="piece">piece (Per Piece)</option>
                    <option value="pad">pad (Pad)</option>
                    <option value="pack">pack (Pack)</option>
                    <option value="design">design (Per Artwork)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Base Price (₹)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={productForm.basePrice}
                    onChange={(e) => setProductForm({ ...productForm, basePrice: e.target.value })}
                    className="w-full text-sm border border-slate-300 rounded-lg p-2.5 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Min Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={productForm.minQuantity}
                    onChange={(e) => setProductForm({ ...productForm, minQuantity: e.target.value })}
                    className="w-full text-sm border border-slate-300 rounded-lg p-2.5 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Badge Tag</label>
                  <input
                    type="text"
                    value={productForm.badge}
                    onChange={(e) => setProductForm({ ...productForm, badge: e.target.value })}
                    placeholder="Bestseller, Top Pick"
                    className="w-full text-sm border border-slate-300 rounded-lg p-2.5 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Prebuilt Image Path</label>
                <input
                  type="text"
                  value={productForm.image}
                  onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                  placeholder="/images/products/flex-printing.svg"
                  className="w-full text-sm border border-slate-300 rounded-lg p-2.5 font-medium font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows="2"
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Detailed technical specifications of this printing service..."
                  className="w-full text-sm border border-slate-300 rounded-lg p-2.5 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Key Highlights (1 per line)</label>
                <textarea
                  rows="3"
                  value={productForm.features}
                  onChange={(e) => setProductForm({ ...productForm, features: e.target.value })}
                  placeholder="1440 DPI solvent inkjet print&#10;UV & Rain resistant&#10;Aluminium eyelets"
                  className="w-full text-sm border border-slate-300 rounded-lg p-2.5 font-medium"
                />
              </div>

              {/* Status Toggle in Modal */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <div className="text-xs font-bold text-slate-900">Service Status (Used / Active)</div>
                  <div className="text-[11px] text-slate-500">Enable to show on customer website &amp; calculator</div>
                </div>
                <button
                  type="button"
                  onClick={() => setProductForm({ ...productForm, isUsed: !productForm.isUsed })}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    productForm.isUsed ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      productForm.isUsed ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white rounded-lg shadow-sm transition"
                >
                  {editingProduct ? 'Save Changes' : 'Create Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CATEGORY MODAL */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-lg font-extrabold text-slate-900">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h2>
              <button onClick={() => setCategoryModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4 mt-4">
              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Icon</label>
                  <input
                    type="text"
                    value={categoryForm.icon}
                    onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                    className="w-full text-center text-xl border border-slate-300 rounded-lg p-2 font-medium"
                  />
                </div>
                <div className="col-span-3">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category Name</label>
                  <input
                    type="text"
                    required
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    placeholder="e.g. Flex & Sign Boards"
                    className="w-full text-sm border border-slate-300 rounded-lg p-2.5 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows="2"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  placeholder="Short description of products inside this category..."
                  className="w-full text-sm border border-slate-300 rounded-lg p-2.5 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCategoryModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white rounded-lg shadow-sm transition"
                >
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
