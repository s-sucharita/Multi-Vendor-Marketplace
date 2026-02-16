import { useEffect, useState } from "react";
import API from "../api";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/orders/my-orders")
      .then(res => setOrders(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

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
                className="bg-white p-4 rounded-lg shadow flex justify-between items-center"
              >
                <div className="flex items-center">
                  {order.items && order.items[0]?.productImage && (
                    <img
                      src={order.items[0].productImage}
                      alt={order.items[0].productName}
                      className="w-16 h-16 object-cover mr-4"
                    />
                  )}
                  <div>
                    <p className="font-semibold">Order #{order._id}</p>
                    <p className="text-sm">
                      {order.items
                        .map(i => i.productName)
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                    <p>Status: {order.status}</p>
                    <p>Total: ₹{order.totalPrice.toLocaleString()}</p>
                  </div>
                </div>
                <Link
                  to={`/order/${order._id}`}
                  className="text-indigo-600 hover:underline"
                >
                  View
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
