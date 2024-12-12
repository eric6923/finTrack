import React, { useState } from 'react';
import axios from 'axios';
import CreateBus from '../User/CreateBus';
import CreateAgent from '../User/CreateAgent'
import CreateOperator from '../User/CreateOperator'

const OwnerDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const verifyPassword = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No token found. Please login.');
        return;
      }
  
      const response = await axios.post(
        'http://localhost:5000/api/user/verify-password',
        { password },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      console.log('API Response:', response.data); // Debugging log
  
      if (response.data.message === 'Password verified successfully.') {
        setIsAuthenticated(true);
        setError('');
      } else {
        setError('Invalid password.');
      }
    } catch (err) {
      console.error('Error:', err.response ? err.response.data : err.message);
      setError('Error verifying password.');
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    verifyPassword();
  };

  if (isAuthenticated) {
    return (
      <div>
        <h1>Owner Dashboard</h1>
        <CreateBus />
        <CreateAgent />
        <CreateOperator />
      </div>
    );
  }

  return (
    <div>
      <h1>Owner Login</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Enter Password:
          <input
  type="password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
/>

        </label>
        <button type="submit">Verify</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default OwnerDashboard;
