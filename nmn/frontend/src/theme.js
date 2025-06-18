import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2", // blue
      contrastText: "#fff"
    },
    secondary: {
      main: "#43a047", // green accent
      contrastText: "#fff"
    },
    error: {
      main: "#e53935"
    },
    warning: {
      main: "#ffa726"
    },
    info: {
      main: "#0288d1"
    },
    success: {
      main: "#43a047"
    },
    background: {
      default: "#f7fafd", // very light blue/gray
      paper: "#ffffff"
    },
    text: {
      primary: "#222",
      secondary: "#555"
    },
    divider: "#e0e0e0"
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: [
      "Poppins",
      "Roboto",
      "sans-serif"
    ].join(","),
    h2: { fontWeight: 700, letterSpacing: 2 },
    h4: { fontWeight: 600 },
    button: { fontWeight: 600 }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 8,
          transition: "transform 0.2s cubic-bezier(.08,.82,.17,1)",
          "&:hover": {
            transform: "scale(1.05)",
            backgroundColor: "#e3f2fd"
          }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 2px 12px 0 rgba(60,72,88,0.08)"
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: "linear-gradient(90deg, #1976d2 60%, #43a047 100%)"
        }
      }
    }
  }
});

export default theme;