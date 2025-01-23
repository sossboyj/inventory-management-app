import React, { useState } from "react";
import { db } from "../firebaseConfig";
import { doc, updateDoc, addDoc, collection } from "firebase/firestore";

const CheckInTool = ({ toolId, toolName, onSuccess }) => {
  const [error, setError] = useState("");

  const handleCheckIn = async () => {
    try {
      const toolRef = doc(db, "tools", toolId);

      // Update the tool in the "tools" collection
      await updateDoc(toolRef, {
        availability: true,
        checkedOutBy: null,
        returnDate: null,
        status: "Available",
      });

      // Log the check-in event in the "checkInHistory" collection
      await addDoc(collection(db, "checkInHistory"), {
        toolId,
        toolName,
        checkInDate: new Date().toISOString(),
        checkedInBy: "Admin",
        status: "Checked In",
      });

      // Log the notification in the "notifications" collection
      await addDoc(collection(db, "notifications"), {
        type: "Check-In",
        toolName,
        timestamp: new Date().toISOString(),
        status: "Unread",
      });

      // Reset state and notify success
      onSuccess();
      setError("");

      // Admin notification with a styled alert
      const notification = document.createElement("div");
      notification.style.backgroundColor = "#4caf50"; // Green for success
      notification.style.color = "white";
      notification.style.padding = "10px";
      notification.style.borderRadius = "5px";
      notification.style.marginTop = "10px";
      notification.style.textAlign = "center";
      notification.textContent = `${toolName} has been successfully checked in.`;
      document.body.appendChild(notification);

      // Remove notification after 3 seconds
      setTimeout(() => {
        notification.remove();
      }, 3000);
    } catch (err) {
      console.error("Error checking in tool:", err);
      setError("Failed to check in the tool. Try again.");
    }
  };

  return (
    <div>
      <h2>Check In Tool: {toolName}</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button onClick={handleCheckIn}>Confirm Check-In</button>
    </div>
  );
};

export default CheckInTool;
