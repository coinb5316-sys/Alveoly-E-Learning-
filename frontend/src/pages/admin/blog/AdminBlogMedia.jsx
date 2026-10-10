// src/pages/admin/blog/AdminBlogMedia.jsx — EDITORIAL ADMIN
// Media library for The Alveoly Journal.
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Plus, X, Trash2, Loader2, Copy, Check, Image as ImageIcon,
  Grid3x3, List, Upload, ExternalLink, AlertCircle, Filter,
  ArrowUpDown, Info, FolderOpen, Eye, EyeOff, Link2, FileImage,
  Calendar, HardDrive, Sparkles, CheckCircle, AlertTriangle,
} from "lucide-react";
import { toast } from "react-hot-toast";
// import blogAPI from "../../../api/blogApi"; // ← enable when backend ready
import {
  posts as mockPosts,
  podcasts as mockPodcasts,
  videos as mockVideos,
  authors as mockAuthors,
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
    : "";

const fileNameFromUrl = (url = "") => {
  try {
    const u = new URL(url);
    const last = u.pathname.split("/").filter(Boolean).pop() || "";
    return decodeURIComponent(last);
  } catch {
    return url.split("/").pop() || "image";
  }
};

/* ============================================================
   BUILD MOCK LIBRARY FROM EXISTING DATA
   Every image in the journal is pulled into a single catalog
   with a usage map so we can warn before deleting.
============================================================ */

const buildLibrary = () => {
  const catalog = new Map();

  const register = (url, source) => {
    if (!url || typeof url !== "string") return;
    if (!/^https?:\/\//i.test(url)) return;
    if (!catalog.has(url)) {
      catalog.set(url, {
        id: `img-${catalog.size + 1}-${Date.now()}`,
        url,
        fileName: fileNameFromUrl(url),
        size: null,
        width: null,
        height: null,
        uploadedAt: new Date(
          Date.now() - Math.random() * 90 * 86400 * 1000
        ).toISOString(),
        usages: [],
        tags: [],
      });
    }
    catalog.get(url).usages.push(source);
  };

  // Post covers
  mockPosts.forEach((p) => {
    if (p.image)
      register(p.image, {
        type: "post-cover",
        id: p.id,
        title: p.title,
        slug: p.slug,
      });
    // Gallery images
    (p.gallery || []).forEach((g) =>
      register(g, {
        type: "post-gallery",
        id: p.id,
        title: p.title,
        slug: p.slug,
      })
    );
  });

  // Podcast covers
  mockPodcasts.forEach((pod) => {
    if (pod.image)
      register(pod.image, {
        type: "podcast-cover",
        id: pod.id,
        title: pod.title,
      });
  });

  // Video thumbnails — derived from the youtubeId
  mockVideos.forEach((v) => {
    if (v.youtubeId) {
      const url = `https://img.youtube.com/vi/${v.youtubeId}/maxresdefault.jpg`;
      register(url, {
        type: "video-thumbnail",
        id: v.id,
        title: v.title,
      });
    }
  });

  // Author avatars
  mockAuthors.forEach((a) => {
    if (a.avatar)
      register(a.avatar, {
        type: "author-avatar",
        id: a.id,
        title: a.name,
      });
  });

  // Sort by most recent
  return [...catalog.values()].sort(
    (a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)
  );
};

/* ============================================================
   PRIMITIVES
============================================================ */

const Thumb = ({ url, alt, className = "" }) => {
  const [broken, setBroken] = useState(false);
  if (!url || broken) {
    return (
      <div
        className={`${className} bg-stone-100 dark:bg-stone-900 flex items-center justify-center`}
      >
        <ImageIcon className="w-6 h-6 text-stone-300 dark:text-stone-700" />
      </div>
    );
  }
  return (
    <img
      src={url}
      alt={alt || ""}
      onError={() => setBroken(true)}
      className={`${className} object-cover`}
    />
  );
};

const UsageBadge = ({ type }) => {
  const map = {
    "post-cover": {
      label: "Cover",
      tone:
        "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400",
    },
    "post-gallery": {
      label: "Gallery",
      tone:
        "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400",
    },
    "podcast-cover": {
      label: "Podcast",
      tone:
        "bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-400",
    },
    "video-thumbnail": {
      label: "Video",
      tone:
        "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400",
    },
    "author-avatar": {
      label: "Author",
      tone:
        "bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400",
    },
  };
  const s = map[type] || {
    label: type,
    tone:
      "bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-400",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-semibold ${s.tone}`}
    >
      {s.label}
    </span>
  );
};

/* ============================================================
   UPLOAD DROPZONE
============================================================ */

const UploadZone = ({ onUpload }) => {
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const inputRef = useRef(null);

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;
    setProcessing(true);
    const uploaded = [];
    for (const file of Array.from(files)) {
      // Simulate an upload — in production this posts to your storage
      await new Promise((r) => setTimeout(r, 300));
      const url = URL.createObjectURL(file);
      uploaded.push({
        id: `img-new-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}`,
        url,
        fileName: file.name,
        size: file.size,
        width: null,
        height: null,
        uploadedAt: new Date().toISOString(),
        usages: [],
        tags: [],
      });
    }
    onUpload(uploaded);
    setProcessing(false);
    toast.success(
      `${uploaded.length} ${uploaded.length === 1 ? "image" : "images"} uploaded`
    );
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={`relative rounded-2xl border-2 border-dashed transition overflow-hidden ${
        dragging
          ? "border-stone-900 dark:border-stone-100 bg-stone-50 dark:bg-stone-900"
          : "border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950"
      }`}
    >
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="w-full p-8 md:p-10 flex flex-col items-center text-center"
      >
        <div className="w-14 h-14 rounded-full bg-stone-100 dark:bg-stone-900 flex items-center justify-center mb-4">
          {processing ? (
            <Loader2 className="w-6 h-6 animate-spin text-stone-500" />
          ) : (
            <Upload className="w-5 h-5 text-stone-500" />
          )}
        </div>
        <p className="font-serif text-lg font-bold text-stone-900 dark:text-stone-50 mb-1">
          {processing ? "Uploading…" : "Drop images here"}
        </p>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          or click to choose files
        </p>
        <p className="text-xs text-stone-400 dark:text-stone-500 mt-3">
          JPG, PNG, WEBP, AVIF · up to 10 MB per file
        </p>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />
    </div>
  );
};

/* ============================================================
   DETAIL DRAWER
============================================================ */

const MediaDrawer = ({ asset, onClose, onDelete, usedCount }) => {
  const [copied, setCopied] = useState(false);

  const copyUrl = () => {
    navigator.clipboard.writeText(asset.url);
    setCopied(true);
    toast.success("URL copied");
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <AnimatePresence>
      {asset && (
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
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.2em] text-rose-600 dark:text-rose-400 font-semibold mb-1">
                  Media asset
                </p>
                <h2 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-50 truncate">
                  {asset.fileName}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full flex items-center justify-center text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-900 transition flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {/* Preview */}
              <div className="rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                <Thumb
                  url={asset.url}
                  alt={asset.fileName}
                  className="w-full aspect-video"
                />
              </div>

              {/* URL row */}
              <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                <p className="text-xs uppercase tracking-wider text-stone-500 dark:text-stone-400 font-semibold mb-2">
                  Image URL
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs font-mono text-stone-700 dark:text-stone-300 truncate">
                    {asset.url}
                  </code>
                  <button
                    onClick={copyUrl}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs font-medium hover:bg-stone-100 dark:hover:bg-stone-800 transition"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <a
                    href={asset.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Open in new tab
                  </a>
                </div>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800">
                  <p className="text-xs uppercase tracking-wider text-stone-500 dark:text-stone-400 font-semibold mb-2">
                    Uploaded
                  </p>
                  <p className="text-sm text-stone-900 dark:text-stone-100">
                    {formatShortDate(asset.uploadedAt)}
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800">
                  <p className="text-xs uppercase tracking-wider text-stone-500 dark:text-stone-400 font-semibold mb-2">
                    File name
                  </p>
                  <p className="text-sm text-stone-900 dark:text-stone-100 truncate">
                    {asset.fileName}
                  </p>
                </div>
              </div>

              {/* Usage */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs uppercase tracking-wider text-stone-500 dark:text-stone-400 font-semibold">
                    Used in
                  </p>
                  <span
                    className={`text-xs font-semibold ${
                      usedCount > 0
                        ? "text-stone-900 dark:text-stone-100"
                        : "text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {usedCount === 0
                      ? "Not in use"
                      : `${usedCount} ${
                          usedCount === 1 ? "place" : "places"
                        }`}
                  </span>
                </div>

                {asset.usages.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-stone-200 dark:border-stone-800 flex items-start gap-3">
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                      This image isn't referenced anywhere in the journal.
                      It's safe to remove.
                    </p>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {asset.usages.map((u, i) => (
                      <li
                        key={`${u.type}-${u.id}-${i}`}
                        className="flex items-start gap-3 p-3 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800"
                      >
                        <UsageBadge type={u.type} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-stone-900 dark:text-stone-100 truncate">
                            {u.title}
                          </p>
                          {u.slug && (
                            <a
                              href={`/blog/${u.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-stone-500 dark:text-stone-500 hover:text-rose-600 dark:hover:text-rose-400 transition font-mono truncate block"
                            >
                              /blog/{u.slug}
                            </a>
                          )}
                          {u.type === "post-cover" && (
                            <Link
                              to={`/admin/blog/edit/${u.id}`}
                              className="text-xs text-stone-500 dark:text-stone-500 hover:text-rose-600 dark:hover:text-rose-400 transition"
                            >
                              Open in editor →
                            </Link>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 px-6 py-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between gap-3">
              <p className="text-xs text-stone-500 dark:text-stone-500">
                {usedCount > 0
                  ? "In use — deleting may break stories."
                  : "Safe to delete."}
              </p>
              <button
                onClick={() => onDelete(asset)}
                disabled={usedCount > 0}
                title={
                  usedCount > 0
                    ? "Remove this image from stories first"
                    : "Delete asset"
                }
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-rose-600 text-white text-sm font-medium hover:bg-rose-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

/* ============================================================
   BULK DELETE CONFIRM
============================================================ */

const ConfirmBulkDelete = ({ open, count, inUseCount, onCancel, onConfirm, deleting }) => (
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
            Delete {count} {count === 1 ? "asset" : "assets"}?
          </h3>
          <p className="text-sm text-stone-600 dark:text-stone-400 mb-6 leading-relaxed">
            {inUseCount > 0 ? (
              <>
                <strong className="text-stone-900 dark:text-stone-100 font-semibold">
                  {inUseCount} {inUseCount === 1 ? "asset is" : "assets are"}
                </strong>{" "}
                currently referenced in the journal. Deleting them will leave
                broken images in those places. Deselect them or replace them
                first.
              </>
            ) : (
              <>
                None of these assets are in use. Deleting them is safe — they
                will simply disappear from the library.
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
              disabled={deleting || inUseCount > 0}
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

const AdminBlogMedia = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [usageFilter, setUsageFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [activeAsset, setActiveAsset] = useState(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  /* ---------- Load ---------- */
  useEffect(() => {
    setAssets(buildLibrary());
    setTimeout(() => setLoading(false), 300);
  }, []);

  /* ---------- Derived ---------- */
  const stats = useMemo(() => {
    const inUse = assets.filter((a) => a.usages.length > 0).length;
    return {
      total: assets.length,
      inUse,
      unused: assets.length - inUse,
      featuredCovers: assets.filter((a) =>
        a.usages.some((u) => u.type === "post-cover")
      ).length,
    };
  }, [assets]);

  const filtered = useMemo(() => {
    let list = [...assets];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.fileName.toLowerCase().includes(q) ||
          a.url.toLowerCase().includes(q) ||
          a.usages.some((u) =>
            (u.title || "").toLowerCase().includes(q)
          )
      );
    }
    if (usageFilter === "in-use") list = list.filter((a) => a.usages.length > 0);
    if (usageFilter === "unused") list = list.filter((a) => a.usages.length === 0);
    if (usageFilter === "post-cover")
      list = list.filter((a) =>
        a.usages.some((u) => u.type === "post-cover")
      );

    list.sort((a, b) => {
      if (sortBy === "newest")
        return new Date(b.uploadedAt) - new Date(a.uploadedAt);
      if (sortBy === "oldest")
        return new Date(a.uploadedAt) - new Date(b.uploadedAt);
      if (sortBy === "usage")
        return b.usages.length - a.usages.length;
      if (sortBy === "name")
        return a.fileName.localeCompare(b.fileName);
      return 0;
    });
    return list;
  }, [assets, search, usageFilter, sortBy]);

  /* ---------- Handlers ---------- */
  const handleUpload = (uploaded) => {
    setAssets((prev) => [...uploaded, ...prev]);
  };

  const copyUrl = (url) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copied");
  };

  const deleteOne = async (asset) => {
    if (asset.usages.length > 0) {
      toast.error("This asset is in use — remove it from stories first");
      return;
    }
    setDeleting(true);
    await new Promise((r) => setTimeout(r, 400));
    setAssets((prev) => prev.filter((a) => a.id !== asset.id));
    setActiveAsset(null);
    setDeleting(false);
    toast.success("Asset deleted");
  };

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
    else setSelectedIds(new Set(filtered.map((a) => a.id)));
  };

  const clearSelection = () => setSelectedIds(new Set());

  const selectedAssets = useMemo(
    () => assets.filter((a) => selectedIds.has(a.id)),
    [assets, selectedIds]
  );

  const inUseSelected = useMemo(
    () => selectedAssets.filter((a) => a.usages.length > 0).length,
    [selectedAssets]
  );

  const confirmBulkDelete = async () => {
    setDeleting(true);
    await new Promise((r) => setTimeout(r, 400));
    setAssets((prev) => prev.filter((a) => !selectedIds.has(a.id)));
    toast.success(
      `${selectedIds.size} ${selectedIds.size === 1 ? "asset" : "assets"} deleted`
    );
    setDeleting(false);
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
            Media library
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-2 max-w-2xl">
            Every image used in the journal — story covers, gallery shots,
            podcast covers, video thumbnails, and contributor avatars — in one
            place, with usage tracking.
          </p>
        </div>
      </div>

      {/* ---------- STATS ---------- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total assets", value: stats.total },
          { label: "In use", value: stats.inUse },
          { label: "Unused", value: stats.unused },
          { label: "Story covers", value: stats.featuredCovers },
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

      {/* ---------- UPLOAD ---------- */}
      <UploadZone onUpload={handleUpload} />

      {/* ---------- TOOLBAR ---------- */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3 p-3 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950">
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by file name, URL, or the story it's used in…"
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-transparent text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={usageFilter}
            onChange={(e) => setUsageFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-transparent border border-stone-200 dark:border-stone-800 text-sm text-stone-700 dark:text-stone-300 focus:outline-none cursor-pointer"
          >
            <option value="all">All assets</option>
            <option value="in-use">In use</option>
            <option value="unused">Unused</option>
            <option value="post-cover">Story covers</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-lg bg-transparent border border-stone-200 dark:border-stone-800 text-sm text-stone-700 dark:text-stone-300 focus:outline-none cursor-pointer"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="usage">Most used</option>
            <option value="name">Sort: A–Z</option>
          </select>

          {/* View toggle */}
          <div className="flex items-center gap-1 border border-stone-200 dark:border-stone-800 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("grid")}
              className={`w-8 h-8 rounded-md flex items-center justify-center transition ${
                viewMode === "grid"
                  ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900"
                  : "text-stone-500 hover:text-stone-900 dark:hover:text-stone-100"
              }`}
              title="Grid view"
            >
              <Grid3x3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`w-8 h-8 rounded-md flex items-center justify-center transition ${
                viewMode === "list"
                  ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900"
                  : "text-stone-500 hover:text-stone-900 dark:hover:text-stone-100"
              }`}
              title="List view"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ---------- SELECT-ALL + COUNT ---------- */}
      {!loading && filtered.length > 0 && (
        <div className="flex items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={
                filtered.length > 0 && selectedIds.size === filtered.length
              }
              onChange={selectAll}
              className="w-4 h-4 rounded border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:ring-0"
            />
            <span className="text-xs uppercase tracking-widest text-stone-500 dark:text-stone-400 font-semibold">
              {filtered.length}{" "}
              {filtered.length === 1 ? "asset" : "assets"}
              {usageFilter !== "all" && ` · ${usageFilter}`}
            </span>
          </div>
          {selectedIds.size > 0 && (
            <button
              onClick={clearSelection}
              className="text-xs text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition"
            >
              Clear selection
            </button>
          )}
        </div>
      )}

      {/* ---------- LIST / GRID ---------- */}
      {loading ? (
        <div className="py-20 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-stone-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center max-w-md mx-auto">
          <p className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100 mb-3">
            {assets.length === 0 ? "Library is empty" : "No assets match"}
          </p>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            {assets.length === 0
              ? "Upload the first image or paste a URL to start populating the library."
              : "Try a different search or usage filter."}
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filtered.map((asset, i) => {
            const isSelected = selectedIds.has(asset.id);
            const used = asset.usages.length > 0;
            return (
              <motion.div
                key={asset.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.015, 0.25) }}
                className={`group relative rounded-xl border overflow-hidden bg-white dark:bg-stone-950 transition ${
                  isSelected
                    ? "border-stone-900 dark:border-stone-100 ring-2 ring-stone-900/10 dark:ring-stone-100/10"
                    : "border-stone-200 dark:border-stone-800"
                }`}
              >
                {/* Checkbox */}
                <div
                  className="absolute top-2 left-2 z-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(asset.id)}
                    className="w-4 h-4 rounded border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:ring-0 bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm"
                  />
                </div>

                {/* Usage indicator */}
                <div className="absolute top-2 right-2 z-10">
                  {used ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/90 backdrop-blur-sm text-white text-[10px] font-semibold">
                      <CheckCircle className="w-2.5 h-2.5" />
                      {asset.usages.length}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/90 backdrop-blur-sm text-white text-[10px] font-semibold">
                      <AlertTriangle className="w-2.5 h-2.5" />
                      Unused
                    </span>
                  )}
                </div>

                {/* Thumbnail */}
                <button
                  onClick={() => setActiveAsset(asset)}
                  className="block w-full aspect-square bg-stone-100 dark:bg-stone-900"
                >
                  <Thumb
                    url={asset.url}
                    alt={asset.fileName}
                    className="w-full h-full group-hover:scale-[1.03] transition duration-500"
                  />
                </button>

                {/* Meta strip */}
                <div className="p-2.5 border-t border-stone-100 dark:border-stone-900">
                  <p className="text-[11px] text-stone-700 dark:text-stone-300 truncate font-medium">
                    {asset.fileName}
                  </p>
                  <div className="flex items-center justify-between gap-2 mt-1">
                    <p className="text-[10px] text-stone-400 dark:text-stone-600 truncate">
                      {formatShortDate(asset.uploadedAt)}
                    </p>
                    <button
                      onClick={() => copyUrl(asset.url)}
                      className="w-6 h-6 rounded flex items-center justify-center text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition"
                      title="Copy URL"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 overflow-hidden">
          {/* Header row */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 bg-stone-50 dark:bg-stone-900/50 border-b border-stone-200 dark:border-stone-800 text-[10px] uppercase tracking-widest text-stone-500 dark:text-stone-400 font-semibold">
            <div className="col-span-1" />
            <div className="col-span-5">File</div>
            <div className="col-span-3">Used in</div>
            <div className="col-span-2">Uploaded</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>

          {filtered.map((asset, i) => {
            const isSelected = selectedIds.has(asset.id);
            const used = asset.usages.length > 0;
            return (
              <motion.div
                key={asset.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: Math.min(i * 0.01, 0.2) }}
                className={`grid grid-cols-1 md:grid-cols-12 gap-4 px-5 py-3 items-center group hover:bg-stone-50/60 dark:hover:bg-stone-900/30 transition ${
                  i > 0
                    ? "border-t border-stone-100 dark:border-stone-900"
                    : ""
                } ${isSelected ? "bg-stone-50 dark:bg-stone-900/50" : ""}`}
              >
                {/* Checkbox */}
                <div className="md:col-span-1">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(asset.id)}
                    className="w-4 h-4 rounded border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:ring-0"
                  />
                </div>

                {/* File */}
                <div className="md:col-span-5 flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => setActiveAsset(asset)}
                    className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-stone-100 dark:bg-stone-900"
                  >
                    <Thumb
                      url={asset.url}
                      alt={asset.fileName}
                      className="w-full h-full"
                    />
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
                      {asset.fileName}
                    </p>
                    <p className="text-xs text-stone-500 dark:text-stone-500 truncate font-mono">
                      {asset.url}
                    </p>
                  </div>
                </div>

                {/* Usage */}
                <div className="md:col-span-3 min-w-0">
                  {used ? (
                    <div className="flex items-center flex-wrap gap-1.5">
                      {asset.usages.slice(0, 2).map((u, idx) => (
                        <UsageBadge key={idx} type={u.type} />
                      ))}
                      {asset.usages.length > 2 && (
                        <span className="text-xs text-stone-500 dark:text-stone-500">
                          +{asset.usages.length - 2}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/30 text-[10px] uppercase tracking-wider text-amber-700 dark:text-amber-400 font-semibold">
                      <AlertTriangle className="w-2.5 h-2.5" />
                      Unused
                    </span>
                  )}
                </div>

                {/* Date */}
                <div className="md:col-span-2 text-xs text-stone-500 dark:text-stone-500">
                  {formatShortDate(asset.uploadedAt)}
                </div>

                {/* Actions */}
                <div className="md:col-span-1 flex items-center md:justify-end gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition">
                  <button
                    onClick={() => copyUrl(asset.url)}
                    title="Copy URL"
                    className="w-8 h-8 rounded-full flex items-center justify-center text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-900 transition"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setActiveAsset(asset)}
                    title="View details"
                    className="w-8 h-8 rounded-full flex items-center justify-center text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-900 transition"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
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
              {inUseSelected > 0 && (
                <span className="text-amber-400 ml-2">
                  · {inUseSelected} in use
                </span>
              )}
            </span>
            <div className="h-5 w-px bg-white/20 dark:bg-stone-900/20" />
            <button
              onClick={() => setBulkDeleteOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium hover:bg-rose-500/20 text-rose-200 dark:text-rose-700 transition"
            >
              <Trash2 className="w-3 h-3" />
              Delete
            </button>
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

      {/* ---------- DETAIL DRAWER ---------- */}
      <MediaDrawer
        asset={activeAsset}
        onClose={() => setActiveAsset(null)}
        onDelete={deleteOne}
        usedCount={activeAsset ? activeAsset.usages.length : 0}
      />

      {/* ---------- BULK DELETE ---------- */}
      <ConfirmBulkDelete
        open={bulkDeleteOpen}
        count={selectedIds.size}
        inUseCount={inUseSelected}
        onCancel={() => setBulkDeleteOpen(false)}
        onConfirm={confirmBulkDelete}
        deleting={deleting}
      />
    </div>
  );
};

export default AdminBlogMedia;