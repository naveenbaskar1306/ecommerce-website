// src/components/sliderData.js
import React, { useEffect, useState } from "react";

// ✅ Centralized API import
import { API_BASE } from "../../config/api";

export default function SliderData() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const res = await fetch(`${API_BASE}/api/products?featured=true`);
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching featured products:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchFeatured();
  }, []);

  const makeImageUrl = (path) => {
    if (!path) return "/placeholder.png";
    if (path.startsWith("/uploads")) return `${API_BASE}${path}`;
    return path;
  };

  return (
    <section style={{ padding: "2rem 1rem" }}>
      <h2 style={{ fontSize: "1.8rem", fontWeight: "700", marginBottom: "1rem" }}>
        Featured
      </h2>

      {loading ? (
        <p>Loading featured products...</p>
      ) : products.length === 0 ? (
        <p>No products to show.</p>
      ) : (
        <div
          style={{
            display: "flex",
            gap: "20px",
            overflowX: "auto",
            paddingBottom: "10px",
          }}
        >
          {products.map((p) => (
            <div
              key={p._id}
              style={{
                minWidth: "250px",
                border: "1px solid #ddd",
                borderRadius: "10px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                background: "#fff",
                flex: "0 0 auto",
              }}
            >
              <img
                src={makeImageUrl(p.image)}
                alt={p.name}
                onError={(e) =>
                  (e.currentTarget.src =
                    "https://via.placeholder.com/250x200?text=No+Image")
                }
                style={{
                  width: "100%",
                  height: "180px",
                  objectFit: "cover",
                  borderTopLeftRadius: "10px",
                  borderTopRightRadius: "10px",
                }}
              />
              <div style={{ padding: "1rem" }}>
                <h3 style={{ margin: "0 0 5px" }}>{p.name}</h3>
                <p style={{ margin: "0 0 10px", color: "#666" }}>
                  {p.description}
                </p>
                <strong style={{ color: "#7a4f32" }}>₹{p.price}</strong>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
