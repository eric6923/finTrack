import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PayLater = () => {
  const [payLaterLogs, setPayLaterLogs] = useState([]);
  const [busData, setBusData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch PayLater logs and bus data
    const fetchPayLaterLogs = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found in local storage');
        }

        const responseLogs = await axios.get('http://localhost:5000/api/user/transactions/paylater', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPayLaterLogs(responseLogs.data);

        // Fetch bus details
        const responseBus = await axios.get('http://localhost:5000/api/user/bus', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setBusData(responseBus.data); // Store bus data
      } catch (error) {
        setError('Error fetching Pay Later logs or bus data. Please try again.');
        console.error('Error fetching data:', error);
      }
    };

    fetchPayLaterLogs();
  }, []);

  if (error) {
    return <div className="container mx-auto px-4"><p className="text-red-500">{error}</p></div>;
  }

  // Function to get bus name by busId
  const getBusName = (busId) => {
    const bus = busData.find((bus) => bus.id === busId);
    return bus ? bus.name : 'N/A';
  };

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold mb-4">Pay Later Logs</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">ID</th>
              <th className="py-2 px-4 border-b">Description</th>
              <th className="py-2 px-4 border-b">Log Type</th>
              <th className="py-2 px-4 border-b">Amount</th>
              <th className="py-2 px-4 border-b">Payment Mode</th>
              <th className="py-2 px-4 border-b">Transaction No</th>
              <th className="py-2 px-4 border-b">Remarks</th>
              <th className="py-2 px-4 border-b">Pay Later</th>
              <th className="py-2 px-4 border-b">Due Amount</th>
              <th className="py-2 px-4 border-b">Created At</th>
              <th className="py-2 px-4 border-b">Updated At</th>
              <th className="py-2 px-4 border-b">Category</th>
              <th className="py-2 px-4 border-b">Pay Later Details</th>
              <th className="py-2 px-4 border-b">Commission</th>
              <th className="py-2 px-4 border-b">Collection</th>
            </tr>
          </thead>
          <tbody>
            {payLaterLogs.map((log) => (
              <React.Fragment key={log.id}>
                <tr className="hover:bg-gray-100">
                  <td className="py-2 px-4 border-b">{log.id}</td>
                  <td className="py-2 px-4 border-b">{log.desc}</td>
                  <td className="py-2 px-4 border-b">{log.logType}</td>
                  <td className="py-2 px-4 border-b">{log.amount}</td>
                  <td className="py-2 px-4 border-b">{log.modeOfPayment}</td>
                  <td className="py-2 px-4 border-b">{log.transactionNo || 'N/A'}</td>
                  <td className="py-2 px-4 border-b">{log.remarks}</td>
                  <td className="py-2 px-4 border-b">{log.payLater ? 'Yes' : 'No'}</td>
                  <td className="py-2 px-4 border-b">{log.dueAmount}</td>
                  <td className="py-2 px-4 border-b">{new Date(log.createdAt).toLocaleString()}</td>
                  <td className="py-2 px-4 border-b">{new Date(log.updatedAt).toLocaleString()}</td>
                  <td className="py-2 px-4 border-b">{log.category.name}</td>
                  <td className="py-2 px-4 border-b">{log.payLater ? 'See Details' : 'N/A'}</td>
                  <td className="py-2 px-4 border-b">{log.commission ? log.commission.amount : 'N/A'}</td>
                  <td className="py-2 px-4 border-b">{log.collection ? log.collection.amount : 'N/A'}</td>
                </tr>
                {log.payLater && log.payLaterDetails && (
                  <tr className="bg-gray-100">
                    <td colSpan="15" className="py-2 px-4 border-b">
                      <div className="p-4 border rounded bg-white">
                        <div>
                          <strong>Pay Later Details:</strong> 
                          {`Bus Name: ${getBusName(log.payLaterDetails.busId)}, Route: ${log.payLaterDetails.from} to ${log.payLaterDetails.to}, Travel Date: ${new Date(log.payLaterDetails.travelDate).toLocaleString()}`}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PayLater;
