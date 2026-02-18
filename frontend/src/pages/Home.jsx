import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();


  useEffect(() => {
    API.get("/products")
      .then(res => setProducts(res.data))
      .catch(err => {alert("Failed to load products")
        console.log(err.response);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section className="bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-24 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight">
            🛒 Welcome to Grabbit
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Shop from multiple vendors • Best deals • Trusted sellers • Fast delivery
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for products, vendors, or categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-6 py-4 rounded-lg text-gray-800 text-lg focus:outline-none focus:ring-4 focus:ring-white shadow-lg"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition font-bold">
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-10 grid md:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-4xl font-bold text-indigo-600 mb-2">10K+</p>
            <p className="text-gray-700 font-semibold">Products</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-purple-600 mb-2">500+</p>
            <p className="text-gray-700 font-semibold">Vendors</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-pink-600 mb-2">100K+</p>
            <p className="text-gray-700 font-semibold">Happy Customers</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-green-600 mb-2">24/7</p>
            <p className="text-gray-700 font-semibold">Customer Support</p>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">
            Shop by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
  {["electronics", "fashion", "home", "books", "sports"].map((cat) => (
    <button
      key={cat}
      onClick={() => navigate(`/products?category=${cat}`)}
      className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition font-bold text-gray-800 hover:text-indigo-600"
    >
      {cat.toUpperCase()}
    </button>
  ))}
</div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-10">
            <h2 className="text-4xl font-bold text-gray-800 mb-2">
              Featured Products
            </h2>
            <p className="text-gray-600 text-lg">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""} available
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-2xl text-gray-600">Loading amazing products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
              <p className="text-2xl text-gray-500 mb-4">No products found</p>
              <button
                onClick={() => setSearchTerm("")}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition font-bold"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trust Section */}
      <section className="bg-indigo-50 py-12 mt-10">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Why Choose Grabbit?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition">
              <p className="text-4xl mb-4">🛡️</p>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Secure & Safe
              </h3>
              <p className="text-gray-600">
                Your transactions are protected with advanced encryption technology
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition">
              <p className="text-4xl mb-4">📦</p>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Fast Shipping
              </h3>
              <p className="text-gray-600">
                Get your orders delivered quickly with multiple shipping options
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition">
              <p className="text-4xl mb-4">💯</p>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Authentic Products
              </h3>
              <p className="text-gray-600">
                All products are verified and guaranteed to be 100% authentic
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">🛒 Grabbit</h3>
              <p className="text-gray-400">
                Your one-stop marketplace for everything
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-3">Quick Links</h4>
              <ul className="text-gray-400 space-y-2">
                <li><a href="/" className="hover:text-white transition">Home</a></li>
                <li><a href="/" className="hover:text-white transition">Products</a></li>
                <li><a href="/" className="hover:text-white transition">Vendors</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3">Support</h4>
              <ul className="text-gray-400 space-y-2">
                <li><a href="/" className="hover:text-white transition">Contact Us</a></li>
                <li><a href="/" className="hover:text-white transition">Track Order</a></li>
                <li><a href="/" className="hover:text-white transition">FAQs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3">Legal</h4>
              <ul className="text-gray-400 space-y-2">
                <li><a href="/" className="hover:text-white transition">Privacy</a></li>
                <li><a href="/" className="hover:text-white transition">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Grabbit Marketplace. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
