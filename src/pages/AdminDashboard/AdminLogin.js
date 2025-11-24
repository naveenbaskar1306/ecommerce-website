// src/pages/AdminLogin/AdminLogin.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Enter email and password');
      return;
    }

    try {
      setLoading(true);

      // <-- FIXED: call the admin login endpoint (single 'admin' in path)
      const res = await axios.post('/api/admin/login', { email, password });
      const data = res.data;

      if (!data || !data.token) {
        throw new Error('Invalid login response');
      }

      // Save token
      localStorage.setItem('token', data.token);

      // Save user if provided, otherwise try fetching profile
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        try {
          const profile = await axios.get('/api/admin/profile', {
            headers: { Authorization: `Bearer ${data.token}` },
          });
          if (profile?.data?.user) {
            localStorage.setItem('user', JSON.stringify(profile.data.user));
          }
        } catch (pfErr) {
          console.warn('Could not fetch admin profile:', pfErr?.response?.data || pfErr.message);
        }
      }

      const user = JSON.parse(localStorage.getItem('user') || 'null');

      // ensure logged in user is admin
      if (!user || user.role !== 'admin') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setError('This account is not an admin. Use an admin account to continue.');
        setLoading(false);
        return;
      }

      // success -> go to admin dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || err.message || 'Login failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 30, display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: 420, background: '#fff', padding: 20, borderRadius: 8, boxShadow: '0 6px 18px rgba(0,0,0,0.08)' }}>
        <h3>Admin Login</h3>
        <form onSubmit={submit}>
          <label style={{ display: 'block', marginBottom: 6 }}>Email</label>
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            type="email"
            style={{ width: '100%', padding: 10, marginBottom: 12, borderRadius: 4, border: '1px solid #ddd' }}
            placeholder="admin@example.com"
          />

          <label style={{ display: 'block', marginBottom: 6 }}>Password</label>
          <input
            value={password}
            onChange={e => setPassword(e.target.value)}
            type="password"
            style={{ width: '100%', padding: 10, marginBottom: 6, borderRadius: 4, border: '1px solid #ddd' }}
            placeholder="Your password"
          />

          {error && <div style={{ color: 'crimson', marginBottom: 8 }}>{error}</div>}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: 12,
              background: '#f3f3f3',
              border: '2px solid #000',
              borderRadius: 6,
              cursor: 'pointer',
            }}
          >
            {loading ? 'Signing in...' : 'Sign in as Admin'}
          </button>
        </form>
      </div>
    </div>
  );
}
