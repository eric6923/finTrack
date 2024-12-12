// Import React and useEffect, useState for API calls
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Header = () => {
  const [data, setData] = useState({
    credit: 0,
    debit: 0,
    boxBalance: 0,
    upiBalance: 0,
    due: 0,
    totalBalance: 0,
    totalProfit: 0, // Add state for total profit
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('Token not found');
          return;
        }

        // Get today's date dynamically
        const todayDate = new Date().toISOString().split('T')[0];

        // Fetch credit and debit data
        const creditDebitResponse = await axios.get(
          `http://localhost:5000/api/user/total?Date=${todayDate}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Fetch balances data
        const balancesResponse = await axios.get(
          'http://localhost:5000/api/user/balances',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Fetch total profit data
        const profitResponse = await axios.get(
          `http://localhost:5000/api/user/profit?date=${todayDate}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Update state with API response data
        setData((prevState) => ({
          ...prevState,
          credit: creditDebitResponse.data.totalCredit,
          debit: creditDebitResponse.data.totalDebit,
          boxBalance: balancesResponse.data.boxBalance,
          upiBalance: balancesResponse.data.accountBalance,
          due: balancesResponse.data.due,
          totalBalance: balancesResponse.data.totalBalance,
          totalProfit: profitResponse.data.totalProfit, // Update total profit
        }));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []); // Empty dependency array ensures the fetch happens only on initial render

  const items = [
    { label: 'Credit', value: data.credit },
    { label: 'Debit', value: data.debit },
    { label: 'Box Balance', value: data.boxBalance },
    { label: 'UPI Balance', value: data.upiBalance },
    { label: 'Total Balance', value: data.totalBalance },
    { label: 'TP', value: data.totalProfit }, // New TP box
    { label: 'Due', value: data.due },
  ];

  return (
    <div className="flex flex-wrap justify-around items-center bg-gray-50 p-4 shadow-md">
      {items.map((item, index) => (
        <div
          key={index}
          className="w-40 h-24 bg-white shadow-lg rounded-lg flex flex-col justify-center items-center m-2 p-4 border border-gray-200"
        >
          <h3 className="text-lg font-bold text-gray-700">{item.label}</h3>
          <p className="text-sm text-gray-500">{item.value}</p>
        </div>
      ))}
    </div>
  );
};

export default Header;
