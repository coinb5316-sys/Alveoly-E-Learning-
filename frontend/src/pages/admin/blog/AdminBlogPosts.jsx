// src/pages/admin/blog/AdminBlogPosts.jsx — EDITORIAL ADMIN
// Post management for The Alveoly Journal.
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Plus, X, Edit3, Trash2, Loader2, Eye, EyeOff,
  CheckCircle, AlertCircle, Star, TrendingUp, Sparkles, Filter,
  ArrowUpDown, MoreHorizontal, ExternalLink, Check, ChevronDown,
  Calendar, Clock, Heart, MessageSquare, FileText, Award,
  Shield, Copy, Send, Archive,
} from "lucide-react";
import { toast } from "react-hot-toast";
// import blogAPI from "../../../api/blogApi"; // ← enable when backend is ready
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

const STATUSES = {
  published: {
    label: "Published",
    tone: "emerald",
    icon: CheckCircle,
  },
  draft: {
    label: "Draft",
    tone: "stone",
    icon: FileText,
  },
  scheduled: {
    label: "Scheduled",
    tone: "amber",
    icon: Calendar,
  },
  review: {
    label: "In review",
    tone: "sky",
    icon: Shield,
  },
  archived: {
    label: "Archived",
    tone: "stone",
    icon: Archive,
  },
};

/* ============================================================
   PRIMITIVES
============================================================ */

