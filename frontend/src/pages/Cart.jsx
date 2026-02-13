import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import API from "../api";
import { useState, useEffect } from "react";

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);

  // Load cart from server or localStorage
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.token) {
      API.get("/cart")
        .then(res => {
          const items = res.data.items.map(i => ({
            _id: i.product._id,
            name: i.product.name,
            image: (i.product.images && i.product.images.length>0) ? i.product.images[0] : i.product.image,
            price: i.price,
            qty: i.quantity
          }));
          setCartItems(items);
        })
        .catch(() => {
          const saved = JSON.parse(localStorage.getItem("cart")) || [];
          setCartItems(saved);
        });
    } else {
      const saved = JSON.parse(localStorage.getItem("cart")) || [];
      setCartItems(saved);
    }
  }, []);

  const removeFromCart = async (productId) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.token) {
      try {
        await API.delete("/cart/remove", { data: { productId } });
      } catch (err) {
        console.error(err);
      }
    }
    const updated = cartItems.filter(item => item._id !== productId);
    setCartItems(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const updateQuantity = async (productId, newQty) => {
    const qty = Math.max(1, newQty);
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.token) {
      try {
        await API.put("/cart/update", { productId, quantity: qty });
      } catch (err) {
        console.error(err);
      }
    }
    const updated = cartItems.map(item =>
      item._id === productId ? { ...item, qty } : item
    );
    setCartItems(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">🛒 Your Cart</h1>
          <p className="text-gray-600 text-lg mb-8">
            {cartItems.length} item{cartItems.length !== 1 ? "s" : ""} in your cart
          </p>

          {cartItems.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
              <p className="text-2xl text-gray-500 mb-6">Your cart is empty</p>
              <Link
                to="/"
                className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition font-bold"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="md:col-span-2 space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item._id}
                    className="bg-white rounded-lg shadow-md p-6 flex gap-6 items-center"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />

                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800">{item.name}</h3>
                      <p className="text-indigo-600 text-lg font-semibold">
                        ₹{item.price}
                      </p>
                    </div>

                    {/* Quantity */}
                    <div className="flex items-center gap-3 bg-gray-100 rounded-lg p-2">
                      <button
                        onClick={() => updateQuantity(item._id, item.qty - 1)}
                        className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 font-bold"
                      >
                        −
                      </button>
                      <span className="w-8 text-center font-bold text-lg">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => updateQuantity(item._id, item.qty + 1)}
                        className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 font-bold"
                      >
                        +
                      </button>
                    </div>

                    <p className="text-lg font-bold text-gray-800 w-24 text-right">
                      ₹{(item.price * item.qty).toLocaleString()}
                    </p>

                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-bold"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              {/* Checkout Summary */}
              <div className="md:col-span-1">
                <div className="bg-white rounded-lg shadow-lg p-6 sticky top-20">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    Order Summary
                  </h2>

                  <div className="space-y-3 border-b pb-4 mb-4">
                    <div className="flex justify-between text-gray-700">
                      <span>Subtotal:</span>
                      <span className="font-semibold">₹{totalPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Shipping:</span>
                      <span className="font-semibold text-green-600">Free</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Tax:</span>
                      <span className="font-semibold">
                        ₹{Math.round(totalPrice * 0.1).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between mb-6">
                    <span className="text-xl font-bold text-gray-800">Total:</span>
                    <span className="text-2xl font-bold text-indigo-600">
                      ₹{Math.round(totalPrice * 1.1).toLocaleString()}
                    </span>
                  </div>

                  <Link
                    to="/checkout"
                    className="block text-center w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 rounded-lg hover:shadow-lg transition"
                  >
                    Proceed to Checkout
                  </Link>

                  <Link
                    to="/"
                    className="block text-center w-full mt-3 border-2 border-indigo-600 text-indigo-600 font-bold py-3 rounded-lg hover:bg-indigo-50 transition"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
