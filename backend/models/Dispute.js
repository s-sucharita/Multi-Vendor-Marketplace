const mongoose = require("mongoose");

const disputeSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ["payment-issue", "product-quality", "delivery", "missing-items", "other"],
    required: true
  },
  status: {
    type: String,
    enum: ["open", "in-review", "resolved", "escalated"],
    default: "open"
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high", "critical"],
    default: "medium"
  },
  customerMessage: String,
  vendorResponse: String,
  resolution: String,
  evidence: [String], // URLs for images/documents
  resolvedDate: Date,
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Admin who resolved
  refundRequested: Boolean,
  refundAmount: Number
}, { timestamps: true });

module.exports = mongoose.model("Dispute", disputeSchema);
