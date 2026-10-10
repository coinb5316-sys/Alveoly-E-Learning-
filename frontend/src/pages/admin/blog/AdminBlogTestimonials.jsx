// src/pages/admin/blog/AdminBlogTestimonials.jsx — EDITORIAL ADMIN
// Reader testimonials for The Alveoly Journal.
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Plus, X, Edit3, Trash2, Loader2, Save, AlertCircle,
  Quote, Star, Check, EyeOff, Eye, CheckCircle, Clock,
  Mail, User, MessageSquare, Sparkles, Heart, Filter,
  CornerDownRight, Pin, PinOff, Tag, Copy, ExternalLink,
  ArrowUpDown, ChevronDown,
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

const formatRelative = (d) => {
  if (!d) return "";
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(d).toLocaleDateString("en-US", {
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

const emptyTestimonial = () => ({
  id: "",
  author: "",
  role: "",
  avatar: "",
  email: "",
  body: "",
  source: "", // post id, podcast id, or "direct"
  sourceLabel: "",
  status: "pending", // pending | approved | hidden
  featured: false,
  pinned: false,
  tags: [],
  createdAt: new Date().toISOString(),
});

/* ============================================================
   MOCK SEED — replace with API
============================================================ */

const buildMockTestimonials = (posts) => {
  const seeds = [
    {
      author: "Ngozi Adeyemi",
      role: "Registered Nurse, Lagos",
      body: "I send this article to every patient I see who's just been diagnosed with hypertension. It explains the disease better than the pamphlets we hand out — and it doesn't scare them.",
      status: "approved",
      featured: true,
      pinned: true,
      tags: ["Heart Health", "Patient education"],
      postIndex: 0,
      hours: 26,
    },
    {
      author: "Dr. Samuel Kalu",
      role: "Family physician",
      body: "The Alveoly Journal is the only health publication I recommend to my colleagues without a caveat. The medical review process shows in every paragraph.",
      status: "approved",
      featured: true,
      pinned: false,
      tags: ["Trust", "Clinical"],
      postIndex: 2,
      hours: 52,
    },
    {
      author: "Fatima Bello",
      role: "Public health student",
      body: "I used the gut health article as the source for a class presentation. The references were so complete that my professor asked where I found it.",
      status: "approved",
      featured: false,
      pinned: false,
      tags: ["Nutrition", "Education"],
      postIndex: 1,
      hours: 96,
    },
    {
      author: "Bola Akinyemi",
      role: "Reader",
      body: "The podcast episode on blood pressure was the first thing that made me actually understand what hypertension means. I finally booked the checkup I'd been putting off for two years.",
      status: "approved",
      featured: false,
      pinned: false,
      tags: ["Podcast", "Behaviour change"],
      postIndex: 0,
      hours: 148,
    },
    {
      author: "Adaeze Nwosu",
      role: "Pharmacist",
      body: "As a pharmacist, I usually spot errors in health writing within the first paragraph. I haven't found one in this journal yet — and I've read most of it.",
      status: "approved",
      featured: true,
      pinned: false,
      tags: ["Trust", "Clinical"],
      postIndex: 3,
      hours: 200,
    },
    {
      author: "Tunde O.",
      role: "",
      body: "Does anyone know if this article applies to people with type 1 diabetes as well? My son was just diagnosed and I want to get this right.",
      status: "pending",
      featured: false,
      pinned: false,
      tags: [],
      postIndex: 4,
      hours: 4,
    },
    {
      author: "Chidi N.",
      role: "",
      body: "I bought the supplement mentioned in the article and it changed my life. Everyone should try it. Use the discount code I found online.",
      status: "hidden",
      featured: false,
      pinned: false,
      tags: ["Spam"],
      postIndex: 1,
      hours: 60,
    },
    {
      author: "Grace Otieno",
      role: "Community health worker",
      body: "We print these articles and hand them out at the clinic. Patients read them and come back with better questions. That's the whole point.",
      status: "approved",
      featured: false,
      pinned: false,
      tags: ["Community health", "Public health"],
      postIndex: 2,
      hours: 260,
    },
  ];

  return seeds.map((s, i) => {
    const post = posts[s.postIndex % posts.length];
    return {
      id: `tst-${i + 1}`,
      author: s.author,
      role: s.role,
      avatar: "",
      email: "",
      body: s.body,
      source: post.id,
      sourceLabel: post.title,
      status: s.status,
      featured: s.featured,
      pinned: s.pinned,
      tags: s.tags,
      createdAt: new Date(
        Date.now() - s.hours * 3600 * 1000
      ).toISOString(),
    };
  });
};

/* ============================================================
   PRIMITIVES
============================================================ */

const Field = ({ label, hint, required, error, children }) => (
  <div>
    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2">
      {label}
      {required && <span className="text-rose-500 ml-1">*</span>}
    </label>
    {children}
    {hint && !error && (
      <p className="text-xs text-stone-400 dark:text-stone-500 mt-1.5">
        {hint}
      </p>
    )}
    {error && (
      <p className="text-xs text-rose-600 dark:text-rose-400 mt-1.5 flex items-center gap-1.5">
        <AlertCircle className="w-3 h-3" />
        {error}
      </p>
    )}
  </div>
);

const TextInput = ({ value, onChange, placeholder, type = "text", ...rest }) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    {...rest}
    className="w-full px-3.5 py-2.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 transition"
  />
);

const TextArea = ({ value, onChange, placeholder, rows = 4 }) => (
  <textarea
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    rows={rows}
    className="w-full px-3.5 py-2.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 transition resize-none"
  />
);

const Avatar = ({ name, avatar, size = "md" }) => {
  const cls =
    size === "sm"
      ? "w-8 h-8 text-[11px]"
      : size === "lg"
      ? "w-14 h-14 text-lg"
      : "w-10 h-10 text-xs";
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
    approved: {
      label: "Approved",
      tone:
        "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400",
      icon: CheckCircle,
    },
    pending: {
      label: "Pending",
      tone:
        "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400",
      icon: Clock,
    },
    hidden: {
      label: "Hidden",
      tone:
        "bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-400",
      icon: EyeOff,
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

const TagInput = ({ values, onChange }) => {
  const [draft, setDraft] = useState("");
  const suggestions = [
    "Trust",
    "Clinical",
    "Patient education",
    "Behaviour change",
    "Community health",
    "Podcast",
    "Nutrition",
    "Heart Health",
    "Mental Health",
    "Education",
  ];

  const add = (val) => {
    const v = val.trim();
    if (!v || values.includes(v)) return;
    onChange([...values, v]);
    setDraft("");
  };
  const remove = (i) => onChange(values.filter((_, idx) => idx !== i));

  const filtered = draft
    ? suggestions.filter(
        (s) =>
          s.toLowerCase().includes(draft.toLowerCase()) &&
          !values.includes(s)
      )
    : [];

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {values.map((v, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-900 text-xs text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800"
          >
            {v}
            <button
              type="button"
              onClick={() => remove(i)}
              className="text-stone-400 hover:text-rose-600 transition"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="relative">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add(draft);
            }
            if (e.key === "Backspace" && !draft && values.length > 0) {
              remove(values.length - 1);
            }
          }}
          placeholder="Add a tag and press Enter"
          className="w-full px-3.5 py-2.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-sm focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 transition"
        />
        {filtered.length > 0 && (
          <div className="absolute z-20 top-full left-0 right-0 mt-1 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-lg overflow-hidden max-h-48 overflow-y-auto">
            {filtered.slice(0, 6).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => add(s)}
                className="w-full text-left px-3.5 py-2 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ============================================================
   DRAWER
============================================================ */

const TestimonialDrawer = ({ open, onClose, initial, onSave, saving, posts }) => {
  const [form, setForm] = useState(emptyTestimonial());
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...emptyTestimonial(), ...initial } : emptyTestimonial());
      setErrors({});
    }
  }, [open, initial]);

  const update = (path, value) =>
    setForm((prev) => ({ ...prev, [path]: value }));

  const validate = () => {
    const e = {};
    if (!form.author.trim()) e.author = "Name is required";
    if (!form.body.trim()) e.body = "The quote is required";
    if (form.body.length > 400) e.body = "Keep it under 400 characters";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Invalid email";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    onSave({
      ...form,
      id: form.id || `tst-${Date.now()}`,
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
            className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-white dark:bg-stone-950 z-50 flex flex-col border-l border-stone-200 dark:border-stone-800"
          >
            {/* Header */}
            <div className="flex-shrink-0 px-6 py-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-rose-600 dark:text-rose-400 font-semibold mb-1">
                  {initial?.id ? "Edit testimonial" : "New testimonial"}
                </p>
                <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-50">
                  {initial?.id ? form.author || "Edit" : "Add a reader's voice"}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full flex items-center justify-center text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-900 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {/* Live preview */}
              <div className="p-5 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                <p className="text-[10px] uppercase tracking-widest text-stone-500 dark:text-stone-400 font-semibold mb-3">
                  Preview on the journal
                </p>
                <div className="flex items-start gap-3">
                  <Avatar name={form.author || "Reader"} avatar={form.avatar} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
                      {form.author || "Reader name"}
                    </p>
                    <p className="text-xs text-stone-500 truncate">
                      {form.role || "Reader"}
                    </p>
                  </div>
                  <Quote className="w-5 h-5 text-stone-300 dark:text-stone-700 flex-shrink-0" />
                </div>
                <p className="mt-3 text-sm text-stone-700 dark:text-stone-300 leading-relaxed italic line-clamp-4">
                  "{form.body || "The reader's quote goes here."}"
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Name" required error={errors.author}>
                  <TextInput
                    value={form.author}
                    onChange={(e) => update("author", e.target.value)}
                    placeholder="Ngozi Adeyemi"
                  />
                </Field>
                <Field label="Role / subtitle" hint="Optional — e.g. 'Registered Nurse, Lagos'">
                  <TextInput
                    value={form.role}
                    onChange={(e) => update("role", e.target.value)}
                    placeholder="Registered Nurse, Lagos"
                  />
                </Field>
              </div>

              <Field label="Quote" required error={errors.body} hint={`${form.body.length}/400 characters`}>
                <TextArea
                  value={form.body}
                  onChange={(e) => update("body", e.target.value)}
                  placeholder="The reader's testimonial…"
                  rows={5}
                />
              </Field>

              <Field
                label="Avatar URL"
                hint="Optional. Initials are used if empty."
              >
                <TextInput
                  value={form.avatar}
                  onChange={(e) => update("avatar", e.target.value)}
                  placeholder="https://…"
                />
              </Field>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Email" hint="Internal — not shown publicly." error={errors.email}>
                  <TextInput
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="name@example.com"
                  />
                </Field>
                <Field label="Status">
                  <select
                    value={form.status}
                    onChange={(e) => update("status", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-sm focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 transition cursor-pointer"
                  >
                    <option value="pending">Pending review</option>
                    <option value="approved">Approved</option>
                    <option value="hidden">Hidden</option>
                  </select>
                </Field>
              </div>

              <Field
                label="About this story"
                hint="Optional — ties the testimonial to a specific post."
              >
                <select
                  value={form.source}
                  onChange={(e) => {
                    const id = e.target.value;
                    const post = posts.find((p) => p.id === id);
                    update("source", id);
                    update("sourceLabel", post ? post.title : "");
                  }}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-sm focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 transition cursor-pointer"
                >
                  <option value="">— None / general —</option>
                  {posts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title.length > 60 ? p.title.slice(0, 60) + "…" : p.title}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Tags" hint="For the curator's own reference.">
                <TagInput
                  values={form.tags}
                  onChange={(v) => update("tags", v)}
                />
              </Field>

              <div className="pt-2 space-y-2.5">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => update("featured", e.target.checked)}
                    className="w-4 h-4 rounded border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:ring-0"
                  />
                  <Star className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
                  <span className="text-sm text-stone-700 dark:text-stone-300">
                    Feature on the public site
                  </span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={form.pinned}
                    onChange={(e) => update("pinned", e.target.checked)}
                    className="w-4 h-4 rounded border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:ring-0"
                  />
                  <Pin className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
                  <span className="text-sm text-stone-700 dark:text-stone-300">
                    Pin to the top of the list
                  </span>
                </label>
              </div>
            </div>

            {/* Footer */}
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
                    Saving…
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    {initial?.id ? "Save changes" : "Add testimonial"}
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
   CONFIRM DELETE
============================================================ */

const ConfirmDelete = ({ open, testimonial, onCancel, onConfirm, deleting }) => (
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
            Delete this testimonial?
          </h3>
          <p className="text-sm text-stone-600 dark:text-stone-400 mb-6 leading-relaxed">
            <strong className="text-stone-900 dark:text-stone-100">
              "{testimonial?.author}"
            </strong>{" "}
            will be removed from the journal. If you only want to hide it, use
            the <em>Hidden</em> status instead.
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

const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "hidden", label: "Hidden" },
  { key: "featured", label: "Featured" },
];

const AdminBlogTestimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [tagFilter, setTagFilter] = useState("all");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  /* ---------- Load ---------- */
  useEffect(() => {
    setPosts(mockPosts);
    setTestimonials(buildMockTestimonials(mockPosts));
    setTimeout(() => setLoading(false), 300);
  }, []);

  /* ---------- Derived ---------- */
  const allTags = useMemo(() => {
    const set = new Set();
    testimonials.forEach((t) => (t.tags || []).forEach((x) => set.add(x)));
    return [...set].sort();
  }, [testimonials]);

  const statusCounts = useMemo(() => {
    const base = { all: testimonials.length, pending: 0, approved: 0, hidden: 0, featured: 0 };
    testimonials.forEach((t) => {
      base[t.status] = (base[t.status] || 0) + 1;
      if (t.featured) base.featured += 1;
    });
    return base;
  }, [testimonials]);

  const postById = useMemo(() => {
    const m = new Map();
    posts.forEach((p) => m.set(p.id, p));
    return m;
  }, [posts]);

  const filtered = useMemo(() => {
    let list = [...testimonials];

    if (statusFilter === "featured") {
      list = list.filter((t) => t.featured);
    } else if (statusFilter !== "all") {
      list = list.filter((t) => t.status === statusFilter);
    }

    if (tagFilter !== "all") {
      list = list.filter((t) => (t.tags || []).includes(tagFilter));
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.author.toLowerCase().includes(q) ||
          (t.role || "").toLowerCase().includes(q) ||
          t.body.toLowerCase().includes(q) ||
          (t.sourceLabel || "").toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      // Pinned first, then by chosen sort
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      if (sortBy === "newest")
        return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "oldest")
        return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "name") return a.author.localeCompare(b.author);
      return 0;
    });

    return list;
  }, [testimonials, statusFilter, tagFilter, search, sortBy]);

  /* ---------- Handlers ---------- */
  const openCreate = () => {
    setEditing(null);
    setDrawerOpen(true);
  };

  const openEdit = (t) => {
    setEditing(t);
    setDrawerOpen(true);
  };

  const handleSave = async (payload) => {
    setSaving(true);
    // Replace with blogAPI.createTestimonial / updateTestimonial
    await new Promise((r) => setTimeout(r, 400));
    setTestimonials((prev) => {
      const exists = prev.find((t) => t.id === payload.id);
      if (exists) return prev.map((t) => (t.id === payload.id ? payload : t));
      return [payload, ...prev];
    });
    toast.success(editing?.id ? "Testimonial updated" : "Testimonial added");
    setSaving(false);
    setDrawerOpen(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    await new Promise((r) => setTimeout(r, 400));
    setTestimonials((prev) =>
      prev.filter((t) => t.id !== deleteTarget.id)
    );
    toast.success("Testimonial deleted");
    setDeleting(false);
    setDeleteTarget(null);
  };

  const setStatus = (t, status) => {
    setTestimonials((prev) =>
      prev.map((x) => (x.id === t.id ? { ...x, status } : x))
    );
    const labels = { approved: "Approved", hidden: "Hidden", pending: "Moved to pending" };
    toast.success(labels[status] || "Updated");
  };

  const toggleFeatured = (t) => {
    setTestimonials((prev) =>
      prev.map((x) =>
        x.id === t.id ? { ...x, featured: !x.featured } : x
      )
    );
    toast.success(t.featured ? "Unfeatured" : "Featured");
  };

  const togglePinned = (t) => {
    setTestimonials((prev) =>
      prev.map((x) =>
        x.id === t.id ? { ...x, pinned: !x.pinned } : x
      )
    );
    toast.success(t.pinned ? "Unpinned" : "Pinned to top");
  };

  const copyQuote = (t) => {
    navigator.clipboard.writeText(`"${t.body}" — ${t.author}`);
    toast.success("Quote copied");
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
            Testimonials
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-2 max-w-2xl">
            What readers say about the journal. Approve the ones that speak
            for us, feature the ones that don't oversell, hide the rest.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-sm font-medium hover:opacity-90 transition self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add testimonial
        </button>
      </div>

      {/* ---------- STATS ---------- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", value: stats(testimonials).total },
          { label: "Approved", value: stats(testimonials).approved },
          { label: "Pending", value: stats(testimonials).pending },
          { label: "Featured", value: stats(testimonials).featured },
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

      {/* ---------- STATUS TABS ---------- */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 -mx-1 px-1">
        {STATUS_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setStatusFilter(t.key)}
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

      {/* ---------- TOOLBAR ---------- */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3 p-3 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950">
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, quote, or story…"
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-transparent text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-transparent border border-stone-200 dark:border-stone-800 text-sm text-stone-700 dark:text-stone-300 focus:outline-none cursor-pointer max-w-[180px]"
          >
            <option value="all">All tags</option>
            {allTags.map((t) => (
              <option key={t} value={t}>
                {t}
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
            <option value="name">Sort: A–Z</option>
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
            {testimonials.length === 0
              ? "No testimonials yet"
              : "Nothing matches"}
          </p>
          <p className="text-sm text-stone-500 dark:text-stone-400 mb-6">
            {testimonials.length === 0
              ? "Add a reader's voice to start building social proof."
              : "Try a different filter or search."}
          </p>
          {testimonials.length === 0 && (
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-sm font-medium hover:opacity-90 transition"
            >
              <Plus className="w-4 h-4" />
              Add first testimonial
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((t, i) => {
            const post = postById.get(t.source);
            return (
              <motion.article
                key={t.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.3) }}
                className="group rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 p-5 flex flex-col"
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <Avatar name={t.author} avatar={t.avatar} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
                        {t.author}
                      </p>
                      <p className="text-xs text-stone-500 dark:text-stone-500 truncate">
                        {t.role || "Reader"} · {formatRelative(t.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    {t.pinned && (
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/30 text-[10px] uppercase tracking-wider text-sky-700 dark:text-sky-400 font-semibold"
                        title="Pinned"
                      >
                        <Pin className="w-2.5 h-2.5" />
                        Pinned
                      </span>
                    )}
                    {t.featured && (
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/30 text-[10px] uppercase tracking-wider text-amber-700 dark:text-amber-400 font-semibold"
                        title="Featured"
                      >
                        <Star className="w-2.5 h-2.5" />
                        Featured
                      </span>
                    )}
                    <StatusBadge status={t.status} />
                  </div>
                </div>

                {/* Quote */}
                <div className="flex items-start gap-3 mb-4">
                  <Quote className="w-4 h-4 text-stone-300 dark:text-stone-700 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed italic">
                    "{t.body}"
                  </p>
                </div>

                {/* Tags + source */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {t.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-400 font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                  {post && (
                    <Link
                      to={`/admin/blog/edit/${post.id}`}
                      className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-rose-600 dark:text-rose-400 font-semibold hover:underline"
                    >
                      <MessageSquare className="w-2.5 h-2.5" />
                      On "{post.title.length > 30 ? post.title.slice(0, 30) + "…" : post.title}"
                    </Link>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-auto pt-4 border-t border-stone-100 dark:border-stone-900 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    {t.status !== "approved" && (
                      <button
                        onClick={() => setStatus(t, "approved")}
                        title="Approve"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium text-stone-600 dark:text-stone-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-700 dark:hover:text-emerald-400 transition"
                      >
                        <Check className="w-3 h-3" />
                        Approve
                      </button>
                    )}
                    {t.status !== "hidden" && (
                      <button
                        onClick={() => setStatus(t, "hidden")}
                        title="Hide"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-900 transition"
                      >
                        <EyeOff className="w-3 h-3" />
                        Hide
                      </button>
                    )}
                    {t.status === "hidden" && (
                      <button
                        onClick={() => setStatus(t, "pending")}
                        title="Move to pending"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-900 transition"
                      >
                        <Eye className="w-3 h-3" />
                        Restore
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => togglePinned(t)}
                      title={t.pinned ? "Unpin" : "Pin to top"}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-stone-500 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/30 transition"
                    >
                      {t.pinned ? (
                        <PinOff className="w-3.5 h-3.5" />
                      ) : (
                        <Pin className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => toggleFeatured(t)}
                      title={t.featured ? "Unfeature" : "Feature"}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-stone-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition"
                    >
                      <Star className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => copyQuote(t)}
                      title="Copy quote"
                      className="w-8 h-8 rounded-full flex items-center justify-center text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-900 transition"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => openEdit(t)}
                      title="Edit"
                      className="w-8 h-8 rounded-full flex items-center justify-center text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-900 transition"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(t)}
                      title="Delete"
                      className="w-8 h-8 rounded-full flex items-center justify-center text-stone-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}

      {/* ---------- FOOTER HINT ---------- */}
      {!loading && filtered.length > 0 && (
        <p className="text-xs text-stone-500 dark:text-stone-500 text-center">
          {filtered.length}{" "}
          {filtered.length === 1 ? "testimonial" : "testimonials"} shown
          {statusFilter !== "all" && ` · ${statusFilter}`}
          {tagFilter !== "all" && ` · #${tagFilter}`}
        </p>
      )}

      {/* ---------- DRAWER ---------- */}
      <TestimonialDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        initial={editing}
        onSave={handleSave}
        saving={saving}
        posts={posts}
      />

      {/* ---------- DELETE ---------- */}
      <ConfirmDelete
        open={!!deleteTarget}
        testimonial={deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        deleting={deleting}
      />
    </div>
  );
};

/* Small helper so we don't recompute counts inline */
function stats(list) {
  return {
    total: list.length,
    approved: list.filter((t) => t.status === "approved").length,
    pending: list.filter((t) => t.status === "pending").length,
    featured: list.filter((t) => t.featured).length,
  };
}

export default AdminBlogTestimonials;