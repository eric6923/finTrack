import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ViewTransaction = ({ log, onClose }) => {
  const [busName, setBusName] = useState('Loading...');
  const [operatorName, setOperatorName] = useState('Loading...');
  const [agentName, setAgentName] = useState('Loading...');

  useEffect(() => {
    const fetchDetails = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        // Fetch Bus Name
        if (log.payLaterDetails?.busId) {
          const responseBus = await axios.get('http://localhost:5000/api/user/bus', {
            headers: { Authorization: `Bearer ${token}` },
          });
          const bus = responseBus.data.find((item) => item.id === log.payLaterDetails.busId);
          setBusName(bus ? bus.name : 'Not Found');
        }

        // Fetch Operator Name
        if (log.collection?.operatorId) {
          const responseOperator = await axios.get('http://localhost:5000/api/user/operator', {
            headers: { Authorization: `Bearer ${token}` },
          });
          const operator = responseOperator.data.find((item) => item.id === log.collection.operatorId);
          setOperatorName(operator ? operator.name : 'Not Found');
        }

        // Fetch Agent Name
        if (log.commission?.agentId) {
          const responseAgent = await axios.get('http://localhost:5000/api/user/agent', {
            headers: { Authorization: `Bearer ${token}` },
          });
          const agent = responseAgent.data.find((item) => item.id === log.commission.agentId);
          setAgentName(agent ? agent.name : 'Not Found');
        }
      } catch (error) {
        console.error('Error fetching additional details:', error);
      }
    };

    fetchDetails();
  }, [log]);

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-11/12 max-w-3xl overflow-y-auto">
        <h2 className="text-xl font-semibold text-center mb-6">Transaction Details</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            <p><strong>Description:</strong> {log.desc}</p>
            <p><strong>Log Type:</strong> {log.logType}</p>
            <p><strong>Amount:</strong> {log.amount}</p>
            <p><strong>Mode of Payment:</strong> {log.modeOfPayment}</p>
            <p><strong>Transaction No:</strong> {log.transactionNo || 'N/A'}</p>
            <p><strong>Remarks:</strong> {log.remarks}</p>
            <p><strong>Category:</strong> {log.category?.name || 'N/A'}</p>
            <p><strong>Pay Later:</strong> {log.payLater ? 'Yes' : 'No'}</p>
          </div>

          {log.payLater && (
            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-2">Pay Later Details:</h3>
              <div className="space-y-2">
                <p><strong>From:</strong> {log.payLaterDetails?.from || 'N/A'}</p>
                <p><strong>To:</strong> {log.payLaterDetails?.to || 'N/A'}</p>
                <p><strong>Travel Date:</strong> {log.payLaterDetails?.travelDate ? new Date(log.payLaterDetails.travelDate).toLocaleString() : 'N/A'}</p>
                <p><strong>Bus Name:</strong> {busName}</p>
              </div>
            </div>
          )}

          {log.commission && (
            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-2">Commission Details:</h3>
              <div className="space-y-2">
                <p><strong>Agent Name:</strong> {agentName}</p>
                <p><strong>Amount:</strong> {log.commission.amount}</p>
              </div>
            </div>
          )}

          {log.collection && (
            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-2">Collection Details:</h3>
              <div className="space-y-2">
                <p><strong>TYPE:</strong> {operatorName}</p>
                <p><strong>Amount:</strong> {log.collection.amount}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-6">
            <p><strong>Created At:</strong> {new Date(log.createdAt).toLocaleString()}</p>
            <p><strong>Updated At:</strong> {new Date(log.updatedAt).toLocaleString()}</p>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 transition duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewTransaction;
