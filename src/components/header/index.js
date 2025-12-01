// src/components/header/index.js
import React, { useState, useEffect, useRef, useLayoutEffect, useCallback } from "react";
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../../assest/images/logo .png';
import CountryDropdown from '../Country Dropdown';

import { FaCartShopping } from "react-icons/fa6";

import SearchBox from './searchbox';
import Navigation from './navigation';

import { useCart } from "../../context/CartContext";

import LoginModal from '../../components/Login/index';
import '../../styles/mobile-fixes.css';


const Header = () => {
  const navigate = useNavigate();

  // layout / state
  const [selectedState, setSelectedState] = useState(null);
  const { cart } = useCart();
  const totalCount = cart.reduce((sum, p) => sum + (p.quantity || 1), 0);

  // login modal
  const [showLogin, setShowLogin] = useState(false);

  // auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  // profile dropdown
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef(null);
  const [dropdownStyle, setDropdownStyle] = useState({ top: 0, left: 0, minWidth: 180 });

  // read localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    let u = null;
    try {
      u = JSON.parse(localStorage.getItem("user"));
    } catch (e) {
      u = null;
    }
    setIsLoggedIn(Boolean(token));
    setUser(u);
  }, []);

  // close profile menu on outside click or Escape
  useEffect(() => {
    const onDocClick = (e) => {
      if (!profileRef.current) return;
      if (!profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    const onEsc = (e) => {
      if (e.key === "Escape") setShowProfileMenu(false);
    };
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  // compute dropdown position when opening
  useLayoutEffect(() => {
    if (showProfileMenu && profileRef.current) {
      const btn = profileRef.current.querySelector('.profile-button');
      if (btn) {
        const rect = btn.getBoundingClientRect();
        const top = rect.bottom + 8;
        const width = 200;
        let left = rect.right - width;
        if (left < 8) left = 8;
        if (left + width > window.innerWidth - 8) left = window.innerWidth - width - 8;
        setDropdownStyle({ top, left, minWidth: width });
      }
    }
  }, [showProfileMenu]);

  // helpers
  const goToCart = () => navigate("/cart");

  // open/close login modal
  const openLogin = () => setShowLogin(true);
  const closeLogin = () => setShowLogin(false);

  // login success handlers (called by modal components)
  const onLoginSuccess = useCallback((userData, token) => {
    try {
      if (token) localStorage.setItem('token', token);
      if (userData) localStorage.setItem('user', JSON.stringify(userData));
    } catch (e) {
      console.warn('Could not store login info in localStorage', e);
    }
    setShowLogin(false);
    setIsLoggedIn(true);
    setUser(userData || null);
  }, []);

  // logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    setShowProfileMenu(false);
    window.location.reload();
  };

  // nav actions from dropdown
  const goToProfile = () => {
    setShowProfileMenu(false);
    navigate('/profile');
  };
  const goToOrders = () => {
    setShowProfileMenu(false);
    navigate('/orders');
  };

  const displayName = (user && (user.name || user.email)) || 'Account';

  // initials + avatar helpers
  const getInitials = (nameOrEmail) => {
    if (!nameOrEmail) return '';
    const words = nameOrEmail.trim().split(/\s+/);
    if (words.length === 1) {
      const single = words[0];
      if (single.includes('@')) {
        return single.charAt(0).toUpperCase();
      }
      return single.charAt(0).toUpperCase();
    }
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  };

  const stringToColor = (str) => {
    if (!str) return '#777';
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    const c = (hash & 0x00ffffff).toString(16).toUpperCase();
    return `#${'00000'.substring(0, 6 - c.length) + c}`;
  };

  return (
    <div className="headerwrapper">
      <header className="header">
        <div className="container">
          <div className="row">

            {/* Logo row - responsive */}
            <div className="logowrapper col-12 col-sm-2 d-flex align-items-center justify-content-center">
              <Link to={'/'} aria-label="Home">
                <img src={Logo} alt='Logo' style={{ maxHeight: 86, width: 'auto' }} />
              </Link>
            </div>

            {/* Header middle: location select, search, actions */}
            <div className='col-12 col-sm-10 d-flex align-items-center part2' style={{ gap: 12, flexWrap: 'wrap' }}>

              {/* location select - will shrink on mobile */}
              <div className="header-left" style={{ minWidth: 160, maxWidth: 420, flex: '0 1 32%' }}>
                <CountryDropdown
                  value={selectedState}
                  onChange={setSelectedState}
                  placeholder="Select Location"
                />
              </div>

              {/* Search box wrapper - fluid */}
              <div className="search-box-wrapper" style={{ flex: '1 1 45%', minWidth: 180 }}>
                <SearchBox />
              </div>

              {/* Right side actions (cart + profile) */}
              <div className='part3 d-flex align-items-center' style={{ gap: 8, flex: '0 1 auto' }}>

                <button
                  type="button"
                  className="circle cart-button"
                  onClick={goToCart}
                  aria-label="Open cart"
                  style={{ marginRight: 8 }}
                >
                  <FaCartShopping />
                  {totalCount > 0 && <span className="cart-badge">{totalCount}</span>}
                </button>

                <div ref={profileRef} style={{ position: 'relative' }}>
                  {!isLoggedIn ? (
                    <button
                      type="button"
                      className='user'
                      onClick={openLogin}
                      title="User login"
                      aria-label="Login"
                      style={{
                        background: '#f3f4f7',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: 18,
                        padding: '8px 10px',
                        borderRadius: 8
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M12 12c2.7 0 4.9-2.2 4.9-4.9S14.7 2.2 12 2.2 7.1 4.4 7.1 7.1 9.3 12 12 12z" fill="#333"/>
                        <path d="M4 20.4c0-3.3 4.8-5.3 8-5.3s8 2 8 5.3v.6H4v-.6z" fill="#333"/>
                      </svg>
                    </button>
                  ) : (
                    <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                      <button
                        className="profile-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowProfileMenu((s) => !s);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '6px 10px',
                          borderRadius: 8,
                          border: '1px solid #ddd',
                          background: '#fff',
                          cursor: 'pointer'
                        }}
                        aria-haspopup="true"
                        aria-expanded={showProfileMenu}
                      >
                        <div
                          aria-hidden
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: '50%',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontWeight: 600,
                            background: stringToColor(displayName)
                          }}
                        >
                          {getInitials(displayName)}
                        </div>
                        <span style={{ marginLeft: 0, fontSize: 14 }}>{displayName}</span>
                      </button>

                      {/* profile dropdown: positioned via computed dropdownStyle */}
                      {showProfileMenu && (
                        <div
                          role="menu"
                          aria-label="Profile menu"
                          style={{
                            position: 'fixed',
                            top: dropdownStyle.top,
                            left: dropdownStyle.left,
                            minWidth: dropdownStyle.minWidth,
                            background: '#fff',
                            border: '1px solid #e6e6e6',
                            boxShadow: '0 8px 28px rgba(0,0,0,0.12)',
                            borderRadius: 8,
                            zIndex: 3000,
                            overflow: 'hidden'
                          }}
                        >
                          <button
                            onClick={goToProfile}
                            style={{
                              display: 'block',
                              width: '100%',
                              padding: '10px 12px',
                              textAlign: 'left',
                              border: 'none',
                              background: 'transparent',
                              cursor: 'pointer'
                            }}
                          >
                            Profile
                          </button>

                          <div style={{ height: 1, background: '#f2f2f2' }} />
                          <button
                            onClick={handleLogout}
                            style={{
                              display: 'block',
                              width: '100%',
                              padding: '10px 12px',
                              textAlign: 'left',
                              border: 'none',
                              background: 'transparent',
                              cursor: 'pointer',
                              color: '#d9534f'
                            }}
                          >
                            Logout
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation component (keeps your original behavior) */}
      <Navigation />

      {/* customer login modal */}
      {showLogin && <LoginModal onClose={closeLogin} onSuccess={onLoginSuccess} />}

    </div>
  );
};

export default Header;
