// src/pages/admin/blog/AdminBlogPodcasts.jsx — EDITORIAL ADMIN
// Podcast episode management for The Alveoly Journal.
import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Plus, X, Edit3, Trash2, Loader2, Save, AlertCircle,
  Mic, Play, Pause, Headphones, Clock, Calendar, Users,
  ExternalLink, Star, Heart, Hash, Copy, ChevronDown,
  Volume2, VolumeX, RotateCw, Check,
} from "lucide-react";
import { toast } from "react-hot-toast";
// import blogAPI from "../../../api/blogApi"; // ← enable when backend ready
import {
  podcasts as mockPodcasts,
  authors as mockAuthors,
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

const formatShortDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

/* Turn "42:15" into seconds so we can compare and sort. */
const durationToSeconds = (str = "") => {
  const parts = String(str).split(":").map((x) => parseInt(x, 10));
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
};

const emptyEpisode = () => ({
  id: "",
  episodeNumber: "",
  title: "",
  description: "",
  audioUrl: "",
  duration: "",
  image: "",
  guests: [],
  publishedAt: new Date().toISOString().slice(0, 10),
  featured: false,
  status: "draft", // draft | published | archived
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

/* Small list-input for guest names */
const ListInput = ({ values, onChange, placeholder }) => {
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim();
    if (!v || values.includes(v)) return;
    onChange([...values, v]);
    setDraft("");
  };
  const remove = (i) => onChange(values.filter((_, idx) => idx !== i));

  return (
    <div>
      <div className="flex items-center gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          className="flex-1 px-3.5 py-2.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 transition"
        />
        <button
          type="button"
          onClick={add}
          className="px-3.5 py-2.5 rounded-lg bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-sm font-medium hover:opacity-90 transition"
        >
          Add
        </button>
      </div>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
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
      )}
    </div>
  );
};

/* ============================================================
   INLINE AUDIO PLAYER (used on cards + drawer)
============================================================ */

