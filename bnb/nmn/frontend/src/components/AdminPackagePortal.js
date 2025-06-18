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

    const renderFormFields = () => {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const isDoctor = user.user_type === "doctor";

        return (
            <Box display="flex" flexDirection="column" gap={2} mt={1}>
                <TextField name="name" label="Name" value={form.name} onChange={handleChange} fullWidth />
                <TextField name="max_uploads" label="Max Uploads" type="number" value={form.max_uploads} onChange={handleChange} fullWidth />
                <TextField name="max_storage_mb" label="Max Storage (MB)" type="number" value={form.max_storage_mb} onChange={handleChange} fullWidth />
                <TextField name="max_shares" label="Max Shares" type="number" value={form.max_shares} onChange={handleChange} fullWidth />
                <TextField name="max_downloads" label="Max Downloads" type="number" value={form.max_downloads || 0} onChange={handleChange} fullWidth />
                <TextField name="max_reminders" label="Max Reminders" type="number" value={form.max_reminders || 0} onChange={handleChange} fullWidth />
                <TextField name="max_patients" label="Max Patients" type="number" value={form.max_patients || 0} onChange={handleChange} fullWidth />
                {!isDoctor && (
                    <>
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
                    </>
                )}
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
        );
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                background: "linear-gradient(135deg, #f7fafd 0%, #e3f2fd 100%)",
                perspective: "1000px",
            }}
        >
            <Paper
                elevation={8}
                sx={{
                    px: 4,
                    py: 6,
                    minWidth: 500,
                    borderRadius: 16,
                    background: "#fff",
                    boxShadow: "0 4px 16px rgba(60,72,88,0.15)",
                    transition: "transform 0.3s ease-in-out",
                    "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: "0 6px 20px rgba(60,72,88,0.2)",
                    },
                    mt: 8,
                    mx: "auto",
                }}
            >
                <Typography
                    variant="h4"
                    fontWeight={700}
                    color="primary.main"
                    align="center"
                    gutterBottom
                >
                    Package Management
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    sx={{
                        mb: 2,
                        borderRadius: 12,
                        boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                        transition: "transform 0.3s ease-in-out",
                        "&:hover": {
                            transform: "scale(1.1)",
                            boxShadow: "0 6px 12px rgba(0,0,0,0.3)",
                        },
                    }}
                    onClick={() => handleOpen()}
                >
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
                            {packages.map((pkg) => (
                                <TableRow key={pkg.id}>
                                    <TableCell>{pkg.name}</TableCell>
                                    <TableCell>{pkg.max_uploads}</TableCell>
                                    <TableCell>{pkg.max_storage_mb}</TableCell>
                                    <TableCell>{pkg.max_shares}</TableCell>
                                    <TableCell>
                                        <Button
                                            onClick={() => handleOpen(pkg)}
                                            size="small"
                                            sx={{
                                                borderRadius: 8,
                                                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                                transition: "transform 0.2s ease-in-out",
                                                "&:hover": {
                                                    transform: "scale(1.05)",
                                                    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                                                },
                                            }}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            onClick={() => handleDelete(pkg.id)}
                                            size="small"
                                            color="error"
                                            sx={{
                                                borderRadius: 8,
                                                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                                transition: "transform 0.2s ease-in-out",
                                                "&:hover": {
                                                    transform: "scale(1.05)",
                                                    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                                                },
                                            }}
                                        >
                                            Delete
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Dialog open={open} onClose={handleClose}>
                    <DialogTitle>{edit ? "Edit Package" : "Add Package"}</DialogTitle>
                    <DialogContent>{renderFormFields()}</DialogContent>
                    <DialogActions>
                        <Button
                            onClick={handleClose}
                            color="secondary"
                            sx={{
                                borderRadius: 8,
                                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                transition: "transform 0.2s ease-in-out",
                                "&:hover": {
                                    transform: "scale(1.05)",
                                    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                                },
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            color="primary"
                            variant="contained"
                            sx={{
                                borderRadius: 8,
                                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                transition: "transform 0.2s ease-in-out",
                                "&:hover": {
                                    transform: "scale(1.05)",
                                    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                                },
                            }}
                        >
                            {edit ? "Update" : "Create"}
                        </Button>
                    </DialogActions>
                </Dialog>
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={3000}
                    onClose={() => setSnackbar({ open: false, message: "" })}
                    message={snackbar.message}
                    sx={{
                        borderRadius: 8,
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        transition: "transform 0.2s ease-in-out",
                        "&:hover": {
                            transform: "scale(1.05)",
                            boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                        },
                    }}
                />
            </Paper>
        </Box>
    );
}
