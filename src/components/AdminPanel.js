import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import AddTools from "./AddTools";
import { useAuth } from "../AuthProvider"; // For role-based access
import { Navigate } from "react-router-dom";

// Material UI Imports
import {
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
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
  Box,
  Grid,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";

const AdminPanel = () => {
  // -----------------------------
  // 0) Auth & Role Check
  // -----------------------------
  const { user, role } = useAuth();
  const isAdmin = user && role === "admin";

  // -----------------------------
  // State Management
  // -----------------------------
  const [tools, setTools] = useState([]);
  const [editTool, setEditTool] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [toolToDelete, setToolToDelete] = useState(null);

  const [checkoutHistory, setCheckoutHistory] = useState([]);
  const [checkInHistory, setCheckInHistory] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // -----------------------------
  // 1) Fetch Firestore Data
  // -----------------------------
  useEffect(() => {
    if (!isAdmin) return; // Early return if not admin

    // Tools
    const unsubscribeTools = onSnapshot(
      collection(db, "tools"),
      (snapshot) => {
        const toolsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTools(toolsData);
      },
      (err) => {
        setError("Failed to fetch tools. Please try again.");
        console.error("Firestore Error (tools):", err);
      }
    );

    // Checkout History
    const unsubscribeCheckoutHistory = onSnapshot(
      collection(db, "checkoutHistory"),
      (snapshot) => {
        const historyData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCheckoutHistory(historyData);
      },
      (err) => {
        setError("Failed to fetch checkout history. Please try again.");
        console.error("Firestore Error (checkoutHistory):", err);
      }
    );

    // Check-In History
    const unsubscribeCheckInHistory = onSnapshot(
      collection(db, "checkInHistory"),
      (snapshot) => {
        const historyData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCheckInHistory(historyData);
      },
      (err) => {
        setError("Failed to fetch check-in history. Please try again.");
        console.error("Firestore Error (checkInHistory):", err);
      }
    );

    // Notifications
    const unsubscribeNotifications = onSnapshot(
      collection(db, "notifications"),
      (snapshot) => {
        const notificationsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setNotifications(notificationsData);
      },
      (err) => {
        setError("Failed to fetch notifications. Please try again.");
        console.error("Firestore Error (notifications):", err);
      }
    );

    // Cleanup on unmount
    return () => {
      unsubscribeTools();
      unsubscribeCheckoutHistory();
      unsubscribeCheckInHistory();
      unsubscribeNotifications();
    };
  }, [isAdmin]);

  // Redirect if not admin
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // -----------------------------
  // 2) Tool Deletion
  // -----------------------------
  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, "tools", toolToDelete.id));
      setSuccess("Tool removed successfully!");
    } catch (error) {
      setError("Failed to delete tool. Please try again.");
      console.error("Error deleting tool:", error);
    } finally {
      setConfirmDialogOpen(false);
    }
  };

  // -----------------------------
  // 3) Tool Update
  // -----------------------------
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
      setError("Failed to update tool. Please try again.");
      console.error("Error updating tool:", error);
    }
  };

  // -----------------------------
  // 4) Notifications Mark as Read
  // -----------------------------
  const markAsRead = async (notificationId) => {
    try {
      const notificationRef = doc(db, "notifications", notificationId);
      await updateDoc(notificationRef, { status: "Read" });
      setSuccess("Notification marked as read.");
    } catch (err) {
      console.error("Error marking notification as read:", err);
      setError("Failed to mark notification as read.");
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(
        (notification) => notification.status === "Unread"
      );
      const updatePromises = unreadNotifications.map((notification) =>
        updateDoc(doc(db, "notifications", notification.id), {
          status: "Read",
        })
      );
      await Promise.all(updatePromises);
      setSuccess("All unread notifications marked as read.");
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
      setError("Failed to mark notifications as read.");
    }
  };

  // -----------------------------
  // 5) Search Tools
  // -----------------------------
  const filteredTools = tools.filter((tool) =>
    tool.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // -----------------------------
  // 6) Render
  // -----------------------------
  return (
    <Container
      maxWidth="lg"
      sx={{
        mt: 4,
        mb: 6,
        // Add some responsive padding to help on mobile
        px: { xs: 2, md: 3 },
      }}
    >
      {/* Page Title */}
      <Typography
        variant="h4"
        align="center"
        fontWeight="bold"
        gutterBottom
        sx={{ fontSize: { xs: "1.8rem", sm: "2.5rem" } }}
      >
        Admin Panel
      </Typography>

      {/* Add Tools Section */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        Add a New Tool
      </Typography>
      <AddTools />

      <Divider sx={{ my: 4 }} />

      {/* Search Tools */}
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search tools by name..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 3 }}
      />

      {/* Tool Inventory Table */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        Tools Inventory
      </Typography>
      <TableContainer component={Paper} sx={{ mb: 4, overflowX: "auto" }}>
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
                    // Editing row
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
                            setEditTool({ ...editTool, status: e.target.value })
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
                    // Default row
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

      {/* Checkout History Table */}
      <Typography variant="h6" sx={{ mt: 4 }}>
        Checkout History
      </Typography>
      <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Tool Name</TableCell>
              <TableCell>Checked Out By</TableCell>
              <TableCell>Expected Return Date</TableCell>
              <TableCell>Checkout Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {checkoutHistory.length > 0 ? (
              checkoutHistory.map((history) => (
                <TableRow key={history.id}>
                  <TableCell>{history.toolName}</TableCell>
                  <TableCell>{history.checkedOutBy}</TableCell>
                  <TableCell>{history.returnDate || "N/A"}</TableCell>
                  <TableCell>
                    {new Date(history.checkoutDate).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No checkout history available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Divider sx={{ my: 4 }} />

      {/* Check-In History Table */}
      <Typography variant="h6" sx={{ mt: 4 }}>
        Check-In History
      </Typography>
      <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Tool Name</TableCell>
              <TableCell>Checked In By</TableCell>
              <TableCell>Check-In Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {checkInHistory.length > 0 ? (
              checkInHistory.map((history) => (
                <TableRow key={history.id}>
                  <TableCell>{history.toolName}</TableCell>
                  <TableCell>{history.checkedInBy}</TableCell>
                  <TableCell>
                    {new Date(history.checkInDate).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  No check-in history available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Divider sx={{ my: 4 }} />

      {/* Notifications Table */}
      <Typography variant="h6" sx={{ mt: 4 }}>
        Notifications
      </Typography>
      <Button
        variant="contained"
        color="primary"
        size="small"
        onClick={markAllAsRead}
        sx={{ mb: 2 }}
      >
        Mark All as Read
      </Button>
      <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Message</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Timestamp</TableCell>
              <TableCell>Actions</TableCell>
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
                  {new Date(notification.timestamp).toLocaleString()}
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

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this tool? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for Errors and Success */}
      <Snackbar
        open={Boolean(error)}
        autoHideDuration={4000}
        onClose={() => setError("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="error" onClose={() => setError("")}>{error}</Alert>
      </Snackbar>

      <Snackbar
        open={Boolean(success)}
        autoHideDuration={4000}
        onClose={() => setSuccess("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" onClose={() => setSuccess("")}>{success}</Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminPanel;
