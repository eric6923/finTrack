import React from 'react';
import ViewAllLogs from './ViewAllLogs';
import CreditLog from './CreditLog';
import DebitLog from './DebitLog';
import Header from "../Header/Header";
const Transactions = () => {
  return (
    <div className="relative min-h-screen"> {/* Ensure the content is scrollable */}
      <Header/>
      <ViewAllLogs />

      {/* The credit and debit buttons are fixed at the bottom-right */}
      <div className="fixed bottom-4 right-4 space-y-4"> {/* Updated class names */}
        <CreditLog />
        <DebitLog />
      </div>
    </div>
  );
};

export default Transactions;
