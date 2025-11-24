// src/pages/checkout/Checkout.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext"; 
import Placeorder from "../../components/Buttons/placeorder";

const Checkout = () => {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    paymentMethod: "cod", // cod or card (we'll mock card)
    cardNumber: "",
    cardExpiry: "",
    cardCvv: "",
  });

  // subtotal
  const subtotal = cart.reduce((s, item) => {
    const p = Number(String(item.price).replace(/[^\d.-]/g, "")) || 0;
    const q = Number(item.quantity) || 1;
    return s + p * q;
  }, 0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // fixed spread update (was { .f, [name]: value } which is invalid)
    setForm((f) => ({ ...f, [name]: value }));
  };

  const validate = () => {
    if (!form.name || !form.email || !form.address || !form.city) {
      setErrorMsg("Please fill name, email, address and city.");
      return false;
    }
    if (cart.length === 0) {
      setErrorMsg("Your cart is empty.");
      return false;
    }
    // if card selected, do minimal checks
    if (form.paymentMethod === "card") {
      if (!form.cardNumber || !form.cardExpiry || !form.cardCvv) {
        setErrorMsg("Please enter card details (mock).");
        return false;
      }
    }
    setErrorMsg("");
    return true;
  };

  const placeOrder = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    // build order payload
    const payload = {
      // IMPORTANT: include email at top-level so backend validation passes
      email: form.email,

      // keep full customer object as well
      customer: {
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        city: form.city,
        state: form.state,
        postalCode: form.postalCode,
      },

      payment: {
        method: form.paymentMethod,
        // DO NOT send real card numbers in production; this is only for mock
        card:
          form.paymentMethod === "card"
            ? {
                last4: String(form.cardNumber).slice(-4),
                expiry: form.cardExpiry,
              }
            : null,
      },
      items: cart.map((it) => ({
        productId: it.id || it._id,
        title: it.title,
        price: Number(String(it.price).replace(/[^\d.-]/g, "")) || 0,
        quantity: Number(it.quantity) || 1,
      })),
      subtotal,
      shipping: 0,
      total: subtotal,
    };

    // debug: inspect payload in browser console / network
    console.log("Place order payload:", payload);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to create order");
      }

      setSuccessMsg("Order placed! Order ID: " + (data._id || data.id || (data.order && (data.order._id || data.order.orderId)) ));
      clearCart();
      // optional: navigate to order confirmation page after short delay
      setTimeout(() => {
        const goId = data._id || data.id || (data.order && (data.order._id || data.order.orderId));
        if (goId) navigate(`/order/${goId}`);
      }, 1200);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Order failed");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(n);

  return (
    <div className="checkout-page container">
      <h1>Checkout</h1>

      <div className="checkout-grid">
        <form className="checkout-form" onSubmit={placeOrder}>
          <h2>Shipping Details</h2>

          <label>
            Full name
            <input name="name" value={form.name} onChange={handleChange} />
          </label>

          <label>
            Email
            <input name="email" value={form.email} onChange={handleChange} />
          </label>

          <label>
            Phone
            <input name="phone" value={form.phone} onChange={handleChange} />
          </label>

          <label>
            Address
            <textarea name="address" value={form.address} onChange={handleChange} />
          </label>

          <div className="row">
            <label>
              City
              <input name="city" value={form.city} onChange={handleChange} />
            </label>
            <label>
              State
              <input name="state" value={form.state} onChange={handleChange} />
            </label>
          </div>

          <label>
            Postal code
            <input name="postalCode" value={form.postalCode} onChange={handleChange} />
          </label>

          <h3>Payment</h3>
          <label className="radio">
            <input
              type="radio"
              name="paymentMethod"
              value="cod"
              checked={form.paymentMethod === "cod"}
              onChange={handleChange}
            />
            Cash on Delivery
          </label>

          <label className="radio">
            <input
              type="radio"
              name="paymentMethod"
              value="card"
              checked={form.paymentMethod === "card"}
              onChange={handleChange}
            />
            Card (mock)
          </label>

          {form.paymentMethod === "card" && (
            <div className="card-row">
              <input name="cardNumber" placeholder="Card number" value={form.cardNumber} onChange={handleChange} />
              <input name="cardExpiry" placeholder="MM/YY" value={form.cardExpiry} onChange={handleChange} />
              <input name="cardCvv" placeholder="CVV" value={form.cardCvv} onChange={handleChange} />
            </div>
          )}

          {errorMsg && <div className="error">{errorMsg}</div>}
          {successMsg && <div className="success">{successMsg}</div>}

      
            <div type="submit" disabled={loading}>
         
            <Placeorder/></div>
      
        </form>

        <aside className="checkout-summary">
          <h2>Order summary</h2>
          {cart.map((it) => (
            <div className="summary-item" key={it.id || it._id || it.title}>
              <div>
                <strong>{it.title}</strong>
                <div className="muted">qty: {it.quantity || 1}</div>
              </div>
              <div>{formatCurrency(Number(String(it.price).replace(/[^\d.-]/g, "")) || 0)}</div>
            </div>
          ))}

          <div className="summary-total">
            <div>Subtotal</div>
            <div><strong>{formatCurrency(subtotal)}</strong></div>
          </div>
          <div className="muted">Shipping: —</div>
          <div className="summary-total">
            <div>Total</div>
            <div><strong>{formatCurrency(subtotal)}</strong></div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Checkout;
