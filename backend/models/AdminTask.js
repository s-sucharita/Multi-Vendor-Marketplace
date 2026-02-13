const mongoose = require("mongoose");

const adminTaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Admin who assigned
  status: {
    type: String,
    enum: ["pending", "in-progress", "completed", "overdue"],
    default: "pending"
  },
  deadline: Date,
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium"
  },
  category: {
    type: String,
    enum: ["compliance", "document-submission", "listing-update", "report", "other"],
    default: "other"
  },
  completionDate: Date,
  notes: String
}, { timestamps: true });

module.exports = mongoose.model("AdminTask", adminTaskSchema);
