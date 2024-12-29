import React, { useEffect, useState } from "react";

const UserBalance = () => {
  const [balances, setBalances] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Get the token from localStorage
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Token not found");
      setLoading(false);
      return;
    }

    // Fetch balance data from the API
    const fetchBalances = async () => {
      try {
        const response = await fetch(
          "https://ftbackend.vercel.app/api/user/balances",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`, // Include token in the Authorization header
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch balances");
        }
        const data = await response.json();
        setBalances(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBalances();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="balance-container">
      <div className="balance-box">
        <h3>Box Balance</h3>
        <p>{balances.boxBalance}</p>
      </div>
      <div className="balance-box">
        <h3>Account Balance</h3>
        <p>{balances.accountBalance}</p>
      </div>
      <div className="balance-box">
        <h3>Total Balance</h3>
        <p>{balances.totalBalance}</p>
      </div>
      <div className="balance-box">
        <h3>Due</h3>
        <p>{balances.due}</p>
      </div>
    </div>
  );
};

export default UserBalance;
