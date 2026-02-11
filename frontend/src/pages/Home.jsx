import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom"; 
import API from "../api";

export default function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await API.get("/products");
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products", error);
      }
    };

    fetchProducts();
  }, []);

  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section className="bg-indigo-600 text-white py-20 text-center">
        <h2 className="text-4xl font-bold mb-4">Shop from Multiple Vendors</h2>
        <p className="text-lg">Best deals, trusted sellers, fast delivery</p>
      </section>

      {/* Product Grid */}
      <section className="p-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {products.length === 0 ? (
          <p className="text-center col-span-full">Loading products...</p>
        ) : (
          products.map((product) => (
  <Link
    to={`/product/${product._id}`}
    key={product._id}
  >
    <div className="border rounded-lg p-4 shadow hover:shadow-lg transition cursor-pointer">
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-40 object-cover rounded"
      />
      <h3 className="font-bold mt-3">{product.name}</h3>
      <p className="text-gray-600">{product.description}</p>
      <p className="font-semibold mt-1">₹{product.price}</p>

      <button
        onClick={(e) => e.preventDefault()}   // stop link on button click
        className="mt-3 w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
      >
        View Details
      </button>
    </div>
  </Link>
))

        )}
      </section>
    </>
  );
}
