// src/pages/admin/blog/AdminBlogVideos.jsx — WIRED TO LIVE API
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Plus, X, Edit3, Trash2, Loader2, Save, AlertCircle,
  Video, Play, ExternalLink, Star, Clock, Calendar, Eye,
  Film, Check, Copy, RotateCw, Link2,
  Maximize2, ChevronDown,
} from "lucide-react";
import { Youtube } from "../../../components/icons/BrandIcons";
import { toast } from "react-hot-toast";
import { adminBlogAPI as blogAPI } from "../../../api/blogApi";

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
    : "";

const extractYouTubeId = (input = "") => {
  const s = String(input).trim();
  if (!s) return "";
  if (/^[\w-]{11}$/.test(s)) return s;

  try {
    const url = new URL(s);
    if (url.hostname.includes("youtu.be")) {
      return url.pathname.replace(/^\//, "").split("/")[0];
    }
    if (url.searchParams.get("v")) {
      return url.searchParams.get("v");
    }
    const m = url.pathname.match(/\/(embed|shorts|v)\/([\w-]{11})/);
    if (m) return m[2];
  } catch (e) {
    /* fall through */
  }

  const token = s.match(/[\w-]{11}/);
  return token ? token[0] : "";
};

const thumbnailFor = (videoId) =>
  videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : "";

const emptyVideo = () => ({
  id: "",
  _id: "",
  youtubeId: "",
  title: "",
  description: "",
  duration: "",
  category: "",
  publishedAt: new Date().toISOString().slice(0, 10),
  featured: false,
  status: "draft",
});

/* Normalize server → local shape */
const normalizeVideo = (v) => ({
  ...v,
  id: v._id || v.id,
  featured: v.featured === true,
  status: v.status || "draft",
  publishedAt:
    v.publishedAt instanceof Date
      ? v.publishedAt.toISOString()
      : v.publishedAt,
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
  const s = map[status] || map.draft;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-semibold ${s.tone}`}
    >
      {s.label}
    </span>
  );
};

/* ============================================================
   VIDEO PREVIEW MODAL
============================================================ */

const VideoPreview = ({ open, video, onClose }) => (
  <AnimatePresence>
    {open && video && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-stone-900/80 backdrop-blur-sm z-[60]"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="fixed z-[60] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl px-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white dark:bg-stone-950 rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800">
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 dark:border-stone-800">
              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-wider text-rose-600 dark:text-rose-400 font-semibold mb-1">
                  Preview
                </p>
                <p className="font-serif text-base font-bold text-stone-900 dark:text-stone-50 truncate">
                  {video.title}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full flex items-center justify-center text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-900 transition flex-shrink-0 ml-3"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="aspect-video bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1`}
                title={video.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div className="flex items-center justify-between gap-4 px-5 py-4 border-t border-stone-200 dark:border-stone-800">
              <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-stone-500 dark:text-stone-500">
                {video.category && (
                  <span className="text-rose-600 dark:text-rose-400 font-semibold uppercase tracking-wider">
                    {video.category}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  {video.duration}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" />
                  {formatShortDate(video.publishedAt)}
                </span>
              </div>
              <a
                href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition flex-shrink-0"
              >
                <ExternalLink className="w-3 h-3" />
                Open on YouTube
              </a>
            </div>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

/* ============================================================
   DRAWER
============================================================ */

const VideoDrawer = ({ open, onClose, initial, onSave, saving }) => {
  const [form, setForm] = useState(emptyVideo());
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...emptyVideo(), ...initial } : emptyVideo());
      setErrors({});
    }
  }, [open, initial]);

  const update = (path, value) =>
    setForm((prev) => ({ ...prev, [path]: value }));

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.youtubeId) e.youtubeId = "A YouTube video ID is required";
    if (!form.duration.trim()) e.duration = "Duration is required";
    if (!form.category.trim()) e.category = "Category is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    onSave({
      ...form,
      youtubeId: form.youtubeId.trim(),
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
            <div className="flex-shrink-0 px-6 py-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-rose-600 dark:text-rose-400 font-semibold mb-1">
                  {initial?.id ? "Edit video" : "New video"}
                </p>
                <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-50">
                  {initial?.id
                    ? form.title || "Edit video"
                    : "Add a video"}
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
              <div className="rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-900 aspect-video flex items-center justify-center border border-stone-200 dark:border-stone-800">
                {form.youtubeId ? (
                  <div className="relative w-full h-full group">
                    <img
                      src={thumbnailFor(form.youtubeId)}
                      alt=""
                      onError={(e) => {
                        e.currentTarget.src = `https://img.youtube.com/vi/${form.youtubeId}/hqdefault.jpg`;
                      }}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center">
                        <Play className="w-5 h-5 text-stone-900 ml-0.5" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <Film className="w-10 h-10 text-stone-300 dark:text-stone-700 mx-auto mb-2" />
                    <p className="text-xs text-stone-500 dark:text-stone-500">
                      Paste a YouTube link to see the thumbnail
                    </p>
                  </div>
                )}
              </div>

              <Field
                label="YouTube link or ID"
                required
                error={errors.youtubeId}
                hint="Paste any YouTube URL — watch, youtu.be, embed, shorts — or just the 11-character ID."
              >
                <div className="relative">
                  <Youtube className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    value={form.youtubeId}
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (raw.length > 20) {
                        const id = extractYouTubeId(raw);
                        if (id) update("youtubeId", id);
                        else update("youtubeId", raw);
                      } else {
                        update("youtubeId", raw);
                      }
                    }}
                    onBlur={(e) => {
                      const id = extractYouTubeId(e.target.value);
                      if (id && id !== e.target.value) {
                        update("youtubeId", id);
                        toast.success("Video ID extracted");
                      }
                    }}
                    placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 transition font-mono"
                  />
                </div>
                {form.youtubeId && (
                  <div className="mt-3 flex items-center justify-between gap-3 p-3 rounded-lg bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                    <div className="flex items-center gap-2 min-w-0">
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                      <span className="text-xs text-stone-600 dark:text-stone-400">
                        Video ID:
                      </span>
                      <code className="text-xs font-mono text-stone-900 dark:text-stone-100 truncate">
                        {form.youtubeId}
                      </code>
                    </div>
                    <a
                      href={`https://www.youtube.com/watch?v=${form.youtubeId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition flex-shrink-0"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Verify
                    </a>
                  </div>
                )}
              </Field>

              <Field label="Title" required error={errors.title}>
                <TextInput
                  value={form.title}
                  onChange={(e) => update("title", e.target.value)}
                  placeholder="How to Check Your Blood Pressure at Home (Correctly)"
                />
              </Field>

              <Field
                label="Description"
                hint="Shown on the video page and in the embed card."
              >
                <TextArea
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  rows={4}
                  placeholder="A step-by-step guide to accurate home blood pressure monitoring."
                />
              </Field>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field
                  label="Duration"
                  required
                  error={errors.duration}
                  hint="MM:SS"
                >
                  <TextInput
                    value={form.duration}
                    onChange={(e) => update("duration", e.target.value)}
                    placeholder="5:24"
                  />
                </Field>
                <Field
                  label="Category"
                  required
                  error={errors.category}
                  hint="A short label like 'Heart Health' or 'Nutrition'."
                >
                  <TextInput
                    value={form.category}
                    onChange={(e) => update("category", e.target.value)}
                    placeholder="Heart Health"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Published" hint="Date the video goes live.">
                  <TextInput
                    type="date"
                    value={(form.publishedAt || "").slice(0, 10)}
                    onChange={(e) => update("publishedAt", e.target.value)}
                  />
                </Field>
                <Field label="Status">
                  <select
                    value={form.status}
                    onChange={(e) => update("status", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-sm focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 transition cursor-pointer"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </Field>
              </div>

              <label className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => update("featured", e.target.checked)}
                  className="w-4 h-4 rounded border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:ring-0"
                />
                <span className="text-sm text-stone-700 dark:text-stone-300">
                  Feature on the video page
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
                    {initial?.id ? "Save changes" : "Create video"}
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

const ConfirmDelete = ({ open, video, onCancel, onConfirm, deleting }) => (
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
            Remove this video?
          </h3>
          <p className="text-sm text-stone-600 dark:text-stone-400 mb-6 leading-relaxed">
            <strong>"{video?.title}"</strong> will disappear from{" "}
            <code className="font-mono text-xs">/blog/videos</code>. The
            original YouTube video isn't affected. This cannot be undone.
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
                  Removing…
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove video
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

const AdminBlogVideos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const [previewTarget, setPreviewTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  /* ---------- Load from API ---------- */
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await blogAPI.getVideos();
      setVideos((res.data || []).map(normalizeVideo));
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to load videos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ---------- Derived ---------- */
  const categories = useMemo(() => {
    const set = new Set();
    videos.forEach((v) => {
      if (v.category) set.add(v.category);
    });
    return [...set].sort();
  }, [videos]);

  const stats = useMemo(() => {
    return {
      count: videos.length,
      published: videos.filter((v) => v.status === "published").length,
      categories: categories.length,
      featured: videos.filter((v) => v.featured).length,
    };
  }, [videos, categories]);

  const filtered = useMemo(() => {
    let list = [...videos];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          (v.description || "").toLowerCase().includes(q) ||
          (v.category || "").toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") {
      list = list.filter((v) => v.status === statusFilter);
    }
    if (categoryFilter !== "all") {
      list = list.filter((v) => v.category === categoryFilter);
    }
    list.sort((a, b) => {
      if (sortBy === "newest")
        return (
          new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0)
        );
      if (sortBy === "oldest")
        return (
          new Date(a.publishedAt || 0) - new Date(b.publishedAt || 0)
        );
      if (sortBy === "title") return a.title.localeCompare(b.title);
      return 0;
    });
    return list;
  }, [videos, search, statusFilter, categoryFilter, sortBy]);

  /* ---------- Handlers ---------- */
  const openCreate = () => {
    setEditing(null);
    setDrawerOpen(true);
  };

  const openEdit = (v) => {
    setEditing(v);
    setDrawerOpen(true);
  };

  const handleSave = async (payload) => {
    setSaving(true);
    try {
      const body = {
        youtubeId: payload.youtubeId.trim(),
        title: payload.title.trim(),
        description: payload.description || "",
        duration: payload.duration.trim(),
        category: payload.category.trim(),
        featured: payload.featured === true,
        status: payload.status || "draft",
        publishedAt: payload.publishedAt || new Date().toISOString(),
      };

      if (editing?.id) {
        await blogAPI.updateVideo(editing.id, body);
        toast.success("Video updated");
      } else {
        await blogAPI.createVideo(body);
        toast.success("Video added");
      }

      await fetchData();
      setDrawerOpen(false);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save video");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await blogAPI.deleteVideo(deleteTarget.id);
      setVideos((prev) => prev.filter((v) => v.id !== deleteTarget.id));
      toast.success("Video removed");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove video");
    } finally {
      setDeleting(false);
    }
  };

  const toggleFeatured = async (v) => {
    const next = !v.featured;
    setVideos((prev) =>
      prev.map((x) => (x.id === v.id ? { ...x, featured: next } : x))
    );
    try {
      await blogAPI.updateVideo(v.id, { featured: next });
      toast.success(`"${v.title}" ${next ? "featured" : "unfeatured"}`);
    } catch (err) {
      setVideos((prev) =>
        prev.map((x) =>
          x.id === v.id ? { ...x, featured: v.featured } : x
        )
      );
      toast.error("Failed to update video");
    }
  };

  const toggleStatus = async (v) => {
    const next = v.status === "published" ? "draft" : "published";
    setVideos((prev) =>
      prev.map((x) => (x.id === v.id ? { ...x, status: next } : x))
    );
    try {
      await blogAPI.updateVideo(v.id, { status: next });
      toast.success(next === "published" ? "Published" : "Moved to draft");
    } catch (err) {
      setVideos((prev) =>
        prev.map((x) => (x.id === v.id ? { ...x, status: v.status } : x))
      );
      toast.error("Failed to update status");
    }
  };

  /* ---------- Render (same UI as before) ---------- */
  return (
    <div className="space-y-6 pb-24">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-rose-600 dark:text-rose-400 font-semibold mb-2">
            The Alveoly Journal
          </p>
          <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
            Videos
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-2 max-w-2xl">
            Short explainers from the medical desk. Published videos appear at{" "}
            <span className="font-mono text-xs bg-stone-100 dark:bg-stone-900 px-1.5 py-0.5 rounded">
              /blog/videos
            </span>{" "}
            with the YouTube embed.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-sm font-medium hover:opacity-90 transition self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add video
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Videos", value: stats.count },
          { label: "Published", value: stats.published },
          { label: "Categories", value: stats.categories },
          { label: "Featured", value: stats.featured },
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
            placeholder="Search by title, description, or category…"
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-transparent text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-transparent border border-stone-200 dark:border-stone-800 text-sm text-stone-700 dark:text-stone-300 focus:outline-none cursor-pointer"
          >
            <option value="all">All status</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
            <option value="archived">Archived</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-transparent border border-stone-200 dark:border-stone-800 text-sm text-stone-700 dark:text-stone-300 focus:outline-none cursor-pointer max-w-[180px]"
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
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
            {videos.length === 0 ? "No videos yet" : "No videos match"}
          </p>
          <p className="text-sm text-stone-500 dark:text-stone-400 mb-6">
            {videos.length === 0
              ? "Add the first video to start the library."
              : "Try a different search or filter."}
          </p>
          {videos.length === 0 && (
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-sm font-medium hover:opacity-90 transition"
            >
              <Plus className="w-4 h-4" />
              Add first video
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((v, i) => (
            <motion.article
              key={v.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.3) }}
              className="group rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 overflow-hidden flex flex-col"
            >
              <button
                onClick={() => setPreviewTarget(v)}
                className="relative aspect-video bg-stone-100 dark:bg-stone-900 block group/thumb overflow-hidden"
              >
                {v.youtubeId ? (
                  <img
                    src={thumbnailFor(v.youtubeId)}
                    alt={v.title}
                    onError={(e) => {
                      e.currentTarget.src = `https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg`;
                    }}
                    className="w-full h-full object-cover group-hover/thumb:scale-[1.02] transition duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Film className="w-10 h-10 text-stone-300 dark:text-stone-700" />
                  </div>
                )}

                <div className="absolute inset-0 bg-black/30 group-hover/thumb:bg-black/40 transition flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center group-hover/thumb:scale-110 transition">
                    <Play className="w-4 h-4 text-stone-900 ml-0.5" />
                  </div>
                </div>

                {v.duration && (
                  <div className="absolute bottom-3 right-3 px-2 py-1 rounded bg-black/80 backdrop-blur-sm text-white text-[10px] font-semibold tracking-wider">
                    {v.duration}
                  </div>
                )}

                {v.featured && (
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-amber-500/90 backdrop-blur-sm text-white text-[10px] uppercase tracking-wider font-semibold flex items-center gap-1">
                    <Star className="w-2.5 h-2.5" />
                    Featured
                  </div>
                )}

                <div className="absolute top-3 right-3">
                  <StatusBadge status={v.status} />
                </div>
              </button>

              <div className="flex-1 p-5 flex flex-col">
                {v.category && (
                  <p className="text-[10px] uppercase tracking-wider text-rose-600 dark:text-rose-400 font-semibold mb-1.5">
                    {v.category}
                  </p>
                )}

                <h3 className="font-serif text-lg font-bold leading-snug text-stone-900 dark:text-stone-50 mb-2 line-clamp-2">
                  {v.title}
                </h3>

                {v.description && (
                  <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed line-clamp-2 mb-4">
                    {v.description}
                  </p>
                )}

                <div className="mt-auto pt-4 border-t border-stone-100 dark:border-stone-900">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 text-xs text-stone-500 dark:text-stone-500">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        {v.duration}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" />
                        {formatShortDate(v.publishedAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleFeatured(v)}
                        title={v.featured ? "Unfeature" : "Feature"}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-stone-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition"
                      >
                        <Star className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => toggleStatus(v)}
                        title={
                          v.status === "published"
                            ? "Move to draft"
                            : "Publish"
                        }
                        className="w-8 h-8 rounded-full flex items-center justify-center text-stone-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <a
                        href={`https://www.youtube.com/watch?v=${v.youtubeId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Open on YouTube"
                        className="w-8 h-8 rounded-full flex items-center justify-center text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-900 transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => openEdit(v)}
                        title="Edit"
                        className="w-8 h-8 rounded-full flex items-center justify-center text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-900 transition"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(v)}
                        title="Remove"
                        className="w-8 h-8 rounded-full flex items-center justify-center text-stone-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <p className="text-xs text-stone-500 dark:text-stone-500 text-center">
          {filtered.length}{" "}
          {filtered.length === 1 ? "video" : "videos"} shown
          {categoryFilter !== "all" && ` · ${categoryFilter}`}
          {statusFilter !== "all" && ` · ${statusFilter}`}
        </p>
      )}

      <VideoDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        initial={editing}
        onSave={handleSave}
        saving={saving}
      />

      <VideoPreview
        open={!!previewTarget}
        video={previewTarget}
        onClose={() => setPreviewTarget(null)}
      />

      <ConfirmDelete
        open={!!deleteTarget}
        video={deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        deleting={deleting}
      />
    </div>
  );
};

export default AdminBlogVideos;