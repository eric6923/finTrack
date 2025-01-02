import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import axios from "axios";
import CreateBus from "../User/CreateBus";
import CreateAgent from "../User/CreateAgent";
import CreateOperator from "../User/CreateOperator";
import BackToHome from "../PayLater/BackToHome";
import ViewShare from "./ViewShare";
import Category from "../User/Category";

const OwnerDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const verifyPassword = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No token found. Please login.");
        return;
      }

      const response = await axios.post(
        "https://ftbackend.vercel.app/api/user/verify-password",
        { password },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.message === "Password verified successfully.") {
        setIsAuthenticated(true);
        setError("");
      } else {
        setError("Invalid password.");
      }
    } catch (err) {
      setError("Error verifying password.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    verifyPassword();
  };

  if (isAuthenticated) {
    return (
      <div className="p-8 bg-gray-100 min-h-screen ">
        <h1 className="text-3xl font-bold mb-6 text-center text-black">
          Owner Dashboard
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <CreateBus />
          <CreateAgent />
          <CreateOperator />
          <Category />
          <div className="col-span-4">
            <ViewShare />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h1 className="text-2xl font-bold mb-4 text-center">Owner Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Enter Password:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-black"
            />
          </div>
          <div className="mt-2 text-sm text-right">
            <span
              onClick={() => navigate("/ownersendlink")}
              className="font-medium text-blue-600 cursor-pointer hover:underline "
            >
              Forgot password?
            </span>
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition"
          >
            Verify
          </button>
        </form>
        {error && (
          <p className="text-sm text-red-500 mt-4 text-center">{error}</p>
        )}
      </div>
    </div>
  );
};

export default OwnerDashboard;
