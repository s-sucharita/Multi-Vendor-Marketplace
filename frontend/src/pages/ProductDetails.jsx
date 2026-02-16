import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../api";
import Navbar from "../components/Navbar";

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  // message to seller, subject removed per issue report
  const [contactMessage, setContactMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    API.get(`/products/${id}`)
      .then(res => {
        setProduct(res.data);
        loadReviews();
      })
      .catch(err => {
        if (err.response && err.response.status === 403) {
          alert("Access denied to this product");
          navigate("/products");
        } else {
          console.error(err);
        }
      });
  }, [id]);

  const sendVendorMessage = async () => {
    if (!contactMessage) {
      alert("Please enter a message");
      return;
    }
    try {
      await API.post("/user/messages", {
        recipient: product.vendor._id,
        product: product._id,
        message: contactMessage,
        messageType: "product-query"
      });
      alert("Message sent to seller");
      setContactMessage("");
    } catch (err) {
      console.error(err);
      alert("Failed to send message");
    }
  };

  const loadReviews = async () => {
    try {
      const res = await API.get(`/reviews/product/${id}`);
      setReviews(res.data.reviews);
      setAvgRating(res.data.avgRating);
    } catch (e) {
      console.error(e);
    }
  };

  const submitReview = async () => {
    if (!newComment) {
      alert("Please add a comment");
      return;
    }
    try {
      await API.post("/reviews/add", {
        productId: id,
        rating: newRating,
        comment: newComment
      });
      setNewComment("");
      loadReviews();
    } catch (e) {
      console.error(e);
      alert("Failed to submit review");
    }
  };

  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");

  const addToCart = async () => {
    if (!product) return;

    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.token) {
      try {
        await API.post("/cart/add", { productId: product._id, quantity: qty });
        alert("✅ Added to cart (server)!");
        navigate("/cart");
        return;
      } catch (err) {
        console.error(err);
        // fall through to local fallback
      }
    }

    // fallback to localStorage for non-logged-in users or on error
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existing = cart.find(i => i._id === product._id);

    if (existing) {
      existing.qty += qty;
    } else {
      cart.push({ ...product, qty });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    alert("✅ Added to cart!");
    navigate("/cart");
  };

  if (!product)
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p className="text-2xl text-gray-600">Loading product details...</p>
        </div>
      </>
    );

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-10">
         
          <button
            onClick={() => navigate("/products")}
            className="text-indigo-600 hover:underline font-semibold mb-6"
          >
            ← Back to Products
          </button>

          <div className="grid md:grid-cols-2 gap-10 bg-white rounded-lg shadow-lg p-8">
{/* Product Image / Gallery */}
            <div className="flex items-center justify-center">
              {product.images && product.images.length > 0 ? (
                <div className="w-full max-h-96 relative">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full max-h-96 object-cover rounded-lg shadow-md"
                  />
                  {product.images.length > 1 && (
                    <div className="absolute bottom-2 right-2 flex gap-1">
                      {product.images.slice(1).map((u, i) => (
                        <img
                          key={i}
                          src={u}
                          alt="thumb"
                          className="w-12 h-12 object-cover rounded border border-white shadow-md cursor-pointer"
                          onClick={() => {
                            setProduct({ ...product, images: [u, ...product.images.filter((_, idx)=>(idx!==i+1))] });
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-gray-400">No image available</div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex flex-col justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-800 mb-2">
                  {product.name}
                </h1>

                {/* Star Rating Placeholder */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-yellow-500">⭐⭐⭐⭐⭐</span>
                  <span className="text-gray-600">(150 reviews)</span>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <p className="text-gray-600 text-sm mb-1">Price</p>
                  <p className="text-4xl font-bold text-green-600">
                    ₹{product.price.toLocaleString()}
                  </p>
                </div>

                {/* Stock Status */}
                <div className="mb-6 p-3 rounded-lg bg-blue-50">
                  <p className="text-sm text-blue-700">
                    ✓ {product.stock > 0 ? (
                      <>
                        <span className="font-bold">{product.stock} in stock</span>
                        <span className="ml-2">- Free shipping available</span>
                      </>
                    ) : (
                      <span className="font-bold text-red-600">Out of Stock</span>
                    )}
                  </p>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-2">
                    About this product
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Vendor Info */}
                {product.vendor && (
                  <div className="p-4 bg-gray-50 rounded-lg mb-6">
                    <p className="text-sm text-gray-600 mb-1">Seller</p>
                    <p className="text-lg font-bold text-gray-800">
                      {product.vendor.name}
                    </p>
                  </div>
                )}

                {/* Extra Details */}
                {product.extraDetails && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold">Specifications</h3>
                    <p className="text-gray-700 whitespace-pre-line">
                      {product.extraDetails}
                    </p>
                  </div>
                )}
              </div>

              {/* Contact vendor */}
              {product.vendor && (
                <div className="mt-6 p-4 bg-gray-100 rounded">
                  <h3 className="font-semibold mb-2">Message Seller</h3>
                  <textarea
                    placeholder="Your question or comment"
                    value={contactMessage}
                    onChange={e => setContactMessage(e.target.value)}
                    className="w-full p-2 border mb-2 rounded"
                  />
                  <button
                    onClick={sendVendorMessage}
                    className="bg-indigo-600 text-white px-4 py-2 rounded"
                  >
                    Send Message
                  </button>
                </div>
              )}

              {/* Reviews */}
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Customer Reviews</h3>
                <p className="text-sm mb-2">Average rating: {avgRating} / 5</p>
                {reviews.length === 0 && <p>No reviews yet.</p>}
                {reviews.map(r => (
                  <div key={r._id} className="mb-2 border-b pb-2">
                    <p className="font-semibold">{r.customer.name}</p>
                    <p>Rating: {r.rating}</p>
                    <p>{r.comment}</p>
                  </div>
                ))}
                {JSON.parse(localStorage.getItem("user"))?.role === "customer" && (
                  <div className="mt-4">
                    <h4 className="font-semibold">Write a review</h4>
                    <select
                      value={newRating}
                      onChange={e => setNewRating(e.target.value)}
                      className="border p-1 rounded mb-2"
                    >
                      {[5,4,3,2,1].map(v => (
                        <option key={v} value={v}>{v} stars</option>
                      ))}
                    </select>
                    <textarea
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      className="w-full p-2 border mb-2 rounded"
                      placeholder="Your review..."
                    />
                    <button
                      onClick={submitReview}
                      className="bg-green-600 text-white px-4 py-2 rounded"
                    >
                      Submit
                    </button>
                  </div>
                )}
              </div>

              {/* Quantity & Add to Cart */}
              <div className="border-t pt-6">
                <div className="mb-6">
                  <p className="text-sm font-semibold text-gray-700 mb-3">
                    Quantity
                  </p>
                  <div className="flex items-center gap-4 bg-gray-100 rounded-lg w-fit p-2">
                    <button
                      onClick={() => setQty(qty > 1 ? qty - 1 : 1)}
                      className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition font-bold text-lg"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-bold text-xl">
                      {qty}
                    </span>
                    <button
                      onClick={() => setQty(qty + 1)}
                      className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition font-bold text-lg"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={addToCart}
                    disabled={product.stock === 0}
                    className="flex-1 bg-linear-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                  >
                    🛒 Add to Cart
                  </button>
                  <button
                    className="flex-1 border-2 border-indigo-600 text-indigo-600 font-bold py-4 rounded-lg hover:bg-indigo-50 transition text-lg"
                  >
                    ❤️ Save for Later
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Features Section */}
          <div className="mt-10 grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-3xl mb-2">🚚</p>
              <p className="font-bold text-gray-800">Free Shipping</p>
              <p className="text-sm text-gray-600 mt-1">On orders above ₹499</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-3xl mb-2">🔄</p>
              <p className="font-bold text-gray-800">Easy Returns</p>
              <p className="text-sm text-gray-600 mt-1">30-day return policy</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-3xl mb-2">✅</p>
              <p className="font-bold text-gray-800">Genuine Product</p>
              <p className="text-sm text-gray-600 mt-1">100% authentic items</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
