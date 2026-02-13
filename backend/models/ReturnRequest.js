const mongoose = require("mongoose");

const returnRequestSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true },
  reason: {
    type: String,
    enum: ["defective", "not-as-described", "changed-mind", "damaged-in-shipping", "other"],
    required: true
  },
  description: String,
  images: [String], 
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "return-shipped", "completed"],
    default: "pending"
  },
  vendorResponse: String,
  refundAmount: { type: Number, required: true },
  expectedReturnDate: Date,
  actualReturnDate: Date,
  trackingNumber: String,
  notes: String
}, { timestamps: true });

module.exports = mongoose.model("ReturnRequest", returnRequestSchema);
