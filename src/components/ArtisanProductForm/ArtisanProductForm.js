// src/components/ArtisanProductForm.js
import React, { useEffect, useState } from 'react';

export default function ArtisanProductForm({ token, editing, onSaved }) {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [desc, setDesc] = useState('');

  useEffect(() => {
    if (editing) {
      setTitle(editing.title || '');
      setPrice(editing.price || '');
      setDesc(editing.description || '');
    } else {
      setTitle(''); setPrice(''); setDesc('');
    }
  }, [editing]);

  const submit = async (e) => {
    e.preventDefault();
    const body = { title, price: Number(price), description: desc };
    const url = editing ? `/api/artisan/products/${editing._id}` : '/api/artisan/products';
    const method = editing ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body)
    });
    if (res.ok) {
      onSaved();
    } else {
      const err = await res.json().catch(()=>({message:'unknown'}));
      alert('Error: ' + (err.message || 'failed'));
    }
  };

  return (
    <form onSubmit={submit} style={{ maxWidth: 540 }}>
      <div style={{ marginBottom: 8 }}>
        <label>Title</label><br />
        <input value={title} onChange={e => setTitle(e.target.value)} required style={{ width: '100%' }} />
      </div>
      <div style={{ marginBottom: 8 }}>
        <label>Price</label><br />
        <input type="number" value={price} onChange={e => setPrice(e.target.value)} required style={{ width: '200px' }} />
      </div>
      <div style={{ marginBottom: 8 }}>
        <label>Description</label><br />
        <textarea value={desc} onChange={e => setDesc(e.target.value)} style={{ width: '100%', height: 80 }} />
      </div>
      <button type="submit">{editing ? 'Update' : 'Create'}</button>
    </form>
  );
}
