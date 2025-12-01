// src/pages/Profile/index.jsx
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

/*
  Uses backend endpoints that already exist in your project:
    GET  /api/auth/me                    -> returns { user: { ... } }
    GET  /api/orders/lookup?query=<q>    -> returns an order object (lookup by email or orderId)
    PUT  /api/users/me                    -> (optional) update profile
    POST /api/users/change-password       -> (optional) change password

  If your backend uses slightly different paths, update the URLs below.
*/

import { API_BASE } from "../../config/api";

// small helpers
const rupee = (v) =>
  v == null ? "—" : `₹${Number(v).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const getInitials = (nameOrEmail) => {
  if (!nameOrEmail) return "";
  const parts = nameOrEmail.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const stringToColor = (str) => {
  if (!str) return "#777";
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  const c = (hash & 0x00ffffff).toString(16).toUpperCase();
  return `#${"00000".substring(0, 6 - c.length) + c}`;
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(false);
  const [orders, setOrders] = useState([]); // array of order objects
  const [loadingOrders, setLoadingOrders] = useState(false);

  const [editing, setEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", phone: "", address: "" });

  // change password modal state
  const [pwOld, setPwOld] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");

  // search/order lookup
  const [searchQ, setSearchQ] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  // fetch user info
  const fetchUser = useCallback(async () => {
    if (!token) {
      setUser(null);
      return;
    }
    setLoadingUser(true);
    try {
      const res = await axios.get(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const fetchedUser = res.data && (res.data.user || res.data);
      setUser(fetchedUser);
      // populate local form
      setProfileForm({
        name: fetchedUser?.name || "",
        phone: fetchedUser?.phone || fetchedUser?.mobile || "",
        address: fetchedUser?.address || "",
      });
      // sync localStorage
      try { localStorage.setItem("user", JSON.stringify(fetchedUser)); } catch (e) {}
    } catch (err) {
      console.error("fetchUser err", err?.response || err);
      // fallback to localStorage user if present
      try {
        const ls = localStorage.getItem("user");
        if (ls) setUser(JSON.parse(ls));
      } catch (e) {}
    } finally {
      setLoadingUser(false);
    }
  }, [token]);

  // fetch orders for the user (lookup by email). The orders lookup route returns a single matched order object;
  // this code handles both arrays and objects, and stores multiple orders if API returns them.
  const fetchOrdersForUser = useCallback(
    async (email) => {
      if (!email) return;
      setLoadingOrders(true);
      try {
        const res = await axios.get(`${API_BASE}/api/orders/lookup`, {
          params: { query: email },
        });
        const data = res.data;
        // If API returns array, use it; if it returns single order object, wrap it in array.
        if (Array.isArray(data)) setOrders(data);
        else if (data && data.items) setOrders([data]);
        else setOrders([]);
      } catch (err) {
        console.error("fetchOrders err", err?.response || err);
        // empty list on error so UI still usable
        setOrders([]);
      } finally {
        setLoadingOrders(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (user?.email) fetchOrdersForUser(user.email);
  }, [user, fetchOrdersForUser]);

  // Save profile (PUT to backend if available, and sync localStorage)
  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      // optimistic local update
      const updated = { ...user, ...profileForm };
      setUser(updated);
      localStorage.setItem("user", JSON.stringify(updated));

      // send to backend if token present
      if (token) {
        await axios.put(
          `${API_BASE}/api/users/me`,
          { name: profileForm.name, phone: profileForm.phone, address: profileForm.address },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      setEditing(false);
      alert("Profile saved.");
    } catch (err) {
      console.error("saveProfile err", err?.response || err);
      alert("Failed to save profile. Check console.");
    }
  };

  // change password (simple flow)
  const changePassword = async () => {
    if (!pwNew || pwNew.length < 6) {
      setPwError("New password must be at least 6 characters.");
      return;
    }
    setPwError("");
    setPwLoading(true);
    try {
      if (!token) throw new Error("Not authenticated");
      // attempt backend call (adjust path if your API differs)
      const res = await axios.post(
        `${API_BASE}/api/users/change-password`,
        { oldPassword: pwOld, newPassword: pwNew },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data?.message || "Password changed.");
      setPwOld("");
      setPwNew("");
    } catch (err) {
      console.error("changePassword err", err?.response || err);
      setPwError(err?.response?.data?.message || "Failed to change password.");
    } finally {
      setPwLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  // manual order search (by orderId or email)
  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!searchQ) return;
    setSearchError("");
    setSearchLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/orders/lookup`, { params: { query: searchQ } });
      const data = res.data;
      if (Array.isArray(data)) setOrders(data);
      else if (data && data.items) setOrders([data]);
      else setOrders([]);
    } catch (err) {
      console.error("order search err", err?.response || err);
      setSearchError(err?.response?.data?.message || "Order not found.");
    } finally {
      setSearchLoading(false);
    }
  };

  if (!token && !user) {
    return (
      <main className="container" style={{ padding: 36 }}>
        <h2>Profile</h2>
        <p>You are not logged in. Please <button onClick={() => navigate("/login")}>login</button>.</p>
      </main>
    );
  }

  return (
    <main className="container profile-page" style={{ padding: "36px 24px 80px" }}>
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* LEFT: Profile Card */}
        <aside style={{ minWidth: 280, flex: "0 0 320px" }}>
          <div className="profile-card" style={{ padding: 18 }}>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <div
                style={{
                  width: 92,
                  height: 92,
                  borderRadius: 18,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 28,
                  background: stringToColor(user?.name || user?.email || ""),
                }}
              >
                {getInitials(user?.name || user?.email || "")}
              </div>

              <div style={{ flex: 1 }}>
                <h2 style={{ margin: 0 }}>{user?.name || user?.email}</h2>
                <div style={{ color: "#6b7280", marginTop: 6 }}>{user?.email}</div>
                <div style={{ marginTop: 10 }}>
                  <button className="btn btn-ghost" onClick={() => setEditing((s) => !s)} style={{ marginRight: 8 }}>
                    {editing ? "Cancel" : "Edit profile"}
                  </button>
                  <button className="btn btn-ghost" onClick={() => { setPwOld(""); setPwNew(""); setPwError(""); }}>
                    Change password
                  </button>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 18 }}>
              <h4 style={{ margin: "8px 0" }}>Contact</h4>
              <div style={{ color: "#374151" }}>{user?.phone || "—"}</div>

              <div style={{ marginTop: 12 }}>
                <h4 style={{ margin: "8px 0" }}>Address</h4>
                <div style={{ color: "#374151" }}>{user?.address || "No address saved"}</div>
              </div>
            </div>

            <div style={{ marginTop: 18 }}>
              <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
            </div>
          </div>
        </aside>

        {/* RIGHT: Account details + Orders */}
        <section style={{ flex: 1, minWidth: 360 }}>
          <div className="card" style={{ padding: 18 }}>
            <h3 style={{ marginTop: 0 }}>Account details</h3>

            {editing ? (
              <form onSubmit={saveProfile} style={{ display: "grid", gap: 12 }}>
                <label>
                  <div style={{ fontSize: 14, marginBottom: 6 }}>Full name</div>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))}
                    required
                  />
                </label>

                <label>
                  <div style={{ fontSize: 14, marginBottom: 6 }}>Phone</div>
                  <input
                    type="text"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))}
                  />
                </label>

                <label>
                  <div style={{ fontSize: 14, marginBottom: 6 }}>Address</div>
                  <textarea
                    value={profileForm.address}
                    onChange={(e) => setProfileForm((f) => ({ ...f, address: e.target.value }))}
                    rows={3}
                  />
                </label>

                <div style={{ display: "flex", gap: 8 }}>
                  <button type="submit" className="btn btn-primary">Save</button>
                  <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
                </div>
              </form>
            ) : (
              <>
                <div style={{ color: "#374151" }}>
                  <p><strong>Name:</strong> {user?.name || "—"}</p>
                  <p><strong>Phone:</strong> {user?.phone || "—"}</p>
                  <p><strong>Address:</strong> {user?.address || "—"}</p>
                </div>
              </>
            )}
          </div>

          <div className="card" style={{ marginTop: 18, padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0 }}>Orders</h3>

              <form onSubmit={handleSearch} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  placeholder="Search Order ID or email"
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #e6e6e9" }}
                />
                <button type="submit" className="btn btn-ghost" disabled={searchLoading}>
                  {searchLoading ? "Searching..." : "Search"}
                </button>
              </form>
            </div>

            <div style={{ marginTop: 12 }}>
              {loadingOrders ? (
                <p>Loading orders…</p>
              ) : orders.length === 0 ? (
                <p>No orders found. {user?.email ? "We searched using your email." : null}</p>
              ) : (
                <div style={{ display: "grid", gap: 12 }}>
                  {orders.map((order, i) => (
                    <OrderCard key={order.orderId || order.id || i} order={order} />
                  ))}
                </div>
              )}

              {searchError && <div style={{ color: "crimson", marginTop: 8 }}>{searchError}</div>}
            </div>
          </div>

          {/* change password UI (inline small modal-like area) */}
          <div className="card" style={{ marginTop: 18, padding: 18 }}>
            <h3 style={{ marginTop: 0 }}>Change password</h3>
            <div style={{ display: "grid", gap: 8, maxWidth: 420 }}>
              <input
                type="password"
                placeholder="Current password"
                value={pwOld}
                onChange={(e) => setPwOld(e.target.value)}
              />
              <input
                type="password"
                placeholder="New password (min 6 chars)"
                value={pwNew}
                onChange={(e) => setPwNew(e.target.value)}
              />
              {pwError && <div style={{ color: "crimson" }}>{pwError}</div>}
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-primary" onClick={changePassword} disabled={pwLoading}>
                  {pwLoading ? "Saving…" : "Save new password"}
                </button>
                <button className="btn btn-ghost" onClick={() => { setPwOld(""); setPwNew(""); setPwError(""); }}>
                  Clear
                </button>
              </div>
            </div>
          </div>

        </section>
      </div>
    </main>
  );
}

/* small Order card component inside same file */
function OrderCard({ order }) {
  // order may come with 'items' array and subtotal, statusIndex, placedAt fields
  const orderId = order.orderId || order.id || order._id || order.id;
  const placed = order.placedAt || order.createdAt || order.date;
  const status = order.status || (order.statusIndex === 0 ? "Processing" : "Delivered");
  const items = order.items || [];
  const subtotal = order.subtotal ?? items.reduce((s, it) => s + (Number(it.price || it.unitPrice || 0) * (it.qty || it.quantity || 1)), 0);
  return (
    <div style={{ borderRadius: 10, padding: 12, background: "#fff", border: "1px solid #f1f1f3" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{ fontWeight: 700 }}>{orderId}</div>
          <div style={{ color: "#6b7280", fontSize: 13 }}>{status} · {new Date(placed).toLocaleDateString()}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontWeight: 700 }}>{rupee(subtotal)}</div>
          <div style={{ color: "#6b7280", fontSize: 13 }}>{items.length} items</div>
        </div>
      </div>

      <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
        {items.map((it, idx) => (
          <div key={idx} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            <div style={{ color: "#374151" }}>{it.title || it.name || it.productTitle}</div>
            <div style={{ color: "#374151" }}>{it.qty || it.quantity || 1} × {rupee(it.price || it.unitPrice || 0)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
