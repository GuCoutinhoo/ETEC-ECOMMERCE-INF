import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Components
import Header from "./Components/store/Header";
import Footer from "./Components/store/Footer";

// Pages
import Home from "./Pages/Home";
import Catalog from "./Pages/Catalog";
import Checkout from "./Pages/Checkout";
import ProductDetail from "./Pages/ProductDetail";
import Profile from "./Pages/Profile";
import Orders from "./Pages/Orders";
import Wishlist from "./Pages/Wishlist";

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/wishlist" element={<Wishlist />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
