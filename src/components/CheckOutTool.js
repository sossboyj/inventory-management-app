import React, { useState } from "react";
import { db } from "../firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";

const CheckOutTool = ({ toolId, toolName, onSuccess }) => {
  const [userName, setUserName] = useState("");
  const [jobSite, setJobSite] = useState("");
  const [duration, setDuration] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [error, setError] = useState("");

  const handleCheckOut = async (e) => {
    e.preventDefault();

    console.log("Checkout button clicked"); // Debugging

    if (!userName || !jobSite || !duration || !returnDate) {
      setError("All fields are required!");
      console.log("Error: Missing required fields"); // Debugging
      return;
    }

    try {
      const toolRef = doc(db, "tools", toolId);

      console.log("Updating Firestore with:", {
        toolId,
        userName,
        jobSite,
        duration,
        returnDate,
      }); // Debugging

      await updateDoc(toolRef, {
        availability: false,
        checkedOutBy: userName,
        jobSite: jobSite,
        duration: duration,
        returnDate: returnDate,
      });

      console.log("Tool successfully checked out!"); // Debugging
      onSuccess();
      setUserName("");
      setJobSite("");
      setDuration("");
      setReturnDate("");
      setError("");
    } catch (err) {
      console.error("Error checking out tool:", err); // Debugging
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
          <label htmlFor="jobSite">Job Site:</label>
          <input
            id="jobSite"
            type="text"
            value={jobSite}
            onChange={(e) => setJobSite(e.target.value)}
            placeholder="Enter the job site"
            required
          />
        </div>
        <div>
          <label htmlFor="duration">Duration (in days):</label>
          <input
            id="duration"
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="Enter duration in days"
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
