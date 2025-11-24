// src/pages/order/OrderTrack.js
import React, { useState } from "react";

const STATUS_LABELS = [
  "Order Placed",
  "Processing",
  "Shipped",
  "Out for Delivery",
  "Delivered",
];

// top-level helper that DOES NOT use React state
async function lookupOrder(query) {
  const url = `/api/orders/lookup?query=${encodeURIComponent(query)}`;
  const res = await fetch(url, { method: "GET", headers: { "Content-Type": "application/json" } });
  if (!res.ok) {
    // try to bubble server message
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  const data = await res.json();
  return data;
}

export default function OrderTrack() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  // single handleLookup which uses component state
  async function handleLookup(e) {
    e?.preventDefault();
    setError("");
    setOrder(null);

    if (!query.trim()) {
      setError("Please enter an Order ID or email.");
      return;
    }

    setLoading(true);
    try {
      // call backend
      const data = await lookupOrder(query);

      if (!data) {
        setError("No order found for that ID/email.");
      } else {
        // expected shape: { id, email, statusIndex, placedAt, tracking: [{ time }, ...] }
        setOrder(data);
      }
    } catch (err) {
      console.error("lookup error:", err);
      setError("Something went wrong. Try again later.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, marginBottom: 12 }}>Track Your Order</h1>
      <p style={{ color: "#666", marginBottom: 20 }}>
        Enter your Order ID or the email used to place the order. We'll show the latest status.
      </p>

      <form onSubmit={handleLookup} style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 18 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Order ID (e.g. ORD-1234) or email"
          style={{
            flex: 1,
            padding: "12px 14px",
            borderRadius: 8,
            border: "1px solid #ddd",
            fontSize: 15,
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            background: "#b58143",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            minWidth: 110,
          }}
        >
          {loading ? "Checking..." : "Track Order"}
        </button>
      </form>

      {error && <div style={{ color: "#C0392B", marginBottom: 14 }}>{error}</div>}

      {order ? (
        <div style={{ marginTop: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 600 }}>{order.id}</div>
              <div style={{ color: "#666" }}>{order.email} • Placed: {order.placedAt}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 14, color: "#666" }}>Current status</div>
              <div style={{ fontWeight: 700, marginTop: 4 }}>{STATUS_LABELS[order.statusIndex]}</div>
            </div>
          </div>

          {/* Timeline */}
          <div style={{ display: "flex", gap: 18, alignItems: "flex-start", flexWrap: "wrap" }}>
            {STATUS_LABELS.map((label, i) => {
              const complete = i <= order.statusIndex;
              return (
                <div key={label} style={{ display: "flex", gap: 12, alignItems: "center", width: 220 }}>
                  <div
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      background: complete ? "#2ecc71" : "#eee",
                      border: "2px solid #fff",
                    }}
                    aria-hidden
                  />
                  <div>
                    <div style={{ fontWeight: complete ? 700 : 500 }}>{label}</div>
                    <div style={{ color: "#777", fontSize: 13 }}>
                      {order.tracking && order.tracking[i] ? order.tracking[i].time : (complete ? "Completed" : "Pending")}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Optional actions */}
          <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
            <button
              onClick={() => window.alert("Contact support at support@example.com")}
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                border: "1px solid #ddd",
                background: "#fff",
                cursor: "pointer",
              }}
            >
              Contact Support
            </button>

            <button
              onClick={() => navigator.clipboard?.writeText(order.id) && alert("Order ID copied")}
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                border: "none",
                background: "#f0f0f0",
                cursor: "pointer",
              }}
            >
              Copy Order ID
            </button>
          </div>
        </div>
      ) : (
        <div style={{ color: "#444", marginTop: 12 }}>No order selected.</div>
      )}
    </div>
  );
}
