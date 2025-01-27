// CheckInOut.js
import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
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
import BarcodeScanner from "./BarcodeScanner";
import { useAuth } from "../AuthProvider";

const CheckInOut = ({ open, onClose }) => {
  const { user } = useAuth() || {}; // User info from AuthProvider
  const [mode, setMode] = useState(null); // Mode: "checkin" or "checkout"
  const [scannedCode, setScannedCode] = useState("");
  const [tool, setTool] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");

  const handleScanSuccess = async (code) => {
    if (!code) {
      console.error("Scanned code is empty.");
      setStatusMessage("Invalid barcode. Please try again.");
      return;
    }

    console.log("Scanned Code:", code);
    setScannedCode(code);
    setStatusMessage("Searching Firestore for matching barcode...");

    try {
      const q = query(collection(db, "tools"), where("barcode", "==", code));
      const querySnap = await getDocs(q);

      if (!querySnap.empty) {
        const docSnap = querySnap.docs[0];
        setTool({ id: docSnap.id, ...docSnap.data() });
        setStatusMessage("Tool found!");
        console.log("Tool Data:", docSnap.data());
      } else {
        setTool(null);
        setStatusMessage("No tool found. Ensure the barcode is valid.");
      }
    } catch (err) {
      console.error("Error searching for tool:", err);
      setStatusMessage("Error searching Firestore. Please try again.");
    }
  };

  const handleError = (err) => {
    console.error("Scanner Error:", err);
    setStatusMessage("Error with the scanner. Please try again.");
  };

  const handleCheckOut = async () => {
    if (!tool) return;
    try {
      console.log(`Checking out tool: ${tool.name}`);
      await updateDoc(doc(db, "tools", tool.id), {
        availability: false,
        checkedOutBy: user?.email || "Unknown User",
      });
      await addDoc(collection(db, "checkoutHistory"), {
        toolId: tool.id,
        toolName: tool.name,
        checkedOutBy: user?.email || "Unknown User",
        timestamp: new Date().toISOString(),
        action: "Checked Out",
      });
      setStatusMessage(`Successfully checked out: ${tool.name}`);
      resetState();
    } catch (err) {
      console.error("Error checking out tool:", err);
      setStatusMessage("Failed to check out the tool. Please try again.");
    }
  };

  const handleCheckIn = async () => {
    if (!tool) return;
    try {
      console.log(`Checking in tool: ${tool.name}`);
      await updateDoc(doc(db, "tools", tool.id), {
        availability: true,
        checkedOutBy: null,
      });
      await addDoc(collection(db, "checkInHistory"), {
        toolId: tool.id,
        toolName: tool.name,
        checkedInBy: user?.email || "Unknown User",
        timestamp: new Date().toISOString(),
        action: "Checked In",
      });
      setStatusMessage(`Successfully checked in: ${tool.name}`);
      resetState();
    } catch (err) {
      console.error("Error checking in tool:", err);
      setStatusMessage("Failed to check in the tool. Please try again.");
    }
  };

  const resetState = () => {
    setTool(null);
    setScannedCode("");
    setStatusMessage("");
    setMode(null);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Scan a Tool</DialogTitle>
      <DialogContent>
        {/* Buttons to select Check-In or Check-Out mode */}
        <Button
          variant="contained"
          sx={{ mr: 2 }}
          onClick={() => {
            setMode("checkout");
            resetState();
          }}
        >
          Check Out
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => {
            setMode("checkin");
            resetState();
          }}
        >
          Check In
        </Button>

        {mode && (
          <Typography sx={{ mt: 2 }}>
            Current Mode: <strong>{mode.toUpperCase()}</strong>
          </Typography>
        )}

        {/* Barcode Scanner */}
        <BarcodeScanner onScanSuccess={handleScanSuccess} onError={handleError} />

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
            <Typography>
              Status: {tool.availability ? "Available" : "Checked Out"}
            </Typography>
          </div>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        {tool && mode === "checkout" && (
          <Button variant="contained" onClick={handleCheckOut}>
            Confirm Check Out
          </Button>
        )}
        {tool && mode === "checkin" && (
          <Button variant="contained" color="primary" onClick={handleCheckIn}>
            Confirm Check In
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CheckInOut;
