// src/pages/Register/Register.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  function onChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function validate() {
    if (!form.name.trim()) return 'Please enter your name.';
    if (!form.email.trim()) return 'Please enter your email.';
    // basic email check
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return 'Please enter a valid email.';
    if (form.password.length < 6) return 'Password must be at least 6 characters.';
    if (form.password !== form.confirm) return "Passwords don't match.";
    return null;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    const v = validate();
    if (v) { setError(v); return; }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Registration failed.');
        setLoading(false);
        return;
      }
      setSuccessMsg('Account created successfully. Redirecting to login...');
      setTimeout(() => navigate('/'), 1400);
    } catch (err) {
      console.error(err);
      setError('Network error. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="register-page">
      <div className="register-card">
        <h2>Create account</h2>

        <form onSubmit={onSubmit} className="register-form" noValidate>
          <label>
            Full name
            <input name="name" value={form.name} onChange={onChange} required placeholder="Your full name" />
          </label>

          <label>
            Email address
            <input name="email" value={form.email} onChange={onChange} required type="email" placeholder="you@example.com" />
          </label>

          <label>
            Password
            <input name="password" value={form.password} onChange={onChange} required type="password" placeholder="At least 6 characters" />
          </label>

          <label>
            Confirm password
            <input name="confirm" value={form.confirm} onChange={onChange} required type="password" placeholder="Repeat your password" />
          </label>

          {error && <div className="form-error">{error}</div>}
          {successMsg && <div className="form-success">{successMsg}</div>}

          <div className="form-actions">
            <button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create account'}
            </button>
            <button type="button" className="link-button" onClick={() => navigate('/')}>
              Already have an account? Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
