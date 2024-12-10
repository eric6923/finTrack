import React from 'react';
import ViewAllLogs from './ViewAllLogs';
import CreditLog from './CreditLog';
import DebitLog from './DebitLog';

const Transactions = () => {
  return (
    <div className="relative">
      <ViewAllLogs />
      
      {/* The credit and debit logs are fixed to the bottom-right of the screen */}
      <div className="absolute bottom-0 right-0 mb-4 mr-4 space-y-4">
        <CreditLog />
        <DebitLog />
      </div>
    </div>
  );
};

export default Transactions;
