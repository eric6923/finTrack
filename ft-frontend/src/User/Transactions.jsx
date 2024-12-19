import React from 'react';
import ViewAllLogs from './ViewAllLogs';
import CreditLog from './CreditLog';
import DebitLog from './DebitLog';
import Header from "../Header/Header";
import BackToHome from '../PayLater/BackToHome';

const Transactions = () => {
  return (
    <div className="relative min-h-screen">
      {/* Back to Home Button */}
      {/* <BackToHome /> */}

      {/* Header Section */}
      <Header />

      {/* Buttons positioned below the Header, aligned to the right */}
      <div className="relative">
        <div className="absolute top-0 right-0 flex items-center gap-4 pr-6 py-2">
          {/* Buttons */}
          <CreditLog />
          <DebitLog />
        </div>
      </div>

      {/* Main Logs Section */}
      <div className="mt-16"> {/* Adjust this value to move the logs section further down */}
        <ViewAllLogs />
      </div>
    </div>
  );
};

export default Transactions;
