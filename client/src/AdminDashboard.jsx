import React from "react";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from "./Navbar";
import AdminHome from "./AdminHome";
import About from "./About";
import Help from "./Help";
import Footer from "./Footer";
import PrivacyPolicy from "./PrivacyPolicy";
import LogoutButton from "./Logout";

export default function AdminDashboard() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" exact element={<AdminHome />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Help />} />
        <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
        <Route path="/logout" element={<LogoutButton />} />
      </Routes>
      <Footer/>
    </Router>
  );
}