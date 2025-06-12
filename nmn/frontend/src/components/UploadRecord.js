import React, { useEffect, useState } from "react";
import {
  Box, Typography, Paper, TextField, Button, MenuItem, Select, InputLabel, FormControl, LinearProgress, Fade
} from "@mui/material";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function UploadRecord() {
  const [form, setForm] = useState({ doctor: "", patient: "", prescription: null, description: "" });
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(false);
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
      // Doctor: show all patients for upload
      axios.get("api/patients/all/", { headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` } })
        .then(res => setPatients(res.data))
        .catch(() => setPatients([]));
    } else if (user.user_type === "patient") {
      // Patient: show all doctors
      axios.get("api/doctors/")
        .then(res => setDoctors(res.data))
        .catch(() => setDoctors([]));
    }
  }, [user.user_type, user.id]);

  const handleChange = e => {
    const { name, value, files } = e.target;
    setForm(f => ({ ...f, [name]: files ? files[0] : value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    setProgress(true);
    // Validation: ensure required fields are set
    if (user.user_type === "patient" && !form.doctor) {
      setError("Please select a doctor.");
      setProgress(false);
      return;
    }
    if (user.user_type === "doctor" && !form.patient) {
      setError("Please select a patient.");
      setProgress(false);
      return;
    }
    if (!form.prescription) {
      setError("Please select a file to upload.");
      setProgress(false);
      return;
    }
    const data = new FormData();
    // Ensure patient field is set for patients
    if (user.user_type === "patient") {
      data.append("patient", user.id);
      data.append("doctor", form.doctor);
    } else if (user.user_type === "doctor") {
      data.append("doctor", user.id);
      data.append("patient", form.patient);
    }
    if (form.prescription) data.append("prescription", form.prescription);
    if (form.description) data.append("description", form.description);
    try {
      await axios.post("api/records/upload/", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setProgress(false);
      navigate("/records");
    } catch (err) {
      setProgress(false);
      setError(err.response?.data?.error || "Upload failed");
    }
  };

  return (
    <Fade in>
      <Box display="flex" alignItems="center" justifyContent="center" minHeight="100vh">
        <Paper elevation={8} sx={{ px: 4, py: 6, minWidth: 400, borderRadius: 4, background: "linear-gradient(135deg, #23272f, #23272f 80%, #00bcd4 150%)" }}>
          <Typography variant="h4" color="primary.main" fontWeight={700} gutterBottom align="center">
            Upload Record
          </Typography>
          <form style={{ width: "100%" }} onSubmit={handleSubmit}>
            {user && user.user_type === "doctor" && (
              <FormControl fullWidth margin="normal">
                <InputLabel id="patient-label">Select Patient</InputLabel>
                <Select
                  labelId="patient-label"
                  name="patient"
                  value={form.patient}
                  label="Select Patient"
                  onChange={handleChange}
                  required
                >
                  {patients.map(p => (
                    <MenuItem key={p.id} value={p.id}>{p.username} ({p.email})</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            {user && user.user_type === "patient" && (
              <FormControl fullWidth margin="normal">
                <InputLabel id="doctor-label">Select Doctor</InputLabel>
                <Select
                  labelId="doctor-label"
                  name="doctor"
                  value={form.doctor}
                  label="Select Doctor"
                  onChange={handleChange}
                  required
                >
                  {doctors.map(d => (
                    <MenuItem key={d.id} value={d.id}>{d.username} ({d.email})</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <TextField
              name="description"
              label="Description"
              fullWidth
              variant="outlined"
              margin="normal"
              onChange={handleChange}
              value={form.description}
            />
            <Button
              variant="contained"
              component="label"
              fullWidth
              sx={{ mt: 2, mb: 2 }}
            >
              Upload File
              <input type="file" name="prescription" hidden onChange={handleChange} required />
            </Button>
            {error && <Typography color="error">{error}</Typography>}
            {progress && <LinearProgress />}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2, fontWeight: 700, fontSize: 18, borderRadius: 3 }}
            >
              Upload
            </Button>
          </form>
        </Paper>
      </Box>
    </Fade>
  );
}