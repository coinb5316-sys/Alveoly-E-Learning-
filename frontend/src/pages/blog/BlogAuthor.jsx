// src/pages/blog/BlogAuthor.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FaArrowLeft, FaTwitter, FaLinkedin, FaEnvelope, FaGraduationCap } from "react-icons/fa";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import BlogCard from "../../components/blog/BlogCard";
import { posts, authors } from "../../data/blogData";

const BlogAuthor = () => {
  const { id } = useParams();
  const [author, setAuthor] = useState(null);
  const [authorPosts, setAuthorPosts] = useState([]);

  useEffect(() => {
    const found = authors.find((a) => a.id === id);
    if (found) {
      setAuthor(found);
      setAuthorPosts(
        posts
          .filter((p) => p.authorId === found.id)
          .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
      );
    }
    window.scrollTo(0, 0);
  }, [id]);

  if (!author) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-32 pb-20 text-center">
          <h1 className="text-3xl font-bold text-gray-800">Author not found</h1>
          <Link to="/blog" className="text-[#00a3a1] hover:underline mt-4 inline-block">
            Back to Blog
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Author Hero */}
      <section className="pt-32 pb-12 bg-gradient-to-br from-[#0a1628] to-[#0f2847]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6 transition-colors"
          >
            <FaArrowLeft /> Back to Blog
          </Link>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            <img
              src={author.avatar}
              alt={author.name}
              className="w-28 h-28 rounded-full object-cover border-4 border-white/20 shadow-2xl"
            />
            <div className="text-white">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{author.name}</h1>
              <p className="text-[#00a3a1] font-semibold mb-1">{author.role}</p>
              <p className="text-gray-400 text-sm flex items-center justify-center sm:justify-start gap-2 mb-4">
                <FaGraduationCap /> {author.credentials}
              </p>
              <p className="text-gray-300 max-w-2xl leading-relaxed mb-4">
                {author.bio}
              </p>
              <div className="flex items-center justify-center sm:justify-start gap-4">
                {author.social.twitter && (
                  <a
                    href={author.social.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <FaTwitter className="text-lg" />
                  </a>
                )}
                {author.social.linkedin && (
                  <a
                    href={author.social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <FaLinkedin className="text-lg" />
                  </a>
                )}
                {author.social.email && (
                  <a
                    href={`mailto:${author.social.email}`}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <FaEnvelope className="text-lg" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Articles by Author */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
          Articles by {author.name}
        </h2>
        {authorPosts.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <p className="text-gray-500">No articles published yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {authorPosts.map((post, i) => (
              <BlogCard key={post.id} post={post} index={i} />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default BlogAuthor;