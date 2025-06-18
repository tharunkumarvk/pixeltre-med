import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2",
      contrastText: "#fff"
    },
    secondary: {
      main: "#43a047",
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
      default: "#f7fafd",
      paper: "#ffffff"
    },
    text: {
      primary: "#222",
      secondary: "#555"
    },
    divider: "#e0e0e0"
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: [
      "Poppins",
      "Roboto",
      "sans-serif"
    ].join(","),
    h1: { fontWeight: 800, letterSpacing: 3 },
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
          borderRadius: 12,
          transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
          boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
          "&:hover": {
            transform: "scale(1.1)",
            boxShadow: "0 6px 12px rgba(0,0,0,0.3)",
            backgroundColor: "#e3f2fd"
          }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 4px 16px rgba(60,72,88,0.15)",
          transition: "transform 0.3s ease-in-out",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 6px 20px rgba(60,72,88,0.2)"
          }
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: "linear-gradient(90deg, #1976d2 60%, #43a047 100%)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
        }
      }
    }
  }
});

export default theme;