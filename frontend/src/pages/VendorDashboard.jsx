import React, { useState, useEffect } from "react";
import API from "../api";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

export default function VendorDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [returns, setReturns] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState(null);
  const [salesSummary, setSalesSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
const [selectedMessageId, setSelectedMessageId] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));

  const sendReply = async (messageId) => {
  if (!replyText.trim()) return;

  try {
    await API.post(`/vendor/messages/${messageId}/reply`, {
      message: replyText
    });

    setReplyText("");
    setSelectedMessageId(null);
    fetchDashboardData();

  } catch (error) {
    alert("Failed to send reply");
  }
};

  // Check if user is vendor
  if (user?.role !== "vendor") {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-12 text-center max-w-md">
            <p className="text-2xl text-gray-500 mb-6">⛔ Access Denied - Vendor Only</p>
            <Link to="/" className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition font-bold">
              Back to Home
            </Link>
          </div>
        </div>
      </>
    );
  }

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [productsRes, ordersRes, returnsRes, disputesRes, messagesRes, notificationsRes, summaryRes] = await Promise.all([
        API.get("/vendor/products"),
        API.get("/vendor/orders"),
        API.get("/vendor/returns"),
        API.get("/vendor/disputes"),
        API.get("/vendor/messages"),
        API.get("/vendor/dashboard/notifications"),
        API.get("/vendor/reports/summary")
      ]);

      setProducts(productsRes.data);
      setOrders(ordersRes.data);
      setReturns(returnsRes.data);
      setDisputes(disputesRes.data);
      setMessages(messagesRes.data);
      setNotifications(notificationsRes.data);
      setSalesSummary(summaryRes.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    const name = e.target.productName.value;
    const description = e.target.productDesc.value;
    const price = e.target.productPrice.value;
    const category = e.target.productCategory.value;
    const stock = e.target.productStock.value;
    // collect any image URL inputs currently present in the form
    const images = Array.from(e.target.querySelectorAll('input[name="productImageUrl"]')).map(i=>i.value).filter(Boolean);

    try {
      await API.post("/vendor/products", { 
        name, 
        description, 
        price: parseFloat(price), 
        category, 
        stock: parseInt(stock),
        images
      });
      alert("Product created successfully!");
      fetchDashboardData();
      e.target.reset();
    } catch (error) {
      alert("Error creating product: " + error.response?.data?.message);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await API.put(`/vendor/orders/${orderId}/status`, { status: newStatus });
      alert("Order status updated!");
      fetchDashboardData();
    } catch (error) {
      alert("Error updating order: " + error.response?.data?.message);
    }
  };

  const handleApproveReturn = async (returnId) => {
    try {
      await API.post(`/vendor/returns/${returnId}/approve`, { 
        vendorResponse: "Return approved", 
        expectedReturnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] 
      });
      alert("Return approved!");
      fetchDashboardData();
    } catch (error) {
      alert("Error approving return: " + error.response?.data?.message);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await API.delete(`/vendor/products/${id}`);
      alert("Product deleted successfully");
      fetchDashboardData();
    } catch (err) {
      alert("Failed to delete product");
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <h2 className="text-2xl">Loading...</h2>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50" style={{ padding: "20px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "20px" }}>📊 Vendor Dashboard</h1>

          {/* Navigation Tabs */}
          <div style={{ marginBottom: "20px", borderBottom: "2px solid #ddd", display: "flex", gap: "10px" }}>
            {["overview", "products", "orders", "returns", "disputes", "messages", "reports"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "10px 20px",
                  backgroundColor: activeTab === tab ? "#2196F3" : "#f0f0f0",
                  color: activeTab === tab ? "white" : "black",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  textTransform: "capitalize",
                  fontWeight: activeTab === tab ? "bold" : "normal"
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <>
              {notifications && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "15px", marginBottom: "20px" }}>
                  <div style={{ backgroundColor: "#e3f2fd", padding: "15px", borderRadius: "5px", textAlign: "center" }}>
                    <h3 style={{ fontSize: "24px", fontWeight: "bold" }}>📦 {notifications.pendingOrders}</h3>
                    <p>Pending Orders</p>
                  </div>
                  <div style={{ backgroundColor: "#f3e5f5", padding: "15px", borderRadius: "5px", textAlign: "center" }}>
                    <h3 style={{ fontSize: "24px", fontWeight: "bold" }}>🔄 {notifications.pendingReturns}</h3>
                    <p>Return Requests</p>
                  </div>
                  <div style={{ backgroundColor: "#fff3e0", padding: "15px", borderRadius: "5px", textAlign: "center" }}>
                    <h3 style={{ fontSize: "24px", fontWeight: "bold" }}>⚠️ {notifications.openDisputes}</h3>
                    <p>Open Disputes</p>
                  </div>
                  <div style={{ backgroundColor: "#f1f8e9", padding: "15px", borderRadius: "5px", textAlign: "center" }}>
                    <h3 style={{ fontSize: "24px", fontWeight: "bold" }}>💬 {notifications.unreadMessages}</h3>
                    <p>Unread Messages</p>
                  </div>
                  <div style={{ backgroundColor: "#ffe0b2", padding: "15px", borderRadius: "5px", textAlign: "center" }}>
                    <h3 style={{ fontSize: "24px", fontWeight: "bold" }}>📉 {notifications.lowStockProducts}</h3>
                    <p>Low Stock Items</p>
                  </div>
                </div>
              )}

              {salesSummary && (
                <div style={{ backgroundColor: "#e8f5e9", padding: "15px", marginBottom: "20px", borderRadius: "5px" }}>
                  <h3 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "10px" }}>💰 Sales Summary ({salesSummary.period})</h3>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <tbody>
                      <tr style={{ borderBottom: "1px solid #ddd" }}>
                        <td style={{ padding: "10px" }}>Total Revenue</td>
                        <td style={{ padding: "10px", fontWeight: "bold" }}>${salesSummary.metrics.totalRevenue}</td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid #ddd" }}>
                        <td style={{ padding: "10px" }}>Total Orders</td>
                        <td style={{ padding: "10px", fontWeight: "bold" }}>{salesSummary.metrics.totalOrders}</td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid #ddd" }}>
                        <td style={{ padding: "10px" }}>Completed Orders</td>
                        <td style={{ padding: "10px", fontWeight: "bold" }}>{salesSummary.metrics.completedOrders}</td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid #ddd" }}>
                        <td style={{ padding: "10px" }}>Avg Order Value</td>
                        <td style={{ padding: "10px", fontWeight: "bold" }}>${salesSummary.metrics.avgOrderValue}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: "10px" }}>Conversion Rate</td>
                        <td style={{ padding: "10px", fontWeight: "bold" }}>{salesSummary.metrics.conversionRate}%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* PRODUCTS TAB */}
          {activeTab === "products" && (
            <>
              <div style={{ backgroundColor: "#fff3e0", padding: "15px", marginBottom: "20px", borderRadius: "5px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "10px" }}>➕ Add New Product</h3>
                <form onSubmit={handleCreateProduct}>
                  <div style={{ marginBottom: "10px" }}>
                    <label>Product Name: </label>
                    <input name="productName" type="text" required style={{ width: "300px", padding: "8px", marginLeft: "10px" }} />
                  </div>
                  <div style={{ marginBottom: "10px" }}>
                    <label>Description: </label>
                    <textarea name="productDesc" style={{ width: "400px", height: "80px", padding: "8px", marginLeft: "10px" }} />
                  </div>
                  <div style={{ marginBottom: "10px" }}>
                    <label>Price: </label>
                    <input name="productPrice" type="number" step="0.01" required style={{ width: "150px", padding: "8px", marginLeft: "10px" }} />
                  </div>
                  <div style={{ marginBottom: "10px" }}>
                    <label>Category: </label>
                    <input name="productCategory" type="text" style={{ width: "200px", padding: "8px", marginLeft: "10px" }} />
                  </div>
                  <div style={{ marginBottom: "10px" }}>
                    <label>Initial Stock: </label>
                    <input name="productStock" type="number" required style={{ width: "150px", padding: "8px", marginLeft: "10px" }} />
                  </div>
                  <div style={{ marginBottom: "10px" }}>
                    {/* image URLs handled via separate UI if needed */}
                    {/* removed primary image input */}
                  </div>
                  <button type="submit" style={{ padding: "8px 15px", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                    Create Product
                  </button>
                </form>
              </div>

              <h3>📦 Your Products ({products.length})</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "15px" }}>
                {products.map((product) => (
                  <div key={product._id} style={{ backgroundColor: "white", padding: "15px", borderRadius: "5px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", border: "1px solid #ddd" }}>
                    <h4 style={{ fontWeight: "bold", marginBottom: "8px" }}>{product.name}</h4>
                    <p style={{ fontSize: "14px", color: "#666", marginBottom: "8px" }}>{product.description?.slice(0, 50)}...</p>
                    <p style={{ fontSize: "14px", marginBottom: "5px" }}><strong>Price:</strong> ${product.price}</p>
                    <p style={{ fontSize: "14px", marginBottom: "10px" }}><strong>Stock:</strong> {product.stock}</p>
                    <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                      <Link
                        to={`/vendor/edit-product/${product._id}`}
                        style={{ flex: 1, padding: "6px", backgroundColor: "#2196F3", color: "white", border: "none", borderRadius: "3px", cursor: "pointer", textAlign: "center", textDecoration: "none" }}
                      >
                        ✏️ Edit
                      </Link>
                    </div>
                    <button
                      onClick={() => deleteProduct(product._id)}
                      style={{ width: "100%", padding: "6px", backgroundColor: "#f44336", color: "white", border: "none", borderRadius: "3px", cursor: "pointer" }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ORDERS TAB */}
          {activeTab === "orders" && (
            <>
              <h3>📋 Your Orders ({orders.length})</h3>
              <div style={{ maxHeight: "600px", overflowY: "auto" }}>
                {orders.length === 0 ? (
                  <p>No orders yet.</p>
                ) : (
                  orders.map((order) => (
                    <div key={order._id} style={{ padding: "15px", marginBottom: "15px", border: "1px solid #ddd", borderRadius: "4px", backgroundColor: "#fafafa" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <div>
                          <h4>Order #{order._id.slice(-6).toUpperCase()}</h4>
                          <p>Customer: {order.customer?.name}</p>
                          <p>Total: ${order.totalPrice}</p>
                          <p>Status: <span style={{ color: order.status === "Delivered" ? "green" : "orange" }}>{order.status}</span></p>
                        </div>
                        <select
                          defaultValue=""
                          onChange={(e) => {
                            if (e.target.value) {
                              handleUpdateOrderStatus(order._id, e.target.value);
                              e.target.value = "";
                            }
                          }}
                          style={{ padding: "5px", height: "fit-content" }}
                        >
                          <option value="">Change Status</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                      </div>
                      {/* product list */}
                      {order.items && order.items.length > 0 && (
                        <div style={{ marginTop: "10px" }}>
                          <h5 style={{ fontWeight: "bold" }}>Items</h5>
                          <ul>
                            {order.items.map(item => (
                              <li key={item._id} style={{ display: "flex", alignItems: "center", marginBottom: "6px" }}>
                                {item.productImage && (
                                  <img src={item.productImage} alt={item.productName} className="w-12 h-12 object-cover rounded mr-2" />
                                )}
                                <span>{item.productName} x {item.quantity} (@ ₹{item.price})</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {/* RETURNS TAB */}
          {activeTab === "returns" && (
            <>
              <h3>🔄 Return Requests ({returns.length})</h3>
              <div style={{ maxHeight: "600px", overflowY: "auto" }}>
                {returns.length === 0 ? (
                  <p>No return requests.</p>
                ) : (
                  returns.map((returnReq) => (
                    <div key={returnReq._id} style={{ padding: "15px", marginBottom: "15px", border: "1px solid #ddd", borderRadius: "4px", backgroundColor: "#f3e5f5" }}>
                      <h4>Return #{returnReq._id.slice(-6)}</h4>
                      <p>Product: {returnReq.product?.name}</p>
                      <p>Customer: {returnReq.customer?.name}</p>
                      <p>Reason: {returnReq.reason}</p>
                      <p>Refund: ${returnReq.refundAmount}</p>
                      <p>Status: {returnReq.status}</p>
                      {returnReq.status === "pending" && (
                        <button
                          onClick={() => handleApproveReturn(returnReq._id)}
                          style={{ padding: "5px 10px", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", marginTop: "10px" }}
                        >
                          Approve Return
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {/* DISPUTES TAB */}
          {activeTab === "disputes" && (
            <>
              <h3>⚠️ Disputes ({disputes.length})</h3>
              <div style={{ maxHeight: "600px", overflowY: "auto" }}>
                {disputes.length === 0 ? (
                  <p>No disputes.</p>
                ) : (
                  disputes.map((dispute) => (
                    <div key={dispute._id} style={{ padding: "15px", marginBottom: "15px", border: "1px solid #ddd", borderRadius: "4px", backgroundColor: "#ffebee" }}>
                      <h4>{dispute.title}</h4>
                      <p>Customer: {dispute.customer?.name}</p>
                      <p>Category: {dispute.category}</p>
                      <p>Priority: {dispute.priority}</p>
                      <p>Status: {dispute.status}</p>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {/* MESSAGES TAB */}
          {activeTab === "messages" && (
            <>
              <h3>💬 Messages ({messages.length})</h3>
              <div style={{ maxHeight: "600px", overflowY: "auto" }}>
                {messages.length === 0 ? (
                  <p>No messages.</p>
                ) : (
                  messages.map((msg) => (
                    <div key={msg._id} style={{  padding: "15px",
      marginBottom: "15px",
      border: "1px solid #ddd",
      borderRadius: "4px",
      backgroundColor: msg.isRead ? "#ffffff" : "#e3f2fd" }}>
        <p><strong>From:</strong> {msg.sender?.name}</p>
    <p><strong>Subject:</strong> {msg.subject}</p>
    <p style={{ marginBottom: "8px" }}>{msg.message}</p>

    {/* Replies */}
    {msg.replies && msg.replies.length > 0 && (
      <div style={{ marginTop: "10px", paddingLeft: "10px", borderLeft: "3px solid #2196F3" }}>
        {msg.replies.map((reply, index) => (
          <p key={index} style={{ fontSize: "14px" }}>
            <strong>{reply.sender?.name}:</strong> {reply.message}
          </p>
        ))}
      </div>
    )}

    {/* Reply Box */}
    <textarea
      placeholder="Write reply..."
      value={selectedMessageId === msg._id ? replyText : ""}
      onChange={(e) => {
        setSelectedMessageId(msg._id);
        setReplyText(e.target.value);
      }}
      style={{ width: "100%", marginTop: "10px", padding: "8px" }}
    />

    <button
      onClick={() => sendReply(msg._id)}
      style={{
        marginTop: "8px",
        padding: "6px 12px",
        backgroundColor: "#2196F3",
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer"
      }}
    >
      Reply
    </button>
                      </div>
                  ))
                )}
              </div>
            </>
          )}

          {/* REPORTS TAB */}
          {activeTab === "reports" && (
            <>
              <h3>📊 Sales Analytics</h3>
              {salesSummary && (
                <div style={{ backgroundColor: "#e8f5e9", padding: "15px", borderRadius: "5px" }}>
                  <h4 style={{ marginBottom: "10px" }}>Summary Metrics ({salesSummary.period})</h4>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <tbody>
                      <tr style={{ borderBottom: "1px solid #ddd" }}>
                        <td style={{ padding: "10px" }}>Total Revenue</td>
                        <td style={{ padding: "10px", fontWeight: "bold" }}>${salesSummary.metrics.totalRevenue}</td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid #ddd" }}>
                        <td style={{ padding: "10px" }}>Total Orders</td>
                        <td style={{ padding: "10px", fontWeight: "bold" }}>{salesSummary.metrics.totalOrders}</td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid #ddd" }}>
                        <td style={{ padding: "10px" }}>Completed Orders</td>
                        <td style={{ padding: "10px", fontWeight: "bold" }}>{salesSummary.metrics.completedOrders}</td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid #ddd" }}>
                        <td style={{ padding: "10px" }}>Average Order Value</td>
                        <td style={{ padding: "10px", fontWeight: "bold" }}>${salesSummary.metrics.avgOrderValue}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: "10px" }}>Conversion Rate</td>
                        <td style={{ padding: "10px", fontWeight: "bold" }}>{salesSummary.metrics.conversionRate}%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
