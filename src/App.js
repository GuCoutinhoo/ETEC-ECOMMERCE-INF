import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Components
import Header from "./Components/store/Header.jsx";
import Footer from "./Components/store/Footer.jsx";

// Pages
import Home from "./Pages/Home.jsx";
import Catalog from "./Pages/Catalog.jsx";
import Checkout from "./Pages/Checkout.jsx";
import ProductDetail from "./Pages/ProductDetail.jsx";
import Profile from "./Pages/Profile.jsx";
import Orders from "./Pages/Orders.jsx";
import Wishlist from "./Pages/Wishlist.jsx";

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
