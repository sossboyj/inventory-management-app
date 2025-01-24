import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2", // Main blue color
      light: "#63a4ff",
      dark: "#004ba0",
    },
    secondary: {
      main: "#d32f2f", // Main red color
      light: "#ff6659",
      dark: "#9a0007",
    },
    background: {
      default: "#f4f6f8", // Light grey background
      paper: "#ffffff", // Card and paper background
    },
    text: {
      primary: "#000000", // Black for primary text
      secondary: "#757575", // Grey for secondary text
    },
  },
  typography: {
    fontFamily: "'Roboto', 'Arial', sans-serif",
    h1: { fontSize: "2.5rem", fontWeight: 700 },
    h2: { fontSize: "2rem", fontWeight: 600 },
    body1: { fontSize: "1rem", fontWeight: 400 },
    button: { textTransform: "none" }, // Disable button text capitalization
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Rounded corners for buttons
        },
      },
    },
  },
});

export default theme;
