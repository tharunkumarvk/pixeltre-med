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
      <Box display="flex" alignItems="center" justifyContent="center" minHeight="100vh">
        <Paper elevation={6} sx={{
          px: 4, py: 6, minWidth: 320, borderRadius: 4,
          background: "linear-gradient(135deg,#23272f,#2c313a)"
        }}>
          <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
            <Avatar sx={{
              bgcolor: "primary.main",
              width: 64, height: 64, transform: "rotateY(24deg)"
            }}>
              <LockOpenIcon fontSize="large" />
            </Avatar>
            <Typography variant="h4" fontWeight={700} color="primary.main" gutterBottom>
              Login
            </Typography>
            <form style={{ width: "100%" }} onSubmit={handleSubmit}>
              <TextField name="username" label="Username" fullWidth variant="outlined"
                margin="normal" onChange={handleChange} required />
              <TextField name="password" type="password" label="Password" fullWidth
                variant="outlined" margin="normal" onChange={handleChange} required />
              {error && <Typography color="error">{error}</Typography>}
              <motion.div whileHover={{ scale: 1.05 }}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={{ mt: 2, py: 1.5, fontSize: 18, fontWeight: 600, borderRadius: 3, boxShadow: 3 }}
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
      </Box>
    </Fade>
  );
}