// server/controllers/admin/subscriberController.js
import Subscriber from "../../models/Subscriber.js";

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
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createSubscriber = async (req, res) => {
  try {
    const sub = await Subscriber.create(req.body);
    res.status(201).json({ success: true, data: sub });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: "This email is already subscribed" });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateSubscriber = async (req, res) => {
  try {
    const sub = await Subscriber.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!sub)
      return res
        .status(404)
        .json({ success: false, message: "Subscriber not found" });
    res.json({ success: true, data: sub });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteSubscriber = async (req, res) => {
  try {
    await Subscriber.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Subscriber deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const bulkUpdateSubscribers = async (req, res) => {
  try {
    const { ids, status } = req.body;
    if (!ids?.length)
      return res
        .status(400)
        .json({ success: false, message: "No ids provided" });
    await Subscriber.updateMany({ _id: { $in: ids } }, { $set: { status } });
    res.json({ success: true, message: `${ids.length} subscribers updated` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const bulkDeleteSubscribers = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids?.length)
      return res
        .status(400)
        .json({ success: false, message: "No ids provided" });
    await Subscriber.deleteMany({ _id: { $in: ids } });
    res.json({ success: true, message: `${ids.length} subscribers deleted` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* Public — newsletter signup form */
export const subscribe = async (req, res) => {
  try {
    const { email, name, source = "footer" } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }
    const existing = await Subscriber.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.json({
        success: true,
        message: "You're already subscribed",
        data: existing,
      });
    }
    const sub = await Subscriber.create({ email, name, source });
    res.status(201).json({ success: true, data: sub });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};