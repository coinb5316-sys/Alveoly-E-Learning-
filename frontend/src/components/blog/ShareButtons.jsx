// src/components/blog/ShareButtons.jsx
import React from "react";
import {
  FaFacebook, FaTwitter, FaLinkedin, FaWhatsapp,
  FaLink, FaEnvelope,
} from "react-icons/fa";
import toast from "react-hot-toast";

const ShareButtons = ({ title, url }) => {
  const shareUrl = url || window.location.href;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied to clipboard!");
  };

  const buttons = [
    {
      name: "Facebook",
      icon: FaFacebook,
      color: "hover:bg-blue-600",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: "Twitter",
      icon: FaTwitter,
      color: "hover:bg-sky-500",
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: "LinkedIn",
      icon: FaLinkedin,
      color: "hover:bg-blue-700",
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: "WhatsApp",
      icon: FaWhatsapp,
      color: "hover:bg-green-500",
      url: `https://wa.me/?text=${encodeURIComponent(title + " " + shareUrl)}`,
    },
    {
      name: "Email",
      icon: FaEnvelope,
      color: "hover:bg-gray-700",
      url: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(shareUrl)}`,
    },
  ];

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="text-sm font-semibold text-gray-700 mr-2">Share:</span>
      {buttons.map((btn) => (
        <a
          key={btn.name}
          href={btn.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:text-white ${btn.color} transition-all duration-300`}
          aria-label={`Share on ${btn.name}`}
        >
          <btn.icon />
        </a>
      ))}
      <button
        onClick={handleCopy}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-[#00a3a1] hover:text-white transition-all duration-300"
        aria-label="Copy link"
      >
        <FaLink />
      </button>
    </div>
  );
};

export default ShareButtons;