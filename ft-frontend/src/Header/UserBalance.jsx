import React, { useEffect, useState } from "react";
import axios from "axios";

const UserBalance = () => {
  const [balanceData, setBalanceData] = useState({
    boxBalance: null,
    accountBalance: null,
    totalBalance: null,
    due: null,
  });
  const [error, setError] = useState("");

  const fetchUserBalance = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Token not found. Please login again.");
      return;
    }

    try {
      const response = await axios.get("http://localhost:5000/api/user/balances", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setBalanceData({
        boxBalance: response.data.boxBalance,
        accountBalance: response.data.accountBalance,
        totalBalance: response.data.totalBalance,
        due: response.data.due,
      });
      setError("");
    } catch (err) {
      setError("Failed to fetch user balance data. Please try again later.");
    }
  };

  useEffect(() => {
    fetchUserBalance();
  }, []);

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="user-balance">
      <h1>User Balance</h1>
      {balanceData.boxBalance !== null &&
      balanceData.accountBalance !== null &&
      balanceData.totalBalance !== null &&
      balanceData.due !== null ? (
        <div>
          <p><strong>Box Balance:</strong> {balanceData.boxBalance}</p>
          <p><strong>Account Balance:</strong> {balanceData.accountBalance}</p>
          <p><strong>Total Balance:</strong> {balanceData.totalBalance}</p>
          <p><strong>Due:</strong> {balanceData.due}</p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default UserBalance;
