import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, onSnapshot } from "firebase/firestore";
import CheckOutTool from "./CheckOutTool";
import CheckInTool from "./CheckInTools";
import CheckInOut from "./checkInOut"; // Scanner dialog

import {
  Typography,
  TextField,
  Select,
  MenuItem,
  Switch,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  CardMedia,
  Chip,
  Box,
  CircularProgress,
} from "@mui/material";

import { Link } from "react-router-dom";

// Icons
import DarkModeIcon from "@mui/icons-material/DarkMode";
import SearchIcon from "@mui/icons-material/Search";
import BuildIcon from "@mui/icons-material/Build";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import LocationOnIcon from "@mui/icons-material/LocationOn";

const ToolList = () => {
  // --------------------------------
  // 1) State for Tools & Job Sites
  // --------------------------------
  const [tools, setTools] = useState([]);
  const [jobSites, setJobSites] = useState([]);

  // Loading state to show a spinner
  const [loading, setLoading] = useState(true);

  // -------------------------------
  // Check-In / Check-Out State
  // -------------------------------
  const [selectedToolForCheckout, setSelectedToolForCheckout] = useState(null);
  const [selectedToolForCheckin, setSelectedToolForCheckin] = useState(null);

  // -------------------------------
  // Scanner State
  // -------------------------------
  const [showScanner, setShowScanner] = useState(false);

  // -------------------------------
  // UI/UX Enhancements: Search & Filters
  // -------------------------------
  const [searchQuery, setSearchQuery] = useState("");
  const [jobSiteFilter, setJobSiteFilter] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("");

  // -------------------------------
  // 5) Dark Mode State
  // -------------------------------
  const [darkMode, setDarkMode] = useState(false);
  const toggleDarkMode = () => setDarkMode(!darkMode);

  // -------------------------------
  // Fetch Tools from Firestore
  // -------------------------------
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "tools"),
      (snapshot) => {
        const toolsData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || "Unnamed Tool",
            quantity: data.quantity || 0,
            model: data.model || "N/A",
            price: data.price || 0,
            availability: data.availability || false,
            imageUrl: data.imageUrl || null,
            jobSite:
              data.jobSite && data.jobSite.trim() !== ""
                ? data.jobSite
                : "Not Assigned",
          };
        });
        setTools(toolsData);
        setLoading(false); // stop spinner
      },
      (error) => {
        console.error("Error fetching tools:", error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // -------------------------------
  // Fetch Job Sites from Firestore
  // -------------------------------
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "jobSites"),
      (snapshot) => {
        const sitesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setJobSites(sitesData);
      },
      (err) => console.error("Error fetching job sites:", err)
    );
    return () => unsubscribe();
  }, []);

  // -------------------------------
  // Filtered Tools (Search, Job Site, Availability)
  // -------------------------------
  const filteredTools = tools.filter((tool) => {
    const matchesSearch = tool.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    const matchesJobSite =
      !jobSiteFilter || jobSiteFilter === "" || tool.jobSite === jobSiteFilter;

    const matchesAvailability =
      !availabilityFilter ||
      (availabilityFilter === "Available" && tool.availability) ||
      (availabilityFilter === "Checked Out" && !tool.availability);

    return matchesSearch && matchesJobSite && matchesAvailability;
  });

  // -------------------------------
  // Check-Out & Check-In Handlers
  // -------------------------------
  const handleCheckOutSuccess = () => {
    setSelectedToolForCheckout(null);
    alert("Tool checked out successfully!");
  };

  const handleCheckInSuccess = () => {
    setSelectedToolForCheckin(null);
    alert("Tool checked in successfully!");
  };

  // -------------------------------
  // Render Single Tool Card
  // -------------------------------
  const renderToolCard = (tool) => (
    <Card
      key={tool.id}
      sx={{
        backgroundColor: darkMode ? "#1e1e1e" : "#f9f9f9", // darker for more contrast
        color: darkMode ? "#e0e0e0" : "inherit",
        boxShadow: darkMode ? "0px 4px 8px rgba(0,0,0,0.5)" : 2,
        borderRadius: 2,
        p: 1,
        transition: "0.3s",
        "&:hover": {
          transform: "scale(1.03)",
          boxShadow: darkMode
            ? "0px 6px 10px rgba(0,0,0,0.7)"
            : 4, // a bit deeper shadow in dark mode
        },
      }}
    >
      {/* Tool Image */}
      {tool.imageUrl && (
        <CardMedia
          component="img"
          height="140"
          image={tool.imageUrl}
          alt={tool.name}
          sx={{ borderRadius: "4px" }}
        />
      )}

      <CardContent>
        {/* Tool Name */}
        <Typography
          variant="h6"
          gutterBottom
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <BuildIcon />
          {tool.name}
        </Typography>

        {/* Model */}
        <Typography variant="body2" sx={{ display: "flex", gap: 0.5 }}>
          <BuildIcon sx={{ fontSize: 18, color: "gray" }} />
          Model: {tool.model}
        </Typography>

        {/* Price */}
        <Typography variant="body2" sx={{ display: "flex", gap: 0.5 }}>
          <AttachMoneyIcon sx={{ fontSize: 18, color: "green" }} />
          Price: ${tool.price.toFixed(2)}
        </Typography>

        {/* Job Site */}
        <Typography variant="body2" sx={{ display: "flex", gap: 0.5 }}>
          <LocationOnIcon sx={{ fontSize: 18, color: "blue" }} />
          {tool.jobSite}
        </Typography>

        {/* Quantity */}
        <Typography variant="body2" color="text.secondary">
          Quantity: {tool.quantity}
        </Typography>

        {/* Availability Status */}
        <Box mt={1}>
          <Chip
            label={tool.availability ? "Available" : "Checked Out"}
            icon={
              tool.availability ? <CheckCircleIcon /> : <HighlightOffIcon />
            }
            color={tool.availability ? "success" : "warning"}
            size="small"
          />
        </Box>
      </CardContent>

      {/* Check-In / Check-Out Actions */}
      <CardActions sx={{ justifyContent: "center" }}>
        {tool.availability ? (
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() => setSelectedToolForCheckout(tool)}
          >
            Check Out
          </Button>
        ) : (
          <Button
            variant="contained"
            color="secondary"
            size="small"
            onClick={() => setSelectedToolForCheckin(tool)}
          >
            Check In
          </Button>
        )}
      </CardActions>

      {/* Modals for Checkout/Checkin if selected */}
      {selectedToolForCheckout?.id === tool.id && (
        <CheckOutTool
          toolId={tool.id}
          toolName={tool.name}
          onSuccess={handleCheckOutSuccess}
        />
      )}
      {selectedToolForCheckin?.id === tool.id && (
        <CheckInTool
          toolId={tool.id}
          toolName={tool.name}
          onSuccess={handleCheckInSuccess}
        />
      )}
    </Card>
  );

  // -------------------------------
  // Display Loading Spinner
  // -------------------------------
  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: darkMode ? "#121212" : "#fff",
          color: darkMode ? "#e0e0e0" : "inherit",
        }}
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  // -------------------------------
  // If No Tools Found
  // -------------------------------
  if (!tools.length) {
    return (
      <Typography
        variant="h6"
        align="center"
        color="textSecondary"
        sx={{ mt: 4 }}
      >
        No tools available. Please add tools to the inventory.
      </Typography>
    );
  }

  // -------------------------------
  // Main Return (No Local AppBar)
  // -------------------------------
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: darkMode ? "#121212" : "#fff", // Full-page dark mode
        color: darkMode ? "#e0e0e0" : "inherit",
        transition: "background-color 0.3s ease",
      }}
    >
      {/* Top Controls (Search/Filters/Buttons) */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Search */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            bgcolor: darkMode ? "#333" : "#fff",
            borderRadius: 1,
            px: 1,
          }}
        >
          <SearchIcon sx={{ color: darkMode ? "#aaa" : "gray", mr: 1 }} />
          <TextField
            placeholder="Search tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            variant="standard"
            sx={{ minWidth: 150, color: darkMode ? "#e0e0e0" : "#000" }}
            InputProps={{ disableUnderline: true }}
          />
        </Box>

        {/* Job Site Filter */}
        <Select
          value={jobSiteFilter}
          onChange={(e) => setJobSiteFilter(e.target.value)}
          displayEmpty
          size="small"
          sx={{
            minWidth: 120,
            bgcolor: darkMode ? "#333" : "#fff",
            color: darkMode ? "#e0e0e0" : "#000",
            borderRadius: 1,
          }}
        >
          <MenuItem value="">
            <em>All Job Sites</em>
          </MenuItem>
          {jobSites.map((site) => (
            <MenuItem key={site.id} value={site.name}>
              {site.name}
            </MenuItem>
          ))}
        </Select>

        {/* Availability Filter */}
        <Select
          value={availabilityFilter}
          onChange={(e) => setAvailabilityFilter(e.target.value)}
          displayEmpty
          size="small"
          sx={{
            minWidth: 120,
            bgcolor: darkMode ? "#333" : "#fff",
            color: darkMode ? "#e0e0e0" : "#000",
            borderRadius: 1,
          }}
        >
          <MenuItem value="">
            <em>All Status</em>
          </MenuItem>
          <MenuItem value="Available">Available</MenuItem>
          <MenuItem value="Checked Out">Checked Out</MenuItem>
        </Select>

        {/* Dark Mode Toggle */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <DarkModeIcon />
          <Switch checked={darkMode} onChange={toggleDarkMode} />
        </Box>

        {/* Scan Tools Button */}
        <Button
          variant="contained"
          sx={{
            backgroundColor: darkMode ? "#d32f2f" : "#d32f2f", // consistent red
            color: "#fff",
            textTransform: "none",
          }}
          onClick={() => setShowScanner(true)}
        >
          Scan Tools
        </Button>

        {/* Admin Panel Button (Optional) */}
        <Button
          variant="outlined"
          sx={{
            color: darkMode ? "#e0e0e0" : "#1976d2",
            borderColor: darkMode ? "#e0e0e0" : "#1976d2",
            textTransform: "none",
          }}
          component={Link}
          to="/admin"
        >
          Admin Panel
        </Button>
      </Box>

      {/* Scanner Dialog */}
      <CheckInOut open={showScanner} onClose={() => setShowScanner(false)} />

      {/* Tools Grid */}
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {filteredTools.map((tool) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={tool.id}>
              {renderToolCard(tool)}
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default ToolList;
