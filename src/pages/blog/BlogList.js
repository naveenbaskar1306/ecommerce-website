// src/pages/blog/BlogList.js
import React from "react";
import { Link } from "react-router-dom";
import { blogData } from "../../data/blogData";

export default function BlogList() {
  return (
    <main className="blog-page">
  <div className="blog-hero">
    <h1>All Posts</h1>
    <p>Read our latest tips...</p>
  </div>

  <div className="blog-grid">
    {blogData.map(post => (
      <article className="blog-card" key={post.id}>
        <div className="card-visual">
          <img src={post.cover} alt={post.title} />
        </div>

        <div className="card-body">
          <h3><Link to={`/blog/${post.slug}`}>{post.title}</Link></h3>
          <div className="blog-meta">{post.date} — {post.author}</div>
          <p className="blog-excerpt">{post.excerpt}</p>

          <div className="card-actions">
            <button className="btn btn-gold" onClick={() => window.location = `/blog/${post.slug}`}>Read more</button>
            <Link to={`/blog/${post.slug}`} className="btn btn-ghost">View</Link>
          </div>
        </div>
      </article>
    ))}
  </div>
</main>


  );
}

