import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Box,
  Divider,
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
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PersonIcon from "@mui/icons-material/Person";

const CheckInOut = ({ open, onClose }) => {
  const { user } = useAuth() || {}; // Get logged-in user info
  const [scannedCode, setScannedCode] = useState("");
  const [tool, setTool] = useState(null);
  const [jobSites, setJobSites] = useState([]);
  const [selectedJobSite, setSelectedJobSite] = useState("");
  const [scannerEnabled, setScannerEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch job sites from Firestore
  useEffect(() => {
    const fetchJobSites = async () => {
      try {
        const snapshot = await getDocs(collection(db, "jobSites"));
        setJobSites(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Error fetching job sites:", err);
        setError("Failed to fetch job sites.");
      }
    };
    fetchJobSites();
  }, []);

  // Handle successful barcode scan
  const handleScanSuccess = async (code) => {
    if (!code || !scannerEnabled) return;

    setScannerEnabled(false); // Stop scanner after a successful scan
    setScannedCode(code);
    setLoading(true);
    setError("");

    try {
      const q = query(collection(db, "tools"), where("barcode", "==", code));
      const querySnap = await getDocs(q);

      if (!querySnap.empty) {
        const docSnap = querySnap.docs[0];
        setTool({ id: docSnap.id, ...docSnap.data() });
      } else {
        setTool(null);
        setError("No tool found with this barcode.");
      }
    } catch (err) {
      console.error("Error fetching tool data:", err);
      setError("Error fetching tool data.");
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
    if (action === "checkout" && !selectedJobSite) {
      setError("Please select a job site before checking out.");
      return;
    }

    const isCheckIn = action === "checkin";
    const userEmail = user?.email || "Unknown User"; // Capture logged-in user
    const timestamp = new Date().toISOString(); // Capture current timestamp

    try {
      setLoading(true);
      setError("");

      // ✅ Update Firestore: Update the tool status in the `tools` collection
      await updateDoc(doc(db, "tools", tool.id), {
        availability: isCheckIn,
        checkedOutBy: isCheckIn ? null : userEmail, // ✅ Store last checked-out user
        checkedInBy: isCheckIn ? userEmail : null, // ✅ Store last checked-in user
        jobSite: isCheckIn ? null : selectedJobSite,
      });

      // ✅ Log action in history
      const historyEntry = {
        toolId: tool.id,
        toolName: tool.name,
        user: userEmail, 
        jobSite: selectedJobSite,
        timestamp: timestamp, 
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

      // ✅ Add notification
      await addDoc(collection(db, "notifications"), {
        toolName: tool.name,
        type: isCheckIn ? "Check-In" : "Check-Out",
        jobSite: selectedJobSite,
        status: "Unread",
        timestamp: timestamp,
      });

      // Reset and close modal
      setTimeout(() => {
        resetState();
        onClose();
      }, 1000);
    } catch (err) {
      console.error(`Error during ${action} action:`, err);
      setError(`Failed to ${isCheckIn ? "check in" : "check out"} the tool.`);
    } finally {
      setLoading(false);
    }
  };

  // Reset state after closing
  const resetState = () => {
    setTool(null);
    setScannedCode("");
    setScannerEnabled(true);
    setError("");
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle align="center" sx={{ fontWeight: "bold" }}>
        Tool Check-In / Check-Out
      </DialogTitle>
      <DialogContent>
        {scannerEnabled && (
          <BarcodeScannerComponent
            width={500}
            height={300}
            onUpdate={(err, result) => {
              if (result) handleScanSuccess(result.text);
            }}
          />
        )}

        {tool && (
          <Card sx={{ mt: 3, p: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>{tool.name}</Typography>
              <Divider sx={{ my: 2 }} />
              <Typography>Model: {tool.model}</Typography>
              <Typography>Status: {tool.availability ? <CheckCircleIcon color="success" /> : <HighlightOffIcon color="error" />}</Typography>
              <Typography><LocationOnIcon /> Job Site: {tool.jobSite || "Not Assigned"}</Typography>
              <Typography><PersonIcon /> Last Checked Out By: {tool.checkedOutBy || "N/A"}</Typography>
              <Typography><PersonIcon /> Last Checked In By: {tool.checkedInBy || "N/A"}</Typography>
            </CardContent>
          </Card>
        )}

        {/* Job Site Selection for Checkout */}
        {tool && tool.availability && (
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Select Job Site</InputLabel>
            <Select
              value={selectedJobSite}
              onChange={(e) => setSelectedJobSite(e.target.value)}
            >
              {jobSites.map((site) => (
                <MenuItem key={site.id} value={site.name}>
                  {site.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {loading && <CircularProgress sx={{ display: "block", mx: "auto", mt: 2 }} />}
        {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">Close</Button>
        {tool && tool.availability && <Button variant="contained" onClick={() => handleAction("checkout")}>Confirm Check Out</Button>}
        {tool && !tool.availability && <Button variant="contained" color="primary" onClick={() => handleAction("checkin")}>Confirm Check In</Button>}
      </DialogActions>
    </Dialog>
  );
};

export default CheckInOut;
