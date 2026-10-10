// src/pages/admin/blog/AdminBlogArchive.jsx — EDITORIAL ADMIN
// Full chronological archive of everything the journal has published.
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, X, Edit3, Trash2, Loader2, Eye, EyeOff, Star,
  Calendar, Clock, ChevronDown, ExternalLink, Check, Send,
  Archive as ArchiveIcon, ArrowUpDown, FileText, Copy,
} from "lucide-react";
import { toast } from "react-hot-toast";
// import blogAPI from "../../../api/blogApi"; // ← enable when backend ready
import {
  posts as mockPosts,
  authors as mockAuthors,
  categories as mockCategories,
} from "../../../data/blogData";

/* ============================================================
   HELPERS
============================================================ */

const formatShortDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

const monthLabel = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "Unscheduled";

/* Group posts by month, newest first */
const groupByMonth = (posts) => {
  const groups = {};
  posts.forEach((p) => {
    const key = monthLabel(p.publishedAt);
    if (!groups[key]) groups[key] = [];
    groups[key].push(p);
  });
  return Object.entries(groups).sort(
    (a, b) =>
      new Date(b[1][0]?.publishedAt || 0) -
      new Date(a[1][0]?.publishedAt || 0)
  );
};

/* ============================================================
   SMALL PRIMITIVES
============================================================ */

