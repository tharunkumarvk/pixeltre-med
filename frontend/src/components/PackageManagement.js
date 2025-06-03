import React, { useEffect, useState } from "react";
import {
  Box, Typography, Paper, List, ListItem, ListItemText, Button, Fade,
  TextField, Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function PackageManagement() {
  const [packages, setPackages] = useState([]);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "", price: "", max_uploads: "", max_storage_mb: "", max_shares: "",
    can_share: true, can_set_reminders: true, can_delete: true
  });
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("api/packages/").then(res => setPackages(res.data))
      .catch(err => {
        if (err.response?.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("user");
          navigate("/login");
        } else {
          setError("Failed to load packages");
        }
      });
  }, [navigate]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post("api/packages/", form);
      setOpen(false);
      setForm({
        name: "", price: "", max_uploads: "", max_storage_mb: "", max_shares: "",
        can_share: true, can_set_reminders: true, can_delete: true
      });
      axios.get("api/packages/").then(res => setPackages(res.data));
    } catch {
      setError("Failed to create package");
    }
  };

  const handleDelete = async id => {
    try {
      await axios.delete(`api/packages/${id}/`);
      setPackages(packages.filter(p => p.id !== id));
    } catch {
      setError("Failed to delete package");
    }
  };

  return (
    <Fade in>
      <Box display="flex" alignItems="flex-start" justifyContent="center" minHeight="100vh" pt={8}>
        <Paper elevation={8} sx={{
          px: 4, py: 6, minWidth: 400, borderRadius: 4,
          background: "linear-gradient(135deg, #23272f, #23272f 80%, #00bcd4 150%)"
        }}>
          <Typography variant="h4" color="primary.main" fontWeight={700} gutterBottom>
            Manage Packages
          </Typography>
          <Button
            variant="contained"
            onClick={() => setOpen(true)}
            sx={{ mb: 2 }}
          >
            Add Package
          </Button>
          {error && <Typography color="error">{error}</Typography>}
          <List>
            {packages.map(p => (
              <ListItem key={p.id} divider={true}>
                <ListItemText
                  primary={p.name}
                  secondary={`Price: $${p.price}, Uploads: ${p.max_uploads}, Storage: ${p.max_storage_mb} MB`}
                />
                <Button
                  onClick={() => handleDelete(p.id)}
                  variant="outlined"
                  color="secondary"
                  sx={{ ml: 2 }}
                >
                  Delete
                </Button>
              </ListItem>
            ))}
          </List>
          <Dialog open={open} onClose={() => setOpen(false)}>
            <DialogTitle>Add New Package</DialogTitle>
            <DialogContent>
              <TextField
                name="name"
                label="Name"
                fullWidth
                margin="normal"
                onChange={handleChange}
                required
              />
              <TextField
                name="price"
                type="number"
                label="Price"
                fullWidth
                margin="normal"
                onChange={handleChange}
                required
              />
              <TextField
                name="max_uploads"
                type="number"
                label="Max Uploads"
                fullWidth
                margin="normal"
                onChange={handleChange}
                required
              />
              <TextField
                name="max_storage_mb"
                type="number"
                label="Max Storage (MB)"
                fullWidth
                margin="normal"
                onChange={handleChange}
                required
              />
              <TextField
                name="max_shares"
                type="number"
                label="Max Shares"
                fullWidth
                margin="normal"
                onChange={handleChange}
                required
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit} variant="contained">Save</Button>
            </DialogActions>
          </Dialog>
        </Paper>
      </Box>
    </Fade>
  );
}