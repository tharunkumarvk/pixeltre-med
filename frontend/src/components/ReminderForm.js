import React, { useState, useEffect } from "react";
import {
  Box, Button, Fade, Paper, TextField, Typography, LinearProgress, MenuItem
} from "@mui/material";
import axios from "../api/axios";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function ReminderForm() {
  const [form, setForm] = useState({ title: "", date: "", doctor: "", patient: "" });
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(false);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const navigate = useNavigate();
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  })();

  useEffect(() => {
    if (user.user_type === "doctor") {
      navigate("/records"); // or show a message
    }
  }, [user.user_type, navigate]);

  useEffect(() => {
    if (user.user_type === "doctor") {
      // Fetch assigned patients
      axios.get("api/patients/").then(res => {
        setPatients(res.data);
      }).catch(() => setPatients([]));
    } else if (user.user_type === "patient") {
      // Fetch assigned doctors
      axios.get("api/doctors/").then(res => {
        setDoctors(res.data);
      }).catch(() => setDoctors([]));
    }
  }, [user.user_type]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    try {
      setProgress(true);
      let payload = { title: form.title, date: form.date };
      if (user.user_type === "doctor") {
        payload.patient = form.patient || null;
      } else if (user.user_type === "patient") {
        payload.doctor = form.doctor || null;
      }
      await axios.post("api/reminders/", payload);
      setProgress(false);
      navigate("/");
    } catch {
      setProgress(false);
      setError("Failed to create reminder");
    }
  };

  if (user.user_type === "doctor") return null;

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
            {user && user.user_type === "doctor" && (
              <TextField
                select
                name="patient"
                label="Select Patient"
                fullWidth
                variant="outlined"
                margin="normal"
                value={form.patient}
                onChange={handleChange}
                required
              >
                {patients.map(p => (
                  <MenuItem key={p.id} value={p.id}>{p.username} ({p.email})</MenuItem>
                ))}
              </TextField>
            )}
            {user && user.user_type === "patient" && (
              <TextField
                select
                name="doctor"
                label="Select Doctor"
                fullWidth
                variant="outlined"
                margin="normal"
                value={form.doctor}
                onChange={handleChange}
                required
              >
                {doctors.map(d => (
                  <MenuItem key={d.id} value={d.id}>{d.username} ({d.email})</MenuItem>
                ))}
              </TextField>
            )}
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