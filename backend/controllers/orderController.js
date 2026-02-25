const Order = require("../models/Order");
const Payment = require("../models/Payment");
const Notification = require("../models/Notification");
const Product = require("../models/Product");
const ActivityLog = require("../models/ActivityLog");


// ===============================
// CREATE ORDER FROM CART
// ===============================

exports.createOrder = async (req, res) => {
  try {
    const { deliveryAddress, paymentMethod, items } = req.body;
    const customerId = req.user.id;

    if (!items || !items.length) {
      return res.status(400).json({ message: "Cart empty" });
    }

    let preparedItems = [];
    let totalPrice = 0;

    for (const i of items) {
      const product = await Product.findById(i.product);

      if (!product || product.stock < i.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product?.name}`
        });
      }

      // Always use product.vendor to ensure vendor is set
      const vendorId = product.vendor;
      if (!vendorId) {
        console.warn(`Product ${product._id} (${product.name}) has no vendor assigned!`);
      }

      preparedItems.push({
        product: product._id,
        vendor: vendorId,
        quantity: i.quantity,
        price: product.price
      });

      totalPrice += product.price * i.quantity;

      await Product.findByIdAndUpdate(product._id, {
        $inc: { stock: -i.quantity }
      });
    }

    const order = await Order.create({
      customer: customerId,
      items: preparedItems,
      totalPrice,
      deliveryAddress,
      paymentMethod,
      status: "Pending",
      paymentStatus: "Completed"
    });

    await Payment.create({
      order: order._id,
      customer: customerId,
      amount: totalPrice,
      method: paymentMethod,
      status: "Completed"
    });

    // log activity for each vendor involved
    try {
      const vendors = [...new Set(preparedItems.map(i => i.vendor).filter(Boolean))];
      for (const vid of vendors) {
        await ActivityLog.create({
          userId: vid,
          action: "order-processed",
          description: `Order ${order._id} created`,
          ordersProcessedToday: 1,
          metadata: { orderId: order._id }
        });
      }
    } catch (logErr) {
      console.warn("Failed to log order activity:", logErr.message);
    }

    const vendors = [...new Set(preparedItems.map(i => i.vendor).filter(Boolean))];

    for (const vendorId of vendors) {
      await Notification.create({
        recipient: vendorId,
        type: "Order",
        title: "New Order",
        message: `New order ${order._id}`,
        relatedId: order._id,
        relatedModel: "Order"
      });
    }

    res.status(201).json(order);

  } catch (err) {
    console.error("Order creation error:", err);
    res.status(500).json({ message: err.message });
  }
};


// ===============================
// BUY NOW
// ===============================

exports.buyNow = async (req, res) => {
  try {
    const { productId, quantity = 1, deliveryAddress, paymentMethod } = req.body;
    const customerId = req.user.id;

    const product = await Product.findById(productId);
    if (!product)
      return res.status(404).json({ message: "Product not found" });

    if (product.stock < quantity)
      return res
        .status(400)
        .json({ message: "Insufficient stock for this product" });

    await Product.findByIdAndUpdate(productId, {
      $inc: { stock: -quantity },
    });

    const item = {
      product: productId,
      vendor: product.vendor,
      quantity,
      price: product.price,
    };

    const order = await Order.create({
      customer: customerId,
      items: [item],
      totalPrice: product.price * quantity,
      deliveryAddress,
      paymentMethod,
      status: "Processing",
      paymentStatus: "Completed",
    });

    await Payment.create({
      order: order._id,
      customer: customerId,
      amount: order.totalPrice,
      method: paymentMethod,
      status: "Completed",
    });

    // log activity for the vendor
    try {
      if (product.vendor) {
        await ActivityLog.create({
          userId: product.vendor,
          action: "order-processed",
          description: `Order ${order._id} created via buy now`,
          ordersProcessedToday: 1,
          metadata: { orderId: order._id }
        });
      }
    } catch (logErr) {
      console.warn("Failed to log buy-now order activity:", logErr.message);
    }

    await Notification.create({
      recipient: product.vendor,
      type: "Order",
      title: "New Order Received",
      message: `You have received a new order: ${order._id}`,
      relatedId: order._id,
      relatedModel: "Order",
    });

    res.status(201).json({ message: "Order created successfully", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// CUSTOMER ORDERS
// ===============================

exports.getCustomerOrders = async (req, res) => {
  try {
    let orders = await Order.find({ customer: req.user.id })
      .populate({ path: "items.product", select: "name image" })
      .populate("items.vendor", "name email");

    orders = orders.map((order) => {
      const o = order.toObject();
      o.items = o.items.map((item) => ({
        ...item,
        productName: item.product?.name || "",
        productImage: item.product?.image || "",
      }));
      return o;
    });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// VENDOR ORDERS
// ===============================

exports.getVendorOrders = async (req, res) => {
  try {
    const vendorId = req.user.id;

    let orders = await Order.find({ "items.vendor": vendorId })
      .populate({ path: "items.product", select: "name image" })
      .populate("customer", "name email");

    const filteredOrders = orders.map((order) => {
      const vendorItems = order.items
        .filter((item) => item.vendor?._id?.toString() === vendorId)
        .map((item) => ({
          ...item.toObject(),
          productName: item.product?.name || "",
          productImage: item.product?.image || "",
        }));

      return {
        ...order.toObject(),
        items: vendorItems,
      };
    });

    res.json(filteredOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// ORDER DETAILS
// ===============================

exports.getOrderDetails = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate({ path: "items.product", select: "name image" })
      .populate({ path: "items.vendor", select: "name email" })   
      .populate("customer", "name email");
      

    if (!order) return res.status(404).json({ message: "Order not found" });

    const isVendor = order.items.some(
      (item) => item.vendor?._id?.toString() === req.user.id
    );

    const isCustomer =
      order.customer?._id?.toString() === req.user.id;

    if (!isCustomer && !isVendor && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// UPDATE STATUS


exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.orderId);

    if (!order) return res.status(404).json({ message: "Order not found" });

    const isVendor = order.items.some(
      (item) => item.vendor?._id?.toString() === req.user.id
    );

    if (!isVendor && req.user.role !== "admin")
      return res.status(403).json({ message: "Access denied" });

    order.status = status;
    await order.save();

    await Notification.create({
      recipient: order.customer,
      type: "Order",
      title: "Order Status Updated",
      message: `Your order status has been updated to: ${status}`,
      relatedId: order._id,
      relatedModel: "Order",
    });

    res.json({ message: "Order status updated", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// CANCEL ORDER

exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const isCustomer =
      order.customer?.toString() === req.user.id ||
      order.customer?._id?.toString() === req.user.id;

    if (!isCustomer) return res.status(403).json({ message: "Access denied" });

    if (!["Pending", "Processing"].includes(order.status)) {
      return res
        .status(400)
        .json({ message: "Cannot cancel this order" });
    }

    order.status = "Cancelled";
    await order.save();

    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }

    await Payment.findOneAndUpdate({ order: order._id }, { status: "Failed" });

    res.json({ message: "Order cancelled", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ADD MESSAGE TO ORDER
exports.addOrderMessage = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order)
      return res.status(404).json({ message: "Order not found" });

    const isVendor = order.items.some(
      (item) => item.vendor?.toString() === req.user.id
    );

    const isCustomer =
      order.customer?.toString() === req.user.id;

    if (!isVendor && !isCustomer && req.user.role !== "admin")
      return res.status(403).json({ message: "Access denied" });

    order.messages.push({
      sender: req.user.id,
      text: req.body.text
    });

    await order.save();

    // 🔔 Optional: notify the other person
    const recipient = isVendor ? order.customer : order.items[0].vendor;

    await Notification.create({
      recipient,
      type: "Order",
      title: "New Message",
      message: "You have a new message regarding your order.",
      relatedId: order._id,
      relatedModel: "Order"
    });

    res.json({ message: "Message sent", order });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADD MESSAGE TO SPECIFIC ORDER ITEM
exports.addItemMessage = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;
    const { text } = req.body;

    const order = await Order.findById(orderId);
    if (!order)
      return res.status(404).json({ message: "Order not found" });

    const item = order.items.id(itemId);
    if (!item)
      return res.status(404).json({ message: "Item not found" });

    const isVendor = item.vendor?.toString() === req.user.id;
    const isCustomer = order.customer?.toString() === req.user.id;

    if (!isVendor && !isCustomer && req.user.role !== "admin")
      return res.status(403).json({ message: "Access denied" });

    item.messages.push({
      sender: req.user.id,
      text
    });

    await order.save();

    // 🔔 Notify the other person
    const recipient = isVendor ? order.customer : item.vendor;

    await Notification.create({
      recipient,
      type: "Order",
      title: "New Message",
      message: "You received a new message about your order item.",
      relatedId: order._id,
      relatedModel: "Order"
    });

    res.json({ message: "Message sent", order });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};