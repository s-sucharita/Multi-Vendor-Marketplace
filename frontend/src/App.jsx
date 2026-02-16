import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Products from "./pages/Products";
import Checkout from "./pages/Checkout";
import VendorDashboard from "./pages/VendorDashboard";
import AddProduct from "./pages/AddProduct";
import EditProduct from "./pages/EditProduct";
import OrderHistory from "./pages/OrderHistory";
import OrderDetails from "./pages/OrderDetails";
import Messages from "./pages/Messages";
import MessageDetails from "./pages/MessageDetails";
import Reports from "./pages/Reports";
import LeaveManagement from "./pages/LeaveManagement";
import AdminLeaves from "./pages/AdminLeaves";
import { CartProvider } from "./context/CartContext";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<OrderHistory />} />
          <Route path="/order/:id" element={<OrderDetails />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/message/:id" element={<MessageDetails />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/leaves" element={<LeaveManagement />} />
          <Route path="/admin/leaves" element={<AdminLeaves />} />
          <Route path="/vendor/dashboard" element={<VendorDashboard />} />
          <Route path="/vendor/add-product" element={<AddProduct />} />
          <Route path="/vendor/edit-product/:id" element={<EditProduct />} />
           <Route path="/orders" element={<Orders />} />
        <Route path="/order/:id" element={<OrderDetails />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}
