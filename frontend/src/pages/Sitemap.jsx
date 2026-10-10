// src/pages/Sitemap.jsx
import React from "react";
import { Link } from "react-router-dom";
import { FaSitemap, FaArrowLeft } from "react-icons/fa";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { posts, categories, authors } from "../data/blogData";

const Sitemap = () => {
  const sections = [
    {
      title: "Main Pages",
      links: [
        { name: "Home", path: "/" },
        { name: "About", path: "/about" },
        { name: "Programs", path: "/programs" },
        { name: "Admissions", path: "/admissions" },
        { name: "Pricing", path: "/pricing" },
        { name: "Contact", path: "/contact_us" },
      ],
    },
    {
      title: "Blog",
      links: [
        { name: "Blog Home", path: "/blog" },
        { name: "Podcasts", path: "/blog/podcasts" },
        { name: "Videos", path: "/blog/videos" },
        { name: "Archive", path: "/blog/archive" },
      ],
    },
    {
      title: "Legal & Policies",
      links: [
        { name: "Privacy Policy", path: "/privacy" },
        { name: "Terms of Service", path: "/terms" },
        { name: "Disclaimer", path: "/disclaimer" },
        { name: "Cookie Policy", path: "/cookies" },
        { name: "Editorial Policy", path: "/editorial-policy" },
        { name: "Advertising Policy", path: "/advertising-policy" },
        { name: "Medical Review Policy", path: "/medical-review-policy" },
      ],
    },
    {
      title: "Careers",
      links: [
        { name: "Careers Home", path: "/careers" },
        { name: "What We Do", path: "/careers/what-we-do" },
        { name: "Life at Alveoly", path: "/careers/life-at-alveoly" },
        { name: "Benefits", path: "/careers/benefits" },
        { name: "Open Roles", path: "/careers/jobs" },
      ],
    },
    {
      title: "Programs",
      links: [
        { name: "Medical", path: "/medical" },
        { name: "Nursing", path: "/nursing" },
        { name: "Pharmacy", path: "/pharmacy" },
        { name: "Accounting", path: "/accounting" },
        { name: "Finance", path: "/finance" },
        { name: "High School", path: "/high-school" },
        { name: "Grad School", path: "/grad-school" },
        { name: "Legal", path: "/legal" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="pt-32 pb-12 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#00a3a1] transition-colors mb-6"
          >
            <FaArrowLeft /> Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#00a3a1]/10 flex items-center justify-center">
              <FaSitemap className="text-[#00a3a1] text-xl" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Sitemap</h1>
          </div>
          <p className="text-gray-600">
            A complete index of all pages on Alveoly.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {sections.map((section) => (
            <div key={section.title} className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                {section.title}
              </h2>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="text-sm text-gray-600 hover:text-[#00a3a1] transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Blog Categories */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
            Blog Categories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/blog?category=${cat.id}`}
                className="text-sm text-gray-600 hover:text-[#00a3a1] transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>

        {/* All Articles */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
            All Blog Articles
          </h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {posts.map((post) => (
              <li key={post.id}>
                <Link
                  to={`/blog/${post.slug}`}
                  className="text-sm text-gray-600 hover:text-[#00a3a1] transition-colors line-clamp-1"
                >
                  {post.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Authors */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
            Our Authors
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {authors.map((author) => (
              <Link
                key={author.id}
                to={`/blog/author/${author.id}`}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <img
                  src={author.avatar}
                  alt={author.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{author.name}</p>
                  <p className="text-xs text-gray-500">{author.role}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Sitemap;