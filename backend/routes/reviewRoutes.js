const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  addReview,
  getProductReviews,
  updateReview,
  deleteReview,
  markHelpful
} = require("../controllers/reviewController");

// Get reviews for a product (public)
router.get("/product/:productId", getProductReviews);

// All other review routes require authentication
router.use(protect);

router.post("/add", addReview);
router.put("/:reviewId", updateReview);
router.delete("/:reviewId", deleteReview);
router.put("/:reviewId/helpful", markHelpful);

module.exports = router;
