const express = require("express");
const router = express.Router();
const { createStripeIntent } = require("../controllers/paymentController");
const auth = require("../middleware/auth");

router.post("/stripe-intent", auth, createStripeIntent);

module.exports = router;
