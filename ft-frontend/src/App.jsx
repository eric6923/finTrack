import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./User/Sidebar";
import Prospects from "./User/Prospects";
import Transactions from "./User/Transactions";
import Pricing from "./User/Pricing";
import Agentsettings from "./User/Agentsettings";
import Usersignup from "./User/Usersignup";
import Userlogin from "./User/Userlogin";
import Adminsidebar from "./Admin/Adminsidebar";
import Adminlogin from "./Admin/Adminlogin";
import Requests from "./Admin/Requests";
import Adminprospects from "./Admin/Adminprospects";
const App = () => {
  return (
   
    <Router>
          <Routes>
          
            <Route path="/" element={<Prospects/>} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/settings" element={<Agentsettings />} />
            <Route path="/signup" element={<Usersignup />} />
            <Route path="/login" element={<Userlogin />} />
            <Route path="/adminlogin" element={<Adminlogin/>}/>
            <Route path= "/admin" element={<Adminsidebar/>}/>
            <Route path="/adminprospects" element={<Adminprospects/>} />
            <Route path="/adminrequests" element={<Requests />} />
          </Routes>
        
    </Router>
  );
};

export default App;
