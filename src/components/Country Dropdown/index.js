// src/components/CountryDropdown/index.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const CountryDropdown = ({
  value,
  onChange,
  placeholder = "Select state / region",
}) => {
  const [states, setStates] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchStates() {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:5000/api/states");
        if (!cancelled) {
          setStates(res.data);
          setFiltered(res.data);
          setLoading(false);
          console.log("✅ Loaded states from backend:", res.data.length);
        }
      } catch (error) {
        console.error("Failed to fetch states:", error);
        if (!cancelled) {
          setErr("Failed to fetch states — using minimal fallback.");
          const fallback = [
            { id: "andhra_pradesh", name: "Andhra Pradesh" },
            { id: "assam", name: "Assam" },
            { id: "delhi", name: "Delhi" },
            { id: "karnataka", name: "Karnataka" },
            { id: "maharashtra", name: "Maharashtra" },
          ];
          setStates(fallback);
          setFiltered(fallback);
          setLoading(false);
        }
      }
    }

    fetchStates();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q) setFiltered(states);
    else setFiltered(states.filter((s) => s.name.toLowerCase().includes(q)));
  }, [query, states]);

  const handleSelect = (s) => {
    setOpen(false);
    setQuery("");
    onChange && onChange(s);
  };

  return (
    <div className="country-dropdown-root">
      <label className="country-label">{placeholder}</label>
      <div
        className="country-trigger"
        role="button"
        tabIndex={0}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setOpen((v) => !v);
        }}
        aria-expanded={open}
      >
        <div className="country-selected">
          {(value && value.name) || "Select state / region"}
        </div>
        <div className="country-caret">▾</div>
      </div>

      <div
        className={`country-popover ${open ? "open" : ""}`}
        role="dialog"
        aria-hidden={!open}
      >
        {loading ? (
          <div className="country-loading">Loading states…</div>
        ) : (
          <>
            <input
              className="country-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search state..."
            />
            <div className="country-list" role="listbox">
              {filtered.length === 0 ? (
                <div className="country-empty">No states found</div>
              ) : (
                filtered.map((s) => (
                  <button
                    type="button"
                    key={s._id || s.id}
                    className="country-item"
                    onClick={() => handleSelect(s)}
                  >
                    {s.name}
                  </button>
                ))
              )}
            </div>
            {err && <div className="country-error">{err}</div>}
          </>
        )}
      </div>
    </div>
  );
};

export default CountryDropdown;
