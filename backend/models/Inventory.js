const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema({
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true, default: 0 },
  reservedQuantity: { type: Number, default: 0 },
  availableQuantity: { 
    type: Number,
    get: function() { return this.quantity - this.reservedQuantity; }
  },
  lowStockThreshold: { type: Number, default: 5 },
  isLowStock: { type: Boolean, default: false },
  lastRestockDate: Date,
  restockHistory: [
    {
      quantityAdded: Number,
      date: { type: Date, default: Date.now },
      reason: String
    }
  ]
}, { timestamps: true, toJSON: { getters: true } });

// Calculate low stock status before saving
inventorySchema.pre('save', function(next) {
  this.isLowStock = this.availableQuantity <= this.lowStockThreshold;
  next();
});

module.exports = mongoose.model("Inventory", inventorySchema);
