// src/pages/admin/blog/AdminBlogCategories.jsx — EDITORIAL ADMIN
// Category management for The Alveoly Journal.
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Plus, X, Edit3, Trash2, Loader2, Save, AlertCircle,
  FolderTree, Eye, ArrowUpRight, Image as ImageIcon, Hash,
  ArrowUp, ArrowDown, Check,
} from "lucide-react";
import { toast } from "react-hot-toast";
// import blogAPI from "../../../api/blogApi"; // ← enable when backend is ready
import {
  categories as mockCategories,
  posts as mockPosts,
} from "../../../data/blogData";

/* ============================================================
   HELPERS
============================================================ */

const slugify = (s = "") =>
  String(s)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

const emptyCategory = () => ({
  id: "",
  slug: "",
  name: "",
  description: "",
  image: "",
  icon: "folder",
  color: "",
  order: 0,
  active: true,
});

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

const TextArea = ({ value, onChange, placeholder, rows = 3 }) => (
  <textarea
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    rows={rows}
    className="w-full px-3.5 py-2.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 transition resize-none"
  />
);

/* Small preview of what the category will look like as a pill / card */
const CategoryPreview = ({ category }) => (
  <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
    <p className="text-[10px] uppercase tracking-widest text-stone-500 dark:text-stone-400 font-semibold mb-3">
      Preview
    </p>
    <div className="flex flex-wrap items-center gap-2 mb-3">
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 text-xs font-medium">
        <FolderTree className="w-3 h-3 text-rose-600 dark:text-rose-400" />
        {category.name || "Category name"}
      </span>
    </div>
    {category.image ? (
      <div className="rounded-lg overflow-hidden mb-2 aspect-[16/9]">
        <img
          src={category.image}
          alt={category.name}
          className="w-full h-full object-cover"
        />
      </div>
    ) : (
      <div className="rounded-lg bg-stone-100 dark:bg-stone-800 aspect-[16/9] mb-2 flex items-center justify-center">
        <ImageIcon className="w-6 h-6 text-stone-400" />
      </div>
    )}
    <p className="text-sm text-stone-700 dark:text-stone-300 font-medium leading-snug">
      {category.name || "Category name"}
    </p>
    <p className="text-xs text-stone-500 dark:text-stone-500 mt-1 line-clamp-2 leading-relaxed">
      {category.description || "Category description goes here."}
    </p>
  </div>
);

/* ============================================================
   DRAWER
============================================================ */

