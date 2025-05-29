import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import theme from "./theme";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import Dashboard from "./components/Dashboard";
import UploadRecord from "./components/UploadRecord";
import RecordList from "./components/RecordList";
import ReminderForm from "./components/ReminderForm";
import "./App.css";

const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 40, scale: 0.98 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -40, scale: 0.98 }}
    transition={{ duration: 0.5 }}
    style={{ minHeight: "100vh" }}
  >
    {children}
  </motion.div>
);

function AnimatedRoutes() {
  const location = useLocation();
  const isAuthenticated = !!localStorage.getItem("user");
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={isAuthenticated ? <PageTransition><Dashboard /></PageTransition> : <Navigate to="/login" />} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
        <Route path="/upload" element={isAuthenticated ? <PageTransition><UploadRecord /></PageTransition> : <Navigate to="/login" />} />
        <Route path="/records" element={isAuthenticated ? <PageTransition><RecordList /></PageTransition> : <Navigate to="/login" />} />
        <Route path="/reminder" element={isAuthenticated ? <PageTransition><ReminderForm /></PageTransition> : <Navigate to="/login" />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AnimatedRoutes />
      </Router>
    </ThemeProvider>
  );
}
export default App;