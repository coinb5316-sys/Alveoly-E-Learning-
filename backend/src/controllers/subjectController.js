// controllers/subjectController.js - UPDATED with topic support
import Subject from "../models/Subject.js";
import Course from "../models/Course.js";
import Program from "../models/Program.js";
import Payment from "../models/Payment.js";
import Plan from "../models/Plan.js";
import ManualAccess from "../models/ManualAccess.js";
import { io } from "../../server.js";

// ================= GET SUBJECTS =================
export const getSubjects = async (req, res) => {
  try {
    const userId = req.user?._id;
    const course = req.query.course;
    const program = req.query.program;

    let subjects;

    // FILTER
    if (course && course !== "undefined" && course !== "null") {
      subjects = await Subject.find({ courseId: course })
        .populate("programId", "name code")
        .populate("courseId", "name")
        .select("+topics"); // Include topics
    } else if (program && program !== "undefined" && program !== "null") {
      subjects = await Subject.find({ programId: program })
        .populate("programId", "name code")
        .populate("courseId", "name")
        .select("+topics");
    } else {
      subjects = await Subject.find()
        .populate("programId", "name code")
        .populate("courseId", "name")
        .select("+topics");
    }

    // ... rest of the function remains the same
    let activePlanSubjects = [];
    let purchasedSubjects = [];
    let manualSubjects = [];

    if (userId) {
      const now = new Date();

      const planPayment = await Payment.findOne({
        userId,
        planId: { $ne: null },
        status: "success",
        expiresAt: { $gt: now },
      }).populate({
        path: "planId",
        populate: { path: "subjects", select: "_id" },
      });

      if (planPayment?.planId) {
        activePlanSubjects = planPayment.planId.subjects.map((s) =>
          s._id.toString()
        );
      }

      const subjectPayments = await Payment.find({
        userId,
        subjectId: { $ne: null },
        status: "success",
        expiresAt: { $gt: now },
      });

      purchasedSubjects = subjectPayments.map((p) =>
        p.subjectId.toString()
      );

      const manualAccess = await ManualAccess.find({
        userId,
        status: "active",
        expiresAt: { $gt: now },
      });
      manualSubjects = manualAccess.map((m) =>
        m.subjectId.toString()
      );
    }

    const formatted = subjects.map((subj) => {
      const subjectIdStr = subj._id.toString();
      let isUnlocked = !subj.isPaid;

      if (subj.isPaid && userId) {
        const hasPlan = activePlanSubjects.includes(subjectIdStr);
        const hasPurchase = purchasedSubjects.includes(subjectIdStr);
        const hasManual = manualSubjects.includes(subjectIdStr);
        isUnlocked = hasPlan || hasPurchase || hasManual;
      }

      // Sort topics by order
      const sortedTopics = subj.topics ? 
        [...subj.topics].sort((a, b) => (a.order || 0) - (b.order || 0)) : 
        [];

      return {
        ...subj._doc,
        isUnlocked,
        topics: sortedTopics,
        topicCount: sortedTopics.length,
      };
    });

    res.json(formatted);
  } catch (error) {
    console.error("Get Subjects Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ================= CREATE SUBJECT =================
export const createSubject = async (req, res) => {
  try {
    const { name, programId, courseId, isPaid, price, topics } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Subject name is required" });
    }

    if (!programId) {
      return res.status(400).json({ message: "Program is required" });
    }

    if (!courseId) {
      return res.status(400).json({ message: "Course is required" });
    }

    // Verify program exists
    const programExists = await Program.findById(programId);
    if (!programExists || programExists.isActive === false) {
      return res.status(400).json({ message: "Invalid or inactive program selected" });
    }

    // Verify course exists and belongs to the program
    const courseExists = await Course.findById(courseId);
    if (!courseExists) {
      return res.status(400).json({ message: "Invalid course selected" });
    }

    // Check if course belongs to selected program
    if (courseExists.programId.toString() !== programId) {
      return res.status(400).json({ 
        message: "Selected course does not belong to the selected program" 
      });
    }

    // Process topics if provided
    let processedTopics = [];
    if (topics && Array.isArray(topics)) {
      processedTopics = topics.map((topic, index) => ({
        name: topic.name,
        description: topic.description || "",
        order: topic.order !== undefined ? topic.order : index,
        isActive: topic.isActive !== undefined ? topic.isActive : true,
      }));
    }

    const subject = await Subject.create({
      name,
      programId,
      courseId,
      isPaid: isPaid || false,
      price: isPaid && price ? Number(price) : 0,
      topics: processedTopics,
    });

    const populatedSubject = await Subject.findById(subject._id)
      .populate("programId", "name code")
      .populate("courseId", "name")
      .select("+topics");

    io.emit("subject:created", populatedSubject);

    res.status(201).json(populatedSubject);
  } catch (error) {
    console.error("Create Subject Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ================= UPDATE SUBJECT =================
export const updateSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    const { name, programId, courseId, isPaid, price, topics } = req.body;

    if (name) subject.name = name;
    
    if (programId) {
      const programExists = await Program.findById(programId);
      if (!programExists || programExists.isActive === false) {
        return res.status(400).json({ message: "Invalid or inactive program selected" });
      }
      subject.programId = programId;
    }
    
    if (courseId) {
      const courseExists = await Course.findById(courseId);
      if (!courseExists) {
        return res.status(400).json({ message: "Invalid course selected" });
      }
      
      // If programId is also being updated or check current program
      const checkProgramId = programId || subject.programId;
      if (courseExists.programId.toString() !== checkProgramId) {
        return res.status(400).json({ 
          message: "Selected course does not belong to the selected program" 
        });
      }
      subject.courseId = courseId;
    }
    
    if (isPaid !== undefined) subject.isPaid = isPaid;
    if (price !== undefined && isPaid) subject.price = Number(price);
    if (price !== undefined && !isPaid) subject.price = 0;

    // Update topics if provided
    if (topics && Array.isArray(topics)) {
      subject.topics = topics.map((topic, index) => ({
        name: topic.name,
        description: topic.description || "",
        order: topic.order !== undefined ? topic.order : index,
        isActive: topic.isActive !== undefined ? topic.isActive : true,
        _id: topic._id || new mongoose.Types.ObjectId(), // Preserve existing IDs if provided
      }));
    }

    const updated = await subject.save();

    const populatedUpdated = await Subject.findById(updated._id)
      .populate("programId", "name code")
      .populate("courseId", "name")
      .select("+topics");

    io.emit("subject:updated", populatedUpdated);

    res.json(populatedUpdated);
  } catch (error) {
    console.error("Update Subject Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ================= GET SINGLE SUBJECT =================
export const getSubjectById = async (req, res) => {
  try {
    const subjectId = req.params.subjectId;
    const subject = await Subject.findById(subjectId)
      .populate("programId", "name code")
      .populate("courseId", "name")
      .select("+topics");

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    // Sort topics by order
    const sortedTopics = subject.topics ? 
      [...subject.topics].sort((a, b) => (a.order || 0) - (b.order || 0)) : 
      [];

    const response = {
      ...subject._doc,
      topics: sortedTopics,
      topicCount: sortedTopics.length,
    };

    res.json(response);
  } catch (err) {
    console.error("Get Subject By ID Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= DELETE SUBJECT =================
export const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    await subject.deleteOne();
    io.emit("subject:deleted", req.params.id);
    res.json({ message: "Subject deleted successfully" });
  } catch (error) {
    console.error("Delete Subject Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ================= GET SUBJECTS PUBLIC =================
export const getSubjectsPublic = async (req, res) => {
  try {
    const userId = req.user?._id;
    const course = req.query.course;

    let subjects;
    if (course && course !== "undefined" && course !== "null") {
      subjects = await Subject.find({ courseId: course })
        .populate("programId", "name code")
        .populate("courseId", "name")
        .select("+topics");
    } else {
      subjects = await Subject.find()
        .populate("programId", "name code")
        .populate("courseId", "name")
        .select("+topics");
    }

    // ... rest of the function remains the same
    let activePlanSubjects = [];
    let purchasedSubjects = [];
    let manualSubjects = [];

    if (userId) {
      const now = new Date();
      const planPayment = await Payment.findOne({
        userId,
        planId: { $ne: null },
        status: "success",
        expiresAt: { $gt: now },
      }).populate({
        path: "planId",
        populate: { path: "subjects", select: "_id" },
      });

      if (planPayment?.planId) {
        activePlanSubjects = planPayment.planId.subjects.map((s) =>
          s._id.toString()
        );
      }

      const subjectPayments = await Payment.find({
        userId,
        subjectId: { $ne: null },
        status: "success",
        expiresAt: { $gt: now },
      });
      purchasedSubjects = subjectPayments.map((p) =>
        p.subjectId.toString()
      );

      const manualAccess = await ManualAccess.find({
        userId,
        status: "active",
        expiresAt: { $gt: now },
      });
      manualSubjects = manualAccess.map((m) =>
        m.subjectId.toString()
      );
    }

    const formatted = subjects.map((subj) => {
      const subjectIdStr = subj._id.toString();
      let isUnlocked = !subj.isPaid;

      if (subj.isPaid && userId) {
        const hasPlan = activePlanSubjects.includes(subjectIdStr);
        const hasPurchase = purchasedSubjects.includes(subjectIdStr);
        const hasManual = manualSubjects.includes(subjectIdStr);
        isUnlocked = hasPlan || hasPurchase || hasManual;
      }

      // Sort topics by order
      const sortedTopics = subj.topics ? 
        [...subj.topics].sort((a, b) => (a.order || 0) - (b.order || 0)) : 
        [];

      return {
        ...subj._doc,
        isUnlocked,
        topics: sortedTopics,
        topicCount: sortedTopics.length,
      };
    });

    res.json(formatted);
  } catch (error) {
    console.error("Get Subjects Public Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ================= TOPIC MANAGEMENT FUNCTIONS =================

// Add a topic to a subject
export const addTopic = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { name, description, order } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Topic name is required" });
    }

    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    const newTopic = {
      name,
      description: description || "",
      order: order !== undefined ? order : subject.topics.length,
      isActive: true,
    };

    subject.topics.push(newTopic);
    await subject.save();

    const updatedSubject = await Subject.findById(subjectId)
      .populate("programId", "name code")
      .populate("courseId", "name")
      .select("+topics");

    io.emit("subject:updated", updatedSubject);
    res.status(201).json(updatedSubject);
  } catch (error) {
    console.error("Add Topic Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Remove a topic from a subject
export const removeTopic = async (req, res) => {
  try {
    const { subjectId, topicId } = req.params;

    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    subject.topics = subject.topics.filter(
      topic => topic._id.toString() !== topicId
    );

    await subject.save();

    const updatedSubject = await Subject.findById(subjectId)
      .populate("programId", "name code")
      .populate("courseId", "name")
      .select("+topics");

    io.emit("subject:updated", updatedSubject);
    res.json(updatedSubject);
  } catch (error) {
    console.error("Remove Topic Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Update a topic
export const updateTopic = async (req, res) => {
  try {
    const { subjectId, topicId } = req.params;
    const { name, description, order, isActive } = req.body;

    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    const topic = subject.topics.id(topicId);
    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    if (name !== undefined) topic.name = name;
    if (description !== undefined) topic.description = description;
    if (order !== undefined) topic.order = order;
    if (isActive !== undefined) topic.isActive = isActive;

    await subject.save();

    const updatedSubject = await Subject.findById(subjectId)
      .populate("programId", "name code")
      .populate("courseId", "name")
      .select("+topics");

    io.emit("subject:updated", updatedSubject);
    res.json(updatedSubject);
  } catch (error) {
    console.error("Update Topic Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};