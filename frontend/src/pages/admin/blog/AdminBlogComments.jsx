// src/pages/admin/blog/AdminBlogComments.jsx — EDITORIAL ADMIN
// Comment moderation for The Alveoly Journal.
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Check, X, Trash2, Loader2, MessageSquare, Reply,
  Flag, Shield, AlertCircle, Send, ExternalLink, ArrowLeft,
  Clock, User, Heart, CornerDownRight, Eye, EyeOff, Ban,
  CheckCircle, AlertTriangle, Sparkles, Filter, ChevronDown,
} from "lucide-react";
import { toast } from "react-hot-toast";
// import blogAPI from "../../../api/blogApi"; // ← enable when backend ready
import {
  posts as mockPosts,
  authors as mockAuthors,
} from "../../../data/blogData";

/* ============================================================
   HELPERS
============================================================ */

const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

const formatRelative = (dateString) => {
  if (!dateString) return "";
  const diff = Date.now() - new Date(dateString).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (d < 7) return `${d}d ago`;
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatShortDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

/* ---------- Mock comment set — replace with API ---------- */
const buildMockComments = (posts) => {
  const seeds = [
    {
      author: "Ngozi A.",
      role: "RN, Lagos",
      body: "I read this twice. The section on lifestyle changes being as effective as medication for some people finally made me book the appointment I'd been putting off. Thank you for writing it plainly.",
      status: "approved",
      likes: 14,
      hours: 6,
    },
    {
      author: "Dr. Samuel K.",
      role: "Family physician",
      body: "I recommend articles like this to my patients constantly. The DASH diet explanation is the clearest I've seen in a mainstream piece — no hand-waving, no overselling.",
      status: "approved",
      likes: 27,
      hours: 14,
    },
    {
      author: "Anonymous reader",
      role: "",
      body: "Has anyone tried the supplement recommended in the other article? Thinking of ordering the one with the discount code.",
      status: "pending",
      likes: 0,
      hours: 2,
      flag: "possible-spam",
    },
    {
      author: "Chinedu O.",
      role: "",
      body: "The medical advice here contradicts what my GP told me. Should I follow this instead?",
      status: "pending",
      likes: 3,
      hours: 4,
    },
    {
      author: "Fatima R.",
      role: "Public health student",
      body: "Could you link the WHO source you're referencing in paragraph three? I want to read the primary paper.",
      status: "pending",
      likes: 1,
      hours: 9,
    },
    {
      author: "Troll Account",
      role: "",
      body: "This is completely wrong. Doctors are just trying to sell you drugs. Real medicine is in nature, not in a pharmacy.",
      status: "spam",
      likes: 0,
      hours: 20,
      flag: "low-quality",
    },
    {
      author: "Adaeze N.",
      role: "Pharmacist",
      body: "One small correction: the article says lisinopril is an ARB, but it's actually an ACE inhibitor. Easy to swap those two.",
      status: "approved",
      likes: 42,
      hours: 30,
    },
    {
      author: "Bola A.",
      role: "",
      body: "Thank you so much for this. My mother has hypertension and I've been trying to explain the diet changes to her for months. I'll send her this.",
      status: "approved",
      likes: 18,
      hours: 48,
    },
  ];

  const out = [];
  seeds.forEach((s, i) => {
    const post = posts[i % posts.length];
    out.push({
      id: `cmt-${i + 1}`,
      postId: post.id,
      postSlug: post.slug,
      postTitle: post.title,
      authorName: s.author,
      authorRole: s.role,
      authorAvatar: null,
      body: s.body,
      status: s.status,
      likes: s.likes,
      flag: s.flag || null,
      createdAt: new Date(
        Date.now() - s.hours * 3600 * 1000
      ).toISOString(),
      replies: i === 1
        ? [
            {
              id: `cmt-${i + 1}-r1`,
              authorName: "Alveoly Editorial",
              body: "Thank you, Doctor. That means a lot coming from someone who prescribes this conversation every day.",
              createdAt: new Date(
                Date.now() - (s.hours - 1) * 3600 * 1000
              ).toISOString(),
            },
          ]
        : [],
    });
  });
  return out;
};

/* ============================================================
   PRIMITIVES
============================================================ */

const Avatar = ({ name, avatar, size = "sm" }) => {
  const cls =
    size === "sm" ? "w-8 h-8 text-[11px]" : "w-9 h-9 text-xs";
  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name}
        className={`${cls} rounded-full object-cover flex-shrink-0`}
      />
    );
  }
  return (
    <div
      className={`${cls} rounded-full bg-stone-800 dark:bg-stone-200 text-white dark:text-stone-900 flex items-center justify-center font-medium flex-shrink-0`}
    >
      {initials(name)}
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const map = {
    pending: {
      label: "Pending",
      tone:
        "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400",
      icon: Clock,
    },
    approved: {
      label: "Approved",
      tone:
        "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400",
      icon: CheckCircle,
    },
    spam: {
      label: "Spam",
      tone: "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400",
      icon: AlertTriangle,
    },
    deleted: {
      label: "Deleted",
      tone:
        "bg-stone-100 dark:bg-stone-900 text-stone-500 dark:text-stone-500",
      icon: X,
    },
  };
  const s = map[status] || map.pending;
  const Icon = s.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-semibold ${s.tone}`}
    >
      <Icon className="w-2.5 h-2.5" />
      {s.label}
    </span>
  );
};

/* ============================================================
   REPLY MODAL
============================================================ */

const ReplyBox = ({ comment, onSend, sending }) => {
  const [body, setBody] = useState("");

  const submit = () => {
    if (!body.trim()) return;
    onSend(body.trim());
    setBody("");
  };

  return (
    <div className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-800">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 flex items-center justify-center text-[10px] font-semibold flex-shrink-0">
          AE
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs uppercase tracking-wider text-stone-500 dark:text-stone-400 font-semibold mb-2">
            Reply as Alveoly Editorial
          </p>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            placeholder={`Reply to ${comment.authorName}…`}
            className="w-full px-3.5 py-2.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 transition resize-none"
          />
          <div className="flex items-center justify-end mt-2">
            <button
              onClick={submit}
              disabled={sending || !body.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-sm font-medium hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {sending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Sending…
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Send reply
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================
   CONFIRM BULK ACTION
============================================================ */

const ConfirmBulk = ({ open, count, action, onCancel, onConfirm, running }) => {
  const copy = {
    delete: {
      icon: Trash2,
      tone: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-50 dark:bg-rose-950/30",
      title: `Delete ${count} ${count === 1 ? "comment" : "comments"}?`,
      body:
        "This is permanent. If you just want them hidden from the public, mark them as Spam instead.",
      cta: "Delete permanently",
      ctaTone: "bg-rose-600 hover:bg-rose-700",
    },
    spam: {
      icon: Ban,
      tone: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-50 dark:bg-rose-950/30",
      title: `Mark ${count} as spam?`,
      body:
        "These comments will be hidden from the public and moved to the spam folder. Authors who post spam repeatedly can be blocked at the IP level.",
      cta: "Mark as spam",
      ctaTone: "bg-rose-600 hover:bg-rose-700",
    },
    approve: {
      icon: Check,
      tone: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
      title: `Approve ${count} ${count === 1 ? "comment" : "comments"}?`,
      body:
        "Approved comments appear publicly under the story they were posted on.",
      cta: "Approve",
      ctaTone: "bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900",
    },
  }[action] || {};

  if (!copy.title) return null;
  const Icon = copy.icon;

  return (
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
            <div
              className={`w-12 h-12 rounded-full ${copy.bg} flex items-center justify-center mb-4`}
            >
              <Icon className={`w-5 h-5 ${copy.tone}`} />
            </div>
            <h3 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-50 mb-2">
              {copy.title}
            </h3>
            <p className="text-sm text-stone-600 dark:text-stone-400 mb-6 leading-relaxed">
              {copy.body}
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={onCancel}
                disabled={running}
                className="px-4 py-2.5 text-sm text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={running}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-medium transition disabled:opacity-50 ${copy.ctaTone}`}
              >
                {running ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Working…
                  </>
                ) : (
                  <>
                    <Icon className="w-3.5 h-3.5" />
                    {copy.cta}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

/* ============================================================
   MAIN
============================================================ */

const STATUS_TABS = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "spam", label: "Spam" },
  { key: "all", label: "All" },
];

