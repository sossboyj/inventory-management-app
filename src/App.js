import React, { useState, useEffect } from "react";
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
  Switch,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import LoadingScreen from "./components/LoadingScreen"; // Loading animation
import Logo from "./assets/logo.svg";

const App = () => {
  const { user, role, signOutUser, loading } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  if (loading) return <LoadingScreen />;

  const toggleDrawer = (open) => (event) => {
    if (event?.type === "keydown" && (event.key === "Tab" || event.key === "Shift")) {
      return;
    }
    setDrawerOpen(open);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const DrawerList = () => (
    <Box
      sx={{ width: 250, backgroundColor: darkMode ? "#1e1e1e" : "#fff", height: "100vh", color: darkMode ? "#fff" : "#000" }}
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
              <Typography variant="body2" sx={{ fontSize: "0.875rem", fontWeight: "bold" }}>
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
      {/* Navbar with Dark Mode Support */}
      <AppBar position="sticky" sx={{ backgroundColor: darkMode ? "#121212" : "#1976d2" }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between", padding: "0 10px" }}>
          {/* Sidebar Menu Button */}
          <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleDrawer(true)}>
            <MenuIcon sx={{ fontSize: 30 }} />
          </IconButton>

          {/* Logo and Title */}
          <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1, justifyContent: "center" }}>
            <img
              src={Logo}
              alt="Toolify Logo"
              width="40"
              height="40"
              style={{ marginRight: "10px" }}
            />
            <Typography variant="h6" sx={{ fontWeight: "bold", fontSize: "1.3rem" }}>
              Toolify
            </Typography>
          </Box>

          {/* Dark Mode Toggle */}
          <IconButton color="inherit" onClick={toggleDarkMode}>
            {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>

          {/* Hideable Logout Button for Larger Screens */}
          {user && (
            <Button
              color="inherit"
              onClick={signOutUser}
              sx={{ display: { xs: "none", md: "block" } }}
            >
              Logout
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {/* Drawer for Mobile Navigation */}
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        <DrawerList />
      </Drawer>

      {/* Page Content */}
      <Box sx={{ padding: { xs: "10px", md: "20px" }, backgroundColor: darkMode ? "#1e1e1e" : "#fff", color: darkMode ? "#ffffff" : "#000000", minHeight: "100vh" }}>
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
