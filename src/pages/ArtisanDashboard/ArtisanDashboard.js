// src/pages/ArtisanDashboard/ArtisanDashboard.js
import React, { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:5000";

export default function ArtisanDashboard() {
  const [summary, setSummary] = useState({ productsCount: 0, ordersCount: 0 });
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  function handleLogout() {
    // remove all possible auth items used by login
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("artisanToken"); // in case some code used it
      // redirect to login page
      window.location.href = "/artisan-login";
    } catch (e) {
      console.error("Logout cleanup failed:", e);
      window.location.href = "/artisan-login";
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [summaryRes, productsRes, ordersRes] = await Promise.all([
        axios.get(`${API}/api/artisan/summary`),
        axios.get(`${API}/api/artisan/products`),
        axios.get(`${API}/api/artisan/orders`),
      ]);
      const s = summaryRes.data || {};
      setSummary({
        productsCount: s.productsCount ?? s.products ?? 0,
        ordersCount: s.ordersCount ?? s.orders ?? 0,
      });
      setProducts(productsRes.data || []);
      setOrders(ordersRes.data || []);
    } catch (err) {
      console.error("Failed to load artisan data:", err);
      alert("Failed to load artisan data. Check server logs.");
    } finally {
      setLoading(false);
    }
  }

  function computeOrderTotal(o) {
    const candidates = ["total","totalPrice","itemsPrice","subtotal","cartTotal","grandTotal","amount"];
    for (const key of candidates) {
      if (o[key] !== undefined && o[key] !== null) {
        const v = Number(o[key]);
        if (!isNaN(v)) return v;
      }
    }

    const sumItems = (arr) => {
      try {
        if (!Array.isArray(arr) || arr.length === 0) return 0;
        const sum = arr.reduce((acc, it) => {
          const qty = Number(it.qty ?? it.quantity ?? it.count ?? 1);
          const price = Number(it.price ?? it.unitPrice ?? it.itemPrice ?? it.amount ?? it.linePrice ?? it.total ?? 0);
          const q = isNaN(qty) ? 0 : qty;
          const p = isNaN(price) ? 0 : price;
          return acc + q * p;
        }, 0);
        return isNaN(sum) ? 0 : sum;
      } catch (e) { return 0; }
    };

    const arrayCandidates = ["orderItems","items","line_items","products","order_items","cartItems"];
    for (const key of arrayCandidates) {
      if (Array.isArray(o[key]) && o[key].length > 0) {
        const s = sumItems(o[key]);
        if (s > 0) return s;
      }
    }

    if (o.cart && Array.isArray(o.cart.items) && o.cart.items.length > 0) {
      const s = sumItems(o.cart.items);
      if (s > 0) return s;
    }

    if (o.order && Array.isArray(o.order.items) && o.order.items.length > 0) {
      const s = sumItems(o.order.items);
      if (s > 0) return s;
    }
    if (o.data && Array.isArray(o.data.items) && o.data.items.length > 0) {
      const s = sumItems(o.data.items);
      if (s > 0) return s;
    }

    if (o.items && typeof o.items === "object" && !Array.isArray(o.items)) {
      try {
        const values = Object.values(o.items);
        const s = sumItems(values);
        if (s > 0) return s;
      } catch (e) {}
    }

    try {
      for (const k of Object.keys(o)) {
        if (Array.isArray(o[k]) && o[k].length > 0) {
          const s = sumItems(o[k]);
          if (s > 0) return s;
        }
      }
    } catch (e) {}

    return 0;
  }

  async function toggleFeatured(productId, currentFeatured) {
    try {
      setProducts((prev) => prev.map((p) => (p._id === productId ? { ...p, featured: !currentFeatured } : p)));
      const res = await axios.patch(`${API}/api/products/${productId}/feature`, { featured: !currentFeatured });
      const updated = res.data.product || res.data.productUpdated || null;
      if (updated) {
        setProducts((prev) => prev.map((p) => (p._id === productId ? updated : p)));
      }
    } catch (err) {
      console.error("Feature toggle failed:", err);
      alert("Failed to toggle featured status");
      setProducts((prev) => prev.map((p) => (p._id === productId ? { ...p, featured: currentFeatured } : p)));
    }
  }

  async function deleteProduct(productId) {
    const confirmed = window.confirm("Are you sure you want to permanently delete this product?");
    if (!confirmed) return;
    const prev = [...products];
    setProducts((prevList) => prevList.filter((p) => p._id !== productId));
    try {
      const res = await axios.delete(`${API}/api/products/${productId}`);
      if (!res.data || !res.data.success) {
        throw new Error(res.data?.message || "Delete failed");
      }
      setSummary((s) => ({ ...s, productsCount: Math.max(0, (s.productsCount || 1) - 1) }));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete product. Reverting changes.");
      setProducts(prev);
    }
  }

  const formatCurrency = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(n || 0);

  if (loading)
    return (
      <div style={{ textAlign: "center", marginTop: "3rem" }}>Loading...</div>
    );

  return (
    <div style={{ padding: "2rem" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 700 }}>Artisan Dashboard</h1>
      <p>Manage your handmade products and view orders</p>

      <button
        onClick={handleLogout}
        style={{
          background: "#b22222",
          color: "#fff",
          padding: "8px 16px",
          borderRadius: "6px",
          border: "none",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        Logout
      </button>

      <div style={{ display: "flex", gap: "1rem", marginTop: "1rem", flexWrap: "wrap" }}>
        <div style={cardStyle}>
          <h3>Total Products</h3>
          <h2>{summary.productsCount}</h2>
        </div>
        <div style={cardStyle}>
          <h3>Total Orders</h3>
          <h2>{summary.ordersCount}</h2>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24 }}>
        <h2 style={{ margin: 0 }}>My Products</h2>
        <button className="btn btn-primary" onClick={() => (window.location.href = "/artisan/add-product")}>
          + Add Product
        </button>
      </div>

      {products.length === 0 ? (
        <p style={{ marginTop: 16 }}>No products found.</p>
      ) : (
        <div style={{ marginTop: 16 }}>
          {products.map((p) => (
            <div key={p._id} style={productRowStyle}>
              <img
                src={p.image?.startsWith("/uploads") ? `${API}${p.image}` : p.image || "https://via.placeholder.com/120"}
                alt={p.name}
                style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 8 }}
              />
              <div style={{ flex: 1, marginLeft: 12 }}>
                <h4 style={{ margin: 0 }}>{p.name || p.title}</h4>
                <p style={{ margin: "6px 0", color: "#666" }}>{p.category || "Uncategorized"}</p>
                <p style={{ margin: "4px 0", fontWeight: 700 }}>₹{p.price}</p>
                <p style={{ marginTop: 6, color: "#555" }}>{p.description?.slice(0, 120) || "No description"}</p>
                <div style={{ marginTop: 10 }}>
                  <button
                    onClick={() => toggleFeatured(p._id, !!p.featured)}
                    style={{
                      background: p.featured ? "#0b74de" : "#fff",
                      color: p.featured ? "#fff" : "#333",
                      border: "1px solid #ddd",
                      padding: "6px 12px",
                      borderRadius: 6,
                      cursor: "pointer",
                      marginRight: 8,
                    }}
                  >
                    {p.featured ? "Unfeature" : "Feature"}
                  </button>

                  <button
                    onClick={() => (window.location.href = `/product/${p._id}`)}
                    style={{
                      background: "#7a4f32",
                      color: "#fff",
                      border: "none",
                      padding: "6px 12px",
                      borderRadius: 6,
                      cursor: "pointer",
                      marginRight: 8,
                    }}
                  >
                    View
                  </button>

                  <button
                    onClick={() => deleteProduct(p._id)}
                    style={{
                      background: "#fff",
                      color: "#b22222",
                      border: "1px solid #f1c4c4",
                      padding: "6px 12px",
                      borderRadius: 6,
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <section style={{ marginTop: "2rem" }}>
        <h2>My Orders</h2>
        {orders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const totalValue = computeOrderTotal(o);
                const displayTotal = (o.total !== undefined && !isNaN(Number(o.total)) ? Number(o.total) : totalValue) || 0;
                const status = o.status ?? o.statusText ?? (o.tracking && o.tracking[0] && o.tracking[0].label) ?? "Pending";
                const orderId = o.orderId ?? o._id ?? "(unknown)";
                return (
                  <tr key={o._id || orderId}>
                    <td style={{ verticalAlign: "middle" }}>{orderId}</td>
                    <td style={{ verticalAlign: "middle" }}>{formatCurrency(displayTotal)}</td>
                    <td style={{ verticalAlign: "middle" }}>{status}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

const cardStyle = {
  background: "#fff",
  border: "1px solid #ddd",
  borderRadius: "10px",
  padding: "1rem",
  flex: "1",
  textAlign: "center",
  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  minWidth: "200px",
};

const productRowStyle = {
  display: "flex",
  gap: 12,
  alignItems: "flex-start",
  background: "#fff",
  padding: 12,
  borderRadius: 10,
  marginBottom: 12,
  boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "1rem",
};
