// src/pages/blog/BlogAuthor.jsx — WIRED TO LIVE API
import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaArrowLeft, FaClock, FaEye, FaHome, FaSearch, FaChevronDown,
  FaTwitter, FaLinkedin, FaInstagram, FaYoutube, FaEnvelope,
  FaGlobe, FaRss, FaMicrophone, FaVideo, FaStream, FaTag,
  FaGraduationCap, FaCheckCircle, FaBookOpen,
} from "react-icons/fa";
import { publicBlogAPI as blogAPI } from "../../api/blogApi";

/* ---------- (Utilities + primitives unchanged) ---------- */

const formatShortDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "";

const initials = (name) =>
  name.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0]).join("").toUpperCase();

const slugify = (s) =>
  String(s).toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");

const Avatar = ({ author, size = "sm" }) => {
  const [broken, setBroken] = useState(false);
  const cls =
    size === "sm"
      ? "w-6 h-6 text-[10px]"
      : size === "lg"
      ? "w-16 h-16 text-lg"
      : size === "xl"
      ? "w-24 h-24 md:w-28 md:h-28 text-2xl"
      : "w-9 h-9 text-xs";
  if (!author) return null;
  if (author.avatar && !broken) {
    return (
      <img
        src={author.avatar}
        alt={author.name}
        onError={() => setBroken(true)}
        className={`${cls} rounded-full object-cover flex-shrink-0`}
      />
    );
  }
  return (
    <div
      className={`${cls} rounded-full bg-stone-800 dark:bg-stone-200 text-white dark:text-stone-900 flex items-center justify-center font-medium flex-shrink-0`}
    >
      {initials(author.name)}
    </div>
  );
};

/* ---------- Nav + Footer: unchanged from your file ---------- */
/* (Keep the JournalNav and JournalFooter exactly as they are) */

const JournalNav = () => {
  // ...unchanged
};

const JournalFooter = () => {
  // ...unchanged
};

const SectionLabel = ({ icon: Icon, children }) => (
  <p className="text-xs uppercase tracking-widest text-rose-600 dark:text-rose-400 font-semibold mb-3 flex items-center gap-2">
    {Icon && <Icon className="text-xs" />}
    {children}
  </p>
);

/* ============================================================
   MAIN
============================================================ */

