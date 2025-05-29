import React, { useState, useEffect } from "react";  // Added useEffect
import {
  Box, Button, Fade, Paper, TextField, Typography, LinearProgress
} from "@mui/material";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

export default function ReminderForm() {
  const [form, setForm] = useState({ title: "", date: "" });
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(false);
  const [csrfToken, setCsrfToken] = useState("");  // Added
  const navigate = useNavigate();

  useEffect(() => {  // Added
    axios.get(`${API_URL}/csrf/`, { withCredentials: true })
      .then(res => setCsrfToken(res.data.csrfToken))
      .catch(err => console.error("Failed to fetch CSRF token"));
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      setProgress(true);
      await axios.post(`${API_URL}/reminders/`, form, {
        headers: { "X-CSRFToken": csrfToken },  // Added
        withCredentials: true
      });
      setProgress(false);
      navigate("/");
    } catch {
      setProgress(false);
      setError("Failed to create reminder");
    }
  };

  return (
    <Fade in>
      <Box display="flex" alignItems="center" justifyContent="center" minHeight="100vh">
        <Paper elevation={8} sx={{
          px: 4, py: 6, minWidth: 360, borderRadius: 4,
          background: "linear-gradient(135deg, #23272f, #23272f 80%, #00bcd4 150%)"
        }}>
          <Typography variant="h4" color="primary.main" fontWeight={700} gutterBottom align="center">
            Set Reminder
          </Typography>
          <form style={{ width: "100%" }} onSubmit={handleSubmit}>
            <TextField
              name="title"
              label="Reminder title"
              fullWidth
              variant="outlined"
              margin="normal"
              onChange={handleChange}
              required
            />
            <TextField
              name="date"
              type="datetime-local"
              label="Date and Time"
              fullWidth
              variant="outlined"
              margin="normal"
              onChange={handleChange}
              required
              InputLabelProps={{ shrink: true }}
            />
            {error && <Typography color="error">{error}</Typography>}
            {progress && <LinearProgress />}
            <motion.div whileHover={{ scale: 1.05 }}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{ mt: 3, py: 1.5, fontSize: 18, fontWeight: 600, borderRadius: 3, boxShadow: 5 }}
              >
                Set Reminder
              </Button>
            </motion.div>
          </form>
        </Paper>
      </Box>
    </Fade>
  );
}