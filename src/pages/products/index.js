// src/pages/products/index.js
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { toast } from "react-toastify";
import Addcard from "../../components/Buttons/addcard";

/**
 * Products page - fetches from /api/products and renders cards.
 * Supports: ?category=Name  and ?featured=true
 *
 * Paste this file into src/pages/products/index.js
 */

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const ctx = useCart();
  const location = useLocation();

  // read query params (category, featured) from the URL
  const qs = React.useMemo(() => new URLSearchParams(location.search), [location.search]);
  const categoryParam = qs.get("category") || "";
  const featuredParam = qs.get("featured") || "";

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        // build request url with query params if present
        const params = new URLSearchParams();
        if (featuredParam) params.set("featured", featuredParam);
        if (categoryParam) params.set("category", categoryParam);

        const url = params.toString() ? `/api/products?${params.toString()}` : `/api/products`;

        // If you are not using proxy you may need to use 'http://localhost:5000/api/products...'
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        const data = await res.json();
        if (!cancelled) setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load products:", err);
        if (!cancelled) setError('Failed to load products from server.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [categoryParam, featuredParam, location.search]);

  const addToCartFn = (product) => {
    if (ctx && typeof ctx.addToCart === 'function') {
      ctx.addToCart(product);
    } else {
      // fallback behavior for testing
      console.warn("Cart context not available, demo add:", product);
    }
    toast.success(`${product.title || product.name || 'Item'} added to cart`, { autoClose: 1400 });
  };

  if (loading) return <div className="container py-5">Loading products…</div>;
  if (error)   return <div className="container py-5 text-danger">{error}</div>;

  // show heading: either "All Products" or "Products — <Category>"
  const heading = categoryParam ? `Products — ${decodeURIComponent(categoryParam)}` : "All Products";

  if (!products.length) {
    return (
      <div className="container py-5">
        <h2>{heading}</h2>
        <p>No products found.</p>
      </div>
    );
  }

  return (
    <div className="products-page container py-4">
      <h2 className="mb-4">{heading}</h2>

      <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 24 }}>
        {products.map((product) => {
          // support multiple possible backend shape
          const id = product._id || product.id || product._key;
          const title = product.title || product.name || "Untitled";
          const image = product.image || product.imageUrl || product.img || "";
          const price = (product.price === 0 || product.price) ? product.price : product.amount;
          const category = product.category || product.cat || product.categoryName || "";
          const description = product.description || product.desc || "";

          // fallback placeholder
          const imageSrc = image && typeof image === 'string' ? image : '/placeholder-product.png';

          return (
            <article key={id || title} className="product-card" style={{
              background: '#fff', borderRadius: 12, padding: 18, boxShadow: '0 6px 18px rgba(0,0,0,0.06)'
            }}>
              <Link to={`/products/${id}`} className="product-image-link" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
                <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: 8 }}>
                  <img src={imageSrc} alt={title} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'cover' }} />
                </div>
              </Link>

              <div style={{ padding: '12px 4px' }}>
                <h3 style={{ fontSize: 18, margin: '12px 0 6px' }}>{title}</h3>
                {category && <div style={{ color: '#7a7a7a', fontSize: 13 }}>{category}</div>}
                {description && <p style={{ color: '#555', fontSize: 14, marginTop: 10, minHeight: 44 }}>{description.slice(0, 160)}{description.length > 160 ? '…' : ''}</p>}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
                  <div style={{ fontWeight: 700 }}>{typeof price !== 'undefined' ? `₹${price}` : ''}</div>
                  <button onClick={() => addToCartFn(product)}>
                    <Addcard/>
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};

export default Products;
