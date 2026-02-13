const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: {
    type: String,
    enum: ["Order", "Payment", "Product", "Admin", "Vendor"],
    required: true
  },
  title: { type: String, required: true },
  message: String,
  relatedId: mongoose.Schema.Types.ObjectId,
  relatedModel: String,
  read: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);
