// backend/src/controllers/faqController.js
import FAQ from "../models/FAQ.js";

export const getAllFAQs = async (req, res) => {
  try {
    const faqs = await FAQ.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({ success: true, data: faqs });
  } catch (error) {
    console.error("Get FAQs error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getFAQById = async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id);
    if (!faq) return res.status(404).json({ success: false, message: "FAQ not found" });
    res.json({ success: true, data: faq });
  } catch (error) {
    console.error("Get FAQ by ID error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createFAQ = async (req, res) => {
  try {
    const { question, answer, category } = req.body;
    
    if (!question || !answer) {
      return res.status(400).json({ success: false, message: "Question and answer are required" });
    }
    
    // Check if FAQ already exists
    const existing = await FAQ.findOne({ question });
    if (existing) {
      return res.status(400).json({ success: false, message: "FAQ with this question already exists" });
    }
    
    // Create FAQ without createdBy to avoid User reference issues
    const faqData = {
      question,
      answer,
      category: category || "general",
      isActive: true,
      views: 0,
      helpful: { yes: 0, no: 0 }
    };
    
    // Only add createdBy if user exists and is authenticated
    if (req.user && req.user._id) {
      faqData.createdBy = req.user._id;
    }
    
    const faq = await FAQ.create(faqData);
    
    res.status(201).json({ success: true, data: faq, message: "FAQ created successfully" });
  } catch (error) {
    console.error("Create FAQ error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateFAQ = async (req, res) => {
  try {
    const { question, answer, category, isActive } = req.body;
    
    const updateData = { updatedAt: Date.now() };
    if (question !== undefined) updateData.question = question;
    if (answer !== undefined) updateData.answer = answer;
    if (category !== undefined) updateData.category = category;
    if (isActive !== undefined) updateData.isActive = isActive;
    
    const faq = await FAQ.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!faq) {
      return res.status(404).json({ success: false, message: "FAQ not found" });
    }
    
    res.json({ success: true, data: faq, message: "FAQ updated successfully" });
  } catch (error) {
    console.error("Update FAQ error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndDelete(req.params.id);
    if (!faq) {
      return res.status(404).json({ success: false, message: "FAQ not found" });
    }
    res.json({ success: true, message: "FAQ deleted successfully" });
  } catch (error) {
    console.error("Delete FAQ error:", error);
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
    
    // Increment view count
    for (const faq of faqs) {
      faq.views += 1;
      await faq.save();
    }
    
    res.json({ success: true, data: faqs });
  } catch (error) {
    console.error("Search FAQs error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markHelpful = async (req, res) => {
  try {
    const { helpful } = req.body;
    const faq = await FAQ.findById(req.params.id);
    if (!faq) {
      return res.status(404).json({ success: false, message: "FAQ not found" });
    }
    
    if (helpful === true) {
      faq.helpful.yes += 1;
    } else if (helpful === false) {
      faq.helpful.no += 1;
    }
    
    await faq.save();
    res.json({ success: true });
  } catch (error) {
    console.error("Mark helpful error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};