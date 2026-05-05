// models/Testimonial.js - Fixed
import mongoose from "mongoose";

const testimonialSchema = new mongoose.Schema(
  {
    studentId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",  // Change from "Student" to "User"
      required: true 
    },
    name: { 
      type: String, 
      required: true 
    },
    course: { 
      type: String, 
      required: true 
    },
    rating: { 
      type: Number, 
      required: true, 
      min: 1, 
      max: 5 
    },
    feedback: { 
      type: String, 
      required: true 
    },
    status: { 
      type: String, 
      enum: ["pending", "approved", "rejected"], 
      default: "pending" 
    },
  },
  { timestamps: true }
);

export default mongoose.model("Testimonial", testimonialSchema);