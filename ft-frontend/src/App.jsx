import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./Sidebar";
import Prospects from "./Prospects";
import Transactions from "./Transactions";
import Pricing from "./Pricing";
import Agentsettings from "./Agentsettings";
import Test from "./Test"
const App = () => {
  return (
    <Router>
      <div className="flex">
        {/* Sidebar */}
        <Sidebar />
        <Test/>




        {/* Main Content */}
        {/* <div className="flex-1 bg-gray-100 h-screen overflow-y-auto">
          <Routes>
            <Route path="/" element={<Prospects />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/settings" element={<Agentsettings />} />
          </Routes>
        </div> */}
      </div>
    </Router>
  );
};

export default App;
