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

        // Set the logs with the payment status
        setLogs(logsWithPaymentStatus);

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

  // Handle full payment and mark as paid
  // const handleFullPayment = async (logId) => {
  //   try {
  //     const token = localStorage.getItem("token");
  //     const response = await axios.post(
  //       `http://localhost:5000/api/user/paylater/${logId}`,
  //       { paymentType: "FULL" },
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );

  //     setLogs((prevLogs) =>
  //       prevLogs.map((log) =>
  //         log.id === logId
  //           ? { ...log, dueAmount: 0, logType: "Paid", isPaid: true }
  //           : log
  //       )
  //     );

  //     localStorage.setItem(`paymentStatus-${logId}`, "paid");
  //     setShowFullPaymentModal(false);
  //     setSuccessMessage(
  //       response.data.message || "Payment marked as paid successfully!"
  //     );
  //   } catch (error) {
  //     console.error("Error making full payment:", error);
  //     alert("Error making full payment");
  //   }
  // };

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
          onClose={() => setSelectedLogForPartialPayment(null)}
        />
      )}

      {selectedLog ? (
        <ViewTransaction log={selectedLog} onClose={closeView} />
      ) : (
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          {" "}
          {/* Added scroll here */}
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Description</th>
                <th className="py-2 px-4 border-b">Log Type</th>
                <th className="py-2 px-4 border-b">Amount</th>
                <th className="py-2 px-4 border-b">Payment Mode</th>
                <th className="py-2 px-4 border-b">Remarks</th>
                <th className="py-2 px-4 border-b">Category</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <React.Fragment key={log.id}>
                  <tr className="hover:bg-gray-100">
                    <td className="py-2 px-4 border-b ">{log.desc}</td>
                    <td className="py-2 px-4 border-b text-center">
                      {log.logType}
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      {log.amount}
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      {log.modeOfPayment}
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      {log.remarks}
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      {log.category?.name || "N/A"}
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      <DropdownMenu
                        onView={() => handleView(log)}
                        onEdit={() => handleEdit(log)}
                        onDelete={() => handleDeleteRequest(log)}
                      />
                    </td>
                  </tr>
                  {log.isPaid && (
                    <tr>
                      <td
                        colSpan="7"
                        className="py-2 px-4 border-b text-green-500 font-bold"
                      >
                        Payment Done!
                      </td>
                    </tr>
                  )}
                  {log.payLater && (
                    <tr>
                      <td colSpan="7" className="py-2 px-4 border-b bg-gray-50">
                        {/* Existing Pay Later Details */}
                        <strong className="block text-lg font-semibold mb-2">
                          Pay Later Details:
                        </strong>
                        {log.payLaterDetails ? (
                          <div className="mt-2">
                            {/* Headers Row */}
                            <div className="flex gap-8 font-bold">
                              <p className="flex-1">FROM</p>
                              <p className="flex-1">TO</p>
                              <p className="flex-1">Bus Name</p>
                              <p className="flex-1">Travel Date</p>
                              <p className="flex-1">COMMISSION</p>
                              <p className="flex-1">COLLECTION</p>
                              <p className="flex-1">DUE</p>
                              <p className="flex-1">REMARKS</p>
                            </div>

                            {/* Values Row */}
                            <div className="flex gap-8">
                              <p className="flex-1">
                                {log.payLaterDetails.from}
                              </p>
                              <p className="flex-1">{log.payLaterDetails.to}</p>
                              <p className="flex-1">
                                {getBusName(log.payLaterDetails.busId)}
                              </p>
                              <p className="flex-1">
                                {new Date(
                                  log.payLaterDetails.travelDate
                                ).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </p>
                              <p className="flex-1 text-center">
                                {log.commission.amount}
                              </p>
                              <p className="flex-1 text-center">
                                {log.collection.amount}
                              </p>
                              <p className="flex-1 ">{log.dueAmount}</p>
                              <p className="flex-1">{log.remarks}</p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-red-500">No details available</p>
                        )}

                        <div className="mt-4">
                          <button
                            className={`${
                              log.isPaid
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-blue-500 hover:bg-blue-700 text-white"
                            } font-bold py-2 px-4 rounded`}
                            onClick={() => setSelectedLogForPartialPayment(log)}
                            disabled={log.isPaid}
                          >
                            Partial Payment
                          </button>
                          <button
                            className={`${
                              log.isPaid
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-green-500 hover:bg-green-700 text-white"
                            } font-bold py-2 px-4 rounded ml-2`}
                            onClick={() => {
                              setSelectedLogForFullPayment(log);
                              setShowFullPaymentModal(true);
                            }}
                            disabled={log.isPaid}
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
                </React.Fragment>
              ))}
            </tbody>
          </table>
          {error && <p className="text-red-500">{error}</p>}
        </div>
      )}
    </div>
  );
};

export default ViewAllLogs;
