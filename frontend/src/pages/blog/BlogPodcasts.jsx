// src/pages/blog/BlogPodcasts.jsx — THE ALVEOLY JOURNAL PODCAST (LIVE API)
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaArrowLeft, FaPlay, FaPause, FaClock, FaHome, FaSearch,
  FaChevronDown, FaMicrophone, FaStream, FaTag, FaTwitter,
  FaLinkedin, FaInstagram, FaYoutube, FaRss, FaVideo, FaBookOpen,
  FaCheckCircle, FaHeadphones,
} from "react-icons/fa";
import { publicBlogAPI as blogAPI } from "../../api/blogApi";

/* ============================================================
   UTILITIES
============================================================ */

const formatShortDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

const durationToSeconds = (str) => {
  if (!str) return 0;
  const parts = String(str).split(":").map((x) => parseInt(x, 10));
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
};

const secondsToLabel = (s) => {
  if (!s) return "0 min";
  const mins = Math.round(s / 60);
  return `${mins} min`;
};

/* Pull the URL of the first image out of a post, if any. */
const postImage = (p) => p.image || p.featuredImage || "";

/* ============================================================
   PRIMITIVES
============================================================ */

const SectionLabel = ({ icon: Icon, children }) => (
  <p className="text-xs uppercase tracking-widest text-rose-600 dark:text-rose-400 font-semibold mb-3 flex items-center gap-2">
    {Icon && <Icon className="text-xs" />}
    {children}
  </p>
);

