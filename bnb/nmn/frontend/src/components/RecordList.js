import React, { useEffect, useState } from "react";
import {
  Box, Typography, Paper, List, ListItem, ListItemText, IconButton, Fade, Snackbar, Button
} from "@mui/material";
import { Delete, Share, Download, Visibility } from "@mui/icons-material";
import CircularProgress from "@mui/material/CircularProgress";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function RecordList() {
  const [records, setRecords] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [showSnackbar, setShowSnackbar] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    setLoading(true);
    axios.get("api/records/")
      .then(res => {
        setRecords(res.data);
        setLoading(false);
      })
      .catch(err => {
        if (err.response?.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("user");
          navigate("/login");
        } else {
          setError("Failed to load records");
          setLoading(false);
        }
      });
  }, [navigate]);

  const handleDelete = async (id) => {
    try {
      await axios.post(`api/records/${id}/delete/`);
      setRecords(records.filter(r => r.id !== id));
    } catch {
      setError("Failed to delete record");
    }
  };

  const handleShare = async (id) => {
    try {
      const res = await axios.post(`api/records/${id}/generate-link/`);
      setRecords(records.map(r => r.id === id ? { ...r, share_token: res.data.token } : r));
      setShareLink(res.data.link);
      setShowSnackbar(true);
    } catch (err) {
      if (err.response && err.response.status === 403) {
        setError(err.response.data.error || "Sharing is not allowed for your account or package.");
      } else {
        setError("Failed to generate share link");
      }
    }
  };

  const handleDownload = async (idOrToken) => {
    try {
      let url = typeof idOrToken === "number"
        ? `/api/records/${idOrToken}/download/`
        : `/api/share/${idOrToken}/`;
      // Always include the JWT token for downloads
      const token = localStorage.getItem("access_token");
      const res = await axios.get(url, {
        responseType: "blob",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      let filename = `record-${idOrToken}`;
      const disposition = res.headers["content-disposition"];
      if (disposition) {
        const match = disposition.match(/filename="?([^";]+)"?/);
        if (match) filename = match[1];
      }
      const blob = new Blob([res.data], { type: res.data.type || res.headers['content-type'] || 'application/octet-stream' });
      const urlObj = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = urlObj;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(urlObj);
    } catch (err) {
      console.error("Download error:", err);
      setError("Failed to download record");
    }
  };

  const handlePreview = (id) => {
    navigate(`/preview/${id}`);
  };

  return (
    <Fade in>
      <Box display="flex" alignItems="center" justifyContent="center" minHeight="100vh" pt={8}>
        <Paper elevation={8} sx={{
          px: 4, py: 6, minWidth: 400, borderRadius: 4,
          background: "linear-gradient(135deg, #23272f, #23272f 80%, #00bcd4 150%)"
        }}>
          <Typography variant="h4" color="primary.main" fontWeight={700} gutterBottom>
            Medical Records
          </Typography>
          {error && <Typography color="error">{error}</Typography>}
          {loading && <CircularProgress />}
          <List>
            {records.map(record => (
              <ListItem key={record.id} divider>
                <ListItemText
                  primary={`Record ${record.id}`}
                  secondary={`Description: ${record.description || 'None'}`}
                />
                {(user && user.user_type === "patient") && (
                  <>
                    <IconButton onClick={() => handleShare(record.id)} color="primary">
                      <Share />
                    </IconButton>
                    <IconButton onClick={() => handlePreview(record.id)} color="primary">
                      <Visibility />
                    </IconButton>
                    <IconButton onClick={() => handleDownload(record.id)} color="primary">
                      <Download />
                    </IconButton>
                  </>
                )}
                {(user && user.user_type === "doctor") && (
                  <IconButton onClick={() => handleDownload(record.id)} color="primary">
                    <Download />
                  </IconButton>
                )}
                {(user && (user.user_type === "patient" || user.user_type === "doctor")) && (
                  <IconButton onClick={() => handleDelete(record.id)} color="secondary">
                    <Delete />
                  </IconButton>
                )}
              </ListItem>
            ))}
          </List>
          <Snackbar
            open={showSnackbar}
            autoHideDuration={8000}
            onClose={() => setShowSnackbar(false)}
            message={
              <span>
                Share link generated: <a href={shareLink} target="_blank" rel="noopener noreferrer" style={{ color: '#00bcd4' }}>{shareLink}</a>
              </span>
            }
            action={
              <Button color="primary" size="small" onClick={() => {
                navigator.clipboard.writeText(shareLink);
                setShowSnackbar(false);
              }}>
                Copy
              </Button>
            }
          />
        </Paper>
      </Box>
    </Fade>
  );
}