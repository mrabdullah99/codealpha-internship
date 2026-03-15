import { useEffect } from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { useDispatch } from "react-redux";
import MainLayout from "./layout/MainLayout";
import Home from "./pages/home/Home";
import AllProducts from "./pages/allProducts/AllProducts";
import ProductDetails from "./pages/productDetails/ProductDetails";
import AllProductsView from "./pages/admin/AllProductsView";
import AddProductView from "./pages/admin/AddProductView";
import OrdersView from "./pages/admin/OrdersView";
import AdminLayout from "./layout/AdminLayout";
import AdminProtectedRoute from "./AdminProtectedRoute";
import BuyNowPage from "./pages/buyNow/BuyNowPage";
import CartView from "./pages/cart/CartView";
import LoginComponent from "./pages/login/LoginComponent";
import SignupComponent from "./pages/signup/SignupComponent";
import { fetchMe } from "./redux/slices/authSlice";
import EditProductView from "./pages/admin/EditProductView";
import { setProducts } from "./redux/slices/productSlice";
import { fetchCartFromDB } from "./redux/slices/cartSlice";
import { getAllProducts } from "./api/userApi";
import MyOrders from "./pages/myOrders/MyOrders";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const initApp = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        await dispatch(fetchMe());
        dispatch(fetchCartFromDB());
      }
      try {
        const productsResponse = await getAllProducts();
        dispatch(setProducts(productsResponse.data.products));
      } catch (err) {
        console.error("Failed to fetch products:", err);
      }
    };
    initApp();
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<LoginComponent />} />
          <Route path="signup" element={<SignupComponent />} />
          <Route path="all-products" element={<AllProducts />} />
          <Route path="product/:id" element={<ProductDetails />} />
          <Route path="checkout" element={<BuyNowPage />} />
          <Route path="cart" element={<CartView />} />
          <Route path="myorders" element={<MyOrders />} />
        </Route>

        <Route path="/admin" element={<AdminProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="all-products" element={<AllProductsView />} />
            <Route path="add-product" element={<AddProductView />} />
            <Route path="edit-product/:id" element={<EditProductView />} />
            <Route path="all-orders" element={<OrdersView />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
