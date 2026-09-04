// utils/planScheduler.js
import User from "../models/User.js";
import { sendPlanExpiryEmail } from "./emailService.js";
import { createNotification } from "../controllers/notificationController.js";

// ================= CHECK EXPIRED PLANS =================
export const checkExpiredPlans = async () => {
  try {
    const now = new Date();
    
    // Find users with expired plans
    const expiredUsers = await User.find({
      isPlanActive: true,
      planExpiryDate: { $lt: now },
      planId: { $ne: null }
    }).populate("planId");
    
    console.log(`🔍 Found ${expiredUsers.length} users with expired plans`);
    
    for (const user of expiredUsers) {
      // Deactivate plan
      user.isPlanActive = false;
      user.subscriptionStatus = "expired";
      await user.save();
      
      // Send expiry notification email
      if (user.planId) {
        try {
          await sendPlanExpiryEmail(
            user.email,
            user.name,
            user.planId.title,
            user.planExpiryDate
          );
          console.log(`📧 Sent expiry email to ${user.email}`);
        } catch (emailError) {
          console.error(`❌ Failed to send expiry email to ${user.email}:`, emailError.message);
        }
        
        // Send in-app notification
        try {
          await createNotification(
            user._id,
            "student",
            "warning",
            "Plan Expired ⚠️",
            `Your "${user.planId.title}" plan has expired. Please renew to continue accessing content.`,
            "/student/plans",
            { action: "plan_expired", planId: user.planId._id }
          );
        } catch (notifError) {
          console.error(`❌ Failed to send notification to ${user.email}:`, notifError.message);
        }
      }
    }
    
    return { success: true, count: expiredUsers.length };
  } catch (error) {
    console.error("❌ Error checking expired plans:", error);
    return { success: false, error: error.message };
  }
};

// ================= CHECK APPROACHING EXPIRY =================
export const checkApproachingExpiry = async () => {
  try {
    const now = new Date();
    const threeDaysFromNow = new Date(now);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    
    const sevenDaysFromNow = new Date(now);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    
    // Find users with plans expiring in 3-7 days
    const users = await User.find({
      isPlanActive: true,
      planExpiryDate: {
        $gte: threeDaysFromNow,
        $lte: sevenDaysFromNow
      },
      planId: { $ne: null }
    }).populate("planId");
    
    console.log(`🔍 Found ${users.length} users with plans approaching expiry`);
    
    // Send reminder emails
    for (const user of users) {
      try {
        await sendPlanExpiryEmail(
          user.email,
          user.name,
          user.planId.title,
          user.planExpiryDate
        );
        console.log(`📧 Sent reminder email to ${user.email}`);
      } catch (emailError) {
        console.error(`❌ Failed to send reminder email to ${user.email}:`, emailError.message);
      }
      
      // Send in-app notification
      try {
        await createNotification(
          user._id,
          "student",
          "info",
          "Plan Expiring Soon ⏰",
          `Your "${user.planId.title}" plan will expire on ${new Date(user.planExpiryDate).toLocaleDateString()}. Please renew to avoid interruption.`,
          "/student/plans",
          { action: "plan_expiring_soon", planId: user.planId._id }
        );
      } catch (notifError) {
        console.error(`❌ Failed to send notification to ${user.email}:`, notifError.message);
      }
    }
    
    return { success: true, count: users.length };
  } catch (error) {
    console.error("❌ Error checking approaching expiry:", error);
    return { success: false, error: error.message };
  }
};

// ================= CHECK NEWLY EXPIRED PLANS (Daily) =================
export const checkDailyExpiredPlans = async () => {
  try {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Find users whose plans expired today
    const users = await User.find({
      isPlanActive: true,
      planExpiryDate: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      planId: { $ne: null }
    }).populate("planId");
    
    console.log(`🔍 Found ${users.length} users whose plans expired today`);
    
    for (const user of users) {
      // Deactivate plan
      user.isPlanActive = false;
      user.subscriptionStatus = "expired";
      await user.save();
      
      // Send notification
      try {
        await sendPlanExpiryEmail(
          user.email,
          user.name,
          user.planId.title,
          user.planExpiryDate
        );
        console.log(`📧 Sent expiry email to ${user.email}`);
      } catch (emailError) {
        console.error(`❌ Failed to send expiry email to ${user.email}:`, emailError.message);
      }
    }
    
    return { success: true, count: users.length };
  } catch (error) {
    console.error("❌ Error checking daily expired plans:", error);
    return { success: false, error: error.message };
  }
};

export default {
  checkExpiredPlans,
  checkApproachingExpiry,
  checkDailyExpiredPlans
};