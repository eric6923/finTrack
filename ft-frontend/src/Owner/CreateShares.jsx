import React, { useState, useEffect } from "react";

const CreateShares = () => {
  const [businessName, setBusinessName] = useState("");
  const [businessCategory, setBusinessCategory] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [numberOfShareholders, setNumberOfShareholders] = useState(0);
  const [shareholders, setShareholders] = useState([]);

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
    updatedShareholders[index][field] = value;
    setShareholders(updatedShareholders);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const businessData = {
      businessName,
      businessCategory,
      businessType,
      numberOfShareHolders: numberOfShareholders,
      shareholders, // Make sure shareholders data is included
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
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="max-w-4xl w-full mx-auto p-6 bg-white shadow-md rounded-lg">
        <h2 className="text-2xl font-semibold mb-6">Create Business Shares</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Business Name:
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Business Category:
            </label>
            <input
              type="text"
              value={businessCategory}
              onChange={(e) => setBusinessCategory(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Business Type:
            </label>
            <input
              type="text"
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Number of Shareholders:
            </label>
            <input
              type="number"
              value={numberOfShareholders}
              onChange={(e) => setNumberOfShareholders(Number(e.target.value))}
              min="0"
              required
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-6">
            {shareholders.map((shareholder, index) => (
              <div
                key={index}
                className="mb-4 p-4 border rounded-md bg-gray-50"
              >
                <h3 className="text-lg font-semibold mb-4">
                  Shareholder {index + 1}
                </h3>
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">
                    Name:
                  </label>
                  <input
                    type="text"
                    value={shareholder.name}
                    onChange={(e) =>
                      handleShareholderChange(index, "name", e.target.value)
                    }
                    required
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Share Percentage:
                  </label>
                  <input
                    type="number"
                    value={shareholder.sharePercentage}
                    onChange={(e) =>
                      handleShareholderChange(
                        index,
                        "sharePercentage",
                        Number(e.target.value)
                      )
                    }
                    required
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            ))}
          </div>

          <div>
            <button
              type="submit"
              className="w-full py-3 bg-blue-500 text-white font-bold rounded-md hover:bg-blue-700 transition duration-300"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateShares;
