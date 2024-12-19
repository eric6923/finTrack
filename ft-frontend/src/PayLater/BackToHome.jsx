import React from 'react';
import { useNavigate } from 'react-router-dom';

const BackToHome = () => {
  const navigate = useNavigate(); // useNavigate hook for navigation

  const goToSidebar = () => {
    navigate('/transactions'); // Navigate to /sidebar
  };

  return (
    <div>
      <button onClick={goToSidebar}>Home</button>
    </div>
  );
};

export default BackToHome;
