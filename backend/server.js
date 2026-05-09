// server.js - Complete Socket.IO configuration with notifications and BOT system
import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import app from "./src/app.js";
import { createServer } from "http";
import { Server } from "socket.io";
import QA from "./src/models/QAModel.js";

dotenv.config();

// ================= INIT =================
connectDB();

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// ================= HTTP SERVER =================
const httpServer = createServer(app);

// ================= QA CACHE SYSTEM =================
let qaCache = [];
let lastCacheUpdate = null;
const CACHE_TTL = 300000; // 5 minutes

// Load QA cache from database
async function loadQaCache() {
  const now = Date.now();
  if (qaCache.length > 0 && lastCacheUpdate && (now - lastCacheUpdate) < CACHE_TTL) {
    return qaCache;
  }
  
  try {
    qaCache = await QA.find({}).sort({ createdAt: -1 });
    lastCacheUpdate = now;
    console.log(`📚 QA Cache loaded: ${qaCache.length} entries`);
    return qaCache;
  } catch (error) {
    console.error("Failed to load QA cache:", error);
    return [];
  }
}

// Clear QA cache (call when Q&A is updated)
export function clearQaCache() {
  qaCache = [];
  lastCacheUpdate = null;
  console.log("🗑️ QA Cache cleared");
}

