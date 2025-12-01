// src/pages/Home.js
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import FeaturedSlider from "../../components/productslider/FeaturedSlider";
import Popup from "../../components/Buttons/aipopup";

import { API_BASE } from "../../config/api";

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D'400'%20height%3D'300'%20xmlns%3D'http%3A//www.w3.org/2000/svg'%3E%3Crect%20fill%3D'%23f3f4f6'%20width%3D'100%25'%20height%3D'100%25'/%3E%3Ctext%20x%3D'50%25'%20y%3D'50%25'%20dominant-baseline%3D'middle'%20text-anchor%3D'middle'%20fill%3D'%23999'%20font-family%3D'Arial'%20font-size%3D'18'%3ENo%20Image%3C/text%3E%3C/svg%3E";

function currency(n) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n || 0);
}

/* Reusable star display component (non-interactive) */
function Stars({ rating = 5, size = 18 }) {
  const filled = Math.round(Math.max(0, Math.min(5, rating)));
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    const isFilled = i <= filled;
    stars.push(
      <svg
        key={i}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={isFilled ? "#C07A3A" : "none"}
        stroke={isFilled ? "#C07A3A" : "#C07A3A"}
        strokeWidth="1"
        style={{ marginRight: 4 }}
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path d="M12 .587l3.668 7.431L23.6 9.75l-5.6 5.462L19.335 24 12 20.012 4.665 24l1.335-8.788L.4 9.75l7.932-1.732L12 .587z" />
      </svg>
    );
  }
  return <div style={{ display: "flex", alignItems: "center" }}>{stars}</div>;
}

