import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebaseConfig.js";
import React, { useState } from "react";

const AddTools = () => {
  const [toolName, setToolName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [model, setModel] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState("Available");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Enhanced Validation Logic
    if (!toolName.trim()) {
      alert("Tool Name is required.");
      return;
    }
    if (!model.trim()) {
      alert("Model is required.");
      return;
    }
    if (price === "" || price <= 0) {
      alert("Please enter a valid price greater than 0.");
      return;
    }
    if (quantity < 1) {
      alert("Quantity must be at least 1.");
      return;
    }

    setLoading(true);
    try {
      const toolData = {
        name: toolName.trim(),
        quantity,
        model: model.trim(),
        price: parseFloat(price),
        status,
        availability: true,
        checkedOutBy: null,
        duration: null,
        returnDate: null,
      };

      console.log("Adding tool to Firestore:", toolData);

      await addDoc(collection(db, "tools"), toolData);

      // Clear form fields after successful submission
      setToolName("");
      setQuantity(1);
      setModel("");
      setPrice("");
      setStatus("Available");

      alert("Tool added successfully!");
    } catch (error) {
      console.error("Error adding tool:", error);
      alert("Failed to add tool. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ margin: "20px" }}>
      <h2>Add a New Tool</h2>
      <form onSubmit={handleSubmit} style={{ maxWidth: "500px" }}>
        <div style={{ marginBottom: "10px" }}>
          <label style={{ display: "block", fontWeight: "bold" }}>Tool Name:</label>
          <input
            type="text"
            value={toolName}
            onChange={(e) => setToolName(e.target.value)}
            placeholder="Enter tool name"
            required
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label style={{ display: "block", fontWeight: "bold" }}>Quantity:</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            placeholder="Enter quantity"
            min="1"
            required
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label style={{ display: "block", fontWeight: "bold" }}>Model:</label>
          <input
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="Enter model number"
            required
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label style={{ display: "block", fontWeight: "bold" }}>Price:</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Enter price"
            min="0.01"
            step="0.01"
            required
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label style={{ display: "block", fontWeight: "bold" }}>Status:</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          >
            <option value="Available">Available</option>
            <option value="Checked Out">Checked Out</option>
            <option value="Under Maintenance">Under Maintenance</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            backgroundColor: loading ? "#ccc" : "#007BFF",
            color: "#fff",
            padding: "10px 15px",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Adding Tool..." : "Add Tool"}
        </button>
      </form>
    </div>
  );
};

export default AddTools;
