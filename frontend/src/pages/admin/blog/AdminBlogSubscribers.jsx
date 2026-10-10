// src/pages/admin/blog/AdminBlogSubscribers.jsx — EDITORIAL ADMIN
// Newsletter subscriber list for The Alveoly Letter.
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Plus, X, Trash2, Loader2, Save, AlertCircle,
  Mail, Check, CheckCircle, Clock, AlertTriangle, Send,
  Download, Copy, Filter, ArrowUpDown, Eye, EyeOff,
  Calendar, Tag, UserPlus, UserMinus, Ban, ExternalLink,
  ChevronDown, Sparkles,
} from "lucide-react";
import { toast } from "react-hot-toast";
// import blogAPI from "../../../api/blogApi"; // ← enable when backend ready

/* ============================================================
   MOCK SUBSCRIBERS — replace with API
============================================================ */

const buildMockSubscribers = () => {
  const seeds = [
    { email: "ngozi.adeyemi@gmail.com", name: "Ngozi Adeyemi", source: "footer", status: "active", days: 3 },
    { email: "samuel.kalu@outlook.com", name: "Dr. Samuel Kalu", source: "article", status: "active", days: 5 },
    { email: "fatima.bello@yahoo.com", name: "Fatima Bello", source: "footer", status: "active", days: 8 },
    { email: "bola.a@gmail.com", name: "Bola Akinyemi", source: "article", status: "active", days: 12 },
    { email: "adaeze.nwosu@clinic.ng", name: "Adaeze Nwosu", source: "podcast", status: "active", days: 20 },
    { email: "grace.otieno@chw.org", name: "Grace Otieno", source: "footer", status: "active", days: 26 },
    { email: "invalid-email", name: "", source: "footer", status: "bounced", days: 30 },
    { email: "chidi.n@example.com", name: "Chidi N.", source: "sidebar", status: "unsubscribed", days: 45 },
    { email: "tunde.o@example.com", name: "", source: "footer", status: "pending", days: 2 },
    { email: "amara.new@clinic.ng", name: "Amara New", source: "article", status: "active", days: 1 },
  ];
  return seeds.map((s, i) => ({
    id: `sub-${i + 1}`,
    email: s.email,
    name: s.name,
    source: s.source,
    status: s.status,
    tags: [],
    subscribedAt: new Date(Date.now() - s.days * 86400 * 1000).toISOString(),
    lastOpenedAt:
      s.status === "active"
        ? new Date(Date.now() - Math.random() * 10 * 86400 * 1000).toISOString()
        : null,
    opens: s.status === "active" ? Math.floor(Math.random() * 40) + 1 : 0,
    clicks: s.status === "active" ? Math.floor(Math.random() * 10) : 0,
  }));
};

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

const formatRelative = (d) => {
  if (!d) return "—";
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (days < 30) return `${days}d ago`;
  return formatShortDate(d);
};

