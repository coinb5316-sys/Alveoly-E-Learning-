// server/controllers/admin/testimonialController.js
import Testimonial from "../../models/Testimonial2.js";

export const getTestimonials = async (req, res) => {
  try {
    const { status, featured } = req.query;
    const filter = {};
    if (status && status !== "all") filter.status = status;
    if (featured === "true") filter.featured = true;

    const list = await Testimonial.find(filter)
      .sort({ pinned: -1, createdAt: -1 })
      .lean();

    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createTestimonial = async (req, res) => {
  try {
    const t = await Testimonial.create(req.body);
    res.status(201).json({ success: true, data: t });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateTestimonial = async (req, res) => {
  try {
    const t = await Testimonial.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!t)
      return res
        .status(404)
        .json({ success: false, message: "Testimonial not found" });
    res.json({ success: true, data: t });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteTestimonial = async (req, res) => {
  try {
    await Testimonial.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Testimonial deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* Public — featured testimonials for the homepage */
export const getFeaturedTestimonials = async (req, res) => {
  try {
    const list = await Testimonial.find({
      status: "approved",
      featured: true,
    })
      .sort({ pinned: -1, createdAt: -1 })
      .limit(6)
      .lean();

    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};