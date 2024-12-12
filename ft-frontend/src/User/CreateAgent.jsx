import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CreateAgent = () => {
  const [agents, setAgents] = useState([]);
  const [newAgentName, setNewAgentName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Function to fetch agents
  const fetchAgents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/user/agent', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAgents(response.data);
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
    <div>
      <select>
        <option value="">Select Agent</option>
        {agents.map((agent) => (
          <option key={agent.id} value={agent.name}>
            {agent.name}
          </option>
        ))}
      </select>
      <button onClick={() => setIsDialogOpen(true)}>+</button>

      {isDialogOpen && (
        <div>
          <div>
            <h3>Create New Agent</h3>
            <input
              type="text"
              value={newAgentName}
              onChange={(e) => setNewAgentName(e.target.value)}
            />
            <button onClick={handleCreateAgent}>Create</button>
            <button onClick={() => setIsDialogOpen(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateAgent;
