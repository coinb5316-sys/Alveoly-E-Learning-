import Program from "../models/Program.js";
import Course from "../models/Course.js";
import { io } from "../../server.js";

// ================= GET ALL PROGRAMS =================
export const getPrograms = async (req, res) => {
  try {
    const programs = await Program.find().sort({ createdAt: -1 });
    res.json(programs);
  } catch (error) {
    console.error("Get Programs Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ================= GET SINGLE PROGRAM =================
export const getProgramById = async (req, res) => {
  try {
    const program = await Program.findById(req.params.id);
    if (!program) {
      return res.status(404).json({ message: "Program not found" });
    }
    res.json(program);
  } catch (error) {
    console.error("Get Program Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ================= CREATE PROGRAM =================
export const createProgram = async (req, res) => {
  try {
    const { name, description, code } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Program name is required" });
    }

    // Check for duplicate name
    const existingProgram = await Program.findOne({ name });
    if (existingProgram) {
      return res.status(400).json({ message: "Program name already exists" });
    }

    const program = await Program.create({
      name,
      description: description || "",
      code: code || `PRG-${Date.now()}`,
      createdBy: req.user.id,
    });

    io.emit("program:created", program);

    res.status(201).json(program);
  } catch (error) {
    console.error("Create Program Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ================= UPDATE PROGRAM =================
export const updateProgram = async (req, res) => {
  try {
    const program = await Program.findById(req.params.id);
    if (!program) {
      return res.status(404).json({ message: "Program not found" });
    }

    // Check for duplicate name (excluding current program)
    if (req.body.name && req.body.name !== program.name) {
      const existingProgram = await Program.findOne({ name: req.body.name });
      if (existingProgram) {
        return res.status(400).json({ message: "Program name already exists" });
      }
    }

    program.name = req.body.name || program.name;
    program.description = req.body.description !== undefined ? req.body.description : program.description;
    program.code = req.body.code || program.code;
    program.isActive = req.body.isActive !== undefined ? req.body.isActive : program.isActive;

    const updated = await program.save();

    io.emit("program:updated", updated);

    res.json(updated);
  } catch (error) {
    console.error("Update Program Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ================= DELETE PROGRAM =================
export const deleteProgram = async (req, res) => {
  try {
    const program = await Program.findById(req.params.id);

    if (!program) {
      return res.status(404).json({ message: "Program not found" });
    }

    // Check if program has associated courses
    const coursesCount = await Course.countDocuments({ programId: req.params.id });
    if (coursesCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete program. It has ${coursesCount} course(s) associated.` 
      });
    }

    await program.deleteOne();

    io.emit("program:deleted", req.params.id);

    res.json({ message: "Program deleted successfully" });
  } catch (error) {
    console.error("Delete Program Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};