const JournalNav = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const links = [
    { to: "/blog", label: "Home" },
    { to: "/blog/archive", label: "Archive" },
    { to: "/blog/podcasts", label: "Podcasts", active: true },
    { to: "/blog/videos", label: "Videos" },
    { to: "/blog/search", label: "Search" },
    { to: "/sitemap", label: "Sitemap" },
  ];

  return (
    <nav className="border-b border-stone-200 dark:border-stone-800 bg-white/85 dark:bg-stone-950/85 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-5">
        <div className="h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition text-sm flex items-center gap-2"
            >
              <FaHome className="text-xs" />
              <span className="hidden sm:inline">Alveoly</span>
            </Link>
            <span className="text-stone-300 dark:text-stone-700">/</span>
            <Link
              to="/blog"
              className="font-serif text-lg font-bold tracking-tight text-stone-900 dark:text-stone-50"
            >
              The Journal
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`px-3 py-2 rounded-full text-sm font-medium transition ${
                  l.active
                    ? "text-stone-900 dark:text-stone-100 bg-stone-100 dark:bg-stone-900"
                    : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-900"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/blog/search"
              className="ml-2 inline-flex items-center justify-center w-9 h-9 rounded-full border border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400 hover:border-stone-900 dark:hover:border-stone-100 hover:text-stone-900 dark:hover:text-stone-100 transition"
              title="Search"
            >
              <FaSearch className="text-xs" />
            </Link>
          </div>

          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="md:hidden inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-900 transition"
          >
            Menu
            <FaChevronDown
              className={`text-[10px] transition-transform ${
                mobileOpen ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden border-t border-stone-200 dark:border-stone-800"
            >
              <div className="py-3 flex flex-col">
                {links.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setMobileOpen(false)}
                    className={`px-2 py-2.5 text-sm font-medium transition ${
                      l.active
                        ? "text-stone-900 dark:text-stone-100"
                        : "text-stone-700 dark:text-stone-300"
                    }`}
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

const JournalFooter = () => {
  const policyLinks = [
    { to: "/editorial-policy", label: "Editorial Policy" },
    { to: "/medical-review-policy", label: "Medical Review Policy" },
    { to: "/advertising-policy", label: "Advertising Policy" },
  ];
  const contentLinks = [
    { to: "/blog", label: "All articles" },
    { to: "/blog/archive", label: "Archive" },
    { to: "/blog/podcasts", label: "Podcasts" },
    { to: "/blog/videos", label: "Videos" },
    { to: "/blog/search", label: "Search" },
    { to: "/sitemap", label: "Sitemap" },
  ];
  const socials = [
    { icon: FaTwitter, href: "https://twitter.com/alveoly", label: "Twitter" },
    { icon: FaInstagram, href: "https://instagram.com/alveoly", label: "Instagram" },
    { icon: FaYoutube, href: "https://youtube.com/@alveoly", label: "YouTube" },
    { icon: FaLinkedin, href: "https://linkedin.com/company/alveoly", label: "LinkedIn" },
    { icon: FaRss, href: "/blog/rss", label: "RSS" },
  ];

  return (
    <footer className="border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950">
      <div className="max-w-6xl mx-auto px-5 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <Link
              to="/blog"
              className="font-serif text-xl font-bold text-stone-900 dark:text-stone-50"
            >
              The Alveoly Journal
            </Link>
            <p className="text-sm text-stone-600 dark:text-stone-400 mt-4 max-w-sm leading-relaxed">
              A clinician-written publication on heart health, nutrition,
              mental wellness, and public health. Evidence in plain language,
              reviewed for accuracy, free of clickbait.
            </p>
            <div className="flex items-center gap-4 mt-6">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={s.label}
                  className="text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition"
                >
                  <s.icon />
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest text-stone-500 dark:text-stone-400 font-semibold mb-4">
              Content
            </p>
            <ul className="space-y-2.5">
              {contentLinks.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-sm text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest text-stone-500 dark:text-stone-400 font-semibold mb-4">
              Trust
            </p>
            <ul className="space-y-2.5">
              {policyLinks.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-sm text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/"
                  className="text-sm text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition"
                >
                  Back to Alveoly
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-500 dark:text-stone-500">
          <p>© {new Date().getFullYear()} Alveoly. All rights reserved.</p>
          <p className="italic">
            The content is educational only and not a substitute for medical
            advice.
          </p>
        </div>
      </div>
    </footer>
  );
};

/* ============================================================
   EPISODE PLAYER
============================================================ */

const EpisodePlayer = ({ podcast, autoPlay = false, variant = "featured" }) => {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) audioRef.current.pause();
    else audioRef.current.play();
  };

  const onTimeUpdate = () => {
    const a = audioRef.current;
    if (!a) return;
    const pct = a.duration ? (a.currentTime / a.duration) * 100 : 0;
    setProgress(pct);
  };

  const onEnded = () => {
    setPlaying(false);
    setProgress(0);
  };

  const formatTime = (sec) => {
    if (!sec || isNaN(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  if (variant === "featured") {
    return (
      <div className="p-6 md:p-8 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
        <div className="flex items-start gap-5 mb-6">
          {podcast.image && (
            <img
              src={podcast.image}
              alt={podcast.title}
              className="w-24 h-24 md:w-28 md:h-28 rounded-lg object-cover flex-shrink-0"
            />
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-wider text-rose-600 dark:text-rose-400 font-semibold mb-1.5">
              Episode {podcast.episodeNumber}
            </p>
            <h3 className="font-serif text-xl md:text-2xl font-bold leading-snug text-stone-900 dark:text-stone-100 mb-2">
              {podcast.title}
            </h3>
            {podcast.guests?.length > 0 && (
              <p className="text-sm text-stone-600 dark:text-stone-400">
                With{" "}
                <span className="font-medium text-stone-800 dark:text-stone-200">
                  {podcast.guests.join(", ")}
                </span>
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggle}
            aria-label={playing ? "Pause episode" : "Play episode"}
            className="w-14 h-14 rounded-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 flex items-center justify-center hover:opacity-90 transition flex-shrink-0"
          >
            {playing ? <FaPause /> : <FaPlay className="ml-0.5" />}
          </button>

          <div className="flex-1 min-w-0">
            <div className="h-1.5 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full transition-[width] duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-stone-500 dark:text-stone-500">
              <span className="flex items-center gap-1.5">
                <FaHeadphones className="text-[10px]" />
                {podcast.duration}
              </span>
              <span>{formatShortDate(podcast.publishedAt)}</span>
            </div>
          </div>
        </div>

        <audio
          ref={audioRef}
          src={podcast.audioUrl}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onTimeUpdate={onTimeUpdate}
          onEnded={onEnded}
          className="hidden"
        />

        {podcast.description && (
          <p className="mt-6 text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
            {podcast.description}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-start gap-5 py-6">
      <button
        onClick={toggle}
        aria-label={playing ? "Pause episode" : "Play episode"}
        className="w-12 h-12 rounded-full border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 flex items-center justify-center hover:bg-stone-900 hover:text-white hover:border-stone-900 dark:hover:bg-stone-100 dark:hover:text-stone-900 dark:hover:border-stone-100 transition flex-shrink-0"
      >
        {playing ? <FaPause /> : <FaPlay className="ml-0.5 text-sm" />}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-stone-500 dark:text-stone-500 mb-2">
          <span className="text-rose-600 dark:text-rose-400 font-semibold">
            Episode {podcast.episodeNumber}
          </span>
          <span className="text-stone-300 dark:text-stone-700">·</span>
          <span className="flex items-center gap-1.5">
            <FaClock className="text-[9px]" />
            {podcast.duration}
          </span>
          <span className="text-stone-300 dark:text-stone-700">·</span>
          <time>{formatShortDate(podcast.publishedAt)}</time>
        </div>

        <h3 className="font-serif text-lg md:text-xl font-bold leading-snug text-stone-900 dark:text-stone-100 mb-2">
          {podcast.title}
        </h3>

        {podcast.guests?.length > 0 && (
          <p className="text-sm text-stone-600 dark:text-stone-400 mb-2">
            With{" "}
            <span className="font-medium text-stone-800 dark:text-stone-200">
              {podcast.guests.join(", ")}
            </span>
          </p>
        )}

        {podcast.description && (
          <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed line-clamp-2">
            {podcast.description}
          </p>
        )}

        {playing && (
          <div className="mt-3 h-1 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full transition-[width] duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <audio
          ref={audioRef}
          src={podcast.audioUrl}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onTimeUpdate={onTimeUpdate}
          onEnded={onEnded}
          className="hidden"
        />
      </div>
    </div>
  );
};

/* ============================================================
   SUBSCRIBE ROW
============================================================ */

const SubscribeRow = () => {
  const platforms = [
    { label: "Apple Podcasts", href: "#" },
    { label: "Spotify", href: "#" },
    { label: "Overcast", href: "#" },
    { label: "Pocket Casts", href: "#" },
    { label: "RSS feed", href: "/blog/rss" },
  ];
  return (
    <div className="mt-8 pt-6 border-t border-stone-200 dark:border-stone-800">
      <p className="text-xs uppercase tracking-widest text-stone-500 dark:text-stone-400 font-semibold mb-3">
        Listen on
      </p>
      <div className="flex flex-wrap gap-2">
        {platforms.map((p) => (
          <a
            key={p.label}
            href={p.href}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 text-sm font-medium hover:border-stone-900 dark:hover:border-stone-100 hover:text-stone-900 dark:hover:text-stone-100 transition"
          >
            <FaHeadphones className="text-xs" />
            {p.label}
          </a>
        ))}
      </div>
    </div>
  );
};

/* ============================================================
   MAIN — WIRED TO LIVE PUBLIC API
============================================================ */

const BlogPodcasts = () => {
  const [podcasts, setPodcasts] = useState([]);
  const [pairedArticles, setPairedArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ---------- Fetch podcasts + paired articles ---------- */
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const [podRes, postsRes] = await Promise.all([
          blogAPI.getPodcasts(),
          blogAPI.getPosts({ limit: 30, publishedOnly: true }),
        ]);
        if (cancelled) return;
        setPodcasts(podRes.data || []);
        const posts = postsRes.data?.posts || [];
        // Prefer medically reviewed pieces, fall back to the newest
        const reviewed = posts.filter((p) => p.medicallyReviewed);
        const pool = reviewed.length > 0 ? reviewed : posts;
        setPairedArticles(
          pool
            .sort(
              (a, b) =>
                new Date(b.publishedAt) - new Date(a.publishedAt)
            )
            .slice(0, 3)
        );
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setPodcasts([]);
          setPairedArticles([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ---------- Sort + split lead/rest ---------- */
  const sorted = useMemo(
    () =>
      [...podcasts].sort(
        (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)
      ),
    [podcasts]
  );
  const lead = sorted[0];
  const rest = sorted.slice(1);

  /* ---------- Stats ---------- */
  const stats = useMemo(() => {
    const totalSeconds = podcasts.reduce(
      (sum, p) => sum + durationToSeconds(p.duration),
      0
    );
    const guests = new Set();
    podcasts.forEach((p) => (p.guests || []).forEach((g) => guests.add(g)));
    const years = new Set(
      podcasts
        .map((p) => (p.publishedAt ? new Date(p.publishedAt).getFullYear() : null))
        .filter(Boolean)
    );
    return {
      episodes: podcasts.length,
      guests: guests.size,
      totalRuntime: secondsToLabel(totalSeconds),
      years: [...years].sort((a, b) => b - a),
    };
  }, [podcasts]);

  /* ---------- Loading screen ---------- */
  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-stone-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-stone-300 border-t-stone-900 dark:border-stone-700 dark:border-t-stone-100 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100">
      <JournalNav />

      {/* MASTHEAD */}
      <header className="border-b border-stone-200 dark:border-stone-800">
        <div className="max-w-5xl mx-auto px-5 pt-12 md:pt-16 pb-10">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition mb-8"
          >
            <FaArrowLeft className="text-xs" />
            All stories
          </Link>

          <p className="text-xs uppercase tracking-[0.3em] text-stone-500 dark:text-stone-400 mb-4">
            The Alveoly Journal
          </p>

          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-stone-900 dark:text-stone-50 leading-[1.08] mb-5">
            The Alveoly Podcast
          </h1>

          <p className="text-lg md:text-xl text-stone-600 dark:text-stone-400 max-w-2xl leading-relaxed mb-8">
            Long-form conversations with the clinicians, researchers, and
            public health experts behind the writing — and sometimes, the
            people on the other side of the exam room.
          </p>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-stone-500 dark:text-stone-500 pt-6 border-t border-stone-200 dark:border-stone-800">
            <span>
              <strong className="font-semibold text-stone-900 dark:text-stone-100">
                {stats.episodes}
              </strong>{" "}
              {stats.episodes === 1 ? "episode" : "episodes"}
            </span>
            {stats.guests > 0 && (
              <>
                <span className="text-stone-300 dark:text-stone-700">·</span>
                <span>
                  <strong className="font-semibold text-stone-900 dark:text-stone-100">
                    {stats.guests}
                  </strong>{" "}
                  {stats.guests === 1 ? "guest" : "guests"}
                </span>
              </>
            )}
            {stats.totalRuntime && (
              <>
                <span className="text-stone-300 dark:text-stone-700">·</span>
                <span>
                  <strong className="font-semibold text-stone-900 dark:text-stone-100">
                    {stats.totalRuntime}
                  </strong>{" "}
                  total runtime
                </span>
              </>
            )}
            {stats.years.length > 0 && (
              <>
                <span className="text-stone-300 dark:text-stone-700">·</span>
                <span>
                  Running since {stats.years[stats.years.length - 1]}
                </span>
              </>
            )}
          </div>

          <SubscribeRow />
        </div>
      </header>

      {/* FEATURED EPISODE */}
      {lead && (
        <section className="max-w-6xl mx-auto px-5 pt-12 md:pt-16">
          <div className="max-w-3xl">
            <SectionLabel icon={FaMicrophone}>Latest episode</SectionLabel>
            <EpisodePlayer podcast={lead} variant="featured" />
          </div>
        </section>
      )}

      {/* EPISODE ARCHIVE */}
      <section className="max-w-6xl mx-auto px-5 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
          <div className="lg:col-span-8 min-w-0">
            {rest.length > 0 ? (
              <>
                <div className="flex items-center gap-4 mb-6">
                  <span className="flex-1 h-px bg-stone-200 dark:bg-stone-800" />
                  <span className="text-xs uppercase tracking-widest text-stone-400">
                    All episodes
                  </span>
                  <span className="flex-1 h-px bg-stone-200 dark:bg-stone-800" />
                </div>

                <div className="divide-y divide-stone-100 dark:divide-stone-900">
                  {rest.map((podcast, i) => (
                    <motion.div
                      key={podcast._id || podcast.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.3,
                        delay: Math.min(i * 0.05, 0.3),
                      }}
                    >
                      <EpisodePlayer podcast={podcast} variant="compact" />
                    </motion.div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-stone-500 dark:text-stone-400 py-10">
                Only one episode so far. Subscribe to hear the next one first.
              </p>
            )}
          </div>

          {/* SIDEBAR */}
          <aside className="lg:col-span-4 min-w-0">
            <div className="lg:sticky lg:top-24 space-y-8">
              <div className="p-6 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                <SectionLabel icon={FaMicrophone}>
                  About the podcast
                </SectionLabel>
                <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                  The Alveoly Podcast is a long-form companion to the journal.
                  We talk to the people who write the pieces — and to the
                  clinicians and patients who live the questions. New episodes
                  every other week.
                </p>
              </div>

              {stats.guests > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-widest text-stone-500 dark:text-stone-400 font-semibold mb-4">
                    Recent guests
                  </p>
                  <ul className="space-y-3">
                    {[
                      ...new Set(podcasts.flatMap((p) => p.guests || [])),
                    ]
                      .slice(0, 6)
                      .map((guest) => {
                        const ep = podcasts.find((p) =>
                          (p.guests || []).includes(guest)
                        );
                        return (
                          <li
                            key={guest}
                            className="flex items-baseline justify-between gap-3 text-sm"
                          >
                            <span className="font-medium text-stone-800 dark:text-stone-200">
                              {guest}
                            </span>
                            {ep && (
                              <span className="text-xs text-stone-500 dark:text-stone-500 whitespace-nowrap">
                                Ep. {ep.episodeNumber}
                              </span>
                            )}
                          </li>
                        );
                      })}
                  </ul>
                </div>
              )}

              <div className="p-5 rounded-2xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900">
                <p className="font-serif text-base font-bold mb-2">
                  Get stories worth reading.
                </p>
                <p className="text-xs opacity-80 mb-4">
                  A weekly letter on healthcare and clinical practice — plus
                  every new episode, in your inbox.
                </p>
                <form
                  onSubmit={(e) => e.preventDefault()}
                  className="space-y-2"
                >
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white/10 dark:bg-stone-900/10 border border-white/20 dark:border-stone-900/20 text-sm placeholder-white/60 dark:placeholder-stone-900/60 focus:outline-none focus:border-white/60 dark:focus:border-stone-900/60 transition"
                  />
                  <button
                    type="submit"
                    className="w-full px-4 py-2.5 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 rounded-lg text-sm font-medium hover:opacity-90 transition"
                  >
                    Subscribe
                  </button>
                </form>
              </div>

              <div className="p-5 rounded-2xl border border-stone-200 dark:border-stone-800">
                <div className="flex items-start gap-3">
                  <FaCheckCircle className="text-emerald-600 dark:text-emerald-400 mt-0.5 text-sm" />
                  <div>
                    <p className="text-sm font-medium text-stone-900 dark:text-stone-100 mb-1">
                      Every episode medically reviewed
                    </p>
                    <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                      Guests verified, medical claims checked against current
                      guidance before release.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* READ ALONGSIDE */}
      {pairedArticles.length > 0 && (
        <section className="border-t border-stone-200 dark:border-stone-800">
          <div className="max-w-6xl mx-auto px-5 py-14">
            <SectionLabel icon={FaBookOpen}>Read alongside</SectionLabel>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-stone-900 dark:text-stone-50 mb-2">
              If you liked an episode, read the piece
            </h2>
            <p className="text-stone-600 dark:text-stone-400 mb-8 max-w-2xl">
              Most of our episodes have a companion article. Here are three
              recent pieces that pair well with what you've been listening to.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {pairedArticles.map((post) => {
                const img = postImage(post);
                const catName =
                  post.categoryId?.name || post.category?.name || "";
                return (
                  <Link
                    key={post._id || post.id}
                    to={`/blog/${post.slug}`}
                    className="group"
                  >
                    {img && (
                      <img
                        src={img}
                        alt={post.title}
                        className="w-full aspect-[16/10] object-cover rounded-md mb-4 group-hover:opacity-95 transition"
                      />
                    )}
                    {catName && (
                      <p className="text-xs uppercase tracking-wider text-rose-600 dark:text-rose-400 font-semibold mb-1.5">
                        {catName}
                      </p>
                    )}
                    <h3 className="font-serif text-base font-bold leading-snug text-stone-900 dark:text-stone-100 group-hover:text-rose-700 dark:group-hover:text-rose-400 transition line-clamp-2 mb-2">
                      {post.title}
                    </h3>
                    <p className="text-xs text-stone-500 flex items-center gap-1.5">
                      <FaClock className="text-[9px]" />
                      {post.readingTime} min read
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* OTHER MEDIA */}
      <section className="border-t border-stone-200 dark:border-stone-800">
        <div className="max-w-6xl mx-auto px-5 py-14">
          <p className="text-xs uppercase tracking-widest text-rose-600 dark:text-rose-400 font-semibold mb-6">
            Also on the journal
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Link
              to="/blog/videos"
              className="group flex items-start gap-4 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-stone-900 dark:hover:border-stone-100 transition"
            >
              <FaVideo className="text-stone-400 group-hover:text-rose-600 transition text-lg mt-1" />
              <div>
                <h3 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100 mb-1">
                  Videos
                </h3>
                <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                  Short, practical explainers from our medical desk.
                </p>
              </div>
            </Link>
            <Link
              to="/blog/archive"
              className="group flex items-start gap-4 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-stone-900 dark:hover:border-stone-100 transition"
            >
              <FaStream className="text-stone-400 group-hover:text-rose-600 transition text-lg mt-1" />
              <div>
                <h3 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100 mb-1">
                  Archive
                </h3>
                <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                  Every story we've published, filed by month.
                </p>
              </div>
            </Link>
            <Link
              to="/sitemap"
              className="group flex items-start gap-4 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-stone-900 dark:hover:border-stone-100 transition"
            >
              <FaStream className="text-stone-400 group-hover:text-rose-600 transition text-lg mt-1" />
              <div>
                <h3 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100 mb-1">
                  Sitemap
                </h3>
                <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                  A structured index of everything the journal publishes.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <JournalFooter />
    </div>
  );
};

export default BlogPodcasts;