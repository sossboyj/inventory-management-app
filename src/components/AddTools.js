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
  Card,
  CardContent,
  Snackbar,
  Alert,
  useTheme,
} from "@mui/material";

const AddTools = () => {
  const theme = useTheme(); // Detect dark/light mode

  const [toolName, setToolName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [model, setModel] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState("Available");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!toolName.trim() || !model.trim() || !price || isNaN(price) || parseFloat(price) <= 0 || quantity < 1) {
      setError("Please fill all fields correctly.");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "tools"), {
        name: toolName.trim(),
        quantity: parseInt(quantity),
        model: model.trim(),
        price: parseFloat(price),
        status,
        availability: true,
        checkedOutBy: null,
        duration: null,
        returnDate: null,
      });

      setToolName("");
      setQuantity(1);
      setModel("");
      setPrice("");
      setStatus("Available");
      setSuccess(true);
    } catch (err) {
      console.error("Error adding tool:", err);
      setError("Failed to add tool. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        p: 2,
      }}
    >
      <Card
        sx={{
          bgcolor: theme.palette.mode === "dark" ? "#1e1e1e" : "#fff",
          color: theme.palette.mode === "dark" ? "#fff" : "#000",
          boxShadow: 5,
          borderRadius: 3,
          width: 500,
          p: 3,
        }}
      >
        <CardContent>
          <Typography variant="h5" sx={{ fontWeight: "bold", textAlign: "center", mb: 3 }}>
            Add a New Tool
          </Typography>

          <TextField
            label="Tool Name"
            value={toolName}
            onChange={(e) => setToolName(e.target.value)}
            fullWidth
            required
            margin="normal"
            sx={{
              bgcolor: theme.palette.mode === "dark" ? "grey.900" : "grey.100",
              input: { color: theme.palette.mode === "dark" ? "white" : "black" },
            }}
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
            sx={{
              bgcolor: theme.palette.mode === "dark" ? "grey.900" : "grey.100",
              input: { color: theme.palette.mode === "dark" ? "white" : "black" },
            }}
          />
          <TextField
            label="Model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            fullWidth
            required
            margin="normal"
            sx={{
              bgcolor: theme.palette.mode === "dark" ? "grey.900" : "grey.100",
              input: { color: theme.palette.mode === "dark" ? "white" : "black" },
            }}
          />
          <TextField
            label="Price ($)"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            fullWidth
            required
            margin="normal"
            inputProps={{ min: 0.01, step: 0.01 }}
            sx={{
              bgcolor: theme.palette.mode === "dark" ? "grey.900" : "grey.100",
              input: { color: theme.palette.mode === "dark" ? "white" : "black" },
            }}
          />

          {/* Status Dropdown */}
          <Box margin="normal">
            <Typography variant="body2" gutterBottom>
              Status
            </Typography>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              fullWidth
              required
              sx={{
                bgcolor: theme.palette.mode === "dark" ? "grey.900" : "grey.100",
                color: theme.palette.mode === "dark" ? "white" : "black",
              }}
            >
              <MenuItem value="Available">Available</MenuItem>
              <MenuItem value="Checked Out">Checked Out</MenuItem>
              <MenuItem value="Under Maintenance">Under Maintenance</MenuItem>
            </Select>
          </Box>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
            sx={{
              mt: 3,
              py: 1.5,
              fontSize: "1rem",
              fontWeight: "bold",
              borderRadius: "25px",
              transition: "0.3s",
              "&:hover": { transform: "scale(1.05)" },
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Add Tool"}
          </Button>
        </CardContent>
      </Card>

      {/* Success Snackbar */}
      <Snackbar open={success} autoHideDuration={4000} onClose={() => setSuccess(false)}>
        <Alert severity="success" onClose={() => setSuccess(false)}>
          Tool added successfully!
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar open={Boolean(error)} autoHideDuration={4000} onClose={() => setError("")}>
        <Alert severity="error" onClose={() => setError("")}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AddTools;
