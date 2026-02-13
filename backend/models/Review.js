const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: String,
  helpful: { type: Number, default: 0 },
  unhelpful: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("Review", reviewSchema);
