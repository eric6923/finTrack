import React, { useState } from "react";
import axios from "axios";

const CustomCandDLog = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [data, setData] = useState({ totalCredit: null, totalDebit: null });
  const [error, setError] = useState("");

  const fetchCustomData = async () => {
    if (!startDate || !endDate) {
      setError("Please select both start and end dates.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Token not found. Please login again.");
      return;
    }

    try {
      const response = await axios.get(
        `https://ftbackend.vercel.app/api/user/total?startDate=${startDate}&endDate=${endDate}`,
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
      setError(
        "Failed to fetch data for the selected range. Please try again."
      );
    }
  };

  const handleFetchClick = () => {
    fetchCustomData(); // Trigger the fetch when the user clicks the button
  };

  return (
    <div className="custom-log">
      <h1>Custom Credit and Debit Log</h1>
      <div>
        <label htmlFor="start-date">
          <strong>Start Date:</strong>
        </label>
        <input
          type="date"
          id="start-date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="end-date">
          <strong>End Date:</strong>
        </label>
        <input
          type="date"
          id="end-date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>
      <button onClick={handleFetchClick}>Get Log</button>

      {error && <div className="error">{error}</div>}

      {data.totalCredit !== null && data.totalDebit !== null && (
        <div>
          <p>
            <strong>Total Credit:</strong> {data.totalCredit}
          </p>
          <p>
            <strong>Total Debit:</strong> {data.totalDebit}
          </p>
        </div>
      )}
    </div>
  );
};

export default CustomCandDLog;