const CategoryDrawer = ({ open, onClose, initial, onSave, saving, existingSlugs }) => {
  const [form, setForm] = useState(emptyCategory());
  const [errors, setErrors] = useState({});
  const [autoSlug, setAutoSlug] = useState(true);

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...emptyCategory(), ...initial } : emptyCategory());
      setErrors({});
      setAutoSlug(!initial);
    }
  }, [open, initial]);

  const update = (path, value) => {
    setForm((prev) => {
      const next = { ...prev, [path]: value };
      if (path === "name" && autoSlug) {
        next.slug = slugify(value);
      }
      return next;
    });
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.slug.trim()) e.slug = "Slug is required";
    if (
      form.slug &&
      existingSlugs.includes(form.slug) &&
      form.slug !== initial?.slug
    ) {
      e.slug = "This slug is already in use";
    }
    if (form.image && !/^https?:\/\//i.test(form.image)) {
      e.image = "Image URL must start with http:// or https://";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    onSave({
      ...form,
      id: form.id || slugify(form.name),
      slug: form.slug || slugify(form.name),
      order: Number(form.order) || 0,
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
                  {initial?.id ? "Edit category" : "New category"}
                </p>
                <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-50">
                  {initial?.id ? form.name || "Edit category" : "Add a section"}
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
              <CategoryPreview category={form} />

              <Field label="Name" required error={errors.name}>
                <TextInput
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="e.g. Heart Health"
                />
              </Field>

              <Field
                label="Slug"
                required
                error={errors.slug}
                hint={`Public URL: /blog/category/${form.slug || "…"}`}
              >
                <div className="flex items-center gap-2">
                  <TextInput
                    value={form.slug}
                    onChange={(e) => {
                      setAutoSlug(false);
                      update("slug", slugify(e.target.value));
                    }}
                    placeholder="heart-health"
                  />
                  {initial && (
                    <button
                      type="button"
                      onClick={() => {
                        update("slug", slugify(form.name));
                      }}
                      className="px-3 py-2.5 rounded-lg border border-stone-200 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-900 transition whitespace-nowrap"
                    >
                      Regenerate
                    </button>
                  )}
                </div>
              </Field>

              <Field
                label="Description"
                hint="Shown as the introduction on the category page and as the deck on category cards."
              >
                <TextArea
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  placeholder="Evidence-based articles on cardiovascular health, hypertension, cholesterol, and heart disease prevention."
                  rows={4}
                />
              </Field>

              <Field
                label="Cover image URL"
                error={errors.image}
                hint="Used on the category card in admin and anywhere the journal shows a category thumbnail."
              >
                <TextInput
                  value={form.image}
                  onChange={(e) => update("image", e.target.value)}
                  placeholder="https://…"
                />
              </Field>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field
                  label="Order"
                  hint="Lower numbers appear first in the category strip."
                >
                  <TextInput
                    type="number"
                    value={form.order}
                    onChange={(e) => update("order", e.target.value)}
                    placeholder="0"
                  />
                </Field>

                <Field
                  label="Accent"
                  hint="Optional. Reserved for future theming — the journal currently renders every category in the same palette."
                >
                  <TextInput
                    value={form.color}
                    onChange={(e) => update("color", e.target.value)}
                    placeholder="rose"
                  />
                </Field>
              </div>

              <label className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => update("active", e.target.checked)}
                  className="w-4 h-4 rounded border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:ring-0"
                />
                <span className="text-sm text-stone-700 dark:text-stone-300">
                  Active — this category appears in navigation, filters, and
                  the create-post form
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
                    {initial?.id ? "Save changes" : "Create category"}
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

const ConfirmDelete = ({ open, category, postCount, onCancel, onConfirm, deleting }) => (
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
            Delete "{category?.name}"?
          </h3>
          <p className="text-sm text-stone-600 dark:text-stone-400 mb-6 leading-relaxed">
            {postCount > 0 ? (
              <>
                <strong className="text-stone-900 dark:text-stone-100 font-semibold">
                  {postCount} {postCount === 1 ? "story is" : "stories are"}
                </strong>{" "}
                currently filed under this category. Deleting it will leave
                those stories without a section. Reassign them first, or
                deactivate the category instead to keep them intact.
              </>
            ) : (
              <>
                This cannot be undone. The category will be removed from the
                journal and from the create-post form.
              </>
            )}
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
              disabled={deleting || postCount > 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-rose-600 text-white text-sm font-medium hover:bg-rose-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
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

const AdminBlogCategories = () => {
  const [categories, setCategories] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("order");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  /* ---------- Load ---------- */
  useEffect(() => {
    // Replace with blogAPI.getCategories() + blogAPI.getPosts() when ready
    setCategories(
      mockCategories.map((c, i) => ({
        ...c,
        order: typeof c.order === "number" ? c.order : i,
        active: c.active !== false,
      }))
    );
    setPosts(mockPosts);
    setTimeout(() => setLoading(false), 300);
  }, []);

  /* ---------- Derived ---------- */
  const postsByCategory = useMemo(() => {
    const map = new Map();
    posts.forEach((p) => {
      map.set(p.categoryId, (map.get(p.categoryId) || 0) + 1);
    });
    return map;
  }, [posts]);

  const existingSlugs = useMemo(
    () => categories.map((c) => c.slug),
    [categories]
  );

  const filtered = useMemo(() => {
    let list = [...categories];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.slug.toLowerCase().includes(q) ||
          (c.description || "").toLowerCase().includes(q)
      );
    }
    if (statusFilter === "active") list = list.filter((c) => c.active);
    if (statusFilter === "inactive") list = list.filter((c) => !c.active);

    list.sort((a, b) => {
      if (sortBy === "order") return (a.order || 0) - (b.order || 0);
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "posts")
        return (postsByCategory.get(b.id) || 0) - (postsByCategory.get(a.id) || 0);
      return 0;
    });
    return list;
  }, [categories, search, statusFilter, sortBy, postsByCategory]);

  /* ---------- Handlers ---------- */
  const openCreate = () => {
    setEditing(null);
    setDrawerOpen(true);
  };

  const openEdit = (category) => {
    setEditing(category);
    setDrawerOpen(true);
  };

  const handleSave = async (payload) => {
    setSaving(true);
    // Replace with blogAPI.createCategory / updateCategory
    await new Promise((r) => setTimeout(r, 400));

    setCategories((prev) => {
      const exists = prev.find((c) => c.id === payload.id);
      if (exists) return prev.map((c) => (c.id === payload.id ? payload : c));
      return [...prev, payload];
    });
    toast.success(editing?.id ? "Category updated" : "Category created");
    setSaving(false);
    setDrawerOpen(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    await new Promise((r) => setTimeout(r, 400));
    setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id));
    toast.success("Category deleted");
    setDeleting(false);
    setDeleteTarget(null);
  };

  const toggleActive = (category) => {
    setCategories((prev) =>
      prev.map((c) =>
        c.id === category.id ? { ...c, active: !c.active } : c
      )
    );
    toast.success(
      `${category.name} ${category.active ? "deactivated" : "activated"}`
    );
  };

  const moveUp = (category) => {
    setCategories((prev) => {
      const sorted = [...prev].sort(
        (a, b) => (a.order || 0) - (b.order || 0)
      );
      const idx = sorted.findIndex((c) => c.id === category.id);
      if (idx <= 0) return prev;
      const above = sorted[idx - 1];
      return prev.map((c) => {
        if (c.id === category.id) return { ...c, order: above.order };
        if (c.id === above.id) return { ...c, order: category.order };
        return c;
      });
    });
  };

  const moveDown = (category) => {
    setCategories((prev) => {
      const sorted = [...prev].sort(
        (a, b) => (a.order || 0) - (b.order || 0)
      );
      const idx = sorted.findIndex((c) => c.id === category.id);
      if (idx === -1 || idx >= sorted.length - 1) return prev;
      const below = sorted[idx + 1];
      return prev.map((c) => {
        if (c.id === category.id) return { ...c, order: below.order };
        if (c.id === below.id) return { ...c, order: category.order };
        return c;
      });
    });
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
            Categories
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-2 max-w-2xl">
            The sections of the journal. Every post is filed under one
            category, and every category becomes a public page at{" "}
            <span className="font-mono text-xs bg-stone-100 dark:bg-stone-900 px-1.5 py-0.5 rounded">
              /blog/category/&lt;slug&gt;
            </span>
          </p>
        </div>

        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-sm font-medium hover:opacity-90 transition self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          New category
        </button>
      </div>

      {/* ---------- STATS ---------- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Sections", value: categories.length },
          {
            label: "Active",
            value: categories.filter((c) => c.active).length,
          },
          {
            label: "With stories",
            value: categories.filter(
              (c) => (postsByCategory.get(c.id) || 0) > 0
            ).length,
          },
          {
            label: "Total filed",
            value: posts.length,
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
            placeholder="Search by name or slug…"
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
            <option value="order">Custom order</option>
            <option value="name">Sort: A–Z</option>
            <option value="posts">Sort: Most posts</option>
          </select>
        </div>
      </div>

      {/* ---------- LIST / GRID ---------- */}
      {loading ? (
        <div className="py-20 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-stone-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center max-w-md mx-auto">
          <p className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100 mb-3">
            {categories.length === 0 ? "No categories yet" : "No categories match"}
          </p>
          <p className="text-sm text-stone-500 dark:text-stone-400 mb-6">
            {categories.length === 0
              ? "Create the first section to start filing stories."
              : "Try a different search or status filter."}
          </p>
          {categories.length === 0 && (
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-sm font-medium hover:opacity-90 transition"
            >
              <Plus className="w-4 h-4" />
              Create first category
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((c, i) => {
            const postCount = postsByCategory.get(c.id) || 0;
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.3) }}
                className="group rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 overflow-hidden flex flex-col"
              >
                {/* Cover */}
                <div className="relative aspect-[16/9] bg-stone-100 dark:bg-stone-900">
                  {c.image ? (
                    <img
                      src={c.image}
                      alt={c.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FolderTree className="w-8 h-8 text-stone-300 dark:text-stone-700" />
                    </div>
                  )}

                  {!c.active && (
                    <div className="absolute top-3 left-3 inline-flex items-center px-2 py-0.5 rounded-full bg-white/90 dark:bg-stone-950/90 text-[10px] uppercase tracking-wider text-stone-600 dark:text-stone-400 font-semibold backdrop-blur-sm">
                      Inactive
                    </div>
                  )}

                  <div className="absolute top-3 right-3 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => moveUp(c)}
                      title="Move up"
                      className="w-7 h-7 rounded-full bg-white/90 dark:bg-stone-950/90 backdrop-blur-sm flex items-center justify-center text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => moveDown(c)}
                      title="Move down"
                      className="w-7 h-7 rounded-full bg-white/90 dark:bg-stone-950/90 backdrop-blur-sm flex items-center justify-center text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Body */}
                <div className="flex-1 p-5 flex flex-col">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-50 leading-snug">
                      {c.name}
                    </h3>
                    <span className="text-xs text-stone-400 dark:text-stone-600 whitespace-nowrap">
                      #{c.order}
                    </span>
                  </div>

                  <p className="text-xs font-mono text-stone-500 dark:text-stone-500 mb-3">
                    /blog/category/{c.slug}
                  </p>

                  {c.description && (
                    <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed line-clamp-2 mb-4">
                      {c.description}
                    </p>
                  )}

                  <div className="mt-auto flex items-center justify-between gap-3 pt-4 border-t border-stone-100 dark:border-stone-900">
                    <span className="text-xs text-stone-500 dark:text-stone-500 flex items-center gap-1.5">
                      <Hash className="w-3 h-3" />
                      {postCount} {postCount === 1 ? "story" : "stories"}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleActive(c)}
                        title={c.active ? "Deactivate" : "Activate"}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-900 transition"
                      >
                        {c.active ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <a
                        href={`/blog/category/${c.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="View on the journal"
                        className="w-8 h-8 rounded-full flex items-center justify-center text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-900 transition"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => openEdit(c)}
                        title="Edit"
                        className="w-8 h-8 rounded-full flex items-center justify-center text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-900 transition"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(c)}
                        title="Delete"
                        className="w-8 h-8 rounded-full flex items-center justify-center text-stone-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ---------- DRAWER ---------- */}
      <CategoryDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        initial={editing}
        onSave={handleSave}
        saving={saving}
        existingSlugs={existingSlugs}
      />

      {/* ---------- DELETE ---------- */}
      <ConfirmDelete
        open={!!deleteTarget}
        category={deleteTarget}
        postCount={
          deleteTarget ? postsByCategory.get(deleteTarget.id) || 0 : 0
        }
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        deleting={deleting}
      />
    </div>
  );
};

export default AdminBlogCategories;