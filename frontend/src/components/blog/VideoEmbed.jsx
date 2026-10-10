// src/components/blog/VideoEmbed.jsx
import React, { useState } from "react";
import { FaPlay } from "react-icons/fa";

const VideoEmbed = ({ video }) => {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="my-8 rounded-2xl overflow-hidden shadow-xl bg-black">
      <div className="relative aspect-video">
        {!playing ? (
          <>
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <button
                onClick={() => setPlaying(true)}
                className="w-20 h-20 rounded-full bg-white/95 backdrop-blur flex items-center justify-center text-[#00a3a1] shadow-2xl hover:scale-110 transition-transform"
                aria-label="Play video"
              >
                <FaPlay className="text-2xl ml-1" />
              </button>
            </div>
          </>
        ) : (
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&rel=0`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
      </div>
      <div className="p-5 bg-white">
        <h3 className="font-bold text-gray-900 mb-1">{video.title}</h3>
        <p className="text-sm text-gray-500">{video.description}</p>
      </div>
    </div>
  );
};

export default VideoEmbed;