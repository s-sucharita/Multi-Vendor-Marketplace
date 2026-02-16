const express = require("express");
const router = express.Router();

const { protect, adminOnly } = require("../middleware/authMiddleware");
const {
  // Vendor Management
  getAllVendors,
  getVendorDetails,
  updateVendorStatus,
  
  // Task Management
  assignTask,
  getAllTasks,
  updateTaskStatus,
  
  // Activity Logs
  getActivityLogs,
  logActivity,
  getDailySummary,
  
  // Performance Goals
  createPerformanceGoal,
  getPerformanceGoals,
  updateGoalProgress,
  
  // Vendor Compliance
  getAllCompliance,
  createComplianceRecord,
  verifyDocument,
  updateComplianceScore,
  
  // Reports
  generateVendorReport,
  getMarketplaceReport,
  getRealtimeProductivity,
  
  // Notifications
  sendNotification,
  getPendingApprovals
} = require("../controllers/adminController");

// All admin routes require authentication and admin role
router.use(protect, adminOnly);

// ==================== VENDOR MANAGEMENT ====================
router.get("/vendors", getAllVendors);
router.get("/vendors/:vendorId", getVendorDetails);
router.put("/vendors/:vendorId/status", updateVendorStatus);

// ==================== TASK MANAGEMENT ====================
router.post("/tasks/assign", assignTask);
router.get("/tasks", getAllTasks);
router.put("/tasks/:taskId/status", updateTaskStatus);

// ==================== ACTIVITY LOGS ====================
router.get("/activity-logs", getActivityLogs);
router.post("/activity-logs", logActivity);
router.get("/activity-logs/daily/:vendorId", getDailySummary);

// ==================== PERFORMANCE GOALS ====================
router.post("/goals", createPerformanceGoal);
router.get("/goals/:vendorId", getPerformanceGoals);
router.put("/goals/:goalId/progress", updateGoalProgress);

// ==================== VENDOR COMPLIANCE ====================
router.get("/compliance", getAllCompliance);
router.post("/compliance", createComplianceRecord);
router.put("/compliance/:recordId/verify", verifyDocument);
router.put("/compliance/:vendorId/score", updateComplianceScore);

// ==================== REPORTS ====================
router.get("/reports/vendor/:vendorId", generateVendorReport);
router.get("/reports/marketplace", getMarketplaceReport);
router.get("/reports/realtime", getRealtimeProductivity);

// custom aggregated report (orders by vendor, revenue) with optional date range
router.get("/reports/custom", require('../controllers/vendorController').getAdminReport);

// ==================== LEAVE MANAGEMENT ====================
router.get('/leaves', require('../controllers/adminController').viewLeaveRequests);
router.put('/leaves/:id', require('../controllers/adminController').reviewLeave);

// ==================== NOTIFICATIONS & APPROVALS ====================
router.post("/notifications/send", sendNotification);
router.get("/pending-approvals", getPendingApprovals);

module.exports = router;
