import React, { useState } from "react";
import { db } from "../firebaseConfig";
import { doc, updateDoc, collection, addDoc } from "firebase/firestore";

const CheckOutTool = ({ toolId, toolName, onSuccess }) => {
  const [userName, setUserName] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [error, setError] = useState("");

  const handleCheckOut = async (e) => {
    e.preventDefault();

    if (!userName.trim() || !returnDate) {
      setError("User Name and Expected Return Date are required!");
      return;
    }

    try {
      const toolRef = doc(db, "tools", toolId);

      // Update the "tools" collection
      await updateDoc(toolRef, {
        availability: false,
        checkedOutBy: userName.trim(),
        returnDate,
        status: "Checked Out",
      });

      // Add entry to "checkoutHistory" collection
      await addDoc(collection(db, "checkoutHistory"), {
        toolId,
        toolName,
        checkedOutBy: userName.trim(),
        returnDate,
        checkoutDate: new Date().toISOString(),
        status: "Checked Out",
      });

      // Log the notification in the "notifications" collection
      await addDoc(collection(db, "notifications"), {
        type: "Check-Out",
        toolName,
        userName: userName.trim(),
        timestamp: new Date().toISOString(),
        status: "Unread",
      });

      // Reset states
      onSuccess();
      setUserName("");
      setReturnDate("");
      setError("");

      // Admin notification with a styled alert
      const notification = document.createElement("div");
      notification.style.backgroundColor = "#f44336"; // Red for attention
      notification.style.color = "white";
      notification.style.padding = "10px";
      notification.style.borderRadius = "5px";
      notification.style.marginTop = "10px";
      notification.style.textAlign = "center";
      notification.textContent = `${toolName} has been successfully checked out by ${userName}.`;
      document.body.appendChild(notification);

      // Remove notification after 3 seconds
      setTimeout(() => {
        notification.remove();
      }, 3000);
    } catch (err) {
      console.error("Error during checkout:", err);
      setError("Failed to check out the tool. Try again.");
    }
  };

  return (
    <div>
      <h2>Check Out Tool: {toolName}</h2>
      <form onSubmit={handleCheckOut}>
        <div>
          <label htmlFor="userName">User Name:</label>
          <input
            id="userName"
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Enter your name"
            required
          />
        </div>
        <div>
          <label htmlFor="returnDate">Expected Return Date:</label>
          <input
            id="returnDate"
            type="date"
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
            required
          />
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit">Check Out Tool</button>
      </form>
    </div>
  );
};

export default CheckOutTool;
