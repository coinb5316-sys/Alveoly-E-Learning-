// src/pages/admin/blog/AdminBlogAuthors.jsx — EDITORIAL ADMIN
// Author management for The Alveoly Journal. Matches public editorial design.
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Plus, X, Edit3, Trash2, Check, Mail, Link2,
  Globe, GraduationCap, Award, AlertCircle, Loader2,
  ChevronDown, Save, User, BookOpen, Heart, Eye, MoreVertical,
} from "lucide-react";
import {
  FaTwitter as Twitter,
  FaLinkedin as Linkedin,
  FaInstagram as Instagram,
  FaYoutube as Youtube,
} from "react-icons/fa";
import { toast } from "react-hot-toast";
// If you have a blogAPI module, uncomment and use it. Otherwise this
// page works against mock data from ../../../data/blogData
// import blogAPI from "../../../api/blogApi";
import { authors as mockAuthors, posts as mockPosts } from "../../../data/blogData";

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

const slugify = (s = "") =>
  String(s)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

const emptyAuthor = () => ({
  id: "",
  name: "",
  role: "",
  credentials: "",
  avatar: "",
  bio: "",
  email: "",
  specialties: [],
  social: {
    twitter: "",
    linkedin: "",
    instagram: "",
    youtube: "",
    website: "",
    email: "",
  },
  active: true,
});

/* ============================================================
   SMALL PRIMITIVES
============================================================ */

const Avatar = ({ author, size = "md" }) => {
  const [broken, setBroken] = useState(false);
  const cls =
    size === "sm"
      ? "w-8 h-8 text-[11px]"
      : size === "lg"
      ? "w-16 h-16 text-lg"
      : "w-11 h-11 text-sm";
  if (author?.avatar && !broken) {
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
      {initials(author?.name) || "?"}
    </div>
  );
};

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

const TextArea = ({ value, onChange, placeholder, rows = 3 }) => (
  <textarea
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    rows={rows}
    className="w-full px-3.5 py-2.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 transition resize-none"
  />
);

/* ============================================================
   SPECIALTY TAG INPUT
============================================================ */