const Avatar = ({ author, size = "sm" }) => {
  const [broken, setBroken] = useState(false);
  const cls =
    size === "sm" ? "w-6 h-6 text-[10px]" : "w-8 h-8 text-xs";
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

const StatusBadge = ({ status }) => {
  const map = {
    published: {
      label: "Published",
      tone:
        "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400",
    },
    draft: {
      label: "Draft",
      tone:
        "bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-400",
    },
    archived: {
      label: "Archived",
      tone:
        "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400",
    },
  };
  const s = map[status] || map.published;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-semibold ${s.tone}`}
    >
      {s.label}
    </span>
  );
};

/* ============================================================
   CONFIRM DELETE
============================================================ */

const ConfirmDelete = ({ open, post, onCancel, onConfirm, deleting }) => (
  <AnimatePresence>
    {open && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-[60]"
          onClick={onCancel}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="fixed z-[60] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-stone-950 rounded-2xl border border-stone-200 dark:border-stone-800 p-6"
        >
          <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center mb-4">
            <Trash2 className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          </div>
          <h3 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-50 mb-2">
            Delete this story?
          </h3>
          <p className="text-sm text-stone-600 dark:text-stone-400 mb-6 leading-relaxed">
            <strong>"{post?.title}"</strong> will be removed from the journal
            and from the public archive. This cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onCancel}
              disabled={deleting}
              className="px-4 py-2.5 text-sm text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={deleting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-rose-600 text-white text-sm font-medium hover:bg-rose-700 transition disabled:opacity-50"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Deleting…
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </>
              )}
            </button>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

/* ============================================================
   MAIN
============================================================ */

const AdminBlogArchive = () => {
  const [posts, setPosts] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [expandedMonths, setExpandedMonths] = useState(new Set());

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  /* ---------- Load ---------- */
  useEffect(() => {
    setPosts(
      mockPosts.map((p) => ({
        ...p,
        status: p.status || "published",
        featured: !!p.featured,
      }))
    );
    setAuthors(mockAuthors);
    setCategories(mockCategories);
    setTimeout(() => setLoading(false), 300);
  }, []);

  /* ---------- Derived ---------- */
  const authorById = useMemo(() => {
    const m = new Map();
    authors.forEach((a) => m.set(a.id, a));
    return m;
  }, [authors]);

  const categoryById = useMemo(() => {
    const m = new Map();
    categories.forEach((c) => m.set(c.id, c));
    return m;
  }, [categories]);

  const years = useMemo(() => {
    const set = new Set();
    posts.forEach((p) => {
      if (p.publishedAt)
        set.add(new Date(p.publishedAt).getFullYear().toString());
    });
    return [...set].sort((a, b) => b.localeCompare(a));
  }, [posts]);

  const filtered = useMemo(() => {
    let list = [...posts];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.excerpt || "").toLowerCase().includes(q) ||
          (p.tags || []).some((t) => t.toLowerCase().includes(q)) ||
          (authorById.get(p.authorId)?.name || "")
            .toLowerCase()
            .includes(q)
      );
    }

    if (yearFilter !== "all") {
      list = list.filter(
        (p) =>
          p.publishedAt &&
          new Date(p.publishedAt).getFullYear().toString() === yearFilter
      );
    }

    if (categoryFilter !== "all") {
      list = list.filter((p) => p.categoryId === categoryFilter);
    }

    list.sort((a, b) => {
      if (sortBy === "newest")
        return new Date(b.publishedAt) - new Date(a.publishedAt);
      if (sortBy === "oldest")
        return new Date(a.publishedAt) - new Date(b.publishedAt);
      if (sortBy === "title") return a.title.localeCompare(b.title);
      if (sortBy === "views") return (b.views || 0) - (a.views || 0);
      return 0;
    });

    return list;
  }, [posts, search, yearFilter, categoryFilter, sortBy, authorById]);

  const grouped = useMemo(() => groupByMonth(filtered), [filtered]);

  /* Auto-expand the first month on first load */
  useEffect(() => {
    if (grouped.length > 0 && expandedMonths.size === 0) {
      setExpandedMonths(new Set([grouped[0][0]]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grouped.length]);

  const toggleMonth = (key) => {
    setExpandedMonths((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  /* ---------- Handlers ---------- */
  const toggleFeatured = (post) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id ? { ...p, featured: !p.featured } : p
      )
    );
    toast.success(post.featured ? "Unfeatured" : "Featured");
  };

  const togglePublish = (post) => {
    const next = post.status === "published" ? "draft" : "published";
    setPosts((prev) =>
      prev.map((p) => (p.id === post.id ? { ...p, status: next } : p))
    );
    toast.success(next === "published" ? "Published" : "Moved to draft");
  };

  const duplicate = (post) => {
    const copy = {
      ...post,
      id: `${post.id}-copy-${Date.now()}`,
      title: `${post.title} (copy)`,
      slug: `${post.slug}-copy`,
      status: "draft",
      publishedAt: new Date().toISOString(),
    };
    setPosts((prev) => [copy, ...prev]);
    toast.success("Duplicated as draft");
  };

  const handleDelete = async () => {
    setDeleting(true);
    await new Promise((r) => setTimeout(r, 400));
    setPosts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    toast.success("Story deleted");
    setDeleting(false);
    setDeleteTarget(null);
  };

  const stats = useMemo(
    () => ({
      total: posts.length,
      published: posts.filter((p) => p.status === "published").length,
      drafts: posts.filter((p) => p.status === "draft").length,
      archived: posts.filter((p) => p.status === "archived").length,
    }),
    [posts]
  );

  /* ---------- Render ---------- */
  return (
    <div className="space-y-6 pb-24">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-rose-600 dark:text-rose-400 font-semibold mb-2">
            The Alveoly Journal
          </p>
          <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
            Archive
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-2 max-w-2xl">
            Everything the journal has published, filed by month — with quick
            access to edit, feature, unpublish, or duplicate any story.
          </p>
        </div>

        <Link
          to="/admin/blog/create"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-sm font-medium hover:opacity-90 transition self-start md:self-auto"
        >
          <FileText className="w-4 h-4" />
          Write a story
        </Link>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total filed", value: stats.total },
          { label: "Published", value: stats.published },
          { label: "Drafts", value: stats.drafts },
          { label: "Archived", value: stats.archived },
        ].map((s) => (
          <div
            key={s.label}
            className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950"
          >
            <p className="text-xs uppercase tracking-wider text-stone-500 dark:text-stone-400 font-semibold mb-2">
              {s.label}
            </p>
            <p className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-50">
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3 p-3 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950">
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search the archive…"
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-transparent text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-transparent border border-stone-200 dark:border-stone-800 text-sm text-stone-700 dark:text-stone-300 focus:outline-none cursor-pointer"
          >
            <option value="all">All years</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-transparent border border-stone-200 dark:border-stone-800 text-sm text-stone-700 dark:text-stone-300 focus:outline-none cursor-pointer max-w-[200px]"
          >
            <option value="all">All sections</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-lg bg-transparent border border-stone-200 dark:border-stone-800 text-sm text-stone-700 dark:text-stone-300 focus:outline-none cursor-pointer"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="title">Sort: A–Z</option>
            <option value="views">Most read</option>
          </select>
        </div>
      </div>

      {/* LIST */}
      {loading ? (
        <div className="py-20 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-stone-400" />
        </div>
      ) : grouped.length === 0 ? (
        <div className="py-20 text-center max-w-md mx-auto">
          <p className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100 mb-3">
            {posts.length === 0
              ? "The archive is empty"
              : "Nothing matches these filters"}
          </p>
          <p className="text-sm text-stone-500 dark:text-stone-400 mb-6">
            {posts.length === 0
              ? "Publish the first story to start filling the archive."
              : "Try a different year, section, or search."}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([month, monthPosts]) => {
            const isExpanded = expandedMonths.has(month);
            return (
              <motion.section
                key={month}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 overflow-hidden"
              >
                <button
                  onClick={() => toggleMonth(month)}
                  className="w-full flex items-baseline justify-between gap-4 px-5 py-4 hover:bg-stone-50/60 dark:hover:bg-stone-900/30 transition text-left"
                >
                  <div className="flex items-baseline gap-4 min-w-0">
                    <h2 className="font-serif text-xl md:text-2xl font-bold text-stone-900 dark:text-stone-50">
                      {month}
                    </h2>
                    <span className="text-xs text-stone-500 dark:text-stone-500">
                      {monthPosts.length}{" "}
                      {monthPosts.length === 1 ? "story" : "stories"}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-stone-400 flex-shrink-0 transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden border-t border-stone-100 dark:border-stone-900"
                    >
                      {monthPosts.map((p, i) => {
                        const author = authorById.get(p.authorId);
                        const category = categoryById.get(p.categoryId);
                        const day = p.publishedAt
                          ? new Date(p.publishedAt)
                              .toLocaleDateString("en-US", {
                                day: "2-digit",
                              })
                          : "—";
                        return (
                          <div
                            key={p.id}
                            className={`grid grid-cols-1 md:grid-cols-12 gap-4 px-5 py-4 items-start md:items-center group hover:bg-stone-50/60 dark:hover:bg-stone-900/30 transition ${
                              i > 0
                                ? "border-t border-stone-100 dark:border-stone-900"
                                : ""
                            }`}
                          >
                            {/* Day */}
                            <div className="md:col-span-1">
                              <span className="font-serif text-lg font-bold text-stone-300 dark:text-stone-700">
                                {day}
                              </span>
                            </div>

                            {/* Body */}
                            <div className="md:col-span-7 min-w-0 flex gap-3">
                              {p.image && (
                                <img
                                  src={p.image}
                                  alt={p.title}
                                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0 hidden sm:block"
                                />
                              )}
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mb-1">
                                  {category && (
                                    <span className="text-[10px] uppercase tracking-wider text-rose-600 dark:text-rose-400 font-semibold">
                                      {category.name}
                                    </span>
                                  )}
                                  {p.featured && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/30 text-[10px] uppercase tracking-wider text-amber-700 dark:text-amber-400 font-semibold">
                                      <Star className="w-2.5 h-2.5" />
                                      Featured
                                    </span>
                                  )}
                                  <StatusBadge status={p.status} />
                                </div>
                                <Link
                                  to={`/admin/blog/edit/${p.id}`}
                                  className="block"
                                >
                                  <h3 className="font-serif text-base font-bold text-stone-900 dark:text-stone-50 leading-snug hover:text-rose-700 dark:hover:text-rose-400 transition line-clamp-2">
                                    {p.title}
                                  </h3>
                                </Link>
                              </div>
                            </div>

                            {/* Author */}
                            <div className="md:col-span-2 flex items-center gap-2 min-w-0">
                              <Avatar author={author} />
                              <div className="min-w-0">
                                <p className="text-xs font-medium text-stone-800 dark:text-stone-200 truncate">
                                  {author?.name || "Unassigned"}
                                </p>
                                <p className="text-[10px] text-stone-500 truncate">
                                  {p.readingTime || 5} min ·{" "}
                                  {(p.views || 0).toLocaleString()} reads
                                </p>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="md:col-span-2 flex items-center md:justify-end gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition">
                              <button
                                onClick={() => toggleFeatured(p)}
                                title={p.featured ? "Unfeature" : "Feature"}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-stone-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition"
                              >
                                <Star className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => togglePublish(p)}
                                title={
                                  p.status === "published"
                                    ? "Unpublish"
                                    : "Publish"
                                }
                                className="w-8 h-8 rounded-full flex items-center justify-center text-stone-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition"
                              >
                                {p.status === "published" ? (
                                  <EyeOff className="w-3.5 h-3.5" />
                                ) : (
                                  <Send className="w-3.5 h-3.5" />
                                )}
                              </button>
                              <a
                                href={`/blog/${p.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="View on the journal"
                                className="w-8 h-8 rounded-full flex items-center justify-center text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-900 transition"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                              <button
                                onClick={() => duplicate(p)}
                                title="Duplicate as draft"
                                className="w-8 h-8 rounded-full hidden xl:flex items-center justify-center text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-900 transition"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <Link
                                to={`/admin/blog/edit/${p.id}`}
                                title="Edit"
                                className="w-8 h-8 rounded-full flex items-center justify-center text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-900 transition"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </Link>
                              <button
                                onClick={() => setDeleteTarget(p)}
                                title="Delete"
                                className="w-8 h-8 rounded-full flex items-center justify-center text-stone-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.section>
            );
          })}
        </div>
      )}

      {!loading && grouped.length > 0 && (
        <p className="text-xs text-stone-500 dark:text-stone-500 text-center">
          {filtered.length} {filtered.length === 1 ? "story" : "stories"} shown ·{" "}
          {grouped.length} {grouped.length === 1 ? "month" : "months"}
        </p>
      )}

      <ConfirmDelete
        open={!!deleteTarget}
        post={deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        deleting={deleting}
      />
    </div>
  );
};

export default AdminBlogArchive;