// src/utils/makeImageUrl.js
import { API_BASE } from '../config/api'; // adjust path if needed

export default function makeImageUrl(src) {
  if (!src) return '/placeholder-product.png';
  const s = String(src).trim();
  if (!s) return '/placeholder-product.png';
  if (/^https?:\/\//i.test(s)) return s;                 // absolute URL
  if (s.startsWith('//')) return window.location.protocol + s; // protocol-less
  // backend path already absolute on server
  if (s.startsWith('/uploads') || s.startsWith('/')) return `${API_BASE}${s}`;
  // plain filename: assume uploads folder
  return `${API_BASE}/uploads/${s}`;
}
