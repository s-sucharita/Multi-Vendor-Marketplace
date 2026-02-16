import { useState } from "react";
import API from "../api";
import Navbar from "../components/Navbar";
import { useNavigate, Link } from "react-router-dom";

export default function AddProduct() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    extraDetails: "",
    category: "",
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  // Check if user is vendor
  if (user?.role !== "vendor") {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-12 text-center max-w-md">
            <p className="text-2xl text-gray-500 mb-6">
              ⛔ Access Denied - Vendor Only
            </p>
            <Link
              to="/"
              className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition font-bold"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </>
    );
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(prev => [...prev, ...files]);
  };

  const removeImage = (idx) => {
    const imgs = [...imageFiles];
    imgs.splice(idx, 1);
    setImageFiles(imgs);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("description", formData.description);
      data.append("price", formData.price);
      data.append("stock", formData.stock);
      data.append("category", formData.category);
      data.append("extraDetails", formData.extraDetails);
      
      imageFiles.forEach((file, idx) => {
        data.append(`images`, file);
      });

      const res = await API.post("/vendor/products", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      alert("Product added successfully!");
      navigate("/vendor/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100">
        <div className="max-w-3xl mx-auto px-4 py-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-10">
            ➕ Add New Product
          </h1>

          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter product name"
                  required
                  className="w-full border-2 border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:border-indigo-600 transition"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter product description"
                  rows="4"
                  required
                  className="w-full border-2 border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:border-indigo-600 transition resize-none"
                ></textarea>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full border-2 border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:border-indigo-600 transition"
                >
                  <option value="">Select a category</option>
                  <option value="electronics">Electronics</option>
                  <option value="fashion">Fashion</option>
                  <option value="cosmetics">Cosmetics</option>
                  <option value="home">Home & Kitchen</option>
                  <option value="books">Books</option>
                  <option value="sports">Sports</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Price */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                    required
                    className="w-full border-2 border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:border-indigo-600 transition"
                  />
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                    required
                    className="w-full border-2 border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:border-indigo-600 transition"
                  />
                </div>
              </div>

              {/* Product Images */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Product Images *
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full border-2 border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:border-indigo-600 transition"
                />
                <p className="text-sm text-gray-500 mt-1">Upload one or more images from your computer</p>
                
                {imageFiles.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-4">
                    {imageFiles.map((file, idx) => {
                      const previewUrl = URL.createObjectURL(file);
                      return (
                        <div key={idx} className="relative">
                          <img
                            src={previewUrl}
                            alt={`preview-${idx}`}
                            className="w-full h-24 object-cover rounded"
                          />
                          <p className="text-xs text-gray-600 mt-1 truncate">{file.name}</p>
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Extra Details */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Additional Details / Specifications
                </label>
                <textarea
                  name="extraDetails"
                  value={formData.extraDetails}
                  onChange={handleChange}
                  placeholder="E.g. color, size, materials, features"
                  rows="3"
                  className="w-full border-2 border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:border-indigo-600 transition resize-none"
                ></textarea>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-6 border-t">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 rounded-lg hover:shadow-lg transition disabled:opacity-50"
                >
                  {loading ? "Adding Product..." : "✅ Add Product"}
                </button>
                <Link
                  to="/vendor/dashboard"
                  className="flex-1 text-center border-2 border-indigo-600 text-indigo-600 font-bold py-3 rounded-lg hover:bg-indigo-50 transition"
                >
                  Back to Dashboard
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}