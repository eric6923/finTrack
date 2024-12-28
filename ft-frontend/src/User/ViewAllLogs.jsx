import React, { useEffect, useState } from "react";
import axios from "axios";
import DropdownMenu from "./DropdownMenu";
import ViewTransaction from "../3DotFeatures/ViewTransaction";
import PasswordModal from "../3DotFeatures/PasswordModal";
import EditTransaction from "../3DotFeatures/EditTransaction";
import DeleteTransaction from "../3DotFeatures/DeleteTransaction";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import PartialPayment from "../PayLater/PartialPayment"; // Import PartialPayment component
import FullPayment from "../PayLater/FullPayment";

const ViewAllLogs = () => {
  const [logs, setLogs] = useState([]);
  const [busData, setBusData] = useState([]);
  const [error, setError] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedLogForEdit, setSelectedLogForEdit] = useState(null);
  const [selectedLogForDelete, setSelectedLogForDelete] = useState(null);
  const [selectedLogForPartialPayment, setSelectedLogForPartialPayment] =
    useState(null); // Track selected log for partial payment
  const [showFullPaymentModal, setShowFullPaymentModal] = useState(false); // State to control full payment modal
  const [selectedLogForFullPayment, setSelectedLogForFullPayment] =
    useState(null); // Track selected log for full payment
  const history = useNavigate(); // Initialize useNavigate
  const [successMessage, setSuccessMessage] = useState(""); // For full payment success message

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found in local storage");

        const responseLogs = await axios.get(
          "http://localhost:5000/api/user/transactions/",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Merge logs with payment status from localStorage
        const logsWithPaymentStatus = responseLogs.data.map((log) => {
          const isPaid =
            localStorage.getItem(`paymentStatus-${log.id}`) === "paid";
          return { ...log, isPaid };
        });

        const sortedLogs = logsWithPaymentStatus.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        // Set the logs with the payment status
        setLogs(sortedLogs);
        console.log(responseLogs.data);

        const responseBus = await axios.get(
          "http://localhost:5000/api/user/bus",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (responseBus.status === 200 && responseBus.data.length === 0) {
          setError("Please create Bus, Agent, and Operator first.");
        } else {
          setBusData(responseBus.data);
          setError(null); // Clear any previous errors
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          setError("Please create Bus, Agent, and Operator first.");
        } else {
          setError("Error fetching logs or bus data. Please try again.");
        }
        console.error("Error fetching data:", error);
      }
    };

    fetchLogs();
  }, []);

  const getBusName = (busId) => {
    const bus = busData.find((b) => b.id === busId);
    return bus ? bus.name : "Unknown Bus";
  };

  const handleView = async (log) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/user/transaction/${log.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSelectedLog(response.data);
    } catch (error) {
      console.error("Error fetching log details:", error);
    }
  };

  const handleUpdate = (updatedLog) => {
    setLogs((prevLogs) =>
      prevLogs.map((log) => (log.id === updatedLog.id ? updatedLog : log))
    );
  };

  const handleDelete = (logId) => {
    setLogs((prevLogs) => prevLogs.filter((log) => log.id !== logId));
  };

  const closeView = () => {
    setSelectedLog(null);
  };

  const handleEdit = (log) => {
    setSelectedLogForEdit(log);
    setIsPasswordModalOpen(true);
  };

  const handlePasswordVerified = (isValid) => {
    setIsPasswordModalOpen(false);
    if (isValid) {
      setSelectedLogForEdit((log) => {
        const logToEdit = logs.find((l) => l.id === log.id);
        return logToEdit;
      });
    } else {
      alert("Invalid password! Editing not allowed.");
      setSelectedLogForEdit(null);
    }
  };

  const handleDeleteRequest = (log) => {
    setSelectedLogForDelete(log);
  };

  // Handle the updated due amount after partial payment
  const handlePartialPaymentSuccess = (updatedDueAmount, logId) => {
    setLogs((prevLogs) =>
      prevLogs.map((log) =>
        log.id === logId ? { ...log, dueAmount: updatedDueAmount } : log
      )
    );
    setSelectedLogForPartialPayment(null); // Close partial payment form
  };

  const handleFullPaymentSuccess = (updatedDueAmount, logId) => {
    setLogs((prevLogs) =>
      prevLogs.map((log) =>
        log.id === logId
          ? { ...log, dueAmount: 0, logType: "Paid", isPaid: true }
          : log
      )
    );
    setSelectedLogForFullPayment(null); // Close partial payment form
  };

  return (
    <div className="container mx-auto px-4">
      {isPasswordModalOpen && (
        <PasswordModal
          onClose={() => setIsPasswordModalOpen(false)}
          onVerify={(isValid) => handlePasswordVerified(isValid)}
        />
      )}
      {selectedLogForEdit && !isPasswordModalOpen && (
        <EditTransaction
          log={selectedLogForEdit}
          onUpdate={handleUpdate}
          onClose={() => setSelectedLogForEdit(null)}
        />
      )}
      {selectedLogForDelete && (
        <DeleteTransaction
          log={selectedLogForDelete}
          onDelete={handleDelete}
          onClose={() => setSelectedLogForDelete(null)}
        />
      )}

      {/* Inline Partial Payment Form */}
      {selectedLogForPartialPayment && (
        <PartialPayment
          log={selectedLogForPartialPayment}
          onUpdateDueAmount={handlePartialPaymentSuccess}
          onClose={() => setSelectedLogForPartialPayment(null)}
        />
      )}

      {/* Full Payment Modal */}
      {showFullPaymentModal && (
        <FullPayment
          log={selectedLogForFullPayment}
          onUpdateDueAmount={handleFullPaymentSuccess}
          onClose={() => setShowFullPaymentModal(false)} // Correctly reset the modal state
        />
      )}

      {selectedLog ? (
        <ViewTransaction log={selectedLog} onClose={closeView} />
      ) : (
        // Updated table structure for clear log differentiation
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          {error && <p className="text-red-500">{error}</p>}
          <table className="min-w-full bg-white border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="py-3 px-4 border border-gray-300">
                  Description
                </th>
                <th className="py-3 px-4 border border-gray-300">Log Type</th>
                <th className="py-3 px-4 border border-gray-300">Amount</th>
                <th className="py-3 px-4 border border-gray-300">
                  Payment Mode
                </th>
                <th className="py-3 px-4 border border-gray-300">Category</th>
                <th className="py-3 px-4 border border-gray-300">Remarks</th>

                <th className="py-3 px-4 border border-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <React.Fragment key={log.id}>
                  {/* Non-PayLater Log */}
                  <tr className="hover:bg-gray-50 border-t border-gray-300">
                    <td className="py-3 px-4 border border-gray-300">
                      {log.desc}
                    </td>
                    <td className="py-3 px-4 border border-gray-300 text-center">
                      {log.logType}
                    </td>
                    <td className="py-3 px-4 border border-gray-300 text-center">
                      {log.amount}
                    </td>
                    <td className="py-3 px-4 border border-gray-300 text-center">
                      {log.modeOfPayment}
                    </td>
                    <td className="py-3 px-4 border border-gray-300 text-center">
                      {log.category?.name || "N/A"}
                    </td>
                    <td className="py-3 px-4 border border-gray-300 text-center">
                      {log.remarks}
                    </td>

                    <td className="py-3 px-4 border border-gray-300 text-center">
                      <DropdownMenu
                        onView={() => handleView(log)}
                        onEdit={() => handleEdit(log)}
                        onDelete={() => handleDeleteRequest(log)}
                      />
                    </td>
                  </tr>

                  {/* Payment Status */}
                  {log.isPaid && (
                    <tr>
                      <td
                        colSpan="7"
                        className="py-3 px-4 border border-gray-300 bg-green-50 text-green-600 font-semibold text-center"
                      >
                        Payment Done!
                      </td>
                    </tr>
                  )}

                  {/* PayLater Log */}
                  {log.payLater && (
                    <tr>
                      <td colSpan="7" className="py-2 px-4 border-b bg-gray-50">
                        {/* Single Box for "Pay Later Details" */}
                        <div className="bg-blue-100 text-blue-900 font-semibold py-2 px-4 rounded-t">
                          Pay Later Details
                        </div>

                        {/* Headers Row */}
                        <div className="flex gap-8 mt-2 font-bold border-b border-gray-300 pb-2">
                          <p className="flex-1">FROM</p>
                          <p className="flex-1">TO</p>
                          <p className="flex-1">Bus Name</p>
                          <p className="flex-1">Travel Date</p>
                          <p className="flex-1">COMMISSION</p>
                          <p className="flex-1 ml-2">COLLECTION</p>
                          <p className="flex-1">DUE</p>
                          <p className="flex-1">REMARKS</p>
                        </div>

                        {/* Values Row */}
                        {log.payLaterDetails ? (
                          <div className="flex gap-8 mt-2">
                            <p className="flex-1">{log.payLaterDetails.from}</p>
                            <p className="flex-1">{log.payLaterDetails.to}</p>
                            <p className="flex-1">
                              {getBusName(log.payLaterDetails.busId)}
                            </p>
                            <p className="flex-1">
                              {new Date(
                                log.payLaterDetails.travelDate
                              ).toLocaleString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                                hour12: true, // This will display the time in 12-hour format (AM/PM)
                              })}
                            </p>

                            <p className="flex-1 text-center mr-4">
                              {log.commission.amount}
                            </p>
                            <p className="flex-1 text-center mr-4">
                              {log.collection.amount}
                            </p>
                            <p className="flex-1">{log.dueAmount}</p>
                            <p className="flex-1">{log.remarks}</p>
                          </div>
                        ) : (
                          <p className="text-red-500 mt-2">
                            No details available
                          </p>
                        )}

                        {/* Buttons Section */}
                        <div className="mt-4">
                          <button
                            className={`${
                              log.dueAmount === "0"
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-blue-500 hover:bg-blue-700 text-white"
                            } font-bold py-2 px-4 rounded`}
                            onClick={() => setSelectedLogForPartialPayment(log)}
                            disabled={log.dueAmount === "0"}
                          >
                            Partial Payment
                          </button>
                          <button
                            className={`${
                              log.dueAmount === "0"
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-green-500 hover:bg-green-700 text-white"
                            } font-bold py-2 px-4 rounded ml-2`}
                            onClick={() => {
                              setSelectedLogForFullPayment(log);
                              setShowFullPaymentModal(true);
                            }}
                            disabled={log.dueAmount === "0"}
                          >
                            Mark as Paid
                          </button>
                          {log.dueAmount === 0 && (
                            <span className="ml-4 text-green-500 font-semibold">
                              Payment Done!
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td colSpan="7" className="py-3"></td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ViewAllLogs;
