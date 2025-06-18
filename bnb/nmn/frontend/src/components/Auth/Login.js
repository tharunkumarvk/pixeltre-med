import React, { useState } from "react";
import { Avatar, Box, Button, Paper, TextField, Typography, Fade } from "@mui/material";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import axios from "../../api/axios";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post("api/login/", form);
      localStorage.setItem("access_token", res.data.access);
      localStorage.setItem("refresh_token", res.data.refresh);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      console.log("[Login.js] user:", res.data.user);
      navigate("/");
      window.location.reload(); // Force re-render so App.js picks up new localStorage
    } catch (err) {
      setError(err?.response?.data?.error || "Login failed");
    }
  };

  return (
    <Fade in>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        sx={{
          background: "linear-gradient(135deg, #f7fafd 0%, #e3f2fd 100%)",
          perspective: "1000px",
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Paper
            elevation={6}
            sx={{
              px: 4,
              py: 6,
              minWidth: 320,
              borderRadius: 4,
              boxShadow: "0 4px 16px rgba(60,72,88,0.15)",
              background: "#fff",
              transition: "transform 0.3s ease-in-out",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 6px 20px rgba(60,72,88,0.2)",
              },
            }}
          >
            <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
              <Avatar
                sx={{
                  bgcolor: "primary.main",
                  width: 64,
                  height: 64,
                  transform: "rotateY(24deg)",
                }}
              >
                <LockOpenIcon fontSize="large" />
              </Avatar>
              <Typography
                variant="h4"
                fontWeight={700}
                color="primary.main"
                gutterBottom
              >
                Login
              </Typography>
              <form style={{ width: "100%" }} onSubmit={handleSubmit}>
                <TextField
                  name="username"
                  label="Username"
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  onChange={handleChange}
                  required
                  sx={{
                    "& .MuiInputBase-root": {
                      background: "#f7fafd",
                      borderRadius: 2,
                    },
                  }}
                />
                <TextField
                  name="password"
                  type="password"
                  label="Password"
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  onChange={handleChange}
                  required
                  sx={{
                    "& .MuiInputBase-root": {
                      background: "#f7fafd",
                      borderRadius: 2,
                    },
                  }}
                />
                {error && <Typography color="error">{error}</Typography>}
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    sx={{
                      mt: 2,
                      py: 1.5,
                      fontSize: 18,
                      fontWeight: 600,
                      borderRadius: 3,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      background: "linear-gradient(90deg, #1976d2 60%, #43a047 100%)",
                      "&:hover": {
                        background: "linear-gradient(90deg, #1565c0 60%, #388e3c 100%)",
                      },
                    }}
                  >
                    Sign In
                  </Button>
                </motion.div>
              </form>
              <Typography variant="body2" sx={{ mt: 2 }}>
                Don't have an account? <Link to="/register">Register</Link>
              </Typography>
            </Box>
          </Paper>
        </motion.div>
      </Box>
    </Fade>
  );
}