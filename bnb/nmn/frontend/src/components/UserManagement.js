import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Snackbar, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, Tabs, Tab } from "@mui/material";
import axios from "../api/axios";

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [open, setOpen] = useState(false);
    const [edit, setEdit] = useState(null);
    const [form, setForm] = useState({ username: "", email: "", user_type: "patient", phone_number: "", password: "", package: "", can_share: null, can_set_reminders: null, can_delete: null });
    const [packages, setPackages] = useState([]);
    const [snackbar, setSnackbar] = useState({ open: false, message: "" });
    const [tab, setTab] = useState(0);

    const fetchUsers = async () => {
        try {
            const response = await axios.get("api/users/");
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users:", error);
            if (error.response?.status === 403) {
                setSnackbar({ open: true, message: "You don't have permission to view users" });
            } else {
                setSnackbar({ open: true, message: "Failed to fetch users" });
            }
            setUsers([]);
        }
    };
    useEffect(() => {
        fetchUsers();
        axios.get("api/packages/").then(res => setPackages(res.data)).catch(() => setPackages([]));
    }, []);

    const handleOpen = (user = null) => {
        setEdit(user);
        setForm(user ? { ...user, password: "", package: user.package || "", can_share: user.can_share, can_set_reminders: user.can_set_reminders, can_delete: user.can_delete } : { username: "", email: "", user_type: "patient", phone_number: "", password: "", package: "", can_share: null, can_set_reminders: null, can_delete: null });
        setOpen(true);
    };
    const handleClose = () => setOpen(false);
    const handleChange = e => {
        const { name, type, checked, value } = e.target;
        setForm({ ...form, [name]: type === "checkbox" ? checked : value });
    };

    const handleSubmit = async () => {
        try {
            const payload = { ...form };
            if (!payload.package) delete payload.package;
            if (edit) {
                await axios.put(`api/users/${edit.id}/`, payload);
                setSnackbar({ open: true, message: "User updated" });
            } else {
                await axios.post("api/users/", payload);
                setSnackbar({ open: true, message: "User created" });
            }
            fetchUsers();
            handleClose();
        } catch {
            setSnackbar({ open: true, message: "Failed to save user" });
        }
    };
    const handleDelete = async id => {
        try {
            await axios.delete(`api/users/${id}/`);
            setSnackbar({ open: true, message: "User deleted" });
            fetchUsers();
        } catch {
            setSnackbar({ open: true, message: "Failed to delete user" });
        }
    };

    // Filter users by type
    const doctors = users.filter(u => u.user_type === "doctor");
    const patients = users.filter(u => u.user_type === "patient");

    return (
        <Box sx={{ minHeight: "100vh", background: "linear-gradient(135deg, #f7fafd 0%, #e3f2fd 100%)" }}>
            <Paper elevation={8} sx={{ px: 4, py: 6, minWidth: 500, borderRadius: 4, background: "#fff", mt: 8, mx: "auto" }}>
                <Typography variant="h4" fontWeight={700} color="primary.main" align="center" gutterBottom>
                    User Management
                </Typography>
                <Button variant="contained" color="primary" sx={{ mb: 2, borderRadius: 3 }} onClick={() => handleOpen()}>
                    Add User
                </Button>
                <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                    <DialogTitle>{edit ? "Edit User" : "Add User"}</DialogTitle>
                    <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <TextField label="Username" name="username" value={form.username} onChange={handleChange} fullWidth margin="normal" required />
                        <TextField label="Email" name="email" value={form.email} onChange={handleChange} fullWidth margin="normal" required />
                        <TextField label="Phone Number" name="phone_number" value={form.phone_number} onChange={handleChange} fullWidth margin="normal" required />
                        <TextField label="User Type" name="user_type" value={form.user_type} onChange={handleChange} select fullWidth margin="normal">
                            <MenuItem value="patient">Patient</MenuItem>
                            <MenuItem value="doctor">Doctor</MenuItem>
                        </TextField>
                        <TextField label="Password" name="password" value={form.password} onChange={handleChange} fullWidth margin="normal" type="password" autoComplete="new-password" required={!edit} />
                        <TextField label="Package" name="package" value={form.package} onChange={handleChange} select fullWidth margin="normal">
                            <MenuItem value="">None</MenuItem>
                            {packages.map(pkg => (
                                <MenuItem key={pkg.id} value={pkg.id}>{pkg.name}</MenuItem>
                            ))}
                        </TextField>
                        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                            <label><input type="checkbox" name="can_share" checked={!!form.can_share} onChange={handleChange} /> Can Share</label>
                            <label><input type="checkbox" name="can_set_reminders" checked={!!form.can_set_reminders} onChange={handleChange} /> Can Set Reminders</label>
                            <label><input type="checkbox" name="can_delete" checked={!!form.can_delete} onChange={handleChange} /> Can Delete</label>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose}>Cancel</Button>
                        <Button onClick={handleSubmit} variant="contained">{edit ? "Update" : "Create"}</Button>
                    </DialogActions>
                </Dialog>
                <Tabs value={tab} onChange={(_, v) => setTab(v)} centered sx={{ mb: 2 }}>
                    <Tab label="Doctors" />
                    <Tab label="Patients" />
                </Tabs>
                {tab === 0 && (
                    <TableContainer sx={{ mt: 4 }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Username</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>User Type</TableCell>
                                    <TableCell>Package</TableCell>
                                    <TableCell>Can Share</TableCell>
                                    <TableCell>Can Set Reminders</TableCell>
                                    <TableCell>Can Delete</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {doctors.map(user => (
                                    <TableRow key={user.id}>
                                        <TableCell>{user.username}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>{user.user_type}</TableCell>
                                        <TableCell>{user.package}</TableCell>
                                        <TableCell>{user.can_share ? "Yes" : "No"}</TableCell>
                                        <TableCell>{user.can_set_reminders ? "Yes" : "No"}</TableCell>
                                        <TableCell>{user.can_delete ? "Yes" : "No"}</TableCell>
                                        <TableCell>
                                            <Button onClick={() => handleOpen(user)} size="small">Edit</Button>
                                            <Button onClick={() => handleDelete(user.id)} size="small" color="error">Delete</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
                {tab === 1 && (
                    <TableContainer sx={{ mt: 4 }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Username</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>User Type</TableCell>
                                    <TableCell>Package</TableCell>
                                    <TableCell>Can Share</TableCell>
                                    <TableCell>Can Set Reminders</TableCell>
                                    <TableCell>Can Delete</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {patients.map(user => (
                                    <TableRow key={user.id}>
                                        <TableCell>{user.username}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>{user.user_type}</TableCell>
                                        <TableCell>{user.package}</TableCell>
                                        <TableCell>{user.can_share ? "Yes" : "No"}</TableCell>
                                        <TableCell>{user.can_set_reminders ? "Yes" : "No"}</TableCell>
                                        <TableCell>{user.can_delete ? "Yes" : "No"}</TableCell>
                                        <TableCell>
                                            <Button onClick={() => handleOpen(user)} size="small">Edit</Button>
                                            <Button onClick={() => handleDelete(user.id)} size="small" color="error">Delete</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
                <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message} />
            </Paper>
        </Box>
    );
}
