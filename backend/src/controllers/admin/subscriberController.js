// backend/src/controllers/admin/subscriberController.js
import mongoose from "mongoose";
import Subscriber from "../../models/Subscriber.js";

/* ---------- Constants ---------- */
const VALID_STATUSES = ["active", "pending", "unsubscribed", "bounced"];
const VALID_SOURCES = [
  "footer",
  "article",
  "sidebar",
  "podcast",
  "import",
  "manual",
];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ---------- Helpers ---------- */
const normalizeEmail = (e) => String(e || "").trim().toLowerCase();

const toTags = (val) => {
  if (Array.isArray(val)) return val.map((s) => String(s).trim()).filter(Boolean);
  if (!val) return [];
  if (typeof val === "string" && val.trim().startsWith("[")) {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed)
        ? parsed.map((s) => String(s).trim()).filter(Boolean)
        : [];
    } catch {
      /* fall through */
    }
  }
  return String(val)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
};

const buildSubscriberPayload = (body, { partial = false } = {}) => {
  const payload = {};

  if (body.email !== undefined) {
    payload.email = normalizeEmail(body.email);
  }
  if (body.name !== undefined) {
    payload.name = (body.name || "").trim();
  }
  if (body.source !== undefined) {
    if (VALID_SOURCES.includes(body.source)) payload.source = body.source;
  }
  if (body.status !== undefined) {
    if (VALID_STATUSES.includes(body.status)) payload.status = body.status;
  }
  if (body.tags !== undefined) {
    payload.tags = toTags(body.tags);
  }
  if (body.subscribedAt !== undefined) {
    const d = new Date(body.subscribedAt);
    if (!Number.isNaN(d.getTime())) payload.subscribedAt = d;
  }

  if (!partial) {
    if (payload.status === undefined) payload.status = "active";
    if (payload.source === undefined) payload.source = "manual";
  }

  return payload;
};

/* ---------- GET /api/admin/blog/subscribers ---------- */
export const getSubscribers = async (req, res) => {
  try {
    const { status, source, search, sort = "newest" } = req.query;
    const filter = {};
    if (status && status !== "all") filter.status = status;
    if (source && source !== "all") filter.source = source;
    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
      ];
    }

    const sortMap = {
      newest: { subscribedAt: -1 },
      oldest: { subscribedAt: 1 },
      email: { email: 1 },
      opens: { opens: -1 },
    };

    const subs = await Subscriber.find(filter)
      .sort(sortMap[sort] || { subscribedAt: -1 })
      .lean();

    res.json({ success: true, data: subs });
  } catch (err) {
    console.error("getSubscribers error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------- POST /api/admin/blog/subscribers ---------- */
export const createSubscriber = async (req, res) => {
  try {
    const payload = buildSubscriberPayload(req.body);

    if (!payload.email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required." });
    }
    if (!EMAIL_RE.test(payload.email)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email address." });
    }

    const sub = await Subscriber.create(payload);
    return res.status(201).json({ success: true, data: sub });
  } catch (err) {
    console.error("createSubscriber error:", err);

    if (err instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        fields: Object.keys(err.errors).reduce((a, k) => {
          a[k] = err.errors[k].message;
          return a;
        }, {}),
      });
    }
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This email is already subscribed.",
        keyValue: err.keyValue,
      });
    }
    return res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  }
};

/* ---------- PUT /api/admin/blog/subscribers/:id ---------- */
export const updateSubscriber = async (req, res) => {
  try {
    const payload = buildSubscriberPayload(req.body, { partial: true });

    if (payload.email && !EMAIL_RE.test(payload.email)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email address." });
    }

    const sub = await Subscriber.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });
    if (!sub) {
      return res
        .status(404)
        .json({ success: false, message: "Subscriber not found" });
    }
    res.json({ success: true, data: sub });
  } catch (err) {
    console.error("updateSubscriber error:", err);

    if (err instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        fields: Object.keys(err.errors).reduce((a, k) => {
          a[k] = err.errors[k].message;
          return a;
        }, {}),
      });
    }
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This email is already subscribed.",
      });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------- DELETE /api/admin/blog/subscribers/:id ---------- */
export const deleteSubscriber = async (req, res) => {
  try {
    const sub = await Subscriber.findByIdAndDelete(req.params.id);
    if (!sub) {
      return res
        .status(404)
        .json({ success: false, message: "Subscriber not found" });
    }
    res.json({ success: true, message: "Subscriber deleted" });
  } catch (err) {
    console.error("deleteSubscriber error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------- POST /api/admin/blog/subscribers/bulk-update ---------- */
export const bulkUpdateSubscribers = async (req, res) => {
  try {
    const { ids, status } = req.body;
    if (!Array.isArray(ids) || !ids.length) {
      return res
        .status(400)
        .json({ success: false, message: "No ids provided" });
    }
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
      });
    }

    const result = await Subscriber.updateMany(
      { _id: { $in: ids } },
      { $set: { status } }
    );
    res.json({
      success: true,
      message: `${result.modifiedCount} subscribers updated`,
      matched: result.matchedCount,
      modified: result.modifiedCount,
    });
  } catch (err) {
    console.error("bulkUpdateSubscribers error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------- POST /api/admin/blog/subscribers/bulk-delete ---------- */
export const bulkDeleteSubscribers = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || !ids.length) {
      return res
        .status(400)
        .json({ success: false, message: "No ids provided" });
    }
    const result = await Subscriber.deleteMany({ _id: { $in: ids } });
    res.json({
      success: true,
      message: `${result.deletedCount} subscribers deleted`,
    });
  } catch (err) {
    console.error("bulkDeleteSubscribers error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------- Public: POST /api/blog/subscribe ---------- */
export const subscribe = async (req, res) => {
  try {
    const { email, name, source = "footer" } = req.body;

    const cleanEmail = normalizeEmail(email);
    if (!cleanEmail) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required." });
    }
    if (!EMAIL_RE.test(cleanEmail)) {
      return res
        .status(400)
        .json({ success: false, message: "Please enter a valid email." });
    }

    const existing = await Subscriber.findOne({ email: cleanEmail });
    if (existing) {
      // Don't leak private fields back to a public caller
      return res.json({
        success: true,
        message: "You're already subscribed",
        data: {
          email: existing.email,
          status: existing.status,
        },
      });
    }

    const safeSource = VALID_SOURCES.includes(source) ? source : "footer";

    const sub = await Subscriber.create({
      email: cleanEmail,
      name: (name || "").trim(),
      source: safeSource,
      status: "active",
    });

    res.status(201).json({
      success: true,
      message: "Subscribed",
      data: {
        email: sub.email,
        status: sub.status,
      },
    });
  } catch (err) {
    console.error("subscribe error:", err);
    if (err.code === 11000) {
      // Race condition — two requests for same email in the same second
      return res.json({
        success: true,
        message: "You're already subscribed",
      });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};