const StatusBadge = ({ status }) => {
  const map = {
    active: {
      label: "Active",
      tone: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400",
      icon: CheckCircle,
    },
    pending: {
      label: "Pending",
      tone: "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400",
      icon: Clock,
    },
    unsubscribed: {
      label: "Unsubscribed",
      tone: "bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-400",
      icon: UserMinus,
    },
    bounced: {
      label: "Bounced",
      tone: "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400",
      icon: AlertTriangle,
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
   ADD SUBSCRIBER DRAWER
============================================================ */

const SubscriberDrawer = ({ open, onClose, onSave, saving }) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [tags, setTags] = useState([]);
  const [draftTag, setDraftTag] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setEmail("");
      setName("");
      setTags([]);
      setDraftTag("");
      setErrors({});
    }
  }, [open]);

  const addTag = () => {
    const v = draftTag.trim();
    if (!v || tags.includes(v)) return;
    setTags([...tags, v]);
    setDraftTag("");
  };

  const removeTag = (i) => setTags(tags.filter((_, idx) => idx !== i));

  const submit = () => {
    const e = {};
    if (!email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "Invalid email";
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    onSave({
      email: email.trim().toLowerCase(),
      name: name.trim(),
      tags,
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white dark:bg-stone-950 z-50 flex flex-col border-l border-stone-200 dark:border-stone-800"
          >
            <div className="flex-shrink-0 px-6 py-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-rose-600 dark:text-rose-400 font-semibold mb-1">
                  New subscriber
                </p>
                <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-50">
                  Add to the letter
                </h2>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full flex items-center justify-center text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-900 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2">
                  Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="reader@example.com"
                  autoFocus
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-sm focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 transition"
                />
                {errors.email && (
                  <p className="text-xs text-rose-600 dark:text-rose-400 mt-1.5 flex items-center gap-1.5">
                    <AlertCircle className="w-3 h-3" />
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2">
                  Name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Optional"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-sm focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map((t, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-900 text-xs text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800"
                    >
                      {t}
                      <button
                        type="button"
                        onClick={() => removeTag(i)}
                        className="text-stone-400 hover:text-rose-600 transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    value={draftTag}
                    onChange={(e) => setDraftTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    placeholder="e.g. clinician"
                    className="flex-1 px-3.5 py-2.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-sm focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 transition"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-3.5 py-2.5 rounded-lg bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-sm font-medium hover:opacity-90 transition"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                  This subscriber will be marked <strong>active</strong> and
                  added to the letter immediately. They'll receive the next
                  weekly send.
                </p>
              </div>
            </div>

            <div className="flex-shrink-0 px-6 py-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                disabled={saving}
                className="px-4 py-2.5 text-sm text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Adding…
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5" />
                    Add subscriber
                  </>
                )}
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

/* ============================================================
   BULK CONFIRM
============================================================ */

const ConfirmBulk = ({ open, count, action, onCancel, onConfirm, running }) => {
  const copy = {
    unsubscribe: {
      icon: UserMinus,
      tone: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/30",
      title: `Unsubscribe ${count} ${count === 1 ? "reader" : "readers"}?`,
      body: "They'll stop receiving the letter immediately. Their record stays in the list so you can re-subscribe them later.",
      cta: "Unsubscribe",
      ctaTone: "bg-amber-600 hover:bg-amber-700",
    },
    delete: {
      icon: Trash2,
      tone: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-50 dark:bg-rose-950/30",
      title: `Delete ${count} ${count === 1 ? "subscriber" : "subscribers"}?`,
      body: "This removes their record entirely. If you just want them to stop receiving emails, use Unsubscribe instead.",
      cta: "Delete permanently",
      ctaTone: "bg-rose-600 hover:bg-rose-700",
    },
    activate: {
      icon: CheckCircle,
      tone: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
      title: `Activate ${count} ${count === 1 ? "subscriber" : "subscribers"}?`,
      body: "They'll receive the next weekly letter. Useful if you've fixed bounced addresses.",
      cta: "Activate",
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
            <div className={`w-12 h-12 rounded-full ${copy.bg} flex items-center justify-center mb-4`}>
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
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "pending", label: "Pending" },
  { key: "unsubscribed", label: "Unsubscribed" },
  { key: "bounced", label: "Bounced" },
];

const SOURCE_LABELS = {
  footer: "Footer",
  article: "Article",
  sidebar: "Sidebar",
  podcast: "Podcast",
  import: "Imported",
  manual: "Manual",
};

const AdminBlogSubscribers = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [bulkConfirm, setBulkConfirm] = useState(null);
  const [bulkRunning, setBulkRunning] = useState(false);

  /* ---------- Load ---------- */
  useEffect(() => {
    setSubscribers(buildMockSubscribers());
    setTimeout(() => setLoading(false), 300);
  }, []);

  /* ---------- Derived ---------- */
  const statusCounts = useMemo(() => {
    const base = {
      all: subscribers.length,
      active: 0,
      pending: 0,
      unsubscribed: 0,
      bounced: 0,
    };
    subscribers.forEach((s) => {
      base[s.status] = (base[s.status] || 0) + 1;
    });
    return base;
  }, [subscribers]);

  const sources = useMemo(() => {
    const set = new Set();
    subscribers.forEach((s) => s.source && set.add(s.source));
    return [...set].sort();
  }, [subscribers]);

  const filtered = useMemo(() => {
    let list = [...subscribers];
    if (statusFilter !== "all") {
      list = list.filter((s) => s.status === statusFilter);
    }
    if (sourceFilter !== "all") {
      list = list.filter((s) => s.source === sourceFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.email.toLowerCase().includes(q) ||
          (s.name || "").toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      if (sortBy === "newest")
        return new Date(b.subscribedAt) - new Date(a.subscribedAt);
      if (sortBy === "oldest")
        return new Date(a.subscribedAt) - new Date(b.subscribedAt);
      if (sortBy === "email") return a.email.localeCompare(b.email);
      if (sortBy === "opens") return (b.opens || 0) - (a.opens || 0);
      return 0;
    });
    return list;
  }, [subscribers, statusFilter, sourceFilter, search, sortBy]);

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
    else setSelectedIds(new Set(filtered.map((s) => s.id)));
  };

  const clearSelection = () => setSelectedIds(new Set());

  /* ---------- Handlers ---------- */
  const handleAdd = async (payload) => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    setSubscribers((prev) => [
      {
        id: `sub-${Date.now()}`,
        email: payload.email,
        name: payload.name || "",
        source: "manual",
        status: "active",
        tags: payload.tags || [],
        subscribedAt: new Date().toISOString(),
        lastOpenedAt: null,
        opens: 0,
        clicks: 0,
      },
      ...prev,
    ]);
    toast.success("Subscriber added");
    setSaving(false);
    setDrawerOpen(false);
  };

  const toggleStatus = (s) => {
    const next =
      s.status === "active"
        ? "unsubscribed"
        : s.status === "unsubscribed" || s.status === "bounced"
        ? "active"
        : "active";
    setSubscribers((prev) =>
      prev.map((x) => (x.id === s.id ? { ...x, status: next } : x))
    );
    toast.success(
      next === "active" ? "Reactivated" : "Marked as unsubscribed"
    );
  };

  const copyEmail = (email) => {
    navigator.clipboard.writeText(email);
    toast.success("Email copied");
  };

  const exportCSV = () => {
    const rows = filtered.map((s) =>
      [s.email, s.name, s.source, s.status, s.subscribedAt].join(",")
    );
    const csv = ["email,name,source,status,subscribed_at", ...rows].join("\n");
    navigator.clipboard.writeText(csv);
    toast.success(`${filtered.length} rows copied as CSV`);
  };

  const runBulk = async (action) => {
    setBulkRunning(true);
    await new Promise((r) => setTimeout(r, 400));
    const ids = [...selectedIds];

    if (action === "delete") {
      setSubscribers((prev) => prev.filter((s) => !selectedIds.has(s.id)));
      toast.success(`${ids.length} deleted`);
    } else if (action === "unsubscribe") {
      setSubscribers((prev) =>
        prev.map((s) =>
          selectedIds.has(s.id) ? { ...s, status: "unsubscribed" } : s
        )
      );
      toast.success(`${ids.length} unsubscribed`);
    } else if (action === "activate") {
      setSubscribers((prev) =>
        prev.map((s) =>
          selectedIds.has(s.id) ? { ...s, status: "active" } : s
        )
      );
      toast.success(`${ids.length} activated`);
    }

    setBulkRunning(false);
    setBulkConfirm(null);
    clearSelection();
  };

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
            Subscribers
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-2 max-w-2xl">
            Everyone who signed up for The Alveoly Letter. Every form across
            the journal feeds this list.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-sm font-medium hover:bg-stone-50 dark:hover:bg-stone-900 transition"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
          <button
            onClick={() => setDrawerOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-sm font-medium hover:opacity-90 transition"
          >
            <UserPlus className="w-4 h-4" />
            Add subscriber
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", value: statusCounts.all },
          { label: "Active", value: statusCounts.active },
          { label: "Pending", value: statusCounts.pending },
          {
            label: "Bounced / unsub",
            value: statusCounts.bounced + statusCounts.unsubscribed,
          },
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

      {/* STATUS TABS */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 -mx-1 px-1">
        {STATUS_TABS.map((t) => (
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
              {statusCounts[t.key] || 0}
            </span>
          </button>
        ))}
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3 p-3 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950">
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by email or name…"
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-transparent text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-transparent border border-stone-200 dark:border-stone-800 text-sm text-stone-700 dark:text-stone-300 focus:outline-none cursor-pointer"
          >
            <option value="all">All sources</option>
            {sources.map((s) => (
              <option key={s} value={s}>
                {SOURCE_LABELS[s] || s}
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
            <option value="email">Sort: A–Z</option>
            <option value="opens">Most engaged</option>
          </select>
        </div>
      </div>

      {/* LIST */}
      {loading ? (
        <div className="py-20 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-stone-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center max-w-md mx-auto">
          <p className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100 mb-3">
            {subscribers.length === 0
              ? "No subscribers yet"
              : "No subscribers match"}
          </p>
          <p className="text-sm text-stone-500 dark:text-stone-400 mb-6">
            {subscribers.length === 0
              ? "Readers who subscribe through the newsletter forms will appear here."
              : "Try a different filter or search."}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 overflow-hidden">
          {/* Header row */}
          <div className="hidden lg:grid grid-cols-12 gap-4 px-5 py-3 bg-stone-50 dark:bg-stone-900/50 border-b border-stone-200 dark:border-stone-800 text-[10px] uppercase tracking-widest text-stone-500 dark:text-stone-400 font-semibold">
            <div className="col-span-1">
              <input
                type="checkbox"
                checked={filtered.length > 0 && selectedIds.size === filtered.length}
                onChange={selectAll}
                className="w-4 h-4 rounded border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:ring-0"
              />
            </div>
            <div className="col-span-5 flex items-center gap-1.5">
              <ArrowUpDown className="w-3 h-3" />
              Subscriber
            </div>
            <div className="col-span-2">Source</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {filtered.map((s, i) => {
            const isSelected = selectedIds.has(s.id);
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: Math.min(i * 0.01, 0.2) }}
                className={`grid grid-cols-1 lg:grid-cols-12 gap-4 px-5 py-4 items-start lg:items-center group hover:bg-stone-50/60 dark:hover:bg-stone-900/30 transition ${
                  i > 0 ? "border-t border-stone-100 dark:border-stone-900" : ""
                } ${isSelected ? "bg-stone-50 dark:bg-stone-900/50" : ""}`}
              >
                <div className="lg:col-span-1">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(s.id)}
                    className="w-4 h-4 rounded border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:ring-0"
                  />
                </div>

                <div className="lg:col-span-5 min-w-0">
                  <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
                    {s.name || s.email.split("@")[0]}
                  </p>
                  <button
                    onClick={() => copyEmail(s.email)}
                    className="text-xs text-stone-500 dark:text-stone-500 hover:text-rose-600 dark:hover:text-rose-400 transition inline-flex items-center gap-1.5 truncate max-w-full"
                    title="Copy email"
                  >
                    <Mail className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{s.email}</span>
                  </button>
                  <p className="text-[10px] text-stone-400 dark:text-stone-600 mt-1">
                    Joined {formatRelative(s.subscribedAt)}
                    {s.opens > 0 && ` · ${s.opens} opens`}
                  </p>
                </div>

                <div className="lg:col-span-2">
                  <span className="text-xs text-stone-600 dark:text-stone-400">
                    {SOURCE_LABELS[s.source] || s.source}
                  </span>
                </div>

                <div className="lg:col-span-2">
                  <StatusBadge status={s.status} />
                </div>

                <div className="lg:col-span-2 flex items-center lg:justify-end gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition">
                  <button
                    onClick={() => toggleStatus(s)}
                    title={
                      s.status === "active"
                        ? "Unsubscribe"
                        : "Reactivate"
                    }
                    className="w-8 h-8 rounded-full flex items-center justify-center text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-900 transition"
                  >
                    {s.status === "active" ? (
                      <UserMinus className="w-3.5 h-3.5" />
                    ) : (
                      <CheckCircle className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => copyEmail(s.email)}
                    title="Copy email"
                    className="w-8 h-8 rounded-full flex items-center justify-center text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-900 transition"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setSubscribers((prev) =>
                        prev.filter((x) => x.id !== s.id)
                      );
                      toast.success("Subscriber deleted");
                    }}
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

      {!loading && filtered.length > 0 && (
        <p className="text-xs text-stone-500 dark:text-stone-500 text-center">
          {filtered.length} {filtered.length === 1 ? "subscriber" : "subscribers"} shown
        </p>
      )}

      {/* BULK BAR */}
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
                onClick={() => setBulkConfirm("activate")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium hover:bg-white/10 dark:hover:bg-stone-900/10 transition"
              >
                <CheckCircle className="w-3 h-3" />
                Activate
              </button>
              <button
                onClick={() => setBulkConfirm("unsubscribe")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium hover:bg-white/10 dark:hover:bg-stone-900/10 transition"
              >
                <UserMinus className="w-3 h-3" />
                Unsubscribe
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

      {/* DRAWER + CONFIRM */}
      <SubscriberDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSave={handleAdd}
        saving={saving}
      />
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

export default AdminBlogSubscribers;