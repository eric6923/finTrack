import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Side from '../assets/wel-frame.png'
import Logo from '../assets/fintrack-logo.png'
const StartingAccount = () => {
  const navigate = useNavigate(); // Hook to navigate
  const [startWithZero, setStartWithZero] = useState(false);
  const [startWithOpeningBalance, setStartWithOpeningBalance] = useState(false);
  const [boxBalance, setBoxBalance] = useState("");
  const [accountBalance, setAccountBalance] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleCheckboxChange = (option) => {
    if (option === "zero") {
      setStartWithZero(!startWithZero);
      setStartWithOpeningBalance(false);
      setBoxBalance("");
      setAccountBalance("");
      setError("");
    } else if (option === "openingBalance") {
      setStartWithOpeningBalance(!startWithOpeningBalance);
      setStartWithZero(false);
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (startWithOpeningBalance && (!boxBalance || !accountBalance)) {
      setError("Both Box Balance and Account Balance must be provided.");
      return;
    }

    if (startWithZero) {
      console.log("Finance Management starts with ZERO balance.");
      setError("");
      alert("Preferences saved successfully!");
      navigate("/ownerpassword"); // Navigate to the next page
      return; // Stop further execution
    }

    if (startWithOpeningBalance) {
      try {
        // Retrieve the token from localStorage using the correct key
        const token = localStorage.getItem("token"); // Use 'token' as the key, not 'authToken'

        console.log("Token:", token); // Debugging token retrieval

        if (!token) {
          setError("You need to be logged in to perform this action.");
          return;
        }

        const response = await fetch(
          "https://ftbackend.vercel.app/api/user/balance",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`, // Attach token to the Authorization header
            },
            body: JSON.stringify({
              boxBalance: boxBalance,
              accountBalance: accountBalance,
            }),
          }
        );

        const data = await response.json();
        console.log("API Response:", data); // Debugging response

        if (response.ok) {
          setMessage(data.message);
          navigate("/ownerpassword");
        } else {
          setError(data.message || "Something went wrong!");
        }
      } catch (error) {
        setError("Error connecting to the API.");
        console.error("API Error:", error);
      }
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar with Background Image */}
      <div
        className="w-1/4 min-h-screen bg-cover bg-no-repeat bg-gray-100 flex items-center justify-center"
        style={{ backgroundImage: `url(${Side})` }}
      ></div>

      {/* Main Content */}
      <div className="ml-1/4 w-3/4 bg-white p-10 overflow-auto">
        {/* Logo and Title */}
        <div className="flex items-center justify-center mb-8">
          <img
            src={Logo}
            alt="FinTrack Logo"
            className="w-16 h-16"
          />
          <h2 className="text-4xl font-bold ml-4 text-black-600">FinTrack</h2>
        </div>

        <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center mt-28">
          How do you want to start your Finance Management?
        </h2>

        <form
          onSubmit={handleSubmit}
          className="max-w-lg mx-auto space-y-10 mt-12"
        >
          <div>
            <label className="flex items-center text-gray-700 font-medium text-lg">
              <input
                type="checkbox"
                checked={startWithZero}
                onChange={() => handleCheckboxChange("zero")}
                className="mr-3 w-6 h-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              Start with ZERO Balance
            </label>
          </div>
          <div>
            <label className="flex items-center text-gray-700 font-medium text-lg">
              <input
                type="checkbox"
                checked={startWithOpeningBalance}
                onChange={() => handleCheckboxChange("openingBalance")}
                className="mr-3 w-6 h-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              Start with Opening Balance
            </label>
          </div>
          {startWithOpeningBalance && (
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Box Balance:
              </label>
              <input
                type="number"
                value={boxBalance}
                onChange={(e) => setBoxBalance(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <label className="block text-gray-700 font-medium mb-2 mt-4">
                Account Balance:
              </label>
              <input
                type="number"
                value={accountBalance}
                onChange={(e) => setAccountBalance(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          {error && <p className="text-red-500">{error}</p>}
          {message && <p className="text-green-500">{message}</p>}

          <div className="col-span-6 mt-4 sm:flex sm:flex-col sm:items-start sm:gap-4">
            <button
              type="submit"
              className="inline-block shrink-0 rounded-md border border-blue-600 bg-blue-600 px-12 py-3 text-sm font-medium text-white transition hover:bg-transparent hover:text-blue-600 focus:outline-none focus:ring active:text-blue-500"
            >
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StartingAccount;
