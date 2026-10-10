// src/components/blog/RelatedPosts.jsx
import React from "react";
import { Link } from "react-router-dom";
import { FaClock } from "react-icons/fa";
import { posts, authors } from "../../data/blogData";

const RelatedPosts = ({ currentPostId, categoryId }) => {
  const related = posts
    .filter((p) => p.id !== currentPostId && p.categoryId === categoryId)
    .slice(0, 3);

  const fallback = posts
    .filter((p) => p.id !== currentPostId)
    .slice(0, 3);

  const displayPosts = related.length > 0 ? related : fallback;

  if (displayPosts.length === 0) return null;

  return (
    <section className="my-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {displayPosts.map((post) => {
          const author = authors.find((a) => a.id === post.authorId);
          return (
            <Link
              key={post.id}
              to={`/blog/${post.slug}`}
              className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
            >
              <div className="relative h-40 overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-900 line-clamp-2 group-hover:text-[#00a3a1] transition-colors mb-2">
                  {post.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <img
                    src={author?.avatar}
                    alt={author?.name}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                  <span>{author?.name}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <FaClock className="text-[10px]" />
                    {post.readingTime} min
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default RelatedPosts;