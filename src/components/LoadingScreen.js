import React from "react";
import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";
import Logo from "../assets/logo.svg"; // Ensure path is correct

const LoadingScreen = () => {
  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#121212", // Dark background
        color: "#ffffff",
      }}
    >
      {/* Logo Animation */}
      <motion.img
        src={Logo}
        alt="Loading Logo"
        width="120"
        height="120"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1.1 }}
        exit={{ opacity: 0, scale: 0.5 }}
        transition={{
          duration: 1.5,
          ease: "easeInOut",
          repeat: Infinity, // Pulsating effect
          repeatType: "reverse",
        }}
      />

      {/* Fade-in Text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 0.5 }}
      >
        <Typography variant="h6" sx={{ mt: 2, fontWeight: "bold" }}>
          Loading Toolify...
        </Typography>
      </motion.div>
    </Box>
  );
};

export default LoadingScreen;
