const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  method: {
    type: String,
    enum: ["razorpay", "cod", "stripe"],
    required: true
  },
  transactionId: String,
  status: {
    type: String,
    enum: ["Pending", "Completed", "Failed", "Refunded"],
    default: "Pending"
  },
  refundAmount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);
