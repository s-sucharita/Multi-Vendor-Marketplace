const express = require("express");
const router = express.Router();
const { protect, customerOnly, allowRoles } = require("../middleware/authMiddleware");
const {
  createOrder,
  getCustomerOrders,
  getVendorOrders,
  getOrderDetails,
  updateOrderStatus,
  cancelOrder
} = require("../controllers/orderController");

// All order routes require authentication
router.use(protect);

// Customer routes
router.post("/create", createOrder);
router.get("/my-orders", getCustomerOrders);
router.delete("/:orderId/cancel", cancelOrder);
router.get("/:orderId", getOrderDetails);

// Vendor routes
router.get("/vendor", protect, allowRoles("vendor"), getVendorOrders);
router.get("/vendor/orders", allowRoles("vendor", "admin"), getVendorOrders);
router.put("/:orderId/status", allowRoles("vendor", "admin"), updateOrderStatus);

module.exports = router;
