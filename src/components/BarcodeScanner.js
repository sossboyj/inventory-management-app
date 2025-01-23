import React, { useState } from "react";
import QrScanner from "react-qr-scanner";
import { db } from "../firebaseConfig";
import { collection, query, where, getDocs, updateDoc } from "firebase/firestore";
import { Typography, Box } from "@mui/material";

const BarcodeScanner = () => {
  const [scannedData, setScannedData] = useState(null);
  const [error, setError] = useState(null);

  const handleScan = async (data) => {
    if (!data) return;

    setScannedData(data.text); // Use `data.text` for the scanned barcode data

    try {
      const toolsRef = collection(db, "tools");
      const q = query(toolsRef, where("barcode", "==", data.text)); // Match barcode
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;

        await updateDoc(docRef, {
          lastScannedLocation: "Current Location", // Replace with actual location logic
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

  const handleError = (err) => {
    console.error(err);
    setError("QR Scanner Error: Unable to process the scan.");
  };

  const previewStyle = {
    height: 240,
    width: 320,
  };

  return (
    <Box sx={{ textAlign: "center", marginTop: 2 }}>
      <Typography variant="h6" gutterBottom>
        Scan Tool Barcode
      </Typography>
      {error && <Typography color="error">{error}</Typography>}
      <QrScanner
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
