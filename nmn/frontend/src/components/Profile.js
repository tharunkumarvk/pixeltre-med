import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, TextField, Button, Fade, Snackbar, LinearProgress } from "@mui/material";
import axios from "../api/axios";

export default function Profile() {
    const [profile, setProfile] = useState(null);
    const [form, setForm] = useState({ username: "", email: "", phone_number: "" });
    const [edit, setEdit] = useState(false);
    const [error, setError] = useState("");
    const [progress, setProgress] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: "" });

    useEffect(() => {
        axios.get("api/profile/", { headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` } })
            .then(res => {
                setProfile(res.data);
                setForm({
                    username: res.data.username || "",
                    email: res.data.email || "",
                    phone_number: res.data.phone_number || ""
                });
            })
            .catch(() => setError("Failed to load profile"));
    }, []);

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleUpdate = async e => {
        e.preventDefault();
        setProgress(true);
        setError("");
        try {
            const res = await axios.put("api/profile/update/", form);
            setProfile(res.data);
            setEdit(false);
            setSnackbar({ open: true, message: "Profile updated" });
        } catch (err) {
            setError(err.response?.data?.error || "Update failed");
        }
        setProgress(false);
    };

    if (!profile) return <Typography>Loading...</Typography>;

    return (
        <Fade in>
            <Box display="flex" alignItems="center" justifyContent="center" minHeight="100vh">
                <Paper elevation={8} sx={{ px: 4, py: 6, minWidth: 400, borderRadius: 4, background: "linear-gradient(135deg, #23272f, #23272f 80%, #00bcd4 150%)" }}>
                    <Typography variant="h4" color="primary.main" fontWeight={700} gutterBottom align="center">
                        My Profile
                    </Typography>
                    {!edit ? (
                        <Box>
                            <Typography variant="h6">Username: {profile.username}</Typography>
                            <Typography>Email: {profile.email}</Typography>
                            <Typography>Phone: {profile.phone_number}</Typography>
                            <Button variant="contained" sx={{ mt: 2 }} onClick={() => setEdit(true)}>Edit</Button>
                        </Box>
                    ) : (
                        <form onSubmit={handleUpdate} style={{ width: "100%" }}>
                            <TextField
                                name="username"
                                label="Username"
                                fullWidth
                                margin="normal"
                                value={form.username}
                                onChange={handleChange}
                                required
                            />
                            <TextField
                                name="email"
                                label="Email"
                                fullWidth
                                margin="normal"
                                value={form.email}
                                onChange={handleChange}
                                required
                            />
                            <TextField
                                name="phone_number"
                                label="Phone Number"
                                fullWidth
                                margin="normal"
                                value={form.phone_number}
                                onChange={handleChange}
                                required
                            />
                            {error && <Typography color="error">{error}</Typography>}
                            {progress && <LinearProgress />}
                            <Box display="flex" gap={2} mt={2}>
                                <Button variant="contained" type="submit">Save</Button>
                                <Button onClick={() => setEdit(false)}>Cancel</Button>
                            </Box>
                        </form>
                    )}
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
