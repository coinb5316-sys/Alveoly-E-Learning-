// controllers/subjectController.js - UPDATED with programId support
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
        .populate("courseId", "name");
    } else if (program && program !== "undefined" && program !== "null") {
      subjects = await Subject.find({ programId: program })
        .populate("programId", "name code")
        .populate("courseId", "name");
    } else {
      subjects = await Subject.find()
        .populate("programId", "name code")
        .populate("courseId", "name");
    }

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

      return {
        ...subj._doc,
        isUnlocked,
      };
    });

    res.json(formatted);
  } catch (error) {
    console.error("Get Subjects Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ================= CREATE SUBJECT (FIXED - with programId) =================
export const createSubject = async (req, res) => {
  try {
    const { name, programId, courseId, isPaid, price } = req.body;

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

    const subject = await Subject.create({
      name,
      programId,
      courseId,
      isPaid: isPaid || false,
      price: isPaid && price ? Number(price) : 0,
    });

    const populatedSubject = await Subject.findById(subject._id)
      .populate("programId", "name code")
      .populate("courseId", "name");

    io.emit("subject:created", populatedSubject);

    res.status(201).json(populatedSubject);
  } catch (error) {
    console.error("Create Subject Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ================= UPDATE SUBJECT (FIXED) =================
export const updateSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    const { name, programId, courseId, isPaid, price } = req.body;

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

    const updated = await subject.save();

    const populatedUpdated = await Subject.findById(updated._id)
      .populate("programId", "name code")
      .populate("courseId", "name");

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
      .populate("courseId", "name");

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    res.json(subject);
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
        .populate("courseId", "name");
    } else {
      subjects = await Subject.find()
        .populate("programId", "name code")
        .populate("courseId", "name");
    }

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

      return {
        ...subj._doc,
        isUnlocked,
      };
    });

    res.json(formatted);
  } catch (error) {
    console.error("Get Subjects Public Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};