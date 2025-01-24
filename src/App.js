import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import ToolList from "./components/ToolList";
import AdminPanel from "./components/AdminPanel";
import SignUp from "./components/SignUp";
import Login from "./components/Login";
import { useAuth } from "./AuthProvider"; // Import useAuth hook
import { Box, Button, Typography, AppBar, Toolbar } from "@mui/material";

const App = () => {
  const { user, role, logout } = useAuth(); // Get user, role, and logout function from AuthProvider

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
          {role === "admin" && (
            <Button color="inherit" component={Link} to="/admin">
              Admin Panel
            </Button>
          )}
          {!user ? (
            <>
              <Button color="inherit" component={Link} to="/signup">
                Sign Up
              </Button>
              <Button color="inherit" component={Link} to="/login">
                Login
              </Button>
            </>
          ) : (
            <>
              <Typography sx={{ marginRight: 2, fontSize: "0.875rem" }}>
                {`Logged in as: ${user.displayName || user.email}`}
              </Typography>
              <Button color="inherit" onClick={logout}>
                Logout
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      {/* Page Content */}
      <Box sx={{ padding: 4 }}>
        <Routes>
          <Route path="/" element={<ToolList />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </Box>
    </Router>
  );
};

export default App;
