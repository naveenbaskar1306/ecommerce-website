// src/components/footer/footer.js
import React from "react";

import { useNavigate } from "react-router-dom";
import Social from "../Buttons/social";

const Footer = () => {
  const navigate = useNavigate();

const handleArtisanClick = () => {
  const token = localStorage.getItem("token");

  if (token) {
    navigate("/artisan-dashboard");
  } else {
    navigate("/artisan-login");  // open login PAGE only
  }
};
const handleadminloginClick = () => {
  const token = localStorage.getItem("token");

  if (token) {
    navigate("/admin-dashboard");
  } else {
    navigate("/admin-login");  // open login PAGE only
  }
};


  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Left Section */}
        <div className="footer-section about">
          <h2>Handmade Hub</h2>
          <p>
            Discover unique, hand-crafted items made with love. Supporting small
            artisans and bringing creativity to your doorstep.
          </p>
          <div className="socials">
        <Social/>

            <button
              onClick={handleArtisanClick}
              style={{
                marginLeft: "1rem",
                fontWeight: "500",
                background: "transparent",
                border: "none",
                color: "inherit",
                cursor: "pointer",
                padding: 0,
                fontSize: "1rem",
              }}
            >
              Artisan Login
            </button>

              <button
              onClick={handleadminloginClick}
              style={{
                marginLeft: "1rem",
                fontWeight: "500",
                background: "transparent",
                border: "none",
                color: "inherit",
                cursor: "pointer",
                padding: 0,
                fontSize: "1rem",
              }}
            >
              Admin Login
            </button>
          </div>
        </div>

        {/* Middle Section */}
        <div className="footer-section links">
          <h3>Quick Links</h3>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/product">Products</a></li>
            <li><a href="/gift">Gifts</a></li>
            <li><a href="/blog">Blog</a></li>
            <li><a href="/contact">Contact Us</a></li>
          </ul>
        </div>

        {/* Right Section */}
        <div className="footer-section contact">
          <h3>Contact Info</h3>
          <p>Email: support@handmadehub.com</p>
          <p>Phone: +91 xxxxxxxxx</p>
          <p>Location: Chennai, India</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Handmade Hub — All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
