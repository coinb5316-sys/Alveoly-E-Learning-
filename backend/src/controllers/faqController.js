import FAQ from "../models/FAQ.js";

export const getAllFAQs = async (req, res) => {
  try {
    const faqs = await FAQ.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({ success: true, data: faqs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getFAQById = async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id);
    if (!faq) return res.status(404).json({ success: false, message: "FAQ not found" });
    res.json({ success: true, data: faq });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createFAQ = async (req, res) => {
  try {
    const { question, answer, category } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ success: false, message: "Question and answer required" });
    }
    const existing = await FAQ.findOne({ question });
    if (existing) {
      return res.status(400).json({ success: false, message: "FAQ already exists" });
    }
    const faq = await FAQ.create({ question, answer, category: category || "general", createdBy: req.user?._id });
    res.status(201).json({ success: true, data: faq, message: "FAQ created successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateFAQ = async (req, res) => {
  try {
    const { question, answer, category, isActive } = req.body;
    const faq = await FAQ.findByIdAndUpdate(
      req.params.id,
      { question, answer, category, isActive },
      { new: true, runValidators: true }
    );
    if (!faq) return res.status(404).json({ success: false, message: "FAQ not found" });
    res.json({ success: true, data: faq, message: "FAQ updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndDelete(req.params.id);
    if (!faq) return res.status(404).json({ success: false, message: "FAQ not found" });
    res.json({ success: true, message: "FAQ deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const searchFAQs = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ success: true, data: [] });
    const searchTerm = q.toLowerCase().trim();
    const keywords = searchTerm.split(/\s+/).filter(word => word.length > 2);
    const faqs = await FAQ.find({
      isActive: true,
      $or: [
        { question: { $regex: searchTerm, $options: 'i' } },
        { answer: { $regex: searchTerm, $options: 'i' } },
        { keywords: { $in: keywords } }
      ]
    }).limit(5);
    for (const faq of faqs) { faq.views += 1; await faq.save(); }
    res.json({ success: true, data: faqs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markHelpful = async (req, res) => {
  try {
    const { helpful } = req.body;
    const faq = await FAQ.findById(req.params.id);
    if (!faq) return res.status(404).json({ success: false, message: "FAQ not found" });
    if (helpful === true) faq.helpful.yes += 1;
    else if (helpful === false) faq.helpful.no += 1;
    await faq.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};