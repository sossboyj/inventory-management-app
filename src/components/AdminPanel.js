import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
  addDoc,
} from "firebase/firestore";

const AdminPanel = () => {
  const [tools, setTools] = useState([]);
  const [removedTools, setRemovedTools] = useState([]);
  const [viewRemoved, setViewRemoved] = useState(false); // Toggle Removed Tools View
  const [editTool, setEditTool] = useState(null); // Tool Being Edited

  useEffect(() => {
    const toolsCollection = viewRemoved ? "removedTools" : "tools";
    const unsubscribe = onSnapshot(collection(db, toolsCollection), (snapshot) => {
      const toolsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      viewRemoved ? setRemovedTools(toolsData) : setTools(toolsData);
    });
    return () => unsubscribe();
  }, [viewRemoved]);

  const handleDelete = async (id, tool) => {
    try {
      const { id: toolId, ...toolData } = tool;
      await addDoc(collection(db, "removedTools"), { ...toolData });
      await deleteDoc(doc(db, "tools", id));
      alert("Tool removed successfully!");
    } catch (error) {
      console.error("Error deleting tool:", error);
      alert("Failed to delete the tool. Check permissions.");
    }
  };

  const handleReAddTool = async (tool) => {
    try {
      const { id: toolId, ...toolData } = tool;
      await addDoc(collection(db, "tools"), { ...toolData });
      await deleteDoc(doc(db, "removedTools", tool.id));
      alert("Tool re-added successfully!");
    } catch (error) {
      console.error("Error re-adding tool:", error);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, "tools", editTool.id), {
        name: editTool.name,
        availability: editTool.availability,
      });
      setEditTool(null);
      alert("Tool updated successfully!");
    } catch (error) {
      console.error("Error updating tool:", error);
    }
  };

  return (
    <div>
      <h1>Admin Panel</h1>
      <div>
        <button onClick={() => setViewRemoved(false)}>Active Tools</button>
        <button onClick={() => setViewRemoved(true)}>Removed Tools</button>
      </div>
      {viewRemoved ? (
        <div>
          <h2>Removed Tools</h2>
          <ul>
            {removedTools.map((tool) => (
              <li key={tool.id}>
                <strong>{tool.name}</strong>
                <button onClick={() => handleReAddTool(tool)}>Re-Add Tool</button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div>
          <h2>Active Tools</h2>
          <ul>
            {tools.map((tool) => (
              <li key={tool.id}>
                <strong>{tool.name}</strong>
                <p>{tool.availability ? "Available" : "Checked Out"}</p>
                <button onClick={() => handleDelete(tool.id, tool)}>Remove</button>
                <button onClick={() => setEditTool(tool)}>Edit</button>
                {editTool?.id === tool.id && (
                  <form onSubmit={handleEditSubmit}>
                    <label>
                      Name:
                      <input
                        type="text"
                        value={editTool.name}
                        onChange={(e) =>
                          setEditTool({ ...editTool, name: e.target.value })
                        }
                      />
                    </label>
                    <button type="submit">Save</button>
                    <button onClick={() => setEditTool(null)}>Cancel</button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
