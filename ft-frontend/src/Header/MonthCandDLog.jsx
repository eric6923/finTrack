import React, { useState, useEffect } from "react";
import axios from "axios";

const MonthlyCandDLog = () => {
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7) // Default to the current month
  );
  const [data, setData] = useState({ totalCredit: null, totalDebit: null });
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMonthlyData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Token not found. Please login again.");
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:5000/api/user/total?Date=${selectedMonth}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setData({
          totalCredit: response.data.totalCredit,
          totalDebit: response.data.totalDebit,
        });
        setError("");
      } catch (err) {
        setError("Failed to fetch data. Please try again later.");
      }
    };

    fetchMonthlyData();
  }, [selectedMonth]); // Fetch data whenever the selected month changes

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value); // Update selectedMonth when the user picks a new month
  };

  return (
    <div className="monthly-log">
      <h1>Monthly Credit and Debit Log</h1>
      <label htmlFor="month-picker"><strong>Select Month:</strong></label>
      <input
        type="month"
        id="month-picker"
        value={selectedMonth}
        onChange={handleMonthChange}
      />

      {error && <div className="error">{error}</div>}

      {data.totalCredit !== null && data.totalDebit !== null ? (
        <div>
          <p><strong>Total Credit:</strong> {data.totalCredit}</p>
          <p><strong>Total Debit:</strong> {data.totalDebit}</p>
        </div>
      ) : (
        !error && <p>Loading...</p>
      )}
    </div>
  );
};

export default MonthlyCandDLog;
