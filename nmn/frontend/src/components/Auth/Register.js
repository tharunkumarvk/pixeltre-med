import React, { useState, useEffect } from "react";
import {
  Avatar, Box, Button, Paper, TextField, Typography, Fade, MenuItem
} from "@mui/material";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import axios from "../../api/axios";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Register() {
  const [form, setForm] = useState({
    username: "", email: "", password: "", user_type: "patient", phone_number: "", package: ""
  });
  const [error, setError] = useState("");
  const [packages, setPackages] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("api/packages/").then(res => setPackages(res.data));
    if (form.user_type !== "patient") {
      setForm(f => ({ ...f, package: "" }));
    }
  }, [form.user_type]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    try {
      const data = { ...form };
      if (data.user_type === "patient") {
        if (!data.package) {
          setError("Please select a package.");
          return;
        }
        data.package = Number(data.package);
      } else {
        delete data.package;
      }
      await axios.post("api/register/", data);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
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
              bgcolor: "secondary.main",
              width: 64, height: 64, transform: "rotateY(-24deg)"
            }}>
              <PersonAddAlt1Icon fontSize="large" />
            </Avatar>
            <Typography variant="h4" fontWeight={700} color="secondary.main" gutterBottom>
              Register
            </Typography>
            <form style={{ width: "100%" }} onSubmit={handleSubmit}>
              <TextField name="username" label="Username" fullWidth variant="outlined"
                margin="normal" onChange={handleChange} required />
              <TextField name="email" type="email" label="Email" fullWidth variant="outlined"
                margin="normal" onChange={handleChange} required />
              <TextField name="password" type="password" label="Password" fullWidth
                variant="outlined" margin="normal" onChange={handleChange} required />
              <TextField name="phone_number" label="Phone number" fullWidth variant="outlined"
                margin="normal" onChange={handleChange} required />
              <TextField
                select name="user_type" label="User Type"
                value={form.user_type} onChange={handleChange} fullWidth margin="normal"
              >
                <MenuItem value="patient">Patient</MenuItem>
                <MenuItem value="doctor">Doctor</MenuItem>
              </TextField>
              {form.user_type === "patient" && (
                <TextField
                  select name="package" label="Patient Package"
                  value={form.package} onChange={handleChange} fullWidth margin="normal" required
                >
                  <MenuItem value="">Select Package</MenuItem>
                  {packages.map(pkg => (
                    <MenuItem key={pkg.id} value={pkg.id}>{pkg.name}</MenuItem>
                  ))}
                </TextField>
              )}
              {error && <Typography color="error">{error}</Typography>}
              <motion.div whileHover={{ scale: 1.05 }}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={{ mt: 2, py: 1.5, fontSize: 18, fontWeight: 600, borderRadius: 3, boxShadow: 3 }}
                >
                  Sign Up
                </Button>
              </motion.div>
            </form>
            <Typography variant="body2" sx={{ mt: 2 }}>
              Already have an account? <Link to="/login">Login</Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Fade>
  );
}