// ================= COMPREHENSIVE DEFAULT ANSWERS =================
const DEFAULT_ANSWERS = {
  // Greetings
  "hello": "👋 Hello! Welcome to Alveoly E-Learning Academy! I'm your virtual assistant. How can I help you today? Whether you need information about courses, admissions, fees, or anything else, I'm here to assist!",
  "hi": "👋 Hi there! Great to see you at Alveoly! I'm here to help you with information about our health sciences programs, admissions process, course details, and more. What would you like to know today?",
  "hey": "👋 Hey there! Welcome to Alveoly! Feel free to ask me anything about our courses, admissions, or programs. I'm here 24/7 to help you!",
  "good morning": "☀️ Good morning! Welcome to Alveoly E-Learning Academy! I hope you're having a wonderful day. How can I assist you with your learning journey today?",
  "good afternoon": "🌤️ Good afternoon! Thank you for visiting Alveoly! I'm ready to help you with any questions about our health sciences programs. What would you like to know?",
  "good evening": "🌙 Good evening! Welcome to Alveoly! I'm here to help you explore our courses and programs. Feel free to ask me anything!",
  
  // Help and Support
  "help": "🤝 **I'd be happy to help! Here's what I can assist you with:**\n\n📚 **Courses & Programs** - Information about our health sciences offerings\n🎓 **Admissions** - Application process, requirements, deadlines\n💰 **Fees & Financial Aid** - Tuition costs and payment options\n📞 **Contact Support** - Get in touch with our team\n👨‍🏫 **Faculty** - Learn about our expert instructors\n🏆 **Certification** - Details about our certificates\n🌍 **International Students** - Information for overseas learners\n💻 **Online Learning** - How our platform works\n\nJust type your question and I'll do my best to answer!",
  "support": "🤝 **Our support team is here to help!**\n\n**Ways to reach us:**\n• 💬 Live chat (instant response) - you're using it now!\n• 📧 Email: support@alveoly.com\n• 📱 Phone: +233 (0) 54 489 1862\n• 📝 Contact form on our website\n\n**Response times:**\n• Live chat: Immediate\n• Email: Within 24 hours\n• Phone: During business hours (Mon-Fri, 9 AM - 6 PM GMT)\n\nWhat issue can I help resolve for you today?",
  
  // Courses and Programs
  "courses": "🎓 **Courses and Programs at Alveoly**\n\nWe offer comprehensive health sciences education:\n\n**🏥 Undergraduate Programs (3-4 years)**\n• Bachelor of Science in Nursing\n• Bachelor of Public Health\n• Bachelor of Health Administration\n• Bachelor of Medical Laboratory Science\n\n**📋 Diploma Programs (1-2 years)**\n• Diploma in Pharmacy Technology\n• Diploma in Community Health\n• Diploma in Clinical Research\n\n**📜 Certificate Programs (6-12 months)**\n• Healthcare Management\n• Health Informatics\n• Medical Coding\n• Patient Care Technician\n\n**💼 Short Courses (4-8 weeks)**\n• First Aid and CPR\n• Medical Terminology\n• Healthcare Ethics\n\nWhich program interests you? I can provide more detailed information!",
  
  "programs": "🎓 **Academic Programs at Alveoly**\n\nWe offer a wide range of health sciences programs designed to prepare you for a successful career:\n\n**🎓 Degree Programs:**\n• BSc Nursing - Become a registered nurse\n• BSc Public Health - Community health specialist\n• BSc Health Administration - Healthcare leadership\n• BSc Medical Laboratory Science - Diagnostic expert\n\n**📜 Diploma Programs:**\n• Diploma in Pharmacy Technology\n• Diploma in Community Health Nursing\n• Diploma in Clinical Medicine\n• Diploma in Health Records\n\n**📋 Certificate Programs:**\n• Certificate in Healthcare Management\n• Certificate in Health Informatics\n• Certificate in Medical Coding\n• Certificate in Patient Care\n\n**🎯 All programs feature:**\n✅ Accredited curriculum\n✅ Experienced faculty\n✅ Flexible online learning\n✅ Practical training opportunities\n✅ Career placement support\n\nWould you like detailed information about any specific program?",
  
  // Admissions
  "admission": "📝 **Admission Process - Simple & Straightforward!**\n\n**Step-by-Step Guide:**\n\n1️⃣ **Create an Account** - Sign up on our platform with your email\n2️⃣ **Choose Your Program** - Select your desired course of study\n3️⃣ **Complete Application** - Fill out the online application form\n4️⃣ **Upload Documents** - Submit required certificates and transcripts\n5️⃣ **Pay Application Fee** - Complete the payment (waived for early applications!)\n6️⃣ **Interview (if required)** - Virtual interview for select programs\n7️⃣ **Receive Decision** - Get admission notification within 5-7 business days\n8️⃣ **Enroll & Start** - Complete enrollment and begin your journey!\n\n**Documents Required:**\n• High school diploma or equivalent\n• Official transcripts\n• Identification document\n• Passport photo\n• Recommendation letters (for degree programs)\n\n**Need help with any step?** I'm here to guide you through the process!",
  
  "admissions": "📝 **Admission Requirements by Program Level**\n\n**📜 Certificate Programs:**\n• High school diploma or equivalent\n• Basic English proficiency\n• No experience required!\n\n**📋 Diploma Programs:**\n• High school diploma with minimum GPA of 2.5\n• English proficiency\n• Relevant work experience (preferred but not required)\n\n**🎓 Degree Programs:**\n• High school diploma with minimum GPA of 3.0\n• English proficiency (TOEFL/IELTS for international)\n• Letters of recommendation\n• Personal statement\n• Interview (may be required)\n\n**🌍 International Students - Additional Requirements:**\n• Valid passport\n• Student visa (we provide support letters)\n• Educational credential evaluation\n• English proficiency test scores\n\n**Application Deadlines:**\n• Fall Semester (Sept intake): Apply by July 31\n• Spring Semester (Jan intake): Apply by Nov 30\n• Summer Semester (May intake): Apply by Mar 31\n\n**Ready to apply?** I can help you get started!",
  
  // Fees and Payments
  "fee": "💰 **Tuition and Fees**\n\n**Program Costs:**\n• 📜 Certificate Programs: Starting from $500 - $1,500\n• 📋 Diploma Programs: Starting from $1,500 - $3,000\n• 🎓 Degree Programs: Starting from $3,000 - $8,000 per year\n• 💼 Short Courses: $100 - $500\n\n**Additional Fees:**\n• 📝 Application Fee: $50 (free for early applications!)\n• 📚 Learning Materials: Included in tuition\n• 🎓 Graduation Fee: $100\n\n**Payment Options:**\n✅ Full payment (5% discount)\n✅ Installment plans (3-6 months)\n✅ Semester-based payments\n✅ Scholarship opportunities available\n\n**💰 Financial Aid & Scholarships:**\n• Merit-based scholarships (up to 50%)\n• Need-based financial aid\n• Early bird discount (10% off)\n• Referral program discounts\n• Military/veteran discounts\n\nWould you like me to calculate estimated costs for your chosen program?",
  
  "fees": "💰 **Fee Structure & Payment Information**\n\n**Tuition by Program Type:**\n\n**Certificate Programs:** $500 - $1,500\n• Healthcare Management: $800\n• Health Informatics: $700\n• Medical Coding: $600\n\n**Diploma Programs:** $1,500 - $3,000\n• Pharmacy Technology: $2,000\n• Community Health: $1,800\n• Clinical Research: $2,500\n\n**Degree Programs:** $3,000 - $8,000/year\n• BSc Nursing: $4,000/year\n• BSc Public Health: $3,500/year\n• BSc Health Administration: $3,500/year\n\n**Payment Plans Available:**\n• Monthly Installments (0% interest)\n• Semester Payment (5% discount)\n• Full Year Payment (10% discount)\n\n**Accepted Payment Methods:**\n💳 Credit/Debit Cards (Visa, Mastercard, Amex)\n📱 Mobile Money (MTN, Vodafone, AirtelTigo)\n🏦 Bank Transfer\n💰 PayPal\n\nNeed help with payment arrangements? Let me know!",
  
  "payment": "💳 **Payment Methods Accepted**\n\nWe offer multiple convenient payment options:\n\n**Online Payments:**\n• 💳 Credit/Debit Cards (Visa, Mastercard, American Express)\n• 📱 Mobile Money (MTN MoMo, Vodafone Cash, AirtelTigo Money)\n• 💰 PayPal\n• 🏦 Apple Pay / Google Pay\n\n**Bank Transfers:**\n• Local bank transfers (Ghana)\n• International wire transfers\n• USSD banking\n\n**In-Person:**\n• Cash payments at our campus (Accra, Ghana)\n\n**Payment Security:**\n✅ PCI-DSS compliant\n✅ Encrypted transactions\n✅ Secure payment gateway\n✅ Receipt provided for all payments\n\n**Need assistance with payment?** Contact our finance team at finance@alveoly.com or call +233 (0) 54 489 1862",
  
  // Scholarships
  "scholarship": "🎓 **Scholarship Opportunities at Alveoly!**\n\n**✨ Available Scholarships:**\n\n**1. Merit Scholarship** (up to 50% tuition)\n• Minimum GPA of 3.5\n• Outstanding academic achievement\n• Renewable each semester\n\n**2. Need-Based Grant** (up to 40% tuition)\n• Demonstrated financial need\n• Submit financial documents\n• Priority to underserved communities\n\n**3. Early Bird Scholarship** (10% off)\n• Apply and pay 30 days before deadline\n• No GPA requirement\n• Available to all new students\n\n**4. Referral Scholarship** (15% off each)\n• Refer a friend who enrolls\n• Both receive discount\n• Unlimited referrals\n\n**5. International Student Scholarship** (25% off)\n• For students from outside Ghana\n• Minimum GPA 3.0\n• Cultural ambassador role\n\n**6. Women in STEM Scholarship** (30% off)\n• For female students in science programs\n• Leadership potential\n• Community involvement\n\n**How to Apply:**\n1. Complete admission application\n2. Submit scholarship essay\n3. Provide recommendation letters\n4. Upload supporting documents\n\n**Deadline:** Same as admission deadline\n\nInterested? I can help you find scholarships you qualify for!",
  
  // Contact Information
  "contact": "📞 **Contact Alveoly E-Learning Academy**\n\n**Main Campus:**\n📍 Greater Accra, Ghana\n\n**Contact Information:**\n📧 **Email:** support@alveoly.com\n📱 **Phone:** +233 (0) 54 489 1862\n💬 **WhatsApp:** +233 (0) 54 489 1862\n📠 **Fax:** +233 (0) 30 123 4567\n\n**Social Media:**\n• Facebook: @alveolyelearning\n• Twitter: @alveolyehealth\n• LinkedIn: Alveoly Health Sciences\n• Instagram: @alveoly_academy\n\n**Office Hours:**\nMonday - Friday: 9:00 AM - 6:00 PM GMT\nSaturday: 10:00 AM - 2:00 PM GMT\nSunday: Closed (Live chat available 24/7)\n\n**Support Team:**\n• Admissions: admissions@alveoly.com\n• Academic Affairs: academics@alveoly.com\n• Technical Support: tech@alveoly.com\n• Finance: finance@alveoly.com\n\n**Emergency Contact (during business hours):** +233 (0) 54 489 1862\n\nHow can we help you today?",
  
  // Online Learning
  "online": "💻 **Online Learning Platform**\n\n**Features of Our Virtual Campus:**\n\n**📚 Learning Tools:**\n• High-quality video lectures\n• Interactive quizzes and assignments\n• Downloadable course materials\n• Virtual labs and simulations\n\n**👥 Collaboration:**\n• Live virtual classrooms\n• Discussion forums\n• Peer study groups\n• Group project tools\n\n**📊 Progress Tracking:**\n• Real-time grade updates\n• Completion certificates\n• Performance analytics\n• Personalized learning paths\n\n**📱 Accessibility:**\n• 24/7 access from anywhere\n• Mobile-friendly platform\n• Offline viewing available\n• Multi-device sync\n\n**🎓 Support Services:**\n• Academic advisors\n• Technical support team\n• Tutoring services\n• Career counseling\n\n**Technical Requirements:**\n• Internet connection (minimum 5 Mbps)\n• Modern browser (Chrome, Firefox, Safari)\n• Computer or mobile device\n• Speakers/headphones\n\n**Ready to start?** Let me help you get enrolled!",
  
  // Certification
  "certificate": "🎓 **Certification Information**\n\n**What You'll Receive Upon Completion:**\n\n**📜 Digital Certificate:**\n• Shareable on LinkedIn\n• Includes QR code for verification\n• Downloadable PDF format\n\n**📊 Official Transcript:**\n• Detailed grade report\n• Course-by-course breakdown\n• GPA calculation\n\n**🔗 Verification Link:**\n• Employers can verify authenticity online\n• Permanent verification URL\n• Blockchain-verified option available\n\n**📮 Physical Certificate:**\n• High-quality parchment paper\n• University seal and signatures\n• Mailed to your address (additional fee)\n\n**Certificate Features:**\n✅ University-backed credentials\n✅ Industry-recognized\n✅ Lifetime validity\n✅ Accredited programs\n\n**Processing Time:**\n• Digital certificates: 2-3 business days after completion\n• Physical certificates: 2-4 weeks for delivery\n\n**Certificate Replacement:**\n• Digital: Free re-download anytime\n• Physical: $25 replacement fee\n\nYour certificate will open doors to new career opportunities!",
  
  // International Students
  "international": "🌍 **International Student Information**\n\n**Welcome to Alveoly Global!**\n\n**🌐 We Welcome Students From:**\n• All African countries\n• Asia, Europe, Americas\n• Middle East\n• Worldwide!\n\n**📋 Additional Requirements:**\n• English proficiency (TOEFL iBT 70+, IELTS 6.0+)\n• Valid passport\n• Student visa (we provide support letters)\n• Educational credential evaluation\n• Proof of financial means\n\n**🎓 International Student Services:**\n• Visa application assistance\n• Airport pickup (Accra)\n• Accommodation support\n• Cultural orientation program\n• International student advisor\n• 24/7 emergency contact\n\n**💰 International Student Fees:**\n• Same tuition as local students!\n• International wire transfer accepted\n• No additional international fees\n\n**🌍 Time Zone Accommodation:**\n• All lectures recorded\n• Multiple live session times\n• Self-paced learning options\n• 24/7 discussion forums\n\n**📞 Dedicated Support:**\n• International Student Office: international@alveoly.com\n• WhatsApp: +233 (0) 54 489 1862\n\nWould you like more information about studying with us from abroad?",
  
  // Duration
  "duration": "⏰ **Program Durations**\n\n**Program Lengths at Alveoly:**\n\n**📜 Certificate Programs:**\n• Standard: 6-12 months\n• Accelerated: 4-8 months\n• Part-time: 12-18 months\n\n**📋 Diploma Programs:**\n• Standard: 1-2 years\n• Accelerated: 10-16 months\n• Part-time: 2-3 years\n\n**🎓 Degree Programs:**\n• Bachelor's: 3-4 years standard\n• Accelerated Bachelor's: 2.5-3 years\n• Part-time: 4-5 years\n\n**💼 Short Courses:**\n• 4-8 weeks\n• Self-paced completion\n\n**⚡ Flexible Options:**\n✅ Full-time (12-15 credits/semester)\n✅ Part-time (6-9 credits/semester)\n✅ Accelerated (15-18 credits/semester)\n✅ Self-paced (complete anytime)\n\n**Maximum Completion Time:**\n• Certificates: 2 years\n• Diplomas: 4 years\n• Degrees: 7 years\n\n**Transfer Credits:**\n• Up to 50% of credits can be transferred\n• Prior learning assessment available\n• Military credit accepted\n\nNeed specific duration for a program? Let me know!",
  
  // Requirements
  "requirements": "📋 **Admission Requirements by Program Level**\n\n**For Certificate Programs:**\n✅ High school diploma or equivalent\n✅ Basic English proficiency\n✅ No minimum GPA requirement\n✅ Open enrollment - apply anytime!\n\n**For Diploma Programs:**\n✅ High school diploma\n✅ Minimum GPA of 2.5\n✅ English proficiency\n✅ May require relevant work experience\n\n**For Bachelor's Degree Programs:**\n✅ High school diploma with strong grades\n✅ Minimum GPA of 3.0\n✅ English proficiency (TOEFL/IELTS for international)\n✅ Letters of recommendation (2)\n✅ Personal statement\n✅ Interview (may be required)\n\n**For International Students:**\n✅ All of the above\n✅ Valid passport\n✅ Student visa documentation\n✅ Educational credential evaluation\n✅ Proof of financial means\n\n**⚠️ Note:** Requirements may vary by specific program. Contact admissions for program-specific requirements.\n\n**📜 Document Preparation Tips:**\n• Scan documents in color\n• Save as PDF format\n• Ensure readability\n• Official translations for non-English documents\n\nWhich program are you interested in? I can provide specific requirements!",
  
  // Deadlines
  "deadline": "🗓️ **Application Deadlines**\n\n**Fall Semester (September Intake):**\n📅 Application deadline: July 31\n📅 Document submission: August 15\n📅 Decision notification: Rolling basis\n📅 Classes start: First week of September\n\n**Spring Semester (January Intake):**\n📅 Application deadline: November 30\n📅 Document submission: December 15\n📅 Decision notification: Rolling basis\n📅 Classes start: First week of January\n\n**Summer Semester (May Intake):**\n📅 Application deadline: March 31\n📅 Document submission: April 15\n📅 Decision notification: Rolling basis\n📅 Classes start: First week of May\n\n**Late Applications:**\n⚠️ Accepted up to 30 days after deadline\n⚠️ Additional $25 late fee\n⚠️ Limited program availability\n⚠️ May delay start date\n\n**Early Applications (Recommended):**\n✅ Priority consideration\n✅ Scholarship opportunities\n✅ Early course registration\n✅ Visa processing time\n\n**Rolling Admissions:**\n• Applications reviewed as received\n• Decision within 5-7 business days\n• Until all seats filled\n\n**Ready to apply?** Don't wait - apply early for best consideration!",
  
  // Accreditations
  "accreditation": "✅ **Accreditations & Recognitions**\n\n**Alveoly E-Learning Academy is proud to be:**\n\n**📜 Accredited By:**\n• National Accreditation Board (NAB), Ghana\n• International Association for Quality Assurance in Higher Education\n• World Health Organization (WHO) recognized\n\n**🤝 Professional Memberships:**\n• Commonwealth of Learning (COL)\n• African Distance Learning Association\n• Global Health Education Consortium\n\n**🏆 Recognitions:**\n• Best Online Health Sciences Academy - West Africa 2024\n• Excellence in Distance Learning Award\n• Innovation in Healthcare Education Award\n\n**📋 Program Accreditations:**\n• Nursing programs: Nursing and Midwifery Council of Ghana\n• Public Health programs: Ghana Public Health Association\n• Health Administration: International Hospital Federation\n\n**🎓 Transfer Agreements:**\n• Articulation agreements with universities worldwide\n• Credit transfer to partner institutions\n• Pathway programs for further studies\n\n**Why Choose an Accredited Institution:**\n✅ Quality education standards\n✅ Globally recognized credentials\n✅ Transferable credits\n✅ Financial aid eligibility\n✅ Employer recognition\n\nYour education at Alveoly is recognized worldwide!",
  
  // Thank you and farewell
  "thank": "🌟 **You're very welcome!** I'm so glad I could help you today.\n\nRemember, I'm here 24/7 to assist you with:\n• Questions about our programs\n• Admissions guidance\n• Fee information\n• Technical support\n\nIs there anything else you'd like to know about Alveoly? Whether it's courses, admissions, fees, or anything else, I'm here to help!\n\nHave a wonderful day! 😊",
  
  "thanks": "🌟 **You're very welcome!** It's my pleasure to assist you.\n\nFeel free to reach out anytime you have questions. I'm here to help you succeed in your educational journey at Alveoly!\n\nWishing you all the best! 🎓",
  
  "bye": "👋 **Goodbye!** Thank you for visiting Alveoly E-Learning Academy.\n\n**Before you go:**\n• Have you checked out our programs?\n• Would you like to start your application?\n• Need any more information?\n\nIf you have more questions in the future, don't hesitate to reach out. We're always here to help you on your educational journey!\n\n**Quick links:**\n• Apply now: www.alveolye-learning.academy/apply\n• Course catalog: www.alveolye-learning.academy/courses\n• Contact support: support@alveoly.com\n\nTake care and have a wonderful day! 🎓✨",
  
  "goodbye": "👋 **Goodbye!** Thank you for your interest in Alveoly E-Learning Academy!\n\n**Stay connected:**\n• Follow us on social media for updates\n• Check your email for important information\n• Visit our website for the latest news\n\nWe look forward to welcoming you to the Alveoly family soon!\n\nTake care and have a blessed day! 🙏✨"
};

