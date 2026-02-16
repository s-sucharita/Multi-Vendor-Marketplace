import { useEffect, useState } from "react";
import API from "../api";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await API.get("/orders/my-orders");
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50 p-8">
        <h2 className="text-2xl font-bold mb-6">My Orders</h2>

        {loading ? (
          <p>Loading orders...</p>
        ) : orders.length === 0 ? (
          <p>You have not placed any orders yet.</p>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div
                key={order._id}
                className="bg-white p-4 rounded shadow flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">Order #{order._id}</p>

                  <p className="text-sm text-gray-600">
                    {order.items?.map(i => i.productName).join(", ")}
                  </p>

                  {/* STATUS */}
                  <span
                    className={`inline-block mt-1 px-3 py-1 rounded text-white text-sm ${
                      order.status === "Delivered"
                        ? "bg-green-600"
                        : order.status === "Shipped"
                        ? "bg-blue-500"
                        : order.status === "Processing"
                        ? "bg-yellow-500"
                        : "bg-gray-400"
                    }`}
                  >
                    {order.status}
                  </span>

                  <p className="mt-1">
                    Total: ₹{order.totalPrice?.toLocaleString()}
                  </p>
                </div>

                <Link
                  to={`/order/${order._id}`}
                  className="text-indigo-600 font-medium"
                >
                  View →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
