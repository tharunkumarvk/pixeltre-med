import React, { useEffect, useState } from "react";
import {
  Box, Typography, Paper, List, ListItem, ListItemAvatar, Avatar,
  ListItemText, IconButton, Tooltip, Fade, Chip
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ShareIcon from "@mui/icons-material/Share";
import LinkIcon from "@mui/icons-material/Link";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

export default function RecordList() {
  const [records, setRecords] = useState([]);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [csrfToken, setCsrfToken] = useState("");  // Added
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch CSRF token
    axios.get(`${API_URL}/csrf/`, { withCredentials: true })
      .then(res => setCsrfToken(res.data.csrfToken))
      .catch(err => console.error("Failed to fetch CSRF token"));
    // Fetch records
    axios.get(`${API_URL}/records/`, { withCredentials: true })
      .then(res => setRecords(res.data))
      .catch(err => setError("Failed to fetch records"));
  }, []);

  const handleDelete = async id => {
    try {
      await axios.post(`${API_URL}/records/${id}/delete/`, {}, {
        headers: { "X-CSRFToken": csrfToken },  // Added
        withCredentials: true
      });
      setRecords(records.filter(r => r.id !== id));
      setMsg("Record deleted");
    } catch {
      setError("Failed to delete record");
    }
  };

  const handleShare = async id => {
    try {
      const userId = prompt("Enter user ID to share with");
      await axios.post(`${API_URL}/records/${id}/share/`, { user_id: userId }, {
        headers: { "X-CSRFToken": csrfToken },  // Added
        withCredentials: true
      });
      setMsg(`Shared with user ${userId}`);
    } catch {
      setError("Failed to share record");
    }
  };

  const handleGenerateLink = async id => {
    try {
      const res = await axios.post(`${API_URL}/records/${id}/generate-link/`, {}, {
        headers: { "X-CSRFToken": csrfToken },  // Added
        withCredentials: true
      });
      setMsg(`Shareable link: ${res.data.link}`);
    } catch {
      setError("Failed to generate link");
    }
  };

  return (
    <Fade in>
      <Box display="flex" alignItems="center" justifyContent="center" minHeight="100vh">
        <Paper elevation={8} sx={{
          px: 4, py: 6, minWidth: 460, maxWidth: 600, borderRadius: 4,
          background: "linear-gradient(135deg, #23272f, #23272f 80%, #00bcd4 150%)"
        }}>
          <Typography variant="h4" fontWeight={700} color="primary.main" align="center" gutterBottom>
            My Medical Records
          </Typography>
          <Box display="flex" justifyContent="flex-end" mb={1}>
            <motion.div whileHover={{ scale: 1.08 }}>
              <Chip
                clickable
                color="primary"
                label="Upload New Record"
                onClick={() => navigate("/upload")}
                sx={{ fontWeight: 600, fontSize: 15, borderRadius: 2 }}
              />
            </motion.div>
          </Box>
          {error && <Typography color="error">{error}</Typography>}
          {msg && <Typography color="secondary.main" mb={2}>{msg}</Typography>}
          <List>
            {records.map(rec => (
              <motion.div
                key={rec.id}
                whileHover={{ scale: 1.04, boxShadow: "0 0 24px 0 #00bcd4" }}
                style={{ marginBottom: 12, borderRadius: 16 }}
              >
                <ListItem
                  sx={{
                    background: "linear-gradient(120deg, #23272f 80%, #00bcd4 160%)",
                    mb: 2, borderRadius: 3
                  }}
                  secondaryAction={
                    <>
                      <Tooltip title="Delete Record">
                        <IconButton edge="end" onClick={() => handleDelete(rec.id)}>
                          <DeleteIcon color="error" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Share with User">
                        <IconButton edge="end" onClick={() => handleShare(rec.id)}>
                          <ShareIcon color="primary" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Get Shareable Link">
                        <IconButton edge="end" onClick={() => handleGenerateLink(rec.id)}>
                          <LinkIcon color="secondary" />
                        </IconButton>
                      </Tooltip>
                    </>
                  }
                >
                  <ListItemAvatar>
                    <Avatar>
                      <MedicalServicesIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={rec.description || "No Description"}
                    secondary={`Uploaded: ${new Date(rec.upload_date).toLocaleString()}`}
                  />
                </ListItem>
              </motion.div>
            ))}
          </List>
        </Paper>
      </Box>
    </Fade>
  );
}