// Find best answer for a question - Enhanced with default answers
async function findBestAnswer(question) {
  const normalizedQuestion = question.toLowerCase().trim();
  const qaList = await loadQaCache();
  
  // First check if there's a match in the database
  if (qaList.length > 0) {
    // Remove common words for better matching
    const stopWords = ['the', 'a', 'an', 'is', 'are', 'was', 'were', 'to', 'of', 'and', 'for', 'in', 'on', 'at', 'with', 'by'];
    const keywords = normalizedQuestion.split(/\s+/).filter(word => !stopWords.includes(word) && word.length > 2);
    
    let bestMatch = null;
    let bestScore = 0;
    
    for (const qa of qaList) {
      const qaQuestion = qa.question.toLowerCase();
      let score = 0;
      
      // Exact match - highest score
      if (qaQuestion === normalizedQuestion) {
        score += 100;
      }
      
      // Contains exact phrase
      if (qaQuestion.includes(normalizedQuestion)) {
        score += 50;
      }
      
      // Keyword matching
      for (const keyword of keywords) {
        if (qaQuestion.includes(keyword)) {
          score += 10;
        }
      }
      
      // Word-by-word matching
      const questionWords = normalizedQuestion.split(/\s+/);
      for (const word of questionWords) {
        if (word.length > 2 && qaQuestion.includes(word)) {
          score += 2;
        }
      }
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = qa;
      }
    }
    
    // Only return if score is meaningful (at least 20)
    if (bestScore >= 20) {
      console.log(`✅ Database match found with score ${bestScore}: "${bestMatch.question}"`);
      return bestMatch;
    }
  }
  
  // No database match - check default answers
  // Check for exact match in default answers
  if (DEFAULT_ANSWERS[normalizedQuestion]) {
    console.log(`✅ Default answer found for: "${normalizedQuestion}"`);
    return { answer: DEFAULT_ANSWERS[normalizedQuestion] };
  }
  
  // Check for keyword matches in default answers
  for (const [key, answer] of Object.entries(DEFAULT_ANSWERS)) {
    if (normalizedQuestion.includes(key)) {
      console.log(`✅ Default answer found for keyword: "${key}"`);
      return { answer };
    }
  }
  
  // No match found anywhere
  return null;
}

