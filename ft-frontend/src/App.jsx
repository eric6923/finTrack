import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Pricing from "./User/Pricing";
import Usersignup from "./User/Usersignup";
import Userlogin from "./User/Userlogin";
import UserRequest from "./User/UserRequest";

import Admin from "./Admin/Admin"
import Adminsidebar from "./Admin/Adminsidebar";
import Adminlogin from "./Admin/Adminlogin";
import Allusers from "./Admin/Allusers";
import Pending from "./Admin/Pending";
import { AuthProvider } from "./Admin/AuthContext";
import Sidebar from "./User/Sidebar";

const App = () => {
  return (
    
    <AuthProvider>
    <Router>
          <Routes>
          
            <Route path = "/userrequest" element={<UserRequest/>}/>
            <Route path="/signup" element={<Usersignup />} />
            <Route path="/login" element={<Userlogin />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/sidebar" element={<Sidebar />} />
    
            <Route path="/adminlogin" element={<Adminlogin/>}/>
            <Route path="/pending" element={<Pending />} />
            <Route path= "/admin" element={<Admin/>}/>
            <Route path="/all-users" element={<Allusers/>} />
            
          </Routes>
        
    </Router>
    </AuthProvider>
  );
};

export default App;
