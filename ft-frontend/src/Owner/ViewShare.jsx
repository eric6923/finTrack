import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ViewShare = () => {
  const [date, setDate] = useState('2024-12');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      // Get the token from local storage
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No token found. Please log in.');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`http://localhost:5000/api/user/shares?date=${date}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setData(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [date]);

  const handleDateChange = (event) => {
    const selectedDate = event.target.value;
    const formattedDate = selectedDate.slice(0, 7); // Format to YYYY-MM
    setDate(formattedDate);
  };

  return (
    <div className="p-6 bg-white space-y-6">
      <h1 className="text-2xl font-semibold text-center text-black mb-4">View Share Distribution</h1>
      <div className="flex justify-center space-x-4">
        <label className="text-black font-medium">
          Select Month and Year:
          <input
            type="month"
            value={date}
            onChange={handleDateChange}
            className="ml-2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
          />
        </label>
      </div>
  
      {loading && (
        <div className="flex justify-center">
          <p className="text-black">Loading...</p>
        </div>
      )}
      {error && (
        <div className="flex justify-center">
          <p className="text-red-600">Error: {error}</p>
        </div>
      )}
      {data && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-center text-black">Month: {data.month}</h2>
          <p className="text-lg text-center text-black">Total Profit: {data.totalProfit}</p>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-300">
              <thead className="bg-gray-600 text-white">
                <tr>
                  <th className="p-2 border-b">Shareholder</th>
                  <th className="p-2 border-b">Percentage</th>
                  <th className="p-2 border-b">Original Profit</th>
                  <th className="p-2 border-b">Finance Deducted</th>
                  <th className="p-2 border-b">Final Profit</th>
                </tr>
              </thead>
              <tbody>
                {data.shareDistribution.map((share, index) => (
                  <tr key={index} className="hover:bg-gray-100 text-center">
                    <td className="p-2 border-b">{share.shareholder}</td>
                    <td className="p-2 border-b">{share.percentage}%</td>
                    <td className="p-2 border-b">{share.originalProfit}</td>
                    <td className="p-2 border-b">{share.financeDeducted}</td>
                    <td className="p-2 border-b">{share.finalProfit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
  
  
};

export default ViewShare;
