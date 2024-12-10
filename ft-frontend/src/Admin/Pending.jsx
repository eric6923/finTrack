import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Pending = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [transactionDetails, setTransactionDetails] = useState({
    amount: '',
    paymentMethod: 'Cash',
    upiTransactionId: '',
  });
  const [verificationMessage, setVerificationMessage] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPendingUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/admin/pending-request', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPendingUsers(response.data.pendingUsers);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch pending users.');
      }
    };

    fetchPendingUsers();
  }, []);

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setVerificationMessage('');
    setTransactionDetails({
      amount: '',
      paymentMethod: 'Cash',
      upiTransactionId: '',
    });
    setIsVerified(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTransactionDetails({ ...transactionDetails, [name]: value });
  };

  const handleVerify = async () => {
    if (!transactionDetails.amount || parseFloat(transactionDetails.amount) <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    if (transactionDetails.paymentMethod === 'UPI' && !transactionDetails.upiTransactionId) {
      alert('Please enter a UPI Transaction ID.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const payload = {
        amount: transactionDetails.amount.toString(),
        paymentMethod: transactionDetails.paymentMethod.toUpperCase(),
      };

      if (transactionDetails.paymentMethod === 'UPI') {
        payload.upiTransactionId = transactionDetails.upiTransactionId;
      }

      const response = await axios.post(
        `http://localhost:5000/api/admin/payment-verification/${selectedUser.id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setVerificationMessage(response.data.message);
      setIsVerified(true);
    } catch (err) {
      console.error('Error during verification:', err.response?.data || err.message);
      alert(err.response?.data?.message || 'Failed to verify payment.');
    }
  };

  const handleApprove = async () => {
    if (!isVerified) {
      alert('Payment must be verified before approval.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5000/api/admin/approve/${selectedUser.id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(response.data.message); // Display success message
      setPendingUsers((prev) => prev.filter((user) => user.id !== selectedUser.id)); // Remove approved user
      setSelectedUser(null); // Close modal

      // Navigate to AllUsers component
      navigate('/all-users');
    } catch (err) {
      console.error('Error approving user:', err.response?.data || err.message);
      alert(err.response?.data?.message || 'Failed to approve user.');
    }
  };

  const handleReject = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `http://localhost:5000/api/admin/reject/${selectedUser.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      alert(response.data.message); // Show success message
      setPendingUsers((prev) => prev.filter((user) => user.id !== selectedUser.id)); // Remove rejected user from the list
      setSelectedUser(null); // Close modal
    } catch (err) {
      console.error('Error rejecting user:', err.response?.data || err.message);
      alert(err.response?.data?.message || 'Failed to reject user.');
    }
  };
  
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Pending Users</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {pendingUsers.length > 0 ? (
        <div>
          {pendingUsers.map((user) => (
            <div key={user.id} className="p-4 border rounded-md mb-4 shadow">
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Phone:</strong> {user.phone}</p>
              <button
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
                onClick={() => handleViewUser(user)}
              >
                View
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p>No pending users.</p>
      )}

{selectedUser && (
  <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
    <div className="bg-white p-8 rounded shadow-lg w-96">
      <h3 className="text-xl font-bold mb-4">User Details</h3>
      <p><strong>ID:</strong> {selectedUser.id}</p>
      <p><strong>Name:</strong> {selectedUser.name}</p>
      <p><strong>Email:</strong> {selectedUser.email}</p>
      <p><strong>Username:</strong> {selectedUser.userName}</p>
      <p><strong>Aadhar:</strong> {selectedUser.aadhar}</p>
      <p><strong>PAN:</strong> {selectedUser.pan}</p>
      <p><strong>GSTIN:</strong> {selectedUser.gstin || 'N/A'}</p>
      <p><strong>Phone:</strong> {selectedUser.phone}</p>
      <p><strong>Created At:</strong> {new Date(selectedUser.createdAt).toLocaleString()}</p>
      {selectedUser.address && (
        <p><strong>Address:</strong> {JSON.stringify(selectedUser.address)}</p>
      )}

      <label className="block mt-4">
        <span>Amount:</span>
        <input
          type="number"
          name="amount"
          value={transactionDetails.amount}
          onChange={handleInputChange}
          className="block w-full mt-2 border rounded px-2 py-1"
        />
      </label>

      <label className="block mt-4">
        <span>Mode of Payment:</span>
        <select
          name="paymentMethod"
          value={transactionDetails.paymentMethod}
          onChange={handleInputChange}
          className="block w-full mt-2 border rounded px-2 py-1"
        >
          <option value="Cash">Cash</option>
          <option value="UPI">UPI</option>
        </select>
      </label>

      {transactionDetails.paymentMethod === 'UPI' && (
        <label className="block mt-4">
          <span>Transaction ID:</span>
          <input
            type="text"
            name="upiTransactionId"
            value={transactionDetails.upiTransactionId}
            onChange={handleInputChange}
            className="block w-full mt-2 border rounded px-2 py-1"
          />
        </label>
      )}

      {verificationMessage && (
        <p className="mt-4 text-green-500 font-semibold">{verificationMessage}</p>
      )}

      <button
        className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded"
        onClick={handleVerify}
      >
        Verify
      </button>

      <button
        className="mt-4 px-4 py-2 bg-green-500 text-white rounded"
        onClick={handleApprove}
        disabled={!isVerified} // Disable if not verified
      >
        Approve
      </button>

      <button
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
        onClick={handleReject}
      >
        Reject
      </button>

      <button
        className="mt-4 ml-2 px-4 py-2 bg-gray-500 text-white rounded"
        onClick={() => setSelectedUser(null)}
      >
        Close
      </button>
    </div>
  </div>
)}

    </div>
  );
};

export default Pending;
