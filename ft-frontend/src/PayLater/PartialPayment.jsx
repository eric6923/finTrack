import React, { useState } from "react";
import axios from "axios";

const PartialPayment = ({ log, onUpdateDueAmount, onClose, dueAmount }) => {
  const [operatorAmount, setOperatorAmount] = useState(0);
  const [agentAmount, setAgentAmount] = useState(0);
  const [modeOfPayment, setModeOfPayment] = useState("CASH");
  const [transactionNumber, setTransactionNumber] = useState("");

  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePayment = async () => {
    if (!log.id) {
      setError("Log ID is missing.");
      return;
    }

    const paymentData = {
      paymentType: "PARTIAL",
      operatorAmount: Number(operatorAmount), // Convert to number
      agentAmount: Number(agentAmount),
      modeOfPayment,
      ...(modeOfPayment === "UPI" && { transactionNumber }),
    };

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `https://ftbackend.vercel.app/api/user/paylater/${log.id}`,
        paymentData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const remainingDue = response.data.remainingDue;
      console.log("Log object:", log);
      console.log("Commission value:", log?.commission);

      onUpdateDueAmount(remainingDue, log.id); // Update the parent with the new due amount
      window.location.reload();
      onClose(); // Close the modal
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Error making partial payment. Please try again.";
      setError(errorMessage); // Set the error message from the response, if available
      console.error("Partial payment error:", error.response || error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
        <h3 className="text-lg font-bold mb-4">Partial Payment</h3>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Operator Amount
          </label>
          <input
            type="number"
            value={operatorAmount}
            onChange={(e) =>
              setOperatorAmount(e.target.value.replace(/^0+/, "") || "0")
            } // Prevent leading zeros
            className="w-full border rounded px-3 py-2 mt-1"
            placeholder="Enter Operator Amount"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Agent Amount
          </label>
          <input
            type="number"
            value={agentAmount}
            onChange={(e) =>
              setAgentAmount(e.target.value.replace(/^0+/, "") || "0")
            } // Prevent leading zeros
            className="w-full border rounded px-3 py-2 mt-1"
            placeholder="Enter Agent Amount"
            // disabled={log?.commission === null}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Mode of Payment
          </label>
          <select
            value={modeOfPayment}
            onChange={(e) => setModeOfPayment(e.target.value)}
            className="w-full border rounded px-3 py-2 mt-1"
          >
            <option value="CASH">CASH</option>
            <option value="UPI">UPI</option>
          </select>
        </div>

        {modeOfPayment === "UPI" && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Transaction Number
            </label>
            <input
              type="text"
              value={transactionNumber}
              onChange={(e) => setTransactionNumber(e.target.value)}
              className="w-full border rounded px-3 py-2 mt-1"
              placeholder="Enter Transaction Number"
            />
          </div>
        )}

        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-300 text-gray-700 hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handlePayment}
            className={`px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 ${
              isSubmitting || dueAmount === 0
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
            disabled={isSubmitting || dueAmount === 0} // Disable button if dueAmount is 0
          >
            {isSubmitting ? "Submitting..." : "Submit Payment"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PartialPayment;
