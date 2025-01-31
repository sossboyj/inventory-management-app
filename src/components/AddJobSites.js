import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import {
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from "@mui/material";

const AddJobSites = () => {
  const [jobSites, setJobSites] = useState([]);
  const [siteName, setSiteName] = useState("");
  const [siteLocation, setSiteLocation] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Fetch existing job sites
  useEffect(() => {
    const fetchJobSites = async () => {
      const snapshot = await getDocs(collection(db, "jobSites"));
      setJobSites(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    fetchJobSites();
  }, []);

  // Add new job site
  const handleAddJobSite = async () => {
    if (!siteName || !siteLocation) return alert("Please enter both name and location!");

    await addDoc(collection(db, "jobSites"), {
      name: siteName,
      location: siteLocation,
      createdAt: serverTimestamp(),
    });

    setSiteName("");
    setSiteLocation("");
    alert("Job site added successfully!");
    window.location.reload();
  };

  // Delete job site
  const handleDeleteJobSite = async () => {
    if (!confirmDelete) return;

    await deleteDoc(doc(db, "jobSites", confirmDelete));
    alert("Job site deleted successfully!");
    setConfirmDelete(null);
    window.location.reload();
  };

  return (
    <div>
      <Typography variant="h6">Add Job Site</Typography>
      <TextField
        label="Site Name"
        value={siteName}
        onChange={(e) => setSiteName(e.target.value)}
        sx={{ mb: 2, mr: 2 }}
      />
      <TextField
        label="Location"
        value={siteLocation}
        onChange={(e) => setSiteLocation(e.target.value)}
        sx={{ mb: 2, mr: 2 }}
      />
      <Button variant="contained" color="primary" onClick={handleAddJobSite}>
        Add Job Site
      </Button>

      <Typography variant="h6" sx={{ mt: 4 }}>Existing Job Sites</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {jobSites.map(site => (
              <TableRow key={site.id}>
                <TableCell>{site.name}</TableCell>
                <TableCell>{site.location}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => setConfirmDelete(site.id)}
                  >
                    Remove
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Confirmation Dialog */}
      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this job site?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteJobSite} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AddJobSites;
