import { useEffect, useState } from "react";
import API from "../api";
import Navbar from "../components/Navbar";

export default function VendorOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    API.get("/orders/vendor").then(res => setOrders(res.data));
  }, []);

  return (
    <>
      <Navbar />
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-6">Orders for My Products</h2>

        {orders.map(o => (
          <div key={o._id} className="border p-4 mb-4 rounded">
            <p>Order: {o._id}</p>
            <p>Status: {o.status}</p>
            <p>Total: ₹{o.totalPrice}</p>

            {o.items.map(i => (
              <p key={i.product}>
                {i.name} × {i.qty}
              </p>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
