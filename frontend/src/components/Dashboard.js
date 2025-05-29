import React from "react";
import { Box, Button, Typography, AppBar, Toolbar, IconButton, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import { motion } from "framer-motion";

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const navBtns = [
    { label: "My Records", path: "/records" },
    { label: "Upload Record", path: "/upload" },
    { label: "Set Reminder", path: "/reminder" },
  ];

  return (
    <Box>
      <AppBar position="static" elevation={6} sx={{ background: "linear-gradient(135deg,#00bcd4,#23272f)" }}>
        <Toolbar>
          <IconButton edge="start" color="inherit">
            <MedicalServicesIcon sx={{ fontSize: 40, mr: 1, transform: "rotateZ(-10deg)" }} />
          </IconButton>
          <Typography variant="h5" sx={{ flexGrow: 1, letterSpacing: 4, fontWeight: 700 }}>
            PixelTreMed
          </Typography>
          <Button color="inherit" onClick={handleLogout}>Logout</Button>
        </Toolbar>
      </AppBar>
      <Box display="flex" flexDirection="column" alignItems="center" mt={8} gap={4}>
        <motion.div
          initial={{ rotateY: 20, scale: 0.8, opacity: 0.8 }}
          animate={{ rotateY: 0, scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, type: "spring" }}
        >
          <Paper
            elevation={10}
            sx={{
              px: 6, py: 5, borderRadius: 6, background: "linear-gradient(135deg,#23272f 60%,#00bcd4 120%)",
              boxShadow: "0 6px 32px #00bcd455"
            }}
          >
            <Typography variant="h3" color="primary.main" fontWeight={700} gutterBottom>
              Welcome, {user.username}
            </Typography>
            <Typography variant="h5" color="text.secondary" gutterBottom>
              {user.user_type === "doctor"
                ? "Manage your patients and records."
                : "Upload, view and share your medical records."}
            </Typography>
          </Paper>
        </motion.div>
        <Box display="flex" gap={4}>
          {navBtns.map(btn => (
            <motion.div whileHover={{ scale: 1.13, rotateY: 12 }} key={btn.label}>
              <Button
                onClick={() => navigate(btn.path)}
                variant="contained"
                size="large"
                sx={{ py: 2, px: 5, fontSize: 20, fontWeight: 600, borderRadius: 3, boxShadow: 6 }}
              >
                {btn.label}
              </Button>
            </motion.div>
          ))}
        </Box>
      </Box>
    </Box>
  );
}