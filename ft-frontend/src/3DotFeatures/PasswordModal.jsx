import React, { useState } from 'react';
import axios from 'axios';

const PasswordModal = ({ onClose, onVerify }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleVerifyPassword = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5000/api/user/verify-password`,
        { password },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.message === "Password verified successfully.") {
        onVerify(true, password); // Notify parent component that password is valid
      } else {
        setError("Invalid password. Please try again.");
        onVerify(false, password);
      }
    } catch (err) {
      setError("Error verifying password. Please try again.");
      console.error("Error:", err);
      onVerify(false, password);
    }
  };

  const handleCancel = () => {
    onVerify(false, null); // Notify parent component that the modal was canceled
    onClose(); // Close the modal
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      {/* Modal content */}
      <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Enter Owner Password</h3>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter Password"
          className="w-full px-4 py-2 border rounded-lg mb-4 focus:ring focus:ring-blue-200"
        />
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <div className="flex justify-end gap-3">
          <button
            onClick={handleCancel} // Call the updated handleCancel
            className="px-4 py-2 bg-gray-300 rounded-lg text-gray-800 hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleVerifyPassword}
            className="px-4 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700"
          >
            Verify
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasswordModal;
