// server/controllers/admin/policyController.js
import Policy from "../../models/Policy.js";

export const getPolicy = async (req, res) => {
  try {
    const policy = await Policy.findOne({ key: req.params.key }).lean();
    if (!policy) {
      return res.json({ success: true, data: null });
    }
    res.json({ success: true, data: policy });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const upsertPolicy = async (req, res) => {
  try {
    const { key } = req.params;
    const { title, sections, lastUpdated } = req.body;

    const policy = await Policy.findOneAndUpdate(
      { key },
      {
        key,
        title,
        sections,
        lastUpdated: lastUpdated || new Date(),
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({ success: true, data: policy });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};