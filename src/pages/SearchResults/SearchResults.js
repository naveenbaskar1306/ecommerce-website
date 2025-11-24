import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

/**
 * SearchResults page
 * - Reads `q` from query string
 * - Fetches /api/products (using your existing endpoint)
 * - Filters client-side and shows paginated results
 *
 * Place at: src/pages/SearchResults.jsx
 */

const ProductCard = ({ p }) => {
  const title = p.title || p.name || "Untitled";
  const price = p.price ?? p?.amount ?? "—";
  const img = (p.images && p.images[0] && p.images[0].url) || p.image || "/placeholder.png";

  return (
    <div
      style={{
        width: 260,
        borderRadius: 12,
        overflow: "hidden",
        margin: 10,
        background: "#fff",
        boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
      }}
    >
      <div style={{ width: "100%", height: 160, overflow: "hidden" }}>
        <img src={img} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div style={{ padding: 12 }}>
        <div style={{ fontWeight: 700, fontSize: 16 }}>{title}</div>
        <div style={{ color: "#666", marginTop: 6 }}>₹{price}</div>
      </div>
    </div>
  );
};

function matchesQuery(product, q) {
  if (!q) return true;
  const s = q.trim().toLowerCase();
  // adapt to your product fields; checks title/name/description/category/tags
  const hay = [
    product.title || "",
    product.name || "",
    product.description || "",
    product.category || "",
    (product.tags && product.tags.join(" ")) || "",
  ]
    .join(" ")
    .toLowerCase();
  return hay.includes(s);
}

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q") || "";
  const [allProducts, setAllProducts] = useState(null); // null = not loaded yet
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);

  // pagination
  const [page, setPage] = useState(1);
  const LIMIT = 12;

  // navigation (optional: clicking a product could navigate to product page)
  const navigate = useNavigate();

  // load products once (cached in memory)
  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/products"); // uses your existing endpoint
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        // backend may return { products: [...] } or an array; handle both
        const arr = Array.isArray(data) ? data : data.products || data.data || [];
        if (mounted) setAllProducts(arr);
      } catch (err) {
        console.error("SearchResults fetch error:", err);
        if (mounted) setAllProducts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    if (allProducts === null) load();
    return () => {
      mounted = false;
    };
  }, [allProducts]);

  // filter when q or allProducts change
  useEffect(() => {
    if (!allProducts) return;
    const results = allProducts.filter((p) => matchesQuery(p, q));
    setFiltered(results);
    setPage(1); // reset to first page when query changes
  }, [allProducts, q]);

  // derived pagination
  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / LIMIT));
  const visible = filtered.slice((page - 1) * LIMIT, page * LIMIT);

  return (
    <div style={{ padding: "40px 60px" }}>
      <h2 style={{ marginBottom: 8 }}>Search results {q ? <>for &ldquo;{q}&rdquo;</> : null}</h2>

      {loading && <div>Loading products…</div>}

      {!loading && allProducts && total === 0 && (
        <div style={{ marginTop: 20 }}>No products found. Try a different keyword.</div>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", marginTop: 20 }}>
        {visible.map((p) => (
          <div
            key={p._id || p.id || Math.random()}
            onClick={() => {
              // try to navigate to product page if your app has one, e.g. /product/:id
              if (p._id) navigate(`/product/${p._id}`);
            }}
            style={{ cursor: "pointer" }}
          >
            <ProductCard p={p} />
          </div>
        ))}
      </div>

      {pages > 1 && (
        <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 12 }}>
          <button disabled={page <= 1} onClick={() => setPage((s) => Math.max(1, s - 1))}>
            Prev
          </button>
          <div>
            Page {page} / {pages} — {total} result{total !== 1 ? "s" : ""}
          </div>
          <button disabled={page >= pages} onClick={() => setPage((s) => Math.min(pages, s + 1))}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}
