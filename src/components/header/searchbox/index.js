// index.js  (replace your current SearchBox file with this)
import React, { useEffect, useRef, useState } from "react";
import Button from "@mui/material/Button";
import { FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";


const MAX_SUGGESTIONS = 6;
export default function SearchBox() {
  const [query, setQuery] = useState("");
  const [allProducts, setAllProducts] = useState(null); // null = not loaded
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const debounceRef = useRef(null);

  // Load products once (cached)
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch("/api/products");
        if (!res.ok) throw new Error("Failed to load products");
        const data = await res.json();
        // backend might return { products: [...] } or an array
        const arr = Array.isArray(data) ? data : data.products || data.data || [];
        if (mounted) setAllProducts(arr);
      } catch (err) {
        console.error("SearchBox: cannot load products", err);
        if (mounted) setAllProducts([]);
      }
    }
    if (allProducts === null) load();
    return () => { mounted = false; }
  }, [allProducts]);

  // Close suggestions on outside click
  useEffect(() => {
    function onDoc(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  // produce suggestions when query changes (debounced)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      if (!query || !allProducts) {
        setSuggestions([]);
        setOpen(false);
        setActiveIndex(-1);
        return;
      }
      const q = query.trim().toLowerCase();
      const results = allProducts.filter(p => {
        const hay = [
          p.title || "",
          p.name || "",
          p.description || "",
          p.category || "",
          (p.tags && p.tags.join(" ")) || ""
        ].join(" ").toLowerCase();
        return hay.includes(q);
      }).slice(0, MAX_SUGGESTIONS);
      setSuggestions(results);
      setOpen(results.length > 0);
      setActiveIndex(-1);
    }, 180);
    return () => clearTimeout(debounceRef.current)
  }, [query, allProducts]);

  const goToSearchPage = (term) => {
    const trimmed = (term || "").trim();
    if (!trimmed) return;
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    setOpen(false);
  };

  const handleSelectSuggestion = (p) => {
    // if product has an id/_id, go to product page; otherwise do search
    const id = p._id || p.id;
    if (id) {
      navigate(`/product/${id}`);
    } else {
      goToSearchPage(p.title || p.name || "");
    }
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (!open) {
      if (e.key === "Enter") {
        goToSearchPage(query);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const sel = activeIndex >= 0 ? suggestions[activeIndex] : null;
      if (sel) handleSelectSuggestion(sel);
      else goToSearchPage(query);
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  return (
    <div ref={containerRef} className="headersearch ml-3 mr-3" style={{ position: "relative", display: "flex", alignItems: "center" }}>
      <input
        ref={inputRef}
        type="text"
        placeholder="Search For Product"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={onKeyDown}
        onFocus={() => { if (suggestions.length) setOpen(true) }}
        aria-autocomplete="list"
        aria-expanded={open}
        aria-activedescendant={activeIndex >= 0 ? `sugg-${activeIndex}` : undefined}
        style={{
          width: "520px",
          padding: "14px 18px",
          borderRadius: "12px",
          border: "1px solid #e6e6e6",
          background: "#f6f7fb",
          outline: "none",
        }}
      />
      <Button
        onClick={() => goToSearchPage(query)}
        style={{ marginLeft: 8 }}
        aria-label="Search"
      >
        <FaSearch />
      </Button>

      {/* Suggestions dropdown */}
      {open && suggestions.length > 0 && (
        <div
          role="listbox"
          aria-label="Search suggestions"
          style={{
            position: "absolute",
            top: "54px",
            left: 0,
            width: 560,
            background: "#fff",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            borderRadius: 10,
            zIndex: 1200,
            maxHeight: 320,
            overflow: "auto",
            padding: 8
          }}
        >
          {suggestions.map((p, idx) => {
            const title = p.title || p.name || "Untitled";
            const subtitle = (p.category || p.description || "").slice(0, 80);
            const img = (p.images && p.images[0] && p.images[0].url) || p.image || null;
            const isActive = idx === activeIndex;
            return (
              <div
                id={`sugg-${idx}`}
                key={p._id || p.id || idx}
                role="option"
                aria-selected={isActive}
                onMouseDown={(ev) => {
                  // onMouseDown prevents input blur before click handler
                  ev.preventDefault();
                  handleSelectSuggestion(p);
                }}
                onMouseEnter={() => setActiveIndex(idx)}
                style={{
                  display: "flex",
                  gap: 10,
                  padding: "8px",
                  borderRadius: 8,
                  alignItems: "center",
                  background: isActive ? "rgba(0,0,0,0.04)" : "transparent",
                  cursor: "pointer"
                }}
              >
                {img ? (
                  <img src={img} alt={title} style={{ width: 56, height: 44, objectFit: "cover", borderRadius: 6 }} />
                ) : (
                  <div style={{ width: 56, height: 44, borderRadius: 6, background: "#f0f0f0" }} />
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>{title}</div>
                  <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>{subtitle}</div>
                </div>
                <div style={{ color: "#222", fontWeight: 700 }}>{p.price ? `₹${p.price}` : ""}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
