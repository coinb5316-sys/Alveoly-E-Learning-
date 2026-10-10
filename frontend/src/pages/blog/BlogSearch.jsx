// src/pages/blog/BlogSearch.jsx
import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { FaSearch, FaArrowLeft } from "react-icons/fa";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import BlogCard from "../../components/blog/BlogCard";
import { posts } from "../../data/blogData";

const BlogSearch = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState([]);
  const [searchInput, setSearchInput] = useState(query);

  useEffect(() => {
    if (query) {
      const q = query.toLowerCase();
      setResults(
        posts.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.excerpt.toLowerCase().includes(q) ||
            p.tags.some((t) => t.toLowerCase().includes(q))
        )
      );
    } else {
      setResults([]);
    }
    window.scrollTo(0, 0);
  }, [query]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      window.location.href = `/blog/search?q=${encodeURIComponent(searchInput.trim())}`;
    }
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
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Search Articles
          </h1>
          <form onSubmit={handleSearch} className="relative max-w-2xl">
            <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search health topics..."
              className="w-full pl-14 pr-32 py-4 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#00a3a1] text-gray-900"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#00a3a1] hover:bg-[#008b89] text-white px-6 py-2.5 rounded-full font-semibold transition-colors"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-gray-600 mb-6">
          {results.length} result{results.length !== 1 ? "s" : ""} for{" "}
          <strong className="text-gray-900">"{query}"</strong>
        </p>
        {results.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <FaSearch className="text-4xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">No results found</h3>
            <p className="text-gray-500 mb-6">
              Try different keywords or browse by category.
            </p>
            <Link
              to="/blog"
              className="inline-block bg-[#00a3a1] hover:bg-[#008b89] text-white px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              Browse All Articles
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((post, i) => (
              <BlogCard key={post.id} post={post} index={i} />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default BlogSearch;