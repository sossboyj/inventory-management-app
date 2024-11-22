import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import AddTools from "./AddTools";

const AdminPanel = () => {
  const [tools, setTools] = useState([]);

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

  // Handle updates to a specific field in Firestore
  const handleFieldUpdate = async (id, field, value) => {
    try {
      await updateDoc(doc(db, "tools", id), {
        [field]: value,
      });
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      alert("Failed to update the field. Check your permissions.");
    }
  };

  // Handle delete on row double-click
  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "tools", id));
      alert("Tool removed successfully!");
    } catch (error) {
      console.error("Error deleting tool:", error);
      alert("Failed to delete the tool. Check permissions.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Admin Panel</h1>

      {/* Add Tools Section */}
      <div style={{ marginBottom: "20px" }}>
        <h2>Add a New Tool</h2>
        <AddTools />
      </div>

      {/* Instruction Message */}
      <div style={{ marginBottom: "10px", color: "gray" }}>
        <p>
          <strong>Note:</strong> Double-click on a row to delete a tool. Click on a cell
          to edit its value.
        </p>
      </div>

      {/* Inventory Table */}
      <div>
        <h2>Inventory</h2>
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>Tool Name</th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>Model</th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>Price</th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>Quantity</th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {tools.map((tool) => (
              <tr
                key={tool.id}
                onDoubleClick={() => handleDelete(tool.id)} // Remove row on double-click
                style={{ cursor: "pointer" }}
              >
                {/* Editable Tool Name */}
                <td
                  style={{ border: "1px solid #ccc", padding: "8px" }}
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) =>
                    handleFieldUpdate(tool.id, "name", e.target.textContent.trim())
                  }
                >
                  {tool.name}
                </td>

                {/* Editable Model */}
                <td
                  style={{ border: "1px solid #ccc", padding: "8px" }}
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) =>
                    handleFieldUpdate(tool.id, "model", e.target.textContent.trim())
                  }
                >
                  {tool.model || "N/A"}
                </td>

                {/* Editable Price */}
                <td
                  style={{ border: "1px solid #ccc", padding: "8px" }}
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) =>
                    handleFieldUpdate(tool.id, "price", parseFloat(e.target.textContent))
                  }
                >
                  ${tool.price || "0"}
                </td>

                {/* Editable Quantity */}
                <td
                  style={{ border: "1px solid #ccc", padding: "8px" }}
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) =>
                    handleFieldUpdate(
                      tool.id,
                      "quantity",
                      parseInt(e.target.textContent) || 0
                    )
                  }
                >
                  {tool.quantity}
                </td>

                {/* Editable Status */}
                <td
                  style={{ border: "1px solid #ccc", padding: "8px" }}
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) =>
                    handleFieldUpdate(tool.id, "status", e.target.textContent.trim())
                  }
                >
                  {tool.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPanel;
