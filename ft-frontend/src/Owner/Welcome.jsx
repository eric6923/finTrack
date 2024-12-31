import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import Logo from "../assets/fintrack-logo.png";
import Side from "../assets/wel-frame.png";

const Welcome = () => {
  const [businessName, setBusinessName] = useState("");
  const [businessCategory, setBusinessCategory] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [numberOfShareholders, setNumberOfShareholders] = useState(0);
  const [shareholders, setShareholders] = useState([]);

  const navigate = useNavigate(); // Initialize useNavigate

  // Update shareholders array when numberOfShareholders changes
  useEffect(() => {
    const newShareholders = [];
    for (let i = 0; i < numberOfShareholders; i++) {
      newShareholders.push({ name: "", sharePercentage: 0 });
    }
    setShareholders(newShareholders);
  }, [numberOfShareholders]);

  const handleShareholderChange = (index, field, value) => {
    const updatedShareholders = [...shareholders];
    if (field === "name") {
      updatedShareholders[index][field] = value.toUpperCase(); // Convert name to uppercase
    } else {
      updatedShareholders[index][field] = value;
    }
    setShareholders(updatedShareholders);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedShareholders = shareholders.map((shareholder) => ({
      ...shareholder,
      name: shareholder.name.toUpperCase(),
    }));

    const businessData = {
      businessName,
      businessCategory,
      businessType,
      numberOfShareHolders: numberOfShareholders,
      shareholders: updatedShareholders, // Make sure shareholders data is included
    };

    // Get the token from localStorage
    const token = localStorage.getItem("token"); // Replace 'token' with the actual key where your token is stored

    if (!token) {
      alert("No authentication token found!");
      return;
    }

    try {
      const response = await fetch(
        "https://ftbackend.vercel.app/api/user/shares",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(businessData),
        }
      );

      if (response.ok) {
        const result = await response.json();
        alert("Business Shares Created Successfully!");
        console.log(result); // Handle the response if necessary

        // Navigate to /startingaccount after successful submission
        navigate("/startingaccount");
      } else {
        const error = await response.json();
        alert(
          `Error creating business shares! Status: ${response.status} - ${error.message}`
        );
        console.log(error); // Log the error response to help debug
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong!");
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar with Background Image */}
      <div
        className="w-1/4 min-h-screen bg-cover bg-no-repeat bg-gray-100 flex items-center justify-center"
        style={{ backgroundImage: `url(${Side})` }}
      ></div>

      {/* Content Area */}
      <div className="ml-1/4 w-3/4 bg-white p-10 overflow-auto">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <img src={Logo} alt="FinTrack Logo" className="w-16 h-16" />
          <h2 className="text-4xl font-bold ml-4 text-blue-600">FinTrack</h2>
        </div>
        <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2 mt-28  ">
              Business Name:
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Business Category:
            </label>
            <input
              type="text"
              value={businessCategory}
              onChange={(e) => setBusinessCategory(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Business Type:
            </label>
            <input
              type="text"
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Number of Shareholders:
            </label>
            <input
              type="number"
              value={numberOfShareholders.toString().replace(/^0+(?!$)/, "")}
              onChange={(e) => {
                const value = e.target.value.replace(/^0+(?!$)/, ""); // Remove leading zeros
                setNumberOfShareholders(value === "" ? 0 : parseInt(value, 10)); // Handle empty input gracefully
              }}
              min="0"
              required
              className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
          </div>

          {shareholders.map((shareholder, index) => (
            <div
              key={index}
              className="mb-4 p-4 border rounded-lg bg-gray-50 shadow-sm"
            >
              <h3 className="text-sm font-semibold mb-3 text-gray-800">
                Shareholder {index + 1}
              </h3>
              <div className="mb-2">
                <label className="block text-gray-700 font-medium mb-1">
                  Name:
                </label>
                <input
                  type="text"
                  value={shareholder.name}
                  onChange={(e) =>
                    handleShareholderChange(index, "name", e.target.value)
                  }
                  required
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Share Percentage:
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    value={shareholder.sharePercentage
                      .toString()
                      .replace(/^0+(?!$)/, "")}
                    onChange={(e) => {
                      const value = e.target.value.replace(/^0+(?!$)/, ""); // Remove leading zeros
                      handleShareholderChange(
                        index,
                        "sharePercentage",
                        value === "" ? 0 : Number(value) // Handle empty input gracefully
                      );
                    }}
                    required
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                  />
                  <span className="ml-2 text-gray-600">%</span>
                </div>
              </div>
            </div>
          ))}

          <button
            type="submit"
            className="inline-block shrink-0 rounded-md border border-blue-600 bg-blue-600 px-12 py-3 text-sm font-medium text-white transition hover:bg-transparent hover:text-blue-600 focus:outline-none focus:ring active:text-blue-500"
          >
            Next
          </button>
        </form>
      </div>
    </div>
  );
};

export default Welcome;