const AdminBlogComments = () => {
  const [comments, setComments] = useState([]);
  const [posts, setPosts] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState("pending");
  const [search, setSearch] = useState("");
  const [postFilter, setPostFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [activeId, setActiveId] = useState(null);
  const [replying, setReplying] = useState(false);

  const [bulkConfirm, setBulkConfirm] = useState(null); // "approve" | "spam" | "delete"
  const [bulkRunning, setBulkRunning] = useState(false);

  /* ---------- Load ---------- */
  useEffect(() => {
    setPosts(mockPosts);
    setAuthors(mockAuthors);
    setComments(buildMockComments(mockPosts));
    setTimeout(() => setLoading(false), 300);
  }, []);

  /* ---------- Derived ---------- */
  const postById = useMemo(() => {
    const m = new Map();
    posts.forEach((p) => m.set(p.id, p));
    return m;
  }, [posts]);

  const statusCounts = useMemo(() => {
    const base = { all: comments.length, pending: 0, approved: 0, spam: 0, deleted: 0 };
    comments.forEach((c) => {
      base[c.status] = (base[c.status] || 0) + 1;
    });
    return base;
  }, [comments]);

  const filtered = useMemo(() => {
    let list = [...comments];

    if (statusFilter !== "all") {
      list = list.filter((c) => c.status === statusFilter);
    }
    if (postFilter !== "all") {
      list = list.filter((c) => c.postId === postFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.authorName.toLowerCase().includes(q) ||
          c.body.toLowerCase().includes(q) ||
          (c.postTitle || "").toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      if (sortBy === "newest")
        return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "oldest")
        return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "likes") return (b.likes || 0) - (a.likes || 0);
      return 0;
    });

    return list;
  }, [comments, statusFilter, postFilter, search, sortBy]);

  const activeComment = useMemo(
    () => comments.find((c) => c.id === activeId) || null,
    [comments, activeId]
  );

  const activePost = activeComment ? postById.get(activeComment.postId) : null;

  /* ---------- Selection ---------- */
  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === filtered.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filtered.map((c) => c.id)));
  };

  const clearSelection = () => setSelectedIds(new Set());

  /* ---------- Row actions ---------- */
  const updateStatus = (id, status) => {
    setComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status } : c))
    );
    const labels = {
      approved: "approved",
      spam: "marked as spam",
      pending: "moved back to pending",
      deleted: "deleted",
    };
    toast.success(`Comment ${labels[status] || "updated"}`);
  };

  const deleteComment = (id) => {
    setComments((prev) => prev.filter((c) => c.id !== id));
    if (activeId === id) setActiveId(null);
    toast.success("Comment deleted");
  };

  const sendReply = async (comment, body) => {
    setReplying(true);
    await new Promise((r) => setTimeout(r, 400));
    setComments((prev) =>
      prev.map((c) =>
        c.id === comment.id
          ? {
              ...c,
              replies: [
                ...(c.replies || []),
                {
                  id: `${c.id}-r-${Date.now()}`,
                  authorName: "Alveoly Editorial",
                  body,
                  createdAt: new Date().toISOString(),
                },
              ],
            }
          : c
      )
    );
    setReplying(false);
    toast.success("Reply sent");
  };

  /* ---------- Bulk ---------- */
  const runBulk = async (action) => {
    setBulkRunning(true);
    await new Promise((r) => setTimeout(r, 400));

    const ids = [...selectedIds];

    if (action === "delete") {
      setComments((prev) => prev.filter((c) => !selectedIds.has(c.id)));
      toast.success(`${ids.length} deleted`);
    } else if (action === "spam") {
      setComments((prev) =>
        prev.map((c) =>
          selectedIds.has(c.id) ? { ...c, status: "spam" } : c
        )
      );
      toast.success(`${ids.length} marked as spam`);
    } else if (action === "approve") {
      setComments((prev) =>
        prev.map((c) =>
          selectedIds.has(c.id) ? { ...c, status: "approved" } : c
        )
      );
      toast.success(`${ids.length} approved`);
    }

    setBulkRunning(false);
    setBulkConfirm(null);
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
            Discussion
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-2 max-w-2xl">
            Every comment left on a story passes through this queue. Approve
            the ones that add to the conversation. Hide the ones that don't.
          </p>
        </div>
      </div>

      {/* ---------- STATUS TABS ---------- */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 -mx-1 px-1">
        {STATUS_TABS.map((t) => {
          const count =
            t.key === "all"
              ? statusCounts.all
              : statusCounts[t.key] || 0;
          return (
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
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ---------- TOOLBAR ---------- */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3 p-3 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950">
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, text, or story…"
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-transparent text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={postFilter}
            onChange={(e) => setPostFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-transparent border border-stone-200 dark:border-stone-800 text-sm text-stone-700 dark:text-stone-300 focus:outline-none cursor-pointer max-w-[220px]"
          >
            <option value="all">All stories</option>
            {posts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title.length > 40
                  ? p.title.slice(0, 40) + "…"
                  : p.title}
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
            <option value="likes">Most liked</option>
          </select>
        </div>
      </div>

      {/* ---------- LIST + DETAIL ---------- */}
      {loading ? (
        <div className="py-20 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-stone-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center max-w-md mx-auto">
          <p className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100 mb-3">
            {comments.length === 0
              ? "No comments yet"
              : statusFilter === "pending"
              ? "Queue is clear"
              : "Nothing matches"}
          </p>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            {comments.length === 0
              ? "When readers start the conversation, comments will appear here."
              : statusFilter === "pending"
              ? "Every comment has been moderated. Nothing is waiting for review."
              : "Try a different filter or search."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT — list */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 overflow-hidden">
              {/* Select-all header */}
              <div className="flex items-center gap-3 px-5 py-3 bg-stone-50 dark:bg-stone-900/50 border-b border-stone-200 dark:border-stone-800">
                <input
                  type="checkbox"
                  checked={
                    filtered.length > 0 &&
                    selectedIds.size === filtered.length
                  }
                  onChange={selectAll}
                  className="w-4 h-4 rounded border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:ring-0"
                />
                <span className="text-xs uppercase tracking-widest text-stone-500 dark:text-stone-400 font-semibold">
                  {filtered.length}{" "}
                  {filtered.length === 1 ? "comment" : "comments"}
                </span>
              </div>

              {filtered.map((c, i) => {
                const isSelected = selectedIds.has(c.id);
                const isActive = activeId === c.id;
                return (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: Math.min(i * 0.015, 0.25) }}
                    onClick={() => setActiveId(c.id)}
                    className={`grid grid-cols-[auto_1fr_auto] gap-3 px-5 py-4 items-start cursor-pointer group transition ${
                      i > 0
                        ? "border-t border-stone-100 dark:border-stone-900"
                        : ""
                    } ${
                      isActive
                        ? "bg-stone-50 dark:bg-stone-900/50"
                        : "hover:bg-stone-50/50 dark:hover:bg-stone-900/30"
                    }`}
                  >
                    {/* Checkbox */}
                    <div
                      className="pt-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(c.id)}
                        className="w-4 h-4 rounded border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:ring-0"
                      />
                    </div>

                    {/* Body */}
                    <div className="min-w-0">
                      <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mb-1.5">
                        <Avatar name={c.authorName} avatar={c.authorAvatar} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
                            {c.authorName}
                          </p>
                          <p className="text-xs text-stone-500 dark:text-stone-500">
                            {c.authorRole || "Reader"} ·{" "}
                            {formatRelative(c.createdAt)}
                          </p>
                        </div>
                        <StatusBadge status={c.status} />
                        {c.flag && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/30 text-[10px] uppercase tracking-wider text-amber-700 dark:text-amber-400 font-semibold">
                            <Flag className="w-2.5 h-2.5" />
                            {c.flag === "possible-spam"
                              ? "Possible spam"
                              : "Needs review"}
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed line-clamp-2 mb-2">
                        {c.body}
                      </p>

                      <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-stone-500 dark:text-stone-500">
                        <span className="flex items-center gap-1.5">
                          <Heart className="w-3 h-3" />
                          {c.likes}
                        </span>
                        {c.replies?.length > 0 && (
                          <span className="flex items-center gap-1.5">
                            <Reply className="w-3 h-3" />
                            {c.replies.length} repl
                            {c.replies.length === 1 ? "y" : "ies"}
                          </span>
                        )}
                        <span className="flex items-center gap-1.5 truncate max-w-[240px]">
                          <MessageSquare className="w-3 h-3" />
                          {c.postTitle}
                        </span>
                      </div>
                    </div>

                    {/* Quick actions */}
                    <div
                      className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {c.status !== "approved" && (
                        <button
                          onClick={() => updateStatus(c.id, "approved")}
                          title="Approve"
                          className="w-8 h-8 rounded-full flex items-center justify-center text-stone-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {c.status !== "spam" && (
                        <button
                          onClick={() => updateStatus(c.id, "spam")}
                          title="Mark as spam"
                          className="w-8 h-8 rounded-full flex items-center justify-center text-stone-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteComment(c.id)}
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
          </div>

          {/* RIGHT — detail */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-24 space-y-4">
              {activeComment ? (
                <>
                  {/* Comment context */}
                  <div className="p-6 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-xs uppercase tracking-widest text-rose-600 dark:text-rose-400 font-semibold">
                        Selected comment
                      </p>
                      <button
                        onClick={() => setActiveId(null)}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-900 transition"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                      <Avatar
                        name={activeComment.authorName}
                        avatar={activeComment.authorAvatar}
                        size="md"
                      />
                      <div className="min-w-0">
                        <p className="font-medium text-stone-900 dark:text-stone-100 truncate">
                          {activeComment.authorName}
                        </p>
                        <p className="text-xs text-stone-500">
                          {activeComment.authorRole || "Reader"} ·{" "}
                          {formatRelative(activeComment.createdAt)}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed mb-4">
                      {activeComment.body}
                    </p>

                    <div className="flex items-center gap-2 pb-4 mb-4 border-b border-stone-200 dark:border-stone-800">
                      <StatusBadge status={activeComment.status} />
                      {activeComment.flag && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/30 text-[10px] uppercase tracking-wider text-amber-700 dark:text-amber-400 font-semibold">
                          <Flag className="w-2.5 h-2.5" />
                          {activeComment.flag === "possible-spam"
                            ? "Possible spam"
                            : "Needs review"}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {activeComment.status !== "approved" && (
                        <button
                          onClick={() =>
                            updateStatus(activeComment.id, "approved")
                          }
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-medium hover:opacity-90 transition"
                        >
                          <Check className="w-3 h-3" />
                          Approve
                        </button>
                      )}
                      {activeComment.status !== "spam" && (
                        <button
                          onClick={() =>
                            updateStatus(activeComment.id, "spam")
                          }
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 text-xs font-medium hover:border-rose-400 hover:text-rose-600 transition"
                        >
                          <Ban className="w-3 h-3" />
                          Mark spam
                        </button>
                      )}
                      <button
                        onClick={() => deleteComment(activeComment.id)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 text-xs font-medium hover:border-rose-400 hover:text-rose-600 transition"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </div>

                    {/* Replies */}
                    {activeComment.replies?.length > 0 && (
                      <div className="mt-5 pt-4 border-t border-stone-200 dark:border-stone-800 space-y-3">
                        <p className="text-xs uppercase tracking-widest text-stone-500 dark:text-stone-400 font-semibold">
                          Replies
                        </p>
                        {activeComment.replies.map((r) => (
                          <div
                            key={r.id}
                            className="flex items-start gap-3 pl-3 border-l-2 border-stone-200 dark:border-stone-800"
                          >
                            <CornerDownRight className="w-3.5 h-3.5 text-stone-400 mt-1 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-medium text-stone-700 dark:text-stone-300">
                                {r.authorName}
                                <span className="text-stone-400 dark:text-stone-600 font-normal">
                                  {" · "}
                                  {formatRelative(r.createdAt)}
                                </span>
                              </p>
                              <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed mt-1">
                                {r.body}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply box */}
                    <ReplyBox
                      comment={activeComment}
                      onSend={(body) => sendReply(activeComment, body)}
                      sending={replying}
                    />
                  </div>

                  {/* Post context */}
                  {activePost && (
                    <div className="p-5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950">
                      <p className="text-xs uppercase tracking-widest text-stone-500 dark:text-stone-400 font-semibold mb-3">
                        On story
                      </p>
                      <Link
                        to={`/admin/blog/edit/${activePost.id}`}
                        className="block group"
                      >
                        <div className="flex items-start gap-3">
                          {activePost.image && (
                            <img
                              src={activePost.image}
                              alt=""
                              className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                            />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-serif font-bold text-stone-900 dark:text-stone-100 leading-snug line-clamp-2 group-hover:text-rose-700 dark:group-hover:text-rose-400 transition">
                              {activePost.title}
                            </p>
                            <p className="text-xs text-stone-500 mt-1">
                              {formatShortDate(activePost.publishedAt)}
                            </p>
                          </div>
                        </div>
                      </Link>
                      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-stone-200 dark:border-stone-800">
                        <Link
                          to={`/admin/blog/edit/${activePost.id}`}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition"
                        >
                          <MessageSquare className="w-3 h-3" />
                          Open editor
                        </Link>
                        <a
                          href={`/blog/${activePost.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View on journal
                        </a>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-6 rounded-2xl border border-dashed border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-center">
                  <MessageSquare className="w-8 h-8 text-stone-300 dark:text-stone-700 mx-auto mb-3" />
                  <p className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Select a comment
                  </p>
                  <p className="text-xs text-stone-500 dark:text-stone-500 leading-relaxed">
                    Click any comment on the left to read it in full, see the
                    story it's on, reply as the editorial team, or moderate it.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ---------- BULK BAR ---------- */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: "spring", damping: 26 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-full shadow-2xl px-5 py-3 flex items-center gap-4"
          >
            <span className="text-sm font-medium whitespace-nowrap">
              {selectedIds.size} selected
            </span>
            <div className="h-5 w-px bg-white/20 dark:bg-stone-900/20" />

            <div className="flex items-center gap-1">
              <button
                onClick={() => setBulkConfirm("approve")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium hover:bg-white/10 dark:hover:bg-stone-900/10 transition"
              >
                <Check className="w-3 h-3" />
                Approve
              </button>
              <button
                onClick={() => setBulkConfirm("spam")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium hover:bg-white/10 dark:hover:bg-stone-900/10 transition"
              >
                <Ban className="w-3 h-3" />
                Spam
              </button>
              <button
                onClick={() => setBulkConfirm("delete")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium hover:bg-rose-500/20 text-rose-200 dark:text-rose-700 transition"
              >
                <Trash2 className="w-3 h-3" />
                Delete
              </button>
            </div>

            <div className="h-5 w-px bg-white/20 dark:bg-stone-900/20" />

            <button
              onClick={clearSelection}
              className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10 dark:hover:bg-stone-900/10 transition"
              aria-label="Clear selection"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------- BULK CONFIRM ---------- */}
      <ConfirmBulk
        open={!!bulkConfirm}
        count={selectedIds.size}
        action={bulkConfirm}
        onCancel={() => setBulkConfirm(null)}
        onConfirm={() => runBulk(bulkConfirm)}
        running={bulkRunning}
      />
    </div>
  );
};

export default AdminBlogComments;