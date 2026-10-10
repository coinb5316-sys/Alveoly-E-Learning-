// src/pages/blog/BlogPost.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaClock, FaEye, FaHeart, FaCheckCircle, FaUserMd,
  FaCalendarAlt, FaTag, FaArrowLeft, FaShare,
  FaBookmark, FaPrint,
} from "react-icons/fa";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import TableOfContents from "../../components/blog/TableOfContents";
import ShareButtons from "../../components/blog/ShareButtons";
import AuthorBio from "../../components/blog/AuthorBio";
import RelatedPosts from "../../components/blog/RelatedPosts";
import CommentSection from "../../components/blog/CommentSection";
import NewsletterSignup from "../../components/blog/NewsletterSignup";
import { posts, authors, categories } from "../../data/blogData";

const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const found = posts.find((p) => p.slug === slug);
    if (found) {
      setPost(found);
      window.scrollTo(0, 0);
    } else {
      navigate("/blog");
    }
  }, [slug, navigate]);

  useEffect(() => {
    const handleScroll = () => {
      const total = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = (window.scrollY / total) * 100;
      setScrollProgress(progress);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!post) return null;

  const author = authors.find((a) => a.id === post.authorId);
  const reviewer = authors.find((a) => a.id === post.reviewedBy);
  const category = categories.find((c) => c.id === post.categoryId);

  // Add IDs to headings for TOC
  const contentWithIds = post.content.replace(
    /<h([23])>(.*?)<\/h\1>/g,
    (match, level, text) => {
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      return `<h${level} id="${id}">${text}</h${level}>`;
    }
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Reading progress bar */}
      <div className="fixed top-0 left-0 w-full h-1 z-[60] bg-transparent">
        <div
          className="h-full bg-gradient-to-r from-[#00a3a1] to-[#007a78] transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <Navbar />

      {/* Article Header */}
      <header className="pt-32 pb-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#00a3a1] transition-colors mb-6"
          >
            <FaArrowLeft /> Back to Blog
          </Link>

          <div className="flex flex-wrap items-center gap-3 mb-4">
            {category && (
              <Link
                to={`/blog?category=${category.id}`}
                className={`inline-block px-3 py-1 bg-gradient-to-r ${category.color} text-white text-xs font-semibold rounded-full`}
              >
                {category.name}
              </Link>
            )}
            {post.medicallyReviewed && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full">
                <FaCheckCircle /> Medically Reviewed
              </span>
            )}
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight mb-4"
          >
            {post.title}
          </motion.h1>

          <p className="text-lg md:text-xl text-gray-600 mb-6 leading-relaxed">
            {post.excerpt}
          </p>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 md:gap-6 pb-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <img
                src={author?.avatar}
                alt={author?.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow"
              />
              <div>
                <p className="font-semibold text-gray-900 text-sm">{author?.name}</p>
                <p className="text-xs text-gray-500">{author?.credentials}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <FaCalendarAlt className="text-xs" />
                {new Date(post.publishedAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span className="flex items-center gap-1.5">
                <FaClock className="text-xs" />
                {post.readingTime} min read
              </span>
              <span className="flex items-center gap-1.5">
                <FaEye className="text-xs" />
                {post.views?.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 mt-6">
            <ShareButtons title={post.title} />
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLiked(!liked)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  liked
                    ? "bg-rose-50 text-rose-600"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <FaHeart /> {post.likes + (liked ? 1 : 0)}
              </button>
              <button
                onClick={() => setSaved(!saved)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  saved
                    ? "bg-[#00a3a1]/10 text-[#00a3a1]"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <FaBookmark /> {saved ? "Saved" : "Save"}
              </button>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
              >
                <FaPrint />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Featured Image */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 mb-8">
        <motion.img
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          src={post.image}
          alt={post.title}
          className="w-full h-64 md:h-96 object-cover rounded-2xl shadow-xl"
        />
        <p className="text-xs text-gray-400 mt-2 text-center italic">
          {post.title} — Image: Unsplash
        </p>
      </div>

      {/* Article Body */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <TableOfContents content={contentWithIds} />

        {/* Medical Review Banner */}
        {post.medicallyReviewed && reviewer && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 my-8 flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <FaUserMd className="text-emerald-600 text-xl" />
            </div>
            <div>
              <p className="font-semibold text-emerald-800 text-sm mb-1">
                Medically reviewed by {reviewer.name}, {reviewer.credentials}
              </p>
              <p className="text-emerald-700 text-xs">
                Last reviewed on{" "}
                {new Date(post.updatedAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        )}

        {/* Content */}
        <div
          className="prose prose-lg max-w-none
            prose-headings:font-bold prose-headings:text-gray-900
            prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-4
            prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
            prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-5
            prose-a:text-[#00a3a1] prose-a:no-underline hover:prose-a:underline
            prose-ul:my-4 prose-ol:my-4 prose-li:text-gray-700 prose-li:mb-2
            prose-blockquote:border-l-4 prose-blockquote:border-[#00a3a1] prose-blockquote:bg-gray-50 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-xl prose-blockquote:italic prose-blockquote:text-gray-700
            prose-strong:text-gray-900
            prose-img:rounded-2xl prose-img:shadow-lg
          "
          dangerouslySetInnerHTML={{ __html: contentWithIds }}
        />

        {/* Tags */}
        <div className="mt-12 pt-8 border-t border-gray-100">
          <div className="flex items-center gap-2 flex-wrap">
            <FaTag className="text-gray-400" />
            {post.tags.map((tag) => (
              <Link
                key={tag}
                to={`/blog/tag/${tag.toLowerCase().replace(/\s+/g, "-")}`}
                className="px-3 py-1.5 bg-gray-100 hover:bg-[#00a3a1] hover:text-white text-gray-700 text-sm rounded-full transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>

        {/* Author Bio */}
        <AuthorBio author={author} />

        {/* Newsletter */}
        <NewsletterSignup />

        {/* Related */}
        <RelatedPosts currentPostId={post.id} categoryId={post.categoryId} />

        {/* Comments */}
        <CommentSection />
      </article>

      <Footer />
    </div>
  );
};

export default BlogPost;