import { Link } from "react-router-dom";
import { useState } from "react";

export default function Navbar() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <nav className="bg-linear-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        
        <Link to="/" className="text-3xl font-bold hover:text-indigo-200 transition">
          🛒 Grabbit
        </Link>

      
        <div className="flex space-x-8 items-center">
          <Link to="/" className="hover:text-indigo-200 transition text-lg font-medium">
            Home
          </Link>
          <Link to="/products" className="hover:text-indigo-200 transition text-lg font-medium">
            Products
          </Link>
          {/* quick category links */}
          <Link to="/products?category=electronics" className="hover:text-indigo-200 transition text-lg font-medium">
            Electronics
          </Link>
          <Link to="/products?category=fashion" className="hover:text-indigo-200 transition text-lg font-medium">
            Fashion
          </Link>
          <Link to="/products?category=cosmetics" className="hover:text-indigo-200 transition text-lg font-medium">
            Cosmetics
          </Link>
          <Link to="/products?category=home" className="hover:text-indigo-200 transition text-lg font-medium">
            Home
          </Link>
          <Link to="/products?category=books" className="hover:text-indigo-200 transition text-lg font-medium">
            Books
          </Link>
          <Link to="/products?category=sports" className="hover:text-indigo-200 transition text-lg font-medium">
            Sports
          </Link>
          <Link
  to="/vendor/orders"
  className="hover:text-indigo-200 transition text-lg font-medium"
>
  📦 Orders
</Link>
          <Link
            to="/cart"
            className="hover:text-indigo-200 transition text-lg font-medium"
          >
            🛍️ Cart
          </Link>
          {user && user.role === "customer" && (
            <>
              <Link to="/orders" className="hover:text-indigo-200 transition text-lg font-medium">
                📦 My Orders
              </Link>
              <Link to="/messages" className="hover:text-indigo-200 transition text-lg font-medium">
                💬 Messages
              </Link>
            </>
          )}

          {(user && (user.role === "vendor" || user.role === "admin")) && (
            <>
              <Link to="/reports" className="hover:text-indigo-200 transition text-lg font-medium">
                📊 Reports
              </Link>
              {user.role === "vendor" && (
                <Link to="/vendor/add-product" className="hover:text-indigo-200 transition text-lg font-medium">
                  ➕ Add Item
                </Link>
              )}
              {user.role === 'admin' ? (
                <Link to="/admin/leaves" className="hover:text-indigo-200 transition text-lg font-medium">
                  🏖️ Team Leaves
                </Link>
              ) : (
                <Link to="/leaves" className="hover:text-indigo-200 transition text-lg font-medium">
                  🏖️ Leave
                </Link>
              )}
            </>
          )}
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-4 relative">
          {!user ? (
            <>
              <Link
                to="/login"
                className="hover:text-indigo-200 transition text-lg font-medium"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-white text-indigo-600 px-6 py-2 rounded-lg hover:bg-gray-100 transition font-bold"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 hover:text-indigo-200 transition text-lg font-medium"
              >
                👤 {user.name} ▼
              </button>

              {/* Dropdown Menu */}
              {showMenu && (
                <div className="absolute right-0 mt-2 bg-white text-gray-800 rounded-lg shadow-lg z-50">
                  {user.role === "vendor" && (
                    <>
                      <Link
                        to="/vendor/dashboard"
                        className="block px-4 py-2 hover:bg-indigo-100 rounded-t-lg border-b"
                        onClick={() => setShowMenu(false)}
                      >
                        📊 Vendor Dashboard
                      </Link>
                      <Link
                        to="/vendor/add-product"
                        className="block px-4 py-2 hover:bg-indigo-100 border-b"
                        onClick={() => setShowMenu(false)}
                      >
                        ➕ Add Product
                      </Link>
                    </>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setShowMenu(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-100 rounded-b-lg font-bold"
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
