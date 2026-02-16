import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";
import Navbar from "../components/Navbar";

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await API.get(`/orders/${id}`);
        setOrder(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();

    // auto refresh every 3s
    const interval = setInterval(fetchOrder, 3000);

    return () => clearInterval(interval);
  }, [id]);

  if (loading)
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          Loading order...
        </div>
      </>
    );

  if (!order)
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          Order not found.
        </div>
      </>
    );

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50 p-8">

        <button
          onClick={() => navigate(-1)}
          className="text-indigo-600 mb-4"
        >
          ← Back
        </button>

        <h2 className="text-2xl font-bold mb-2">
          Order #{order._id}
        </h2>

        {/* STATUS */}
        <span
          className={`inline-block px-3 py-1 rounded text-white ${
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

        <p className="mt-2 font-medium">
          Total: ₹{order.totalPrice?.toLocaleString()}
        </p>

        {/* ITEMS */}
        <div className="mt-6">
          <h3 className="font-semibold mb-3">Items</h3>

          {order.items.map(item => (
            <div
              key={item._id}
              className="flex justify-between items-center border-b pb-3 mb-3"
            >

              <div className="flex items-center gap-3">

                {item.product?.image && (
                  <img
                    src={item.product.image}
                    alt=""
                    className="w-12 h-12 rounded object-cover"
                  />
                )}

                <div>
                  <p className="font-medium">
                    {item.product?.name}
                  </p>

                  {/* VENDOR NAME */}
                  {item.vendor?.name && (
                    <p className="text-sm text-gray-500">
                      Sold by: {item.vendor.name}
                    </p>
                  )}
                </div>

              </div>

              <span>
                {item.quantity} × ₹{item.price}
              </span>

            </div>
          ))}
        </div>

      </div>
    </>
  );
}
