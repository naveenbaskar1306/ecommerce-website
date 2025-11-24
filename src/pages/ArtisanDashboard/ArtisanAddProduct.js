// src/pages/ArtisanDashboard/ArtisanAddProduct.js
import React, { useState } from "react";
import axios from "axios";

export default function ArtisanAddProduct() {
  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    featured: false,
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState("");

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleCheckbox = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.checked }));

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    setImageFile(file);
    if (file) setPreview(URL.createObjectURL(file));
    else setPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Saving...");
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("price", form.price);
      fd.append("description", form.description);
      fd.append("category", form.category);
      // append featured explicitly as string so backend can parse
      fd.append("featured", form.featured ? "true" : "false");
      if (imageFile) fd.append("image", imageFile);

      const res = await axios.post(
        "http://localhost:5000/api/artisan/products",
        fd,
        {
          withCredentials: true, // only if you use cookies/auth
        }
      );

      setMessage("✅ Product added successfully.");
      setForm({ name: "", price: "", description: "", category: "", featured: false });
      setImageFile(null);
      setPreview(null);
      // optional: you can refresh the artisan product list or redirect
    } catch (err) {
      console.error("Add product error:", err);
      const serverMsg = err?.response?.data?.message || err.message;
      setMessage(`❌ Failed to add product. ${serverMsg}`);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: 800 }}>
      <h2>Add Product</h2>

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="mb-3">
          <label className="form-label">Product Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Price</label>
          <input
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="form-control"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Category</label>
          <input
            name="category"
            value={form.category}
            onChange={handleChange}
            className="form-control"
          />
        </div>

        <div className="mb-3 form-check">
          <input
            id="featured"
            type="checkbox"
            name="featured"
            checked={form.featured}
            onChange={handleCheckbox}
            className="form-check-input"
          />
          <label htmlFor="featured" className="form-check-label">
            Feature this product (show in slider)
          </label>
        </div>

        <div className="mb-3">
          <label className="form-label">Image (upload file)</label>
          <input
            name="image"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="form-control"
          />
        </div>

        {preview && (
          <div style={{ margin: "12px 0" }}>
            <strong>Preview:</strong>
            <div style={{ marginTop: 8 }}>
              <img
                src={preview}
                alt="preview"
                style={{ maxWidth: 240, maxHeight: 240, borderRadius: 8 }}
              />
            </div>
          </div>
        )}

        <button className="btn  btn-success" type="submit" >
          Save Product
        </button>
      </form>

      {message && <p className="mt-3">{message}</p>}
    </div>
  );
}
