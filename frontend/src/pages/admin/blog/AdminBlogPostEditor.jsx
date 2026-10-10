// src/pages/admin/blog/AdminBlogPostEditor.jsx — EDITORIAL ADMIN
// Create / edit a story for The Alveoly Journal.
// Used by both /admin/blog/create and /admin/blog/edit/:id
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Save, Eye, Send, X, Plus, Trash2, Image as ImageIcon,
  Loader2, AlertCircle, CheckCircle, Star, Sparkles, Shield,
  Bold, Italic, Underline, Heading1, Heading2, List, Quote,
  Link as LinkIcon, Code, Minus, AlignLeft, AlignCenter, AlignRight,
  Video, Mic, BookOpen, BarChart3, Users, ChevronDown, Search,
  FileText, Calendar, Clock, Hash, ExternalLink, RotateCw,
} from "lucide-react";
import { toast } from "react-hot-toast";
// import blogAPI from "../../../api/blogApi"; // ← enable when backend ready
import {
  posts as mockPosts,
  authors as mockAuthors,
  categories as mockCategories,
  tags as mockTags,
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

const calculateReadingTime = (html = "") => {
  const text = html.replace(/<[^>]*>/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
};

const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

const emptyPost = () => ({
  id: "",
  slug: "",
  title: "",
  subtitle: "",
  excerpt: "",
  content: "",
  image: "",
  gallery: [],
  categoryId: "",
  tags: [],
  authorId: "",
  reviewedBy: "",
  references: [],
  learningObjectives: [],
  statistics: [],
  relatedPosts: [],
  videoUrl: "",
  audioUrl: "",
  metaDescription: "",
  metaKeywords: "",
  status: "draft",
  featured: false,
  editorsPick: false,
  medicallyReviewed: false,
  publishedAt: new Date().toISOString(),
  readingTime: 5,
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

const TextArea = ({ value, onChange, placeholder, rows = 3, ...rest }) => (
  <textarea
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    rows={rows}
    {...rest}
    className="w-full px-3.5 py-2.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 transition resize-none"
  />
);

const Avatar = ({ author, size = "sm" }) => {
  const [broken, setBroken] = useState(false);
  const cls = size === "sm" ? "w-7 h-7 text-[10px]" : "w-9 h-9 text-xs";
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

/* ============================================================
   TAG PICKER
============================================================ */

const TagPicker = ({ selected, onChange, allTags }) => {
  const [draft, setDraft] = useState("");

  const add = (val) => {
    const v = val.trim();
    if (!v) return;
    if (selected.includes(v)) return;
    onChange([...selected, v]);
    setDraft("");
  };

  const remove = (val) => onChange(selected.filter((t) => t !== val));

  const suggestions = draft
    ? allTags
        .filter(
          (t) =>
            t.toLowerCase().includes(draft.toLowerCase()) &&
            !selected.includes(t)
        )
        .slice(0, 6)
    : allTags.filter((t) => !selected.includes(t)).slice(0, 8);

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {selected.map((t) => (
          <span
            key={t}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white dark:bg-stone-900 text-xs text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800"
          >
            #{t}
            <button
              type="button"
              onClick={() => remove(t)}
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
            if (e.key === "Backspace" && !draft && selected.length > 0) {
              remove(selected[selected.length - 1]);
            }
          }}
          placeholder="Add a tag and press Enter"
          className="w-full px-3.5 py-2.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 transition"
        />
      </div>

      {suggestions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="text-xs text-stone-400 dark:text-stone-500 mr-1">
            Suggestions:
          </span>
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              className="text-xs px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800 transition"
            >
              #{s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ============================================================
   LIST INPUT — for references, objectives, statistics
============================================================ */

const ListInput = ({ values, onChange, placeholder, addLabel = "Add" }) => {
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim();
    if (!v) return;
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
          {addLabel}
        </button>
      </div>
      {values.length > 0 && (
        <ul className="mt-3 space-y-2">
          {values.map((v, i) => (
            <li
              key={i}
              className="flex items-start gap-3 px-3 py-2.5 rounded-lg bg-stone-50 dark:bg-stone-900/50 border border-stone-100 dark:border-stone-900"
            >
              <span className="text-xs font-mono text-stone-400 dark:text-stone-600 mt-0.5 flex-shrink-0">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="flex-1 text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
                {v}
              </span>
              <button
                type="button"
                onClick={() => remove(i)}
                className="text-stone-400 hover:text-rose-600 transition flex-shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

/* ============================================================
   STATISTICS INPUT — { value, label }
============================================================ */

const StatisticsInput = ({ values, onChange }) => {
  const [value, setValue] = useState("");
  const [label, setLabel] = useState("");
  const add = () => {
    if (!value.trim() || !label.trim()) return;
    onChange([...values, { value: value.trim(), label: label.trim() }]);
    setValue("");
    setLabel("");
  };
  const remove = (i) => onChange(values.filter((_, idx) => idx !== i));
  return (
    <div>
      <div className="flex items-center gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="40%"
          className="w-24 px-3 py-2.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-sm focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 transition"
        />
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Reduction in hospital admissions"
          className="flex-1 px-3.5 py-2.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-sm focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 transition"
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
        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
          {values.map((s, i) => (
            <div
              key={i}
              className="relative p-4 rounded-xl bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 text-center"
            >
              <p className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-50">
                {s.value}
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-500 mt-1 leading-snug">
                {s.label}
              </p>
              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute top-2 right-2 text-stone-400 hover:text-rose-600 transition"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ============================================================
   CONTENT EDITOR
============================================================ */

const ContentEditor = ({ value, onChange }) => {
  const ref = useRef(null);

  const insert = (before, after = "") => {
    const ta = ref.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = value.substring(start, end);
    const next = before + selected + after;
    const newValue =
      value.substring(0, start) + next + value.substring(end);
    onChange(newValue);
    setTimeout(() => {
      ta.focus();
      const cursor = start + before.length + selected.length;
      ta.setSelectionRange(cursor, cursor);
    }, 0);
  };

  const toolbar = [
    { icon: Bold, action: () => insert("<strong>", "</strong>"), label: "Bold" },
    { icon: Italic, action: () => insert("<em>", "</em>"), label: "Italic" },
    { icon: Underline, action: () => insert("<u>", "</u>"), label: "Underline" },
    { divider: true },
    { icon: Heading1, action: () => insert("<h1>", "</h1>"), label: "Heading 1" },
    { icon: Heading2, action: () => insert("<h2>", "</h2>"), label: "Heading 2" },
    { icon: List, action: () => insert("<ul>\n  <li>", "</li>\n</ul>"), label: "List" },
    { divider: true },
    {
      icon: Quote,
      action: () => insert("<blockquote>\n  ", "\n</blockquote>"),
      label: "Quote",
    },
    {
      icon: LinkIcon,
      action: () => {
        const url = window.prompt("Enter URL");
        if (url) insert(`<a href="${url}">`, "</a>");
      },
      label: "Link",
    },
    {
      icon: ImageIcon,
      action: () => {
        const url = window.prompt("Enter image URL");
        if (url) insert(`<img src="${url}" alt="" />`, "");
      },
      label: "Image",
    },
    {
      icon: Video,
      action: () => {
        const url = window.prompt("Enter video URL");
        if (url)
          insert(
            `<figure>\n  <iframe src="${url}" allowfullscreen></iframe>\n  <figcaption></figcaption>\n</figure>`,
            ""
          );
      },
      label: "Video",
    },
    { divider: true },
    { icon: AlignLeft, action: () => insert('<p style="text-align:left">', "</p>"), label: "Left" },
    { icon: AlignCenter, action: () => insert('<p style="text-align:center">', "</p>"), label: "Center" },
    { icon: AlignRight, action: () => insert('<p style="text-align:right">', "</p>"), label: "Right" },
    { divider: true },
    { icon: Minus, action: () => insert("<hr />", ""), label: "Divider" },
    { icon: Code, action: () => insert("<code>", "</code>"), label: "Code" },
  ];

  return (
    <div className="rounded-xl border border-stone-200 dark:border-stone-800 overflow-hidden">
      <div className="flex flex-wrap items-center gap-1 px-2 py-2 bg-stone-50 dark:bg-stone-900/50 border-b border-stone-200 dark:border-stone-800">
        {toolbar.map((b, i) => {
          if (b.divider)
            return (
              <div
                key={i}
                className="w-px h-5 bg-stone-200 dark:bg-stone-800 mx-1"
              />
            );
          const Icon = b.icon;
          return (
            <button
              key={i}
              type="button"
              onClick={b.action}
              title={b.label}
              className="w-8 h-8 rounded-md flex items-center justify-center text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
            >
              <Icon className="w-3.5 h-3.5" />
            </button>
          );
        })}
      </div>
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={24}
        placeholder="Write the story. HTML is supported. Use the toolbar above for formatting."
        className="w-full px-5 py-4 bg-white dark:bg-stone-950 text-[15px] text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none resize-y font-mono leading-relaxed"
      />
      <div className="flex items-center justify-between px-4 py-2 bg-stone-50 dark:bg-stone-900/50 border-t border-stone-200 dark:border-stone-800 text-xs text-stone-500">
        <span>HTML supported</span>
        <span>
          {value.length.toLocaleString()} characters ·{" "}
          {calculateReadingTime(value)} min read
        </span>
      </div>
    </div>
  );
};

/* ============================================================
   AUTHOR PICKER
============================================================ */

const AuthorPicker = ({ authors, value, onChange, reviewerValue, onReviewerChange }) => (
  <div className="space-y-5">
    <Field label="Author" required>
      <div className="space-y-2">
        {authors.map((a) => {
          const selected = value === a.id;
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => onChange(a.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg border transition text-left ${
                selected
                  ? "border-stone-900 dark:border-stone-100 bg-stone-50 dark:bg-stone-900"
                  : "border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-900/50"
              }`}
            >
              <Avatar author={a} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
                  {a.name}
                </p>
                <p className="text-xs text-stone-500 truncate">
                  {a.role || "Contributor"}
                  {a.credentials ? ` · ${a.credentials}` : ""}
                </p>
              </div>
              {selected && (
                <CheckCircle className="w-4 h-4 text-stone-900 dark:text-stone-100 flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </Field>

    <Field label="Medical reviewer" hint="Required if you mark the story as medically reviewed.">
      <select
        value={reviewerValue}
        onChange={(e) => onReviewerChange(e.target.value)}
        className="w-full px-3.5 py-2.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-sm focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 transition"
      >
        <option value="">No reviewer</option>
        {authors
          .filter((a) => a.id !== value)
          .map((a) => (
            <option key={a.id} value={a.id}>
              {a.name} — {a.credentials || a.role}
            </option>
          ))}
      </select>
    </Field>
  </div>
);

/* ============================================================
   RELATED POSTS PICKER
============================================================ */

const RelatedPostsPicker = ({ posts, value, onChange, currentId }) => {
  const [search, setSearch] = useState("");
  const candidates = posts
    .filter((p) => p.id !== currentId && !value.includes(p.id))
    .filter((p) =>
      search.trim()
        ? p.title.toLowerCase().includes(search.toLowerCase())
        : true
    )
    .slice(0, 8);

  const add = (id) => {
    onChange([...value, id]);
    setSearch("");
  };
  const remove = (id) => onChange(value.filter((x) => x !== id));

  return (
    <div>
      <div className="relative mb-2">
        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search stories to relate…"
          className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-sm focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 transition"
        />
      </div>

      {candidates.length > 0 && (
        <div className="mb-3 max-h-40 overflow-y-auto rounded-lg border border-stone-200 dark:border-stone-800 divide-y divide-stone-100 dark:divide-stone-900">
          {candidates.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => add(p.id)}
              className="w-full text-left px-3.5 py-2.5 hover:bg-stone-50 dark:hover:bg-stone-900/50 transition flex items-center gap-3"
            >
              {p.image && (
                <img
                  src={p.image}
                  alt=""
                  className="w-10 h-10 rounded object-cover flex-shrink-0"
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm text-stone-900 dark:text-stone-100 truncate">
                  {p.title}
                </p>
                <p className="text-xs text-stone-500">
                  {p.readingTime || 5} min
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {value.length > 0 && (
        <ul className="space-y-2">
          {value.map((id) => {
            const p = posts.find((x) => x.id === id);
            if (!p) return null;
            return (
              <li
                key={id}
                className="flex items-center gap-3 px-3 py-2 rounded-lg bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800"
              >
                <span className="text-sm text-stone-700 dark:text-stone-300 flex-1 truncate">
                  {p.title}
                </span>
                <button
                  type="button"
                  onClick={() => remove(id)}
                  className="text-stone-400 hover:text-rose-600 transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

/* ============================================================
   MAIN
============================================================ */

const AdminBlogPostEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [posts, setPosts] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tagList, setTagList] = useState([]);

  const [form, setForm] = useState(emptyPost());
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [autoSlug, setAutoSlug] = useState(!isEditing);

  /* ---------- Load ---------- */
  useEffect(() => {
    setAuthors(mockAuthors);
    setCategories(mockCategories);
    setTagList(mockTags);
    setPosts(mockPosts);

    if (isEditing) {
      const p = mockPosts.find((x) => x.id === id || x.slug === id);
      if (p) {
        setForm({
          ...emptyPost(),
          ...p,
          gallery: p.gallery || [],
          references: p.references || [],
          learningObjectives: p.learningObjectives || [],
          statistics: p.statistics || [],
          relatedPosts: (p.relatedPosts || []).map((r) =>
            typeof r === "string" ? r : r.id
          ),
          metaDescription: p.metaDescription || "",
          metaKeywords: p.metaKeywords || "",
          reviewedBy: p.reviewedBy || "",
        });
        setAutoSlug(false);
      } else {
        toast.error("Story not found");
        navigate("/admin/blog/posts");
      }
      setLoading(false);
    }
  }, [id, isEditing, navigate]);

  /* ---------- Update helper ---------- */
  const update = (path, value) => {
    setForm((prev) => {
      const next = { ...prev, [path]: value };
      if (path === "title" && autoSlug) next.slug = slugify(value);
      if (path === "content") next.readingTime = calculateReadingTime(value);
      return next;
    });
    if (errors[path]) setErrors((prev) => ({ ...prev, [path]: "" }));
  };

  /* ---------- Validation ---------- */
  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.slug.trim()) e.slug = "Slug is required";
    if (!form.content.trim()) e.content = "Content is required";
    if (!form.categoryId) e.categoryId = "Category is required";
    if (!form.authorId) e.authorId = "Author is required";
    if (form.medicallyReviewed && !form.reviewedBy)
      e.reviewedBy = "A reviewer must be selected if the story is medically reviewed";
    setErrors(e);
    if (Object.keys(e).length > 0) {
      toast.error("Please fix the highlighted fields");
      return false;
    }
    return true;
  };

  /* ---------- Save ---------- */
  const save = async (status) => {
    const payload = { ...form, status: status || form.status };
    if (!validate()) return;

    setSaving(true);
    try {
      // Replace with blogAPI.createPost / updatePost
      await new Promise((r) => setTimeout(r, 400));

      if (isEditing) {
        toast.success("Story updated");
      } else {
        toast.success(
          payload.status === "published"
            ? "Story published"
            : "Draft saved"
        );
      }
      navigate("/admin/blog/posts");
    } catch (err) {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  /* ---------- Derived ---------- */
  const currentCategory = useMemo(
    () => categories.find((c) => c.id === form.categoryId),
    [categories, form.categoryId]
  );
  const currentAuthor = useMemo(
    () => authors.find((a) => a.id === form.authorId),
    [authors, form.authorId]
  );
  const currentReviewer = useMemo(
    () => authors.find((a) => a.id === form.reviewedBy),
    [authors, form.reviewedBy]
  );

  if (loading) {
    return (
      <div className="py-32 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-stone-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      {/* ---------- HEADER ---------- */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to="/admin/blog/posts"
            className="w-9 h-9 rounded-full flex items-center justify-center text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-900 transition flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.25em] text-rose-600 dark:text-rose-400 font-semibold mb-1">
              {isEditing ? "Edit story" : "New story"}
            </p>
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-stone-900 dark:text-stone-50 truncate">
              {form.title || "Untitled"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => save("draft")}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-sm font-medium hover:bg-stone-50 dark:hover:bg-stone-900 transition disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            Save draft
          </button>
          <button
            onClick={() => save("published")}
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
                <Send className="w-3.5 h-3.5" />
                {isEditing ? "Update" : "Publish"}
              </>
            )}
          </button>
        </div>
      </div>

      {/* ---------- GRID ---------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* MAIN COLUMN */}
        <div className="lg:col-span-8 space-y-6">
          {/* Title + subtitle + excerpt */}
          <div className="p-6 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 space-y-5">
            <Field label="Title" required error={errors.title}>
              <TextInput
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="What is the headline?"
              />
            </Field>

            <Field label="Slug" error={errors.slug} hint={`/blog/${form.slug || "…"}`}>
              <div className="flex items-center gap-2">
                <TextInput
                  value={form.slug}
                  onChange={(e) => {
                    setAutoSlug(false);
                    update("slug", slugify(e.target.value));
                  }}
                  placeholder="story-slug"
                />
                <button
                  type="button"
                  onClick={() => update("slug", slugify(form.title))}
                  title="Regenerate from title"
                  className="px-3 py-2.5 rounded-lg border border-stone-200 dark:border-stone-800 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-50 dark:hover:bg-stone-900 transition flex-shrink-0"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </Field>

            <Field
              label="Subtitle"
              hint="Appears under the headline on the post page."
            >
              <TextInput
                value={form.subtitle}
                onChange={(e) => update("subtitle", e.target.value)}
                placeholder="A one-line deck."
              />
            </Field>

            <Field
              label="Excerpt"
              hint="Shown on cards and in search results."
            >
              <TextArea
                value={form.excerpt}
                onChange={(e) => update("excerpt", e.target.value)}
                placeholder="Two sentences that make the reader want to keep going."
                rows={3}
              />
            </Field>
          </div>

          {/* Content */}
          <div className="p-6 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950">
            <Field
              label="Body"
              required
              error={errors.content}
              hint="HTML is supported. Use the toolbar for headings, quotes, and lists."
            >
              <ContentEditor
                value={form.content}
                onChange={(v) => update("content", v)}
              />
            </Field>
          </div>

          {/* Media */}
          <div className="p-6 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 space-y-5">
            <p className="text-xs uppercase tracking-widest text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-2">
              <ImageIcon className="w-3 h-3" />
              Media
            </p>

            <Field
              label="Cover image URL"
              hint="Used as the hero on the post page and the thumbnail on cards."
            >
              <TextInput
                value={form.image}
                onChange={(e) => update("image", e.target.value)}
                placeholder="https://…"
              />
              {form.image && (
                <div className="mt-3 rounded-lg overflow-hidden aspect-[16/9] max-w-md">
                  <img
                    src={form.image}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field
                label="Video URL"
                hint="YouTube embed URL. Optional."
              >
                <TextInput
                  value={form.videoUrl}
                  onChange={(e) => update("videoUrl", e.target.value)}
                  placeholder="https://www.youtube.com/embed/…"
                />
              </Field>
              <Field
                label="Audio URL"
                hint="Podcast or narration MP3. Optional."
              >
                <TextInput
                  value={form.audioUrl}
                  onChange={(e) => update("audioUrl", e.target.value)}
                  placeholder="https://…mp3"
                />
              </Field>
            </div>
          </div>

          {/* References */}
          <div className="p-6 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950">
            <p className="text-xs uppercase tracking-widest text-rose-600 dark:text-rose-400 font-semibold mb-4 flex items-center gap-2">
              <BookOpen className="w-3 h-3" />
              References
            </p>
            <ListInput
              values={form.references}
              onChange={(v) => update("references", v)}
              placeholder="Author. Title. Journal. Year. DOI or URL"
            />
          </div>

          {/* Learning objectives */}
          <div className="p-6 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950">
            <p className="text-xs uppercase tracking-widest text-rose-600 dark:text-rose-400 font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="w-3 h-3" />
              Learning objectives
            </p>
            <ListInput
              values={form.learningObjectives}
              onChange={(v) => update("learningObjectives", v)}
              placeholder="By the end of this article, readers should be able to…"
            />
          </div>

          {/* Statistics */}
          <div className="p-6 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950">
            <p className="text-xs uppercase tracking-widest text-rose-600 dark:text-rose-400 font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-3 h-3" />
              Key statistics
            </p>
            <StatisticsInput
              values={form.statistics}
              onChange={(v) => update("statistics", v)}
            />
          </div>

          {/* SEO */}
          <div className="p-6 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 space-y-5">
            <p className="text-xs uppercase tracking-widest text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-2">
              <FileText className="w-3 h-3" />
              SEO
            </p>
            <Field
              label="Meta description"
              hint={`${form.metaDescription.length}/160 characters`}
            >
              <TextArea
                value={form.metaDescription}
                onChange={(e) => update("metaDescription", e.target.value)}
                rows={2}
                placeholder="Used by search engines. Keep under 160 characters."
              />
            </Field>
            <Field
              label="Meta keywords"
              hint="Comma separated. Optional."
            >
              <TextInput
                value={form.metaKeywords}
                onChange={(e) => update("metaKeywords", e.target.value)}
                placeholder="hypertension, blood pressure, prevention"
              />
            </Field>
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="lg:col-span-4 space-y-6">
          {/* Publish controls */}
          <div className="p-6 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 space-y-4">
            <p className="text-xs uppercase tracking-widest text-rose-600 dark:text-rose-400 font-semibold">
              Publishing
            </p>

            <Field label="Status">
              <select
                value={form.status}
                onChange={(e) => update("status", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-sm focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 transition cursor-pointer"
              >
                <option value="draft">Draft</option>
                <option value="review">In medical review</option>
                <option value="scheduled">Scheduled</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </Field>

            <Field label="Publish date">
              <TextInput
                type="datetime-local"
                value={(form.publishedAt || "").slice(0, 16)}
                onChange={(e) =>
                  update("publishedAt", new Date(e.target.value).toISOString())
                }
              />
            </Field>

            <div className="pt-2 space-y-2.5">
              {[
                {
                  key: "featured",
                  label: "Featured story",
                  icon: Star,
                },
                {
                  key: "editorsPick",
                  label: "Editor's pick",
                  icon: Sparkles,
                },
                {
                  key: "medicallyReviewed",
                  label: "Medically reviewed",
                  icon: Shield,
                },
              ].map((row) => {
                const Icon = row.icon;
                return (
                  <label
                    key={row.key}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={form[row.key]}
                      onChange={(e) => update(row.key, e.target.checked)}
                      className="w-4 h-4 rounded border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:ring-0"
                    />
                    <Icon className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
                    <span className="text-sm text-stone-700 dark:text-stone-300">
                      {row.label}
                    </span>
                  </label>
                );
              })}
            </div>

            {form.medicallyReviewed && (
              <div className="pt-2">
                <Field
                  label="Reviewer"
                  required
                  error={errors.reviewedBy}
                  hint={currentReviewer ? currentReviewer.name : ""}
                >
                  <select
                    value={form.reviewedBy}
                    onChange={(e) => update("reviewedBy", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-sm focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 transition cursor-pointer"
                  >
                    <option value="">Select a reviewer…</option>
                    {authors
                      .filter((a) => a.id !== form.authorId)
                      .map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))}
                  </select>
                </Field>
              </div>
            )}
          </div>

          {/* Category */}
          <div className="p-6 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950">
            <Field label="Category" required error={errors.categoryId}>
              <select
                value={form.categoryId}
                onChange={(e) => update("categoryId", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-sm focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 transition cursor-pointer"
              >
                <option value="">Select a section…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            {currentCategory?.description && (
              <p className="text-xs text-stone-500 dark:text-stone-500 mt-2 leading-relaxed">
                {currentCategory.description}
              </p>
            )}
          </div>

          {/* Author */}
          <div className="p-6 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950">
            <AuthorPicker
              authors={authors}
              value={form.authorId}
              onChange={(v) => update("authorId", v)}
              reviewerValue={form.reviewedBy}
              onReviewerChange={(v) => update("reviewedBy", v)}
            />
          </div>

          {/* Tags */}
          <div className="p-6 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950">
            <Field
              label="Tags"
              hint="Topics that link to /blog/tag/<slug> pages."
            >
              <TagPicker
                selected={form.tags}
                onChange={(v) => update("tags", v)}
                allTags={tagList}
              />
            </Field>
          </div>

          {/* Related posts */}
          <div className="p-6 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950">
            <Field
              label="Related stories"
              hint="Shown at the bottom of the post under 'More in {category}'."
            >
              <RelatedPostsPicker
                posts={posts}
                value={form.relatedPosts}
                onChange={(v) => update("relatedPosts", v)}
                currentId={form.id}
              />
            </Field>
          </div>

          {/* Preview link */}
          {form.slug && (
            <a
              href={`/blog/${form.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 hover:bg-stone-50 dark:hover:bg-stone-900 transition group"
            >
              <div>
                <p className="text-xs uppercase tracking-wider text-stone-500 dark:text-stone-400 font-semibold mb-1">
                  Preview
                </p>
                <p className="text-xs font-mono text-stone-700 dark:text-stone-300 truncate max-w-[220px]">
                  /blog/{form.slug}
                </p>
              </div>
              <ExternalLink className="w-4 h-4 text-stone-400 group-hover:text-stone-900 dark:group-hover:text-stone-100 transition" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminBlogPostEditor;