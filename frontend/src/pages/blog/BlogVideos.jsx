// src/pages/blog/BlogVideos.jsx
import React from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaVideo } from "react-icons/fa";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import VideoEmbed from "../../components/blog/VideoEmbed";
import { videos } from "../../data/blogData";

const BlogVideos = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="pt-32 pb-12 bg-gradient-to-br from-[#0a1628] to-[#0f2847]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-6"
          >
            <FaArrowLeft /> Back to Blog
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#00a3a1] flex items-center justify-center">
              <FaVideo className="text-white text-xl" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Video Library
            </h1>
          </div>
          <p className="text-gray-300 text-lg">
            Watch practical, evidence-based health guides from our clinical team.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {videos.map((video) => (
            <VideoEmbed key={video.id} video={video} />
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BlogVideos;