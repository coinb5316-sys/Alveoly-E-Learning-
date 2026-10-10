// src/pages/blog/BlogPodcasts.jsx
import React from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaPodcast } from "react-icons/fa";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import PodcastEmbed from "../../components/blog/PodcastEmbed";
import { podcasts } from "../../data/blogData";

const BlogPodcasts = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="pt-32 pb-12 bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-6"
          >
            <FaArrowLeft /> Back to Blog
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#00a3a1] flex items-center justify-center">
              <FaPodcast className="text-white text-xl" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              The Alveoly Health Podcast
            </h1>
          </div>
          <p className="text-gray-300 text-lg">
            Conversations with clinicians, researchers, and public health experts
            on the topics that matter most.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {podcasts.map((podcast) => (
            <PodcastEmbed key={podcast.id} podcast={podcast} />
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BlogPodcasts;