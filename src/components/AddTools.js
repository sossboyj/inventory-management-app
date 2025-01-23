import React, { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import {
  TextField,
  Button,
  Box,
  Typography,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";

const AddTools = () => {
  const [toolName, setToolName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [model, setModel] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState("Available");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Enhanced Validation Logic
    if (!toolName.trim()) {
      alert("Tool Name is required.");
      return;
    }
    if (!model.trim()) {
      alert("Model is required.");
      return;
    }
    if (!price || isNaN(price) || parseFloat(price) <= 0) {
      alert("Please enter a valid price greater than 0.");
      return;
    }
    if (quantity < 1) {
      alert("Quantity must be at least 1.");
      return;
    }

    setLoading(true);
    try {
      const toolData = {
        name: toolName.trim(),
        quantity: parseInt(quantity),
        model: model.trim(),
        price: parseFloat(price),
        status,
        availability: true,
        checkedOutBy: null,
        duration: null,
        returnDate: null,
      };

      console.log("Adding tool to Firestore:", toolData);

      await addDoc(collection(db, "tools"), toolData);

      // Clear form fields after successful submission
      setToolName("");
      setQuantity(1);
      setModel("");
      setPrice("");
      setStatus("Available");

      alert("Tool added successfully!");
    } catch (error) {
      console.error("Error adding tool:", error);
      alert("Failed to add tool. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        maxWidth: 500,
        margin: "0 auto",
        padding: 3,
        boxShadow: 3,
        borderRadius: 2,
        backgroundColor: "#f9f9f9",
      }}
    >
      <Typography variant="h6" gutterBottom>
        Add a New Tool
      </Typography>
      <TextField
        label="Tool Name"
        value={toolName}
        onChange={(e) => setToolName(e.target.value)}
        fullWidth
        required
        margin="normal"
      />
      <TextField
        label="Quantity"
        type="number"
        value={quantity}
        onChange={(e) => setQuantity(Number(e.target.value))}
        fullWidth
        required
        margin="normal"
        inputProps={{ min: 1 }}
      />
      <TextField
        label="Model"
        value={model}
        onChange={(e) => setModel(e.target.value)}
        fullWidth
        required
        margin="normal"
      />
      <TextField
        label="Price"
        type="number"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        fullWidth
        required
        margin="normal"
        inputProps={{ min: 0.01, step: 0.01 }}
      />
      <Box margin="normal">
        <Typography variant="body2" gutterBottom>
          Status
        </Typography>
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          fullWidth
          required
        >
          <MenuItem value="Available">Available</MenuItem>
          <MenuItem value="Checked Out">Checked Out</MenuItem>
          <MenuItem value="Under Maintenance">Under Maintenance</MenuItem>
        </Select>
      </Box>
      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        disabled={loading}
        sx={{ marginTop: 2 }}
      >
        {loading ? <CircularProgress size={24} /> : "Add Tool"}
      </Button>
    </Box>
  );
};

export default AddTools;
