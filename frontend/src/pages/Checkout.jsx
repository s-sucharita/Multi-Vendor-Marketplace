import { useState, useEffect } from "react";
import API from "../api";
import Navbar from "../components/Navbar";
import { useNavigate, Link } from "react-router-dom";



export default function Checkout() {
  const [cartItems, setCartItems] = useState([]);
  // track whether we've loaded the cart from server (so we don't wipe it later)
  const [serverCartLoaded, setServerCartLoaded] = useState(false);



  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadCart = async () => {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user && user.token) {
        try {
          const res = await API.get("/cart");
          const items = res.data.items.map(i => ({
            _id: i.product._id,
            name: i.product.name,
            image: (i.product.images && i.product.images.length > 0) ? i.product.images[0] : i.product.image,
            price: i.price,
            qty: i.quantity
          }));
          setCartItems(items);
          setServerCartLoaded(true);
          return;
        } catch (err) {
          console.error("Failed to fetch server cart", err);
          // fall through to local storage fallback
        }
      }

      const saved = JSON.parse(localStorage.getItem("cart")) || [];
      setCartItems(saved);
    };

    loadCart();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const tax = Math.round(totalPrice * 0.1);
  const finalTotal = totalPrice + tax;

  const [paymentMethod, setPaymentMethod] = useState("cod");

const placeOrder = async (e) => {
  e.preventDefault();

  if (paymentMethod === "razorpay") {
    alert("Payment Successful (Demo)");
    localStorage.removeItem("cart");
    navigate("/");
    return;
  }

  // COD DEMO
  alert("Order placed (COD Demo)");
  localStorage.removeItem("cart");
  navigate("/");
};





  if (cartItems.length === 0) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-12 text-center max-w-md">
            <p className="text-2xl text-gray-500 mb-6">Your cart is empty!</p>
            <Link
              to="/"
              className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition font-bold"
            >
              Back to Shopping
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-10">
            📦 Complete Your Order
          </h1>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Shipping Form */}
            <div className="md:col-span-2">
              <form onSubmit={placeOrder} className="space-y-6">
                {/* Shipping Information */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    Shipping Address
                  </h2>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Payment Method
                    </label>
                    <select
  value={paymentMethod}
  onChange={(e) => setPaymentMethod(e.target.value)}
  className="w-full border-2 border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:border-indigo-600"
>
  <option value="cod">Cash on Delivery</option>
<option value="razorpay">Razorpay (Demo)</option>
</select>

                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        className="w-full border-2 border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:border-indigo-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        className="w-full border-2 border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:border-indigo-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full border-2 border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:border-indigo-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="w-full border-2 border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:border-indigo-600"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Address
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="123 Main Street"
                        required
                        className="w-full border-2 border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:border-indigo-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                        className="w-full border-2 border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:border-indigo-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        State
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        required
                        className="w-full border-2 border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:border-indigo-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        ZIP Code
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                        required
                        className="w-full border-2 border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:border-indigo-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Order Items Preview */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    Order Items
                  </h2>
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <div key={item._id} className="flex justify-between border-b pb-3">
                        <div>
                          <p className="font-semibold text-gray-800">{item.name}</p>
                          <p className="text-sm text-gray-600">
                            Qty: {item.qty} × ₹{item.price}
                          </p>
                        </div>
                        <p className="font-bold text-gray-800">
                          ₹{(item.price * item.qty).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Place Order Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-4 rounded-lg hover:shadow-lg transition disabled:opacity-50 text-lg"
                >
                  {loading ? "Processing..." : "Place Order Now"}
                </button>
              </form>
            </div>

            {/* Order Summary */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6 sticky top-20">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  Order Summary
                </h2>

                <div className="space-y-3 border-b pb-4 mb-4">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal:</span>
                    <span className="font-semibold">
                      ₹{totalPrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Shipping:</span>
                    <span className="font-semibold text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Tax (10%):</span>
                    <span className="font-semibold">₹{tax.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex justify-between mb-6">
                  <span className="text-xl font-bold text-gray-800">Total:</span>
                  <span className="text-2xl font-bold text-green-600">
                    ₹{finalTotal.toLocaleString()}
                  </span>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
                  <p className="text-sm text-blue-700">
                    ✓ Secure payment processing
                  </p>
                  <p className="text-sm text-blue-700">
                    ✓ 30-day return policy
                  </p>
                  <p className="text-sm text-blue-700">
                    ✓ 100% authentic products
                  </p>
                </div>

                <Link
                  to="/cart"
                  className="block text-center mt-6 border-2 border-indigo-600 text-indigo-600 font-bold py-2 rounded-lg hover:bg-indigo-50 transition"
                >
                  Back to Cart
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
