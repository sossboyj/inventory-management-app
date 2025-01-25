import React, { useState } from "react";
import BarcodeScannerComponent from "react-qr-barcode-scanner"; 
import { db } from "../firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import {
  Typography,
  Box,
  Button,
  TextField,
  Alert,
  Paper,
} from "@mui/material";

const BarcodeScanner = () => {
  // Scanned code data
  const [scannedCode, setScannedCode] = useState(null);

  // Firestore result (tool) after scanning
  const [tool, setTool] = useState(null);

  // Error handling
  const [error, setError] = useState(null);

  // Success message
  const [success, setSuccess] = useState("");

  // Return date for check-out
  const [returnDate, setReturnDate] = useState("");

  // For preventing multiple queries if the scanner picks up the same code repeatedly
  const [lastScanned, setLastScanned] = useState("");

  // This function queries Firestore based on the newly scanned code
  const handleFirestoreLookup = async (code) => {
    try {
      // Clear old messages
      setError(null);
      setSuccess("");

      // Query the tools collection for a matching barcode
      const toolsRef = collection(db, "tools");
      const q = query(toolsRef, where("barcode", "==", code));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setTool(null);
        setError("Tool not found. Make sure the barcode is correct.");
      } else {
        // Assume only one matching doc
        const docSnap = querySnapshot.docs[0];
        setTool({ id: docSnap.id, ...docSnap.data() });
      }
    } catch (err) {
      console.error("Error querying Firestore:", err);
      setError("An error occurred while searching for the tool.");
    }
  };

  // This runs every time the camera detects or fails to detect a barcode
  // 'result' is null if nothing is detected, or an object with `text` if recognized
  const handleUpdate = (err, result) => {
    if (err) {
      console.error("Scanner Error:", err);
      // Many times this might just be a 'not found' during scanning
      // We'll only set a user-facing error if there's a real camera issue
    }

    if (result?.text) {
      // Only handle if it's a new code (avoid repeat queries)
      if (result.text !== lastScanned) {
        setScannedCode(result.text);
        setLastScanned(result.text);
        handleFirestoreLookup(result.text);
      }
    }
  };

  // Check out the tool
  const handleCheckOut = async () => {
    if (!tool) return;
    try {
      await updateDoc(doc(db, "tools", tool.id), {
        status: "Checked Out",
        expectedReturnDate: returnDate || null,
      });
      setSuccess(`Successfully checked out: ${tool.name}`);
      setError(null);
    } catch (err) {
      console.error("Error checking out the tool:", err);
      setError("Failed to check out tool. Please try again.");
    }
  };

  // Check in the tool
  const handleCheckIn = async () => {
    if (!tool) return;
    try {
      await updateDoc(doc(db, "tools", tool.id), {
        status: "Available",
        expectedReturnDate: null,
      });
      setSuccess(`Successfully checked in: ${tool.name}`);
      setError(null);
    } catch (err) {
      console.error("Error checking in the tool:", err);
      setError("Failed to check in tool. Please try again.");
    }
  };

  return (
    <Box sx={{ textAlign: "center", marginTop: 2 }}>
      <Typography variant="h5" gutterBottom>
        Barcode Scanner
      </Typography>

      {/* Display error or success messages */}
      {error && (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ my: 2 }}>
          {success}
        </Alert>
      )}

      {/* Camera Preview using react-qr-barcode-scanner */}
      <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
        <BarcodeScannerComponent
          width={320}
          height={240}
          onUpdate={handleUpdate}
        />
      </Box>

      {/* Show scanned code */}
      {scannedCode && (
        <Typography variant="body1" sx={{ mt: 2 }}>
          Scanned Code: <strong>{scannedCode}</strong>
        </Typography>
      )}

      {/* If a tool is found, show its info */}
      {tool && (
        <Paper
          elevation={3}
          sx={{ p: 2, mt: 2, width: "80%", maxWidth: 400, mx: "auto" }}
        >
          <Typography variant="h6" gutterBottom>
            Tool Details
          </Typography>
          <Typography>Name: {tool.name}</Typography>
          <Typography>Model: {tool.model}</Typography>
          <Typography>Status: {tool.status}</Typography>
          <Typography>
            Expected Return:{" "}
            {tool.expectedReturnDate ? tool.expectedReturnDate : "None"}
          </Typography>

          {/* Check Out / Check In Actions */}
          <Box sx={{ display: "flex", flexDirection: "column", mt: 2 }}>
            {/* Return date field for check out */}
            <TextField
              type="date"
              label="Return Date"
              variant="outlined"
              size="small"
              InputLabelProps={{ shrink: true }}
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              sx={{ mb: 2 }}
            />

            <Button
              variant="contained"
              color="primary"
              sx={{ mb: 1 }}
              onClick={handleCheckOut}
            >
              Check Out
            </Button>
            <Button variant="contained" color="secondary" onClick={handleCheckIn}>
              Check In
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default BarcodeScanner;
