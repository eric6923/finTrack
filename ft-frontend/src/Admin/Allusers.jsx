import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Alluser = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token'); // Retrieve token from local storage
        const response = await axios.get('http://localhost:5000/api/admin/users', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers(response.data.Users); // Access the `Users` key in the response
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch users.');
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">All Users</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {users.length > 0 ? (
        <div>
          {users.map((user) => (
            <div key={user.id} className="p-4 border rounded-md mb-4 shadow">
              <p><strong>ID:</strong> {user.id}</p>
              <p><strong>Name:</strong> {user.name || 'N/A'}</p>
              <p><strong>Email:</strong> {user.email || 'N/A'}</p>
              <p><strong>Phone:</strong> {user.phone || 'N/A'}</p>
              <p><strong>Username:</strong> {user.userName || 'N/A'}</p>
              <p><strong>Aadhar:</strong> {user.aadhar || 'N/A'}</p>
              <p><strong>PAN:</strong> {user.pan || 'N/A'}</p>
              <p><strong>GSTIN:</strong> {user.gstin || 'N/A'}</p>
              <p><strong>Created At:</strong> {new Date(user.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No users found.</p>
      )}
    </div>
  );
};

export default Alluser;
