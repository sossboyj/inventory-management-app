import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, onSnapshot, doc, deleteDoc, updateDoc } from "firebase/firestore";
import AddTools from "./AddTools";
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
} from "@mui/material";

const AdminPanel = () => {
  // State variables
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

  // Fetch data from Firestore
  useEffect(() => {
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
        console.error("Firestore Error:", err);
      }
    );

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
        console.error("Firestore Error:", err);
      }
    );

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
        console.error("Firestore Error:", err);
      }
    );

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
        console.error("Firestore Error:", err);
      }
    );

    return () => {
      unsubscribeTools();
      unsubscribeCheckoutHistory();
      unsubscribeCheckInHistory();
      unsubscribeNotifications();
    };
  }, []);

  // Delete a tool
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

  // Update a tool
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, "tools", editTool.id), {
        name: editTool.name,
        model: editTool.model,
        quantity: editTool.quantity,
        price: editTool.price,
        status: editTool.status,
      });
      setEditTool(null);
      setSuccess("Tool updated successfully!");
    } catch (error) {
      setError("Failed to update tool. Please try again.");
      console.error("Error updating tool:", error);
    }
  };

  // Mark notification as "Read"
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

  // Filter tools based on search query
  const filteredTools = tools.filter((tool) =>
    tool.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Container maxWidth="lg" sx={{ marginTop: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Admin Panel
      </Typography>

      {/* Add New Tool Section */}
      <Typography variant="h6" gutterBottom>
        Add a New Tool
      </Typography>
      <AddTools />

      {/* Search Tools */}
      <TextField
        fullWidth
        placeholder="Search tools by name..."
        variant="outlined"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mt: 4, mb: 2 }}
      />

      {/* Tools Table */}
      <TableContainer component={Paper}>
        <Table>
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
            {filteredTools.map((tool) => (
              <TableRow key={tool.id}>
                {editTool?.id === tool.id ? (
                  <>
                    <TableCell>
                      <TextField
                        value={editTool.name}
                        onChange={(e) => setEditTool({ ...editTool, name: e.target.value })}
                        size="small"
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        value={editTool.model}
                        onChange={(e) => setEditTool({ ...editTool, model: e.target.value })}
                        size="small"
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        value={editTool.quantity}
                        onChange={(e) =>
                          setEditTool({ ...editTool, quantity: parseInt(e.target.value) })
                        }
                        size="small"
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        value={editTool.price}
                        onChange={(e) =>
                          setEditTool({ ...editTool, price: parseFloat(e.target.value) })
                        }
                        size="small"
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={editTool.status}
                        onChange={(e) => setEditTool({ ...editTool, status: e.target.value })}
                        size="small"
                        fullWidth
                      >
                        <MenuItem value="Available">Available</MenuItem>
                        <MenuItem value="Checked Out">Checked Out</MenuItem>
                        <MenuItem value="Under Maintenance">Under Maintenance</MenuItem>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleEditSubmit}
                      >
                        Save
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
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
                    <TableCell>${tool.price ? tool.price.toFixed(2) : "0.00"}</TableCell>
                    <TableCell>{tool.status}</TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => setEditTool(tool)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
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
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Checkout History Table */}
      <Typography variant="h6" sx={{ mt: 4 }}>
        Checkout History
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tool Name</TableCell>
              <TableCell>Checked Out By</TableCell>
              <TableCell>Expected Return Date</TableCell>
              <TableCell>Checkout Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {checkoutHistory.map((history) => (
              <TableRow key={history.id}>
                <TableCell>{history.toolName}</TableCell>
                <TableCell>{history.checkedOutBy}</TableCell>
                <TableCell>{history.returnDate}</TableCell>
                <TableCell>{new Date(history.checkoutDate).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Check-In History Table */}
      <Typography variant="h6" sx={{ mt: 4 }}>
        Check-In History
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tool Name</TableCell>
              <TableCell>Checked In By</TableCell>
              <TableCell>Check-In Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {checkInHistory.map((history) => (
              <TableRow key={history.id}>
                <TableCell>{history.toolName}</TableCell>
                <TableCell>{history.checkedInBy}</TableCell>
                <TableCell>{new Date(history.checkInDate).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Notifications Table */}
      <Typography variant="h6" sx={{ mt: 4 }}>
        Notifications
      </Typography>
      <TableContainer component={Paper}>
        <Table>
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
                <TableCell>{`Tool "${notification.toolName}" was ${notification.type}`}</TableCell>
                <TableCell>
                  <Chip
                    label={notification.status}
                    color={notification.status === "Unread" ? "warning" : "default"}
                    size="small"
                  />
                </TableCell>
                <TableCell>{new Date(notification.timestamp).toLocaleString()}</TableCell>
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

      {/* Snackbar Notifications */}
      <Snackbar
        open={Boolean(error)}
        autoHideDuration={4000}
        onClose={() => setError("")}
      >
        <Alert severity="error" onClose={() => setError("")}>
          {error}
        </Alert>
      </Snackbar>
      <Snackbar
        open={Boolean(success)}
        autoHideDuration={4000}
        onClose={() => setSuccess("")}
      >
        <Alert severity="success" onClose={() => setSuccess("")}>
          {success}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminPanel;
