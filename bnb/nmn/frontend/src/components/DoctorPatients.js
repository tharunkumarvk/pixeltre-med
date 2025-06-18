import React, { useEffect, useState } from "react";
import {
  Box, Typography, Paper, List, ListItem, ListItemAvatar, Avatar,
  ListItemText, Fade, Button, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Select, Snackbar, IconButton
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function DoctorPatients() {
  const [patients, setPatients] = useState([]);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [allPatients, setAllPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });
  const [editPatient, setEditPatient] = useState(null);
  const [editForm, setEditForm] = useState({ username: "", email: "", phone_number: "" });
  const navigate = useNavigate();

  // Fetch assigned patients
  const fetchPatients = () => {
    axios.get("api/patients/")
      .then(res => setPatients(res.data))
      .catch(err => {
        if (err.response?.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("user");
          navigate("/login");
        } else {
          setError("Failed to load patients");
        }
      });
  };

  useEffect(() => {
    fetchPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  // Fetch all patients for assignment
  const handleOpen = async () => {
    setOpen(true);
    try {
      const res = await axios.get("api/patients/all/");
      // Filter out already assigned patients
      const assignedIds = new Set(patients.map(p => p.id));
      setAllPatients(res.data.filter(p => !assignedIds.has(p.id)));
    } catch {
      setAllPatients([]);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedPatient("");
  };

  const handleAssign = async () => {
    if (!selectedPatient) return;
    try {
      await axios.post(`api/patients/${selectedPatient}/assign/`);
      setSnackbar({ open: true, message: "Patient assigned successfully" });
      fetchPatients();
      handleClose();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.error || "Failed to assign patient" });
    }
  };

  // CRUD: Remove patient
  const handleRemove = async (id) => {
    try {
      await axios.post(`api/patients/${id}/remove/`);
      setSnackbar({ open: true, message: "Patient removed" });
      fetchPatients();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.error || "Failed to remove patient" });
    }
  };

  // CRUD: Edit patient
  const handleEditOpen = (patient) => {
    setEditPatient(patient);
    setEditForm({ username: patient.username, email: patient.email, phone_number: patient.phone_number });
  };
  const handleEditClose = () => {
    setEditPatient(null);
  };
  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };
  const handleEditSave = async () => {
    try {
      await axios.put(`api/patients/${editPatient.id}/update/`, editForm);
      setSnackbar({ open: true, message: "Patient updated" });
      fetchPatients();
      handleEditClose();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.error || "Failed to update patient" });
    }
  };

  return (
    <Fade in>
      <Box display="flex" alignItems="center" justifyContent="center" minHeight="100vh">
        <Paper elevation={8} sx={{
          px: 4, py: 6, minWidth: 460, borderRadius: 4,
          background: "linear-gradient(135deg, #23272f, #23272f 80%, #00bcd4 150%)"
        }}>
          <Typography variant="h4" fontWeight={700} color="primary.main" align="center" gutterBottom>
            My Patients
          </Typography>
          {error && <Typography color="error">{error}</Typography>}
          <Button variant="contained" color="primary" sx={{ mb: 2 }} onClick={handleOpen}>
            Assign Patient
          </Button>
          <List>
            {patients.map(patient => (
              <ListItem key={patient.id} sx={{ mb: 1, borderRadius: 3 }}
                secondaryAction={
                  <>
                    <IconButton edge="end" aria-label="edit" onClick={() => handleEditOpen(patient)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton edge="end" aria-label="delete" onClick={() => handleRemove(patient.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </>
                }
              >
                <ListItemAvatar>
                  <Avatar>
                    <PersonIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={patient.username}
                  secondary={`Email: ${patient.email}`}
                />
              </ListItem>
            ))}
          </List>
          {/* Assign Patient Dialog */}
          <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Assign Patient</DialogTitle>
            <DialogContent>
              <Select
                value={selectedPatient}
                onChange={e => setSelectedPatient(e.target.value)}
                displayEmpty
                fullWidth
                sx={{ mt: 2 }}
              >
                <MenuItem value="" disabled>Select patient</MenuItem>
                {allPatients.length === 0 && <MenuItem value="" disabled>No unassigned patients</MenuItem>}
                {allPatients.map(p => (
                  <MenuItem key={p.id} value={p.id}>{p.username} ({p.email})</MenuItem>
                ))}
              </Select>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>
              <Button onClick={handleAssign} variant="contained" disabled={!selectedPatient}>Assign</Button>
            </DialogActions>
          </Dialog>
          {/* Edit Patient Dialog */}
          <Dialog open={!!editPatient} onClose={handleEditClose}>
            <DialogTitle>Edit Patient</DialogTitle>
            <DialogContent>
              <Box display="flex" flexDirection="column" gap={2} mt={1}>
                <input
                  name="username"
                  value={editForm.username}
                  onChange={handleEditChange}
                  placeholder="Username"
                  style={{ padding: 8, borderRadius: 4, border: '1px solid #888' }}
                />
                <input
                  name="email"
                  value={editForm.email}
                  onChange={handleEditChange}
                  placeholder="Email"
                  style={{ padding: 8, borderRadius: 4, border: '1px solid #888' }}
                />
                <input
                  name="phone_number"
                  value={editForm.phone_number}
                  onChange={handleEditChange}
                  placeholder="Phone Number"
                  style={{ padding: 8, borderRadius: 4, border: '1px solid #888' }}
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleEditClose}>Cancel</Button>
              <Button onClick={handleEditSave} variant="contained">Save</Button>
            </DialogActions>
          </Dialog>
          <Snackbar
            open={snackbar.open}
            autoHideDuration={3000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            message={snackbar.message}
          />
        </Paper>
      </Box>
    </Fade>
  );
}