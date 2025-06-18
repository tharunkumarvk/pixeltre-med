import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Snackbar, Table, TableContainer, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import axios from "../api/axios";

export default function AdminPackagePortal() {
    const [packages, setPackages] = useState([]);
    const [open, setOpen] = useState(false);
    const [edit, setEdit] = useState(null);
    const [form, setForm] = useState({ name: "", max_uploads: 0, max_storage_mb: 0, max_shares: 0, max_downloads: 0, max_reminders: 0, max_patients: 0, can_share: true, can_delete: true, can_set_reminders: true });
    const [snackbar, setSnackbar] = useState({ open: false, message: "" });

    const fetchPackages = () => {
        axios.get("api/packages/").then(res => setPackages(res.data)).catch(() => setPackages([]));
    };
    useEffect(() => { fetchPackages(); }, []);

    const handleOpen = (pkg = null) => {
        setEdit(pkg);
        setForm(pkg ? { ...pkg } : { name: "", max_uploads: 0, max_storage_mb: 0, max_shares: 0, max_downloads: 0, max_reminders: 0, max_patients: 0, can_share: true, can_delete: true, can_set_reminders: true });
        setOpen(true);
    };
    const handleClose = () => setOpen(false);
    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

    const handleSubmit = async () => {
        try {
            if (edit) {
                await axios.put(`api/packages/${edit.id}/`, form);
                setSnackbar({ open: true, message: "Package updated" });
            } else {
                await axios.post("api/packages/", form);
                setSnackbar({ open: true, message: "Package created" });
            }
            fetchPackages();
            handleClose();
        } catch {
            setSnackbar({ open: true, message: "Failed to save package" });
        }
    };
    const handleDelete = async id => {
        try {
            await axios.delete(`api/packages/${id}/`);
            setSnackbar({ open: true, message: "Package deleted" });
            fetchPackages();
        } catch {
            setSnackbar({ open: true, message: "Failed to delete package" });
        }
    };

    return (
        <Box sx={{ minHeight: "100vh", background: "linear-gradient(135deg, #f7fafd 0%, #e3f2fd 100%)" }}>
            <Paper elevation={8} sx={{ px: 4, py: 6, minWidth: 500, borderRadius: 4, background: "#fff", mt: 8, mx: "auto" }}>
                <Typography variant="h4" fontWeight={700} color="primary.main" align="center" gutterBottom>
                    Package Management
                </Typography>
                <Button variant="contained" color="primary" sx={{ mb: 2, borderRadius: 3 }} onClick={() => handleOpen()}>
                    Add Package
                </Button>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Max Uploads</TableCell>
                                <TableCell>Max Storage (MB)</TableCell>
                                <TableCell>Max Shares</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {packages.map(pkg => (
                                <TableRow key={pkg.id}>
                                    <TableCell>{pkg.name}</TableCell>
                                    <TableCell>{pkg.max_uploads}</TableCell>
                                    <TableCell>{pkg.max_storage_mb}</TableCell>
                                    <TableCell>{pkg.max_shares}</TableCell>
                                    <TableCell>
                                        <Button onClick={() => handleOpen(pkg)} size="small">Edit</Button>
                                        <Button onClick={() => handleDelete(pkg.id)} size="small" color="error">Delete</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Dialog open={open} onClose={handleClose}>
                    <DialogTitle>{edit ? "Edit Package" : "Add Package"}</DialogTitle>
                    <DialogContent>
                        <Box display="flex" flexDirection="column" gap={2} mt={1}>
                            <TextField name="name" label="Name" value={form.name} onChange={handleChange} fullWidth />
                            <TextField name="max_uploads" label="Max Uploads" type="number" value={form.max_uploads} onChange={handleChange} fullWidth />
                            <TextField name="max_storage_mb" label="Max Storage (MB)" type="number" value={form.max_storage_mb} onChange={handleChange} fullWidth />
                            <TextField name="max_shares" label="Max Shares" type="number" value={form.max_shares} onChange={handleChange} fullWidth />
                            <TextField name="max_downloads" label="Max Downloads" type="number" value={form.max_downloads || 0} onChange={handleChange} fullWidth />
                            <TextField name="max_reminders" label="Max Reminders" type="number" value={form.max_reminders || 0} onChange={handleChange} fullWidth />
                            <TextField name="max_patients" label="Max Patients" type="number" value={form.max_patients || 0} onChange={handleChange} fullWidth />
                            <TextField select name="can_share" label="Can Share" value={form.can_share} onChange={handleChange} fullWidth>
                                <MenuItem value={true}>Yes</MenuItem>
                                <MenuItem value={false}>No</MenuItem>
                            </TextField>
                            <TextField select name="can_delete" label="Can Delete" value={form.can_delete} onChange={handleChange} fullWidth>
                                <MenuItem value={true}>Yes</MenuItem>
                                <MenuItem value={false}>No</MenuItem>
                            </TextField>
                            <TextField select name="can_set_reminders" label="Can Set Reminders" value={form.can_set_reminders} onChange={handleChange} fullWidth>
                                <MenuItem value={true}>Yes</MenuItem>
                                <MenuItem value={false}>No</MenuItem>
                            </TextField>
                            <TextField
                                name="price"
                                label="Price (INR)"
                                type="number"
                                value={form.price}
                                onChange={handleChange}
                                fullWidth
                                margin="normal"
                                InputProps={{ startAdornment: <span style={{ marginRight: 4 }}>₹</span> }}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose} color="secondary">Cancel</Button>
                        <Button onClick={handleSubmit} color="primary" variant="contained">{edit ? "Update" : "Create"}</Button>
                    </DialogActions>
                </Dialog>
                <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ open: false, message: "" })} message={snackbar.message} />
            </Paper>
        </Box>
    );
}
