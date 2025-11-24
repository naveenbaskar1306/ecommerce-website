// src/data/blogData.js
import img1 from '../assest/images/444.png'; 

import img4 from '../assest/images/1.jpg'; 

import img6 from '../assest/images/3.jpg'

import img9 from '../assest/images/6.jpg'; 


export const blogData = [
  {
    id: "1",
    slug: "how-to-choose-handmade-gifts",
    title: "How to Choose Handmade Gifts That Actually Delight",
    excerpt:
      "Not all handmade gifts are created equal — here’s how to pick one that fits the recipient and the occasion.",
    author: "Handmade Hub",
    date: "2025-06-05",
    cover: img1, // add image under public/assets/blog or use existing product images
    content: `
<p>Handmade gifts are special because they carry personality... (example content)</p>
<p>Tips:</p>
<ul>
<li>Think of the person’s hobbies</li>
<li>Choose sustainable materials</li>
<li>Ask the seller about customization</li>
</ul>
`,
  },
  {
    id: "2",
    slug: "care-for-your-handcrafted-jewellery",
    title: "How to Care for Your Handcrafted Jewellery",
    excerpt: "Keep your pieces shining: simple care steps for every kind of handcrafted jewelry.",
    author: "Handmade Hub",
    date: "2025-05-22",
    cover:img6 ,
    content: `<p>Jewellery care depends on material — here are common guidelines...</p>`,
  },
  {
    id: "3",
    slug: "why-buy-local-artisans",
    title: "Why Buying From Local Artisans Matters",
    excerpt: "Support local makers — it’s better for community, environment and you.",
    author: "Handmade Hub",
    date: "2025-04-12",
    cover:img4,
    content: `<p>Buying local keeps money in the community...</p>`,
  },
   {
    id: "4",
    slug: "why-buy-local-artisans",
    title: "Why Buying From Local Artisans Matters",
    excerpt: "Support local makers — it’s better for community, environment and you.",
    author: "Handmade Hub",
    date: "2025-04-12",
    cover: img9,
    content: `<p>Buying local keeps money in the community...</p>`,
  },
];
