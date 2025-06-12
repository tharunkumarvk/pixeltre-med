import React from "react";
import { Button, Box, Typography, Paper, AppBar, Toolbar } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
    let user = {};
    try {
        user = JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
        user = {};
    }
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = "/login";
    };

    if (!user || (!user.is_staff && !user.is_superuser)) {
        window.location.href = "/login";
        return null;
    }

    return (
        <Box sx={{ minHeight: "100vh", background: "linear-gradient(135deg, #f7fafd 0%, #e3f2fd 100%)" }}>
            <AppBar position="static" elevation={4} sx={{ background: "linear-gradient(90deg, #1976d2 60%, #43a047 100%)" }}>
                <Toolbar>
                    <Typography variant="h5" sx={{ flexGrow: 1, letterSpacing: 4, fontWeight: 700, color: "#fff" }}>
                        Admin Dashboard
                    </Typography>
                    <Button color="inherit" onClick={handleLogout} sx={{ fontWeight: 600, fontSize: 16 }}>
                        Logout
                    </Button>
                </Toolbar>
            </AppBar>
            <Box display="flex" alignItems="center" justifyContent="center" minHeight="80vh">
                <Paper elevation={8} sx={{ px: 4, py: 6, minWidth: 400, borderRadius: 4, background: "#fff" }}>
                    <Typography variant="h4" fontWeight={700} color="primary.main" align="center" gutterBottom>
                        Admin Dashboard
                    </Typography>
                    <Box display="flex" flexDirection="column" gap={2} mt={4}>
                        <Button variant="contained" color="primary" onClick={() => navigate("/admin/users")} sx={{ fontSize: 18, py: 1.5, borderRadius: 3, boxShadow: 2 }}>Manage Users</Button>
                        <Button variant="contained" color="secondary" onClick={() => navigate("/packages")} sx={{ fontSize: 18, py: 1.5, borderRadius: 3, boxShadow: 2 }}>Manage Packages</Button>
                    </Box>
                </Paper>
            </Box>
        </Box>
    );
}
