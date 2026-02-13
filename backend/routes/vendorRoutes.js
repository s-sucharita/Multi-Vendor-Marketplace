const express = require("express");
const router = express.Router();
const { protect, vendorOnly } = require("../middleware/authMiddleware");
const {
  // Product Management
  getVendorProducts,
  getProductDetails,
  createProduct,
  updateProduct,
  deleteProduct,

  // Order Management
  getVendorOrders,
  getOrderDetails,
  updateOrderStatus,
  packOrder,
  shipOrder,

  // Inventory Management
  getInventory,
  getProductInventory,
  updateStock,
  getLowStockProducts,

  // Messaging
  getMessages,
  getMessageDetails,
  replyToMessage,

  // Returns Management
  getReturnRequests,
  getReturnDetails,
  approveReturn,
  rejectReturn,
  markReturnReceived,

  // Dispute Management
  getDisputes,
  getDisputeDetails,
  respondToDispute,

  // Reports & Analytics
  getSalesSummary,
  getSalesReport,
  getNotificationsSummary
} = require("../controllers/vendorController");

// All vendor routes require authentication and vendor role
router.use(protect, vendorOnly);

// ==================== PRODUCT MANAGEMENT ====================
router.get("/products", getVendorProducts);
router.post("/products", createProduct);
router.get("/products/:productId", getProductDetails);
router.put("/products/:productId", updateProduct);
router.delete("/products/:productId", deleteProduct);

// ==================== ORDER MANAGEMENT ====================
router.get("/orders", getVendorOrders);
router.get("/orders/:orderId", getOrderDetails);
router.put("/orders/:orderId/status", updateOrderStatus);
router.post("/orders/:orderId/pack", packOrder);
router.post("/orders/:orderId/ship", shipOrder);

// ==================== INVENTORY MANAGEMENT ====================
router.get("/inventory", getInventory);
router.get("/inventory/:productId", getProductInventory);
router.put("/inventory/:productId", updateStock);
router.get("/inventory/low-stock", getLowStockProducts);

// ==================== MESSAGING & COMMUNICATION ====================
router.get("/messages", getMessages);
router.get("/messages/:messageId", getMessageDetails);
router.post("/messages/:messageId/reply", replyToMessage);

// ==================== RETURNS MANAGEMENT ====================
router.get("/returns", getReturnRequests);
router.get("/returns/:returnId", getReturnDetails);
router.post("/returns/:returnId/approve", approveReturn);
router.post("/returns/:returnId/reject", rejectReturn);
router.post("/returns/:returnId/received", markReturnReceived);

// ==================== DISPUTE MANAGEMENT ====================
router.get("/disputes", getDisputes);
router.get("/disputes/:disputeId", getDisputeDetails);
router.post("/disputes/:disputeId/respond", respondToDispute);

// ==================== REPORTS & ANALYTICS ====================
router.get("/reports/summary", getSalesSummary);
router.get("/reports/detailed", getSalesReport);
router.get("/dashboard/notifications", getNotificationsSummary);

// ==================== LEAVE MANAGEMENT ====================
router.post("/leaves", require('../controllers/vendorController').requestLeave);
router.get("/leaves", require('../controllers/vendorController').getMyLeaves);

module.exports = router;
