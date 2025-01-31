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
  ListItemText,
  Box,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

const App = () => {
  const { user, role, logout } = useAuth(); // Get user, role, and logout function from AuthProvider
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Toggle drawer state
  const toggleDrawer = (open) => (event) => {
    if (event.type === "keydown" && (event.key === "Tab" || event.key === "Shift")) {
      return;
    }
    setDrawerOpen(open);
  };

  // Drawer content
  const DrawerList = () => (
    <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)} onKeyDown={toggleDrawer(false)}>
      <List>
        <ListItem button component={Link} to="/">
          <ListItemText primary="Tool List" />
        </ListItem>
        {role === "admin" && (
          <ListItem button component={Link} to="/admin">
            <ListItemText primary="Admin Panel" />
          </ListItem>
        )}
        {!user ? (
          <>
            <ListItem button component={Link} to="/signup">
              <ListItemText primary="Sign Up" />
            </ListItem>
            <ListItem button component={Link} to="/login">
              <ListItemText primary="Login" />
            </ListItem>
          </>
        ) : (
          <>
            <ListItem>
              <Typography variant="body2" sx={{ fontSize: "0.875rem", fontWeight: "bold" }}>
                {`Logged in as: ${user.displayName || user.email}`}
              </Typography>
            </ListItem>
            <ListItem button onClick={logout}>
              <ListItemText primary="Logout" />
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
          <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleDrawer(true)}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: "bold" }}>
            Toolify
          </Typography>
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
