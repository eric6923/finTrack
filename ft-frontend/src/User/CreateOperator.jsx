import React, { useState, useEffect } from "react";
import axios from "axios";

const CreateOperator = () => {
  const [operators, setOperators] = useState([]);
  const [newOperatorName, setNewOperatorName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Function to fetch operators
  // Update the fetchOperators function to handle cases where the response is not an array
  const fetchOperators = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "https://ftbackend.vercel.app/api/user/operator",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const operatorsData = Array.isArray(response.data) ? response.data : [];
      setOperators(operatorsData);
    } catch (error) {
      console.error("Error fetching operators:", error);
    }
  };

  useEffect(() => {
    fetchOperators();
  }, []);

  // Function to handle creating a new operator
  const handleCreateOperator = async () => {
    try {
      const token = localStorage.getItem("token");
      const payload = { name: newOperatorName };

      const response = await axios.post(
        "https://ftbackend.vercel.app/api/user/operator",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Add the new operator to the existing list of operators
      setOperators([...operators, response.data]);
      setNewOperatorName("");
      setIsDialogOpen(false);
    } catch (error) {
      console.error(
        "Error creating operator:",
        error.response ? error.response.data : error.message
      );
    }
  };

  return (
    <div className="p-4 space-y-2">
      <h1 className="text-xl font-semibold text-center text-black">
        Create Type
      </h1>
      <div className="flex items-center justify-center space-x-4">
        <select className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black">
          <option value="">Select Type</option>
          {operators.map((operator) => (
            <option key={operator.id} value={operator.name}>
              {operator.name}
            </option>
          ))}
        </select>
        <button
          onClick={() => setIsDialogOpen(true)}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          +
        </button>
      </div>

      {isDialogOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full space-y-4">
            <h3 className="text-xl font-semibold text-center text-black mb-4">
              Create New Type
            </h3>
            <input
              type="text"
              value={newOperatorName}
              onChange={(e) => setNewOperatorName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
            <div className="flex justify-between">
              <button
                onClick={handleCreateOperator}
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition"
              >
                Create
              </button>
              <button
                onClick={() => setIsDialogOpen(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateOperator;