const Avatar = ({ author, size = "sm" }) => {
  const [broken, setBroken] = useState(false);
  const cls =
    size === "sm" ? "w-7 h-7 text-[10px]" : "w-9 h-9 text-xs";
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
  const s = STATUSES[status] || STATUSES.draft;
  const Icon = s.icon;
  const tones = {
    emerald:
      "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400",
    amber:
      "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400",
    sky: "bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-400",
    stone:
      "bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-400",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-semibold ${tones[s.tone]}`}
    >
      <Icon className="w-2.5 h-2.5" />
      {s.label}
    </span>
  );
};

/* ============================================================
   BULK ACTION BAR
============================================================ */

const BulkBar = ({ count, onClear, onPublish, onUnpublish, onFeature, onUnfeature, onDelete }) => (
  <AnimatePresence>
    {count > 0 && (
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", damping: 26 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-full shadow-2xl px-5 py-3 flex items-center gap-4"
      >
        <span className="text-sm font-medium whitespace-nowrap">
          {count} selected
        </span>
        <div className="h-5 w-px bg-white/20 dark:bg-stone-900/20" />

        <div className="flex items-center gap-1">
          <button
            onClick={onPublish}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium hover:bg-white/10 dark:hover:bg-stone-900/10 transition"
          >
            <Send className="w-3 h-3" />
            Publish
          </button>
          <button
            onClick={onUnpublish}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium hover:bg-white/10 dark:hover:bg-stone-900/10 transition"
          >
            <EyeOff className="w-3 h-3" />
            Unpublish
          </button>
          <button
            onClick={onFeature}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium hover:bg-white/10 dark:hover:bg-stone-900/10 transition"
          >
            <Star className="w-3 h-3" />
            Feature
          </button>
          <button
            onClick={onUnfeature}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium hover:bg-white/10 dark:hover:bg-stone-900/10 transition"
          >
            <Star className="w-3 h-3" />
            Unfeature
          </button>
          <button
            onClick={onDelete}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium hover:bg-rose-500/20 text-rose-200 dark:text-rose-700 transition"
          >
            <Trash2 className="w-3 h-3" />
            Delete
          </button>
        </div>

        <div className="h-5 w-px bg-white/20 dark:bg-stone-900/20" />
        <button
          onClick={onClear}
          className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10 dark:hover:bg-stone-900/10 transition"
          aria-label="Clear selection"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </motion.div>
    )}
  </AnimatePresence>
);

/* ============================================================
   CONFIRM DELETE
============================================================ */

const ConfirmBulkDelete = ({ open, count, onCancel, onConfirm, deleting }) => (
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
            Delete {count} {count === 1 ? "story" : "stories"}?
          </h3>
          <p className="text-sm text-stone-600 dark:text-stone-400 mb-6 leading-relaxed">
            This cannot be undone. If you want to hide them without losing the
            content, use <strong>Unpublish</strong> instead.
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
                  Delete permanently
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

const AdminBlogPosts = () => {
  const [posts, setPosts] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [authorFilter, setAuthorFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const [selected, setSelected] = useState(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  /* ---------- Load ---------- */
  useEffect(() => {
    // Replace with blogAPI.getPosts({ publishedOnly: false }) + getAuthors + getCategories
    const normalized = mockPosts.map((p) => ({
      ...p,
      status: p.status || "published", // mock data doesn't ship a status
      featured: !!p.featured,
      editorsPick: !!p.editorsPick,
      medicallyReviewed: !!p.medicallyReviewed,
    }));
    setPosts(normalized);
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

  const statusCounts = useMemo(() => {
    const base = {
      all: posts.length,
      published: 0,
      draft: 0,
      scheduled: 0,
      review: 0,
      archived: 0,
    };
    posts.forEach((p) => {
      base[p.status] = (base[p.status] || 0) + 1;
    });
    return base;
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

    if (statusFilter !== "all") {
      list = list.filter((p) => p.status === statusFilter);
    }

    if (categoryFilter !== "all") {
      list = list.filter((p) => p.categoryId === categoryFilter);
    }

    if (authorFilter !== "all") {
      list = list.filter((p) => p.authorId === authorFilter);
    }

    list.sort((a, b) => {
      if (sortBy === "newest")
        return new Date(b.publishedAt) - new Date(a.publishedAt);
      if (sortBy === "oldest")
        return new Date(a.publishedAt) - new Date(b.publishedAt);
      if (sortBy === "views") return (b.views || 0) - (a.views || 0);
      if (sortBy === "likes") return (b.likes || 0) - (a.likes || 0);
      if (sortBy === "title") return a.title.localeCompare(b.title);
      return 0;
    });

    return list;
  }, [
    posts,
    search,
    statusFilter,
    categoryFilter,
    authorFilter,
    sortBy,
    authorById,
  ]);

  /* ---------- Selection ---------- */
  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((p) => p.id)));
  };

  const clearSelection = () => setSelected(new Set());

  /* ---------- Row Actions ---------- */
  const toggleFeature = (post) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === post.id ? { ...p, featured: !p.featured } : p))
    );
    toast.success(`${post.title} ${post.featured ? "unfeatured" : "featured"}`);
  };

  const togglePublish = (post) => {
    const nextStatus = post.status === "published" ? "draft" : "published";
    setPosts((prev) =>
      prev.map((p) => (p.id === post.id ? { ...p, status: nextStatus } : p))
    );
    toast.success(
      nextStatus === "published" ? "Published" : "Moved back to draft"
    );
  };

  const deleteOne = (post) => {
    // In a real app, this opens a confirm modal. Here we do an optimistic delete.
    if (!window.confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    setPosts((prev) => prev.filter((p) => p.id !== post.id));
    toast.success("Story deleted");
  };

  const duplicate = (post) => {
    const copy = {
      ...post,
      id: `${post.id}-copy-${Date.now()}`,
      title: `${post.title} (copy)`,
      status: "draft",
      publishedAt: new Date().toISOString(),
      views: 0,
      likes: 0,
      comments: 0,
    };
    setPosts((prev) => [copy, ...prev]);
    toast.success("Duplicated as draft");
  };

  /* ---------- Bulk Actions ---------- */
  const applyBulkStatus = (status) => {
    setPosts((prev) =>
      prev.map((p) => (selected.has(p.id) ? { ...p, status } : p))
    );
    toast.success(
      `${selected.size} ${selected.size === 1 ? "story" : "stories"} updated`
    );
    clearSelection();
  };

  const applyBulkFeature = (featured) => {
    setPosts((prev) =>
      prev.map((p) => (selected.has(p.id) ? { ...p, featured } : p))
    );
    toast.success(
      `${selected.size} ${selected.size === 1 ? "story" : "stories"} updated`
    );
    clearSelection();
  };

  const confirmBulkDelete = async () => {
    setBulkDeleting(true);
    await new Promise((r) => setTimeout(r, 400));
    setPosts((prev) => prev.filter((p) => !selected.has(p.id)));
    toast.success(
      `${selected.size} ${selected.size === 1 ? "story" : "stories"} deleted`
    );
    setBulkDeleting(false);
    setBulkDeleteOpen(false);
    clearSelection();
  };

  /* ---------- Render ---------- */
  return (
    <div className="space-y-6 pb-24">
      {/* ---------- HEADER ---------- */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-rose-600 dark:text-rose-400 font-semibold mb-2">
            The Alveoly Journal
          </p>
          <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
            Stories
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-2 max-w-2xl">
            Every article in the journal — published, drafted, scheduled, or in
            medical review. This is where the journal gets made.
          </p>
        </div>

        <Link
          to="/admin/blog/create"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-sm font-medium hover:opacity-90 transition self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          Write a story
        </Link>
      </div>

      {/* ---------- STATUS TABS ---------- */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 -mx-1 px-1">
        {[
          { key: "all", label: "All", count: statusCounts.all },
          { key: "published", label: "Published", count: statusCounts.published },
          { key: "draft", label: "Drafts", count: statusCounts.draft },
          { key: "scheduled", label: "Scheduled", count: statusCounts.scheduled },
          { key: "review", label: "In review", count: statusCounts.review },
          { key: "archived", label: "Archived", count: statusCounts.archived },
        ]
          .filter((t) => t.count > 0 || t.key === "all")
          .map((t) => (
            <button
              key={t.key}
              onClick={() => {
                setStatusFilter(t.key);
                clearSelection();
              }}
              className={`flex-shrink-0 inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium transition ${
                statusFilter === t.key
                  ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900"
                  : "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-900"
              }`}
            >
              <span>{t.label}</span>
              <span
                className={`text-[10px] ${
                  statusFilter === t.key
                    ? "opacity-70"
                    : "text-stone-400 dark:text-stone-600"
                }`}
              >
                {t.count}
              </span>
            </button>
          ))}
      </div>

      {/* ---------- TOOLBAR ---------- */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3 p-3 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950">
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, excerpt, tag, or author…"
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-transparent text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-transparent border border-stone-200 dark:border-stone-800 text-sm text-stone-700 dark:text-stone-300 focus:outline-none cursor-pointer max-w-[160px]"
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={authorFilter}
            onChange={(e) => setAuthorFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-transparent border border-stone-200 dark:border-stone-800 text-sm text-stone-700 dark:text-stone-300 focus:outline-none cursor-pointer max-w-[180px]"
          >
            <option value="all">All authors</option>
            {authors.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
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
            <option value="views">Most read</option>
            <option value="likes">Most liked</option>
            <option value="title">Sort: A–Z</option>
          </select>
        </div>
      </div>

      {/* ---------- LIST ---------- */}
      {loading ? (
        <div className="py-20 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-stone-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center max-w-md mx-auto">
          <p className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100 mb-3">
            {posts.length === 0 ? "No stories yet" : "No stories match"}
          </p>
          <p className="text-sm text-stone-500 dark:text-stone-400 mb-6">
            {posts.length === 0
              ? "Write the first story to start publishing."
              : "Try a different search, category, or author."}
          </p>
          {posts.length === 0 && (
            <Link
              to="/admin/blog/create"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-sm font-medium hover:opacity-90 transition"
            >
              <Plus className="w-4 h-4" />
              Write your first story
            </Link>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 overflow-hidden">
          {/* Column headers */}
          <div className="hidden lg:grid grid-cols-12 gap-4 px-5 py-3 bg-stone-50 dark:bg-stone-900/50 border-b border-stone-200 dark:border-stone-800 text-[10px] uppercase tracking-widest text-stone-500 dark:text-stone-400 font-semibold">
            <div className="col-span-1 flex items-center">
              <input
                type="checkbox"
                checked={
                  filtered.length > 0 && selected.size === filtered.length
                }
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:ring-0"
              />
            </div>
            <div className="col-span-6 flex items-center gap-1.5">
              <ArrowUpDown className="w-3 h-3" />
              Story
            </div>
            <div className="col-span-2">Author</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>

          {filtered.map((p, i) => {
            const author = authorById.get(p.authorId);
            const category = categoryById.get(p.categoryId);
            const isSelected = selected.has(p.id);
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: Math.min(i * 0.015, 0.25) }}
                className={`grid grid-cols-1 lg:grid-cols-12 gap-4 px-5 py-4 items-start lg:items-center group hover:bg-stone-50/60 dark:hover:bg-stone-900/30 transition ${
                  i > 0 ? "border-t border-stone-100 dark:border-stone-900" : ""
                } ${isSelected ? "bg-stone-50 dark:bg-stone-900/50" : ""}`}
              >
                {/* Checkbox */}
                <div className="lg:col-span-1 flex items-center">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(p.id)}
                    className="w-4 h-4 rounded border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:ring-0"
                  />
                </div>

                {/* Story */}
                <div className="lg:col-span-6 min-w-0 flex gap-3">
                  {p.image && (
                    <img
                      src={p.image}
                      alt={p.title}
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0 hidden sm:block"
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
                      {p.editorsPick && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/30 text-[10px] uppercase tracking-wider text-rose-700 dark:text-rose-400 font-semibold">
                          <Sparkles className="w-2.5 h-2.5" />
                          Editor's pick
                        </span>
                      )}
                      {p.medicallyReviewed && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-[10px] uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-semibold">
                          <Shield className="w-2.5 h-2.5" />
                          Reviewed
                        </span>
                      )}
                    </div>

                    <Link
                      to={`/admin/blog/edit/${p.id}`}
                      className="block"
                    >
                      <h3 className="font-serif text-base font-bold text-stone-900 dark:text-stone-50 leading-snug hover:text-rose-700 dark:hover:text-rose-400 transition line-clamp-2">
                        {p.title}
                      </h3>
                    </Link>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-stone-500 dark:text-stone-500">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" />
                        {formatShortDate(p.publishedAt)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        {p.readingTime || 5} min
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Eye className="w-3 h-3" />
                        {(p.views || 0).toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Heart className="w-3 h-3" />
                        {p.likes || 0}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MessageSquare className="w-3 h-3" />
                        {p.comments || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Author */}
                <div className="lg:col-span-2 flex items-center gap-2.5 min-w-0">
                  <Avatar author={author} size="sm" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-stone-800 dark:text-stone-200 truncate">
                      {author?.name || "Unassigned"}
                    </p>
                    <p className="text-xs text-stone-500 truncate">
                      {author?.role || "—"}
                    </p>
                  </div>
                </div>

                {/* Status */}
                <div className="lg:col-span-2">
                  <StatusBadge status={p.status} />
                </div>

                {/* Actions */}
                <div className="lg:col-span-1 flex items-center lg:justify-end gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition">
                  <Link
                    to={`/admin/blog/edit/${p.id}`}
                    title="Edit"
                    className="w-8 h-8 rounded-full flex items-center justify-center text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-900 transition"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    onClick={() => toggleFeature(p)}
                    title={p.featured ? "Unfeature" : "Feature"}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-stone-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition"
                  >
                    <Star className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => togglePublish(p)}
                    title={p.status === "published" ? "Unpublish" : "Publish"}
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
                  <button
                    onClick={() => deleteOne(p)}
                    title="Delete"
                    className="w-8 h-8 rounded-full flex items-center justify-center text-stone-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ---------- FOOTER HINT ---------- */}
      {!loading && filtered.length > 0 && (
        <p className="text-xs text-stone-500 dark:text-stone-500 text-center">
          {filtered.length} {filtered.length === 1 ? "story" : "stories"} shown
          {statusFilter !== "all" && (
            <> · filtered by {STATUSES[statusFilter]?.label.toLowerCase()}</>
          )}
        </p>
      )}

      {/* ---------- BULK BAR ---------- */}
      <BulkBar
        count={selected.size}
        onClear={clearSelection}
        onPublish={() => applyBulkStatus("published")}
        onUnpublish={() => applyBulkStatus("draft")}
        onFeature={() => applyBulkFeature(true)}
        onUnfeature={() => applyBulkFeature(false)}
        onDelete={() => setBulkDeleteOpen(true)}
      />

      {/* ---------- BULK DELETE MODAL ---------- */}
      <ConfirmBulkDelete
        open={bulkDeleteOpen}
        count={selected.size}
        onCancel={() => setBulkDeleteOpen(false)}
        onConfirm={confirmBulkDelete}
        deleting={bulkDeleting}
      />
    </div>
  );
};

export default AdminBlogPosts;