import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#00bcd4",
    },
    secondary: {
      main: "#ff4081",
    },
    background: {
      default: "#121212",
      paper: "#23272f",
    },
  },
  shape: { borderRadius: 16 },
  typography: {
    fontFamily: [
      "Poppins",
      "Roboto",
      "sans-serif"
    ].join(","),
    h2: { fontWeight: 700, letterSpacing: 2 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          transition: "transform 0.2s cubic-bezier(.08,.82,.17,1)",
          "&:hover": {
            transform: "scale(1.07) perspective(300px) rotateY(3deg)",
          }
        }
      }
    }
  }
});

export default theme;