const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getUserProfile,
  updateProfile,
  changePassword,
  getNotifications,
  markNotificationAsRead,
  deleteNotification
} = require("../controllers/userController");

// All user routes require authentication
router.use(protect);

router.get("/profile", getUserProfile);
router.put("/profile/update", updateProfile);
router.put("/profile/change-password", changePassword);

// Notifications
router.get("/notifications", getNotifications);
router.put("/notifications/:notificationId/read", markNotificationAsRead);
router.delete("/notifications/:notificationId", deleteNotification);

// Messaging (both customers and vendors can use these)
const {
  sendMessage,
  getUserMessages,
  getMessageDetails,
  replyToMessage
} = require("../controllers/vendorController");

router.get("/messages", getUserMessages);
router.post("/messages", sendMessage);
router.get("/messages/:messageId", getMessageDetails);
router.post("/messages/:messageId/reply", replyToMessage);

module.exports = router;
