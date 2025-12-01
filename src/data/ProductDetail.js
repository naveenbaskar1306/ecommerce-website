// src/pages/products/ProductDetail.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import Buynow from "../components/Buttons/productbuy" 
import Addcart from "../components/Buttons/productaddcart" 

import { API_BASE } from "../config/api";
import makeImageUrl from '../utils/makeImageUrl';


export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/products/${id}`);
        if (mounted) {
          const p = res.data;
          setProduct(p);
          const gallery = Array.isArray(p.images) && p.images.length ? p.images : p.image ? [p.image] : [];
          setActiveImage(gallery.length ? gallery[0] : null);
        }
      } catch (err) {
        console.error("Failed to fetch product", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (id) fetchProduct();
    return () => (mounted = false);
  }, [id]);

  if (loading) return <div className="product-loading">Loading product…</div>;
  if (!product) return <div className="product-empty">Product not found.</div>;

  // helper to ensure full URL for images
  const makeUrl = (src) =>
    src && (src.startsWith("http") ? src : `${API_BASE}${src}`);

  const gallery = Array.isArray(product.images) && product.images.length
    ? product.images
    : product.image
      ? [product.image]
      : [];

  const mainImg = makeUrl(activeImage || (gallery[0] || ""));

  const handleAddToCart = (qty = 1, after = null) => {
    try {
      addToCart(product, qty);
    } catch (err) {
      console.error("addToCart failed", err);
    }
    if (typeof after === "string") navigate(after);
  };

  return (
    <main className="product-page content-width modern-card">
      <div className="card-grid">
        <section className="gallery-column">
          <div className="hero">
            <img
              src={mainImg || "/placeholder-1200x900.png"}
              alt={product.name}
              onError={(e) => (e.currentTarget.src = "/placeholder-1200x900.png")}
            />
          </div>

          {gallery.length > 1 && (
            <div className="thumbs" role="list">
              {gallery.map((img, i) => {
                const url = makeUrl(img);
                return (
                  <button
                    key={i}
                    role="listitem"
                    className={`thumb ${makeUrl(activeImage) === url ? "active" : ""}`}
                    onClick={() => setActiveImage(img)}
                    aria-label={`Show image ${i + 1}`}
                    style={{ backgroundImage: `url(${url})` }}
                  />
                );
              })}
            </div>
          )}
        </section>

        <aside className="info-column" aria-labelledby="product-title">
          <div className="info-card">
            <h1 id="product-title">{product.name}</h1>

            <div className="meta-row">
              <div className="price">₹{product.price}</div>
              {product.stock !== undefined && (
                <div className={`stock ${product.stock > 0 ? "in" : "out"}`}>
                  {product.stock > 0 ? "In stock" : "Out of stock"}
                </div>
              )}
            </div>

            <p className="short-desc">{product.description}</p>

            <div className="actions">
          
                <div    onClick={() => handleAddToCart(1, "/cart")}>
          <Addcart/></div>
              


                <div  onClick={() => handleAddToCart(1, "/checkout")}>
               <Buynow/></div>
              
            </div>

            {/* Example detail rows */}
            <dl className="details">
              {product.brand && (
                <>
                  <dt>Brand</dt>
                  <dd>{product.brand}</dd>
                </>
              )}
              {product.category && (
                <>
                  <dt>Category</dt>
                  <dd>{product.category}</dd>
                </>
              )}
              {product.sku && (
                <>
                  <dt>SKU</dt>
                  <dd>{product.sku}</dd>
                </>
              )}
            </dl>

            {/* small note */}
            <div className="note">Free returns • 30 days refund policy</div>
          </div>
        </aside>
      </div>

      {/* CSS scoped to this component */}
      <style>{`
        /* Layout */
        .modern-card .card-grid {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 32px;
          align-items: start;
          padding: 36px 0;
        }

        /* Gallery */
        .gallery-column .hero {
          background: linear-gradient(180deg, #fff, #fafafa);
          border-radius: 12px;
          padding: 18px;
          box-shadow: 0 10px 30px rgba(15,15,15,0.06);
        }
        .gallery-column .hero img {
          display: block;
          width: 40%;
          height: auto;
          border-radius: 8px;
          object-fit: cover;
          max-height: 720px;
        }

        .thumbs {
          margin-top: 14px;
          display: flex;
          gap: 10px;
          overflow-x: auto;
          padding-bottom: 6px;
        }
        .thumb {
          width: 84px;
          height: 84px;
          border-radius: 8px;
          background-size: cover;
          background-position: center;
          border: 2px solid transparent;
          cursor: pointer;
          flex: 0 0 auto;
          box-shadow: 0 6px 18px rgba(10,10,10,0.06);
        }
        .thumb.active {
          border-color: #caa67a;
          transform: translateY(-2px);
        }

        /* Info column (sticky on large screens) */
        .info-column {
          position: relative;
        }
        .info-card {
          position: sticky;
          top: 20px;
          background: #fff;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 12px 40px rgba(11,11,11,0.06);
          border: 1px solid rgba(0,0,0,0.03);
        }

        .info-card h1 { font-size: 26px; margin: 0 0 12px; color: #222; }
        .meta-row { display:flex; align-items:center; gap:16px; margin-bottom:12px; }
        .price { font-size:24px; font-weight:700; color:#6b3b1f; }
        .stock.in { color: #198754; font-weight:600; }
        .stock.out { color: #c92a2a; font-weight:600; }

        .short-desc { color: #555; line-height:1.6; margin: 8px 0 18px; }

        .actions { display:flex; gap:12px; margin-bottom:18px; flex-wrap:wrap; }
        .btn { border-radius:8px; padding:10px 16px; cursor:pointer; border: none; font-weight:600; }
        .btn-primary {
          background: linear-gradient(180deg,#7f4a2e,#6b3b1f);
          color:#fff;
          box-shadow: 0 8px 20px rgba(107,59,31,0.16);
        }
        .btn-primary:hover { transform: translateY(-2px); }
        .btn-ghost {
          background: transparent;
          color: #6b3b1f;
          border: 1px solid rgba(107,59,31,0.12);
        }
        .btn-ghost:hover { background: rgba(107,59,31,0.04); transform: translateY(-2px); }

        .details { display:grid; grid-template-columns: 80px 1fr; gap:6px 12px; margin-top:18px; color:#666; }
        .details dt { font-weight:700; color:#333; }
        .note { margin-top:18px; color:#777; font-size:14px; }

        /* Responsive */
        @media (max-width: 1000px) {
          .modern-card .card-grid { grid-template-columns: 1fr 320px; gap:20px; }
          .gallery-column .hero img { max-height: 480px; }
        }
        @media (max-width: 820px) {
          .modern-card .card-grid { grid-template-columns: 1fr; }
          .info-column { order: 2; }
          .gallery-column { order: 1; }
          .info-card { position: relative; top: auto; }
        }

        /* small utility */
        .product-loading, .product-empty { padding:40px; color:#555; text-align:center; }
      `}</style>
    </main>
  );
}
