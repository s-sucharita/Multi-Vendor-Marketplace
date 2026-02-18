const User = require("../models/User");

// SEND MESSAGE
exports.sendMessage = async (req, res) => {
  try {
    res.json({ message: "Message sent (demo)" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET USER MESSAGES
exports.getUserMessages = async (req, res) => {
  try {
    res.json([]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET MESSAGE DETAILS
exports.getMessageDetails = async (req, res) => {
  try {
    res.json({});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// REPLY TO MESSAGE
exports.replyToMessage = async (req, res) => {
  try {
    res.json({ message: "Reply sent" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET VENDORS
exports.getVendors = async (req, res) => {
  try {
    const vendors = await User.find({ role: "vendor" }).select("-password");
    res.json(vendors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
