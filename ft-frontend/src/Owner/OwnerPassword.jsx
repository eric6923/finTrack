import React, { useState } from 'react';
import axios from 'axios';

const OwnerPassword = () => {
  const [ownerPassword, setOwnerPassword] = useState('');
  const [message, setMessage] = useState('');

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
      setMessage(response.data.message);
    } catch (error) {
      console.error('Error setting owner password:', error);
      setMessage('Failed to set owner password.');
    }
  };

  return (
    <div>
      <h2>Set Owner Password</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="ownerPassword">Owner Password:</label>
          <input
            type="password"
            id="ownerPassword"
            value={ownerPassword}
            onChange={handlePasswordChange}
          />
        </div>
        <button type="submit">Set Password</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default OwnerPassword;
