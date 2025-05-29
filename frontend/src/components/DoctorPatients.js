import React, { useEffect, useState } from "react";
import {
  Box, Paper, Typography, List, ListItem, ListItemText, Button, Fade
} from "@mui/material";
import axios from "../api/axios";

export default function DoctorPatients() {
  const [patients, setPatients] = useState([]);
  const [selected, setSelected] = useState(null);
  const [records, setRecords] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    axios.get("api/patients/").then(res => setPatients(res.data))
      .catch(() => setError("Failed to load patients"));
  }, []);

  const viewRecords = (patientId) => {
    axios.get(`api/patient/${patientId}/records/`).then(res => setRecords(res.data));
    setSelected(patientId);
  };

  return (
    <Fade in>
      <Box display="flex" alignItems="flex-start" justifyContent="center" minHeight="100vh" pt={8}>
        <Paper elevation={8} sx={{
          px: 4, py: 6, minWidth: 400, borderRadius: 4,
          background: "linear-gradient(135deg,#23272f,#23272f 80%,#00bcd4 150%)"
        }}>
          <Typography variant="h4" color="primary.main" fontWeight={700} gutterBottom>
            My Patients
          </Typography>
          {error && <Typography color="error">{error}</Typography>}
          <List>
            {patients.map(p => (
              <ListItem key={p.id} divider>
                <ListItemText
                  primary={p.username}
                  secondary={p.email}
                />
                <Button onClick={() => viewRecords(p.id)} variant="outlined" sx={{ ml: 2 }}>
                  View Records
                </Button>
              </ListItem>
            ))}
          </List>
          {selected && (
            <Box mt={4}>
              <Typography variant="h6" color="secondary.main" gutterBottom>
                Records for Patient ID {selected}
              </Typography>
              <List>
                {records.map(r => (
                  <ListItem key={r.id} sx={{ borderBottom: "1px solid #444" }}>
                    <ListItemText
                      primary={r.description || "No Description"}
                      secondary={`Uploaded: ${new Date(r.upload_date).toLocaleString()}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Paper>
      </Box>
    </Fade>
  );
}