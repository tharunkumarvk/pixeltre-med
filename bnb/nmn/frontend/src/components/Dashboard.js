import React, { useEffect } from "react";
import { Box, Button, Typography, Paper, AppBar, Toolbar, IconButton } from "@mui/material";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Dashboard() {
  let user = {};
  try {
    user = JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    user = {};
  }
  const navigate = useNavigate();

  const [packageDetails, setPackageDetails] = React.useState(null);

  useEffect(() => {
    if (!localStorage.getItem("access_token")) {
      navigate("/login");
    } else {
      axios
        .get("http://localhost:8000/api/api/package-details/", {
          headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
        })
        .then((response) => {
          const { max_storage_mb, available_storage_mb, used_storage_mb } = response.data;
          setPackageDetails({
            totalStorage: `${Math.round(max_storage_mb)} MB`,
            availableStorage: `${Math.round(available_storage_mb)} MB`,
            storageUsed: `${Math.round(used_storage_mb)} MB`,
          });
        })
        .catch((error) => {
          console.error("Error fetching package details:", error);
        });
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
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f7fafd 0%, #e3f2fd 100%)",
        perspective: "1000px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <AppBar
        position="static"
        elevation={4}
        sx={{
          background: "linear-gradient(90deg, #1976d2 60%, #43a047 100%)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <Toolbar>
          <IconButton edge="start" color="inherit">
            <MedicalServicesIcon
              sx={{ fontSize: 40, mr: 1, transform: "rotateY(15deg)" }}
            />
          </IconButton>
          <Typography
            variant="h5"
            sx={{
              flexGrow: 1,
              letterSpacing: 4,
              fontWeight: 700,
              color: "#fff",
            }}
          >
            PixelTreMed
          </Typography>
          <Button
            color="inherit"
            onClick={handleLogout}
            sx={{ fontWeight: 600, fontSize: 16, transition: "transform 0.3s" }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        mt={8}
        gap={4}
      >
        <Paper
          elevation={8}
          sx={{
            px: 4,
            py: 6,
            minWidth: 350,
            borderRadius: 16,
            background: "#fff",
            boxShadow: "0 4px 16px rgba(60,72,88,0.15)",
            transition: "transform 0.3s ease-in-out",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: "0 6px 20px rgba(60,72,88,0.2)",
            },
          }}
        >
          <Typography
            variant="h4"
            color="primary.main"
            fontWeight={700}
            gutterBottom
            align="center"
          >
            Welcome, {user.username}
          </Typography>
          <Box display="flex" flexDirection="column" gap={2} mt={4}>
            {navBtns.map((btn) => (
              <Button
                key={btn.label}
                variant="contained"
                color="primary"
                onClick={() => navigate(btn.path)}
                sx={{
                  fontWeight: 600,
                  fontSize: 16,
                  transition: "transform 0.3s",
                  "&:hover": {
                    transform: "translateY(-2px)",
                  },
                }}
              >
                {btn.label}
              </Button>
            ))}
          </Box>
        </Paper>
        {packageDetails && user.user_type === "patient" && (
          <Paper
            elevation={6}
            sx={{
              px: 4,
              py: 6,
              minWidth: 350,
              borderRadius: 16,
              background: "#fff",
              boxShadow: "0 4px 16px rgba(60,72,88,0.15)",
              transition: "transform 0.3s ease-in-out",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 6px 20px rgba(60,72,88,0.2)",
              },
            }}
          >
            <Typography
              variant="h5"
              color="primary.main"
              fontWeight={700}
              gutterBottom
              align="center"
            >
              Package Information
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              align="center"
              sx={{ mt: 2 }}
            >
              Total Storage: {packageDetails.totalStorage}
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              align="center"
              sx={{ mt: 1 }}
            >
              Available Storage: {packageDetails.availableStorage}
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              align="center"
              sx={{ mt: 1 }}
            >
              Storage Used: {packageDetails.storageUsed}
            </Typography>
          </Paper>
        )}
      </Box>
    </Box>
  );
}