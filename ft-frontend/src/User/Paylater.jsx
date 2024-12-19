import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import DropdownMenu from "./DropdownMenu";
import ViewTransaction from "../3DotFeatures/ViewTransaction";
import PasswordModal from "../3DotFeatures/PasswordModal";
import EditTransaction from "../3DotFeatures/EditTransaction";
import DeleteTransaction from "../3DotFeatures/DeleteTransaction";
import { useNavigate } from "react-router-dom";
import PartialPayment from "../PayLater/PartialPayment";
import BackToHome from "../PayLater/BackToHome";

const PayLater = () => {
  const [logs, setLogs] = useState([]);
  const [agentData, setAgentData] = useState([]);
  const [busData, setBusData] = useState([]);
  const [error, setError] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedLogForEdit, setSelectedLogForEdit] = useState(null);
  const [selectedLogForDelete, setSelectedLogForDelete] = useState(null);
  const [selectedLogForPartialPayment, setSelectedLogForPartialPayment] =
    useState(null);
  const [showFullPaymentModal, setShowFullPaymentModal] = useState(false);
  const [selectedLogForFullPayment, setSelectedLogForFullPayment] =
    useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return { Authorization: `Bearer ${token}` };
  };

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found in local storage");

        const responseLogs = await axios.get(
          "http://localhost:5000/api/user/transactions/",
          { headers: getAuthHeader() }
        );

        const payLaterLogs = responseLogs.data.filter((log) => log.payLater);
        setLogs(payLaterLogs);

        const responseBus = await axios.get(
          "http://localhost:5000/api/user/bus",
          { headers: getAuthHeader() }
        );

        if (responseBus.status === 200 && responseBus.data.length > 0) {
          setBusData(responseBus.data);
          setError(null);
        } else {
          setError(
            "No bus data found. Please create Bus, Agent, and Operator first."
          );
        }
      } catch (error) {
        setError("Error fetching logs or bus data. Please try again.");
        console.error(
          "Error fetching data:",
          error?.response?.data || error.message
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const busMap = useMemo(
    () => new Map(busData.map((bus) => [bus.id, bus.name])),
    [busData]
  );

  const getBusName = (busId) => {
    const busName = busMap.get(busId);
    return busName || "Unknown Bus"; // Fallback for undefined busName
  };

  const handleView = async (log) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/user/transaction/${log.id}`,
        { headers: getAuthHeader() }
      );
      setSelectedLog(response.data);
    } catch (error) {
      console.error(
        "Error fetching log details:",
        error?.response?.data || error.message
      );
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

  const handlePasswordVerified = (isValid) => {
    setIsPasswordModalOpen(false);
    if (!isValid) {
      alert("Invalid password! Editing not allowed.");
      return;
    }
  };

  const handlePartialPaymentSuccess = (updatedDueAmount, logId) => {
    setLogs((prevLogs) =>
      prevLogs.map((log) =>
        log.id === logId ? { ...log, dueAmount: updatedDueAmount } : log
      )
    );
    setSelectedLogForPartialPayment(null);
  };

  const handleFullPayment = async (logId) => {
    try {
      const response = await axios.post(
        `http://localhost:5000/api/user/paylater/${logId}`,
        { paymentType: "FULL" },
        { headers: getAuthHeader() }
      );

      setLogs((prevLogs) =>
        prevLogs.map((log) =>
          log.id === logId
            ? { ...log, dueAmount: 0, logType: "Paid", isPaid: true }
            : log
        )
      );

      setShowFullPaymentModal(false);
      setSuccessMessage("Payment marked as paid successfully!");
    } catch (error) {
      console.error(
        "Error making full payment:",
        error?.response?.data || error.message
      );
      alert("Error making full payment");
    }
  };

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const agentMap = useMemo(
    () => new Map(agentData.map((agent) => [agent.id, agent.name])),
    [agentData]
  );

  const getAgentName = (agentId) => {
    const agentName = agentMap.get(agentId);
    return agentName || "Unknown Agent"; // Fallback for undefined agentName
  };

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const responseAgent = await axios.get(
          "http://localhost:5000/api/user/agent",
          { headers: getAuthHeader() }
        );
        if (responseAgent.status === 200) {
          setAgentData(responseAgent.data);
        }
      } catch (error) {
        console.error(
          "Error fetching agent data:",
          error?.response?.data || error.message
        );
      }
    };

    fetchAgents();
  }, []);

  return (
    <div className="container mx-auto overflow-x-hidden">
      {/* <div className="flex justify-start mb-4">
        <button
          className="bg-blue-500 text-white px-4 py-2 mr-4 rounded hover:bg-blue-600"
          onClick={() => setSelectedLogForPartialPayment(true)}
        >
          Partial Payment
        </button>
        <button
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          onClick={() => setShowFullPaymentModal(true)}
        >
          Full Payment
        </button>
      </div> */}

      <h1 className="text-2xl font-bold mb-4">PayLater Logs</h1>

      {isPasswordModalOpen && (
        <PasswordModal
          onClose={() => setIsPasswordModalOpen(false)}
          onVerify={handlePasswordVerified}
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
      {selectedLogForPartialPayment && (
        <PartialPayment
          log={selectedLogForPartialPayment}
          onUpdateDueAmount={handlePartialPaymentSuccess}
          onClose={() => setSelectedLogForPartialPayment(null)}
        />
      )}
      {showFullPaymentModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h4 className="text-lg font-semibold mb-4">Confirm Full Payment</h4>
            <p className="mb-4">
              Are you sure you want to proceed with the full payment and mark
              this transaction as paid?
            </p>
            <div className="flex justify-around">
              <button
                onClick={() => handleFullPayment(selectedLogForFullPayment.id)}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Yes, Mark as Paid
              </button>
              <button
                onClick={() => setShowFullPaymentModal(false)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div>Loading...</div>
      ) : selectedLog ? (
        <ViewTransaction log={selectedLog} onClose={closeView} />
      ) : (
        <div className="overflow-x-auto">
            <div className="overflow-y-auto max-h-screen">
          <table className="min-w-[1280px] bg-white border border-gray-200">
            <thead>
              <tr>
                {/* <th className="py-2 px-4 border-b">Description</th> */}
                <th className="py-2 px-4 border-b">FROM</th>
                <th className="py-2 px-4 border-b">TO</th>
                <th className="py-2 px-4 border-b">Amount</th>
                {/* <th className="py-2 px-4 border-b">Log Type</th> */}

                <th className="py-2 px-4 border-b">Mode</th>
                <th className="py-2 px-4 border-b">Category</th>
                <th className="py-2 px-4 border-b">Travel Date</th>
                <th className="py-2 px-4 border-b">Bus Name</th>
                <th className="py-2 px-4 border-b">Remarks</th>
                <th className="py-2 px-4 border-b">Agent</th>
                <th className="py-2 px-4 border-b">COMMISSION</th>
                <th className="py-2 px-4 border-b">COLLECTION</th>
                <th className="py-2 px-4 border-b">DUE</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <React.Fragment key={log.id}>
                  <tr className="hover:bg-gray-100">
                    {/* <td className="py-2 px-4 border-b">{log.desc}</td> */}
                    <td className="py-2 px-4 border-b text-center">
                      {log.payLaterDetails?.from}
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      {log.payLaterDetails?.to}
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      {log.amount}
                    </td>
                    {/* <td className="py-2 px-4 border-b text-center">{log.logType}</td> */}

                    <td className="py-2 px-4 border-b text-center">
                      {log.modeOfPayment}
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      {log.category?.name || "Unknown Category"}
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      {log.payLaterDetails?.travelDate &&
                        new Date(
                          log.payLaterDetails.travelDate
                        ).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      {getBusName(log.payLaterDetails?.busId)}
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      {log.remarks}
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      {getAgentName(log.commission?.agentId)}
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      {log.commission?.amount}
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      {log.collection?.amount}
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      {log.dueAmount}
                    </td>
                    <td className="py-2 px-4 border-b">
                      <DropdownMenu
                        onView={() => handleView(log)}
                        onEdit={() => setSelectedLogForEdit(log)}
                        onDelete={() => setSelectedLogForDelete(log)}
                        onPartialPayment={() =>
                          setSelectedLogForPartialPayment(log)
                        }
                        onFullPayment={() => {
                          setSelectedLogForFullPayment(log);
                          setShowFullPaymentModal(true);
                        }}
                        isPaid={log.isPaid}
                      />
                    </td>
                  </tr>
                  {/* Render buttons below each log */}
                  <tr>
                    <td colSpan="14" className="py-2 px-4 text-left bg-gray-50">
                      <button
                        className={`px-4 py-2 mr-2 rounded ${
                          log.isPaid
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-blue-500 text-white hover:bg-blue-600"
                        }`}
                        onClick={() => setSelectedLogForPartialPayment(log)}
                        disabled={log.isPaid}
                      >
                        Partial Payment
                      </button>
                      <button
                        className={`px-4 py-2 rounded ${
                          log.isPaid
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-green-500 text-white hover:bg-green-600"
                        }`}
                        onClick={() => {
                          setSelectedLogForFullPayment(log);
                          setShowFullPaymentModal(true);
                        }}
                        disabled={log.isPaid}
                      >
                        Full Payment
                      </button>
                    </td>
                  </tr>
                  ;
                  {log.payLater && (
                    <tr>
                      <td
                        colSpan="14"
                        className="p-2 bg-yellow-100 border border-yellow-400 text-center"
                      >
                        Due Amount: {log.dueAmount}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {error && <div className="text-red-500 text-center my-4">{error}</div>}
      {successMessage && (
        <div className="text-green-500 text-center my-4">{successMessage}</div>
      )}
    </div>
  );
};

export default PayLater;
