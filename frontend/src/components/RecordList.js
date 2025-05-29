import React, { useEffect, useState } from "react";
import {
  Box, Typography, Paper, List, ListItem, ListItemAvatar, Avatar,
  ListItemText, IconButton, Tooltip, Fade, Chip
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ShareIcon from "@mui/icons-material/Share";
import LinkIcon from "@mui/icons-material/Link";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function RecordList() {
  const [records, setRecords] = useState([]);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("api/records/").then(res => setRecords(res.data)).catch(() => setError("Failed to load records"));
  }, []);

  const handleDelete = async id => {
    if (window.confirm("Are you sure?")) {
      await axios.post(`api/records/${id}/delete/`);
      setRecords(rs => rs.filter(r => r.id !== id));
      setMsg("Deleted!");
    }
  };

  const handleShare = async id => {
    const userId = prompt("Enter User ID to share with:");
    if (userId) {
      await axios.post(`api/records/${id}/share/`, { user_id: userId });
      setMsg("Shared with user " + userId);
    }
  };

  const handleGenerateLink = async id => {
    const res = await axios.post(`api/records/${id}/generate-link/`);
    setMsg(`Shareable link: ${res.data.link}`);
  };

  return (
    <Fade in>
      <Box display="flex" alignItems="center" justifyContent="center" minHeight="100vh">
        <Paper elevation={8} sx={{
          px: 4, py: 6, minWidth: 460, maxWidth: 600, borderRadius: 4,
          background: "linear-gradient(135deg,#23272f,#23272f 80%,#00bcd4 150%)"
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
                    background: "linear-gradient(120deg,#23272f 80%,#00bcd4 160%)",
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
                    <Avatar sx={{ bgcolor: "primary.main" }}>
                      <MedicalServicesIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={rec.description || "No Description"}
                    secondary={`Doctor: ${rec.doctor} | Uploaded: ${new Date(rec.upload_date).toLocaleString()}`}
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