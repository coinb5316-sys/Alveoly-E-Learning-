// src/pages/admin/blog/AdminBlogTags.jsx — WIRED TO LIVE API
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Plus, X, Edit3, Trash2, Loader2, Save, AlertCircle,
  Hash, ArrowUpRight, Tag as TagIcon, Merge, Check, Eye,
  TrendingUp, Copy,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { adminBlogAPI as blogAPI } from "../../../api/blogApi";

/* ============================================================
   HELPERS
============================================================ */

const slugify = (s = "") =>
  String(s)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

const emptyTag = () => ({
  id: "",
  _id: "",
  slug: "",
  name: "",
  description: "",
  featured: false,
});

/* Normalize server tag → local shape */
const normalizeTag = (t) => ({
  ...t,
  id: t._id || t.id,
  featured: t.featured === true,
  postCount: typeof t.postCount === "number" ? t.postCount : 0,
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

const TagPreview = ({ tag, postCount }) => (
  <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
    <p className="text-[10px] uppercase tracking-widest text-stone-500 dark:text-stone-400 font-semibold mb-3">
      Preview on the journal
    </p>
    <div className="flex flex-wrap gap-2 mb-4">
      <span className="inline-flex items-baseline gap-1.5 px-3.5 py-2 rounded-full bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 text-sm font-medium">
        <span>#{tag.name || "topic"}</span>
        {postCount != null && (
          <span className="text-[10px] text-stone-400">{postCount}</span>
        )}
      </span>
    </div>
    <p className="text-xs font-mono text-stone-500 dark:text-stone-500 mb-3">
      /blog/tag/{tag.slug || "…"}
    </p>
    {tag.description && (
      <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed line-clamp-3">
        {tag.description}
      </p>
    )}
  </div>
);

/* ============================================================
   DRAWER
============================================================ */

const TagDrawer = ({ open, onClose, initial, onSave, saving, existingSlugs }) => {
  const [form, setForm] = useState(emptyTag());
  const [errors, setErrors] = useState({});
  const [autoSlug, setAutoSlug] = useState(true);

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...emptyTag(), ...initial } : emptyTag());
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
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    onSave({
      ...form,
      slug: form.slug || slugify(form.name),
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
                  {initial?.id ? "Edit tag" : "New tag"}
                </p>
                <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-50">
                  {initial?.id ? form.name || "Edit tag" : "Add a topic"}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full flex items-center justify-center text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-900 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              <TagPreview tag={form} postCount={initial?.postCount} />

              <Field label="Name" required error={errors.name}>
                <TextInput
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="e.g. Hypertension"
                />
              </Field>

              <Field
                label="Slug"
                required
                error={errors.slug}
                hint={`Public URL: /blog/tag/${form.slug || "…"}`}
              >
                <div className="flex items-center gap-2">
                  <TextInput
                    value={form.slug}
                    onChange={(e) => {
                      setAutoSlug(false);
                      update("slug", slugify(e.target.value));
                    }}
                    placeholder="hypertension"
                  />
                  {initial && (
                    <button
                      type="button"
                      onClick={() => update("slug", slugify(form.name))}
                      className="px-3 py-2.5 rounded-lg border border-stone-200 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-900 transition whitespace-nowrap"
                    >
                      Regenerate
                    </button>
                  )}
                </div>
              </Field>

              <Field
                label="Description"
                hint="Optional. Explains what this topic covers — used on the public tag page and in metadata."
              >
                <TextArea
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  placeholder="Stories about blood pressure, risk factors, and prevention across the journal."
                  rows={4}
                />
              </Field>

              <label className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => update("featured", e.target.checked)}
                  className="w-4 h-4 rounded border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:ring-0"
                />
                <span className="text-sm text-stone-700 dark:text-stone-300">
                  Featured — pinned to the top of the trending list on{" "}
                  <span className="font-mono text-xs">/blog</span>
                </span>
              </label>
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
                    Saving…
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    {initial?.id ? "Save changes" : "Create tag"}
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
   MERGE MODAL
============================================================ */

const MergeModal = ({ open, source, candidates, onCancel, onConfirm, merging }) => {
  const [targetId, setTargetId] = useState("");

  useEffect(() => {
    if (open) setTargetId("");
  }, [open]);

  const target = candidates.find((c) => c.id === targetId);

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
            className="fixed z-[60] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white dark:bg-stone-950 rounded-2xl border border-stone-200 dark:border-stone-800 p-6"
          >
            <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center mb-4">
              <Merge className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-50 mb-2">
              Merge "{source?.name}"
            </h3>
            <p className="text-sm text-stone-600 dark:text-stone-400 mb-5 leading-relaxed">
              Choose another tag to merge <strong>#{source?.name}</strong> into.
              Every story currently tagged <strong>#{source?.name}</strong> will
              also be tagged with the target, and the source tag will be
              removed from the journal.
            </p>

            <div className="mb-5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2">
                Merge into
              </label>
              <div className="relative">
                <select
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 transition cursor-pointer"
                >
                  <option value="">Select a tag…</option>
                  {candidates.map((c) => (
                    <option key={c.id} value={c.id}>
                      #{c.name}
                    </option>
                  ))}
                </select>
              </div>

              {target && (
                <div className="mt-3 p-3 rounded-lg bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                  <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                    <strong>#{source?.name}</strong> →{" "}
                    <strong>#{target.name}</strong>
                  </p>
                  <p className="text-xs text-stone-500 dark:text-stone-500 mt-1">
                    /blog/tag/{source?.slug} → /blog/tag/{target.slug}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={onCancel}
                disabled={merging}
                className="px-4 py-2.5 text-sm text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => onConfirm(targetId)}
                disabled={merging || !targetId}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {merging ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Merging…
                  </>
                ) : (
                  <>
                    <Merge className="w-3.5 h-3.5" />
                    Merge tags
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
   CONFIRM DELETE
============================================================ */

const ConfirmDelete = ({ open, tag, postCount, onCancel, onConfirm, deleting }) => (
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
            Delete #{tag?.name}?
          </h3>
          <p className="text-sm text-stone-600 dark:text-stone-400 mb-6 leading-relaxed">
            {postCount > 0 ? (
              <>
                <strong className="text-stone-900 dark:text-stone-100 font-semibold">
                  {postCount} {postCount === 1 ? "story uses" : "stories use"}
                </strong>{" "}
                this tag. Deleting it will remove <strong>#{tag?.name}</strong>{" "}
                from those stories. If you want to keep them, try{" "}
                <em>Merge</em> instead to combine with another tag.
              </>
            ) : (
              <>
                Nothing uses this tag yet. Deleting it is safe — it will simply
                disappear from the create-post picker.
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
   MAIN — WIRED TO LIVE API
============================================================ */

const AdminBlogTags = () => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("usage");
  const [statusFilter, setStatusFilter] = useState("all");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [mergeSource, setMergeSource] = useState(null);
  const [merging, setMerging] = useState(false);

  const [inlineEditId, setInlineEditId] = useState(null);
  const [inlineValue, setInlineValue] = useState("");

  /* ---------- Load from API ---------- */
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await blogAPI.getTags();
      setTags((res.data || []).map(normalizeTag));
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to load tags");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ---------- Derived ---------- */
  const existingSlugs = useMemo(() => tags.map((t) => t.slug), [tags]);

  const totalUsage = useMemo(
    () => tags.reduce((n, t) => n + (t.postCount || 0), 0),
    [tags]
  );

  const unusedCount = useMemo(
    () => tags.filter((t) => (t.postCount || 0) === 0).length,
    [tags]
  );

  const filtered = useMemo(() => {
    let list = [...tags];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.slug.toLowerCase().includes(q) ||
          (t.description || "").toLowerCase().includes(q)
      );
    }
    if (statusFilter === "used") list = list.filter((t) => (t.postCount || 0) > 0);
    if (statusFilter === "unused") list = list.filter((t) => (t.postCount || 0) === 0);
    if (statusFilter === "featured") list = list.filter((t) => t.featured);

    list.sort((a, b) => {
      if (sortBy === "usage") return (b.postCount || 0) - (a.postCount || 0);
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "newest")
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      return 0;
    });
    return list;
  }, [tags, search, sortBy, statusFilter]);

  /* ---------- Handlers ---------- */
  const openCreate = () => {
    setEditing(null);
    setDrawerOpen(true);
  };

  const openEdit = (tag) => {
    setEditing(tag);
    setDrawerOpen(true);
  };

  const handleSave = async (payload) => {
    setSaving(true);
    try {
      const body = {
        name: payload.name.trim(),
        slug: payload.slug || slugify(payload.name),
        description: payload.description || "",
        featured: payload.featured === true,
      };

      if (editing?.id) {
        await blogAPI.updateTag(editing.id, body);
        toast.success("Tag updated");
      } else {
        await blogAPI.createTag(body);
        toast.success("Tag created");
      }

      await fetchData();
      setDrawerOpen(false);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save tag");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await blogAPI.deleteTag(deleteTarget.id);
      setTags((prev) => prev.filter((t) => t.id !== deleteTarget.id));
      toast.success("Tag deleted");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete tag");
    } finally {
      setDeleting(false);
    }
  };

  const handleMerge = async (targetId) => {
    if (!mergeSource) return;
    const target = tags.find((t) => t.id === targetId);
    if (!target) return;

    setMerging(true);
    try {
      await blogAPI.mergeTags({
        sourceId: mergeSource.id,
        targetId: target.id,
      });
      toast.success(`Merged #${mergeSource.name} into #${target.name}`);
      setMergeSource(null);
      await fetchData();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to merge tags");
    } finally {
      setMerging(false);
    }
  };

  const toggleFeatured = async (tag) => {
    const next = !tag.featured;
    setTags((prev) =>
      prev.map((t) => (t.id === tag.id ? { ...t, featured: next } : t))
    );
    try {
      await blogAPI.updateTag(tag.id, { featured: next });
      toast.success(`#${tag.name} ${next ? "featured" : "unfeatured"}`);
    } catch (err) {
      setTags((prev) =>
        prev.map((t) =>
          t.id === tag.id ? { ...t, featured: tag.featured } : t
        )
      );
      toast.error("Failed to update tag");
    }
  };

  const startInlineEdit = (tag) => {
    setInlineEditId(tag.id);
    setInlineValue(tag.name);
  };

  const commitInlineEdit = async (tag) => {
    const next = inlineValue.trim();
    if (!next || next === tag.name) {
      setInlineEditId(null);
      return;
    }
    const nextSlug = slugify(next);
    if (existingSlugs.includes(nextSlug) && nextSlug !== tag.slug) {
      toast.error("A tag with that name already exists");
      return;
    }
    setInlineEditId(null);
    // optimistic
    setTags((prev) =>
      prev.map((t) =>
        t.id === tag.id ? { ...t, name: next, slug: nextSlug } : t
      )
    );
    try {
      await blogAPI.updateTag(tag.id, { name: next, slug: nextSlug });
      toast.success("Tag renamed");
    } catch (err) {
      toast.error(err.response?.data?.message || "Rename failed");
      await fetchData();
    }
  };

  const copySlug = (tag) => {
    navigator.clipboard.writeText(`/blog/tag/${tag.slug}`);
    toast.success("URL copied");
  };

  /* ---------- Render ---------- */
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-rose-600 dark:text-rose-400 font-semibold mb-2">
            The Alveoly Journal
          </p>
          <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
            Tags
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-2 max-w-2xl">
            Topics that cut across sections. Trending pills on{" "}
            <span className="font-mono text-xs bg-stone-100 dark:bg-stone-900 px-1.5 py-0.5 rounded">
              /blog
            </span>{" "}
            and every public tag page at{" "}
            <span className="font-mono text-xs bg-stone-100 dark:bg-stone-900 px-1.5 py-0.5 rounded">
              /blog/tag/&lt;slug&gt;
            </span>{" "}
            render from this list.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-sm font-medium hover:opacity-90 transition self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          New tag
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total tags", value: tags.length },
          {
            label: "In use",
            value: tags.filter((t) => (t.postCount || 0) > 0).length,
          },
          { label: "Unused", value: unusedCount },
          { label: "Total usages", value: totalUsage },
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
      <div className="flex flex-col md:flex-row md:items-center gap-3 p-3 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tags…"
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-transparent text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-transparent border border-stone-200 dark:border-stone-800 text-sm text-stone-700 dark:text-stone-300 focus:outline-none cursor-pointer"
          >
            <option value="all">All tags</option>
            <option value="used">In use</option>
            <option value="unused">Unused</option>
            <option value="featured">Featured</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-lg bg-transparent border border-stone-200 dark:border-stone-800 text-sm text-stone-700 dark:text-stone-300 focus:outline-none cursor-pointer"
          >
            <option value="usage">Sort: Most used</option>
            <option value="name">Sort: A–Z</option>
            <option value="newest">Sort: Newest</option>
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
            {tags.length === 0 ? "No tags yet" : "No tags match"}
          </p>
          <p className="text-sm text-stone-500 dark:text-stone-400 mb-6">
            {tags.length === 0
              ? "Create the first topic to start organising stories."
              : "Try a different search or filter."}
          </p>
          {tags.length === 0 && (
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-sm font-medium hover:opacity-90 transition"
            >
              <Plus className="w-4 h-4" />
              Create first tag
            </button>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 overflow-hidden">
          <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 bg-stone-50 dark:bg-stone-900/50 border-b border-stone-200 dark:border-stone-800 text-[10px] uppercase tracking-widest text-stone-500 dark:text-stone-400 font-semibold">
            <div className="col-span-5">Tag</div>
            <div className="col-span-3">Slug</div>
            <div className="col-span-2 text-right">Stories</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {filtered.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: Math.min(i * 0.015, 0.25) }}
              className={`grid grid-cols-1 md:grid-cols-12 gap-4 px-5 py-4 items-center group hover:bg-stone-50/60 dark:hover:bg-stone-900/30 transition ${
                i > 0 ? "border-t border-stone-100 dark:border-stone-900" : ""
              }`}
            >
              <div className="md:col-span-5 flex items-center gap-3 min-w-0">
                <span className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-900 flex items-center justify-center flex-shrink-0">
                  <Hash className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
                </span>

                {inlineEditId === t.id ? (
                  <input
                    autoFocus
                    value={inlineValue}
                    onChange={(e) => setInlineValue(e.target.value)}
                    onBlur={() => commitInlineEdit(t)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitInlineEdit(t);
                      if (e.key === "Escape") setInlineEditId(null);
                    }}
                    className="flex-1 min-w-0 px-2 py-1 rounded-md bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-sm font-medium text-stone-900 dark:text-stone-100 focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 transition"
                  />
                ) : (
                  <div className="min-w-0 flex-1">
                    <button
                      onClick={() => startInlineEdit(t)}
                      className="font-medium text-stone-900 dark:text-stone-100 hover:text-rose-600 dark:hover:text-rose-400 transition truncate block text-left max-w-full"
                      title="Click to rename"
                    >
                      #{t.name}
                    </button>
                    {t.description && (
                      <p className="text-xs text-stone-500 dark:text-stone-500 truncate mt-0.5">
                        {t.description}
                      </p>
                    )}
                  </div>
                )}

                {t.featured && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/30 text-[10px] uppercase tracking-wider text-amber-700 dark:text-amber-400 font-semibold flex-shrink-0">
                    <TrendingUp className="w-2.5 h-2.5" />
                    Featured
                  </span>
                )}
              </div>

              <div className="md:col-span-3 min-w-0">
                <button
                  onClick={() => copySlug(t)}
                  className="text-xs font-mono text-stone-500 dark:text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition inline-flex items-center gap-1.5 group/slug"
                  title="Copy URL"
                >
                  /blog/tag/{t.slug}
                  <Copy className="w-3 h-3 opacity-0 group-hover/slug:opacity-100 transition" />
                </button>
              </div>

              <div className="md:col-span-2 md:text-right">
                <span
                  className={`inline-flex items-center gap-1.5 text-xs ${
                    (t.postCount || 0) > 0
                      ? "text-stone-700 dark:text-stone-300"
                      : "text-stone-400 dark:text-stone-600"
                  }`}
                >
                  <strong className="font-semibold">{t.postCount || 0}</strong>
                  <span>{(t.postCount || 0) === 1 ? "story" : "stories"}</span>
                </span>
              </div>

              <div className="md:col-span-2 flex items-center md:justify-end gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition">
                <button
                  onClick={() => toggleFeatured(t)}
                  title={t.featured ? "Unfeature" : "Feature on trending"}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-stone-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                </button>
                <a
                  href={`/blog/tag/${t.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="View on the journal"
                  className="w-8 h-8 rounded-full flex items-center justify-center text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-900 transition"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => setMergeSource(t)}
                  title="Merge into another tag"
                  disabled={(t.postCount || 0) === 0}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-stone-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Merge className="w-3.5 h-3.5" />
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
            </motion.div>
          ))}
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <p className="text-xs text-stone-500 dark:text-stone-500 text-center pt-2">
          Click a tag name to rename it inline. Hover a row for more actions.
        </p>
      )}

      <TagDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        initial={editing}
        onSave={handleSave}
        saving={saving}
        existingSlugs={existingSlugs}
      />

      <MergeModal
        open={!!mergeSource}
        source={mergeSource}
        candidates={tags.filter((t) => t.id !== mergeSource?.id)}
        onCancel={() => setMergeSource(null)}
        onConfirm={handleMerge}
        merging={merging}
      />

      <ConfirmDelete
        open={!!deleteTarget}
        tag={deleteTarget}
        postCount={deleteTarget?.postCount || 0}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        deleting={deleting}
      />
    </div>
  );
};

export default AdminBlogTags;