import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Usersignup from "./User/Usersignup";
import Userlogin from "./User/Userlogin";
import UserRequest from "./User/UserRequest";
import CreditLog from "./User/CreditLog";
import ViewAllLogs from "./User/ViewAllLogs";
import DebitLog from "./User/DebitLog";
import VCategory from "./User/VCategory";
import ViewSpecificLogs from "./User/ViewSpecificLogs";
import Sidebar from "./User/Sidebar";
import CreateBus from "./User/CreateBus";
import CreateAgent from "./User/CreateAgent";
import CreateOperator from "./User/CreateOperator"
import Credit from "./User/Credit";
import Paylater from "./User/Paylater";
import Transactions from "./User/Transactions";
import Reports from "./User/Reports";

import Admin from "./Admin/Admin"
import Adminsidebar from "./Admin/Adminsidebar";
import Adminlogin from "./Admin/Adminlogin";
import Allusers from "./Admin/Allusers";
import Pending from "./Admin/Pending";
import { AuthProvider } from "./Admin/AuthContext";
import Custom from "./User/Custom";





const App = () => {
  return (
    
    <AuthProvider>
    <Router>
          <Routes>
            <Route path = "/debit" element={<DebitLog/>}/>
            <Route path = "/credit" element={<CreditLog/>}/>
            <Route path = "/view" element={<ViewAllLogs/>}/>
            <Route path = "/userrequest" element={<UserRequest/>}/>
            <Route path="/signup" element={<Usersignup />} />
            <Route path="/login" element={<Userlogin />} />
            <Route path="/sidebar" element={<Sidebar />} />
            <Route path = "/viewcategory" element={<VCategory/>}/>
            <Route path="/bus" element={<CreateBus />} />
            <Route path="/agent" element={<CreateAgent />} />
            <Route path="/operator" element={<CreateOperator />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/paylater" element={<Paylater />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/custom" element={<Custom />} />

            <Route path="/adminlogin" element={<Adminlogin/>}/>
            <Route path="/pending" element={<Pending />} />
            <Route path= "/admin" element={<Admin/>}/>
            <Route path="/all-users" element={<Allusers/>} />
            <Route path="/admin-sidebar" element={<Adminsidebar/>} />
      
          </Routes>
        
    </Router>
    </AuthProvider>
  );
};

export default App;
