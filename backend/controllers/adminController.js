const User = require("../models/User");
const AdminTask = require("../models/AdminTask");
const ActivityLog = require("../models/ActivityLog");
const PerformanceGoal = require("../models/PerformanceGoal");
const VendorCompliance = require("../models/VendorCompliance");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Notification = require("../models/Notification");

// ==================== VENDOR MANAGEMENT ====================

// Get all vendors
exports.getAllVendors = async (req, res) => {
  try {
    const vendors = await User.find({ role: "vendor" }).select("-password");
    res.json(vendors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get vendor details
exports.getVendorDetails = async (req, res) => {
  try {
    const vendor = await User.findById(req.params.vendorId).select("-password");
    if (!vendor || vendor.role !== "vendor") {
      return res.status(404).json({ message: "Vendor not found" });
    }
    res.json(vendor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update vendor status (approve/suspend)
exports.updateVendorStatus = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { status } = req.body; // active, suspended, pending, rejected

    const vendor = await User.findByIdAndUpdate(
      vendorId,
      { status },
      { new: true }
    ).select("-password");

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    // Send notification to vendor
    await Notification.create({
      userId: vendorId,
      title: `Account ${status}`,
      message: `Your account status has been updated to ${status}`,
      type: "admin-action"
    });

    res.json({ message: `Vendor status updated to ${status}`, vendor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== TASK MANAGEMENT ====================

// Assign task to vendor
exports.assignTask = async (req, res) => {
  try {
    const { vendorId, title, description, deadline, priority, category } = req.body;

    const task = await AdminTask.create({
      vendorId,
      title,
      description,
      deadline,
      priority,
      category,
      assignedBy: req.user.id
    });

    // Send notification to vendor
    await Notification.create({
      userId: vendorId,
      title: `New Task: ${title}`,
      message: description,
      type: "task-assigned"
    });

    res.status(201).json({ message: "Task assigned successfully", task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all tasks (with filters)
exports.getAllTasks = async (req, res) => {
  try {
    const { vendorId, status } = req.query;
    let filter = {};

    if (vendorId) filter.vendorId = vendorId;
    if (status) filter.status = status;

    const tasks = await AdminTask.find(filter)
      .populate("vendorId", "name email businessName")
      .populate("assignedBy", "name");

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update task status
exports.updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status, notes } = req.body;

    const task = await AdminTask.findByIdAndUpdate(
      taskId,
      {
        status,
        notes,
        completionDate: status === "completed" ? new Date() : null
      },
      { new: true }
    ).populate("vendorId", "name email");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task updated successfully", task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== ACTIVITY LOGS ====================

// Get vendor activity logs
exports.getActivityLogs = async (req, res) => {
  try {
    const { vendorId, action, days = 7 } = req.query;
    let filter = {};

    if (vendorId) filter.userId = vendorId;
    if (action) filter.action = action;

    // Get logs from last N days
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    filter.createdAt = { $gte: startDate };

    const logs = await ActivityLog.find(filter)
      .populate("userId", "name email businessName")
      .sort({ createdAt: -1 });

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Log vendor activity
exports.logActivity = async (req, res) => {
  try {
    const { userId, action, description, metadata } = req.body;

    const log = await ActivityLog.create({
      userId,
      action,
      description,
      metadata,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.status(201).json({ message: "Activity logged", log });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get daily summary for vendor
exports.getDailySummary = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Count orders processed today
    const ordersProcessed = await Order.countDocuments({
      vendorId,
      createdAt: { $gte: today, $lt: tomorrow }
    });

    // Count products listed today
    const productsListed = await Product.countDocuments({
      vendorId,
      createdAt: { $gte: today, $lt: tomorrow }
    });

    // Get activity logs for today
    const activityLogs = await ActivityLog.find({
      userId: vendorId,
      createdAt: { $gte: today, $lt: tomorrow }
    });

    res.json({
      date: today,
      ordersProcessed,
      productsListed,
      activityCount: activityLogs.length,
      activities: activityLogs
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get global daily overview (orders/products/activities across marketplace)
exports.getDailyOverview = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const ordersProcessed = await Order.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow }
    });
    const productsListed = await Product.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow }
    });
    const activityLogs = await ActivityLog.find({
      createdAt: { $gte: today, $lt: tomorrow }
    }).populate("userId", "name businessName email");

    res.json({
      date: today,
      ordersProcessed,
      productsListed,
      activityCount: activityLogs.length,
      activities: activityLogs
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== PERFORMANCE GOALS ====================

// Create performance goal
exports.createPerformanceGoal = async (req, res) => {
  try {
    const { vendorId, goalType, targetValue, unit, deadline, description, reward } = req.body;

    const goal = await PerformanceGoal.create({
      vendorId,
      goalType,
      targetValue,
      unit,
      startDate: new Date(),
      deadline,
      description,
      reward
    });

    // Notify vendor
    await Notification.create({
      userId: vendorId,
      title: `New Performance Goal: ${goalType}`,
      message: `Target: ${targetValue} ${unit}. Deadline: ${new Date(deadline).toLocaleDateString()}`,
      type: "goal-assigned"
    });

    res.status(201).json({ message: "Performance goal created", goal });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get performance goals for vendor
exports.getPerformanceGoals = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const goals = await PerformanceGoal.find({ vendorId });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update goal progress
exports.updateGoalProgress = async (req, res) => {
  try {
    const { goalId } = req.params;
    const { currentValue } = req.body;

    const goal = await PerformanceGoal.findByIdAndUpdate(
      goalId,
      { currentValue },
      { new: true }
    );

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    // Check if goal is completed
    if (currentValue >= goal.targetValue && goal.status === "active") {
      goal.status = "completed";
      goal.completionDate = new Date();
      await goal.save();

      await Notification.create({
        userId: goal.vendorId,
        title: "Goal Completed! 🎉",
        message: `Congratulations! You've achieved the ${goal.goalType} goal. Reward: ${goal.reward}`,
        type: "goal-completed"
      });
    }

    res.json({ message: "Goal progress updated", goal });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== VENDOR COMPLIANCE ====================

// Get all compliance records
exports.getAllCompliance = async (req, res) => {
  try {
    const { vendorId, documentStatus } = req.query;
    let filter = {};

    if (vendorId) filter.vendorId = vendorId;
    if (documentStatus) filter.documentStatus = documentStatus;

    const compliance = await VendorCompliance.find(filter)
      .populate("vendorId", "name email businessName")
      .populate("verifiedBy", "name");

    res.json(compliance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create compliance record
exports.createComplianceRecord = async (req, res) => {
  try {
    const { vendorId, documentType, documentUrl, expiryDate } = req.body;

    const record = await VendorCompliance.create({
      vendorId,
      documentType,
      documentUrl,
      expiryDate,
      submissionDate: new Date()
    });

    await Notification.create({
      userId: vendorId,
      title: "Document Submission Received",
      message: `Your ${documentType} document has been received and is pending verification.`,
      type: "compliance-update"
    });

    res.status(201).json({ message: "Compliance record created", record });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verify document
exports.verifyDocument = async (req, res) => {
  try {
    const { recordId } = req.params;
    const { documentStatus, rejectionReason } = req.body;

    const record = await VendorCompliance.findByIdAndUpdate(
      recordId,
      {
        documentStatus,
        rejectionReason,
        verificationDate: new Date(),
        verifiedBy: req.user.id
      },
      { new: true }
    ).populate("vendorId", "name email");

    if (!record) {
      return res.status(404).json({ message: "Record not found" });
    }

    // Notify vendor
    const message = documentStatus === "verified"
      ? "Your document has been verified successfully!"
      : `Your document was rejected. Reason: ${rejectionReason}`;

    await Notification.create({
      userId: record.vendorId._id,
      title: `Document ${documentStatus}`,
      message,
      type: "compliance-update"
    });

    res.json({ message: "Document verified", record });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update compliance score
exports.updateComplianceScore = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { complianceScore, status } = req.body;

    const result = await VendorCompliance.findOneAndUpdate(
      { vendorId },
      { complianceScore, status },
      { new: true }
    );

    res.json({ message: "Compliance score updated", result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== PERFORMANCE REPORTS ====================

// Generate vendor performance report
exports.generateVendorReport = async (req, res) => {
  try {
    const { vendorId, days = 30 } = req.query;

    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const vendor = await User.findById(vendorId);
    if (!vendor || vendor.role !== "vendor") {
      return res.status(404).json({ message: "Vendor not found" });
    }

    // Get metrics
    const ordersProcessed = await Order.countDocuments({
      vendorId,
      createdAt: { $gte: startDate }
    });

    const productsListed = await Product.countDocuments({
      vendorId,
      createdAt: { $gte: startDate }
    });

    const goalCompletion = await PerformanceGoal.countDocuments({
      vendorId,
      status: "completed"
    });

    const activities = await ActivityLog.countDocuments({
      userId: vendorId,
      createdAt: { $gte: startDate }
    });

    const complianceRecords = await VendorCompliance.find({ vendorId });
    const complianceScore = complianceRecords.length > 0
      ? (complianceRecords.reduce((sum, r) => sum + (r.complianceScore || 0), 0) / complianceRecords.length)
      : 0;

    const report = {
      vendorId,
      vendorName: vendor.name,
      businessName: vendor.businessName,
      reportPeriod: `Last ${days} days`,
      generatedAt: new Date(),
      metrics: {
        ordersProcessed,
        productsListed,
        goalsCompleted: goalCompletion,
        totalActivities: activities,
        averageRating: vendor.averageRating,
        totalReviews: vendor.totalReviews,
        complianceScore: complianceScore.toFixed(2)
      }
    };

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get marketplace overview report
exports.getMarketplaceReport = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const totalVendors = await User.countDocuments({ role: "vendor" });
    const activeVendors = await User.countDocuments({
      role: "vendor",
      status: "active"
    });

    const totalOrders = await Order.countDocuments({
      createdAt: { $gte: startDate }
    });

    const totalProducts = await Product.countDocuments({
      createdAt: { $gte: startDate }
    });

    const pendingCompliance = await VendorCompliance.countDocuments({
      documentStatus: "pending"
    });

    const overdueTasks = await AdminTask.countDocuments({
      status: "overdue",
      deadline: { $lt: new Date() }
    });

    const report = {
      generatedAt: new Date(),
      period: `Last ${days} days`,
      summary: {
        totalVendors,
        activeVendors,
        inactiveVendors: totalVendors - activeVendors,
        totalOrders,
        totalProductsListed: totalProducts,
        pendingComplianceReviews: pendingCompliance,
        overdueTasks
      }
    };

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRealtimeProductivity = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0,0,0,0);

    const ordersToday = await Order.countDocuments({ createdAt: { $gte: today }});
    const productsToday = await Product.countDocuments({ createdAt: { $gte: today }});
    const activitiesToday = await ActivityLog.countDocuments({ createdAt: { $gte: today }});

    res.json({
      ordersToday,
      productsToday,
      activitiesToday
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};


// ==================== LEAVE MANAGEMENT ====================
exports.viewLeaveRequests = async (req,res)=>{
  try{
    const { status } = req.query;
    let filter = {};
    if(status) filter.status = status;
    const leaves = await require('../models/LeaveRequest').find(filter)
      .populate('user','name email role')
      .populate('vendor','name');
    res.json(leaves);
  }catch(err){res.status(500).json({message:err.message});}
};

exports.reviewLeave = async (req,res)=>{
  try{
    const { id } = req.params;
    const { status } = req.body; // approved/rejected/cancelled
    const leave = await require('../models/LeaveRequest').findById(id);
    if(!leave) return res.status(404).send('not found');
    leave.status = status;
    leave.reviewedBy = req.user.id;
    leave.reviewedAt = new Date();
    await leave.save();
    res.json({message:'Leave updated',leave});
  }catch(err){res.status(500).json({message:err.message});}
};

// ==================== NOTIFICATIONS & REMINDERS ====================

// Send notification to vendor
exports.sendNotification = async (req, res) => {
  try {
    const { vendorId, title, message, type } = req.body;

    const notification = await Notification.create({
      userId: vendorId,
      title,
      message,
      type
    });

    res.status(201).json({ message: "Notification sent", notification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get pending approvals/tasks summary
exports.getPendingApprovals = async (req, res) => {
  try {
    const pendingCompliance = await VendorCompliance.countDocuments({
      documentStatus: "pending"
    });

    const pendingTasks = await AdminTask.countDocuments({
      status: "pending"
    });

    const pendingVendorRegistrations = await User.countDocuments({
      role: "vendor",
      status: "pending"
    });

    const disputeNotifications = await Notification.countDocuments({
      type: "dispute",
      read: false
    });

    res.json({
      pendingCompliance,
      pendingTasks,
      pendingVendorRegistrations,
      disputes: disputeNotifications,
      totalPending: pendingCompliance + pendingTasks + pendingVendorRegistrations + disputeNotifications
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