/* Interactive star input for review (clickable) */
function StarInput({ value = 0, onChange, size = 22 }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = i <= (hover || value);
        return (
          <svg
            key={i}
            role="button"
            onClick={() => onChange(i)}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(0)}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill={filled ? "#C07A3A" : "none"}
            stroke="#C07A3A"
            strokeWidth="1"
            style={{ cursor: "pointer" }}
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path d="M12 .587l3.668 7.431L23.6 9.75l-5.6 5.462L19.335 24 12 20.012 4.665 24l1.335-8.788L.4 9.75l7.932-1.732L12 .587z" />
          </svg>
        );
      })}
    </div>
  );
}

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  // track which product is showing review form: id or null
  const [reviewFor, setReviewFor] = useState(null);
  // small form state (single shared for simplicity)
  const [form, setForm] = useState({ rating: 5, comment: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function openLoginHandler(e) {
      console.log("[App] openLogin event received");

      // mark handled
      window.__loginModalHandled = true;

      // dispatch a custom event so parent App can open login modal
      const ev = new CustomEvent("openLogin");
      window.dispatchEvent(ev);
    }

    window.addEventListener("openLogin", openLoginHandler);
    return () => window.removeEventListener("openLogin", openLoginHandler);
  }, []);

  // debug log to ensure env var baked into production build
  useEffect(() => {
    console.log("API_BASE =", API_BASE);
  }, []);

  async function fetchProducts() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/products`);
      if (!res.ok) {
        console.error("Failed to fetch products - status:", res.status);
        setProducts([]);
        return;
      }
      const data = await res.json();
      // ensure products have rating and reviewCount fields if backend doesn't provide them
      const norm =
        (Array.isArray(data) ? data : [])
          .slice(0, 8)
          .map((p) => ({
            ...p,
            rating: typeof p.rating === "number" ? p.rating : 5,
            reviewCount: typeof p.reviewCount === "number" ? p.reviewCount : p.reviews?.length ?? 0,
          }));
      setProducts(norm);
      console.log("✅ Loaded products:", norm.length);
    } catch (error) {
      console.error("❌ Failed to fetch products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  function openReview(id, product) {
    setReviewFor(id);
    setForm({
      rating: 5,
      comment: "",
    });
    // optional: focus management could be added
  }

  async function submitReview(productId) {
    if (!productId) return;
    setSubmitting(true);
    const payload = { rating: form.rating, comment: form.comment || "" };

    // Try send to backend if route exists; otherwise fallback to local update
    try {
      const res = await fetch(`${API_BASE}/api/products/${productId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("server failed");
      const updated = await res.json();
      // if backend returns updated product or new rating, use it. fallback to optimistic update below.
      if (updated && (updated._id || updated.id)) {
        setProducts((prev) => prev.map((p) => (p._id === updated._id || p.id === updated.id ? { ...p, ...updated } : p)));
      } else {
        // optimistic update below
        setProducts((prev) =>
          prev.map((p) =>
            p._id === productId
              ? {
                  ...p,
                  reviewCount: (p.reviewCount || 0) + 1,
                  rating: Number(((p.rating * (p.reviewCount || 0) + payload.rating) / ((p.reviewCount || 0) + 1)).toFixed(2)),
                }
              : p
          )
        );
      }
    } catch (err) {
      console.warn("Review POST failed, applying optimistic update locally.", err);
      // fallback: optimistic local update so user sees their review immediately
      setProducts((prev) =>
        prev.map((p) =>
          p._id === productId
            ? {
                ...p,
                reviewCount: (p.reviewCount || 0) + 1,
                rating: Number(((p.rating * (p.reviewCount || 0) + payload.rating) / ((p.reviewCount || 0) + 1)).toFixed(2)),
              }
            : p
        )
      );
    } finally {
      setSubmitting(false);
      setReviewFor(null);
    }
  }

  return (
    <div className="home-page" style={{ padding: "2rem" }}>
      <FeaturedSlider limit={6} />
      <Popup />

      <h1 style={{ marginBottom: "1.5rem" }}>Products & Reviews</h1>

      {loading && <p>Loading products...</p>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {products.map((p) => (
          <div
            key={p._id || p.id}
            style={{
              background: "#fff",
              borderRadius: 12,
              boxShadow: "0 6px 14px rgba(0,0,0,0.08)",
              padding: "1rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: 440, // keep cards consistent height for clean UI
            }}
          >
            <div>
              <img
                src={p.image || PLACEHOLDER_IMAGE}
                alt={p.name || p.title}
                style={{
                  width: "100%",
                  height: 200,
                  objectFit: "cover",
                  borderRadius: 8,
                  marginBottom: "1rem",
                }}
                onError={(e) => (e.currentTarget.src = PLACEHOLDER_IMAGE)}
              />
              <h3 style={{ margin: "0 0 0.5rem" }}>{p.name || p.title}</h3>
              <p
                style={{
                  color: "#666",
                  minHeight: "40px",
                  fontSize: 14,
                  overflow: "hidden",
                }}
              >
                {p.description || "Beautiful handmade product."}
              </p>
            </div>

            <div style={{ marginTop: "1rem" }}>
              <p style={{ fontWeight: "bold", color: "#7a4f32", marginBottom: 8 }}>{currency(p.price)}</p>

              {/* REVIEW / STARS (replaces Add Cart + View) */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Stars rating={p.rating ?? 5} size={18} />
                <div style={{ color: "#666", fontSize: 13 }}>
                  {typeof p.reviewCount === "number" ? `${p.reviewCount} review${p.reviewCount !== 1 ? "s" : ""}` : "★★★★★"}
                </div>

                <button
                  onClick={() => (reviewFor === (p._id || p.id) ? setReviewFor(null) : openReview(p._id || p.id, p))}
                  style={{
                    marginLeft: "auto",
                    background: "#fff",
                    border: "1px solid #ddd",
                    padding: "8px 12px",
                    borderRadius: 8,
                    cursor: "pointer",
                  }}
                >
                  {reviewFor === (p._id || p.id) ? "Cancel" : "Write a review"}
                </button>
              </div>

              {/* Inline review form */}
              {reviewFor === (p._id || p.id) && (
                <div
                  style={{
                    marginTop: 12,
                    borderTop: "1px solid #eee",
                    paddingTop: 12,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <StarInput value={form.rating} onChange={(v) => setForm((s) => ({ ...s, rating: v }))} />
                    <div style={{ fontSize: 13, color: "#666" }}>{form.rating} / 5</div>
                  </div>

                  <textarea
                    placeholder="Write your review (optional)"
                    value={form.comment}
                    onChange={(e) => setForm((s) => ({ ...s, comment: e.target.value }))}
                    rows={3}
                    style={{
                      width: "100%",
                      marginTop: 8,
                      borderRadius: 8,
                      border: "1px solid #e6e6e6",
                      padding: 8,
                      resize: "vertical",
                      fontSize: 13,
                    }}
                  />

                  <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                    <button
                      onClick={() => submitReview(p._id || p.id)}
                      disabled={submitting}
                      style={{
                        background: "#7a4f32",
                        color: "#fff",
                        border: "none",
                        padding: "8px 12px",
                        borderRadius: 8,
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      {submitting ? "Submitting..." : "Submit review"}
                    </button>

                    <button
                      onClick={() => setReviewFor(null)}
                      style={{
                        background: "#fff",
                        border: "1px solid #ddd",
                        padding: "8px 12px",
                        borderRadius: 8,
                        cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
