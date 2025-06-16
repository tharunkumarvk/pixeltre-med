import React, { useEffect, useMemo } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import Dashboard from "./components/Dashboard";
import UploadRecord from "./components/UploadRecord";
import RecordList from "./components/RecordList";
import ReminderForm from "./components/ReminderForm";
import DoctorPatients from "./components/DoctorPatients"; // Fixed import
import PackageManagement from "./components/PackageManagement";
import Profile from "./components/Profile";
import AdminPackagePortal from "./components/AdminPackagePortal";
import AdminDashboard from "./components/AdminDashboard";
import UserManagement from "./components/UserManagement";
import Header from "./components/Header";
import "./App.css";

function App() {
  // Extract userString to a variable for useMemo dependency
  const userString = localStorage.getItem("user");
  const user = useMemo(() => {
    try {
      return JSON.parse(userString || "{}")
    } catch {
      return {};
    }
  }, [userString]);
  const isAuthenticated = !!localStorage.getItem("access_token");
  const isAdmin = user && (user.is_staff === true || user.is_superuser === true); // Fix: check for true explicitly

  // Debug log for diagnosis (do NOT depend on user object directly)
  useEffect(() => {
    console.log("[App.js] user:", user, "isAuthenticated:", isAuthenticated, "isAdmin:", isAdmin);
  }, [isAuthenticated, isAdmin, user]);

  // Defensive fallback UI for missing user
  if (isAuthenticated && (!user || !user.user_type)) {
    return <div role="alert">Session error: Please log in again.</div>;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Header />
        <div role="main">
          <Routes>
            <Route path="/" element={isAuthenticated ? (isAdmin ? <AdminDashboard /> : <Dashboard />) : <Navigate to="/login" />} />
            <Route path="/admin" element={isAuthenticated && isAdmin ? <AdminDashboard /> : <Navigate to="/login" />} />
            <Route path="/admin/users" element={isAuthenticated && isAdmin ? <UserManagement /> : <Navigate to="/login" />} />
            <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
            <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <Register />} />
            <Route path="/upload" element={isAuthenticated ? <UploadRecord /> : <Navigate to="/login" />} />
            <Route path="/records" element={isAuthenticated ? <RecordList /> : <Navigate to="/login" />} />
            <Route path="/reminder" element={isAuthenticated ? <ReminderForm /> : <Navigate to="/login" />} />
            <Route path="/patients" element={isAuthenticated ? <DoctorPatients /> : <Navigate to="/login" />} />
            <Route path="/packages" element={isAuthenticated ? <PackageManagement /> : <Navigate to="/login" />} />
            <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
            {isAdmin && (
              <Route path="/admin/packages" element={<AdminPackagePortal />} />
            )}
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}
export default App;