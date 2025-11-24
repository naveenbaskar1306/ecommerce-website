// src/pages/ArtisanLogin/ArtisanLogin.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function ArtisanLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);
     const res = await axios.post("/api/auth/artisan/login", { email, password });

      const data = res.data;

      // Expecting { token, user } from your backend
      if (!data || !data.token) {
        setError("Invalid response from server.");
        return;
      }

      const user = data.user || null;

      if (!user) {
        // If backend doesn't send user, try fetch /api/auth/me (optional)
        try {
          const me = await axios.get("/api/auth/me", {
            headers: { Authorization: `Bearer ${data.token}` },
          });
          if (me?.data?.user) {
            // use me.data.user
            if (me.data.user.role !== "artisan") {
              setError("This account is not registered as an artisan.");
              return;
            }
            if (me.data.user.isApproved === false) {
              setError("Your artisan account is pending admin approval.");
              return;
            }
            // All good — store token & user
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(me.data.user));
            navigate("/artisan-dashboard");
            return;
          }
        } catch (err) {
          console.error("Failed to fetch profile after login:", err);
        }
        setError("Unable to verify user role. Contact support.");
        return;
      }

      // If backend returned user object with role/isApproved:
      if (user.role !== "artisan") {
        setError("This account is not registered as an artisan. Use the regular login.");
        return;
      }

      if (user.isApproved === false) {
        setError("Your artisan account is pending admin approval. You will be notified when approved.");
        return;
      }

      // Success: store token and user then go to artisan dashboard
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(user));

      // small delay to show success briefly
      setInfo("Login successful! Redirecting to your dashboard...");
      setTimeout(() => navigate("/artisan-dashboard"), 250);
    } catch (err) {
      console.error("ArtisanLogin error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Login failed. Check credentials and try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24, display: "flex", justifyContent: "center" }}>
      <div style={{ width: 460, borderRadius: 12, padding: 24, boxShadow: "0 8px 30px rgba(0,0,0,0.08)", background: "#fff" }}>
        <h2 style={{ marginTop: 0 }}>Artisan Login</h2>
        <p style={{ color: "#555" }}>Sign in with your artisan account to manage your shop.</p>

        <form onSubmit={submit}>
          <label style={{ display: "block", marginBottom: 6 }}>Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="artisan@example.com"
            style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd", marginBottom: 12 }}
          />

          <label style={{ display: "block", marginBottom: 6 }}>Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd", marginBottom: 12 }}
          />

          {error && <div style={{ color: "crimson", marginBottom: 12 }}>{error}</div>}
          {info && <div style={{ color: "green", marginBottom: 12 }}>{info}</div>}

          <button
            type="submit"
            disabled={loading}
            style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "none", background: "#2b7a78", color: "#fff", fontWeight: 600 }}
          >
            {loading ? "Signing in…" : "Sign in as Artisan"}
          </button>
        </form>

        <div style={{ marginTop: 12, fontSize: 13 }}>
          <span>Don't have an artisan account? </span>
          <a href="/artisan-register">Register</a>
        </div>
      </div>
    </div>
  );
}
