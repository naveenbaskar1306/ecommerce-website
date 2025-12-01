import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/home";
import Header from "./components/header";
import { createContext, useEffect, useState } from "react";
import axios from "axios";
import React from "react";
import Login from "./components/Login";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Footer from "./components/footer/footer";
import CartPage from "./pages/card";
import { CartProvider } from "./context/CartContext";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import Products from "./pages/products";
import ProductDetail from "./pages/products/ProductDetail";
import OrderTrack from "./pages/order/OrderTrack";
import ContactUs from "./pages/contact/ContactUs";
import BlogList from "./pages/blog/BlogList";
import BlogPost from "./pages/blog/BlogPost";
import Gifts from "./pages/gifts";
import Register from './components/Register/Register';
import Checkout from './pages/checkout/Checkout';
import ArtisanDashboard from './pages/ArtisanDashboard/ArtisanDashboard';
import ProtectedArtisanRoute from "./components/ArtisanProductForm/ProtectedArtisanRoute";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute/ProtectedAdminRoute";

import AdminDashboard from "./pages/AdminDashboard/AdminDashboard";
import ArtisanAddProduct from "./pages/ArtisanDashboard/ArtisanAddProduct";
import ProductDetails from "./data/ProductDetail";
import SearchResults from "./pages/SearchResults/SearchResults";
import ArtisanLogin from "./pages/ArtisanDashboard/ArtisanLogin";
import ArtisanRegister from "./pages/ArtisanDashboard/ArtisanRegister";
import AdminLogin from './pages/AdminDashboard/AdminLogin';
import ProfilePage from "./pages/Profile/index";

// ✅ Central API import
import { API_BASE } from "./config/api";

const mycontext = createContext();

function App() {
  const [countryList, setCountryList] = useState([]);
  const [selectedCountry, setselectedCountry] = useState("");
  const [isModalOpen, setisModalOpen] = useState(false);

  useEffect(() => {
    getcountry();
  }, []);

  useEffect(() => {
    function openLoginHandler(e) {
      console.log("[App] openLogin event received");

      window.__loginModalHandled = true;
      setisModalOpen(true);
    }

    window.addEventListener("openLogin", openLoginHandler);
    return () => window.removeEventListener("openLogin", openLoginHandler);
  }, []);

  const getcountry = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/states`);

      const indianStates = res.data.filter(
        (item) => item.country_code === "IN"
      );

      const formatted = indianStates.map((s) => ({
        id: s.id,
        name: s.name,
        state_code: s.state_code,
      }));

      setCountryList(formatted);
      console.log("✅ Loaded Indian States from backend:", formatted.length);
    } catch (error) {
      console.error("❌ Failed to fetch states from backend:", error);

      try {
        const fallback = await axios.get("/states.json");
        const indianStates = fallback.data.filter(
          (item) => item.country_code === "IN"
        );

        const formatted = indianStates.map((s) => ({
          id: s.id,
          name: s.name,
          state_code: s.state_code,
        }));

        setCountryList(formatted);
        console.log("⚠️ Loaded fallback Indian States:", formatted.length);
      } catch (e) {
        console.error("❌ Failed fallback states too:", e);
        setCountryList([]);
      }
    }
  };

  const OpenLoginModal = () => {
    setisModalOpen(true);
  };

  const CloseLoginModal = () => {
    setisModalOpen(false);
  };

  return (
    <BrowserRouter>
      <CartProvider>
        <mycontext.Provider
          value={{
            countryList,
            setCountryList,
            selectedCountry,
            setselectedCountry,
          }}
        >
          <Header onloginclick={OpenLoginModal} />

          <Routes>
            <Route
              path="/dashboard"
              element={
                <ProtectedAdminRoute>
                  <AdminDashboard />
                </ProtectedAdminRoute>
              }
            />

            <Route path="/artisan/add-product" element={<ArtisanAddProduct />} />
            <Route path="/artisan-login" element={<ArtisanLogin />} />
            <Route path="/artisan-register" element={<ArtisanRegister />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/profile" element={<ProfilePage />} />

            <Route path="/register" element={<Register />} />
            <Route path="/" exact={true} element={<Home />} />
            <Route path="/Products" element={<Products />} />
            <Route path="/Products/:id" element={<ProductDetail />} />
            <Route path="/gifts" element={<Gifts />} />
            <Route path="/order-track" element={<OrderTrack />} />
            <Route path="/blog" element={<BlogList />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<Checkout />} />

            <Route path="/artisan-dashboard" element={
              <ProtectedArtisanRoute>
                <ArtisanDashboard />
              </ProtectedArtisanRoute>
            } />

            <Route path="/product/:id" element={<ProductDetail />} />
          </Routes>

          <Footer />
          <ToastContainer position="top-center" autoClose={2000} />
        </mycontext.Provider>
      </CartProvider>

      {isModalOpen && <Login onClose={CloseLoginModal} />}
    </BrowserRouter>
  );
}

export default App;
export { mycontext };
