import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Custom() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const today = new Date();

  const formatDate = (date) => date.toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(formatDate(yesterday));
  const [endDate, setEndDate] = useState(formatDate(today));
  const [logs, setLogs] = useState([]);
  const [busData, setBusData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch logs and bus data
    const fetchData = async () => {
      try {
        setError(null);
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Authentication token is missing. Please log in.");
          return;
        }

        // Fetch transaction logs
        const logsResponse = await axios.get(
          `http://localhost:5000/api/user/transaction?startDate=${startDate}&endDate=${endDate}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setLogs(logsResponse.data);

        // Fetch bus data
        const busResponse = await axios.get("http://localhost:5000/api/user/bus", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setBusData(busResponse.data);
      } catch (err) {
        setError("Error fetching data. Please try again.");
      }
    };

    fetchData();
  }, [startDate, endDate]);

  // Helper function to get bus name by bus ID
  const getBusName = (busId) => {
    const bus = busData.find((bus) => bus.id === busId);
    return bus ? bus.name : "N/A";
  };

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold mb-4">Report</h1>
      <div className="flex gap-4 items-center mb-4">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border border-gray-300 p-2 rounded-md"
        />
        <span className="text-gray-500">to</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border border-gray-300 p-2 rounded-md"
        />
      </div>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">ID</th>
              <th className="py-2 px-4 border-b">Description</th>
              <th className="py-2 px-4 border-b">Log Type</th>
              <th className="py-2 px-4 border-b">Amount</th>
              <th className="py-2 px-4 border-b">Payment Mode</th>
              <th className="py-2 px-4 border-b">Category</th>
              <th className="py-2 px-4 border-b">Pay Later</th>
              <th className="py-2 px-4 border-b">Created At</th>
              <th className="py-2 px-4 border-b">Updated At</th>
            </tr>
          </thead>
          <tbody>
            {logs.length > 0 ? (
              logs.map((log) => (
                <React.Fragment key={log.id}>
                  <tr className="hover:bg-gray-100">
                    <td className="py-2 px-4 border-b">{log.id}</td>
                    <td className="py-2 px-4 border-b">{log.desc}</td>
                    <td className="py-2 px-4 border-b">{log.logType}</td>
                    <td className="py-2 px-4 border-b">{log.amount}</td>
                    <td className="py-2 px-4 border-b">{log.modeOfPayment}</td>
                    <td className="py-2 px-4 border-b">{log.category?.name || "N/A"}</td>
                    <td className="py-2 px-4 border-b">{log.payLater ? "Yes" : "No"}</td>
                    <td className="py-2 px-4 border-b">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="py-2 px-4 border-b">{new Date(log.updatedAt).toLocaleString()}</td>
                  </tr>
                  {log.payLater && (
  <tr className="bg-gray-100">
    <td colSpan="9" className="py-2 px-4 border-b">
      <div className="p-4 border rounded bg-white">
        <div className="mt-2 flex gap-8">
  <span><strong>Bus Name:</strong> {getBusName(log.payLaterDetails?.busId)}</span>
  <span><strong>Route:</strong> {log.payLaterDetails?.from} to {log.payLaterDetails?.to}</span>
  <span><strong>Travel Date:</strong> {new Date(log.payLaterDetails?.travelDate).toLocaleDateString()}</span>
  <span><strong>Due Amount:</strong> {log.dueAmount || "N/A"}</span>
</div>

      </div>
    </td>
  </tr>
)}

                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="py-2 px-4 text-center text-gray-500">
                  No logs found for the selected date range.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
