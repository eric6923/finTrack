import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Custom() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const today = new Date();

  const formatDate = (date) => date.toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(formatDate(yesterday));
  const [endDate, setEndDate] = useState(formatDate(today));
  const [logs, setLogs] = useState([]);
  const [busData, setBusData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [agents, setAgents] = useState([]);
  const [operators, setOperators] = useState([]); // State for operators
  const [error, setError] = useState(null);

  // Filter state
  const [filters, setFilters] = useState({
    modeOfPayment: "",
    payLater: null,
    busName: "",
    category: "",
    logType: "",
    agentName: "",
    operatorName: "", // Add operatorName to filters
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Authentication token is missing. Please log in.");
          return;
        }

        // Fetch transaction logs
        const logsResponse = await axios.get(
          `http://localhost:5000/api/user/transaction?startDate=${startDate}&endDate=${endDate}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setLogs(logsResponse.data);
        console.log(logsResponse.data);

        // Fetch bus data
        const busResponse = await axios.get(
          "http://localhost:5000/api/user/bus",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setBusData(busResponse.data);

        // Fetch categories
        const categoriesResponse = await axios.get(
          "http://localhost:5000/api/user/category/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setCategories(categoriesResponse.data);
        console.log(
          "Categories:",
          categoriesResponse.data.map((category) => category.name)
        ); // Log category names

        // Fetch agents
        const agentsResponse = await axios.get(
          "http://localhost:5000/api/user/agent",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setAgents(agentsResponse.data);
        console.log(
          "Agents:",
          agentsResponse.data.map((agent) => agent.name)
        ); // Log agent names

        // Fetch operators
        const operatorsResponse = await axios.get(
          "http://localhost:5000/api/user/operator",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setOperators(operatorsResponse.data);
        console.log(
          "Operators:",
          operatorsResponse.data.map((operator) => operator.name)
        ); // Log operator names// Set operators list
      } catch (err) {
        // setError("Error fetching data. Please try again.");
      }
    };

    fetchData();
  }, [startDate, endDate]);

  const handleFilterChange = (e) => {
    const { name, type, value, checked } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value, // Correctly set value for non-checkbox inputs
    }));
  };

  const applyFilters = async () => {
    try {
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token is missing. Please log in.");
        return;
      }

      // Construct query parameters from filters
      const queryParams = new URLSearchParams({
        ...(filters.modeOfPayment && { modeOfPayment: filters.modeOfPayment }),
        ...(filters.busName && { busName: filters.busName }),
        ...(filters.category && { category: filters.category }),
        ...(filters.logType && { logType: filters.logType }),
        ...(filters.agentName && { agentName: filters.agentName }),
        ...(filters.operatorName && { operatorName: filters.operatorName }),
      }).toString();

      // Fetch filtered logs from the server
      const response = await axios.get(
        `http://localhost:5000/api/user/filter-transaction?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      let filteredLogs = response.data;

      if (filters.payLater && filters.others) {
        filteredLogs = filteredLogs.filter(
          (log) =>
            log.logType === "CREDIT" && // Include credit logs
            log.payLater === true // Include logs with payLater true
        );
      } else if (filters.payLater) {
        filteredLogs = filteredLogs.filter((log) => log.payLater === true);
      } else if (filters.others) {
        filteredLogs = filteredLogs.filter(
          (log) =>
            log.logType === "CREDIT" && // Include credit logs
            (!log.payLater || log.payLater === false) // Exclude logs with payLater true
        );
      }

      // Update the logs state
      setLogs(filteredLogs);
      console.log("Filtered Logs:", filteredLogs);
    } catch (err) {
      setError("Error applying filters. Please try again.");
      console.error(err);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold mb-4">Reports</h1>
      <div className="flex gap-4 items-center mb-4">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border border-gray-300 p-2 rounded-md"
        />
        <span className="text-gray-500">to</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border border-gray-300 p-2 rounded-md"
        />
      </div>

      {/* Filter Section */}
      {/* Updated Filter Section with Styles and Ordering */}
      <div className="flex flex-wrap gap-4 mb-6">
      <div>
          <label className="block mb-1 font-medium">Log Type:</label>
          <select
            name="logType"
            value={filters.logType}
            onChange={handleFilterChange}
            className=" border border-gray-300 p-2 rounded-md"
          >
            <option value="">All Log Types</option>
            <option value="CREDIT">Credit</option>
            <option value="DEBIT">Debit</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium ">Mode of Payment:</label>
          <select
            name="modeOfPayment"
            value={filters.modeOfPayment}
            onChange={handleFilterChange}
            className="border border-gray-300 p-2 rounded-md w-40"
          >
            <option value="">All Modes</option>
            <option value="CASH">CASH</option>
            <option value="UPI">UPI</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">Category:</label>
          <select
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            className="border border-gray-300 p-2 rounded-md"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">Type:</label>
          <select
            name="operatorName"
            value={filters.operatorName}
            onChange={handleFilterChange}
            className="border border-gray-300 p-2 rounded-md"
          >
            <option value="">All Types</option>
            {operators.map((operator) => (
              <option key={operator.id} value={operator.name}>
                {operator.name}
              </option>
            ))}
          </select>
        </div>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block mb-1 font-medium">Agent Name:</label>
          <select
            name="agentName"
            value={filters.agentName}
            onChange={handleFilterChange}
            className="border border-gray-300 p-2 rounded-md"
          >
            <option value="">All Agents</option>
            {agents.map((agent) => (
              <option key={agent.id} value={agent.name}>
                {agent.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="payLater"
            checked={filters.payLater === true}
            onChange={handleFilterChange}
            className="mr-2"
          />
          <label className="font-medium">Pay Later</label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="others"
            checked={filters.others || false}
            onChange={handleFilterChange}
            className="mr-2"
          />
          <label className="font-medium">Others</label>
        </div>

        <div>
          <label className="block mb-1 font-medium">Bus Name:</label>
          <select
            name="busName"
            value={filters.busName}
            onChange={handleFilterChange}
            className="border border-gray-300 p-2 w-40 rounded-md"
          >
            <option value="">All Buses</option>
            {busData.map((bus) => (
              <option key={bus.id} value={bus.name}>
                {bus.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-start">
          <button
            onClick={applyFilters}
            className="bg-blue-500 text-white w-full lg:w-auto px-6 py-3 rounded-lg shadow-md hover:bg-blue-600 hover:shadow-lg transition duration-200"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="py-2 px- border-b">Description</th>
              <th className="py-2 px- border-b">Log Type</th>
              <th className="py-2 px-4 border-b">Amount</th>
              <th className="py-2 px-4 border-b">Payment Mode</th>
              <th className="py-2 px-4 border-b">Remarks</th>
              <th className="py-2 px-4 border-b">Category</th>
              {filters.payLater && (
                <>
                  <th className="py-2 px-4 border-b">FROM</th>
                  <th className="py-2 px-4 border-b">TO</th>
                  <th className="py-2 px-4 border-b">Bus Name</th>
                  <th className="py-2 px-4 border-b">Travel Date</th>
                  <th className="py-2 px-4 border-b">COMMISSION</th>
                  <th className="py-2 px-4 border-b">COLLECTION</th>
                  <th className="py-2 px-4 border-b">DUE</th>
                  
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td
                  colSpan={
                    filters.payLater
                      ? 14 // Total number of columns when Pay Later is selected
                      : 6 // Total number of columns otherwise
                  }
                  className="py-4 px-4 text-center text-gray-500"
                >
                  No logs found.
                </td>
              </tr>
            ) : (
              logs.map((log) => {
                const busName =
                  busData.find((bus) => bus.id === log.payLaterDetails?.busId)
                    ?.name || "N/A";

                const travelDate = log.payLaterDetails?.travelDate
                  ? new Date(
                      log.payLaterDetails.travelDate
                    ).toLocaleDateString()
                  : "N/A";

                return (
                  <tr
                    key={log.id}
                    className="hover:bg-gray-100 transition duration-150"
                  >
                    <td className="py-2 px-4 border-b text-center">
                      {log.desc}
                    </td>
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
                      {log.category?.name}
                    </td>
                    {filters.payLater && (
                      <>
                        <td className="py-2 px-4 border-b text-center">
                          {log.payLaterDetails?.from || "N/A"}
                        </td>
                        <td className="py-2 px-4 border-b text-center">
                          {log.payLaterDetails?.to || "N/A"}
                        </td>
                        <td className="py-2 px-4 border-b text-center">
                          {busName}
                        </td>
                        <td className="py-2 px-4 border-b text-center">
                          {travelDate}
                        </td>
                        <td className="py-2 px-4 border-b text-center">
                          {log.commission?.amount || "N/A"}
                        </td>
                        <td className="py-2 px-4 border-b text-center">
                          {log.collection?.amount || "N/A"}
                        </td>
                        <td className="py-2 px-4 border-b text-center">
                          {log.dueAmount || "N/A"}
                        </td>
                        
                      </>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
