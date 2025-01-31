// CheckInOut.js
import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import { db } from "../firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  addDoc,
} from "firebase/firestore";
import BarcodeScannerComponent from "react-qr-barcode-scanner";
import { useAuth } from "../AuthProvider";

const CheckInOut = ({ open, onClose }) => {
  const { user } = useAuth() || {}; // Get logged-in user info
  const [scannedCode, setScannedCode] = useState("");
  const [tool, setTool] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [scannerEnabled, setScannerEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // Handle errors

  // Handle successful barcode scan
  const handleScanSuccess = async (code) => {
    if (!code || !scannerEnabled) return;

    setScannerEnabled(false); // Stop scanner after a successful scan
    setScannedCode(code);
    setStatusMessage("Searching for tool...");
    setLoading(true);
    setError(""); // Reset previous errors

    try {
      const q = query(collection(db, "tools"), where("barcode", "==", code));
      const querySnap = await getDocs(q);

      if (!querySnap.empty) {
        const docSnap = querySnap.docs[0];
        setTool({ id: docSnap.id, ...docSnap.data() });
        setStatusMessage("Tool data loaded. Proceed with Check-In/Check-Out.");
      } else {
        setTool(null);
        setError("No tool found with this barcode. Please try again.");
      }
    } catch (err) {
      console.error("Error fetching tool data:", err);
      setError("Error fetching tool data. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Check-In or Check-Out action
  const handleAction = async (action) => {
    if (!tool || !user) {
      setError("Invalid tool or user data.");
      return;
    }

    const isCheckIn = action === "checkin";
    const userEmail = user?.email || "Unknown User"; // Capture logged-in user
    const timestamp = new Date(); // Capture current timestamp

    // Prepare tool updates
    const updatedAvailability = isCheckIn;
    const updatedCheckedOutBy = isCheckIn ? null : userEmail; // Store checkout user
    const updatedCheckedInBy = isCheckIn ? userEmail : null; // Store check-in user

    try {
      setLoading(true);
      setError(""); // Clear previous errors

      // Update Firestore: Update the tool status in the `tools` collection
      await updateDoc(doc(db, "tools", tool.id), {
        availability: updatedAvailability,
        checkedOutBy: updatedCheckedOutBy,
        checkedInBy: updatedCheckedInBy,
      });

      // Log action in the appropriate history collection
      const historyEntry = {
        toolId: tool.id,
        toolName: tool.name,
        user: userEmail, // Store who performed the action
        timestamp: timestamp.toISOString(), // Store timestamp in ISO format
      };

      if (isCheckIn) {
        await addDoc(collection(db, "checkInHistory"), {
          ...historyEntry,
          checkedInBy: userEmail,
          action: "Check-In",
        });
      } else {
        await addDoc(collection(db, "checkOutHistory"), {
          ...historyEntry,
          checkedOutBy: userEmail,
          action: "Check-Out",
        });
      }

      // Add notification to Firestore
      await addDoc(collection(db, "notifications"), {
        toolName: tool.name,
        type: isCheckIn ? "Check-In" : "Check-Out",
        status: "Unread",
        timestamp: timestamp.toISOString(),
      });

      setStatusMessage(
        `Successfully ${isCheckIn ? "checked in" : "checked out"}: ${tool.name}`
      );

      // Automatically close the dialog after success
      setTimeout(() => {
        resetState();
        onClose(); // Close the modal
      }, 1000); // Delay to allow UI update
    } catch (err) {
      console.error(`Error during ${action} action:`, err);
      setError(`Failed to ${isCheckIn ? "check in" : "check out"} the tool. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  // Reset state after closing
  const resetState = () => {
    setTool(null);
    setScannedCode("");
    setStatusMessage("");
    setScannerEnabled(true); // Reactivate scanner for new scans
    setError(""); // Reset errors
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Tool Check-In/Check-Out</DialogTitle>
      <DialogContent>

        {/* Barcode Scanner */}
        {scannerEnabled && (
          <BarcodeScannerComponent
            width={500}
            height={500}
            onUpdate={(err, result) => {
              if (result) handleScanSuccess(result.text);
            }}
          />
        )}

        {/* Status Message */}
        {statusMessage && (
          <Typography color="primary" sx={{ mt: 2 }}>
            {statusMessage}
          </Typography>
        )}

        {/* Tool Details */}
        {tool && (
          <div style={{ marginTop: 16 }}>
            <Typography variant="h6">{tool.name}</Typography>
            <Typography>Model: {tool.model}</Typography>
            <Typography>Status: {tool.availability ? "Available" : "Checked Out"}</Typography>
            {tool.checkedOutBy && <Typography>Checked Out By: {tool.checkedOutBy}</Typography>}
            {tool.checkedInBy && <Typography>Checked In By: {tool.checkedInBy}</Typography>}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div style={{ display: "flex", justifyContent: "center", marginTop: 10 }}>
            <CircularProgress />
          </div>
        )}

        {/* Error Messages */}
        {error && (
          <Snackbar open={Boolean(error)} autoHideDuration={4000} onClose={() => setError("")}>
            <Alert severity="error" onClose={() => setError("")}>
              {error}
            </Alert>
          </Snackbar>
        )}

      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        {tool && tool.availability && (
          <Button variant="contained" onClick={() => handleAction("checkout")}>
            Confirm Check Out
          </Button>
        )}
        {tool && !tool.availability && (
          <Button variant="contained" color="primary" onClick={() => handleAction("checkin")}>
            Confirm Check In
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CheckInOut;
