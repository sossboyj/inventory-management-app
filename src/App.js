import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import ToolList from "./components/ToolList";
import AdminPanel from "./components/AdminPanel";

const App = () => {
  return (
    <Router>
      <div>
        <h1>Inventory Management App</h1>
        <nav>
          <ul>
            <li>
              <Link to="/">Tool List</Link>
            </li>
            <li>
              <Link to="/admin">Admin Panel</Link>
            </li>
          </ul>
        </nav>
        <Routes>
          <Route path="/" element={<ToolList />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
