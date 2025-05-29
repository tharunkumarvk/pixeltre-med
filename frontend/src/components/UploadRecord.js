import React, { useEffect, useState } from "react";
import {
  Box, Button, Fade, Paper, TextField, Typography, LinearProgress, MenuItem
} from "@mui/material";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

export default function UploadRecord() {
  const [form, setForm] = useState({ doctor: "", prescription: null, description: "" });
  const [doctors, setDoctors] = useState([]);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(false);
  const [csrfToken, setCsrfToken] = useState("");  // Added
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch CSRF token
    axios.get(`${API_URL}/csrf/`, { withCredentials: true })
      .then(res => setCsrfToken(res.data.csrfToken))
      .catch(err => console.error("Failed to fetch CSRF token"));
    // Fetch doctors
    axios.get(`${API_URL}/doctors/`, { withCredentials: true })
      .then(res => setDoctors(res.data))
      .catch(err => setError("Failed to fetch doctors"));
  }, []);

  const handleChange = e => {
    const { name, value, files } = e.target;
    if (name === "prescription") {
      setForm({ ...form, prescription: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const data = new FormData();
    data.append("doctor", form.doctor);
    data.append("prescription", form.prescription);
    data.append("description", form.description);
    try {
      setProgress(true);
      await axios.post(`${API_URL}/records/upload/`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          "X-CSRFToken": csrfToken  // Added
        },
        withCredentials: true
      });
      setProgress(false);
      navigate("/records");
    } catch {
      setProgress(false);
      setError("Upload failed");
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
            Upload Record
          </Typography>
          <form style={{ width: "100%" }} onSubmit={handleSubmit}>
            <TextField
              select
              name="doctor"
              label="Doctor"
              value={form.doctor}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            >
              <MenuItem value="">Select Doctor</MenuItem>
              {doctors.map(doc => (
                <MenuItem key={doc.id} value={doc.id}>{doc.username}</MenuItem>
              ))}
            </TextField>
            <Button
              fullWidth
              variant="outlined"
              component="label"
              sx={{ my: 2, py: 1.5, borderRadius: 2, fontWeight: 600, fontSize: 18 }}
            >
              <input
                type="file"
                name="prescription"
                hidden
                onChange={handleChange}
                required
                accept="application/pdf,image/*"
              />
              Upload Prescription
            </Button>
            <TextField
              name="description"
              label="Description"
              fullWidth
              variant="outlined"
              margin="normal"
              onChange={handleChange}
            />
            {error && <Typography color="error">{error}</Typography>}
            {progress && <LinearProgress />}
            <motion.div whileHover={{ scale: 1.05 }}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{ mt: 3, py: 1.5, fontSize: 18, fontWeight: 600, borderRadius: 3, boxShadow: 3 }}
              >
                Upload
              </Button>
            </motion.div>
          </form>
        </Paper>
      </Box>
    </Fade>
  );
}