import React, { useState } from "react";
import axios from "axios";

const FullPayment = ({ log, onUpdateDueAmount, onClose }) => {
  const [modeOfPayment, setModeOfPayment] = useState("CASH");
  const [transactionNumber, setTransactionNumber] = useState("");
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFullPayment = async () => {
    if (!log.id) {
      setError("Log ID is missing.");
      return;
    }

    const paymentData = {
      paymentType: "FULL",
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
      onUpdateDueAmount(remainingDue, log.id); // Update the parent with the new due amount
      window.location.reload();
      onClose(); // Close the modal
    } catch (error) {
      setError("Error making full payment. Please try again.");
      console.error("Full payment error:", error.response || error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
        <h3 className="text-lg font-bold mb-4">Full Payment</h3>
        {error && <p className="text-red-500 mb-2">{error}</p>}

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
            onClick={onClose} // This should close the modal
            className="px-4 py-2 rounded bg-gray-300 text-gray-700 hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleFullPayment}
            disabled={isSubmitting || log.dueAmount === 0} // Disable button if dueAmount is 0
            className={`px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 ${
              isSubmitting || log.dueAmount === 0
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            {isSubmitting ? "Submitting..." : "Submit Payment"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FullPayment;
