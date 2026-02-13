import React, { useState, useEffect } from "react";
import axios from "axios";

const AdminDashboard = () => {
  const [vendors, setVendors] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState(null);
  const [marketplaceReport, setMarketplaceReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = "http://localhost:5000/api/admin";
  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json"
  };

  // Fetch all vendors
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch vendors
      const vendorsRes = await axios.get(`${API_URL}/vendors`, { headers });
      setVendors(vendorsRes.data);

      // Fetch tasks
      const tasksRes = await axios.get(`${API_URL}/tasks`, { headers });
      setTasks(tasksRes.data);

      // Fetch pending approvals
      const approvalsRes = await axios.get(`${API_URL}/pending-approvals`, { headers });
      setPendingApprovals(approvalsRes.data);

      // Fetch marketplace report
      const reportRes = await axios.get(`${API_URL}/reports/marketplace`, { headers });
      setMarketplaceReport(reportRes.data);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  // Assign a new task
  const handleAssignTask = async (e) => {
    e.preventDefault();
    const vendorId = document.getElementById("vendorSelect").value;
    const title = document.getElementById("taskTitle").value;
    const description = document.getElementById("taskDesc").value;
    const deadline = document.getElementById("taskDeadline").value;
    const priority = document.getElementById("taskPriority").value;

    try {
      await axios.post(
        `${API_URL}/tasks/assign`,
        { vendorId, title, description, deadline, priority, category: "other" },
        { headers }
      );
      alert("Task assigned successfully!");
      fetchData();
      e.target.reset();
    } catch (error) {
      alert("Failed to assign task: " + error.response?.data?.message);
    }
  };

  // Set performance goal
  const handleCreateGoal = async (e) => {
    e.preventDefault();
    const vendorId = document.getElementById("goalVendor").value;
    const goalType = document.getElementById("goalType").value;
    const targetValue = document.getElementById("goalTarget").value;
    const deadline = document.getElementById("goalDeadline").value;

    try {
      await axios.post(
        `${API_URL}/goals`,
        {
          vendorId,
          goalType,
          targetValue,
          unit: "$",
          deadline,
          description: `Target: ${targetValue}`,
          reward: "Commission bonus"
        },
        { headers }
      );
      alert("Goal created successfully!");
      e.target.reset();
    } catch (error) {
      alert("Failed to create goal: " + error.response?.data?.message);
    }
  };

  // Update vendor status
  const handleUpdateVendorStatus = async (vendorId, newStatus) => {
    try {
      await axios.put(
        `${API_URL}/vendors/${vendorId}/status`,
        { status: newStatus },
        { headers }
      );
      alert("Vendor status updated!");
      fetchData();
    } catch (error) {
      alert("Failed to update status: " + error.response?.data?.message);
    }
  };

  // Get vendor report
  const handleGenerateReport = async (vendorId) => {
    try {
      const res = await axios.get(
        `${API_URL}/reports/vendor/${vendorId}?days=30`,
        { headers }
      );
      alert(`Report: ${JSON.stringify(res.data, null, 2)}`);
    } catch (error) {
      alert("Failed to generate report: " + error.response?.data?.message);
    }
  };

  if (loading) {
    return <div className="admin-dashboard"><h2>Loading...</h2></div>;
  }

  return (
    <div className="admin-dashboard" style={{ padding: "20px" }}>
      <h1>Admin Dashboard</h1>

      {/* Pending Approvals Summary */}
      {pendingApprovals && (
        <div style={{ backgroundColor: "#f0f0f0", padding: "15px", marginBottom: "20px", borderRadius: "5px" }}>
          <h3>📋 Pending Approvals</h3>
          <p><strong>Compliance Reviews:</strong> {pendingApprovals.pendingCompliance}</p>
          <p><strong>Pending Tasks:</strong> {pendingApprovals.pendingTasks}</p>
          <p><strong>Vendor Registrations:</strong> {pendingApprovals.pendingVendorRegistrations}</p>
          <p><strong>Disputes:</strong> {pendingApprovals.disputes}</p>
          <p style={{ fontSize: "18px", color: "red" }}>
            <strong>Total Pending: {pendingApprovals.totalPending}</strong>
          </p>
        </div>
      )}

      {/* Marketplace Report */}
      {marketplaceReport && (
        <div style={{ backgroundColor: "#e8f5e9", padding: "15px", marginBottom: "20px", borderRadius: "5px" }}>
          <h3>📊 Marketplace Overview (Last {marketplaceReport.summary ? "30" : ""} days)</h3>
          {marketplaceReport.summary && (
            <>
              <p><strong>Total Vendors:</strong> {marketplaceReport.summary.totalVendors}</p>
              <p><strong>Active Vendors:</strong> {marketplaceReport.summary.activeVendors}</p>
              <p><strong>Total Orders:</strong> {marketplaceReport.summary.totalOrders}</p>
              <p><strong>Products Listed:</strong> {marketplaceReport.summary.totalProductsListed}</p>
              <p><strong>Overdue Tasks:</strong> {marketplaceReport.summary.overdueTasks}</p>
            </>
          )}
        </div>
      )}

      {/* Task Assignment */}
      <div style={{ backgroundColor: "#fff3e0", padding: "15px", marginBottom: "20px", borderRadius: "5px" }}>
        <h3>✅ Assign Task</h3>
        <form onSubmit={handleAssignTask}>
          <div style={{ marginBottom: "10px" }}>
            <label>Vendor: </label>
            <select id="vendorSelect" required style={{ width: "200px", padding: "5px" }}>
              <option value="">Select Vendor</option>
              {vendors.map((vendor) => (
                <option key={vendor._id} value={vendor._id}>
                  {vendor.name}
                </option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>Task Title: </label>
            <input
              id="taskTitle"
              type="text"
              placeholder="e.g., Update Listings"
              required
              style={{ width: "300px", padding: "5px" }}
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>Description: </label>
            <textarea
              id="taskDesc"
              placeholder="Task details..."
              style={{ width: "300px", height: "80px", padding: "5px" }}
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>Deadline: </label>
            <input id="taskDeadline" type="date" required style={{ padding: "5px" }} />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>Priority: </label>
            <select id="taskPriority" style={{ padding: "5px" }}>
              <option>low</option>
              <option selected>medium</option>
              <option>high</option>
            </select>
          </div>
          <button type="submit" style={{ padding: "8px 15px", backgroundColor: "#2196F3", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
            Assign Task
          </button>
        </form>
      </div>

      {/* Performance Goal */}
      <div style={{ backgroundColor: "#f3e5f5", padding: "15px", marginBottom: "20px", borderRadius: "5px" }}>
        <h3>🎯 Set Performance Goal</h3>
        <form onSubmit={handleCreateGoal}>
          <div style={{ marginBottom: "10px" }}>
            <label>Vendor: </label>
            <select id="goalVendor" required style={{ width: "200px", padding: "5px" }}>
              <option value="">Select Vendor</option>
              {vendors.map((vendor) => (
                <option key={vendor._id} value={vendor._id}>
                  {vendor.name}
                </option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>Goal Type: </label>
            <select id="goalType" style={{ width: "200px", padding: "5px" }}>
              <option>sales-target</option>
              <option>product-listings</option>
              <option>order-fulfillment</option>
            </select>
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>Target Value: </label>
            <input id="goalTarget" type="number" placeholder="e.g., 10000" required style={{ padding: "5px" }} />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>Deadline: </label>
            <input id="goalDeadline" type="date" required style={{ padding: "5px" }} />
          </div>
          <button type="submit" style={{ padding: "8px 15px", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
            Create Goal
          </button>
        </form>
      </div>

      {/* Vendors List */}
      <div style={{ marginBottom: "20px" }}>
        <h3>📱 Vendors ({vendors.length})</h3>
        <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "white" }}>
          <thead>
            <tr style={{ backgroundColor: "#f5f5f5", borderBottom: "2px solid #ddd" }}>
              <th style={{ padding: "10px", textAlign: "left" }}>Name</th>
              <th style={{ padding: "10px", textAlign: "left" }}>Business</th>
              <th style={{ padding: "10px", textAlign: "left" }}>Status</th>
              <th style={{ padding: "10px", textAlign: "left" }}>Rating</th>
              <th style={{ padding: "10px", textAlign: "left" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((vendor) => (
              <tr key={vendor._id} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={{ padding: "10px" }}>{vendor.name}</td>
                <td style={{ padding: "10px" }}>{vendor.businessName || "-"}</td>
                <td style={{ padding: "10px" }}>
                  <span style={{
                    padding: "4px 8px",
                    borderRadius: "4px",
                    backgroundColor: vendor.status === "active" ? "#c8e6c9" : "#ffcdd2",
                    color: vendor.status === "active" ? "green" : "red"
                  }}>
                    {vendor.status}
                  </span>
                </td>
                <td style={{ padding: "10px" }}>{vendor.averageRating || 0} ⭐</td>
                <td style={{ padding: "10px" }}>
                  <button
                    onClick={() => handleGenerateReport(vendor._id)}
                    style={{ marginRight: "5px", padding: "5px 10px", fontSize: "12px" }}
                  >
                    Report
                  </button>
                  <select
                    defaultValue=""
                    onChange={(e) => {
                      if (e.target.value) {
                        handleUpdateVendorStatus(vendor._id, e.target.value);
                        e.target.value = "";
                      }
                    }}
                    style={{ padding: "5px", fontSize: "12px" }}
                  >
                    <option value="">Change Status</option>
                    <option value="active">Activate</option>
                    <option value="suspended">Suspend</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tasks List */}
      <div>
        <h3>📝 Recent Tasks ({tasks.length})</h3>
        <div style={{ maxHeight: "400px", overflowY: "auto" }}>
          {tasks.length === 0 ? (
            <p>No tasks assigned yet.</p>
          ) : (
            tasks.slice(0, 10).map((task) => (
              <div
                key={task._id}
                style={{
                  padding: "10px",
                  marginBottom: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  backgroundColor: "#fafafa"
                }}
              >
                <strong>{task.title}</strong>
                <p style={{ margin: "5px 0", fontSize: "14px" }}>
                  Vendor: {task.vendorId?.name} | 
                  Status: <span style={{ color: task.status === "completed" ? "green" : "orange" }}>{task.status}</span> |
                  Due: {new Date(task.deadline).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
