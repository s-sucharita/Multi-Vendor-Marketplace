import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
  return (
    <Link to={`/product/${product._id}`} className="block h-full">
      <div className="border rounded-xl p-0 shadow-md hover:shadow-2xl transition-all duration-300 bg-white overflow-hidden h-full flex flex-col hover:scale-105 transform">
        {/* Image Container */}
      {/* Image Container */}
<div className="relative bg-gray-100 h-56 flex items-center justify-center overflow-hidden rounded-t-xl">
  <img
    src={
      product.images && product.images.length > 0
        ? `http://localhost:5000${product.images[0]}`
        : "https://via.placeholder.com/300x200?text=Product+Image"
    }
    alt={product.name}
    className="max-h-full max-w-full object-contain transition duration-300 hover:scale-105"
    onError={(e) => {
      e.target.src =
        "https://via.placeholder.com/300x200?text=Product+Image";
    }}
  />

  {product.stock < 5 && product.stock > 0 && (
    <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
      Low Stock
    </div>
  )}

  {product.stock === 0 && (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
      <p className="text-white font-bold text-lg">Out of Stock</p>
    </div>
  )}
</div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col justify-between">
          {/* Title */}
          <div>
            <h3 className="font-bold text-lg text-gray-800 line-clamp-2 mb-2">
              {product.name}
            </h3>

            {/* Description */}
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {product.description}
            </p>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-yellow-400">⭐⭐⭐⭐⭐</span>
              <span className="text-xs text-gray-600">(23 reviews)</span>
            </div>
          </div>

          {/* Footer */}
          <div>
            {/* Price */}
            <div className="mb-3 pb-3 border-b">
              <p className="text-xs text-gray-600 mb-1">Price</p>
              <p className="text-2xl font-bold text-indigo-600">
                ₹{product.price.toLocaleString()}
              </p>
              <p className="text-xs text-green-600 font-semibold">
                ✓ Free Shipping
              </p>
            </div>

            {/* Button */}
            <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-2 rounded-lg hover:shadow-lg transition transform hover:scale-105 text-sm">
              View Details →
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
