// FeaturedSlider.jsx
import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import axios from "axios";
import { Link } from "react-router-dom";
import Button from "../Buttons/Buynow";



import { API_BASE } from "../../config/api";

export default function FeaturedSlider({ limit = 8 }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchFeatured = async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/api/products?featured=true&limit=${limit}`
        );
        if (mounted) setProducts(res.data || []);
      } catch (err) {
        console.error("Failed to fetch featured products", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchFeatured();
    return () => (mounted = false);
  }, [limit]);

  const settings = {
    dots: true,
    infinite: products.length > 4,
    speed: 700,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3500,
    pauseOnHover: true,
    arrows: true,
    responsive: [
      { breakpoint: 1200, settings: { slidesToShow: 3 } },
      { breakpoint: 900, settings: { slidesToShow: 2 } },
      { breakpoint: 560, settings: { slidesToShow: 1 } },
    ],
  };

  if (loading) return <div className="featured-loading">Loading featured products…</div>;
  if (!products.length)
    return (
      <section className="featured-section">
        <div className="content-width">
          <h2>Featured</h2>
          <p>No products to show.</p>
        </div>
      </section>
    );

  const buildImage = (imgPath) => {
    if (!imgPath) return "";
    if (imgPath.startsWith("http")) return imgPath;
    return `${API_BASE}${imgPath}`;
  };

  return (
    <section className="featured-section">
      <div className="content-width">
        <h2 className="featured-title">Featured Handmade Products</h2>

        <div className="featured-slider">
          <Slider {...settings}>
            {products.map((p) => (
              <div key={p._id} className="featured-slide">
                <article className="featured-card">
                  <div className="featured-media">
                    <img
                      src={buildImage(p.image)}
                      alt={p.name}
                      onError={(e) => (e.currentTarget.src = "/placeholder-400x300.png")}
                    />
                  </div>

                  <div className="featured-body">
                    <div>
                      <h3 className="featured-name">{p.name}</h3>
                      <p className="featured-desc">{p.description || ""}</p>
                    </div>

                    <div className="featured-footer">
                      <div className="featured-price">₹{p.price}</div>

                      {/* Use react-router Link so the SPA router loads the product page */}
                      <Link to={`/product/${p._id}`} >
                    <Button />  
                      </Link>
                    </div>
                  </div>
                </article>
              </div>
            ))}
          </Slider>
        </div>
      </div>

      <style>{`
        .buy-now-btn {
          background: #c08457;
          color: #fff;
          padding: 6px 14px;
          border-radius: 8px;
          font-size: 14px;
          text-decoration: none;
          display: inline-block;
          margin-top: 8px;
          transition: 0.2s;
        }
        .buy-now-btn:hover { background: #a06a43; }
        .featured-footer { display:flex; align-items:center; justify-content:space-between; gap:12px; }
        .featured-price { font-weight:700; color:#6b3b1f; }
      `}</style>
    </section>
  );
}
