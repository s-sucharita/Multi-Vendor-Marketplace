


exports.createPayment = async (req, res) => {
  try {
    res.json({ message: "Payment handled on frontend (Razorpay/COD demo)" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
