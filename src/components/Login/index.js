import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from "../Buttons/login";
import Createaccount from "../Buttons/createaccount";
import Checkbox from "../Buttons/checkbox";

// ✅ Centralized API import
import { API_BASE } from "../../config/api";

export default function LoginModal({ onClose }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide email and password.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Login failed');
        setLoading(false);
        return;
      }

      // store token
      if (data.token) {
        localStorage.setItem('token', data.token);
      }

      // store user info
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      setSuccess(true);

      setTimeout(() => {
        setSuccess(false);
        if (onClose) onClose();
        navigate('/');
      }, 1400);

    } catch (err) {
      console.error(err);
      setError('Network error. Please try again.');
      setLoading(false);
    }
  }

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="login-modal" role="dialog" aria-modal="true">
        <button className="modal-close" onClick={onClose}>&times;</button>

        <h2 className="modal-title">Sign in</h2>

        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            Email address
            <input
              type="email"
              placeholder="your email id@.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <div className="login-row">
            <label className="remember">
              <Checkbox />
            </label>

            <Button />
          </div>

          {error && <div className="form-error">{error}</div>}
        </form>

        <div className="login-footer">
          <button
            onClick={() => {
              onClose && onClose();
              navigate('/register');
            }}
          >
            <Createaccount />
          </button>
        </div>

        {success && (
          <div className="success-popup">
            <div className="success-inner">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <circle
                  cx="12"
                  cy="12"
                  r="11"
                  stroke="#2ecc71"
                  strokeWidth="2"
                  fill="rgba(46,204,113,0.08)"
                />
                <path
                  d="M7 13l3 3 7-7"
                  stroke="#2ecc71"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="success-text">Login successful</div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
