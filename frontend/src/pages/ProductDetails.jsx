import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../api";
import Navbar from "../components/Navbar";

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    API.get(`/products/${id}`)
      .then(res => setProduct(res.data))
      .catch(err => console.log(err));
  }, [id]);

  const addToCart = () => {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    const existing = cart.find(item => item._id === product._id);

    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ ...product, qty: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    alert("Added to cart 🛒");
  };

  if (!product) return <p className="p-10">Loading...</p>;

  return (
    <>
      <Navbar />

      <div className="p-10 max-w-4xl mx-auto">
        <img
          src={product.image}
          className="w-full h-80 object-cover rounded"
        />

        <h1 className="text-3xl font-bold mt-5">{product.name}</h1>
        <p className="text-xl text-green-600 mt-2">₹{product.price}</p>
        <p className="mt-4 text-gray-700">{product.description}</p>

        <button
          onClick={addToCart}
          className="mt-6 bg-indigo-600 text-white px-6 py-3 rounded hover:bg-indigo-700"
        >
          Add to Cart
        </button>
      </div>
    </>
  );
}
