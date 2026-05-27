// services/aiService.js - Nursing & Medical Education Focus
import axios from "axios";

const API_KEY = process.env.OPENROUTER_API_KEY;
const BASE_URL = "https://openrouter.ai/api/v1";

// Nursing & Medical Education System Prompt
const NURSING_SYSTEM_PROMPT = `You are "Nurse AI", a professional nursing tutor and medical educator for Alveoly E-Learning Academy.

Your expertise includes:
- Nursing fundamentals, procedures, and best practices
- Medical terminology and anatomy
- Patient care and clinical skills
- Pharmacology and medication administration
- NCLEX/Board exam preparation
- Evidence-based practice in nursing
- Healthcare ethics and legal considerations
- Pathophysiology and disease processes

Guidelines for your responses:
1. Be accurate, professional, and educational
2. Use clear, simple language appropriate for nursing students
3. Include clinical relevance and safety considerations when applicable
4. Encourage critical thinking by asking follow-up questions
5. For medication questions, emphasize the "5 Rights" and safety
6. For NCLEX prep, explain why answers are correct/incorrect
7. Use emojis sparingly to be friendly 🩺📚💊

If asked about platform-specific questions (courses, admissions, fees), answer from Alveoly's perspective.
If you don't know something, say so honestly and suggest consulting clinical instructors.
Always prioritize patient safety and evidence-based practice.`;

// For general platform questions
const GENERAL_SYSTEM_PROMPT = `You are an AI assistant for Alveoly E-Learning Academy.
You help with:
- Course information (Nursing, Public Health, Pharmacy, etc.)
- Admissions and application process
- Tuition fees and payment options
- Student support services
- Technical platform issues

Keep responses concise, friendly, and helpful.`;

export const askAI = async (question, isMedicalQuestion = true) => {
  try {
    if (!API_KEY) {
      console.error("❌ OPENROUTER_API_KEY not set");
      return null;
    }
    
    const systemPrompt = isMedicalQuestion ? NURSING_SYSTEM_PROMPT : GENERAL_SYSTEM_PROMPT;
    
    const response = await axios.post(
      `${BASE_URL}/chat/completions`,
      {
        model: "openrouter/auto",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: question,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      },
      {
        headers: { 
          Authorization: `Bearer ${API_KEY}`, 
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.CLIENT_URL || "https://alveoly-e-learning-755w.onrender.com",
          "X-Title": "Alveoly E-Learning Academy"
        },
      }
    );

    return response.data.choices?.[0]?.message?.content || null;
    
  } catch (error) {
    console.error("❌ OPENROUTER ERROR:", error.response?.data || error.message);
    return null;
  }
};

// Detect if question is medical/nursing related
export const isMedicalQuestion = (text) => {
  const medicalKeywords = [
    'nursing', 'patient', 'medication', 'drug', 'disease', 'symptom', 'diagnosis',
    'treatment', 'therapy', 'anatomy', 'physiology', 'pathophysiology', 'clinical',
    'hospital', 'doctor', 'nurse', 'healthcare', 'medical', 'pharmacology', 'nclex',
    'cardiac', 'respiratory', 'neurological', 'pediatric', 'maternal', 'newborn',
    'lab value', 'vital sign', 'assessment', 'intervention', 'care plan', 'evidence'
  ];
  
  const lowerText = text.toLowerCase();
  return medicalKeywords.some(keyword => lowerText.includes(keyword));
};

// Generate nursing quiz questions
export const generateNursingQuiz = async (topic, difficulty = "medium", numQuestions = 5) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/chat/completions`,
      {
        model: "openrouter/auto",
        messages: [
          {
            role: "system",
            content: `You are a nursing exam question generator. Create ${numQuestions} multiple-choice questions about ${topic} at ${difficulty} difficulty.
                     Format each question as JSON with: question, options (array of 4), correctAnswer (A, B, C, or D), rationale.
                     Return as a JSON array.`
          },
          {
            role: "user",
            content: `Generate ${numQuestions} ${difficulty} level NCLEX-style questions about ${topic}.`
          }
        ],
        temperature: 0.8,
      },
      {
        headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json" }
      }
    );
    
    const content = response.data.choices?.[0]?.message?.content;
    try {
      return JSON.parse(content);
    } catch {
      return { error: "Could not parse questions", raw: content };
    }
  } catch (error) {
    console.error("Quiz generation error:", error);
    return null;
  }
};