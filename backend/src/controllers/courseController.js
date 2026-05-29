import Course from "../models/Course.js";
import Program from "../models/Program.js";
import { io } from "../../server.js";

// GET ALL COURSES (with program populated)
export const getCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate("programId", "name code")
      .sort({ createdAt: -1 });
    res.json(courses);
  } catch (error) {
    console.error("Get Courses Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// GET COURSES BY PROGRAM (WITH PROPER ERROR HANDLING)
export const getCoursesByProgram = async (req, res) => {
  try {
    const { programId } = req.params;
    
    if (!programId || programId === "undefined" || programId === "null") {
      return res.status(400).json({ message: "Invalid program ID" });
    }
    
    console.log(`Fetching courses for program: ${programId}`);
    
    const courses = await Course.find({ programId })
      .populate("programId", "name code")
      .sort({ createdAt: -1 });
    
    console.log(`Found ${courses.length} courses for program ${programId}`);
    
    // Always return an array, even if empty
    res.json(courses || []);
  } catch (error) {
    console.error("Get Courses By Program Error:", error);
    // Return empty array on error instead of error response
    res.json([]);
  }
};
// CREATE COURSE
export const createCourse = async (req, res) => {
  try {
    const { name, programId } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Course name is required" });
    }

    if (!programId) {
      return res.status(400).json({ message: "Program is required" });
    }

    // Verify program exists
    const program = await Program.findById(programId);
    if (!program) {
      return res.status(400).json({ message: "Invalid program selected" });
    }

    const course = await Course.create({
      name,
      programId,
      createdBy: req.user.id,
    });

    const populatedCourse = await Course.findById(course._id).populate("programId", "name code");

    io.emit("course:created", populatedCourse);

    res.status(201).json(populatedCourse);
  } catch (error) {
    console.error("Create Course Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// UPDATE COURSE
export const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (req.body.programId) {
      const program = await Program.findById(req.body.programId);
      if (!program) {
        return res.status(400).json({ message: "Invalid program selected" });
      }
      course.programId = req.body.programId;
    }

    course.name = req.body.name || course.name;
    const updated = await course.save();

    const populatedUpdated = await Course.findById(updated._id).populate("programId", "name code");

    io.emit("course:updated", populatedUpdated);

    res.json(populatedUpdated);
  } catch (error) {
    console.error("Update Course Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// DELETE COURSE
export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    io.emit("course:deleted", req.params.id);

    res.json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("Delete Course Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// GET COURSES BY PROGRAM - PUBLIC (NO AUTH REQUIRED)
export const getPublicCoursesByProgram = async (req, res) => {
  try {
    const { programId } = req.params;
    
    console.log(`[PUBLIC] Fetching courses for program: ${programId}`);
    
    if (!programId || programId === "undefined" || programId === "null" || programId === "") {
      return res.status(400).json({ message: "Invalid program ID" });
    }
    
    const courses = await Course.find({ programId })
      .select("name _id")  // Only return what's needed
      .sort({ createdAt: -1 });
    
    console.log(`[PUBLIC] Found ${courses.length} courses for program ${programId}`);
    
    res.json(courses || []);
  } catch (error) {
    console.error("Get Public Courses By Program Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Add this to your courseController.js file
export const getPublicCourses = async (req, res) => {
  try {
    // Only return essential fields for public view
    const courses = await Course.find()
      .populate("programId", "name code")
      .select("name programId")
      .sort({ createdAt: -1 });
    res.json(courses);
  } catch (error) {
    console.error("Get Public Courses Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};