const AudioPlayer = ({ src, compact = false }) => {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [muted, setMuted] = useState(false);

  const toggle = (e) => {
    e?.stopPropagation();
    if (!audioRef.current) return;
    if (playing) audioRef.current.pause();
    else audioRef.current.play();
  };

  const onTime = () => {
    const a = audioRef.current;
    if (!a || !a.duration) return;
    setProgress((a.currentTime / a.duration) * 100);
  };

  const toggleMute = (e) => {
    e?.stopPropagation();
    if (!audioRef.current) return;
    audioRef.current.muted = !muted;
    setMuted(!muted);
  };

  const formatTime = (sec) => {
    if (!sec || isNaN(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  if (!src) {
    return (
      <div
        className={`flex items-center gap-3 text-xs text-stone-500 dark:text-stone-500 ${
          compact ? "" : "py-3"
        }`}
      >
        <div className="w-9 h-9 rounded-full bg-stone-100 dark:bg-stone-900 flex items-center justify-center flex-shrink-0">
          <VolumeX className="w-3.5 h-3.5" />
        </div>
        <span>No audio yet</span>
      </div>
    );
  }

  const btnCls = compact
    ? "w-9 h-9 rounded-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 flex items-center justify-center flex-shrink-0 hover:opacity-90 transition"
    : "w-11 h-11 rounded-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 flex items-center justify-center flex-shrink-0 hover:opacity-90 transition";

  return (
    <div
      className="flex items-center gap-3"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={toggle}
        className={btnCls}
        title={playing ? "Pause" : "Play"}
      >
        {playing ? (
          <Pause className={compact ? "w-3.5 h-3.5" : "w-4 h-4"} />
        ) : (
          <Play
            className={`${compact ? "w-3.5 h-3.5" : "w-4 h-4"} ml-0.5`}
          />
        )}
      </button>
      <div className="flex-1 min-w-0">
        <div className="h-1.5 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full transition-[width] duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-1.5 text-[10px] text-stone-500 dark:text-stone-500">
          <span>{formatTime(audioRef.current?.currentTime || 0)}</span>
          <button
            type="button"
            onClick={toggleMute}
            className="hover:text-stone-900 dark:hover:text-stone-100 transition"
          >
            {muted ? (
              <VolumeX className="w-3 h-3" />
            ) : (
              <Volume2 className="w-3 h-3" />
            )}
          </button>
        </div>
      </div>
      <audio
        ref={audioRef}
        src={src}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={onTime}
        onEnded={() => {
          setPlaying(false);
          setProgress(0);
        }}
        className="hidden"
      />
    </div>
  );
};

/* ============================================================
   STATUS BADGE
============================================================ */

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
   DRAWER
============================================================ */

const EpisodeDrawer = ({ open, onClose, initial, onSave, saving, existingNumbers }) => {
  const [form, setForm] = useState(emptyEpisode());
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...emptyEpisode(), ...initial } : emptyEpisode());
      setErrors({});
    }
  }, [open, initial]);

  const update = (path, value) =>
    setForm((prev) => ({ ...prev, [path]: value }));

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.episodeNumber) e.episodeNumber = "Episode number is required";
    if (!form.audioUrl.trim()) e.audioUrl = "Audio URL is required";
    if (!form.duration.trim()) e.duration = "Duration is required";
    if (
      form.episodeNumber &&
      existingNumbers.includes(Number(form.episodeNumber)) &&
      Number(form.episodeNumber) !== Number(initial?.episodeNumber)
    ) {
      e.episodeNumber = "That episode number is already used";
    }
    if (form.audioUrl && !/^https?:\/\//i.test(form.audioUrl)) {
      e.audioUrl = "Must be a valid http:// or https:// URL";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    onSave({
      ...form,
      id: form.id || `ep-${Date.now()}`,
      episodeNumber: Number(form.episodeNumber),
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
                  {initial?.id ? "Edit episode" : "New episode"}
                </p>
                <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-50">
                  {initial?.id
                    ? `Episode ${form.episodeNumber || "—"}`
                    : "Add an episode"}
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
              {/* Cover preview */}
              <div className="flex items-start gap-4 p-4 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-stone-100 dark:bg-stone-800 flex-shrink-0 flex items-center justify-center">
                  {form.image ? (
                    <img
                      src={form.image}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Mic className="w-8 h-8 text-stone-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs uppercase tracking-wider text-stone-500 dark:text-stone-400 font-semibold mb-1">
                    Preview
                  </p>
                  <p className="font-serif text-base font-bold text-stone-900 dark:text-stone-50 leading-snug line-clamp-2 mb-1">
                    {form.title || "Episode title"}
                  </p>
                  <p className="text-xs text-stone-500">
                    Ep. {form.episodeNumber || "—"} ·{" "}
                    {form.duration || "0:00"}
                    {form.guests?.length > 0 &&
                      ` · ${form.guests.join(", ")}`}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field
                  label="Episode number"
                  required
                  error={errors.episodeNumber}
                >
                  <TextInput
                    type="number"
                    value={form.episodeNumber}
                    onChange={(e) =>
                      update("episodeNumber", e.target.value)
                    }
                    placeholder="12"
                  />
                </Field>
                <Field
                  label="Duration"
                  required
                  error={errors.duration}
                  hint="MM:SS or HH:MM:SS"
                >
                  <TextInput
                    value={form.duration}
                    onChange={(e) => update("duration", e.target.value)}
                    placeholder="42:15"
                  />
                </Field>
                <Field
                  label="Published"
                  hint="Date the episode goes live."
                >
                  <TextInput
                    type="date"
                    value={(form.publishedAt || "").slice(0, 10)}
                    onChange={(e) => update("publishedAt", e.target.value)}
                  />
                </Field>
              </div>

              <Field label="Title" required error={errors.title}>
                <TextInput
                  value={form.title}
                  onChange={(e) => update("title", e.target.value)}
                  placeholder="The Heart of the Matter: Understanding Blood Pressure"
                />
              </Field>

              <Field
                label="Description"
                hint="Shown on the podcast page and in podcast apps."
              >
                <TextArea
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  rows={4}
                  placeholder="Dr. James Mensah joins us to break down what blood pressure really means, why hypertension is so dangerous, and what listeners can do today."
                />
              </Field>

              <Field
                label="Cover art URL"
                hint="Square image, 1400×1400 or larger recommended."
              >
                <TextInput
                  value={form.image}
                  onChange={(e) => update("image", e.target.value)}
                  placeholder="https://…"
                />
              </Field>

              <Field
                label="Audio URL"
                required
                error={errors.audioUrl}
                hint="MP3 or M4A. RSS feed readers will use this directly."
              >
                <TextInput
                  value={form.audioUrl}
                  onChange={(e) => update("audioUrl", e.target.value)}
                  placeholder="https://…mp3"
                />
                {form.audioUrl && (
                  <div className="mt-3 p-3 rounded-lg bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                    <p className="text-xs uppercase tracking-wider text-stone-500 dark:text-stone-400 font-semibold mb-2">
                      Audio preview
                    </p>
                    <AudioPlayer src={form.audioUrl} compact />
                  </div>
                )}
              </Field>

              <Field
                label="Guests"
                hint="Press Enter after each name."
              >
                <ListInput
                  values={form.guests}
                  onChange={(v) => update("guests", v)}
                  placeholder="Dr. James Mensah"
                />
              </Field>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <label className="flex items-center gap-3 pt-6">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => update("featured", e.target.checked)}
                    className="w-4 h-4 rounded border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:ring-0"
                  />
                  <span className="text-sm text-stone-700 dark:text-stone-300">
                    Feature on the podcast page
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
                    {initial?.id ? "Save changes" : "Create episode"}
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

const ConfirmDelete = ({ open, episode, onCancel, onConfirm, deleting }) => (
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
            Delete Episode {episode?.episodeNumber}?
          </h3>
          <p className="text-sm text-stone-600 dark:text-stone-400 mb-6 leading-relaxed">
            This removes <strong>"{episode?.title}"</strong> from the podcast
            page and from the RSS feed. Subscribers won't see it anymore.
            This cannot be undone.
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
                  Delete episode
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

const AdminBlogPodcasts = () => {
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  /* ---------- Load ---------- */
  useEffect(() => {
    // Replace with blogAPI.getPodcasts()
    setEpisodes(
      mockPodcasts.map((p) => ({
        ...p,
        status: p.status || "published",
        featured: !!p.featured,
      }))
    );
    setTimeout(() => setLoading(false), 300);
  }, []);

  /* ---------- Derived ---------- */
  const existingNumbers = useMemo(
    () => episodes.map((e) => Number(e.episodeNumber)).filter(Boolean),
    [episodes]
  );

  const stats = useMemo(() => {
    const totalSeconds = episodes.reduce(
      (sum, e) => sum + durationToSeconds(e.duration),
      0
    );
    const totalMinutes = Math.round(totalSeconds / 60);
    const guests = new Set();
    episodes.forEach((e) =>
      (e.guests || []).forEach((g) => guests.add(g))
    );
    return {
      count: episodes.length,
      published: episodes.filter((e) => e.status === "published").length,
      totalMinutes,
      guests: guests.size,
      latestNumber: Math.max(
        0,
        ...episodes.map((e) => Number(e.episodeNumber) || 0)
      ),
    };
  }, [episodes]);

  const filtered = useMemo(() => {
    let list = [...episodes];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          (e.description || "").toLowerCase().includes(q) ||
          (e.guests || []).some((g) => g.toLowerCase().includes(q))
      );
    }
    if (statusFilter !== "all") {
      list = list.filter((e) => e.status === statusFilter);
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
      if (sortBy === "number")
        return Number(b.episodeNumber) - Number(a.episodeNumber);
      return 0;
    });
    return list;
  }, [episodes, search, statusFilter, sortBy]);

  /* ---------- Handlers ---------- */
  const openCreate = () => {
    setEditing(null);
    setDrawerOpen(true);
  };

  const openEdit = (ep) => {
    setEditing(ep);
    setDrawerOpen(true);
  };

  const handleSave = async (payload) => {
    setSaving(true);
    // Replace with blogAPI.createPodcast / updatePodcast
    await new Promise((r) => setTimeout(r, 400));
    setEpisodes((prev) => {
      const exists = prev.find((e) => e.id === payload.id);
      if (exists) return prev.map((e) => (e.id === payload.id ? payload : e));
      return [payload, ...prev];
    });
    toast.success(editing?.id ? "Episode updated" : "Episode created");
    setSaving(false);
    setDrawerOpen(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    await new Promise((r) => setTimeout(r, 400));
    setEpisodes((prev) => prev.filter((e) => e.id !== deleteTarget.id));
    toast.success("Episode deleted");
    setDeleting(false);
    setDeleteTarget(null);
  };

  const toggleFeatured = (ep) => {
    setEpisodes((prev) =>
      prev.map((e) =>
        e.id === ep.id ? { ...e, featured: !e.featured } : e
      )
    );
    toast.success(
      `Episode ${ep.episodeNumber} ${
        ep.featured ? "unfeatured" : "featured"
      }`
    );
  };

  const toggleStatus = (ep) => {
    const next = ep.status === "published" ? "draft" : "published";
    setEpisodes((prev) =>
      prev.map((e) => (e.id === ep.id ? { ...e, status: next } : e))
    );
    toast.success(next === "published" ? "Published" : "Moved to draft");
  };

  const duplicate = (ep) => {
    const copy = {
      ...ep,
      id: `ep-copy-${Date.now()}`,
      episodeNumber: stats.latestNumber + 1,
      title: `${ep.title} (copy)`,
      status: "draft",
      publishedAt: new Date().toISOString().slice(0, 10),
    };
    setEpisodes((prev) => [copy, ...prev]);
    toast.success("Duplicated as draft");
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
            Podcasts
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-2 max-w-2xl">
            Every episode of The Alveoly Podcast. Published episodes appear at{" "}
            <span className="font-mono text-xs bg-stone-100 dark:bg-stone-900 px-1.5 py-0.5 rounded">
              /blog/podcasts
            </span>{" "}
            and in the RSS feed.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-sm font-medium hover:opacity-90 transition self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          New episode
        </button>
      </div>

      {/* ---------- STATS ---------- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Episodes", value: stats.count },
          { label: "Published", value: stats.published },
          { label: "Total runtime", value: `${stats.totalMinutes} min` },
          { label: "Guests featured", value: stats.guests },
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
            placeholder="Search by title, guest, or description…"
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
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
            <option value="archived">Archived</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-lg bg-transparent border border-stone-200 dark:border-stone-800 text-sm text-stone-700 dark:text-stone-300 focus:outline-none cursor-pointer"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="number">Episode number</option>
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
            {episodes.length === 0
              ? "No episodes yet"
              : "No episodes match"}
          </p>
          <p className="text-sm text-stone-500 dark:text-stone-400 mb-6">
            {episodes.length === 0
              ? "Publish the first episode to start the feed."
              : "Try a different search or status filter."}
          </p>
          {episodes.length === 0 && (
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-sm font-medium hover:opacity-90 transition"
            >
              <Plus className="w-4 h-4" />
              Add first episode
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((ep, i) => (
            <motion.article
              key={ep.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.3) }}
              className="group rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 overflow-hidden flex flex-col"
            >
              {/* Cover */}
              <div className="relative aspect-square bg-stone-100 dark:bg-stone-900">
                {ep.image ? (
                  <img
                    src={ep.image}
                    alt={ep.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Mic className="w-12 h-12 text-stone-300 dark:text-stone-700" />
                  </div>
                )}

                {/* Episode number */}
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 dark:bg-stone-950/90 backdrop-blur-sm text-[10px] uppercase tracking-wider text-stone-700 dark:text-stone-300 font-semibold">
                  Ep. {ep.episodeNumber}
                </div>

                {/* Featured */}
                {ep.featured && (
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-amber-500/90 backdrop-blur-sm text-white text-[10px] uppercase tracking-wider font-semibold flex items-center gap-1">
                    <Star className="w-2.5 h-2.5" />
                    Featured
                  </div>
                )}

                {/* Status badge bottom-left */}
                <div className="absolute bottom-3 left-3">
                  <StatusBadge status={ep.status} />
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 p-5 flex flex-col">
                <h3 className="font-serif text-lg font-bold leading-snug text-stone-900 dark:text-stone-50 mb-2 line-clamp-2">
                  {ep.title}
                </h3>

                {ep.guests?.length > 0 && (
                  <p className="text-xs text-stone-500 dark:text-stone-500 mb-2 line-clamp-1">
                    With{" "}
                    <span className="text-stone-700 dark:text-stone-300 font-medium">
                      {ep.guests.join(", ")}
                    </span>
                  </p>
                )}

                {ep.description && (
                  <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed line-clamp-2 mb-4">
                    {ep.description}
                  </p>
                )}

                <div className="mt-auto">
                  {/* Inline audio preview */}
                  <div className="mb-4 pb-4 border-b border-stone-100 dark:border-stone-900">
                    <AudioPlayer src={ep.audioUrl} compact />
                  </div>

                  {/* Meta + actions */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 text-xs text-stone-500 dark:text-stone-500">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        {ep.duration}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" />
                        {formatShortDate(ep.publishedAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleFeatured(ep)}
                        title={
                          ep.featured ? "Unfeature" : "Feature on the page"
                        }
                        className="w-8 h-8 rounded-full flex items-center justify-center text-stone-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition"
                      >
                        <Star className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => toggleStatus(ep)}
                        title={
                          ep.status === "published"
                            ? "Move to draft"
                            : "Publish"
                        }
                        className="w-8 h-8 rounded-full flex items-center justify-center text-stone-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <a
                        href={ep.audioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Open audio in new tab"
                        className="w-8 h-8 rounded-full flex items-center justify-center text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-900 transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => openEdit(ep)}
                        title="Edit"
                        className="w-8 h-8 rounded-full flex items-center justify-center text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-900 transition"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(ep)}
                        title="Delete"
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

      {/* ---------- FOOTER HINT ---------- */}
      {!loading && filtered.length > 0 && (
        <p className="text-xs text-stone-500 dark:text-stone-500 text-center">
          {filtered.length}{" "}
          {filtered.length === 1 ? "episode" : "episodes"} shown
          {statusFilter !== "all" &&
            ` · filtered by ${statusFilter}`}
        </p>
      )}

      {/* ---------- DRAWER ---------- */}
      <EpisodeDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        initial={editing}
        onSave={handleSave}
        saving={saving}
        existingNumbers={existingNumbers}
      />

      {/* ---------- DELETE ---------- */}
      <ConfirmDelete
        open={!!deleteTarget}
        episode={deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        deleting={deleting}
      />
    </div>
  );
};

export default AdminBlogPodcasts;