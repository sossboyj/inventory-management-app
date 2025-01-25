import React, { useState } from "react";
// Rename the import to match the official docs usage:
import QrReader from "react-qr-scanner";
import { db } from "../firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc
} from "firebase/firestore";
import { Typography, Box } from "@mui/material";

const BarcodeScanner = () => {
  const [scannedData, setScannedData] = useState(null);
  const [error, setError] = useState(null);

  // This is called whenever the library detects a scan result
  const handleScan = async (data) => {
    // 'data' will be null or a string in react-qr-scanner
    if (!data) return;

    setScannedData(data);

    try {
      const toolsRef = collection(db, "tools");
      // Assuming your Firestore doc has a field named "barcode"
      // that matches the scanned string
      const q = query(toolsRef, where("barcode", "==", data));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;

        await updateDoc(docRef, {
          lastScannedLocation: "Current Location" // Replace with actual logic
        });

        alert("Tool location updated successfully!");
      } else {
        alert("Tool not found. Ensure the barcode is valid.");
      }
    } catch (err) {
      console.error("Error updating tool location:", err);
      alert("An error occurred while updating the tool location.");
    }
  };

  // Called if there's a camera access or scanning error
  const handleError = (err) => {
    console.error(err);
    setError("QR Scanner Error: Unable to process the scan.");
  };

  // Style for the camera preview window
  const previewStyle = {
    height: 240,
    width: 320
  };

  return (
    <Box sx={{ textAlign: "center", marginTop: 2 }}>
      <Typography variant="h6" gutterBottom>
        Scan Tool Barcode
      </Typography>
      {error && <Typography color="error">{error}</Typography>}

      <QrReader
        delay={300}
        onError={handleError}
        onScan={handleScan}
        style={previewStyle}
      />

      {scannedData && (
        <Typography variant="body1" color="primary" sx={{ marginTop: 2 }}>
          Scanned Data: {scannedData}
        </Typography>
      )}
    </Box>
  );
};

export default BarcodeScanner;
