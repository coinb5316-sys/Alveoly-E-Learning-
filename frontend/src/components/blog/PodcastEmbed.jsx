// src/components/blog/PodcastEmbed.jsx
import React, { useState, useRef, useEffect } from "react";
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaPodcast } from "react-icons/fa";

const PodcastEmbed = ({ podcast }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState("0:00");
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      const p = (audio.currentTime / audio.duration) * 100;
      setProgress(p || 0);
      const mins = Math.floor(audio.currentTime / 60);
      const secs = Math.floor(audio.currentTime % 60);
      setCurrentTime(`${mins}:${String(secs).padStart(2, "0")}`);
    };

    audio.addEventListener("timeupdate", updateProgress);
    return () => audio.removeEventListener("timeupdate", updateProgress);
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;
    audioRef.current.currentTime = pct * audioRef.current.duration;
  };

  return (
    <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-xl my-8">
      <div className="flex flex-col sm:flex-row">
        <div className="sm:w-48 h-48 sm:h-auto flex-shrink-0 relative">
          <img
            src={podcast.image}
            alt={podcast.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center sm:hidden">
            <button
              onClick={togglePlay}
              className="w-14 h-14 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-gray-900 shadow-lg"
            >
              {isPlaying ? <FaPause /> : <FaPlay className="ml-1" />}
            </button>
          </div>
        </div>
        <div className="flex-1 p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <FaPodcast className="text-[#00a3a1]" />
            <span className="text-xs font-semibold text-[#00a3a1] uppercase tracking-wide">
              Episode {podcast.episodeNumber}
            </span>
          </div>
          <h3 className="text-lg font-bold mb-1">{podcast.title}</h3>
          <p className="text-gray-400 text-sm mb-4 line-clamp-2">
            {podcast.description}
          </p>

          <div className="flex items-center gap-4">
            <button
              onClick={togglePlay}
              className="hidden sm:flex w-12 h-12 rounded-full bg-[#00a3a1] hover:bg-[#008b89] items-center justify-center text-white transition-colors flex-shrink-0"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <FaPause /> : <FaPlay className="ml-0.5" />}
            </button>

            <div className="flex-1">
              <div
                className="h-1.5 bg-gray-700 rounded-full cursor-pointer relative group"
                onClick={handleSeek}
              >
                <div
                  className="h-full bg-[#00a3a1] rounded-full relative transition-all"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>{currentTime}</span>
                <span>{podcast.duration}</span>
              </div>
            </div>

            <button
              onClick={toggleMute}
              className="text-gray-400 hover:text-white transition-colors"
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
            </button>
          </div>
        </div>
      </div>
      <audio ref={audioRef} src={podcast.audioUrl} preload="metadata" />
    </div>
  );
};

export default PodcastEmbed;