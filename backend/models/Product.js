const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  // Discount information
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
    description: "Discount percentage (0-100)"
  },
  discountType: {
    type: String,
    enum: ["percentage", "fixed"],
    default: "percentage"
  },
  discountedPrice: {
    type: Number,
    default: null,
    description: "Calculated price after discount"
  },
  // primary/thumbnail image for quick display
  image: String,
  // allow multiple photo URLs
  images: [String],
  // additional arbitrary details or specifications
  extraDetails: String,
  category: String,
  stock: { type: Number, default: 0 },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: "User",required: true }
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
