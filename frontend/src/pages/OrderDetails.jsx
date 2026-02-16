import { useEffect, useState } from "react";

import { useParams, useNavigate } from "react-router-dom";
import API from "../api";
import Navbar from "../components/Navbar";

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
  const fetchOrder = () => {
    API.get(`/orders/${id}`)
      .then(res => setOrder(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  fetchOrder();

  const interval = setInterval(fetchOrder, 3000);
  return () => clearInterval(interval);
}, [id]);

  if (loading)
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <p>Loading order...</p>
        </div>
      </>
    );

  if (!order) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <p>Order not found.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 p-8">
        <button
          onClick={() => navigate(-1)}
          className="text-indigo-600 hover:underline mb-4"
        >
          ← Back
        </button>
        <h2 className="text-2xl font-bold mb-4">Order #{order._id}</h2>
        <p>Status: {order.status}</p>
        <p>Total: ₹{order.totalPrice.toLocaleString()}</p>
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Items</h3>
          <ul className="space-y-2">
            {order.items.map(item => (
              <li key={item._id} className="flex justify-between items-center">
                <div className="flex items-center">
                  {item.product?.image && (
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-12 h-12 object-cover mr-2"
                    />
                  )}
                  <span>{item.product?.name || "Unknown"}</span>
                </div>
                <span>{item.quantity} × ₹{item.price}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
