// utils/planScheduler.js
import User from "../models/User.js";
import { sendPlanExpiryEmail } from "./emailService.js";

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
    
    console.log(`Found ${expiredUsers.length} users with expired plans`);
    
    for (const user of expiredUsers) {
      // Deactivate plan
      user.isPlanActive = false;
      user.subscriptionStatus = "expired";
      await user.save();
      
      // Send expiry notification email
      if (user.planId) {
        await sendPlanExpiryEmail(
          user.email,
          user.name,
          user.planId.title,
          user.planExpiryDate
        );
        console.log(`📧 Sent expiry email to ${user.email}`);
      }
    }
    
    return { success: true, count: expiredUsers.length };
  } catch (error) {
    console.error("Error checking expired plans:", error);
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
    
    console.log(`Found ${users.length} users with plans approaching expiry`);
    
    // Send reminder emails
    for (const user of users) {
      await sendPlanExpiryEmail(
        user.email,
        user.name,
        user.planId.title,
        user.planExpiryDate
      );
      console.log(`📧 Sent reminder email to ${user.email}`);
    }
    
    return { success: true, count: users.length };
  } catch (error) {
    console.error("Error checking approaching expiry:", error);
    return { success: false, error: error.message };
  }
};