// src/components/blog/AuthorBio.jsx
import React from "react";
import { Link } from "react-router-dom";
import { FaTwitter, FaLinkedin, FaEnvelope, FaGraduationCap } from "react-icons/fa";

const AuthorBio = ({ author }) => {
  if (!author) return null;

  return (
    <div className="bg-gray-50 rounded-2xl p-6 md:p-8 my-8 border border-gray-100">
      <div className="flex flex-col sm:flex-row gap-5">
        <img
          src={author.avatar}
          alt={author.name}
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-white shadow-md flex-shrink-0"
        />
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h3 className="text-xl font-bold text-gray-900">{author.name}</h3>
            <span className="text-xs bg-[#00a3a1]/10 text-[#00a3a1] px-2.5 py-1 rounded-full font-medium">
              {author.role}
            </span>
          </div>
          <p className="text-sm text-gray-500 mb-3 flex items-center gap-1.5">
            <FaGraduationCap className="text-gray-400" />
            {author.credentials}
          </p>
          <p className="text-gray-700 text-sm leading-relaxed mb-4">
            {author.bio}
          </p>
          <div className="flex items-center gap-3">
            {author.social.twitter && (
              <a
                href={author.social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-sky-500 transition-colors"
                aria-label="Twitter"
              >
                <FaTwitter />
              </a>
            )}
            {author.social.linkedin && (
              <a
                href={author.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-700 transition-colors"
                aria-label="LinkedIn"
              >
                <FaLinkedin />
              </a>
            )}
            {author.social.email && (
              <a
                href={`mailto:${author.social.email}`}
                className="text-gray-400 hover:text-[#00a3a1] transition-colors"
                aria-label="Email"
              >
                <FaEnvelope />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthorBio;