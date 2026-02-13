const mongoose = require("mongoose");

const performanceGoalSchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  goalType: {
    type: String,
    enum: ["sales-target", "product-listings", "order-fulfillment", "rating", "response-time", "custom"],
    required: true
  },
  targetValue: { type: Number, required: true },
  currentValue: { type: Number, default: 0 },
  unit: String, 
  startDate: { type: Date, required: true },
  deadline: { type: Date, required: true },
  status: {
    type: String,
    enum: ["active", "completed", "failed", "cancelled"],
    default: "active"
  },
  description: String,
  reward: String, 
  completionDate: Date
}, { timestamps: true });

module.exports = mongoose.model("PerformanceGoal", performanceGoalSchema);
