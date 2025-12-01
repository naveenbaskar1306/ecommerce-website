// frontend/src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../../config/api";


export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [artisans, setArtisans] = useState([]);
  const [error, setError] = useState("");
  const [loadingArtisans, setLoadingArtisans] = useState(false);
  const navigate = useNavigate();

  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token") || "";
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // helper to always return an array
  const normalizeArtisans = (raw) => {
    if (Array.isArray(raw)) return raw;
    if (raw && Array.isArray(raw.artisans)) return raw.artisans;
    if (raw && Array.isArray(raw.data)) return raw.data;
    return [];
  };

  useEffect(() => {
    async function loadAll() {
      try {
        const tokenHeaders = getAuthHeaders();
        // load summary + artisans
        const [summaryRes, artisansRes] = await Promise.all([
          axios.get(`${API_BASE}/api/admin/summary`, { headers: tokenHeaders }),
          axios.get(`${API_BASE}/api/admin/artisans`, { headers: tokenHeaders }),
        ]);

        setSummary(summaryRes.data);
        // ✅ normalize before setting
        setArtisans(normalizeArtisans(artisansRes.data));
      } catch (err) {
        console.error("admin load error", err?.response || err);
        setError("Unable to fetch admin data. Are you logged in as admin?");
      }
    }
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Logout: clear token and redirect to admin login
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/admin-login");
  };

  // Approve artisan
  const handleApprove = async (id) => {
    if (!window.confirm("Approve this artisan?")) return;
    try {
      const headers = getAuthHeaders();
      await axios.put(
        `${API_BASE}/api/admin/artisan/${id}/approve`,
        {},
        { headers }
      );
      // optimistic update
      setArtisans((prev) =>
        prev.map((a) => (a._id === id ? { ...a, isApproved: true } : a))
      );
    } catch (err) {
      console.error("approve error", err?.response || err);
      alert("Failed to approve artisan.");
    }
  };

  // Delete artisan
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this artisan? This cannot be undone.")) return;
    try {
      const headers = getAuthHeaders();
      await axios.delete(`${API_BASE}/api/admin/artisan/${id}`, { headers });
      setArtisans((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      console.error("delete error", err?.response || err);
      alert("Failed to delete artisan.");
    }
  };

  return (
    <div style={{ padding: 32 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>Admin Dashboard</h1>
        <div>
          <button
            onClick={handleLogout}
            style={{
              background: "#d9534f",
              color: "white",
              border: "none",
              padding: "8px 14px",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {error && (
        <div style={{ color: "crimson", marginTop: 16 }}>{error}</div>
      )}

      {summary ? (
        <div style={{ display: "flex", gap: 24, marginTop: 24 }}>
          <div
            style={{
              padding: 16,
              borderRadius: 8,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            <h3>Total Users</h3>
            <div style={{ fontSize: 22 }}>{summary.usersCount}</div>
          </div>
          <div
            style={{
              padding: 16,
              borderRadius: 8,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            <h3>Total Products</h3>
            <div style={{ fontSize: 22 }}>{summary.productsCount}</div>
          </div>
          <div
            style={{
              padding: 16,
              borderRadius: 8,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            <h3>Total Orders</h3>
            <div style={{ fontSize: 22 }}>{summary.ordersCount}</div>
          </div>
        </div>
      ) : !error ? (
        <div style={{ marginTop: 24 }}>Loading...</div>
      ) : null}

      <section style={{ marginTop: 40 }}>
        <h2>Artisans</h2>

        <div style={{ marginTop: 12 }}>
          <button
            onClick={async () => {
              setLoadingArtisans(true);
              try {
                const headers = getAuthHeaders();
                const res = await axios.get(
                  `${API_BASE}/api/admin/artisans`,
                  { headers }
                );
                // ✅ normalize on reload too
                setArtisans(normalizeArtisans(res.data));
              } catch (err) {
                console.error("reload artisans", err?.response || err);
                alert("Failed to reload artisans.");
              } finally {
                setLoadingArtisans(false);
              }
            }}
            style={{ marginBottom: 12 }}
          >
            Reload artisans
          </button>

          {loadingArtisans && (
            <span style={{ marginLeft: 12 }}>Loading...</span>
          )}
        </div>

        {(!Array.isArray(artisans) || artisans.length === 0) ? (
          <div style={{ marginTop: 12 }}>No artisans found.</div>
        ) : (
          <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
            {artisans.map((a) => (
              <div
                key={a._id}
                style={{
                  padding: 12,
                  borderRadius: 8,
                  border: "1px solid #eee",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>
                    {a.name || a.email}
                  </div>
                  <div style={{ color: "#666", fontSize: 13 }}>
                    {a.email}
                  </div>
                  <div style={{ marginTop: 6, fontSize: 13 }}>
                    Status:{" "}
                    {a.isApproved ? (
                      <span style={{ color: "green" }}>Approved</span>
                    ) : (
                      <span style={{ color: "crimson" }}>Pending</span>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  {!a.isApproved && (
                    <button
                      onClick={() => handleApprove(a._id)}
                      style={{
                        background: "#28a745",
                        color: "white",
                        border: "none",
                        padding: "8px 12px",
                        borderRadius: 6,
                        cursor: "pointer",
                      }}
                    >
                      Approve
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(a._id)}
                    style={{
                      background: "#d9534f",
                      color: "white",
                      border: "none",
                      padding: "8px 12px",
                      borderRadius: 6,
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
