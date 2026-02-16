const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Inventory = require("../models/Inventory");
const ReturnRequest = require("../models/ReturnRequest");
const Dispute = require("../models/Dispute");
const VendorMessage = require("../models/VendorMessage");
const Notification = require("../models/Notification");

// ==================== PRODUCT MANAGEMENT ====================

// Get all products for vendor
exports.getVendorProducts = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const products = await Product.find({ vendor: vendorId })
      .populate("vendor", "name businessName");
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single product details
exports.getProductDetails = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    // Check ownership
    if (product.vendor.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to view this product" });
    }

    // Get inventory info
    const inventory = await Inventory.findOne({ product: req.params.productId });

    res.json({ product, inventory });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new product
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, image, category, stock } = req.body;

    const product = await Product.create({
      name,
      description,
      price,
      image,
      category,
      stock: 0, // Start with 0, inventory tracks actual stock
      vendor: req.user.id
    });

    // Create inventory record
    await Inventory.create({
      vendor: req.user.id,
      product: product._id,
      quantity: stock || 0
    });

    // Send notification to vendor
    await Notification.create({
      userId: req.user.id,
      title: "Product Created",
      message: `Your product "${name}" has been created successfully`,
      type: "product-created"
    });

    res.status(201).json({ message: "Product created successfully", product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check ownership
    if (product.vendor.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to update this product" });
    }

    const { name, description, price, image, category } = req.body;
    Object.assign(product, { name, description, price, image, category });
    await product.save();

    res.json({ message: "Product updated successfully", product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check ownership
    if (product.vendor.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this product" });
    }

    await Product.findByIdAndDelete(req.params.productId);
    await Inventory.deleteOne({ product: req.params.productId });

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== ORDER MANAGEMENT ====================

// Get all vendor orders
exports.getVendorOrders = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { status } = req.query;
    let filter = { "items.vendor": vendorId };

    if (status) filter.status = status;

    const orders = await Order.find(filter)
      .populate("customer", "name email phone")
      .populate("items.product", "name price")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get order details
exports.getOrderDetails = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate("customer", "name email phone address")
      .populate("items.product", "name price description");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if vendor owns this order
    const isVendorOwner = order.items.some(item => item.vendor.toString() === req.user.id);
    if (!isVendorOwner) {
      return res.status(403).json({ message: "Not authorized to view this order" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, trackingNumber } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if vendor owns this order
    const isVendorOwner = order.items.some(item => item.vendor.toString() === req.user.id);
    if (!isVendorOwner) {
      return res.status(403).json({ message: "Not authorized to update this order" });
    }

    order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    await order.save();

    // Notify customer
    await Notification.create({
      userId: order.customer,
      title: `Order ${status}`,
      message: `Your order has been ${status}${trackingNumber ? `. Tracking: ${trackingNumber}` : ''}`,
      type: "order-update"
    });

    res.json({ message: "Order status updated", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Pack order (mark as ready to ship)
exports.packOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { status: "Processing" },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Notify customer
    await Notification.create({
      userId: order.customer,
      title: "Order Packed",
      message: "Your order is being packed and will ship soon",
      type: "order-update"
    });

    res.json({ message: "Order packed", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Ship order
exports.shipOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { trackingNumber } = req.body;

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status: "Shipped", trackingNumber },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Notify customer
    await Notification.create({
      userId: order.customer,
      title: "Order Shipped! 🚚",
      message: `Your order has shipped! Tracking: ${trackingNumber}`,
      type: "order-update"
    });

    res.json({ message: "Order shipped", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== INVENTORY MANAGEMENT ====================

// Get inventory for all vendor products
exports.getInventory = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const inventory = await Inventory.find({ vendor: vendorId })
      .populate("product", "name price category");

    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single product inventory
exports.getProductInventory = async (req, res) => {
  try {
    const inventory = await Inventory.findOne({ 
      product: req.params.productId,
      vendor: req.user.id 
    }).populate("product", "name price");

    if (!inventory) {
      return res.status(404).json({ message: "Inventory not found" });
    }

    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update stock quantity
exports.updateStock = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity, reason } = req.body;

    const inventory = await Inventory.findOne({
      product: productId,
      vendor: req.user.id
    });

    if (!inventory) {
      return res.status(404).json({ message: "Inventory not found" });
    }

    const oldQuantity = inventory.quantity;
    inventory.quantity = quantity;
    
    // Add to restock history
    inventory.restockHistory.push({
      quantityAdded: quantity - oldQuantity,
      reason: reason || "Manual adjustment",
      date: new Date()
    });

    // Update product stock
    const product = await Product.findById(productId);
    if (product) {
      product.stock = quantity;
      await product.save();
    }

    await inventory.save();

    res.json({ 
      message: "Stock updated successfully",
      oldQuantity,
      newQuantity: quantity,
      change: quantity - oldQuantity,
      inventory
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get low stock products
exports.getLowStockProducts = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const lowStockProducts = await Inventory.find({
      vendor: vendorId,
      isLowStock: true
    }).populate("product", "name price category");

    res.json(lowStockProducts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== MESSAGING & COMMUNICATION ====================

// Send a new message (customer or vendor)
exports.sendMessage = async (req, res) => {
  try {
    let { recipient, product, order, subject, message, messageType } = req.body;
    const sender = req.user.id;

    // basic validation
    if (!recipient || !message) {
      return res.status(400).json({ message: "Recipient and message required" });
    }

    // if the caller specified a product but left subject blank, create a sensible default
    if (!subject && product) {
      // attempt to load the product name for context
      const prod = await Product.findById(product).select("name");
      if (prod) {
        subject = `Question about ${prod.name}`;
      } else {
        // fallback generic subject
        subject = "Product inquiry";
      }
    }

    const newMsg = await VendorMessage.create({
      sender,
      recipient,
      product,
      order,
      subject,
      message,
      messageType
    });

    res.status(201).json({ message: "Message sent", data: newMsg });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get messages for current user (sent or received)
exports.getUserMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { isRead, messageType } = req.query;
    let filter = { $or: [{ sender: userId }, { recipient: userId }] };

    if (isRead !== undefined) filter.isRead = isRead === "true";
    if (messageType) filter.messageType = messageType;

    const messages = await VendorMessage.find(filter)
      .populate("sender", "name email")
      .populate("recipient", "name email")
      .populate("product", "name")
      .populate("order", "totalPrice status")
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get vendor messages
exports.getMessages = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { isRead, messageType } = req.query;
    let filter = { recipient: vendorId };

    if (isRead !== undefined) filter.isRead = isRead === "true";
    if (messageType) filter.messageType = messageType;

    const messages = await VendorMessage.find(filter)
      .populate("sender", "name email")
      .populate("product", "name")
      .populate("order", "totalPrice status")
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get message details
exports.getMessageDetails = async (req, res) => {
  try {
    const message = await VendorMessage.findById(req.params.messageId)
      .populate("sender", "name email")
      .populate("recipient", "name email")
      .populate("product", "name price")
      .populate("order");

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Check if user has access
    if (message.recipient._id.toString() !== req.user.id && message.sender._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to view this message" });
    }

    // Mark as read if recipient
    if (message.recipient._id.toString() === req.user.id && !message.isRead) {
      message.isRead = true;
      message.status = "read";
      await message.save();
    }

    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Send reply to message
exports.replyToMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { message } = req.body;

    const originalMessage = await VendorMessage.findById(messageId);
    if (!originalMessage) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Check authorization
    if (originalMessage.recipient._id.toString() !== req.user.id && originalMessage.sender._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    originalMessage.replies.push({
      sender: req.user.id,
      message
    });

    originalMessage.status = "replied";
    await originalMessage.save();

    // Notify the other party
    const notifyUserId = originalMessage.sender._id.toString() === req.user.id
      ? originalMessage.recipient
      : originalMessage.sender;

    await Notification.create({
      userId: notifyUserId,
      title: "New Message Reply",
      message: `You received a reply to your message`,
      type: "message-reply"
    });

    res.json({ message: "Reply sent successfully", data: originalMessage });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== RETURNS MANAGEMENT ====================

// Get return requests
exports.getReturnRequests = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { status } = req.query;
    let filter = { vendor: vendorId };

    if (status) filter.status = status;

    const returns = await ReturnRequest.find(filter)
      .populate("order", "totalPrice")
      .populate("product", "name price")
      .populate("customer", "name email")
      .sort({ createdAt: -1 });

    res.json(returns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get return details
exports.getReturnDetails = async (req, res) => {
  try {
    const returnReq = await ReturnRequest.findById(req.params.returnId)
      .populate("order")
      .populate("product")
      .populate("customer", "name email")
      .populate("vendor", "name");

    if (!returnReq) {
      return res.status(404).json({ message: "Return request not found" });
    }

    // Check ownership
    if (returnReq.vendor._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(returnReq);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Approve return request
exports.approveReturn = async (req, res) => {
  try {
    const { returnId } = req.params;
    const { vendorResponse, expectedReturnDate } = req.body;

    const returnReq = await ReturnRequest.findByIdAndUpdate(
      returnId,
      {
        status: "approved",
        vendorResponse,
        expectedReturnDate
      },
      { new: true }
    );

    if (!returnReq) {
      return res.status(404).json({ message: "Return not found" });
    }

    // Notify customer
    await Notification.create({
      userId: returnReq.customer,
      title: "Return Approved",
      message: `Your return request has been approved. Expected refund: $${returnReq.refundAmount}`,
      type: "return-update"
    });

    res.json({ message: "Return approved", returnReq });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reject return request
exports.rejectReturn = async (req, res) => {
  try {
    const { returnId } = req.params;
    const { vendorResponse } = req.body;

    const returnReq = await ReturnRequest.findByIdAndUpdate(
      returnId,
      {
        status: "rejected",
        vendorResponse
      },
      { new: true }
    );

    if (!returnReq) {
      return res.status(404).json({ message: "Return not found" });
    }

    // Notify customer
    await Notification.create({
      userId: returnReq.customer,
      title: "Return Rejected",
      message: `Your return request has been rejected. Reason: ${vendorResponse}`,
      type: "return-update"
    });

    res.json({ message: "Return rejected", returnReq });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark return as received
exports.markReturnReceived = async (req, res) => {
  try {
    const { returnId } = req.params;

    const returnReq = await ReturnRequest.findByIdAndUpdate(
      returnId,
      {
        status: "completed",
        actualReturnDate: new Date()
      },
      { new: true }
    );

    if (!returnReq) {
      return res.status(404).json({ message: "Return not found" });
    }

    // Notify customer
    await Notification.create({
      userId: returnReq.customer,
      title: "Return Received",
      message: `We've received your return. Refund of $${returnReq.refundAmount} will be processed within 5-7 business days.`,
      type: "return-update"
    });

    res.json({ message: "Return marked as received", returnReq });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== DISPUTE MANAGEMENT ====================

// Get disputes
exports.getDisputes = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { status, priority } = req.query;
    let filter = { vendor: vendorId };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const disputes = await Dispute.find(filter)
      .populate("customer", "name email")
      .populate("order", "totalPrice")
      .sort({ createdAt: -1 });

    res.json(disputes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get dispute details
exports.getDisputeDetails = async (req, res) => {
  try {
    const dispute = await Dispute.findById(req.params.disputeId)
      .populate("customer", "name email address")
      .populate("order", "totalPrice items")
      .populate("vendor", "name")
      .populate("resolvedBy", "name");

    if (!dispute) {
      return res.status(404).json({ message: "Dispute not found" });
    }

    // Check ownership
    if (dispute.vendor._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(dispute);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Respond to dispute
exports.respondToDispute = async (req, res) => {
  try {
    const { disputeId } = req.params;
    const { vendorResponse } = req.body;

    const dispute = await Dispute.findByIdAndUpdate(
      disputeId,
      { vendorResponse },
      { new: true }
    );

    if (!dispute) {
      return res.status(404).json({ message: "Dispute not found" });
    }

    // Notify customer
    await Notification.create({
      userId: dispute.customer,
      title: "Dispute Response",
      message: `Vendor has responded to your dispute`,
      type: "dispute-update"
    });

    res.json({ message: "Response submitted", dispute });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== SALES REPORTS & ANALYTICS ====================

// Get sales summary
exports.getSalesSummary = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { days = 30 } = req.query;
    
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Get orders from last N days
    const orders = await Order.find({
      "items.vendor": vendorId,
      createdAt: { $gte: startDate }
    });

    // Calculate metrics
    const totalRevenue = orders.reduce((sum, order) => {
      const vendorItems = order.items.filter(item => item.vendor.toString() === vendorId);
      return sum + vendorItems.reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0);
    }, 0);

    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => o.status === "Delivered").length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Get top products
    const products = await Product.find({ vendor: vendorId });
    const topProducts = products.slice(0, 5);

    res.json({
      period: `Last ${days} days`,
      metrics: {
        totalRevenue: totalRevenue.toFixed(2),
        totalOrders,
        completedOrders,
        pendingOrders: totalOrders - completedOrders,
        avgOrderValue: avgOrderValue.toFixed(2),
        conversionRate: completedOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(2) : 0
      },
      topProducts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get detailed sales report (vendor) with optional metrics filtering
exports.getSalesReport = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { startDate, endDate, metrics } = req.query;
    // metrics comma separated: totalOrders,ordersByStatus,salesByDate,productAnalytics

    let dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const orders = await Order.find({
      "items.vendor": vendorId,
      ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
    })
      .populate("items.product", "name category")
      .populate("customer", "name email");

    // prepare empty structure
    const reportData = {};
    const include = metrics ? metrics.split(',').map(m=>m.trim()) : null;

    if (!include || include.includes('totalOrders')) {
      reportData.totalOrders = orders.length;
    }
    if (!include || include.includes('ordersByStatus')) {
      reportData.ordersByStatus = {};
    }
    if (!include || include.includes('salesByDate')) {
      reportData.salesByDate = {};
    }
    if (!include || include.includes('productAnalytics')) {
      reportData.productAnalytics = {};
    }

    orders.forEach(order => {
      if (!include || include.includes('ordersByStatus')) {
        reportData.ordersByStatus[order.status] = (reportData.ordersByStatus[order.status] || 0) + 1;
      }

      if (!include || include.includes('salesByDate')) {
        const date = new Date(order.createdAt).toLocaleDateString();
        reportData.salesByDate[date] = (reportData.salesByDate[date] || 0) + 1;
      }

      if (!include || include.includes('productAnalytics')) {
        order.items.forEach(item => {
          const prodName = item.product.name;
          if (!reportData.productAnalytics[prodName]) {
            reportData.productAnalytics[prodName] = {
              sold: 0,
              revenue: 0,
              category: item.product.category
            };
          }
          reportData.productAnalytics[prodName].sold += item.quantity;
          reportData.productAnalytics[prodName].revenue += item.price * item.quantity;
        });
      }
    });

    res.json(reportData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ADMIN: get cross‑vendor report (only admin role should call)
exports.getAdminReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const orders = await Order.find({
      ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
    }).populate("items.vendor","name");

    // group by vendor and status
    const report = {};
    orders.forEach(o=>{
      o.items.forEach(i=>{
        const vid = i.vendor._id.toString();
        if(!report[vid]) report[vid]={vendor:i.vendor.name, totalOrders:0, revenue:0};
        report[vid].totalOrders++;
        report[vid].revenue += i.price * i.quantity;
        // could add status counts etc
      });
    });

    res.json(report);
  } catch(err){
    res.status(500).json({message:err.message});
  }
};

// Leave management for vendor support staff
exports.requestLeave = async (req,res)=>{
  try{
    const { startDate,endDate,reason } = req.body;
    const leave = await require('../models/LeaveRequest').create({
      user:req.user.id,
      vendor:req.user.role==='vendor'?req.user.id:null,
      startDate, endDate, reason
    });
    res.status(201).json({message:'Leave requested',leave});
  }catch(err){res.status(500).json({message:err.message});}
};

exports.getMyLeaves = async (req,res)=>{
  try{
    const filter = { user:req.user.id };
    if(req.user.role==='vendor') filter.vendor=req.user.id;
    const leaves = await require('../models/LeaveRequest').find(filter).sort({createdAt:-1});
    res.json(leaves);
  }catch(err){res.status(500).json({message:err.message});}
};

// Get notifications dashboard
exports.getNotificationsSummary = async (req, res) => {
  try {
    const vendorId = req.user.id;

    const pendingOrders = await Order.countDocuments({
      "items.vendor": vendorId,
      status: "Pending"
    });

    const pendingReturns = await ReturnRequest.countDocuments({
      vendor: vendorId,
      status: "pending"
    });

    const openDisputes = await Dispute.countDocuments({
      vendor: vendorId,
      status: { $in: ["open", "in-review"] }
    });

    const unreadMessages = await VendorMessage.countDocuments({
      recipient: vendorId,
      isRead: false
    });

    const lowStockProducts = await Inventory.countDocuments({
      vendor: vendorId,
      isLowStock: true
    });

    res.json({
      pendingOrders,
      pendingReturns,
      openDisputes,
      unreadMessages,
      lowStockProducts,
      totalAlertsCount: pendingOrders + pendingReturns + openDisputes + unreadMessages + lowStockProducts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
