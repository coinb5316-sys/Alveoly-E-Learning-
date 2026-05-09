// backend/src/controllers/botController.js
import QAModel from "../models/QAModel.js";

// In-memory cache for faster responses
let qaCache = [];
let lastCacheUpdate = null;
const CACHE_TTL = 300000; // 5 minutes

// Load Q&A from database
export const loadQaCache = async () => {
  const now = Date.now();
  if (qaCache.length > 0 && lastCacheUpdate && (now - lastCacheUpdate) < CACHE_TTL) {
    return qaCache;
  }
  
  try {
    const qaList = await QAModel.find({}).sort({ createdAt: -1 });
    qaCache = qaList;
    lastCacheUpdate = now;
    console.log(`📚 QA Cache loaded: ${qaCache.length} entries`);
    return qaCache;
  } catch (error) {
    console.error("Failed to load QA cache:", error);
    return [];
  }
};

// Find best answer for a question
export const findBestAnswer = async (question) => {
  const qaList = await loadQaCache();
  
  if (!qaList.length) {
    return null;
  }
  
  const normalizedQuestion = question.toLowerCase().trim();
  
  // First try exact match
  let match = qaList.find(q => 
    q.question.toLowerCase() === normalizedQuestion
  );
  
  if (match) return match;
  
  // Then try keyword matching
  const keywords = normalizedQuestion.split(/\s+/);
  let bestMatch = null;
  let bestScore = 0;
  
  for (const qa of qaList) {
    const qaQuestion = qa.question.toLowerCase();
    let score = 0;
    
    for (const keyword of keywords) {
      if (keyword.length > 2 && qaQuestion.includes(keyword)) {
        score++;
      }
    }
    
    // Bonus for exact phrase match
    if (qaQuestion.includes(normalizedQuestion)) {
      score += 5;
    }
    
    if (score > bestScore) {
      bestScore = score;
      bestMatch = qa;
    }
  }
  
  if (bestScore >= 1) {
    return bestMatch;
  }
  
  return null;
};

// Clear cache (for admin updates)
export const clearQaCache = () => {
  qaCache = [];
  lastCacheUpdate = null;
  console.log("🗑️ QA Cache cleared");
};