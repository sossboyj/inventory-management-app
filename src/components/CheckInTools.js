import React, { useState } from "react";
import { db } from "../firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";

const CheckInTool = ({ toolId, toolName, onSuccess }) => {
  const [error, setError] = useState("");

  const handleCheckIn = async () => {
    try {
      const toolRef = doc(db, "tools", toolId);

      await updateDoc(toolRef, {
        availability: true,
        checkedOutBy: null,
        jobSite: null,
        duration: null,
        returnDate: null,
      });

      onSuccess();
      alert(`${toolName} has been successfully checked in.`);
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
