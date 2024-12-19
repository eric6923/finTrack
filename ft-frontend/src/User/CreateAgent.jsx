import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CreateAgent = () => {
  const [agents, setAgents] = useState([]);
  const [newAgentName, setNewAgentName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Function to fetch agents
  // Update the fetchAgents function to handle cases where the response is not an array
const fetchAgents = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get('http://localhost:5000/api/user/agent', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const agentsData = Array.isArray(response.data) ? response.data : [];
    setAgents(agentsData);
  } catch (error) {
    console.error('Error fetching agents:', error);
  }
};


  useEffect(() => {
    fetchAgents();
  }, []);

  // Function to handle creating a new agent
  const handleCreateAgent = async () => {
    try {
      const token = localStorage.getItem('token');
      const payload = { name: newAgentName };

      const response = await axios.post(
        'http://localhost:5000/api/user/agent',
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Add the new agent to the existing list of agents
      setAgents([...agents, response.data]);
      setNewAgentName('');
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error creating agent:', error.response ? error.response.data : error.message);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-center space-x-4">
        <select className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black">
          <option value="">Select Agent</option>
          {agents.map((agent) => (
            <option key={agent.id} value={agent.name}>
              {agent.name}
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
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full space-y-4">
            <h3 className="text-xl font-semibold text-center text-black mb-4">Create New Agent</h3>
            <input
              type="text"
              value={newAgentName}
              onChange={(e) => setNewAgentName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
            <div className="flex justify-between">
              <button
                onClick={handleCreateAgent}
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

export default CreateAgent;