// ================= SOCKET.IO CONFIGURATION =================
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://alveolye-learning.academy",
  "https://www.alveolye-learning.academy",
  "https://alveoly-platform.onrender.com",
  "https://alveoly-platform-1.onrender.com",
  CLIENT_URL,
].filter(Boolean);

console.log("Socket.IO allowed origins:", allowedOrigins);

export const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`⚠️ Socket.IO blocked origin: ${origin}`);
        callback(null, true);
      }
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["polling", "websocket"],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000,
  connectTimeout: 45000,
  allowUpgrades: true,
  perMessageDeflate: false,
  httpCompression: false,
});

// Track connected users for analytics
const connectedUsers = new Map();
const unansweredQuestions = [];

// ================= SOCKET.IO CONNECTION HANDLER =================
io.on("connection", (socket) => {
  console.log("🟢 Client connected:", socket.id);
  console.log("📡 Transport:", socket.conn.transport.name);
  
  let currentUserId = null;
  let currentUserRole = null;

  // Handle upgrade to websocket
  socket.on("upgrade", () => {
    console.log("⬆️ Transport upgraded to websocket");
  });

  // ================= USER AUTHENTICATION & ROOM JOINING =================
  socket.on("identify_user", (data) => {
    const { userId, userName, role } = data;
    currentUserId = userId;
    currentUserRole = role;
    
    // Store connection info
    connectedUsers.set(socket.id, { userId, userName, role, connectedAt: new Date() });
    
    // Join appropriate rooms
    socket.join(`user_${userId}`);
    console.log(`👤 User identified: ${userName} (${role}) - ID: ${userId}`);
    
    if (role === "admin") {
      socket.join("admin");
      socket.join("admin_notifications");
      console.log(`🛠️ Admin ${userName} joined admin rooms`);
      
      // Send any pending unanswered questions to new admin
      if (unansweredQuestions.length > 0) {
        socket.emit("unanswered_questions_batch", unansweredQuestions);
      }
    }
    
    socket.emit("identified", { success: true, userId, role });
  });

  // ================= NOTIFICATION ROOMS =================
  socket.on("join:notifications", (userId) => {
    if (userId) {
      socket.join(`user_${userId}`);
      console.log(`📢 User ${userId} joined notification room`);
      socket.emit("joined:notifications", { success: true });
    }
  });

  socket.on("join:admin_notifications", () => {
    socket.join("admin_notifications");
    console.log("📢 Admin joined admin notification room");
    socket.emit("joined:admin_notifications", { success: true });
  });

  // ================= AI CHAT BOT WITH QA DATABASE =================
  socket.on("user_question", async (data) => {
    const { text, userName } = data;
    const questionText = text?.trim();
    
    if (!questionText) {
      socket.emit("bot_reply", {
        text: "Please enter a question so I can help you.",
        timestamp: new Date()
      });
      return;
    }
    
    console.log(`💬 Question from ${userName}: "${questionText.substring(0, 100)}"`);
    
    // Show typing indicator
    socket.emit("bot_typing");
    
    try {
      // Search for answer
      const match = await findBestAnswer(questionText);
      
      let reply;
      let shouldNotifyAdmin = false;
      
      if (match) {
        reply = `🤖 **Answer:**\n\n${match.answer}`;
        console.log(`✅ Found answer for: "${questionText.substring(0, 50)}..."`);
      } else {
        // No match found - create a friendly response
        reply = `📝 **Thanks for your question, ${userName || "there"}!**\n\n"${questionText.substring(0, 100)}${questionText.length > 100 ? '...' : ''}"\n\nI'll make sure our team sees this and gets back to you shortly.\n\n**In the meantime, you can:**\n• 📚 Check our FAQ section\n• 🎓 Browse our course catalog\n• 📞 Contact our support team directly at support@alveoly.com\n\n**Would you like to learn about our programs while you wait?**\n\nIs there anything else I can help with?`;
        shouldNotifyAdmin = true;
        
        // Store unanswered question
        const unansweredQ = {
          id: Date.now(),
          text: questionText,
          userName: userName || "Anonymous",
          socketId: socket.id,
          createdAt: new Date(),
          status: "pending"
        };
        unansweredQuestions.push(unansweredQ);
        
        // Limit to last 100
        while (unansweredQuestions.length > 100) {
          unansweredQuestions.shift();
        }
        
        // Notify admins
        io.to("admin").emit("unanswered_question", unansweredQ);
        io.to("admin_notifications").emit("new_admin_notification", {
          type: "info",
          title: "New Unanswered Question",
          message: `${userName || "Someone"} asked: "${questionText.substring(0, 50)}..."`,
          timestamp: new Date(),
          metadata: unansweredQ
        });
        console.log(`📢 Notified admins about unanswered question from ${userName}`);
      }
      
      // Send response with slight delay for natural feel
      setTimeout(() => {
        socket.emit("bot_reply", {
          text: reply,
          timestamp: new Date(),
          answered: !!match
        });
      }, 800);
      
    } catch (error) {
      console.error("❌ Error processing question:", error);
      socket.emit("bot_reply", {
        text: "😅 I'm having trouble processing your question right now. Please try again in a moment or contact our support team directly at support@alveoly.com.\n\nWe apologize for the inconvenience!",
        timestamp: new Date(),
        error: true
      });
    }
  });

  // ================= ADMIN ANSWER TO STUDENT =================
  socket.on("admin_answer", (data) => {
    const { toSocketId, answer } = data;
    console.log(`📨 Admin answering to socket: ${toSocketId}`);
    
    // Find the unanswered question and mark as answered
    const answeredIndex = unansweredQuestions.findIndex(q => q.socketId === toSocketId);
    if (answeredIndex !== -1) {
      unansweredQuestions[answeredIndex].status = "answered";
      unansweredQuestions[answeredIndex].answeredAt = new Date();
      unansweredQuestions[answeredIndex].answer = answer;
      
      // Notify admins that question was answered
      io.to("admin").emit("question_answered", unansweredQuestions[answeredIndex]);
    }
    
    // Send answer to the student
    io.to(toSocketId).emit("admin_answer_reply", {
      text: answer,
      timestamp: new Date()
    });
    
    // Also send to the specific user's room
    socket.emit("answer_sent", { success: true, toSocketId });
  });

  // ================= QA CACHE MANAGEMENT (Admin) =================
  socket.on("refresh_cache", async () => {
    if (currentUserRole === "admin") {
      await loadQaCache();
      io.to("admin").emit("cache_refreshed", { success: true, count: qaCache.length });
      console.log("🔄 QA Cache refreshed by admin");
    }
  });

  // ================= QA CRUD OPERATIONS (Admin) =================
  socket.on("qa:add", async (data, callback) => {
    if (currentUserRole !== "admin") {
      if (callback) callback({ success: false, message: "Unauthorized" });
      return;
    }
    
    try {
      const { question, answer } = data;
      const newQA = await QA.create({ question, answer });
      await loadQaCache(); // Refresh cache
      
      io.to("admin").emit("qa:updated", { action: "add", qa: newQA });
      if (callback) callback({ success: true, qa: newQA });
    } catch (error) {
      if (callback) callback({ success: false, message: error.message });
    }
  });
  
  socket.on("qa:update", async (data, callback) => {
    if (currentUserRole !== "admin") {
      if (callback) callback({ success: false, message: "Unauthorized" });
      return;
    }
    
    try {
      const { id, question, answer } = data;
      const updated = await QA.findByIdAndUpdate(id, { question, answer, updatedAt: Date.now() }, { new: true });
      await loadQaCache(); // Refresh cache
      
      io.to("admin").emit("qa:updated", { action: "update", qa: updated });
      if (callback) callback({ success: true, qa: updated });
    } catch (error) {
      if (callback) callback({ success: false, message: error.message });
    }
  });
  
  socket.on("qa:delete", async (data, callback) => {
    if (currentUserRole !== "admin") {
      if (callback) callback({ success: false, message: "Unauthorized" });
      return;
    }
    
    try {
      const { id } = data;
      await QA.findByIdAndDelete(id);
      await loadQaCache(); // Refresh cache
      
      io.to("admin").emit("qa:updated", { action: "delete", id });
      if (callback) callback({ success: true });
    } catch (error) {
      if (callback) callback({ success: false, message: error.message });
    }
  });

  // ================= DISCONNECT HANDLING =================
  socket.on("disconnect", (reason) => {
    console.log(`🔴 Client disconnected (${socket.id}):`, reason);
    connectedUsers.delete(socket.id);
  });

  socket.on("error", (err) => {
    console.error("❌ Socket error:", err.message);
  });
  
  socket.on("connect_error", (err) => {
    console.error("❌ Connection error:", err.message);
  });
});

