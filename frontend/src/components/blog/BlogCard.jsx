// src/components/blog/BlogCard.jsx
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaClock, FaEye, FaHeart, FaCheckCircle } from "react-icons/fa";
import { authors } from "../../data/blogData";

const BlogCard = ({ post, variant = "default", index = 0 }) => {
  const author = authors.find((a) => a.id === post.authorId);

  if (variant === "featured") {
    return (
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300"
      >
        <Link to={`/blog/${post.slug}`} className="block">
          <div className="relative h-64 md:h-80 overflow-hidden">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="absolute top-4 left-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-sm text-gray-800 text-xs font-semibold rounded-full">
                <FaCheckCircle className="text-emerald-500 text-xs" />
                Medically Reviewed
              </span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <h3 className="text-xl md:text-2xl font-bold text-white mb-2 line-clamp-2 group-hover:text-[#00a3a1] transition-colors">
                {post.title}
              </h3>
              <p className="text-gray-200 text-sm md:text-base line-clamp-2 mb-4">
                {post.excerpt}
              </p>
              <div className="flex items-center gap-4 text-white/80 text-xs md:text-sm">
                <div className="flex items-center gap-2">
                  <img
                    src={author?.avatar}
                    alt={author?.name}
                    className="w-7 h-7 rounded-full object-cover border border-white/30"
                  />
                  <span className="font-medium">{author?.name}</span>
                </div>
                <span className="flex items-center gap-1">
                  <FaClock className="text-xs" />
                  {post.readingTime} min read
                </span>
              </div>
            </div>
          </div>
        </Link>
      </motion.article>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col"
    >
      <Link to={`/blog/${post.slug}`} className="block relative h-48 overflow-hidden">
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {post.medicallyReviewed && (
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/95 backdrop-blur-sm text-gray-800 text-[10px] font-semibold rounded-full">
              <FaCheckCircle className="text-emerald-500 text-[10px]" />
              Reviewed
            </span>
          </div>
        )}
      </Link>
      <div className="p-5 flex flex-col flex-1">
        <Link to={`/blog/${post.slug}`}>
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#00a3a1] transition-colors">
            {post.title}
          </h3>
        </Link>
        <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-1">
          {post.excerpt}
        </p>
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <img
              src={author?.avatar}
              alt={author?.name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="text-xs">
              <p className="font-medium text-gray-800">{author?.name}</p>
              <p className="text-gray-500">
                {new Date(post.publishedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-gray-400 text-xs">
            <span className="flex items-center gap-1">
              <FaEye /> {post.views?.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <FaHeart /> {post.likes?.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </motion.article>
  );
};

export default BlogCard;