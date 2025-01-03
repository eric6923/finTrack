import React, { useState, useEffect } from "react";
import axios from "axios";

const EditTransaction = ({ log, onClose, onUpdate }) => {
  const [editedLog, setEditedLog] = useState({
    ...log,
    password: "",
    transaction: {
      desc: log.desc,
      amount: log.amount,
      modeOfPayment: log.modeOfPayment,
      categoryId: log.categoryId,
      remarks: log.remarks,
      payLater: log.payLater,
      transactionNo: log.transactionNo || "",
      payLaterDetails: log.payLaterDetails || {
        busId: log.payLaterDetails?.busId
          ? parseInt(log.payLaterDetails.busId, 10)
          : "",
        operatorId: log.payLaterDetails?.operatorId || "",
        agentId: log.payLaterDetails?.agentId || "",
        type: log.payLaterDetails?.type || "",
        from: log.payLaterDetails?.from || "",
        to: log.payLaterDetails?.to || "",
        travelDate: log.payLaterDetails?.travelDate || "",
      },
      commission: log.commission || {},
      collection: log.collection || {},
    },
  });

  const [buses, setBuses] = useState([]);
  const [agents, setAgents] = useState([]);
  const [operators, setOperators] = useState([]);
  const [categories, setCategories] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch categories, buses, agents, and operators
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        const [categoryRes, busRes, agentRes, operatorRes] = await Promise.all([
          axios.get("https://ftbackend.vercel.app/api/user/category/", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("https://ftbackend.vercel.app/api/user/bus", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("https://ftbackend.vercel.app/api/user/agent", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("https://ftbackend.vercel.app/api/user/operator", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setCategories(categoryRes.data);
        setBuses(busRes.data);
        setAgents(agentRes.data);
        setOperators(operatorRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        setErrorMessage("Failed to load data. Please try again.");
      }
    };

    fetchData();
  }, []);

  // Handle input changes
  const handleChange = (field, value) => {
    if (field === "password") {
      setEditedLog({ ...editedLog, password: value });
    } else if (field.startsWith("payLaterDetails.")) {
      const payLaterField = field.split(".")[1];
      setEditedLog({
        ...editedLog,
        transaction: {
          ...editedLog.transaction,
          payLaterDetails: {
            ...editedLog.transaction.payLaterDetails,
            [payLaterField]: ["busId"].includes(payLaterField)
              ? parseInt(value, 10)
              : value,
          },
        },
      });
    } else if (field.startsWith("commission.")) {
      const commissionField = field.split(".")[1];
      setEditedLog({
        ...editedLog,
        transaction: {
          ...editedLog.transaction,
          commission: {
            ...editedLog.transaction.commission,
            [commissionField]:
              commissionField === "agentId" ? parseInt(value, 10) : value,
          },
        },
      });
    } else if (field.startsWith("collection.")) {
      const collectionField = field.split(".")[1];
      setEditedLog({
        ...editedLog,
        transaction: {
          ...editedLog.transaction,
          collection: {
            ...editedLog.transaction.collection,
            [collectionField]:
              collectionField === "operatorId" ? parseInt(value, 10) : value,
          },
        },
      });
    } else {
      setEditedLog({
        ...editedLog,
        transaction: { ...editedLog.transaction, [field]: value },
      });
    }
  };

  // Submit the updated transaction
  // Submit the updated transaction
  const handleSubmit = async () => {
    try {
      // Create a sanitized copy of the transaction data
      const sanitizedData = {
        desc: editedLog.transaction.desc,
        amount: parseFloat(editedLog.transaction.amount),
        modeOfPayment: editedLog.transaction.modeOfPayment,
        categoryId: parseInt(editedLog.transaction.categoryId, 10),
        remarks: editedLog.transaction.remarks,
        payLater: editedLog.transaction.payLater
      };
  
      // Handle commission if it exists
      if (editedLog.transaction.commission?.agentId) {
        sanitizedData.commission = {
          agentId: parseInt(editedLog.transaction.commission.agentId, 10),
          amount: parseFloat(editedLog.transaction.commission.amount)
        };
      }
  
      // Handle collection if it exists
      if (editedLog.transaction.collection?.operatorId) {
        sanitizedData.collection = {
          operatorId: parseInt(editedLog.transaction.collection.operatorId, 10),
          amount: parseFloat(editedLog.transaction.collection.amount)
        };
      }
  
      // Handle payLater details if payLater is true
      if (sanitizedData.payLater) {
        sanitizedData.payLaterDetails = {
          busId: parseInt(editedLog.transaction.payLaterDetails.busId, 10),
          from: editedLog.transaction.payLaterDetails.from,
          to: editedLog.transaction.payLaterDetails.to
        };
  
        // Only include travelDate if it exists and is valid
        if (editedLog.transaction.payLaterDetails.travelDate) {
          sanitizedData.payLaterDetails.travelDate = 
            editedLog.transaction.payLaterDetails.travelDate;
        }
      }
  
      // Add transaction number only for non-cash payments
      if (sanitizedData.modeOfPayment !== "CASH" && editedLog.transaction.transactionNo) {
        sanitizedData.transactionNo = editedLog.transaction.transactionNo;
      }
  
      console.log("Sending sanitized data:", sanitizedData);
      const token = localStorage.getItem("token");
  
      const response = await axios.put(
        `https://ftbackend.vercel.app/api/user/transaction/${log.id}`,
        { 
          password: editedLog.password, 
          transaction: sanitizedData 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      console.log("Updated transaction:", response.data);
      onUpdate(response.data.updatedTransaction);
      onClose();
      window.location.reload();
    } catch (error) {
      console.error("Error updating transaction:", error);
      if (error.response) {
        // Log the detailed error response
        console.error("Error details:", error.response.data);
        setErrorMessage(error.response.data.message || "Failed to update transaction. Please try again.");
      } else {
        setErrorMessage("Failed to update transaction. Please try again.");
      }
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-200 max-w-4xl">
        <h2 className="text-xl font-semibold mb-4">Edit Transaction</h2>

        <div className="grid grid-cols-4 gap-4">
          {/* Editable Fields */}
          <div className="col-span-2 mb-4">
            <label className="block font-medium mb-1">Password:</label>
            <input
              type="password"
              value={editedLog.password}
              onChange={(e) => handleChange("password", e.target.value)}
              className="w-full border rounded p-2"
              placeholder="Enter your password"
            />
          </div>

          {/* Editable Fields */}
          <div className="mb-4">
            <label className="block font-medium mb-1">Description:</label>
            <input
              type="text"
              value={editedLog.transaction.desc}
              onChange={(e) => handleChange("desc", e.target.value)}
              className="w-full border rounded p-2"
            />
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-1">Amount:</label>
            <input
              type="number"
              value={editedLog.transaction.amount}
              onChange={(e) => handleChange("amount", e.target.value)}
              className="w-full border rounded p-2"
            />
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-1">Mode of Payment:</label>
            <select
              value={editedLog.transaction.modeOfPayment}
              onChange={(e) => handleChange("modeOfPayment", e.target.value)}
              className="w-full border rounded p-2"
            >
              <option value="CASH">Cash</option>
              {/* <option value="CARD">Card</option> */}
              <option value="UPI">UPI</option>
            </select>
          </div>

          {/* Transaction No for UPI */}
          {editedLog.transaction.modeOfPayment === "UPI" && (
            <div className="mb-4">
              <label className="block font-medium mb-1">Transaction No:</label>
              <input
                type="text"
                value={editedLog.transaction.transactionNo}
                onChange={(e) => handleChange("transactionNo", e.target.value)}
                className="w-full border rounded p-2"
              />
            </div>
          )}

          <div className="mb-4">
            <label className="block font-medium mb-1">Category:</label>
            <select
              value={editedLog.transaction.categoryId}
              onChange={(e) =>
                handleChange("categoryId", parseInt(e.target.value, 10))
              }
              className="w-full border rounded p-2"
            >
              <option value="" disabled>
                Select a category
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-2 mb-4">
            <label className="block font-medium mb-1">Remarks:</label>
            <textarea
              value={editedLog.transaction.remarks}
              onChange={(e) => handleChange("remarks", e.target.value)}
              className="w-full border rounded p-2"
            ></textarea>
          </div>

          {/* Conditionally render Bus, Agent, and Operator fields based on payLater */}
          {editedLog.transaction.payLater && (
            <>
              <div className="mb-4">
                <label className="block font-medium mb-1">Bus:</label>
                <select
                  value={editedLog.transaction.payLaterDetails?.busId || ""}
                  onChange={(e) =>
                    handleChange("payLaterDetails.busId", e.target.value)
                  }
                  className="w-full border rounded p-2"
                >
                  <option value="" disabled>
                    Select a bus
                  </option>
                  {buses.map((bus) => (
                    <option key={bus.id} value={bus.id}>
                      {bus.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block font-medium mb-1">Agent:</label>
                <select
                  value={editedLog.transaction.commission?.agentId || ""}
                  onChange={(e) =>
                    handleChange("commission.agentId", e.target.value)
                  }
                  className="w-full border rounded p-2"
                  disabled={!editedLog.transaction.commission}
                >
                  <option value="" disabled>
                    Select an agent
                  </option>
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block font-medium mb-1">Operator:</label>
                <select
                  value={editedLog.transaction.collection?.operatorId || ""}
                  onChange={(e) =>
                    handleChange("collection.operatorId", e.target.value)
                  }
                  className="w-full border rounded p-2"
                  disabled={!editedLog.transaction.collection}
                >
                  <option value="" disabled>
                    Select an operator
                  </option>
                  {operators.map((operator) => (
                    <option key={operator.id} value={operator.id}>
                      {operator.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>
        {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-700 rounded py-2 px-4 mr-2"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-blue-500 text-white rounded py-2 px-4"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditTransaction;
