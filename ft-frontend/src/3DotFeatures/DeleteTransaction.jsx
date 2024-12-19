import React, { useState } from 'react';
import axios from 'axios';
import PasswordModal from '../3DotFeatures/PasswordModal';

const DeleteTransaction = ({ log, onClose, onDelete }) => {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(true);

  const handlePasswordVerified = async (isValid, password) => {
    setIsPasswordModalOpen(false);
    if (isValid) {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.delete(`http://localhost:5000/api/user/transaction/${log.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          data: { password }
        });
        if (response.status === 200) {
          onDelete(log);
        } else {
          console.error('Error deleting transaction:', response);
        }
      } catch (error) {
        console.error('Error deleting transaction:', error);
      }
    } else {
      alert("Invalid password! Deletion not allowed.");
    }
    onClose();
  };

  return (
    <>
      {isPasswordModalOpen && (
        <PasswordModal
          onClose={() => setIsPasswordModalOpen(false)}
          onVerify={(isValid, password) => handlePasswordVerified(isValid, password)}
        />
      )}
    </>
  );
};

export default DeleteTransaction;
