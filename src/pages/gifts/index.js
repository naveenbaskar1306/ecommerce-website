// src/pages/Gift.js
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D'400'%20height%3D'300'%20xmlns%3D'http%3A//www.w3.org/2000/svg'%3E%3Crect%20fill%3D'%23f3f4f6'%20width%3D'100%25'%20height%3D'100%25'/%3E%3Ctext%20x%3D'50%25'%20y%3D'50%25'%20dominant-baseline%3D'middle'%20text-anchor%3D'middle'%20fill%3D'%23999'%20font-family%3D'Arial'%20font-size%3D'18'%3ENo%20Image%3C/text%3E%3C/svg%3E";

export default function Gift() {
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then((res) => res.json())
      .then((data) => {
        // Only show products in "Gift" category
        const filtered = Array.isArray(data)
          ? data.filter(
              (p) =>
                (p.category || "")
                  .toLowerCase()
                  .includes("gift") ||
                (p.name || "").toLowerCase().includes("gift")
            )
          : [];
        setGifts(filtered);
      })
      .catch(() => setGifts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="gift-page" style={{ padding: "2rem" }}>
      <h1 style={{ marginBottom: "1.5rem" }}>Gifts & Curated Collection</h1>

      {loading && <p>Loading gift items...</p>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {gifts.map((p) => (
          <div
            key={p._id}
            style={{
              background: "#fff",
              borderRadius: 12,
              boxShadow: "0 6px 14px rgba(0,0,0,0.08)",
              padding: "1rem",
            }}
          >
            <img
              src={p.image || PLACEHOLDER_IMAGE}
              alt={p.name}
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
              {p.description || "Perfect gift for every occasion!"}
            </p>
            <p style={{ fontWeight: "bold", color: "#7a4f32" }}>₹{p.price}</p>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                style={{
                  background: "#7a4f32",
                  color: "#fff",
                  border: "none",
                  padding: "8px 14px",
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              >
                Add Cart
              </button>
              <Link
                to={`/product/${p._id}`}
                style={{
                  textDecoration: "none",
                  border: "1px solid #ccc",
                  borderRadius: 8,
                  padding: "8px 14px",
                  color: "#333",
                }}
              >
                View
              </Link>
            </div>
          </div>
        ))}
      </div>
      {!loading && gifts.length === 0 && (
        <p style={{ color: "#888" }}>No gift items found.</p>
      )}
    </div>
  );
}
