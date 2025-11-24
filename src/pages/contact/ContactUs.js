import React, { useState } from "react";

/**
 * ContactUs page
 * - Simple responsive contact form
 * - Replace `submitContact` with a real API call to persist the message
 */

export default function ContactUs() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(null); // null | { ok: true } | { ok: false, error: "..." }

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Please enter your name.";
    if (!form.email.trim()) e.email = "Please enter your email.";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Please enter a valid email.";
    if (form.phone && !/^[\d+\s-]{6,20}$/.test(form.phone)) e.phone = "Please enter a valid phone (or leave empty).";
    if (!form.message.trim() || form.message.trim().length < 10) e.message = "Message must be at least 10 characters.";
    return e;
  };
const handleSubmit = async (ev) => {
  ev.preventDefault();
  setSent(null);
  const e = validate();
  setErrors(e);
  if (Object.keys(e).length) return;

  setLoading(true);
  try {
    const res = await fetch(`${process.env.REACT_APP_API_BASE || ""}/api/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const payload = await res.json();
    if (!res.ok) {
      // show server message
      setSent({ ok: false, error: payload.message || "Failed to send" });
    } else {
      setSent({ ok: true });
      setForm({ name: "", email: "", phone: "", message: "" });
    }
  } catch (err) {
    console.error(err);
    setSent({ ok: false, error: err.message || "Submission failed" });
  } finally {
    setLoading(false);
  }
};

  const change = (k) => (e) => {
    setForm((s) => ({ ...s, [k]: e.target.value }));
    setErrors((s) => ({ ...s, [k]: undefined }));
  };

  return (
    <div style={{ padding: 28, maxWidth: 1000, margin: "0 auto" }}>
      <h1 style={{ fontSize: 32, marginBottom: 6 }}>Contact Us</h1>
      <p style={{ color: "#666", marginBottom: 22 }}>
        Have a question or need help with an order? Fill the form below and our support team will get back to you within 24 hours.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 28 }}>
        {/* Left: Form */}
        <div>
          <form onSubmit={handleSubmit} noValidate>
            <div style={{ display: "grid", gap: 12 }}>
              <label style={{ fontSize: 13, fontWeight: 600 }}>Full name</label>
              <input
                value={form.name}
                onChange={change("name")}
                placeholder="Your full name"
                style={inputStyle(errors.name)}
              />
              {errors.name && <div style={errStyle}>{errors.name}</div>}

              <label style={{ fontSize: 13, fontWeight: 600 }}>Email</label>
              <input
                value={form.email}
                onChange={change("email")}
                placeholder="you@example.com"
                style={inputStyle(errors.email)}
              />
              {errors.email && <div style={errStyle}>{errors.email}</div>}

              <label style={{ fontSize: 13, fontWeight: 600 }}>Phone (optional)</label>
              <input
                value={form.phone}
                onChange={change("phone")}
                placeholder="+91 12345 67890"
                style={inputStyle(errors.phone)}
              />
              {errors.phone && <div style={errStyle}>{errors.phone}</div>}

              <label style={{ fontSize: 13, fontWeight: 600 }}>Message</label>
              <textarea
                value={form.message}
                onChange={change("message")}
                placeholder="Tell us what's up..."
                rows={6}
                style={{ ...inputStyle(errors.message), resize: "vertical", minHeight: 120 }}
              />
              {errors.message && <div style={errStyle}>{errors.message}</div>}

              <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 6 }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    background: "#b58143",
                    color: "#fff",
                    border: "none",
                    padding: "10px 16px",
                    borderRadius: 8,
                    cursor: loading ? "default" : "pointer",
                  }}
                >
                  {loading ? "Sending..." : "Send Message"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setForm({ name: "", email: "", phone: "", message: "" });
                    setErrors({});
                    setSent(null);
                  }}
                  style={{
                    background: "#fff",
                    border: "1px solid #ddd",
                    padding: "10px 14px",
                    borderRadius: 8,
                    cursor: "pointer",
                  }}
                >
                  Reset
                </button>

                {sent && sent.ok && (
                  <div style={{ color: "#2ecc71", fontWeight: 600 }}>Message sent — we'll reply soon.</div>
                )}
                {sent && sent.ok === false && (
                  <div style={{ color: "#c0392b", fontWeight: 600 }}>{sent.error || "Failed to send"}</div>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Right: Info / Info cards */}
        <aside style={{ background: "#fbfbfb", padding: 18, borderRadius: 8, border: "1px solid #f0f0f0" }}>
          <h3 style={{ marginTop: 0 }}>Get in touch</h3>
          <p style={{ color: "#666" }}>
            For order queries: include your order ID. For bulk / corporate enquiries, mention your company name.
          </p>

          <div style={{ marginTop: 12 }}>
            <b>Support Email</b>
            <div style={{ color: "#555", marginTop: 6 }}>support@handmadehub.com</div>
          </div>

          <div style={{ marginTop: 12 }}>
            <b>Phone</b>
            <div style={{ color: "#555", marginTop: 6 }}>+91 XXXXXXXXX</div>
          </div>

          <div style={{ marginTop: 12 }}>
            <b>Hours</b>
            <div style={{ color: "#555", marginTop: 6 }}>Mon—Sat, 9:00 — 18:00 (IST)</div>
          </div>

          <div style={{ marginTop: 18 }}>
            <b>Quick links</b>
            <ul style={{ paddingLeft: 18, marginTop: 8, color: "#555" }}>
              <li><a href="/faq">FAQ</a></li>
              <li><a href="/order-track">Track your order</a></li>
              <li><a href="/returns">Return policy</a></li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* Inline helpers (kept inside file for simplicity) */
const inputStyle = (err) => ({
  padding: "10px 12px",
  borderRadius: 8,
  border: `1px solid ${err ? "#f1a1a1" : "#ddd"}`,
  outline: "none",
  fontSize: 15,
});

const errStyle = {
  color: "#c0392b",
  fontSize: 13,
  marginTop: 4,
};
