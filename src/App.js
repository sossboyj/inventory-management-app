import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import ToolList from "./components/ToolList";
import AdminPanel from "./components/AdminPanel";
import SignUp from "./components/SignUp";
import Login from "./components/Login";
import { useAuth } from "./AuthProvider"; // Import useAuth hook
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Box,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LoadingScreen from "./components/LoadingScreen"; // Loading animation
import Logo from "./assets/logo.svg";

const App = () => {
  const { user, role, signOutUser, loading } = useAuth(); // Include loading state
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Show Loading Animation while Firebase Auth Resolves
  if (loading) return <LoadingScreen />;

  // Toggle drawer state
  const toggleDrawer = (open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  // Drawer content
  const DrawerList = () => (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        {/* Tools List (always visible) */}
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/">
            <ListItemText primary="Tool List" />
          </ListItemButton>
        </ListItem>

        {/* Admin Panel link (only if role === "admin") */}
        {role === "admin" && (
          <ListItem disablePadding>
            <ListItemButton component={Link} to="/admin">
              <ListItemText primary="Admin Panel" />
            </ListItemButton>
          </ListItem>
        )}

        {/* If no user logged in, show SignUp/Login */}
        {!user ? (
          <>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/signup">
                <ListItemText primary="Sign Up" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/login">
                <ListItemText primary="Login" />
              </ListItemButton>
            </ListItem>
          </>
        ) : (
          <>
            <ListItem>
              <Typography
                variant="body2"
                sx={{ fontSize: "0.875rem", fontWeight: "bold" }}
              >
                {`Logged in as: ${user.displayName || user.email}`}
              </Typography>
            </ListItem>
            {/* Logout item calls signOutUser */}
            <ListItem disablePadding>
              <ListItemButton onClick={signOutUser}>
                <ListItemText primary="Logout" />
              </ListItemButton>
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <Router>
      {/* Application Header */}
      <AppBar position="static" sx={{ backgroundColor: "#1976d2" }}>
        <Toolbar>
          {/* Sidebar Menu Button */}
          <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleDrawer(true)}>
            <MenuIcon />
          </IconButton>

          {/* Logo */}
          <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
            <img src={Logo} alt="Toolify Logo" width="40" height="40" style={{ marginRight: "10px" }} />
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Toolify
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer for Mobile Navigation */}
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        <DrawerList />
      </Drawer>

      {/* Page Content */}
      <Box sx={{ padding: 2 }}>
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
