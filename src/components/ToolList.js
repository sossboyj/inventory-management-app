import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, onSnapshot } from "firebase/firestore";
import CheckOutTool from "./CheckOutTool";
import CheckInTool from "./CheckInTools";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  CardActions,
  Button,
  CardMedia,
  IconButton,
} from "@mui/material";
import { Link } from "react-router-dom";
import BuildIcon from "@mui/icons-material/Build";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const ToolList = () => {
  const [tools, setTools] = useState([]);
  const [selectedToolForCheckout, setSelectedToolForCheckout] = useState(null);
  const [selectedToolForCheckin, setSelectedToolForCheckin] = useState(null);

  // Fetch tools from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "tools"),
      (snapshot) => {
        const toolsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name || "Unnamed Tool",
          quantity: doc.data().quantity || 0,
          model: doc.data().model || "N/A",
          price: doc.data().price || 0,
          availability: doc.data().availability || false,
          imageUrl: doc.data().imageUrl || null, // Include tool image URL
        }));
        setTools(toolsData);
      },
      (error) => {
        console.error("Error fetching tools:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleCheckOutSuccess = () => {
    setSelectedToolForCheckout(null);
    alert("Tool checked out successfully!");
  };

  const handleCheckInSuccess = () => {
    setSelectedToolForCheckin(null);
    alert("Tool checked in successfully!");
  };

  if (!tools.length) {
    return (
      <Typography
        variant="h6"
        align="center"
        color="textSecondary"
        sx={{ mt: 4 }}
      >
        No tools available. Please add tools to the inventory.
      </Typography>
    );
  }

  return (
    <Box sx={{ padding: { xs: 2, md: 4 } }}>
      {/* App Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: "bold",
            color: "#1976d2",
            textAlign: { xs: "center", md: "left" },
            flexGrow: 1,
          }}
        >
          Tool Inventory
        </Typography>
        <IconButton
          component={Link}
          to="/"
          sx={{ display: { xs: "flex", md: "none" }, color: "#1976d2" }}
        >
          <ArrowBackIcon />
        </IconButton>
      </Box>

      {/* Navigation Buttons */}
      <Box
        sx={{
          mb: 4,
          display: { xs: "block", md: "flex" },
          gap: 2,
          justifyContent: "center",
        }}
      >
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to="/"
          sx={{ textTransform: "none", mb: { xs: 1, md: 0 } }}
        >
          Tool List
        </Button>
        <Button
          variant="outlined"
          color="primary"
          component={Link}
          to="/admin"
          sx={{ textTransform: "none" }}
        >
          Admin Panel
        </Button>
      </Box>

      {/* Tool Inventory Cards */}
      <Grid container spacing={2}>
        {tools.map((tool) => (
          <Grid item xs={12} sm={6} md={4} key={tool.id}>
            <Card
              sx={{
                backgroundColor: "#f9f9f9",
                boxShadow: 2,
                borderRadius: 2,
                padding: 2,
                transition: "0.3s",
                "&:hover": {
                  transform: "scale(1.03)",
                  boxShadow: 4,
                },
              }}
            >
              {tool.imageUrl && (
                <CardMedia
                  component="img"
                  height="140"
                  image={tool.imageUrl}
                  alt={tool.name}
                  sx={{ borderRadius: "4px" }}
                />
              )}
              <CardContent>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <BuildIcon />
                  {tool.name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Quantity: {tool.quantity}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Model: {tool.model}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Price: ${tool.price.toFixed(2)}
                </Typography>
                <Box mt={2}>
                  <Chip
                    label={tool.availability ? "Available" : "Checked Out"}
                    icon={
                      tool.availability ? (
                        <CheckCircleIcon />
                      ) : (
                        <HighlightOffIcon />
                      )
                    }
                    color={tool.availability ? "success" : "warning"}
                    size="small"
                  />
                </Box>
              </CardContent>
              <CardActions sx={{ justifyContent: "center" }}>
                {tool.availability ? (
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => setSelectedToolForCheckout(tool)}
                  >
                    Check Out
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="secondary"
                    size="small"
                    onClick={() => setSelectedToolForCheckin(tool)}
                  >
                    Check In
                  </Button>
                )}
              </CardActions>
              {selectedToolForCheckout?.id === tool.id && (
                <CheckOutTool
                  toolId={tool.id}
                  toolName={tool.name}
                  onSuccess={handleCheckOutSuccess}
                />
              )}
              {selectedToolForCheckin?.id === tool.id && (
                <CheckInTool
                  toolId={tool.id}
                  toolName={tool.name}
                  onSuccess={handleCheckInSuccess}
                />
              )}
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ToolList;
