import React, { useState } from "react";
import { db } from "../firebaseConfig";
import { doc, updateDoc, collection, addDoc } from "firebase/firestore";
import { useAuth } from "../AuthProvider"; // Use the useAuth hook for user information

const CheckOutTool = ({ toolId, toolName, onSuccess }) => {
  const [returnDate, setReturnDate] = useState("");
  const [error, setError] = useState("");
  const { user } = useAuth(); // Get logged-in user information

  const handleCheckOut = async (e) => {
    e.preventDefault();

    if (!returnDate) {
      setError("Expected Return Date is required!");
      return;
    }

    try {
      const toolRef = doc(db, "tools", toolId);

      // 1) Update the tool document
      await updateDoc(toolRef, {
        availability: false,
        checkedOutBy: user?.displayName || "Unknown User", // Use logged-in user's name or fallback
        returnDate,
        status: "Checked Out",
      });

      // 2) Log the check-out event in "checkoutHistory"
      await addDoc(collection(db, "checkoutHistory"), {
        toolId,
        toolName,
        checkedOutBy: user?.displayName || "Unknown User",
        returnDate,
        checkoutDate: new Date().toISOString(),
        status: "Checked Out",
        userId: user?.uid || null, // Ensure userId is recorded
      });

      // 3) Add a user notification
      if (user?.uid) {
        await addDoc(collection(db, "userNotifications"), {
          userId: user.uid,
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
        userId: user?.uid || null,
        userName: user?.displayName || "Unknown User",
        timestamp: new Date().toISOString(),
        status: "Unread",
      });

      // 5) Reset state and notify success
      onSuccess();
      setError("");
      setReturnDate("");

      // 6) Display admin notification
      const notification = document.createElement("div");
      notification.style.backgroundColor = "#f44336"; // Red for attention
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
      notification.textContent = `${toolName} has been successfully checked out by ${user?.displayName || "Unknown User"}.`;
      document.body.appendChild(notification);

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