const SpecialtyInput = ({ values, onChange }) => {
  const [draft, setDraft] = useState("");
  const suggestions = [
    "Cardiology",
    "Nutrition",
    "Psychiatry",
    "Pediatrics",
    "Public Health",
    "Epidemiology",
    "Diabetes",
    "Hypertension",
    "Mental Health",
    "Vaccination",
    "Women's Health",
    "Men's Health",
    "Preventive Medicine",
  ];

  const add = (val) => {
    const v = val.trim();
    if (!v) return;
    if (values.includes(v)) return;
    onChange([...values, v]);
    setDraft("");
  };

  const remove = (val) => onChange(values.filter((x) => x !== val));

  const filtered = draft
    ? suggestions.filter(
        (s) => s.toLowerCase().includes(draft.toLowerCase()) && !values.includes(s)
      )
    : [];

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {values.map((v) => (
          <span
            key={v}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-900 text-xs text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800"
          >
            {v}
            <button
              type="button"
              onClick={() => remove(v)}
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
              remove(values[values.length - 1]);
            }
          }}
          placeholder="Type and press Enter"
          className="w-full px-3.5 py-2.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 transition"
        />
        {filtered.length > 0 && (
          <div className="absolute z-20 top-full left-0 right-0 mt-1 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-lg overflow-hidden max-h-56 overflow-y-auto">
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
   AUTHOR DRAWER (create / edit)
============================================================ */

const AuthorDrawer = ({ open, onClose, initial, onSave, saving }) => {
  const [form, setForm] = useState(emptyAuthor());
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm(
        initial
          ? {
              ...emptyAuthor(),
              ...initial,
              social: {
                ...emptyAuthor().social,
                ...(initial.social || {}),
              },
            }
          : emptyAuthor()
      );
      setErrors({});
    }
  }, [open, initial]);

  const update = (path, value) => {
    setForm((prev) => {
      if (path.startsWith("social.")) {
        const key = path.split(".")[1];
        return { ...prev, social: { ...prev.social, [key]: value } };
      }
      return { ...prev, [path]: value };
    });
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Invalid email";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    onSave({
      ...form,
      id: form.id || slugify(form.name),
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
                  {initial?.id ? "Edit author" : "New author"}
                </p>
                <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-50">
                  {initial?.id
                    ? form.name || "Edit author"
                    : "Add a contributor"}
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
              {/* Avatar preview */}
              <div className="flex items-center gap-4">
                <Avatar author={form} size="lg" />
                <div className="flex-1">
                  <Field
                    label="Avatar URL"
                    hint="Paste an image URL. Leave empty to use initials."
                  >
                    <TextInput
                      value={form.avatar}
                      onChange={(e) => update("avatar", e.target.value)}
                      placeholder="https://…"
                    />
                  </Field>
                </div>
              </div>

              <Field label="Full name" required error={errors.name}>
                <TextInput
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="e.g. Dr. Amara Okafor"
                />
              </Field>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field
                  label="Role"
                  hint="Short title, e.g. Chief Medical Editor"
                >
                  <TextInput
                    value={form.role}
                    onChange={(e) => update("role", e.target.value)}
                    placeholder="Chief Medical Editor"
                  />
                </Field>
                <Field label="Credentials" hint="e.g. MBBS, MPH, PhD">
                  <TextInput
                    value={form.credentials}
                    onChange={(e) => update("credentials", e.target.value)}
                    placeholder="MBBS, MPH"
                  />
                </Field>
              </div>

              <Field
                label="Email"
                hint="Internal use only. Not shown publicly unless you add it to Social."
                error={errors.email}
              >
                <TextInput
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="amara@alveoly.com"
                />
              </Field>

              <Field
                label="Bio"
                hint="2–4 sentences. This appears on author pages."
              >
                <TextArea
                  value={form.bio}
                  onChange={(e) => update("bio", e.target.value)}
                  placeholder="A short biography describing their practice and focus."
                  rows={4}
                />
              </Field>

              <Field
                label="Areas of expertise"
                hint="Press Enter after each one."
              >
                <SpecialtyInput
                  values={form.specialties}
                  onChange={(v) => update("specialties", v)}
                />
              </Field>

              <div className="pt-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-3">
                  Public links
                </p>
                <div className="space-y-3">
                  {[
                    ["twitter", "Twitter", Twitter],
                    ["linkedin", "LinkedIn", Linkedin],
                    ["instagram", "Instagram", Instagram],
                    ["youtube", "YouTube", Youtube],
                    ["website", "Website", Globe],
                    ["email", "Public email", Mail],
                  ].map(([key, label, Icon]) => (
                    <div key={key} className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full border border-stone-200 dark:border-stone-800 flex items-center justify-center text-stone-500 dark:text-stone-400 flex-shrink-0">
                        <Icon className="w-3.5 h-3.5" />
                      </span>
                      <div className="flex-1">
                        <TextInput
                          value={form.social[key]}
                          onChange={(e) =>
                            update(`social.${key}`, e.target.value)
                          }
                          placeholder={
                            key === "email"
                              ? "name@example.com"
                              : `https://${key}.com/…`
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => update("active", e.target.checked)}
                  className="w-4 h-4 rounded border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:ring-0"
                />
                <span className="text-sm text-stone-700 dark:text-stone-300">
                  Active — this author can be assigned to new posts
                </span>
              </label>
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
                    {initial?.id ? "Save changes" : "Create author"}
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
   DELETE CONFIRM
============================================================ */

const ConfirmDelete = ({ open, author, onCancel, onConfirm, deleting }) => (
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
            Delete {author?.name}?
          </h3>
          <p className="text-sm text-stone-600 dark:text-stone-400 mb-6 leading-relaxed">
            This cannot be undone. Posts already attributed to this author
            will keep their byline text but the author page will stop working.
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

const AdminBlogAuthors = () => {
  const [authors, setAuthors] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [statusFilter, setStatusFilter] = useState("all");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  /* ---------- Load ---------- */
  useEffect(() => {
    // If you have a blogAPI, replace this with:
    // const [a, p] = await Promise.all([blogAPI.getAuthors(), blogAPI.getPosts()]);
    setAuthors(
      mockAuthors.map((a) => ({
        ...a,
        email: a.email || "",
        active: a.active !== false,
        social: {
          twitter: "",
          linkedin: "",
          instagram: "",
          youtube: "",
          website: "",
          email: "",
          ...(a.social || {}),
        },
      }))
    );
    setPosts(mockPosts);
    setTimeout(() => setLoading(false), 300);
  }, []);

  /* ---------- Derived ---------- */
  const postsByAuthor = useMemo(() => {
    const map = new Map();
    posts.forEach((p) => {
      map.set(p.authorId, (map.get(p.authorId) || 0) + 1);
    });
    return map;
  }, [posts]);

  const likesByAuthor = useMemo(() => {
    const map = new Map();
    posts.forEach((p) => {
      map.set(p.authorId, (map.get(p.authorId) || 0) + (p.likes || 0));
    });
    return map;
  }, [posts]);

  const viewsByAuthor = useMemo(() => {
    const map = new Map();
    posts.forEach((p) => {
      map.set(p.authorId, (map.get(p.authorId) || 0) + (p.views || 0));
    });
    return map;
  }, [posts]);

  const reviewCountByAuthor = useMemo(() => {
    const map = new Map();
    posts.forEach((p) => {
      if (p.reviewedBy) {
        map.set(p.reviewedBy, (map.get(p.reviewedBy) || 0) + 1);
      }
    });
    return map;
  }, [posts]);

  const filtered = useMemo(() => {
    let list = [...authors];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          (a.role || "").toLowerCase().includes(q) ||
          (a.credentials || "").toLowerCase().includes(q) ||
          (a.specialties || []).some((s) => s.toLowerCase().includes(q))
      );
    }
    if (statusFilter === "active") list = list.filter((a) => a.active);
    if (statusFilter === "inactive") list = list.filter((a) => !a.active);

    list.sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "posts")
        return (postsByAuthor.get(b.id) || 0) - (postsByAuthor.get(a.id) || 0);
      if (sortBy === "views")
        return (viewsByAuthor.get(b.id) || 0) - (viewsByAuthor.get(a.id) || 0);
      return 0;
    });
    return list;
  }, [authors, search, sortBy, statusFilter, postsByAuthor, viewsByAuthor]);

  /* ---------- Handlers ---------- */
  const openCreate = () => {
    setEditing(null);
    setDrawerOpen(true);
  };

  const openEdit = (author) => {
    setEditing(author);
    setDrawerOpen(true);
  };

  const handleSave = async (payload) => {
    setSaving(true);
    // If you have a real API:
    // try {
    //   if (editing?.id) await blogAPI.updateAuthor(editing.id, payload);
    //   else await blogAPI.createAuthor(payload);
    // } catch (err) { toast.error("Save failed"); setSaving(false); return; }

    await new Promise((r) => setTimeout(r, 400));

    setAuthors((prev) => {
      const exists = prev.find((a) => a.id === payload.id);
      if (exists) return prev.map((a) => (a.id === payload.id ? payload : a));
      return [payload, ...prev];
    });
    toast.success(editing?.id ? "Author updated" : "Author created");
    setSaving(false);
    setDrawerOpen(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    await new Promise((r) => setTimeout(r, 400));
    setAuthors((prev) => prev.filter((a) => a.id !== deleteTarget.id));
    toast.success("Author deleted");
    setDeleting(false);
    setDeleteTarget(null);
  };

  const toggleActive = (author) => {
    setAuthors((prev) =>
      prev.map((a) => (a.id === author.id ? { ...a, active: !a.active } : a))
    );
    toast.success(
      `${author.name} ${author.active ? "deactivated" : "activated"}`
    );
  };

  /* ---------- Render ---------- */
  return (
    <div className="space-y-6">
      {/* ---------- HEADER ---------- */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-rose-600 dark:text-rose-400 font-semibold mb-2">
            The Alveoly Journal
          </p>
          <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
            Authors
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-2 max-w-2xl">
            The people who write and review for the journal. Every byline and
            every medical reviewer points back to one of these records.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-sm font-medium hover:opacity-90 transition self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          New author
        </button>
      </div>

      {/* ---------- STATS ROW ---------- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Contributors", value: authors.length },
          {
            label: "Active",
            value: authors.filter((a) => a.active).length,
          },
          {
            label: "On review board",
            value: [...reviewCountByAuthor.keys()].length,
          },
          {
            label: "Stories attributed",
            value: posts.filter((p) => authors.some((a) => a.id === p.authorId))
              .length,
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

      {/* ---------- TOOLBAR ---------- */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 p-3 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, role, or specialty…"
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-transparent text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-transparent border border-stone-200 dark:border-stone-800 text-sm text-stone-700 dark:text-stone-300 focus:outline-none cursor-pointer"
          >
            <option value="all">All status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-lg bg-transparent border border-stone-200 dark:border-stone-800 text-sm text-stone-700 dark:text-stone-300 focus:outline-none cursor-pointer"
          >
            <option value="name">Sort: A–Z</option>
            <option value="posts">Sort: Most posts</option>
            <option value="views">Sort: Most reads</option>
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
            {authors.length === 0 ? "No authors yet" : "No authors match"}
          </p>
          <p className="text-sm text-stone-500 dark:text-stone-400 mb-6">
            {authors.length === 0
              ? "Add the first contributor to start publishing."
              : "Try a different search or status filter."}
          </p>
          {authors.length === 0 && (
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-sm font-medium hover:opacity-90 transition"
            >
              <Plus className="w-4 h-4" />
              Add first author
            </button>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 overflow-hidden">
          {filtered.map((a, i) => {
            const postCount = postsByAuthor.get(a.id) || 0;
            const views = viewsByAuthor.get(a.id) || 0;
            const reviews = reviewCountByAuthor.get(a.id) || 0;
            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: Math.min(i * 0.02, 0.3) }}
                className={`flex items-start md:items-center gap-4 px-5 py-5 ${
                  i > 0
                    ? "border-t border-stone-100 dark:border-stone-900"
                    : ""
                } hover:bg-stone-50/50 dark:hover:bg-stone-900/30 transition group`}
              >
                <Avatar author={a} size="lg" />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mb-1">
                    <p className="font-serif text-lg font-bold text-stone-900 dark:text-stone-50 truncate">
                      {a.name}
                    </p>
                    {!a.active && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-900 text-[10px] uppercase tracking-wider text-stone-500 font-semibold">
                        Inactive
                      </span>
                    )}
                    {reviews > 0 && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-[10px] uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-semibold">
                        <Award className="w-2.5 h-2.5" />
                        Reviewer
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-stone-600 dark:text-stone-400 truncate">
                    {a.role || "Contributor"}
                    {a.credentials ? ` · ${a.credentials}` : ""}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-stone-500 dark:text-stone-500">
                    <span>
                      <strong className="font-semibold text-stone-700 dark:text-stone-300">
                        {postCount}
                      </strong>{" "}
                      {postCount === 1 ? "story" : "stories"}
                    </span>
                    {views > 0 && (
                      <>
                        <span className="text-stone-300 dark:text-stone-700">
                          ·
                        </span>
                        <span>
                          <strong className="font-semibold text-stone-700 dark:text-stone-300">
                            {views.toLocaleString()}
                          </strong>{" "}
                          reads
                        </span>
                      </>
                    )}
                    {reviews > 0 && (
                      <>
                        <span className="text-stone-300 dark:text-stone-700">
                          ·
                        </span>
                        <span>
                          <strong className="font-semibold text-stone-700 dark:text-stone-300">
                            {reviews}
                          </strong>{" "}
                          reviewed
                        </span>
                      </>
                    )}
                    {a.specialties?.length > 0 && (
                      <>
                        <span className="text-stone-300 dark:text-stone-700">
                          ·
                        </span>
                        <span className="truncate max-w-[280px]">
                          {a.specialties.slice(0, 3).join(" · ")}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition">
                  <button
                    onClick={() => toggleActive(a)}
                    title={a.active ? "Deactivate" : "Activate"}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-900 transition"
                  >
                    {a.active ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => openEdit(a)}
                    title="Edit"
                    className="w-9 h-9 rounded-full flex items-center justify-center text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-900 transition"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(a)}
                    title="Delete"
                    className="w-9 h-9 rounded-full flex items-center justify-center text-stone-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ---------- DRAWERS ---------- */}
      <AuthorDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        initial={editing}
        onSave={handleSave}
        saving={saving}
      />

      <ConfirmDelete
        open={!!deleteTarget}
        author={deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        deleting={deleting}
      />
    </div>
  );
};

export default AdminBlogAuthors;