import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, onSnapshot } from "firebase/firestore";
import CheckOutTool from "./CheckOutTool";

const ToolList = () => {
  const [tools, setTools] = useState([]);
  const [selectedTool, setSelectedTool] = useState(null);

  // Fetch tools from Firestore
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
    setSelectedTool(null);
    alert("Tool checked out successfully!");
  };

  return (
    <div>
      <h1>Tool List</h1>
      <ul>
        {tools.map((tool) => (
          <li key={tool.id} style={{ marginBottom: "20px" }}>
            <h2>{tool.name}</h2>
            <p>Availability: {tool.availability ? "Available" : "Checked Out"}</p>
            {tool.availability && (
              <button
                onClick={() => {
                  console.log("Tool Selected for Checkout:", tool); // Debugging
                  setSelectedTool(selectedTool?.id === tool.id ? null : tool);
                }}
              >
                {selectedTool?.id === tool.id ? "Hide Form" : "Check Out"}
              </button>
            )}
            {/* Render the CheckOutTool form beneath the tool if selected */}
            {selectedTool?.id === tool.id && (
              <div
                style={{
                  marginTop: "10px",
                  border: "1px solid #ccc",
                  padding: "10px",
                  backgroundColor: "#f9f9f9",
                  borderRadius: "8px",
                }}
              >
                <CheckOutTool
                  toolId={tool.id}
                  toolName={tool.name}
                  onSuccess={handleCheckOutSuccess}
                />
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ToolList;
