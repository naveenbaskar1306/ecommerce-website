// src/context/CartContext.js
import React, { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const raw = localStorage.getItem("hh_cart");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // persist cart
  useEffect(() => {
    try {
      localStorage.setItem("hh_cart", JSON.stringify(cart));
    } catch {
      /* ignore */
    }
  }, [cart]);

  // helper to get either _id or id
  const getId = (item) => item._id || item.id;

  // ✅ ADD TO CART
  const addToCart = (product, qty = 1) => {
    setCart((prev) => {
      const idKey = getId(product);
      const idx = prev.findIndex((p) => getId(p) === idKey);

      if (idx > -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: (next[idx].quantity || 1) + qty };
        return next;
      }

      return [...prev, { ...product, quantity: qty }];
    });
  };

  // ✅ REMOVE ITEM
  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((p) => getId(p) !== productId));
  };

  // ✅ CLEAR CART
  const clearCart = () => setCart([]);

  // ✅ UPDATE QUANTITY (used by + / -)
  const updateQty = (productId, quantity) => {
    setCart((prev) =>
      prev.map((p) =>
        getId(p) === productId ? { ...p, quantity: Math.max(1, quantity) } : p
      )
    );
  };

  // ✅ OPTIONAL: increment/decrement helpers (used by + and -)
  const increase = (productId) => {
    setCart((prev) =>
      prev.map((p) =>
        getId(p) === productId
          ? { ...p, quantity: (p.quantity || 1) + 1 }
          : p
      )
    );
  };

  const decrease = (productId) => {
    setCart((prev) =>
      prev
        .map((p) =>
          getId(p) === productId
            ? { ...p, quantity: Math.max(1, (p.quantity || 1) - 1) }
            : p
        )
        .filter((p) => (p.quantity || 1) > 0)
    );
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        updateQty,
        increase,
        decrease,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
