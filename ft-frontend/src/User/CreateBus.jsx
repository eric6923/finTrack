import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CreateBus = () => {
  const [buses, setBuses] = useState([]);
  const [newBusName, setNewBusName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Function to fetch bus data
  const fetchBuses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/user/bus', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setBuses(response.data);
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
    <div>
      <h1>Bus Category</h1>
      <select>
        <option value="">Select Bus</option>
        {buses.map((bus) => (
          <option key={bus.id} value={bus.name}>
            {bus.name}
          </option>
        ))}
      </select>
      <button onClick={() => setIsDialogOpen(true)}>+</button>

      {isDialogOpen && (
        <div>
          <div>
            <h3>Create New Bus</h3>
            <input
              type="text"
              value={newBusName}
              onChange={(e) => setNewBusName(e.target.value)}
            />
            <button onClick={handleCreateBus}>Create</button>
            <button onClick={() => setIsDialogOpen(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateBus;
