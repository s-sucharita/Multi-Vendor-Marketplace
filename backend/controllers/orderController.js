const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Payment = require("../models/Payment");
const Notification = require("../models/Notification");
const Product = require("../models/Product");

// ===============================
// CREATE ORDER FROM CART
// ===============================
exports.createOrder = async (req, res) => {
  try {
    const { deliveryAddress, paymentMethod } = req.body;
    const customerId = req.user.id;

    const cart = await Cart.findOne({ user: customerId }).populate("items.product");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    //  1: Validate stock again (IMPORTANT)
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product?.name}`
        });
      }
    }

    // 2: Reduce stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity }
      });
    }

    // 3: Create order
    const order = await Order.create({
      customer: customerId,
      items: cart.items,
      totalPrice: cart.totalPrice,
      deliveryAddress,
      paymentMethod,
      status: "Pending"
    });

    // 4: Create payment record
    await Payment.create({
      order: order._id,
      customer: customerId,
      amount: cart.totalPrice,
      method: paymentMethod,
      status: "Pending"
    });

    // 5: Notify vendors
    const vendors = [...new Set(cart.items.map(item => item.vendor.toString()))];
    for (const vendorId of vendors) {
      await Notification.create({
        recipient: vendorId,
        type: "Order",
        title: "New Order Received",
        message: `You have received a new order: ${order._id}`,
        relatedId: order._id,
        relatedModel: "Order"
      });
    }

    //  6: Clear cart
    await Cart.findOneAndUpdate(
      { user: customerId },
      { items: [], totalPrice: 0 }
    );

    res.status(201).json({ message: "Order created successfully", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// GET CUSTOMER ORDERS
// ===============================
exports.getCustomerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user.id })
      .populate("items.product")
      .populate("items.vendor");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// GET VENDOR ORDERS (ONLY THEIR ITEMS)
// ===============================
exports.getVendorOrders = async (req, res) => {
  try {
    const vendorId = req.user.id;

    const orders = await Order.find({ "items.vendor": vendorId })
      .populate("items.product")
      .populate("customer", "name email");

    const filteredOrders = orders.map(order => {
      const vendorItems = order.items.filter(
        item => item.vendor.toString() === vendorId
      );

      return {
        ...order.toObject(),
        items: vendorItems
      };
    });

    res.json(filteredOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// GET ORDER DETAILS
// ===============================
exports.getOrderDetails = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate("items.product")
      .populate("items.vendor")
      .populate("customer");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const isVendor = order.items.some(
      item => item.vendor.toString() === req.user.id
    );

    if (
      order.customer._id.toString() !== req.user.id &&
      req.user.role !== "admin" &&
      !isVendor
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// UPDATE ORDER STATUS
// ===============================
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const isVendor = order.items.some(
      item => item.vendor.toString() === req.user.id
    );

    if (!isVendor && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    order.status = status;
    await order.save();

    await Notification.create({
      recipient: order.customer,
      type: "Order",
      title: "Order Status Updated",
      message: `Your order status has been updated to: ${status}`,
      relatedId: order._id,
      relatedModel: "Order"
    });

    res.json({ message: "Order status updated", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// CANCEL ORDER
// ===============================
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.customer.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (order.status !== "Pending") {
      return res.status(400).json({ message: "Can only cancel pending orders" });
    }

    order.status = "Cancelled";
    await order.save();

    // OPTIONAL: Restock products
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity }
      });
    }

    await Payment.findOneAndUpdate(
      { order: order._id },
      { status: "Failed" }
    );

    res.json({ message: "Order cancelled", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
