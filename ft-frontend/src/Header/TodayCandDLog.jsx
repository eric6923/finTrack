import React, { useState, useEffect } from "react";
import axios from "axios";

const TodayCandDLog = () => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0] // Default to today's date
  );
  const [data, setData] = useState({ totalCredit: null, totalDebit: null });
  const [error, setError] = useState("");

  const fetchDateData = async (date) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Token not found. Please login again.");
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:5000/api/user/total?Date=${date}`,
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
      setError("Failed to fetch data for the selected date. Please try again later.");
    }
  };

  useEffect(() => {
    fetchDateData(selectedDate); // Fetch data for the default date (today) on initial render
  }, [selectedDate]);

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value); // Update the selected date
  };

  return (
    <div className="date-log">
      <h1>Credit and Debit Log</h1>
      <label htmlFor="date-picker"><strong>Select Date:</strong></label>
      <input
        type="date"
        id="date-picker"
        value={selectedDate}
        onChange={handleDateChange}
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

export default TodayCandDLog;
