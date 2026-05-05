// controllers/analyticsController.js
import Payment from "../models/Payment.js";
import User from "../models/User.js";
import Question from "../models/Question.js";
import Subject from "../models/Subject.js";

// Helper: Get date range based on timeframe
const getDateRange = (timeframe) => {
  const now = new Date();
  const start = new Date();
  const end = new Date();

  switch (timeframe) {
    case "daily":
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case "weekly":
      const dayOfWeek = now.getDay();
      start.setDate(now.getDate() - dayOfWeek);
      start.setHours(0, 0, 0, 0);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      break;
    case "monthly":
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(now.getMonth() + 1);
      end.setDate(0);
      end.setHours(23, 59, 59, 999);
      break;
    case "yearly":
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(11, 31);
      end.setHours(23, 59, 59, 999);
      break;
    default:
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(now.getMonth() + 1);
      end.setDate(0);
      end.setHours(23, 59, 59, 999);
  }

  return { start, end };
};

// Helper: Format date for display
const formatDate = (date, timeframe) => {
  switch (timeframe) {
    case "daily":
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    case "weekly":
      return date.toLocaleDateString([], { weekday: 'short' });
    case "monthly":
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    case "yearly":
      return date.toLocaleDateString([], { month: 'short', year: 'numeric' });
    default:
      return date.toLocaleDateString();
  }
};

// ================= GET DASHBOARD STATS =================
export const getDashboardStats = async (req, res) => {
  try {
    const { timeframe = "monthly" } = req.query;
    const { start, end } = getDateRange(timeframe);

    // Total stats
    const totalUsers = await User.countDocuments();
    const totalQuestions = await Question.countDocuments();
    const totalSubjects = await Subject.countDocuments();
    const totalRevenue = await Payment.aggregate([
      { $match: { status: "success" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    // Revenue trend data
    const revenueTrend = await Payment.aggregate([
      {
        $match: {
          status: "success",
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: {
            date: timeframe === "yearly" 
              ? { $dateToString: { format: "%Y-%m", date: "$createdAt" } }
              : { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
          },
          revenue: { $sum: "$amount" }
        }
      },
      { $sort: { "_id.date": 1 } }
    ]);

    // User growth data
    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: {
            date: timeframe === "yearly"
              ? { $dateToString: { format: "%Y-%m", date: "$createdAt" } }
              : { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.date": 1 } }
    ]);

    // User distribution (active vs inactive)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const activeUsers = await User.countDocuments({
      lastLoginAt: { $gte: thirtyDaysAgo }
    });
    
    const inactiveUsers = totalUsers - activeUsers;
    const activePercentage = totalUsers ? (activeUsers / totalUsers) * 100 : 0;

    // Recent activity
    const recentPayments = await Payment.find({ status: "success" })
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .limit(5);

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5);

    const recentActivities = [
      ...recentPayments.map(p => ({
        id: p._id,
        type: "payment",
        action: "Payment received",
        user: p.userId?.name || "Unknown",
        amount: p.amount,
        time: p.createdAt,
        icon: "CreditCard"
      })),
      ...recentUsers.map(u => ({
        id: u._id,
        type: "user",
        action: "New user registered",
        user: u.name,
        time: u.createdAt,
        icon: "UserPlus"
      }))
    ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);

    // Format chart data
    const revenueChartData = revenueTrend.map(item => ({
      name: item._id.date,
      revenue: item.revenue
    }));

    const userGrowthChartData = [];
    const userMap = {};
    userGrowth.forEach(item => {
      userMap[item._id.date] = item.count;
    });

    // Generate all dates in range
    let currentDate = new Date(start);
    while (currentDate <= end) {
      const dateKey = timeframe === "yearly"
        ? `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
        : currentDate.toISOString().split('T')[0];
      
      userGrowthChartData.push({
        name: formatDate(currentDate, timeframe),
        users: userMap[dateKey] || 0
      });
      
      if (timeframe === "yearly") {
        currentDate.setMonth(currentDate.getMonth() + 1);
      } else {
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalQuestions,
        totalRevenue: totalRevenue[0]?.total || 0,
        totalSubjects
      },
      charts: {
        revenue: revenueChartData,
        userGrowth: userGrowthChartData,
        userDistribution: {
          active: activeUsers,
          inactive: inactiveUsers,
          activePercentage: Math.round(activePercentage)
        }
      },
      recentActivities
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ message: "Failed to fetch dashboard stats", error: error.message });
  }
};

// ================= GET DETAILED ANALYTICS =================
export const getDetailedAnalytics = async (req, res) => {
  try {
    const { timeframe = "monthly" } = req.query;
    const { start, end } = getDateRange(timeframe);

    // Revenue by source (plan vs subject)
    const revenueBySource = await Payment.aggregate([
      {
        $match: {
          status: "success",
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: {
            type: { $cond: [{ $ifNull: ["$planId", false] }, "plan", "subject"] }
          },
          revenue: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      }
    ]);

    // Top performing subjects
    const topSubjects = await Payment.aggregate([
      {
        $match: {
          status: "success",
          subjectId: { $exists: true, $ne: null },
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $lookup: {
          from: "subjects",
          localField: "subjectId",
          foreignField: "_id",
          as: "subject"
        }
      },
      { $unwind: "$subject" },
      {
        $group: {
          _id: "$subjectId",
          name: { $first: "$subject.name" },
          revenue: { $sum: "$amount" },
          purchases: { $sum: 1 }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      data: {
        revenueBySource,
        topSubjects
      }
    });
  } catch (error) {
    console.error("Detailed analytics error:", error);
    res.status(500).json({ message: "Failed to fetch analytics", error: error.message });
  }
};