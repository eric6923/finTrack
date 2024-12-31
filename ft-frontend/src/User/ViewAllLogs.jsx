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
          "https://ftbackend.vercel.app/api/user/transactions/",
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
          "https://ftbackend.vercel.app/api/user/bus",
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
        `https://ftbackend.vercel.app/api/user/transaction/${log.id}`,
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
                  {/* Main Log Row */}
                  <tr className="hover:bg-gray-50 border-t border-gray-300">
                    <td className="py-4 px-4 border-l border-r border-gray-300 bg-white">
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            log.logType === "CREDIT"
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                        ></div>
                        <span>{log.desc}</span>
                      </div>
                    </td>
                    <td
                      className={`py-4 px-4 border border-gray-300 text-center font-medium ${
                        (console.log("LogType:", log.logType),
                        log.logType === "CREDIT"
                          ? "text-green-600"
                          : "text-red-600")
                      }`}
                    >
                      {log.logType}
                    </td>
                    <td className="py-4 px-4 border border-gray-300 text-center font-semibold">
                      ₹{log.amount}
                    </td>
                    <td className="py-4 px-4 border border-gray-300 text-center">
                      <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                        {log.modeOfPayment}
                      </span>
                    </td>
                    <td className="py-4 px-4 border border-gray-300 text-center">
                      <span className="px-3 py-1 rounded-full text-sm bg-gray-100">
                        {log.category?.name || "N/A"}
                      </span>
                    </td>
                    <td className="py-4 px-4 border border-gray-300 text-center">
                      {log.remarks}
                    </td>
                    <td className="py-4 px-4 border border-gray-300 text-center">
                      <DropdownMenu
                        onView={() => handleView(log)}
                        onEdit={() => handleEdit(log)}
                        onDelete={() => handleDeleteRequest(log)}
                      />
                    </td>
                  </tr>

                  {/* Pay Later Details Row */}
                  {log.payLater && (
                    <tr>
                      <td
                        colSpan="7"
                        className="py-2 px-4 border-x border-b border-gray-300"
                      >
                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
                          {/* Pay Later Header */}
                          <div className="flex items-center space-x-2 mb-4">
                            <svg
                              className="w-5 h-5 text-blue-600"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <h3 className="text-lg font-semibold text-blue-900">
                              Pay Later Details
                            </h3>
                          </div>

                          {/* Pay Later Content Grid */}
                          {log.payLaterDetails ? (
                            <div className="bg-white rounded-lg p-4 mb-4">
                              <div className="grid grid-cols-8 gap-4 mb-2 font-semibold text-gray-600">
                                <div>FROM</div>
                                <div>TO</div>
                                <div>BUS NAME</div>
                                <div>TRAVEL DATE</div>
                                <div>COMMISSION</div>
                                <div>COLLECTION</div>
                                <div>DUE</div>
                                <div>REMARKS</div>
                              </div>
                              <div className="grid grid-cols-8 gap-4 text-gray-800">
                                <div>{log.payLaterDetails.from}</div>
                                <div>{log.payLaterDetails.to}</div>
                                <div className="ml-4">
                                  {getBusName(log.payLaterDetails.busId)}
                                </div>
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
                                <div className="ml-8">₹{log.commission?.remainingDue || 0}</div>
                                <div className="ml-6">₹{log.collection?.remainingDue || 0}</div>
                                <div className="font-medium text-red-600">
                                  ₹{log.dueAmount}
                                </div>
                                <div className="ml-4">{log.remarks}</div>
                              </div>
                            </div>
                          ) : (
                            <p className="text-red-500">No details available</p>
                          )}

                          {/* Payment Actions */}
                          <div className="flex space-x-3">
                            <button
                              className={`flex items-center px-4 py-2 rounded-lg ${
                                log.dueAmount === "0"
                                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                  : "bg-blue-500 hover:bg-blue-700 text-white"
                              }`}
                              onClick={() =>
                                setSelectedLogForPartialPayment(log)
                              }
                              disabled={log.dueAmount === "0"}
                            >
                              <span>Partial Payment</span>
                            </button>
                            <button
                              className={`flex items-center px-4 py-2 rounded-lg ${
                                log.dueAmount === "0"
                                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                  : "bg-green-500 hover:bg-green-700 text-white"
                              }`}
                              onClick={() => {
                                setSelectedLogForFullPayment(log);
                                setShowFullPaymentModal(true);
                              }}
                              disabled={log.dueAmount === "0"}
                            >
                              <span>Mark as Paid</span>
                            </button>
                            {log.dueAmount === "0" && (
                              <span className="inline-flex items-center px-4 py-2 bg-green-50 text-green-700 rounded-lg">
                                <svg
                                  className="w-5 h-5 mr-2"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                Payment Done!
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* Spacer Row */}
                  <tr>
                    <td colSpan="7" className="h-4 border-none bg-gray-50"></td>
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
