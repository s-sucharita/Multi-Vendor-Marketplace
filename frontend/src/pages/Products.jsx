import { useEffect, useState } from "react";
import API from "../api";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import Navbar from "../components/Navbar";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({ vendor: "", category: "", minPrice: "", maxPrice: "" });
  const user = JSON.parse(localStorage.getItem("user"));
  const [sortBy, setSortBy] = useState("");
  const [searchParams] = useSearchParams();
const categoryFromUrl = searchParams.get("category");


  const fetchProducts = () => {
    let query = [];
    if (filters.search) query.push(`search=${encodeURIComponent(filters.search)}`);

    // if vendor user, force filter to own id
    const vendorId = user && user.role === "vendor" ? user.id : filters.vendor;
    if (vendorId) query.push(`vendor=${vendorId}`);

    if (filters.category) query.push(`category=${filters.category}`);
    if (filters.minPrice) query.push(`minPrice=${filters.minPrice}`);
    if (filters.maxPrice) query.push(`maxPrice=${filters.maxPrice}`);
    if (sortBy) query.push(`sort=${sortBy}`);
    const q = query.length ? `?${query.join("&")}` : "";
    API.get(`/products${q}`).then(res => setProducts(res.data));
  };

  useEffect(() => {
  if (categoryFromUrl) {
    setFilters(prev => ({ ...prev, category: categoryFromUrl }));
  }
}, [categoryFromUrl]);

useEffect(() => {
  fetchProducts();
}, [filters, sortBy]);

  return (
    <>
      <Navbar />
      {/* filter / sort toolbar */}
      <div className="p-4 bg-white rounded mb-6 flex flex-wrap gap-4 items-end">
        <input
          type="text"
          placeholder="Search products"
          value={filters.search || ""}
          onChange={e => setFilters({ ...filters, search: e.target.value })}
          className="border p-2 rounded flex-1"
        />
        {!(user && user.role === "vendor") && (
          <input
            type="text"
            placeholder="Vendor id"
            value={filters.vendor}
            onChange={e => setFilters({ ...filters, vendor: e.target.value })}
            className="border p-2 rounded"
          />
        )}
        <input
          type="text"
          placeholder="Category"
          value={filters.category}
          onChange={e => setFilters({ ...filters, category: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          type="number"
          placeholder="Min price"
          value={filters.minPrice}
          onChange={e => setFilters({ ...filters, minPrice: e.target.value })}
          className="border p-2 rounded w-24"
        />
        <input
          type="number"
          placeholder="Max price"
          value={filters.maxPrice}
          onChange={e => setFilters({ ...filters, maxPrice: e.target.value })}
          className="border p-2 rounded w-24"
        />
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Sort by</option>
          <option value="priceAsc">Price ↑</option>
          <option value="priceDesc">Price ↓</option>
          <option value="nameAsc">Name A–Z</option>
          <option value="nameDesc">Name Z–A</option>
        </select>
        <button
          onClick={fetchProducts}
          className="bg-indigo-600 text-white px-4 py-2 rounded"
        >
          Apply
        </button>
      </div>
      <div className="p-10 grid grid-cols-3 gap-6">
        {products.map(p => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
    </>
  );
}
