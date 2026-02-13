const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["customer", "vendor", "admin"],
    default: "customer",
  },
  status: {
    type: String,
    enum: ["active", "suspended", "pending", "rejected"],
    default: "active"
  },
  phone: String,
  address: String,
  city: String,
  state: String,
  zipCode: String,
  country: String,
  profileImage: String,
  businessName: String, // for vendors
  businessDescription: String, // for vendors
  businessWebsite: String, // for vendors
  bankAccount: String, // for vendors (encrypted separately)
  averageRating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