const BlogAuthor = () => {
  const { id } = useParams();
  const [author, setAuthor] = useState(null);
  const [authorPosts, setAuthorPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [authorRes, categoriesRes] = await Promise.all([
          blogAPI.getPostsByAuthor(id, { page: 1, limit: 20 }),
          blogAPI.getCategories(),
        ]);

        if (authorRes.success) {
          setAuthor(authorRes.data.author);
          setAuthorPosts(authorRes.data.posts || []);
        } else {
          setNotFound(true);
        }

        if (categoriesRes.success) {
          setCategories(categoriesRes.data || []);
        }
      } catch (err) {
        console.error(err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    load();
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [id]);

  /* ---------- Derived ---------- */
  const stats = useMemo(() => {
    if (!authorPosts.length) {
      return { posts: 0, views: 0, likes: 0, categories: 0, firstYear: null };
    }
    const views = authorPosts.reduce((s, p) => s + (p.views || 0), 0);
    const likes = authorPosts.reduce((s, p) => s + (p.likes || 0), 0);
    const cats = new Set(
      authorPosts.map((p) => p.categoryId?._id || p.categoryId).filter(Boolean)
    );
    const sortedByDate = [...authorPosts].sort(
      (a, b) => new Date(a.publishedAt) - new Date(b.publishedAt)
    );
    const firstYear = new Date(sortedByDate[0].publishedAt).getFullYear();
    return { posts: authorPosts.length, views, likes, categories: cats.size, firstYear };
  }, [authorPosts]);

  const authorCategories = useMemo(() => {
    if (!authorPosts.length || !categories.length) return [];
    const ids = new Set(
      authorPosts.map((p) => p.categoryId?._id || p.categoryId).filter(Boolean)
    );
    return categories.filter((c) => ids.has(c._id || c.id));
  }, [authorPosts, categories]);

  const reviewedCount = useMemo(
    () =>
      authorPosts.filter(
        (p) =>
          p.medicallyReviewed &&
          (p.reviewedBy?._id || p.reviewedBy) === author?._id
      ).length,
    [authorPosts, author]
  );

  /* ---------- Loading + Not Found ---------- */
  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-stone-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-stone-300 border-t-stone-900 dark:border-stone-700 dark:border-t-stone-100 rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !author) {
    return (
      <div className="min-h-screen bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100">
        <JournalNav />
        <div className="max-w-3xl mx-auto px-5 py-24 md:py-32 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-stone-500 dark:text-stone-400 mb-4">
            The Alveoly Journal
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-stone-900 dark:text-stone-50 mb-4">
            We don't have that contributor on file
          </h1>
          <p className="text-lg text-stone-600 dark:text-stone-400 max-w-md mx-auto mb-8">
            They may not have published here, or the link may be outdated.
            Meet the desk instead.
          </p>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-full text-sm font-medium hover:opacity-90 transition"
          >
            <FaArrowLeft className="text-xs" />
            Back to the journal
          </Link>
        </div>
        <JournalFooter />
      </div>
    );
  }

  /* ---------- Render ---------- */
  return (
    <div className="min-h-screen bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100">
      <JournalNav />

      {/* AUTHOR MASTHEAD */}
      <header className="border-b border-stone-200 dark:border-stone-800">
        <div className="max-w-5xl mx-auto px-5 pt-12 md:pt-16 pb-10">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition mb-8"
          >
            <FaArrowLeft className="text-xs" />
            All stories
          </Link>

          <p className="text-xs uppercase tracking-[0.3em] text-stone-500 dark:text-stone-400 mb-6">
            Contributor
          </p>

          <div className="flex flex-col sm:flex-row items-start gap-6 md:gap-8">
            <Avatar author={author} size="xl" />

            <div className="flex-1 min-w-0">
              <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-stone-900 dark:text-stone-50 leading-[1.1] mb-3">
                {author.name}
              </h1>

              {author.role && (
                <p className="text-lg text-stone-700 dark:text-stone-300 font-medium mb-1">
                  {author.role}
                </p>
              )}

              {author.credentials && (
                <p className="text-sm text-stone-500 dark:text-stone-500 flex items-center gap-2 mb-4">
                  <FaGraduationCap className="text-xs" />
                  {author.credentials}
                </p>
              )}

              {author.bio && (
                <p className="text-base md:text-lg text-stone-600 dark:text-stone-400 leading-relaxed max-w-2xl mb-6">
                  {author.bio}
                </p>
              )}

              {author.specialties?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {author.specialties.map((s) => (
                    <span
                      key={s}
                      className="px-3 py-1.5 text-xs rounded-full bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4 text-stone-400">
                {author.social?.twitter && (
                  <a href={author.social.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-sky-500 transition">
                    <FaTwitter />
                  </a>
                )}
                {author.social?.linkedin && (
                  <a href={author.social.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition">
                    <FaLinkedin />
                  </a>
                )}
                {author.social?.instagram && (
                  <a href={author.social.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-pink-500 transition">
                    <FaInstagram />
                  </a>
                )}
                {author.social?.youtube && (
                  <a href={author.social.youtube} target="_blank" rel="noopener noreferrer" className="hover:text-red-600 transition">
                    <FaYoutube />
                  </a>
                )}
                {author.social?.website && (
                  <a href={author.social.website} target="_blank" rel="noopener noreferrer" className="hover:text-stone-900 dark:hover:text-stone-100 transition">
                    <FaGlobe />
                  </a>
                )}
                {author.social?.email && (
                  <a href={`mailto:${author.social.email}`} className="hover:text-rose-500 transition">
                    <FaEnvelope />
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-stone-500 dark:text-stone-500 pt-8 mt-8 border-t border-stone-200 dark:border-stone-800">
            <span>
              <strong className="font-semibold text-stone-900 dark:text-stone-100">
                {stats.posts}
              </strong>{" "}
              {stats.posts === 1 ? "story" : "stories"} published
            </span>
            {stats.categories > 0 && (
              <>
                <span className="text-stone-300 dark:text-stone-700">·</span>
                <span>
                  <strong className="font-semibold text-stone-900 dark:text-stone-100">
                    {stats.categories}
                  </strong>{" "}
                  {stats.categories === 1 ? "section" : "sections"}
                </span>
              </>
            )}
            {stats.views > 0 && (
              <>
                <span className="text-stone-300 dark:text-stone-700">·</span>
                <span>
                  <strong className="font-semibold text-stone-900 dark:text-stone-100">
                    {stats.views.toLocaleString()}
                  </strong>{" "}
                  reads
                </span>
              </>
            )}
            {stats.likes > 0 && (
              <>
                <span className="text-stone-300 dark:text-stone-700">·</span>
                <span>
                  <strong className="font-semibold text-stone-900 dark:text-stone-100">
                    {stats.likes.toLocaleString()}
                  </strong>{" "}
                  likes
                </span>
              </>
            )}
            {stats.firstYear && (
              <>
                <span className="text-stone-300 dark:text-stone-700">·</span>
                <span>Writing since {stats.firstYear}</span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ARTICLES + SIDEBAR */}
      <section className="max-w-6xl mx-auto px-5 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
          <div className="lg:col-span-8 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-8 pb-5 border-b border-stone-200 dark:border-stone-800">
              <p className="text-sm text-stone-600 dark:text-stone-400">
                <strong className="text-stone-900 dark:text-stone-100 font-semibold">
                  {authorPosts.length}
                </strong>{" "}
                {authorPosts.length === 1 ? "story" : "stories"} by{" "}
                <strong className="text-stone-900 dark:text-stone-100 font-semibold">
                  {author.name}
                </strong>
              </p>
            </div>

            {authorPosts.length === 0 ? (
              <div className="py-20 text-center max-w-md mx-auto">
                <p className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100 mb-3">
                  Nothing published yet
                </p>
                <p className="text-stone-500 dark:text-stone-400 mb-6">
                  {author.name} is on the desk, but hasn't filed a story yet.
                  Check back soon.
                </p>
                <Link
                  to="/blog"
                  className="inline-flex items-center gap-2 text-sm font-medium text-stone-900 dark:text-stone-100 underline underline-offset-4 hover:text-rose-600 dark:hover:text-rose-400 transition"
                >
                  <FaArrowLeft className="text-xs" />
                  Browse all stories
                </Link>
              </div>
            ) : (
              <PostGrid posts={authorPosts} categories={categories} authorName={author.name} />
            )}
          </div>

          {/* SIDEBAR */}
          <aside className="lg:col-span-4 min-w-0">
            <div className="lg:sticky lg:top-24 space-y-8">
              {author.bio && (
                <div className="p-6 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                  <SectionLabel icon={FaBookOpen}>
                    About this contributor
                  </SectionLabel>
                  <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                    {author.bio}
                  </p>
                  {author.specialties?.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-800">
                      <p className="text-xs uppercase tracking-wider text-stone-500 mb-3">
                        Focus areas
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {author.specialties.map((s) => (
                          <span
                            key={s}
                            className="px-2.5 py-1 text-xs rounded-full bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {authorCategories.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-widest text-stone-500 dark:text-stone-400 font-semibold mb-4">
                    Sections
                  </p>
                  <ul className="space-y-1.5">
                    {authorCategories.map((c) => {
                      const cid = c._id || c.id;
                      const count = authorPosts.filter(
                        (p) => (p.categoryId?._id || p.categoryId) === cid
                      ).length;
                      return (
                        <li key={cid}>
                          <Link
                            to={`/blog/category/${c.slug || slugify(c.name)}`}
                            className="flex items-center justify-between px-3 py-2 rounded-md text-sm text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-900 hover:text-stone-900 dark:hover:text-stone-100 transition"
                          >
                            <span>{c.name}</span>
                            <span className="text-xs text-stone-400 dark:text-stone-600">
                              {count}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {reviewedCount > 0 && (
                <div className="p-5 rounded-2xl border border-stone-200 dark:border-stone-800">
                  <div className="flex items-start gap-3">
                    <FaCheckCircle className="text-emerald-600 dark:text-emerald-400 mt-0.5 text-sm" />
                    <div>
                      <p className="text-sm font-medium text-stone-900 dark:text-stone-100 mb-1">
                        On the medical review board
                      </p>
                      <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                        {author.name} has medically reviewed{" "}
                        <strong className="font-semibold">{reviewedCount}</strong>{" "}
                        {reviewedCount === 1 ? "article" : "articles"} for the journal.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <Newsletter />
            </div>
          </aside>
        </div>
      </section>

      <JournalFooter />
    </div>
  );
};

/* ============================================================
   POST GRID + NEWSLETTER (extracted for readability)
============================================================ */

const PostGrid = ({ posts, categories, authorName }) => {
  const [lead, ...rest] = posts;
  const leadCat = categories.find(
    (c) => (c._id || c.id) === (lead.categoryId?._id || lead.categoryId)
  );

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="group mb-12"
      >
        <Link to={`/blog/${lead.slug}`} className="block">
          {lead.image && (
            <div className="overflow-hidden rounded-lg mb-6">
              <img
                src={lead.image}
                alt={lead.title}
                className="w-full aspect-[16/10] object-cover group-hover:opacity-95 transition"
              />
            </div>
          )}
          <div className="flex items-center gap-3 text-xs text-stone-500 dark:text-stone-500 mb-3">
            {leadCat && (
              <>
                <span className="uppercase tracking-wider text-rose-600 dark:text-rose-400 font-semibold">
                  {leadCat.name}
                </span>
                <span className="text-stone-300 dark:text-stone-700">·</span>
              </>
            )}
            <time>{formatShortDate(lead.publishedAt)}</time>
            <span className="text-stone-300 dark:text-stone-700">·</span>
            <span className="flex items-center gap-1.5">
              <FaClock className="text-[9px]" />
              {lead.readingTime} min
            </span>
          </div>
          <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold leading-tight text-stone-900 dark:text-stone-50 mb-4 group-hover:text-rose-700 dark:group-hover:text-rose-400 transition">
            {lead.title}
          </h2>
          <p className="text-stone-600 dark:text-stone-400 leading-relaxed mb-5">
            {lead.excerpt}
          </p>
          <div className="flex items-center gap-3 text-xs text-stone-500">
            <span className="flex items-center gap-1.5">
              <FaEye className="text-[9px]" />
              {(lead.views || 0).toLocaleString()} reads
            </span>
            {lead.medicallyReviewed && (
              <>
                <span className="text-stone-300 dark:text-stone-700">·</span>
                <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                  <FaCheckCircle className="text-[10px]" />
                  Medically reviewed
                </span>
              </>
            )}
          </div>
        </Link>
      </motion.article>

      {rest.length > 0 && (
        <>
          <div className="flex items-center gap-4 mb-8">
            <span className="flex-1 h-px bg-stone-200 dark:bg-stone-800" />
            <span className="text-xs uppercase tracking-widest text-stone-400">
              Also by {authorName.split(" ").slice(-1)[0]}
            </span>
            <span className="flex-1 h-px bg-stone-200 dark:bg-stone-800" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-12">
            {rest.map((post, i) => {
              const cat = categories.find(
                (c) => (c._id || c.id) === (post.categoryId?._id || post.categoryId)
              );
              return (
                <motion.article
                  key={post._id || post.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: Math.min(i * 0.05, 0.35) }}
                  className="group"
                >
                  <Link to={`/blog/${post.slug}`} className="block">
                    {post.image ? (
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full aspect-[16/10] object-cover rounded-md group-hover:opacity-95 transition"
                      />
                    ) : (
                      <div className="w-full aspect-[16/10] rounded-md bg-stone-100 dark:bg-stone-900" />
                    )}
                    <div className="pt-5">
                      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-stone-500 dark:text-stone-500 mb-2">
                        {cat && (
                          <>
                            <span className="text-rose-600 dark:text-rose-400 font-semibold">
                              {cat.name}
                            </span>
                            <span className="text-stone-300 dark:text-stone-700">·</span>
                          </>
                        )}
                        <time>{formatShortDate(post.publishedAt)}</time>
                      </div>
                      <h3 className="font-serif text-xl font-bold leading-snug text-stone-900 dark:text-stone-50 mb-3 group-hover:text-rose-700 dark:group-hover:text-rose-400 transition line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed line-clamp-2 mb-4">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-stone-500">
                        <span className="flex items-center gap-1.5">
                          <FaClock className="text-[9px]" />
                          {post.readingTime} min
                        </span>
                        <span className="text-stone-300 dark:text-stone-700">·</span>
                        <span className="flex items-center gap-1.5">
                          <FaEye className="text-[9px]" />
                          {(post.views || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              );
            })}
          </div>
        </>
      )}
    </>
  );
};

const Newsletter = () => (
  <div className="p-5 rounded-2xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900">
    <p className="font-serif text-base font-bold mb-2">
      Get stories worth reading.
    </p>
    <p className="text-xs opacity-80 mb-4">
      A weekly letter on healthcare and clinical practice. No noise.
    </p>
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const email = e.target.email.value;
        if (!email) return;
        try {
          await blogAPI.subscribe({ email, source: "sidebar" });
          e.target.reset();
        } catch (_) {
          /* ignore */
        }
      }}
      className="space-y-2"
    >
      <input
        type="email"
        name="email"
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
);

export default BlogAuthor;