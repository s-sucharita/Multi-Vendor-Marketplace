import { useEffect, useState } from "react";
import API from "../api";
import Navbar from "../components/Navbar";

export default function VendorOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      // ✅ correct backend route
      const res = await API.get("/orders/vendor/orders");
      setOrders(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, status) => {
    try {
      // ✅ correct backend route
      await API.put(`/orders/${orderId}/status`, { status });
      await fetchOrders();
      alert("Order updated");
    } catch (err) {
      console.error(err);
      alert("Failed to update");
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50 p-8">
        <h2 className="text-2xl font-bold mb-6">Vendor Orders</h2>

        {loading ? (
          <p>Loading...</p>
        ) : orders.length === 0 ? (
          <p>No orders yet.</p>
        ) : (
          orders.map(order => (
            <div key={order._id} className="bg-white shadow rounded p-4 mb-6">

              <div className="flex justify-between items-center mb-2">
                <p className="font-semibold">Order #{order._id}</p>
                <span className="text-sm px-3 py-1 rounded bg-indigo-100">
                  {order.status}
                </span>
              </div>

              <p>Total: ₹{order.totalPrice}</p>

              <div className="mt-3 space-y-2">
                {order.items.map(item => (
                  <div key={item._id} className="flex items-center gap-3">
                    {item.productImage && (
                      <img
                        src={item.productImage}
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}

                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-gray-600">
                        Qty: {item.quantity} — ₹{item.price}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* STATUS BUTTONS */}

              <div className="flex gap-3 mt-4">

                {order.status === "Pending" && (
                  <button
                    onClick={() => updateStatus(order._id, "Processing")}
                    className="px-4 py-2 bg-yellow-500 text-white rounded"
                  >
                    Mark Processing
                  </button>
                )}

                {order.status === "Processing" && (
                  <button
                    onClick={() => updateStatus(order._id, "Shipped")}
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                  >
                    Mark Shipped
                  </button>
                )}

                {order.status === "Shipped" && (
                  <button
                    onClick={() => updateStatus(order._id, "Delivered")}
                    className="px-4 py-2 bg-green-600 text-white rounded"
                  >
                    Mark Delivered
                  </button>
                )}

              </div>

            </div>
          ))
        )}
      </div>
    </>
  );
}
