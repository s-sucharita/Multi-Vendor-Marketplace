const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  action: {
    type: String,
    enum: ["product-listed", "order-processed", "review-posted", "login", "profile-update", "payment-made", "other"],
    required: true
  },
  description: String,
  ordersProcessedToday: Number,
  productsListedToday: Number,
  metadata: {}, // Store additional info as JSON
  ipAddress: String,
  userAgent: String
}, { timestamps: true });

module.exports = mongoose.model("ActivityLog", activityLogSchema);
