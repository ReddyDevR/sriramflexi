import React, { useState, useEffect } from 'react';
import { Layers, ArrowRight, Check, Clock, Sparkles, Search, X } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

export default function ProductsPage({ onOrderProduct }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch categories
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/products/categories`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCategories(data.categories || []);
        }
      })
      .catch(err => console.error(err));
  }, []);

  // Fetch products (Customer view: only isUsed !== false)
  useEffect(() => {
    let url = `${API_BASE_URL}/api/products?category=${category}`;
    if (search.trim()) url += `&search=${encodeURIComponent(search.trim())}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.success) setProducts(data.products || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [category, search]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-sky-600 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sri Ramu Digital Printing Press Catalog</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-1">Printing Products &amp; Solutions</h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse our complete 30 factory press services, configure custom artwork dimensions, and order online with live status alerts.
          </p>
        </div>

        {/* Live Search */}
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-xs w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search all 30 print services..."
            className="w-full text-xs font-medium focus:outline-none bg-transparent"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 text-xs font-bold no-scrollbar">
        <button
          onClick={() => setCategory('ALL')}
          className={`px-3.5 py-1.5 rounded-full whitespace-nowrap transition ${
            category === 'ALL'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All Products ({products.length})
        </button>

        {categories.map((cat) => (
          <button
            key={cat._id}
            onClick={() => setCategory(cat.name)}
            className={`px-3.5 py-1.5 rounded-full whitespace-nowrap transition flex items-center gap-1.5 ${
              category === cat.name
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">Loading printing products...</div>
      ) : products.length === 0 ? (
        <div className="py-20 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 p-8">
          <p className="font-bold text-base text-slate-700">No print products found</p>
          <p className="text-xs text-slate-500 mt-1">Try clearing your search query or selecting a different category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-sky-300 hover:shadow-xl transition flex flex-col justify-between"
            >
              <div>
                {/* Prebuilt SVG image container */}
                <div className="h-52 bg-slate-950 p-2 relative flex items-center justify-center overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide bg-sky-500 text-slate-950 shadow-xs">
                    {product.badge || product.category}
                  </div>
                  <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-slate-900/90 text-amber-300 font-extrabold text-xs border border-amber-400/30">
                    ₹{product.basePrice} / {product.unit}
                  </div>
                </div>

                <div className="p-5">
                  <div className="text-[11px] font-bold text-sky-600 uppercase tracking-wider">
                    {product.category}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">
                    {product.name}
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {product.description}
                  </p>

                  {/* Features list */}
                  {product.features && product.features.length > 0 && (
                    <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3">
                      {product.features.slice(0, 3).map((f, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                          <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                          <span className="truncate">{f}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer with Lead Time & Order Button */}
              <div className="p-5 pt-0">
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <Clock className="w-3.5 h-3.5 text-sky-500" />
                    <span>Est. {product.leadTimeDays || 1} day(s)</span>
                  </div>

                  <button
                    onClick={() => onOrderProduct(product)}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                  >
                    <span>Configure &amp; Order</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
