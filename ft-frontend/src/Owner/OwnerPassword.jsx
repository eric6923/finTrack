import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const OwnerPassword = () => {
  const [ownerPassword, setOwnerPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); // Initialize the navigate function

  const handlePasswordChange = (e) => {
    setOwnerPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (!token) {
      setMessage('No token found. Please log in first.');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:5000/api/user/set-owner-password',
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
        if (response.data.message.includes('successfully')) {
          navigate('/transactions');
        }
      } else {
        setMessage('Unexpected server response. Please try again.');
      }
    } catch (error) {
      console.error('Error setting owner password:', error);
      setMessage('Failed to set owner password.');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white shadow-lg rounded-lg">
        <h2 className="text-2xl font-semibold text-center mb-6">Set Owner Password</h2>
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
            className="w-full py-3 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition duration-300"
          >
            Set Password
          </button>
        </form>

        {message && (
          <p
            className={`mt-4 text-center text-sm ${
              message.includes('Failed') ? 'text-red-500' : 'text-green-500'
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default OwnerPassword;
 