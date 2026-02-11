const express = require("express");
const router = express.Router();

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const { protect, vendorOnly } = require("../middleware/authMiddleware");

// TEMP: public create
router.post("/", createProduct);

// Public
router.get("/", getProducts);
router.get("/:id", getProductById);

// Vendor-only (later)
router.put("/:id", protect, vendorOnly, updateProduct);
router.delete("/:id", protect, vendorOnly, deleteProduct);

module.exports = router;
