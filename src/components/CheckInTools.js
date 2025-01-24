import React, { useState } from "react";
import { db } from "../firebaseConfig";
import { doc, updateDoc, collection, addDoc } from "firebase/firestore";

const CheckOutTool = ({ toolId, toolName, userId, onSuccess }) => {
  const [userName, setUserName] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [error, setError] = useState("");

  const handleCheckOut = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!userName.trim() || !returnDate) {
      setError("User Name and Expected Return Date are required!");
      return;
    }

    try {
      // Reference to the tool in Firestore
      const toolRef = doc(db, "tools", toolId);

      // 1) Update the tool document
      await updateDoc(toolRef, {
        availability: false,
        checkedOutBy: userName.trim(),
        returnDate,
        status: "Checked Out",
      });

      // 2) Log the check-out event in "checkoutHistory"
      await addDoc(collection(db, "checkoutHistory"), {
        toolId,
        toolName,
        checkedOutBy: userName.trim(),
        returnDate,
        checkoutDate: new Date().toISOString(),
        status: "Checked Out",
        userId: userId || null, // Ensure userId is recorded if provided
      });

      // 3) Log user-specific notification (if userId is provided)
      if (userId) {
        await addDoc(collection(db, "userNotifications"), {
          userId,
          message: `The tool "${toolName}" has been successfully checked out.`,
          timestamp: new Date().toISOString(),
          status: "Unread",
        });
      }

      // 4) Log an admin notification in "notifications"
      await addDoc(collection(db, "notifications"), {
        type: "Check-Out",
        toolName,
        toolId,
        userId: userId || null,
        userName: userName.trim(),
        timestamp: new Date().toISOString(),
        status: "Unread",
      });

      // 5) Reset states and call onSuccess
      onSuccess();
      setError("");
      setUserName("");
      setReturnDate("");

      // 6) Show a styled DOM notification for admin
      const notification = document.createElement("div");
      notification.style.backgroundColor = "#f44336"; // Red for check-out
      notification.style.color = "white";
      notification.style.padding = "10px";
      notification.style.borderRadius = "5px";
      notification.style.marginTop = "10px";
      notification.style.textAlign = "center";
      notification.style.position = "fixed";
      notification.style.top = "80px";
      notification.style.left = "50%";
      notification.style.transform = "translateX(-50%)";
      notification.style.zIndex = "9999";
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
