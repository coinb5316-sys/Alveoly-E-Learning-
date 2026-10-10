// src/pages/blog/BlogTag.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FaArrowLeft, FaTag } from "react-icons/fa";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import BlogCard from "../../components/blog/BlogCard";
import BlogSidebar from "../../components/blog/BlogSidebar";
import { posts } from "../../data/blogData";

const BlogTag = () => {
  const { tag } = useParams();
  const [tagPosts, setTagPosts] = useState([]);

  useEffect(() => {
    const formattedTag = tag.replace(/-/g, " ").toLowerCase();
    setTagPosts(
      posts.filter((p) =>
        p.tags.some((t) => t.toLowerCase() === formattedTag)
      )
    );
    window.scrollTo(0, 0);
  }, [tag]);

  const displayTag = tag.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="pt-32 pb-12 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#00a3a1] transition-colors mb-6"
          >
            <FaArrowLeft /> Back to Blog
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#00a3a1]/10 flex items-center justify-center">
              <FaTag className="text-[#00a3a1] text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold">Tag</p>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{displayTag}</h1>
            </div>
          </div>
          <p className="text-gray-600 mt-4">
            {tagPosts.length} article{tagPosts.length !== 1 ? "s" : ""} tagged with "{displayTag}"
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {tagPosts.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                <p className="text-gray-500">No articles with this tag yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {tagPosts.map((post, i) => (
                  <BlogCard key={post.id} post={post} index={i} />
                ))}
              </div>
            )}
          </div>
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <BlogSidebar />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BlogTag;