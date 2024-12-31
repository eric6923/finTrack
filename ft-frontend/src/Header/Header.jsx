import React, { useEffect, useState } from "react";
import axios from "axios";

const Header = () => {
  const [data, setData] = useState({
    credit: 0,
    debit: 0,
    boxBalance: 0,
    upiBalance: 0,
    due: 0,
    totalBalance: 0,
    totalProfit: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("Token not found");
          return;
        }

        const todayDate = new Date().toISOString().split("T")[0];

        const creditDebitResponse = await axios.get(
          `https://ftbackend.vercel.app/api/user/total?Date=${todayDate}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const balancesResponse = await axios.get(
          "https://ftbackend.vercel.app/api/user/balances",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const profitResponse = await axios.get(
          `https://ftbackend.vercel.app/api/user/profit?date=${todayDate}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setData((prevState) => ({
          ...prevState,
          credit: creditDebitResponse.data.totalCredit,
          debit: creditDebitResponse.data.totalDebit,
          boxBalance: balancesResponse.data.boxBalance,
          upiBalance: balancesResponse.data.accountBalance,
          due: balancesResponse.data.due,
          totalBalance: balancesResponse.data.totalBalance,
          totalProfit: profitResponse.data.adjustedProfit,
        }));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const getItemStyles = (index) => {
    switch (index) {
      case 0: // Credit
        return {
          outline: "2px solid rgba(15, 219, 127, 0.5)",
          bg: "bg-green-100",
          titleColor: "text-green-800",
          valueColor: "text-green-600",
        };
      case 1: // Debit
      case 6: // Due
        return {
          outline: "2px solid rgba(251, 27, 27, 0.5)",
          bg: "bg-red-100",
          titleColor: "text-red-800",
          valueColor: "text-red-600",
        };
      case 2: // Box Balance
        return {
          outline: "2px solid rgba(17, 89, 245, 0.5)",
          bg: "bg-blue-100",
          titleColor: "text-blue-800",
          valueColor: "text-blue-600",
        };
      case 3: // UPI Balance
        return {
          outline: "2px solid rgba(34, 228, 242, 0.5)",
          bg: "bg-cyan-100",
          titleColor: "text-cyan-800",
          valueColor: "text-cyan-600",
        };
      case 4: // Total Balance
        return {
          outline: "2px solid rgba(246, 139, 219, 0.5)",
          bg: "bg-pink-100",
          titleColor: "text-pink-800",
          valueColor: "text-pink-600",
        };
      case 5: // TP
        return {
          outline: "2px solid rgba(15, 219, 127, 0.5)",
          bg: "bg-green-100",
          titleColor: "text-green-800",
          valueColor: "text-green-600",
        };
      default:
        return {
          bg: "bg-gray-100",
          titleColor: "text-gray-800",
          valueColor: "text-gray-600",
        };
    }
  };

  const items = [
    { label: "Today Credit", value: data.credit },
    { label: "Today Debit", value: data.debit },
    { label: "Box Balance", value: data.boxBalance },
    { label: "UPI Balance", value: data.upiBalance },
    { label: "Total Balance", value: data.totalBalance },
    { label: "TP", value: data.totalProfit },
    { label: "Due", value: data.due },
  ];

  return (
    <div className="flex flex-wrap justify-around items-center bg-gray-50 p-4 shadow-md">
      {items.map((item, index) => {
        const styles = getItemStyles(index);
        return (
          <div
            key={index}
            className={`w-40 h-24 ${styles.bg} shadow-lg rounded-lg flex flex-col justify-center items-center m-2 p-4`}
            style={{ outline: styles.outline }}
          >
            <h3 className={`text-lg font-semibold ${styles.titleColor}`}>
              {item.label}
            </h3>
            <p className={`text-2xl font-bold ${styles.valueColor}`}>
              ₹{item.value || 0}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default Header;
