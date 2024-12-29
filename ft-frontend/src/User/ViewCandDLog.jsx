import React, { useEffect, useState } from "react";
import axios from "axios";

const ViewCandDLog = () => {
  const [data, setData] = useState({ totalCredit: null, totalDebit: null });
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token"); // Fetch token from local storage
      if (!token) {
        setError("Token not found. Please login again.");
        return;
      }

      try {
        const response = await axios.get(
          "https://ftbackend.vercel.app/api/user/total",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setData({
          totalCredit: response.data.totalCredit,
          totalDebit: response.data.totalDebit,
        });
      } catch (err) {
        setError("Failed to fetch data. Please try again later.");
      }
    };

    fetchData();
  }, []);

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="view-log">
      <h1>Credit and Debit Log</h1>
      {data.totalCredit !== null && data.totalDebit !== null ? (
        <div>
          <p>
            <strong>Total Credit:</strong> {data.totalCredit}
          </p>
          <p>
            <strong>Total Debit:</strong> {data.totalDebit}
          </p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default ViewCandDLog;
