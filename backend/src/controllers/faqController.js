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
    res.status(500).json({ success: false, message: error.message });
  }
};

// controllers/faqController.js - FIXED createFAQ
export const createFAQ = async (req, res) => {
  try {
    const { question, answer, category } = req.body;
    
    console.log("📝 Received FAQ data:", { question, answer, category });
    
    if (!question || !answer) {
      return res.status(400).json({ success: false, message: "Question and answer are required" });
    }
    
    // Check if FAQ already exists
    const existing = await FAQ.findOne({ question: { $regex: new RegExp(`^${question.trim()}$`, 'i') } });
    if (existing) {
      return res.status(400).json({ success: false, message: "FAQ with this question already exists" });
    }
    
    // Generate keywords from question (client-side to avoid middleware issues)
    const keywords = question
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2);
    
    // Create FAQ - without createdBy if not provided
    const faqData = {
      question: question.trim(),
      answer: answer.trim(),
      category: category || "general",
      keywords: keywords,
      isActive: true,
      views: 0,
      helpful: { yes: 0, no: 0 }
    };
    
    // Add createdBy only if user is authenticated and has an ID
    if (req.user && req.user._id) {
      faqData.createdBy = req.user._id;
    }
    
    const faq = new FAQ(faqData);
    const savedFaq = await faq.save();
    console.log("✅ FAQ saved successfully:", savedFaq._id);
    
    res.status(201).json({ success: true, data: savedFaq, message: "FAQ created successfully" });
  } catch (error) {
    console.error("❌ Create FAQ error:", error);
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "A FAQ with this question already exists" });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateFAQ = async (req, res) => {
  try {
    const { question, answer, category, isActive } = req.body;
    
    const faq = await FAQ.findById(req.params.id);
    if (!faq) {
      return res.status(404).json({ success: false, message: "FAQ not found" });
    }
    
    if (question !== undefined) faq.question = question;
    if (answer !== undefined) faq.answer = answer;
    if (category !== undefined) faq.category = category;
    if (isActive !== undefined) faq.isActive = isActive;
    faq.updatedAt = Date.now();
    
    await faq.save();
    
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
    
    for (const faq of faqs) {
      faq.views += 1;
      await faq.save();
    }
    
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