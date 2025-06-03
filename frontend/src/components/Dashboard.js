import React, { useEffect } from "react";
import { Box, Button, Typography, Paper, AppBar, Toolbar, IconButton } from "@mui/material";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  let user = {};
  try {
    user = JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    user = {};
  }
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("access_token")) {
      navigate("/login");
    }
  }, [navigate]);

  if (!user || !user.user_type) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" minHeight="100vh">
        <Paper elevation={6} sx={{ px: 4, py: 6, minWidth: 320, borderRadius: 4 }}>
          <Typography variant="h5" color="error" align="center">
            Error: User session is invalid. Please <a href="/login">log in</a> again.
          </Typography>
        </Paper>
      </Box>
    );
  }

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const navBtns = user.user_type === "admin"
    ? [
      { label: "Manage Packages", path: "/packages" }
    ]
    : [
      { label: "My Records", path: "/records" },
      { label: "Upload Record", path: "/upload" },
      ...(user.user_type === "patient" ? [{ label: "Set Reminder", path: "/reminder" }] : []),
      ...(user.user_type === "doctor" ? [{ label: "My Patients", path: "/patients" }] : []),
      { label: "Profile", path: "/profile" }
    ];

  return (
    <Box sx={{ minHeight: "100vh", background: "linear-gradient(135deg, #f7fafd 0%, #e3f2fd 100%)" }}>
      <AppBar position="static" elevation={4} sx={{ background: "linear-gradient(90deg, #1976d2 60%, #43a047 100%)" }}>
        <Toolbar>
          <IconButton edge="start" color="inherit">
            <MedicalServicesIcon sx={{ fontSize: 40, mr: 1 }} />
          </IconButton>
          <Typography variant="h5" sx={{ flexGrow: 1, letterSpacing: 4, fontWeight: 700, color: "#fff" }}>
            PixelTreMed
          </Typography>
          <Button color="inherit" onClick={handleLogout} sx={{ fontWeight: 600, fontSize: 16 }}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Box display="flex" flexDirection="column" alignItems="center" mt={8} gap={4}>
        <Paper elevation={8} sx={{ px: 4, py: 6, minWidth: 350, borderRadius: 4, background: "#fff" }}>
          <Typography variant="h4" color="primary.main" fontWeight={700} gutterBottom align="center">
            Welcome, {user.username}
          </Typography>
          <Box display="flex" flexDirection="column" gap={2} mt={4}>
            {navBtns.map(btn => (
              <Button
                key={btn.label}
                variant="contained"
                color={btn.label === "Manage Packages" ? "secondary" : "primary"}
                onClick={() => navigate(btn.path)}
                sx={{ fontSize: 18, py: 1.5, borderRadius: 3, boxShadow: 2 }}
              >
                {btn.label}
              </Button>
            ))}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}