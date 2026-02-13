const mongoose = require("mongoose");

const vendorComplianceSchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  documentType: {
    type: String,
    enum: ["business-license", "tax-id", "bank-verification", "insurance", "identity-proof", "other"],
    required: true
  },
  documentStatus: {
    type: String,
    enum: ["pending", "verified", "rejected", "expired"],
    default: "pending"
  },
  documentUrl: String,
  submissionDate: Date,
  expiryDate: Date,
  verificationDate: Date,
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Admin who verified
  rejectionReason: String,
  complianceScore: { type: Number, default: 0, min: 0, max: 100 }, // Overall score
  status: {
    type: String,
    enum: ["compliant", "non-compliant", "pending-review"],
    default: "pending-review"
  }
}, { timestamps: true });

module.exports = mongoose.model("VendorCompliance", vendorComplianceSchema);
