import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import ToolList from "./components/ToolList";
import AdminPanel from "./components/AdminPanel";
import SignUp from "./components/SignUp"; // Import the SignUp component
import Login from "./components/Login"; // Import the Login component
import { Box, Button, Typography, AppBar, Toolbar } from "@mui/material";

const App = () => {
  return (
    <Router>
      {/* Application Header */}
      <AppBar position="static" sx={{ backgroundColor: "#1976d2" }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: "bold" }}>
            Inventory Management App
          </Typography>
          <Button color="inherit" component={Link} to="/">
            Tool List
          </Button>
          <Button color="inherit" component={Link} to="/admin">
            Admin Panel
          </Button>
          <Button color="inherit" component={Link} to="/signup">
            Sign Up
          </Button>
          <Button color="inherit" component={Link} to="/login">
            Login
          </Button>
        </Toolbar>
      </AppBar>

      {/* Page Content */}
      <Box sx={{ padding: 4 }}>
        <Routes>
          <Route path="/" element={<ToolList />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/signup" element={<SignUp />} /> {/* SignUp Route */}
          <Route path="/login" element={<Login />} /> {/* Login Route */}
        </Routes>
      </Box>
    </Router>
  );
};

export default App;