// ================= HELPER FUNCTIONS =================
export const emitNotification = (userId, notification) => {
  io.to(userId.toString()).emit("new_notification", notification);
  io.to(`user_${userId}`).emit("new_notification", notification);
};

export const emitAdminNotification = (notification) => {
  io.to("admin").emit("new_admin_notification", notification);
  io.to("admin_notifications").emit("new_admin_notification", notification);
};

export const emitToRoom = (room, event, data) => {
  io.to(room).emit(event, data);
};

export const emitToAll = (event, data) => {
  io.emit(event, data);
};

// ================= HEALTH CHECK =================
app.get("/", (req, res) => {
  res.status(200).json({ 
    status: "OK", 
    message: "API is running 🚀",
    socket: "Socket.IO server is ready",
    qaCache: { count: qaCache.length, lastUpdate: lastCacheUpdate }
  });
});

// ================= QA ENDPOINTS (REST) =================
app.get("/api/admin/qa/list", async (req, res) => {
  try {
    const list = await QA.find({}).sort({ createdAt: -1 });
    res.json({ ok: true, list });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
});

app.post("/api/admin/qa/add", async (req, res) => {
  try {
    const { question, answer } = req.body;
    const qa = await QA.create({ question, answer });
    await loadQaCache();
    io.to("admin").emit("qa_updated", { action: "add", qa });
    res.json({ ok: true, qa });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
});

app.put("/api/admin/qa/update/:id", async (req, res) => {
  try {
    const { question, answer } = req.body;
    const qa = await QA.findByIdAndUpdate(req.params.id, { question, answer, updatedAt: Date.now() }, { new: true });
    await loadQaCache();
    io.to("admin").emit("qa_updated", { action: "update", qa });
    res.json({ ok: true, qa });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
});

app.delete("/api/admin/qa/delete/:id", async (req, res) => {
  try {
    await QA.findByIdAndDelete(req.params.id);
    await loadQaCache();
    io.to("admin").emit("qa_updated", { action: "delete", id: req.params.id });
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
});

// ================= SOCKET STATUS ENDPOINT =================
app.get("/socket-status", (req, res) => {
  const rooms = {};
  const roomMap = io.sockets.adapter.rooms;
  
  for (const [room, set] of roomMap.entries()) {
    if (!rooms[room]) {
      rooms[room] = set.size;
    }
  }
  
  res.json({
    status: "healthy",
    connections: io.engine.clientsCount,
    transports: ["polling", "websocket"],
    rooms: rooms,
    unansweredCount: unansweredQuestions.filter(q => q.status === "pending").length,
    qaCacheSize: qaCache.length,
    allowedOrigins: allowedOrigins,
  });
});

// ================= CONNECTION STATS ENDPOINT =================
app.get("/socket-stats", (req, res) => {
  const connectedSockets = [];
  const socketMap = io.sockets.sockets;
  
  for (const [id, socket] of socketMap) {
    connectedSockets.push({
      id: id,
      rooms: Array.from(socket.rooms),
      connected: socket.connected
    });
  }
  
  res.json({
    totalConnections: io.engine.clientsCount,
    socketCount: connectedSockets.length,
    connectedUsers: Array.from(connectedUsers.values()).slice(0, 50),
    unansweredQuestions: unansweredQuestions.filter(q => q.status === "pending").slice(0, 20),
  });
});

// ================= GLOBAL ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err.message);
  console.error(err.stack);
  res.status(500).json({ message: err.message || "Internal Server Error" });
});

// ================= START SERVER =================
httpServer.listen(PORT, async () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`🔗 http://localhost:${PORT}`);
  console.log(`📡 Socket.IO server ready`);
  console.log(`✅ Transports: polling, websocket`);
  console.log(`✅ Allowed origins:`, allowedOrigins);
  
  // Initialize QA cache on startup
  await loadQaCache();
  
  console.log(`\n📢 Notification rooms ready:`);
  console.log(`   - User rooms: user_{userId}`);
  console.log(`   - Admin rooms: admin, admin_notifications`);
  console.log(`\n🤖 Bot System Ready:`);
  console.log(`   - QA Cache: ${qaCache.length} entries`);
  console.log(`   - Default answers: ${Object.keys(DEFAULT_ANSWERS).length} topics`);
  console.log(`   - Answer matching: Active`);
  console.log(`\n🌐 API endpoints:`);
  console.log(`   - GET  /                Health check`);
  console.log(`   - GET  /socket-status   Socket.IO status`);
  console.log(`   - GET  /socket-stats    Detailed connection stats`);
  console.log(`   - GET  /api/admin/qa/list  QA Library`);
  console.log(`   - POST /api/admin/qa/add   Add QA`);
  console.log(`   - PUT  /api/admin/qa/update/:id Update QA`);
  console.log(`   - DELETE /api/admin/qa/delete/:id Delete QA`);
});