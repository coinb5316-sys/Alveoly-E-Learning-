// server/controllers/admin/podcastController.js
import Podcast from "../../models/Podcast.js";
import { uploadToCloudinary } from "../../../config/cloudinary.js";

export const getPodcasts = async (req, res) => {
  try {
    const podcasts = await Podcast.find().sort({ episodeNumber: -1 }).lean();
    res.json({ success: true, data: podcasts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getPodcastById = async (req, res) => {
  try {
    const pod = await Podcast.findById(req.params.id).lean();
    if (!pod)
      return res
        .status(404)
        .json({ success: false, message: "Episode not found" });
    res.json({ success: true, data: pod });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createPodcast = async (req, res) => {
  try {
    const payload = { ...req.body };
    payload.episodeNumber = Number(payload.episodeNumber);
    payload.featured = payload.featured === "true" || payload.featured === true;
    payload.guests = Array.isArray(payload.guests)
      ? payload.guests
      : JSON.parse(payload.guests || "[]");

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, {
        folder: "blog/podcasts",
      });
      payload.image = result.secure_url;
    }

    const pod = await Podcast.create(payload);
    res.status(201).json({ success: true, data: pod });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "That episode number is already used",
      });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updatePodcast = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (payload.episodeNumber)
      payload.episodeNumber = Number(payload.episodeNumber);
    payload.featured = payload.featured === "true" || payload.featured === true;
    if (payload.guests && typeof payload.guests === "string") {
      payload.guests = JSON.parse(payload.guests);
    }

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, {
        folder: "blog/podcasts",
      });
      payload.image = result.secure_url;
    }

    const pod = await Podcast.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });
    if (!pod)
      return res
        .status(404)
        .json({ success: false, message: "Episode not found" });
    res.json({ success: true, data: pod });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deletePodcast = async (req, res) => {
  try {
    await Podcast.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Episode deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};