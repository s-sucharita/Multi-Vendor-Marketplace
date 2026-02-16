const Order = require("../models/Order");

const Payment = require("../models/Payment");
const Notification = require("../models/Notification");
const Product = require("../models/Product");


// CREATE ORDER FROM CART

exports.createOrder = async (req, res) => {
  try {
    const { deliveryAddress, paymentMethod, items, totalPrice } = req.body;
    const customerId = req.user.id;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // validate stock
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product?.name}`
        });
      }
    }

    // reduce stock
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }

    const order = await Order.create({
      customer: customerId,
      items,
      totalPrice,
      deliveryAddress,
      paymentMethod,
      status: "Processing",
paymentStatus: "Completed"

    });

    await Payment.create({
      order: order._id,
      customer: customerId,
      amount: totalPrice,
      method: paymentMethod,
      status: "Completed"
    });

    const vendors = [...new Set(items.map(i => i.vendor).filter(Boolean))];

    for (const vendorId of vendors) {
      await Notification.create({
        recipient: vendorId,
        type: "Order",
        title: "New Order Received",
        message: `You received order ${order._id}`,
        relatedId: order._id,
        relatedModel: "Order"
      });
    }

    res.status(201).json({ message: "Order created", order });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// CREATE ORDER DIRECTLY FROM A PRODUCT (BUY NOW)

exports.buyNow = async (req, res) => {
  try {
    const { productId, quantity = 1, deliveryAddress, paymentMethod } = req.body;
    const customerId = req.user.id;

    // validate product & stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (product.stock < quantity) {
      return res.status(400).json({ message: "Insufficient stock for this product" });
    }

    // reduce stock
    await Product.findByIdAndUpdate(productId, { $inc: { stock: -quantity } });

    const item = {
      product: productId,
      vendor: product.vendor,
      quantity,
      price: product.price
    };

const order = await Order.create({
  customer: customerId,
  items: [item],
  totalPrice: product.price * quantity,
  deliveryAddress,
  paymentMethod,
  status: "Processing",
  paymentStatus: "Completed"
});


   await Payment.create({
  order: order._id,
  customer: customerId,
  amount: order.totalPrice,
  method: paymentMethod,
  status: "Completed"
});



    // notify vendor
    await Notification.create({
      recipient: product.vendor,
      type: "Order",
      title: "New Order Received",
      message: `You have received a new order: ${order._id}`,
      relatedId: order._id,
      relatedModel: "Order"
    });

    res.status(201).json({ message: "Order created successfully", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// GET CUSTOMER ORDERS

exports.getCustomerOrders = async (req, res) => {
  try {
    // when returning a customer's orders we want to include basic product
    // information so the frontend can display a name + thumbnail. limit the
    // fields to reduce payload size.
    let orders = await Order.find({ customer: req.user.id })
      .populate({ path: "items.product", select: "name image" })
      .populate("items.vendor", "name email");

    // for convenience add a couple of helper fields on each item so the
    // frontend doesn't have to dig through an embedded object.
    orders = orders.map(order => {
      const o = order.toObject();
      o.items = o.items.map(item => ({
        ...item,
        productName: item.product?.name || "",
        productImage: item.product?.image || ""
      }));
      return o;
    });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// GET VENDOR ORDERS 

exports.getVendorOrders = async (req, res) => {
  try {
    const vendorId = req.user.id;

    let orders = await Order.find({ "items.vendor": vendorId })
      .populate({ path: "items.product", select: "name image" })
      .populate("customer", "name email");

    const filteredOrders = orders.map(order => {
      const vendorItems = order.items
        .filter(item => item.vendor.toString() === vendorId)
        .map(item => ({
          ...item.toObject(),
          productName: item.product?.name || "",
          productImage: item.product?.image || ""
        }));

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


// GET ORDER DETAILS

exports.getOrderDetails = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate({ path: "items.product", select: "name image" })
      .populate("items.vendor")
      .populate("customer");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const isVendor = order.items.some(
       item => item.vendor?._id?.toString() === req.user.id
    );

    if (
      order.customer?.toString() !== req.user.id &&
order.customer?._id?.toString() !== req.user.id &&
      !isVendor
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE ORDER STATUS

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const isVendor = order.items.some(
      item => item.vendor?._id?.toString() === req.user.id
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


// CANCEL ORDER

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

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
  _id: req.params.id,
  customer: req.user.id
    });

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
