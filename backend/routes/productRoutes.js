const express = require("express");
const router = express.Router();
const path = require("path");
const upload = require("../config/multer");

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getVendorProducts
} = require("../controllers/productController");

const { protect, allowRoles, optionalAuth } = require("../middleware/authMiddleware");


router.post(
  "/",
  protect,
  allowRoles("vendor", "admin"),
  upload.array("images"),
  createProduct
);

router.put(
  "/:id",
  protect,
  allowRoles("vendor", "admin"),
  upload.array("images"),
  updateProduct
);

router.post(
  "/products",
  protect,
  upload.array("images"),
  createProduct
);

// ================= PUBLIC/OPTIONAL AUTH =================
router.get("/", optionalAuth, getProducts);

// ================= VENDOR PRODUCTS (MUST BE ABOVE :id) =================
router.get(
  "/vendor/my-products",
  protect,
  allowRoles("vendor", "admin"),
  getVendorProducts
);

// ================= PRODUCT DETAILS =================
router.get("/:id", optionalAuth, getProductById);

// ================= VENDOR / ADMIN =================
router.post("/", protect, allowRoles("vendor", "admin"), upload.array("images"), createProduct);
router.put("/:id", protect, allowRoles("vendor", "admin"), upload.array("images"), updateProduct);
router.delete("/:id", protect, allowRoles("vendor", "admin"), deleteProduct);

module.exports = router;
