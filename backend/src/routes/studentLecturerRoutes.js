// routes/studentLecturerRoutes.js - NEW FILE
import express from "express";
import {
  getAvailableContent,
  getContentDetails,
  startAttempt,
  submitAttempt,
  getMyAttempts,
  getAttemptDetails,
} from "../controllers/studentLecturerController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.use((req, res, next) => {
  if (req.user.role !== "student") {
    return res.status(403).json({ message: "Access denied. Student only." });
  }
  next();
});

router.get("/content", getAvailableContent);
router.get("/content/:id", getContentDetails);
router.post("/content/:id/start", startAttempt);
router.post("/attempts/:attemptId/submit", submitAttempt);
router.get("/my-attempts", getMyAttempts);
router.get("/attempts/:attemptId", getAttemptDetails);

export default router;