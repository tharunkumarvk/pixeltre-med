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
      <Box
        display="flex"
        flexDirection="column"
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
            <Typography
              variant="h5"
              align="center"
              gutterBottom
              sx={{
                fontWeight: 700,
                color: "#1976d2",
                letterSpacing: 1.5,
              }}
            >
              Register
            </Typography>
            <form onSubmit={handleSubmit}>
              <TextField
                label="Username"
                name="username"
                value={form.username}
                onChange={handleChange}
                fullWidth
                margin="normal"
                sx={{
                  "& .MuiInputBase-root": {
                    background: "#f7fafd",
                    borderRadius: 2,
                  },
                }}
              />
              <TextField
                label="Email"
                name="email"
                value={form.email}
                onChange={handleChange}
                fullWidth
                margin="normal"
                sx={{
                  "& .MuiInputBase-root": {
                    background: "#f7fafd",
                    borderRadius: 2,
                  },
                }}
              />
              <TextField
                label="Password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                fullWidth
                margin="normal"
                sx={{
                  "& .MuiInputBase-root": {
                    background: "#f7fafd",
                    borderRadius: 2,
                  },
                }}
              />
              <TextField
                select
                label="User Type"
                name="user_type"
                value={form.user_type}
                onChange={handleChange}
                fullWidth
                margin="normal"
                sx={{
                  "& .MuiInputBase-root": {
                    background: "#f7fafd",
                    borderRadius: 2,
                  },
                }}
              >
                <MenuItem value="patient">Patient</MenuItem>
                <MenuItem value="doctor">Doctor</MenuItem>
              </TextField>
              {form.user_type === "patient" && (
                <TextField
                  select
                  label="Package"
                  name="package"
                  value={form.package}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  sx={{
                    "& .MuiInputBase-root": {
                      background: "#f7fafd",
                      borderRadius: 2,
                    },
                  }}
                >
                  {packages.map(pkg => (
                    <MenuItem key={pkg.id} value={pkg.id}>
                      {pkg.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{
                  mt: 2,
                  py: 1.5,
                  fontWeight: 600,
                  background: "linear-gradient(90deg, #1976d2 60%, #43a047 100%)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  "&:hover": {
                    background: "linear-gradient(90deg, #1565c0 60%, #388e3c 100%)",
                  },
                }}
              >
                Register
              </Button>
            </form>
          </Paper>
        </motion.div>
      </Box>
    </Fade>
  );
}