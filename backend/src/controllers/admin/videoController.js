// server/controllers/admin/videoController.js
import Video from "../../models/Video.js";

export const getVideos = async (req, res) => {
  try {
    const videos = await Video.find().sort({ publishedAt: -1 }).lean();
    res.json({ success: true, data: videos });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getVideoById = async (req, res) => {
  try {
    const v = await Video.findById(req.params.id).lean();
    if (!v)
      return res
        .status(404)
        .json({ success: false, message: "Video not found" });
    res.json({ success: true, data: v });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createVideo = async (req, res) => {
  try {
    const payload = { ...req.body };
    payload.featured = payload.featured === "true" || payload.featured === true;
    const video = await Video.create(payload);
    res.status(201).json({ success: true, data: video });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateVideo = async (req, res) => {
  try {
    const payload = { ...req.body };
    payload.featured = payload.featured === "true" || payload.featured === true;
    const video = await Video.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });
    if (!video)
      return res
        .status(404)
        .json({ success: false, message: "Video not found" });
    res.json({ success: true, data: video });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteVideo = async (req, res) => {
  try {
    await Video.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Video removed" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};