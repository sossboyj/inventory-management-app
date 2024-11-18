import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebaseConfig.js"; // Add the .js extension
import React, { useState } from "react";

const AddTool = () => {
  const [toolName, setToolName] = useState("");
  const [quantity, setQuantity] = useState(1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "tools"), {
        name: toolName,
        quantity: quantity,
      });
      setToolName("");
      setQuantity(1);
      alert("Tool added successfully!");
    } catch (error) {
      console.error("Error adding tool: ", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={toolName}
        onChange={(e) => setToolName(e.target.value)}
        placeholder="Tool Name"
        required
      />
      <input
        type="number"
        value={quantity}
        onChange={(e) => setQuantity(Number(e.target.value))}
        placeholder="Quantity"
        min="1"
        required
      />
      <button type="submit">Add Tool</button>
    </form>
  );
};

export default AddTool;
