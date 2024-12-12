import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DropdownMenu from './DropdownMenu';

const ViewAllLogs = () => {
  const [logs, setLogs] = useState([]);
  const [busData, setBusData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch logs and bus data
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem('token'); // Retrieve token from local storage
        if (!token) {
          throw new Error('No token found in local storage');
        }

        const responseLogs = await axios.get('http://localhost:5000/api/user/transactions/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setLogs(responseLogs.data);

        // Fetch bus details
        const responseBus = await axios.get('http://localhost:5000/api/user/bus', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setBusData(responseBus.data); // Store bus data
      } catch (error) {
        setError('Error fetching logs or bus data. Please try again.');
        console.error('Error fetching data:', error);
      }
    };

    fetchLogs();
  }, []);

  if (error) {
    return <div className="container mx-auto px-4"><p className="text-red-500">{error}</p></div>;
  }

  // Function to get bus name by busId
  const getBusName = (busId) => {
    const bus = busData.find((bus) => bus.id === busId);
    return bus ? bus.name : 'N/A';
  };

  const formatAmount = (amount) => {
    if (amount === null || amount === undefined) return 'N/A';
    return typeof amount === 'object' ? JSON.stringify(amount) : amount;
  };

  const handleView = (log) => {
    console.log('View', log);
    // Implement view logic here
  };

  const handleEdit = (log) => {
    console.log('Edit', log);
    // Implement edit logic here
  };

  const handleDelete = (log) => {
    console.log('Delete', log);
    // Implement delete logic here
  };

  return (
    <div className="container mx-auto px-4">
      {/* <h1 className="text-2xl font-bold mb-4">Transaction Logs</h1> */}
      <br />
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Description</th>
              <th className="py-2 px-4 border-b">Log Type</th>
              <th className="py-2 px-4 border-b">Amount</th>
              <th className="py-2 px-4 border-b">Payment Mode</th>
              <th className="py-2 px-4 border-b">Remarks</th>
              <th className="py-2 px-4 border-b">Category</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <React.Fragment key={log.id}>
                <tr className="hover:bg-gray-100">
                  <td className="py-2 px-4 border-b">{log.desc}</td>
                  <td className="py-2 px-4 border-b">{log.logType}</td>
                  <td className="py-2 px-4 border-b">{log.amount}</td>
                  <td className="py-2 px-4 border-b">{log.modeOfPayment}</td>
                  <td className="py-2 px-4 border-b">{log.remarks}</td>
                  <td className="py-2 px-4 border-b">{log.category.name}</td>
                  <td className="py-2 px-4 border-b">
                    <DropdownMenu
                      onView={() => handleView(log)}
                      onEdit={() => handleEdit(log)}
                      onDelete={() => handleDelete(log)}
                    />
                  </td>
                </tr>
                {log.payLater && log.payLaterDetails && (
                  <tr className="bg-gray-100">
                    <td colSpan="7" className="py-2 px-4 border-b">
                      <div className="p-4 border rounded bg-white">
                        <strong>Pay Later Details:</strong> <br />
                        <div><strong>Bus Name:</strong> {getBusName(log.payLaterDetails.busId)}</div>
                        <div><strong>From:</strong> {log.payLaterDetails.from}</div>
                        <div><strong>To:</strong> {log.payLaterDetails.to}</div>
                        <div><strong>Travel Date:</strong> {new Date(log.payLaterDetails.travelDate).toLocaleString()}</div>
                        <div><strong>Commission Amount:</strong> {formatAmount(log.commission.amount)}</div>
                        <div><strong>Collection Amount:</strong> {formatAmount(log.collection.amount)}</div>
                        {log.dueAmount && (
                          <div><strong>Due Amount:</strong> {log.dueAmount}</div>
                        )}
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

export default ViewAllLogs;
