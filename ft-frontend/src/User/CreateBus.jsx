import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CreateBus = () => {
  const [buses, setBuses] = useState([]);
  const [newBusName, setNewBusName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Function to fetch bus data
  // Update the fetchBuses function to handle cases where the response is not an array
const fetchBuses = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get('http://localhost:5000/api/user/bus', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const busesData = Array.isArray(response.data) ? response.data : [];
    setBuses(busesData);
  } catch (error) {
    console.error('Error fetching buses:', error);
  }
};


  useEffect(() => {
    fetchBuses();
  }, []);

  // Function to handle creating a new bus
  const handleCreateBus = async () => {
    try {
      const token = localStorage.getItem('token');
      const payload = { name: newBusName };

      const response = await axios.post(
        'http://localhost:5000/api/user/bus',
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Add the new bus to the existing list of buses
      setBuses([...buses, response.data]);
      setNewBusName('');
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error creating bus:', error.response ? error.response.data : error.message);
    }
  };

  return (
    <div className=" space-y-6">
      {/* <h1 className="text-3xl font-semibold text-center text-black">Bus Category</h1> */}
  
      <div className="flex items-center justify-center space-x-4">
        <select className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black">
          <option value="">Select Bus</option>
          {buses.map((bus) => (
            <option key={bus.id} value={bus.name}>
              {bus.name}
            </option>
          ))}
        </select>
        <button
          onClick={() => setIsDialogOpen(true)}
          className="p-2 bg-black text-white rounded-full hover:bg-gray-800 transition"
        >
          +
        </button>
      </div>
  
      {isDialogOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full space-y-4">
            <h3 className="text-xl font-semibold text-center text-black">Create New Bus</h3>
            <input
              type="text"
              value={newBusName}
              onChange={(e) => setNewBusName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
            <div className="flex justify-between">
              <button
                onClick={handleCreateBus}
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

export default CreateBus;
