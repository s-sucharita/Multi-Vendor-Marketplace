const express = require("express");
const router = express.Router();
const { protect, allowRoles } = require("../middleware/authMiddleware");

const {
  createOrder,
  getCustomerOrders,
  getVendorOrders,
  getOrderDetails,
  updateOrderStatus,
  cancelOrder
} = require("../controllers/orderController");

// all routes protected
router.use(protect);

// customer
router.post("/create", createOrder);
router.get("/my-orders", getCustomerOrders);
router.put("/:orderId/cancel", cancelOrder);
router.get("/:orderId", getOrderDetails);

// vendor / admin
router.get("/vendor/orders", allowRoles("vendor", "admin"), getVendorOrders);
router.put("/:orderId/status", allowRoles("vendor", "admin"), updateOrderStatus);

module.exports = router;
