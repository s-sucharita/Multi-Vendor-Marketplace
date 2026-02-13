const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getVendorProducts
} = require("../controllers/productController");

const { protect, allowRoles, optionalAuth } = require("../middleware/authMiddleware");

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  }
});

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
