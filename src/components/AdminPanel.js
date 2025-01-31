import React, { useState, useEffect, useMemo } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
  addDoc,
  getDocs,
} from "firebase/firestore";
import { useAuth } from "../AuthProvider";
import { Navigate } from "react-router-dom";

// Components
import AddTools from "./AddTools";
import CheckInOut from "./checkInOut";

// Material UI Imports
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Chip,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  Card,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch,
} from "@mui/material";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

// Icons
import { ListItemButton } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import DashboardIcon from "@mui/icons-material/Dashboard";
import BuildIcon from "@mui/icons-material/Build";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import HistoryIcon from "@mui/icons-material/History";
import SettingsIcon from "@mui/icons-material/Settings";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LogoutIcon from "@mui/icons-material/Logout"; // NEW: for logout

// Timeline (for History)
import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";

const drawerWidth = 240;

const AdminPanel = () => {
  // -----------------------------
  // 0) Auth & Role Check
  // -----------------------------
  const { user, role, signOutUser } = useAuth(); 
  // ^ If your AuthProvider uses a different name, update accordingly (e.g. signOut, logout, etc.)
  const isAdmin = user && role === "admin";

  // -----------------------------
  // 1) State Management
  // -----------------------------
  // Tools
  const [tools, setTools] = useState([]);
  const [editTool, setEditTool] = useState(null);
  const [toolToDelete, setToolToDelete] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  // Histories & Notifications
  const [checkOutHistory, setCheckOutHistory] = useState([]);
  const [checkInHistory, setCheckInHistory] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Sorting
  const [sortOrder, setSortOrder] = useState("desc"); // for Check-Out
  const [checkInSortOrder, setCheckInSortOrder] = useState("desc"); // for Check-In

  // Job Sites
  const [jobSites, setJobSites] = useState([]);
  const [newJobSite, setNewJobSite] = useState("");
  const [location, setLocation] = useState("");
  const [supervisor, setSupervisor] = useState("");
  const [editJobSite, setEditJobSite] = useState(null);

  // Search & Scanner
  const [searchQuery, setSearchQuery] = useState("");
  const [showScanner, setShowScanner] = useState(false);

  // Errors & Success
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Active Section (for sidebar navigation)
  const [activeSection, setActiveSection] = useState("dashboard");

  // Dark Mode
  const [darkMode, setDarkMode] = useState(false);
  const toggleDarkMode = () => setDarkMode(!darkMode);

  // MUI Theme
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? "dark" : "light",
        },
      }),
    [darkMode]
  );

  // -----------------------------
  // 2) Fetch Data from Firestore
  // -----------------------------
  useEffect(() => {
    if (!isAdmin) return;

    // Tools
    const unsubscribeTools = onSnapshot(
      collection(db, "tools"),
      (snapshot) => {
        setTools(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      },
      (err) => {
        console.error("Firestore Error (tools):", err);
        setError("Failed to fetch tools.");
      }
    );

    // Check-Out History
    const unsubscribeCheckOut = onSnapshot(
      collection(db, "checkOutHistory"),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        // Sort by timestamp
        data.sort((a, b) =>
          sortOrder === "desc"
            ? new Date(b.timestamp) - new Date(a.timestamp)
            : new Date(a.timestamp) - new Date(b.timestamp)
        );
        setCheckOutHistory(data);
      },
      (err) => {
        console.error("Firestore Error (checkOutHistory):", err);
        setError("Failed to fetch checkout history.");
      }
    );

    // Check-In History
    const unsubscribeCheckIn = onSnapshot(
      collection(db, "checkInHistory"),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        // Sort by timestamp
        data.sort((a, b) =>
          checkInSortOrder === "desc"
            ? new Date(b.timestamp) - new Date(a.timestamp)
            : new Date(a.timestamp) - new Date(b.timestamp)
        );
        setCheckInHistory(data);
      },
      (err) => {
        console.error("Firestore Error (checkInHistory):", err);
        setError("Failed to fetch check-in history.");
      }
    );

    // Notifications
    const unsubscribeNotif = onSnapshot(
      collection(db, "notifications"),
      (snapshot) => {
        setNotifications(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      },
      (err) => {
        console.error("Firestore Error (notifications):", err);
        setError("Failed to fetch notifications.");
      }
    );

    // Job Sites
    const unsubscribeJobSites = onSnapshot(
      collection(db, "jobSites"),
      (snapshot) => {
        setJobSites(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      },
      (err) => {
        console.error("Firestore Error (jobSites):", err);
        setError("Failed to fetch job sites.");
      }
    );

    return () => {
      unsubscribeTools();
      unsubscribeCheckOut();
      unsubscribeCheckIn();
      unsubscribeNotif();
      unsubscribeJobSites();
    };
  }, [isAdmin, sortOrder, checkInSortOrder]);

  // -----------------------------
  // 3) Tools
  // -----------------------------
  // Filtered list for search
  const filteredTools = tools.filter((tool) =>
    tool.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Tool Deletion
  const handleDeleteTool = async () => {
    try {
      await deleteDoc(doc(db, "tools", toolToDelete.id));
      setSuccess("Tool removed successfully!");
    } catch (error) {
      console.error("Error deleting tool:", error);
      setError("Failed to delete tool.");
    } finally {
      setConfirmDialogOpen(false);
    }
  };

  // Tool Update
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editTool) return;
    try {
      await updateDoc(doc(db, "tools", editTool.id), {
        name: editTool.name,
        model: editTool.model,
        quantity: editTool.quantity,
        price: editTool.price,
        status: editTool.status,
      });
      setSuccess("Tool updated successfully!");
      setEditTool(null);
    } catch (error) {
      console.error("Error updating tool:", error);
      setError("Failed to update tool.");
    }
  };

  // -----------------------------
  // 4) Job Sites
  // -----------------------------
  const addJobSite = async () => {
    if (!newJobSite.trim() || !location.trim() || !supervisor.trim()) {
      setError("All fields are required.");
      return;
    }
    try {
      await addDoc(collection(db, "jobSites"), {
        name: newJobSite,
        location,
        supervisor,
        createdAt: new Date().toISOString(),
      });
      setNewJobSite("");
      setLocation("");
      setSupervisor("");
      setSuccess("Job site added successfully!");
    } catch (error) {
      console.error("Error adding job site:", error);
      setError("Failed to add job site.");
    }
  };

  const updateJobSite = async (jobSiteId) => {
    if (!editJobSite || !editJobSite.name || !editJobSite.location || !editJobSite.supervisor) {
      setError("All fields are required.");
      return;
    }
  
    try {
      await updateDoc(doc(db, "jobSites", jobSiteId), {
        name: editJobSite.name.trim(),
        location: editJobSite.location.trim(),
        supervisor: editJobSite.supervisor.trim(),
      });
  
      setEditJobSite(null);
      setSuccess("Job site updated successfully!");
    } catch (error) {
      console.error("Error updating job site:", error);
      setError("Failed to update job site.");
    }
  };
  

  const deleteJobSite = async (id) => {
    try {
      await deleteDoc(doc(db, "jobSites", id));
      setSuccess("Job site deleted successfully.");
    } catch (error) {
      console.error("Error deleting job site:", error);
      setError("Failed to delete job site.");
    }
  };

  // -----------------------------
  // 5) Check-In/Check-Out History (Timeline)
  // -----------------------------
  // Combine both histories into one array for the timeline
  const combinedHistory = [
    ...checkOutHistory.map((item) => ({
      ...item,
      action: "Check-Out",
      user: item.checkedOutBy,
    })),
    ...checkInHistory.map((item) => ({
      ...item,
      action: "Check-In",
      user: item.checkedInBy,
    })),
  ];

  // Sort combined by timestamp (descending by default)
  const timelineHistory = combinedHistory.sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleString();
  };

  // -----------------------------
  // 6) Notifications
  // -----------------------------
  const markAsRead = async (notificationId) => {
    try {
      await updateDoc(doc(db, "notifications", notificationId), {
        status: "Read",
      });
      setSuccess("Notification marked as read.");
    } catch (err) {
      console.error("Error marking notification as read:", err);
      setError("Failed to mark notification as read.");
    }
  };

  const markAllAsRead = async () => {
    try {
      const unread = notifications.filter((n) => n.status === "Unread");
      const updates = unread.map((n) =>
        updateDoc(doc(db, "notifications", n.id), { status: "Read" })
      );
      await Promise.all(updates);
      setSuccess("All unread notifications marked as read.");
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
      setError("Failed to mark notifications as read.");
    }
  };

  // -----------------------------
  // 7) Reset Histories & Notifications
  // -----------------------------
  const resetAdminPanel = async () => {
    const confirmClear = window.confirm(
      "Are you sure you want to clear all history and notifications? This action cannot be undone."
    );
    if (!confirmClear) return;

    try {
      // Delete all check-out history
      const checkOutSnap = await getDocs(collection(db, "checkOutHistory"));
      const checkOutDeletes = checkOutSnap.docs.map((d) => deleteDoc(d.ref));

      // Delete all check-in history
      const checkInSnap = await getDocs(collection(db, "checkInHistory"));
      const checkInDeletes = checkInSnap.docs.map((d) => deleteDoc(d.ref));

      // Delete all notifications
      const notifSnap = await getDocs(collection(db, "notifications"));
      const notifDeletes = notifSnap.docs.map((d) => deleteDoc(d.ref));

      await Promise.all([...checkOutDeletes, ...checkInDeletes, ...notifDeletes]);
      setSuccess("All histories and notifications have been cleared!");
    } catch (err) {
      console.error("Error clearing admin panel:", err);
      setError("Failed to clear data.");
    }
  };

  // -----------------------------
  // 8) Rendering Sections (Sidebar)
  // -----------------------------
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // -- Dashboard: Summary Cards
  const DashboardSection = () => {
    // Derive stats
    const totalTools = tools.length;
    const availableTools = tools.filter((t) => t.status === "Available").length;
    const checkedOutTools = tools.filter((t) => t.status === "Checked Out").length;
    const totalJobSites = jobSites.length;

    return (
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Dashboard
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: "primary.main", color: "white", p: 2 }}>
              <Typography variant="h6">Total Tools</Typography>
              <Typography variant="h4">{totalTools}</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: "success.main", color: "white", p: 2 }}>
              <Typography variant="h6">Available</Typography>
              <Typography variant="h4">{availableTools}</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: "error.main", color: "white", p: 2 }}>
              <Typography variant="h6">Checked Out</Typography>
              <Typography variant="h4">{checkedOutTools}</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: "info.main", color: "white", p: 2 }}>
              <Typography variant="h6">Job Sites</Typography>
              <Typography variant="h4">{totalJobSites}</Typography>
            </Card>
          </Grid>
        </Grid>

        {/* Additional Quick Actions */}
        <Box sx={{ mt: 4, display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => setShowScanner(true)}
          >
            Scan Tools (Check In/Out)
          </Button>
          <Button variant="contained" color="warning" onClick={resetAdminPanel}>
            Clear All Histories & Notifications
          </Button>
        </Box>
      </Box>
    );
  };

  // -- Tools Section
  const ToolsSection = () => {
    return (
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Manage Tools
        </Typography>
        {/* Add New Tools */}
        <AddTools />

        <Divider sx={{ my: 3 }} />
        {/* Search */}
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search tools by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 3 }}
        />

        {/* Tools Table */}
        <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Tool Name</TableCell>
                <TableCell>Model</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTools.map((tool) => {
                const isEditing = editTool?.id === tool.id;
                return (
                  <TableRow key={tool.id}>
                    {isEditing ? (
                      <>
                        <TableCell>
                          <TextField
                            fullWidth
                            size="small"
                            value={editTool.name}
                            onChange={(e) =>
                              setEditTool({ ...editTool, name: e.target.value })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            fullWidth
                            size="small"
                            value={editTool.model}
                            onChange={(e) =>
                              setEditTool({ ...editTool, model: e.target.value })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            fullWidth
                            size="small"
                            type="number"
                            value={editTool.quantity}
                            onChange={(e) =>
                              setEditTool({
                                ...editTool,
                                quantity: parseInt(e.target.value, 10),
                              })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            fullWidth
                            size="small"
                            type="number"
                            value={editTool.price}
                            onChange={(e) =>
                              setEditTool({
                                ...editTool,
                                price: parseFloat(e.target.value),
                              })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            fullWidth
                            size="small"
                            value={editTool.status}
                            onChange={(e) =>
                              setEditTool({
                                ...editTool,
                                status: e.target.value,
                              })
                            }
                          >
                            <MenuItem value="Available">Available</MenuItem>
                            <MenuItem value="Checked Out">Checked Out</MenuItem>
                            <MenuItem value="Under Maintenance">
                              Under Maintenance
                            </MenuItem>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={handleEditSubmit}
                            sx={{ mr: 1 }}
                          >
                            Save
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => setEditTool(null)}
                          >
                            Cancel
                          </Button>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell>{tool.name}</TableCell>
                        <TableCell>{tool.model}</TableCell>
                        <TableCell>{tool.quantity}</TableCell>
                        <TableCell>
                          ${tool.price ? tool.price.toFixed(2) : "0.00"}
                        </TableCell>
                        <TableCell>{tool.status}</TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            color="primary"
                            size="small"
                            sx={{ mr: 1 }}
                            onClick={() => setEditTool(tool)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => {
                              setToolToDelete(tool);
                              setConfirmDialogOpen(true);
                            }}
                          >
                            Remove
                          </Button>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  // -- Job Sites Section
  const JobSitesSection = () => {
    return (
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Manage Job Sites
        </Typography>

        {/* Add New Job Site */}
        <Box sx={{ display: "flex", gap: 2, mt: 2, flexWrap: "wrap" }}>
          <TextField
            label="Job Site Name"
            fullWidth
            variant="outlined"
            value={newJobSite}
            onChange={(e) => setNewJobSite(e.target.value)}
            sx={{ flex: 1 }}
          />
          <TextField
            label="Location"
            fullWidth
            variant="outlined"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            sx={{ flex: 1 }}
          />
          <TextField
            label="Supervisor"
            fullWidth
            variant="outlined"
            value={supervisor}
            onChange={(e) => setSupervisor(e.target.value)}
            sx={{ flex: 1 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={addJobSite}
            disabled={!newJobSite || !location || !supervisor}
          >
            Add Job Site
          </Button>
        </Box>

        {/* Job Site Table */}
        <TableContainer component={Paper} sx={{ mt: 3, overflowX: "auto" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><b>Job Site Name</b></TableCell>
                <TableCell><b>Location</b></TableCell>
                <TableCell><b>Supervisor</b></TableCell>
                <TableCell><b>Actions</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {jobSites.map((site) => (
                <TableRow key={site.id}>
                  <TableCell>
                    {editJobSite?.id === site.id ? (
                      <TextField
                      fullWidth
                      value={editJobSite?.name || ""}
                      onChange={(e) =>
                        setEditJobSite((prev) => ({ ...prev, name: e.target.value }))
                      }
                    />
                    ) : (
                      site.name
                    )}
                    </TableCell>
                    <TableCell>
                    {editJobSite?.id === site.id ? (
                      <TextField
                        fullWidth
                        value={editJobSite?.location || ""}
                        onChange={(e) =>
                          setEditJobSite((prev) => ({ ...prev, location: e.target.value }))
                        }
                      />
                    ) : (
                      site.location
                    )}
                    
                  </TableCell>
                  <TableCell>
                    {editJobSite?.id === site.id ? (
                      <TextField
                        fullWidth
                        value={editJobSite.supervisor}
                        onChange={(e) =>
                          setEditJobSite({
                            ...editJobSite,
                            supervisor: e.target.value,
                          })
                        }
                      />
                    ) : (
                      site.supervisor
                    )}
                  </TableCell>
                  <TableCell>
                    {editJobSite?.id === site.id ? (
                      <>
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          sx={{ mr: 1 }}
                          onClick={() => updateJobSite(site.id)}
                        >
                          Save
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => setEditJobSite(null)}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                              variant="outlined"
                              color="primary"
                              size="small"
                              sx={{ mr: 1 }}
                              onClick={() => setEditJobSite({ ...site })} // Ensure editJobSite is set properly
                            >
                              Edit
                            </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => deleteJobSite(site.id)}
                        >
                          Delete
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  // -- History Section (Timeline)
  const HistorySection = () => {
    return (
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          History (Check-In / Check-Out)
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Timeline position="alternate">
          {timelineHistory.map((item) => (
            <TimelineItem key={item.id}>
              <TimelineSeparator>
                <TimelineDot
                  color={item.action === "Check-In" ? "success" : "error"}
                />
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent>
                <Typography variant="h6" component="span">
                  {item.toolName}
                </Typography>
                <Typography variant="body2">
                  {item.action} by {item.user || "Unknown"} <br />
                  {formatTimestamp(item.timestamp)}
                </Typography>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </Box>
    );
  };

  // -- Settings Section (Notifications, etc.)
  const SettingsSection = () => {
    return (
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Settings & Notifications
        </Typography>
        <Divider sx={{ mb: 3 }} />

        {/* Notifications */}
        <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6">Notifications</Typography>
          <Button variant="contained" onClick={markAllAsRead}>
            Mark All as Read
          </Button>
        </Box>
        <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Message</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Timestamp</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {notifications.map((notification) => (
                <TableRow key={notification.id}>
                  <TableCell>
                    <Chip
                      icon={
                        notification.type === "Check-In" ? (
                          <CheckCircleIcon />
                        ) : notification.type === "Check-Out" ? (
                          <ExitToAppIcon />
                        ) : null
                      }
                      label={notification.type}
                      color={
                        notification.type === "Check-In"
                          ? "success"
                          : notification.type === "Check-Out"
                          ? "primary"
                          : "default"
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {`Tool "${notification.toolName}" was ${notification.type}`}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={notification.status}
                      color={
                        notification.status === "Unread" ? "warning" : "default"
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {formatTimestamp(notification.timestamp)}
                  </TableCell>
                  <TableCell>
                    {notification.status === "Unread" && (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => markAsRead(notification.id)}
                      >
                        Mark as Read
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  // Decide which section to render in the main area
  const renderMainSection = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardSection />;
      case "tools":
        return <ToolsSection />;
      case "jobSites":
        return <JobSitesSection />;
      case "history":
        return <HistorySection />;
      case "settings":
        return <SettingsSection />;
      default:
        return <DashboardSection />;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex" }}>
        {/* Sidebar Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: "border-box",
            },
          }}
        >
          <List>
            <ListItem>
              <ListItemText
                primary="Admin Panel"
                sx={{ fontWeight: "bold", fontSize: "1.2rem" }}
              />
            </ListItem>
            <Divider />

            <ListItem button onClick={() => setActiveSection("dashboard")}>
              <ListItemIcon>
                <DashboardIcon />
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItem>

            <ListItem button onClick={() => setActiveSection("tools")}>
              <ListItemIcon>
                <BuildIcon />
              </ListItemIcon>
              <ListItemText primary="Manage Tools" />
            </ListItem>

            <ListItem button onClick={() => setActiveSection("jobSites")}>
              <ListItemIcon>
                <LocationOnIcon />
              </ListItemIcon>
              <ListItemText primary="Job Sites" />
            </ListItem>

            <ListItem button onClick={() => setActiveSection("history")}>
              <ListItemIcon>
                <HistoryIcon />
              </ListItemIcon>
              <ListItemText primary="History" />
            </ListItem>

            <ListItem button onClick={() => setActiveSection("settings")}>
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary="Settings" />
            </ListItem>

            <Divider />
            {/* Toggle Dark Mode */}
            <ListItem>
              <ListItemIcon>
                <DarkModeIcon />
              </ListItemIcon>
              <Switch checked={darkMode} onChange={toggleDarkMode} />
            </ListItem>

            <Divider />
            {/* Logout */}
            <ListItem button onClick={signOutUser}>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </List>
        </Drawer>

        {/* Main Content */}
        <Box component="main" sx={{ flexGrow: 1, p: 2 }}>
          {renderMainSection()}
        </Box>
      </Box>

      {/* Barcode Scanner Dialog */}
      <CheckInOut open={showScanner} onClose={() => setShowScanner(false)} />

      {/* Confirmation Dialog (Tool Deletion) */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this tool? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteTool} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for Errors */}
      <Snackbar
        open={Boolean(error)}
        autoHideDuration={4000}
        onClose={() => setError("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="error" onClose={() => setError("")}>
          {error}
        </Alert>
      </Snackbar>

      {/* Snackbar for Success */}
      <Snackbar
        open={Boolean(success)}
        autoHideDuration={4000}
        onClose={() => setSuccess("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" onClose={() => setSuccess("")}>
          {success}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
};

export default AdminPanel;
