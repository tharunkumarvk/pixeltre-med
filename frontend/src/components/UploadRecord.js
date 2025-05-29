import React, { useState, useEffect } from "react";
import {
  Box, Button, Fade, Paper, TextField, Typography, MenuItem, LinearProgress
} from "@mui/material";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function UploadRecord() {
  const [form, setForm] = useState({ doctor: "", patient: "", prescription: null, description: "" });
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    if (user.user_type === "patient") {
      axios.get("api/doctors/").then(res => setDoctors(res.data));
    } else if (user.user_type === "doctor") {
      axios.get("api/patients/").then(res => setPatients(res.data));
    }
  }, [user.user_type]);

  const handleChange = e => {
    const { name, value, files } = e.target;
    if (name === "prescription") setForm(f => ({ ...f, prescription: files[0] }));
    else setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const data = new FormData();
    data.append("description", form.description || "");

    if (user.user_type === "patient") {
      if (!form.doctor) {
        setError("You must select a doctor.");
        return;
      }
      data.append("doctor", form.doctor);
      // DO NOT append patient, backend will set it!
    }
    if (user.user_type === "doctor") {
      if (!form.patient) {
        setError("You must select a patient.");
        return;
      }
      data.append("patient", form.patient);
      // DO NOT append doctor, backend will set it!
    }
    if (form.prescription) {
      data.append("prescription", form.prescription);
    } else {
      setError("Please upload a prescription file.");
      return;
    }

    try {
      setProgress(true);
      await axios.post("api/records/upload/", data);
      setProgress(false);
      navigate("/records");
    } catch (err) {
      setProgress(false);
      // Show backend error
      if (err.response && err.response.data) {
        setError(JSON.stringify(err.response.data));
      } else {
        setError("Upload failed");
      }
    }
  };

  return (
    <Fade in>
      <Box display="flex" alignItems="center" justifyContent="center" minHeight="100vh">
        <Paper elevation={8} sx={{
          px: 4, py: 6, minWidth: 360, borderRadius: 4,
          background: "linear-gradient(135deg,#23272f,#23272f 80%,#00bcd4 150%)"
        }}>
          <Typography variant="h4" color="primary.main" fontWeight={700} gutterBottom align="center">
            Upload Record
          </Typography>
          <form style={{ width: "100%" }} onSubmit={handleSubmit}>
            {user.user_type === "patient" && (
              <TextField
                select name="doctor" label="Doctor"
                value={form.doctor} onChange={handleChange} fullWidth margin="normal" required
              >
                <MenuItem value="">Select Doctor</MenuItem>
                {doctors.map(doc => (
                  <MenuItem key={doc.id} value={doc.id}>{doc.username}</MenuItem>
                ))}
              </TextField>
            )}
            {user.user_type === "doctor" && (
              <TextField
                select name="patient" label="Patient"
                value={form.patient} onChange={handleChange} fullWidth margin="normal" required
              >
                <MenuItem value="">Select Patient</MenuItem>
                {patients.map(pat => (
                  <MenuItem key={pat.id} value={pat.id}>{pat.username}</MenuItem>
                ))}
              </TextField>
            )}
            <Button
              fullWidth
              variant="outlined"
              component="label"
              sx={{ my: 2, py: 1.5, borderRadius: 2, fontWeight: 600, fontSize: 18 }}
            >
              <input type="file" name="prescription" hidden onChange={handleChange} required />
              Upload Prescription (Image)
            </Button>
            <TextField name="description" label="Description" fullWidth variant="outlined"
              margin="normal" onChange={handleChange} />
            {error && <Typography color="error">{error}</Typography>}
            {progress && <LinearProgress />}
            <motion.div whileHover={{ scale: 1.06 }}>
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