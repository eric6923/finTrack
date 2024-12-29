import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const OwnerPassword = () => {
  const [ownerPassword, setOwnerPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate(); // Initialize the navigate function

  const handlePasswordChange = (e) => {
    setOwnerPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("No token found. Please log in first.");
      return;
    }

    try {
      const response = await axios.post(
        "https://ftbackend.vercel.app/api/user/set-owner-password",
        { ownerPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Check if the response is successful
      if (response.status === 200 && response.data.message) {
        setMessage(response.data.message);

        // Navigate to /sidebar if password set successfully
        if (response.data.message.includes("successfully")) {
          navigate("/transactions");
        }
      } else {
        setMessage("Unexpected server response. Please try again.");
      }
    } catch (error) {
      console.error("Error setting owner password:", error);
      setMessage("Failed to set owner password.");
    }
  };

  return (
    <div className="flex min-h-screen">
      <div
        className="w-1/4 min-h-screen bg-cover bg-no-repeat bg-gray-100 flex items-center justify-center"
        style={{ backgroundImage: "url('/src/assets/wel-frame.png')" }}
      ></div>
      <div className="ml-1/4 w-3/4 bg-white p-10 overflow-auto">
        {/* Logo and Title */}
        <div className="flex items-center justify-center mb-8">
          <img
            src="/src/assets/fintrack-logo.png"
            alt="FinTrack Logo"
            className="w-16 h-16"
          />
          <h2 className="text-4xl font-bold ml-4 text-black-600">FinTrack</h2>
        </div>

        <div className="w-full max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg mt-36">
          <h2 className="text-2xl font-semibold text-center mb-6">
            Set Owner Password
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="ownerPassword"
                className="block text-gray-700 font-medium mb-2"
              >
                Owner Password:
              </label>
              <input
                type="password"
                id="ownerPassword"
                value={ownerPassword}
                onChange={handlePasswordChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter Owner Password"
                required
              />
            </div>
            <button
              type="submit"
              className="inline-block shrink-0 rounded-md border border-blue-600 bg-blue-600 px-12 py-3 text-sm font-medium text-white transition hover:bg-transparent hover:text-blue-600 focus:outline-none focus:ring active:text-blue-500"
            >
              Set Password
            </button>
          </form>

          {message && (
            <p
              className={`mt-4 text-center text-sm ${
                message.includes("Failed") ? "text-red-500" : "text-green-500"
              }`}
            >
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OwnerPassword;
