// server/models/Policy.js
import mongoose from "mongoose";

const policySchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      enum: ["editorial", "medical-review", "advertising"],
    },
    title: { type: String, required: true },
    lastUpdated: { type: Date, default: Date.now },
    sections: [
      {
        id: String,
        title: String,
        body: String,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Policy", policySchema);