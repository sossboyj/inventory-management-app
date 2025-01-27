import React, { useState, useEffect } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
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
  const [scannedCode, setScannedCode] = useState(null);
  const [tool, setTool] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [lastScanned, setLastScanned] = useState("");
  const videoElementId = "video-preview";
  let codeReader = null;
  let videoStream = null;

  useEffect(() => {
    codeReader = new BrowserMultiFormatReader();

    const startScanner = async () => {
      try {
        setError(null);

        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((device) => device.kind === "videoinput");

        if (videoDevices.length === 0) {
          setError("No camera devices found. Please check your device.");
          return;
        }

        const selectedDeviceId = videoDevices[0].deviceId;

        videoStream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: selectedDeviceId },
        });

        const videoElement = document.getElementById(videoElementId);
        if (videoElement) {
          videoElement.srcObject = videoStream;
          videoElement.play();

          codeReader.decodeFromVideoElement(videoElement, (result, err) => {
            if (result) {
              const code = result.text;
              console.log("Scanned Barcode:", code);

              if (code !== lastScanned) {
                setScannedCode(code);
                setLastScanned(code);
                lookupFirestore(code);
              }
            }

            if (err && err.name !== "NotFoundException") {
              console.error("Scanner Error:", err);
              setError("Error scanning barcode. Please try again.");
            }
          });
        }
      } catch (e) {
        console.error("Error initializing scanner:", e);
        setError("An error occurred while initializing the scanner.");
      }
    };

    startScanner();

    return () => {
      // Stop video stream on unmount
      if (videoStream) {
        videoStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [lastScanned]);

  const lookupFirestore = async (code) => {
    try {
      setError(null);
      setSuccess("");
      console.log(`Looking up barcode in Firestore: ${code}`);

      const toolsRef = collection(db, "tools");
      const q = query(toolsRef, where("barcode", "==", code));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setTool(null);
        setError("Tool not found in the inventory.");
      } else {
        const docSnap = querySnapshot.docs[0];
        setTool({ id: docSnap.id, ...docSnap.data() });
        setSuccess("Tool found!");
      }
    } catch (err) {
      console.error("Error querying Firestore:", err);
      setError("An error occurred while searching for the tool.");
    }
  };

  const handleCheckOut = async () => {
    if (!tool) return;
    try {
      await updateDoc(doc(db, "tools", tool.id), {
        status: "Checked Out",
        expectedReturnDate: returnDate || null,
      });
      setSuccess(`Successfully checked out: ${tool.name}`);
      resetState();
    } catch (err) {
      console.error("Error checking out tool:", err);
      setError("Failed to check out tool.");
    }
  };

  const handleCheckIn = async () => {
    if (!tool) return;
    try {
      await updateDoc(doc(db, "tools", tool.id), {
        status: "Available",
        expectedReturnDate: null,
      });
      setSuccess(`Successfully checked in: ${tool.name}`);
      resetState();
    } catch (err) {
      console.error("Error checking in tool:", err);
      setError("Failed to check in tool.");
    }
  };

  const resetState = () => {
    setScannedCode(null);
    setTool(null);
    setReturnDate("");
  };

  return (
    <Box sx={{ textAlign: "center", mt: 2 }}>
      <Typography variant="h5">Barcode Scanner</Typography>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mt: 2 }}>
          {success}
        </Alert>
      )}

      <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
        <video id={videoElementId} style={{ width: "100%", maxWidth: 400 }} />
      </Box>

      {scannedCode && (
        <Typography variant="body1" sx={{ mt: 2 }}>
          Scanned Code: <strong>{scannedCode}</strong>
        </Typography>
      )}

      {tool && (
        <Paper
          elevation={3}
          sx={{ p: 2, mt: 2, width: "80%", maxWidth: 400, mx: "auto" }}
        >
          <Typography variant="h6">Tool Details</Typography>
          <Typography>Name: {tool.name}</Typography>
          <Typography>Model: {tool.model}</Typography>
          <Typography>Status: {tool.status}</Typography>
          <Typography>
            Expected Return:{" "}
            {tool.expectedReturnDate ? tool.expectedReturnDate : "None"}
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", mt: 2 }}>
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
