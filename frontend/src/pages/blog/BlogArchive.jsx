// src/pages/blog/BlogArchive.jsx
import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaCalendarAlt, FaChevronDown, FaChevronUp } from "react-icons/fa";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { posts, authors } from "../../data/blogData";

const BlogArchive = () => {
  const [expandedMonth, setExpandedMonth] = useState(null);

  const groupedPosts = useMemo(() => {
    const groups = {};
    posts.forEach((post) => {
      const date = new Date(post.publishedAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(post);
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, []);

  const formatMonth = (key) => {
    const [year, month] = key.split("-");
    return new Date(year, month - 1).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="pt-32 pb-12 bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#00a3a1] transition-colors mb-6"
          >
            <FaArrowLeft /> Back to Blog
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#00a3a1]/10 flex items-center justify-center">
              <FaCalendarAlt className="text-[#00a3a1] text-xl" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Article Archive</h1>
          </div>
          <p className="text-gray-600">
            Browse all {posts.length} articles by publication date.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-4">
          {groupedPosts.map(([key, monthPosts]) => {
            const isExpanded = expandedMonth === key;
            return (
              <div key={key} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <button
                  onClick={() => setExpandedMonth(isExpanded ? null : key)}
                  className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-[#00a3a1]/10 flex items-center justify-center text-[#00a3a1] font-bold text-sm">
                      {monthPosts.length}
                    </span>
                    <span className="font-semibold text-gray-900">{formatMonth(key)}</span>
                  </div>
                  {isExpanded ? (
                    <FaChevronUp className="text-gray-400" />
                  ) : (
                    <FaChevronDown className="text-gray-400" />
                  )}
                </button>
                {isExpanded && (
                  <div className="border-t border-gray-100 divide-y divide-gray-50">
                    {monthPosts.map((post) => {
                      const author = authors.find((a) => a.id === post.authorId);
                      return (
                        <Link
                          key={post.id}
                          to={`/blog/${post.slug}`}
                          className="flex items-start gap-4 p-5 hover:bg-gray-50 transition-colors group"
                        >
                          <img
                            src={post.image}
                            alt={post.title}
                            className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                            loading="lazy"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 group-hover:text-[#00a3a1] transition-colors line-clamp-2 mb-1">
                              {post.title}
                            </h3>
                            <p className="text-sm text-gray-500 line-clamp-1">{post.excerpt}</p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                              <span>{author?.name}</span>
                              <span>·</span>
                              <span>
                                {new Date(post.publishedAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                              <span>·</span>
                              <span>{post.readingTime} min read</span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BlogArchive;