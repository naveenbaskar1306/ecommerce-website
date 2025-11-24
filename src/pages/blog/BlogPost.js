// src/pages/blog/BlogPost.js
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { blogData } from "../../data/blogData";

export default function BlogPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const post = blogData.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div style={{ padding: 28 }}>
        <h2>Post not found</h2>
        <button onClick={() => navigate("/blog")} style={backBtn}>Back to posts</button>
      </div>
    );
  }

  return (
   <div className="blog-post">
  <button className="post-back" onClick={() => navigate('/blog')}>← Back to posts</button>
  <h1 className="post-title">{post.title}</h1>
  <div className="post-meta">{post.date} — {post.author}</div>
  <div className="post-cover"><img src={post.cover} alt="cover" /></div>
  <div className="post-content" dangerouslySetInnerHTML={{__html: post.content}} />
</div>

  );
}

const backBtn = {
  background: "transparent",
  border: "none",
  color: "#0b63d6",
  padding: 0,
  cursor: "pointer",
  fontSize: 15,
};
