// src/pages/cart/index.js
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { FaPlus, FaMinus, FaTrash } from "react-icons/fa";
import Continueshop from "../../components/Buttons/continueshop";
import Clearcard from "../../components/Buttons/clearcard";
import Checkout from "../../components/Buttons/checkout";

function toNumber(val) {
  if (val == null) return 0;
  if (typeof val === "number" && !Number.isNaN(val)) return val;
  const s = String(val).trim();
  // Remove any non-digit, non-dot, non-minus characters (like ₹, commas, spaces)
  const cleaned = s.replace(/[^\d.-]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

const FALLBACK_IMAGE =
  "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D'240'%20height%3D'240'%20xmlns%3D'http%3A//www.w3.org/2000/svg'%3E%3Crect%20width%3D'100%25'%20height%3D'100%25'%20fill%3D'%23f3f3f3'/%3E%3Ctext%20x%3D'50%25'%20y%3D'50%25'%20dominant-baseline%3D'middle'%20text-anchor%3D'middle'%20fill%3D'%23bbb'%20font-family%3D'Arial%2C%20sans-serif'%20font-size%3D'16'%3ENo%20image%3C/text%3E%3C/svg%3E";

export default function CartPage() {
  const navigate = useNavigate();
  // get cart and helper functions from context (may be undefined in some projects)
  const { cart: ctxCart = [], removeFromCart, updateQty, clearCart } = useCart() || {};

  // local copy of cart to allow UI to work even if context doesn't expose update/remove
  const [localCart, setLocalCart] = useState(Array.isArray(ctxCart) ? ctxCart : []);

  // keep localCart synced with context cart when it changes externally
  useEffect(() => {
    setLocalCart(Array.isArray(ctxCart) ? ctxCart : []);
  }, [ctxCart]);

  // helper to generate stable id for item
  const idOf = (item) => item._id || item.id || item.title || JSON.stringify(item);

  // update quantity (will call context.updateQty if available, else update local state)
  const setQuantity = (id, newQty) => {
    if (newQty < 1) newQty = 1;
    if (typeof updateQty === "function") {
      try {
        updateQty(id, newQty);
        return;
      } catch (err) {
        // swallow and fall back
        // eslint-disable-next-line no-console
        console.warn("updateQty failed:", err);
      }
    }
    // fallback: update localCart
    setLocalCart((prev) =>
      prev.map((p) => (idOf(p) === id ? { ...p, quantity: newQty } : p))
    );
  };

  // remove item
  const handleRemove = (id) => {
    if (typeof removeFromCart === "function") {
      try {
        removeFromCart(id);
        return;
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn("removeFromCart failed:", err);
      }
    }
    // fallback
    setLocalCart((prev) => prev.filter((p) => idOf(p) !== id));
  };

  // clear all
  const handleClear = () => {
    if (typeof clearCart === "function") {
      try {
        clearCart();
        return;
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn("clearCart failed:", err);
      }
    }
    setLocalCart([]);
  };

  // compute subtotal from localCart
  const subtotal = useMemo(() => {
    return (localCart || []).reduce((sum, p) => {
      const price = toNumber(p.price);
      const qty = p.quantity == null ? 1 : Number(p.quantity) || 0;
      return sum + price * qty;
    }, 0);
  }, [localCart]);

  return (
    <div className="cart-page container" style={{ padding: "40px 24px" }}>
      <h1 className="cart-title" style={{ fontSize: 36, marginBottom: 24 }}>
        Your Cart
      </h1>

      <div className="cart-grid" style={{ display: "flex", gap: 24 }}>
        {/* Left: cart items */}
        <div style={{ flex: 1 }}>
          {(!localCart || localCart.length === 0) ? (
            <div className="empty" style={{ padding: 40, textAlign: "center" }}>
              🛒 Your cart is empty.
            </div>
          ) : (
            localCart.map((item) => {
              const key = idOf(item);
              const priceNum = toNumber(item.price);
              const qty = item.quantity == null ? 1 : Number(item.quantity) || 0;
              const img = item.image || item.imageUrl || item.image_url || FALLBACK_IMAGE;
              const title = item.title || item.name || "Product";
              const category = item.category || item.cat || "";

              return (
                <div
                  className="cart-item"
                  key={key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 20,
                    padding: 20,
                    marginBottom: 18,
                    borderRadius: 12,
                    background: "#fff",
                    boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
                  }}
                >
                  <img
                    src={img}
                    alt={title}
                    style={{
                      width: 110,
                      height: 110,
                      objectFit: "cover",
                      borderRadius: 12,
                      flex: "0 0 110px",
                    }}
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK_IMAGE;
                    }}
                  />

                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, fontSize: 18 }}>{title}</h3>
                    {category && (
                      <div style={{ color: "#666", marginTop: 6, fontSize: 13 }}>
                        {category}
                      </div>
                    )}
                    <div style={{ marginTop: 10, color: "#222", fontWeight: 600 }}>
                      {currencyFormatter.format(priceNum)}
                    </div>

                    <div
                      className="cart-item__controls"
                      style={{
                        marginTop: 12,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <button
                        className="qty-btn"
                        aria-label="decrease"
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 8,
                          border: "1px solid #eee",
                          background: "#fff",
                          cursor: "pointer",
                        }}
                        onClick={() => setQuantity(key, Math.max(1, qty - 1))}
                      >
                        <FaMinus />
                      </button>

                      <div
                        className="qty-display"
                        style={{
                          minWidth: 28,
                          textAlign: "center",
                        }}
                      >
                        {qty}
                      </div>

                      <button
                        className="qty-btn"
                        aria-label="increase"
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 8,
                          border: "1px solid #eee",
                          background: "#fff",
                          cursor: "pointer",
                        }}
                        onClick={() => setQuantity(key, qty + 1)}
                      >
                        <FaPlus />
                      </button>

                      <button
                        className="remove-btn"
                        style={{
                          marginLeft: 12,
                          padding: "8px 12px",
                          borderRadius: 8,
                          border: "1px solid #eee",
                          background: "#fff",
                          color: "#b22222",
                          cursor: "pointer",
                        }}
                        onClick={() => handleRemove(key)}
                        title="Remove item"
                      >
                        <FaTrash style={{ marginRight: 8 }} /> Remove
                      </button>
                    </div>
                  </div>

                  <div style={{ minWidth: 120, textAlign: "right", fontWeight: 700 }}>
                    {currencyFormatter.format(priceNum * qty)}
                  </div>
                </div>
              );
            })
          )}

          {localCart.length > 0 && (
            <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
              
                <div     onClick={handleClear}>
             <Clearcard/></div>
           
<div  onClick={() => navigate("/")} >
               <Continueshop/></div>
             
            </div>
          )}
        </div>

        {/* Right: summary */}
        <aside
          className="cart-summary"
          style={{
            width: 340,
            padding: 20,
            borderRadius: 12,
            background: "#111",
            color: "#fff",
            boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
            height: "fit-content",
          }}
        >
          <h2 style={{ marginTop: 0 }}>Order Summary</h2>

          <div style={{ display: "flex", justifyContent: "space-between", margin: "18px 0" }}>
            <span>Subtotal</span>
            <strong>{currencyFormatter.format(subtotal)}</strong>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", margin: "12px 0", color: "#bbb" }}>
            <span>Estimated shipping</span>
            <span>—</span>
          </div>

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 12, marginTop: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong style={{ fontSize: 18 }}>Total</strong>
              <strong style={{ fontSize: 18 }}>{currencyFormatter.format(subtotal)}</strong>
            </div>

          
              <div  onClick={() => navigate("/checkout")}
              disabled={localCart.length === 0}>
         <Checkout/></div>
           
          </div>
        </aside>
      </div>
    </div>
  );
}
