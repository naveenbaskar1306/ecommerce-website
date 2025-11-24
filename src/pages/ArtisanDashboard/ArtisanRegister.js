// src/pages/ArtisanRegister/ArtisanRegister.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function ArtisanRegister() {
  const [name, setName] = useState("");
  const [shopName, setShopName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const navigate = useNavigate();

  const validate = () => {
    if (!name.trim()) return "Please enter your full name.";
    if (!email.trim()) return "Please enter an email address.";
    // simple email check
    if (!/^\S+@\S+\.\S+$/.test(email)) return "Invalid email address.";
    if (!password || password.length < 6)
      return "Password must be at least 6 characters.";
    if (password !== confirm) return "Passwords do not match.";
    return null;
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    try {
      setLoading(true);
      const body = {
        name,
        shopName,
        email,
        phone: mobile,
        password,
        role: "artisan", // ensure role sent (your backend may set this)
      };

      const res = await axios.post("/api/auth/artisan/register", body);
      const data = res.data;

      // Expecting success response like { message: 'Artisan registered', user: {...} }
      setInfo(
        data?.message ||
          "Registration successful. You'll be notified after admin approval."
      );

      // Clear sensitive fields
      setPassword("");
      setConfirm("");

      // Redirect to artisan login after short pause
      setTimeout(() => {
        navigate("/artisan-login");
      }, 1400);
    } catch (err) {
      console.error("Artisan register error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Registration failed. Try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          width: 520,
          borderRadius: 12,
          padding: 24,
          boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
          background: "#fff",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Artisan Register</h2>
        <p style={{ color: "#555" }}>
          Create your artisan account. After registering, admin approval is
          required before you can manage your shop.
        </p>

        <form onSubmit={submit}>
          <label style={{ display: "block", marginBottom: 6 }}>Full name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid #ddd",
              marginBottom: 12,
            }}
          />

          <label style={{ display: "block", marginBottom: 6 }}>Shop name</label>
          <input
            type="text"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            placeholder="Optional shop / store name"
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid #ddd",
              marginBottom: 12,
            }}
          />

          <label style={{ display: "block", marginBottom: 6 }}>Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid #ddd",
              marginBottom: 12,
            }}
          />

          <label style={{ display: "block", marginBottom: 6 }}>Phone</label>
          <input
            type="tel"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            placeholder="+91 98765 43210 (optional)"
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid #ddd",
              marginBottom: 12,
            }}
          />

          <label style={{ display: "block", marginBottom: 6 }}>Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Choose a password"
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid #ddd",
              marginBottom: 12,
            }}
          />

          <label style={{ display: "block", marginBottom: 6 }}>
            Confirm password
          </label>
          <input
            type="password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repeat password"
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid #ddd",
              marginBottom: 12,
            }}
          />

          {error && <div style={{ color: "crimson", marginBottom: 12 }}>{error}</div>}
          {info && <div style={{ color: "green", marginBottom: 12 }}>{info}</div>}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: 8,
              border: "none",
              background: "#2b7a78",
              color: "#fff",
              fontWeight: 600,
            }}
          >
            {loading ? "Registering…" : "Create Artisan Account"}
          </button>
        </form>

        <div style={{ marginTop: 12, fontSize: 13 }}>
          <span>Already have an artisan account? </span>
          <a href="/artisan-login">Sign in</a>
        </div>
      </div>
    </div>
  );
}
