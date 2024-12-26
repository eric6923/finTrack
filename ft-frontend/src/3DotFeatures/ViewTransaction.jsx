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
  <div className="bg-white p-8 rounded-lg shadow-lg w-11/12 max-w-3xl flex flex-col h-full">
    <h2 className="text-xl font-semibold text-center mb-6">Transaction Details</h2>

    <div className="flex-grow overflow-y-auto">
      <table className="min-w-full bg-white border border-gray-200">
        {/* <thead>
          <tr>
            <th className="py-2 px-4 border-b">Field</th>
            <th className="py-2 px-4 border-b">Details</th>
          </tr>
        </thead> */}
        <tbody>
          <tr>
            <td className="py-2 px-4 border-b"><strong>Description:</strong></td>
            <td className="py-2 px-4 border-b">{log.desc}</td>
          </tr>
          <tr>
            <td className="py-2 px-4 border-b"><strong>Log Type:</strong></td>
            <td className="py-2 px-4 border-b">{log.logType}</td>
          </tr>
          <tr>
            <td className="py-2 px-4 border-b"><strong>Amount:</strong></td>
            <td className="py-2 px-4 border-b">{log.amount}</td>
          </tr>
          <tr>
            <td className="py-2 px-4 border-b"><strong>Mode of Payment:</strong></td>
            <td className="py-2 px-4 border-b">{log.modeOfPayment}</td>
          </tr>
          <tr>
            <td className="py-2 px-4 border-b"><strong>Transaction No:</strong></td>
            <td className="py-2 px-4 border-b">{log.transactionNo || 'N/A'}</td>
          </tr>
          <tr>
            <td className="py-2 px-4 border-b"><strong>Remarks:</strong></td>
            <td className="py-2 px-4 border-b">{log.remarks}</td>
          </tr>
          <tr>
            <td className="py-2 px-4 border-b"><strong>Category:</strong></td>
            <td className="py-2 px-4 border-b">{log.category?.name || 'N/A'}</td>
          </tr>
          <tr>
            <td className="py-2 px-4 border-b"><strong>Pay Later:</strong></td>
            <td className="py-2 px-4 border-b">{log.payLater ? 'Yes' : 'No'}</td>
          </tr>

          {log.payLater && (
            <tr>
              <td colSpan="2" className="py-2 px-4 border-b">
                <div className="overflow-y-auto max-h-48">
                  <h3 className="font-semibold text-lg mb-2">Pay Later Details:</h3>
                  <div className="space-y-2">
                    <p><strong>From:</strong> {log.payLaterDetails?.from || 'N/A'}</p>
                    <p><strong>To:</strong> {log.payLaterDetails?.to || 'N/A'}</p>
                    <p><strong>Travel Date:</strong> {log.payLaterDetails?.travelDate ? new Date(log.payLaterDetails.travelDate).toLocaleString() : 'N/A'}</p>
                    <p><strong>Bus Name:</strong> {busName}</p>
                  </div>
                </div>
              </td>
            </tr>
          )}

          {log.commission && (
            <>
              <tr>
                <td className="py-2 px-4 border-b"><strong>Agent Name:</strong></td>
                <td className="py-2 px-4 border-b">{agentName}</td>
              </tr>
              <tr>
                <td className="py-2 px-4 border-b"><strong>Commission Amount:</strong></td>
                <td className="py-2 px-4 border-b">{log.commission.amount}</td>
              </tr>
            </>
          )}

          {log.collection && (
            <>
              <tr>
                <td className="py-2 px-4 border-b"><strong>Operator:</strong></td>
                <td className="py-2 px-4 border-b">{operatorName}</td>
              </tr>
              <tr>
                <td className="py-2 px-4 border-b"><strong>Collection Amount:</strong></td>
                <td className="py-2 px-4 border-b">{log.collection.amount}</td>
              </tr>
            </>
          )}

          <tr>
            <td className="py-2 px-4 border-b"><strong>Created At:</strong></td>
            <td className="py-2 px-4 border-b">{new Date(log.createdAt).toLocaleString()}</td>
          </tr>
          <tr>
            <td className="py-2 px-4 border-b"><strong>Updated At:</strong></td>
            <td className="py-2 px-4 border-b">{new Date(log.updatedAt).toLocaleString()}</td>
          </tr>
        </tbody>
      </table>
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
