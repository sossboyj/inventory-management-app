import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, onSnapshot } from "firebase/firestore";
import CheckOutTool from "./CheckOutTool";
import CheckInTool from "./CheckInTools";

const ToolList = () => {
  const [tools, setTools] = useState([]);
  const [selectedToolForCheckout, setSelectedToolForCheckout] = useState(null);
  const [selectedToolForCheckin, setSelectedToolForCheckin] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "tools"), (snapshot) => {
      const toolsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTools(toolsData);
    });
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

  return (
    <div>
      <h1>Tool List</h1>
      <ul>
        {tools.map((tool) => (
          <li key={tool.id}>
            <h2>{tool.name}</h2>
            <p>Availability: {tool.availability ? "Available" : "Checked Out"}</p>
            {tool.availability ? (
              <button onClick={() => setSelectedToolForCheckout(tool)}>Check Out</button>
            ) : (
              <button onClick={() => setSelectedToolForCheckin(tool)}>Check In</button>
            )}
            {/* Render Check-Out Form directly below the selected tool */}
            {selectedToolForCheckout?.id === tool.id && (
              <CheckOutTool
                toolId={tool.id}
                toolName={tool.name}
                onSuccess={handleCheckOutSuccess}
              />
            )}
            {/* Render Check-In Form directly below the selected tool */}
            {selectedToolForCheckin?.id === tool.id && (
              <CheckInTool
                toolId={tool.id}
                toolName={tool.name}
                onSuccess={handleCheckInSuccess}
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ToolList;
