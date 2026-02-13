const mongoose = require("mongoose");

const vendorMessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  subject: String,
  message: { type: String, required: true },
  messageType: {
    type: String,
    enum: ["product-query", "order-status", "complaint", "support", "other"],
    default: "other"
  },
  isRead: { type: Boolean, default: false },
  attachments: [String], // URLs for files
  status: {
    type: String,
    enum: ["sent", "delivered", "read", "replied"],
    default: "sent"
  },
  replies: [
    {
      sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      message: String,
      attachments: [String],
      createdAt: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("VendorMessage", vendorMessageSchema);
