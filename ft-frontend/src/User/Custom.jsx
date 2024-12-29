import React, { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
export default function Custom({ logType }) {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const today = new Date();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [totals, setTotals] = useState({ totalCredit: 0, totalDebit: 0 });
  const closeDialog = () => setDialogOpen(false);
  const formatDate = (date) => date.toISOString().split("T")[0];
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [categorySummary, setCategorySummary] = useState({});
  const openFilterDialog = () => setIsFilterDialogOpen(true);
  const closeFilterDialog = () => setIsFilterDialogOpen(false);
  const [startDate, setStartDate] = useState(formatDate(yesterday));
  const [endDate, setEndDate] = useState(formatDate(today));
  const [logs, setLogs] = useState([]);
  const [busData, setBusData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [agents, setAgents] = useState([]);
  const [operators, setOperators] = useState([]);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    modeOfPayment: "",
    payLater: null,
    busName: "",
    category: "",
    logType: "",
    agentName: "",
    operatorName: "",
  });

  const downloadPDF = () => {
    const doc = new jsPDF({
      orientation: "landscape",
    });

    // Format date function
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date
        .toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
        .split("/")
        .join("-");
    };

    // Format number function
    const formatNumber = (amount) => {
      return parseFloat(amount || 0).toFixed(2);
    };

    // Add title and date range
    doc.setFontSize(18);
    doc.text(`Reports`, 14, 20);
    doc.setFontSize(12);
    doc.text(
      `Date Range: ${formatDate(startDate)} to ${formatDate(endDate)}`,
      14,
      30
    );

    // Add totals section
    doc.setFontSize(14);
    doc.text("Summary", 14, 40);
    doc.setFontSize(12);
    doc.text(`Total Credit: ${formatNumber(totals.totalCredit)}`, 14, 50);
    doc.text(`Total Debit: ${formatNumber(totals.totalDebit)}`, 14, 60);
    doc.text(
      `Balance: ${formatNumber(
        parseFloat(totals.totalCredit || 0) - parseFloat(totals.totalDebit || 0)
      )}`,
      14,
      70
    );

    // Add category summary
    let yPosition = 90;
    doc.setFontSize(14);
    doc.text("Category Summary", 14, yPosition);
    yPosition += 10;

    // Create category summary table
    const categoryTableHeaders = [["Category", "Credit", "Debit", "Balance"]];
    const categoryTableBody = Object.entries(categorySummary).map(
      ([categoryName, { credit, debit }]) => [
        categoryName,
        formatNumber(credit),
        formatNumber(debit),
        formatNumber(credit - debit),
      ]
    );

    doc.autoTable({
      head: categoryTableHeaders,
      body: categoryTableBody,
      startY: yPosition,
      margin: { left: 14 },
      tableWidth: "auto",
    });

    // Get the ending Y position of the category summary table
    const finalY = doc.lastAutoTable.finalY + 20;

    // Add main transaction table
    const tableHeader = Array.from(
      document.querySelectorAll("table thead tr th")
    ).map((th) => th.innerText);

    const tableRows = Array.from(document.querySelectorAll("table tbody tr"))
      .filter((row) => row.querySelectorAll("td").length > 0)
      .map((row) =>
        Array.from(row.querySelectorAll("td")).map((td) => td.innerText)
      );

    doc.autoTable({
      head: [tableHeader],
      body: tableRows,
      startY: finalY,
      margin: { left: 14 },
      tableWidth: "auto",
    });

    doc.save(`Reports-${formatDate(startDate)}-to-${formatDate(endDate)}.pdf`);
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Authentication token is missing. Please log in.");
          return;
        }
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
        const busResponse = await axios.get(
          "http://localhost:5000/api/user/bus",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setBusData(busResponse.data);
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
        );
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
      const queryParams = new URLSearchParams({
        ...(filters.modeOfPayment && { modeOfPayment: filters.modeOfPayment }),
        ...(filters.busName && { busName: filters.busName }),
        ...(filters.category && { category: filters.category }),
        ...(filters.logType && { logType: filters.logType }),
        ...(filters.agentName && { agentName: filters.agentName }),
        ...(filters.operatorName && { operatorName: filters.operatorName }),
      }).toString();
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
      setLogs(filteredLogs);
      console.log("Filtered Logs:", filteredLogs);
    } catch (err) {
      setError("Error applying filters. Please try again.");
      console.error(err);
    }
  };
  useEffect(() => {
    if (logs.length > 0) {
      const categorySummary = logs.reduce((acc, log) => {
        const { category, logType, amount } = log;
        console.log("Category", category);
        if (!category) return acc;

        const categoryName = category.name; // Use `name` or `id` as the unique key

        if (!acc[categoryName]) {
          acc[categoryName] = { credit: 0, debit: 0 };
        }

        if (logType === "CREDIT") {
          acc[categoryName].credit += parseFloat(amount || 0);
        } else if (logType === "DEBIT") {
          acc[categoryName].debit += parseFloat(amount || 0);
        }

        return acc;
      }, {});

      setCategorySummary(categorySummary);
      console.log("Category Summary", categorySummary);
    }
  }, [logs]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Authentication token is missing. Please log in.");
          return;
        }
        const totalsResponse = await axios.get(
          `http://localhost:5000/api/user/total?startDate=${startDate}&endDate=${endDate}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setTotals(totalsResponse.data);
      } catch (err) {}
    };
    fetchData();
  }, [startDate, endDate]);
  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold mb-6">Reports</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-green-100 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            Total Credit
          </h3>
          <p className="text-3xl font-bold text-green-600">
            ₹{totals.totalCredit || 0}
          </p>
        </div>
        <div className="bg-red-100 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Total Debit
          </h3>
          <p className="text-3xl font-bold text-red-600">
            ₹{totals.totalDebit || 0}
          </p>
        </div>
        <div className="bg-blue-100 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Balance</h3>
          <p className="text-3xl font-bold text-blue-600">
            ₹
            {(
              parseFloat(totals.totalCredit || 0) -
              parseFloat(totals.totalDebit || 0)
            ).toFixed(2)}
          </p>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow mb-8">
    <div className="flex flex-col md:flex-row md:items-center gap-4">
      <div className="flex items-center gap-2">
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
      
      <div className="flex flex-col md:flex-row gap-4 md:ml-auto">
        <button
          onClick={openFilterDialog}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition duration-200 flex items-center justify-center"
        >
          Filter Logs
        </button>
        <button
          onClick={downloadPDF}
          className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition duration-200 flex items-center justify-center"
        >
          Download
        </button>
        <button
          onClick={() => setDialogOpen(true)}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition duration-200 flex items-center justify-center"
        >
          Category Expense
        </button>
      </div>
      </div>
      </div>

      <div>
        <div className="mt-8">
          {isFilterDialogOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
              <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-1/2 p-6">
                <h2 className="text-xl font-bold mb-4">Apply Filters</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-700">
                      Log Type:
                    </label>
                    <select
                      name="logType"
                      value={filters.logType}
                      onChange={handleFilterChange}
                      className="block w-full px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Log Types</option>
                      <option value="CREDIT">Credit</option>
                      <option value="DEBIT">Debit</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-700">
                      Mode of Payment:
                    </label>
                    <select
                      name="modeOfPayment"
                      value={filters.modeOfPayment}
                      onChange={handleFilterChange}
                      className="block w-full px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Modes</option>
                      <option value="CASH">CASH</option>
                      <option value="UPI">UPI</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-700">
                      Category:
                    </label>
                    <select
                      name="category"
                      value={filters.category}
                      onChange={handleFilterChange}
                      className="block w-full px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    <label className="block mb-2 text-sm font-semibold text-gray-700">
                      Type:
                    </label>
                    <select
                      name="operatorName"
                      value={filters.operatorName}
                      onChange={handleFilterChange}
                      className="block w-full px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Types</option>
                      {operators.map((operator) => (
                        <option key={operator.id} value={operator.name}>
                          {operator.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-700">
                      Agent Name:
                    </label>
                    <select
                      name="agentName"
                      value={filters.agentName}
                      onChange={handleFilterChange}
                      className="block w-full px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Agents</option>
                      {agents.map((agent) => (
                        <option key={agent.id} value={agent.name}>
                          {agent.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-700">
                      Bus Name:
                    </label>
                    <select
                      name="busName"
                      value={filters.busName}
                      onChange={handleFilterChange}
                      className="border border-gray-300 p-2 w-full rounded-md"
                    >
                      <option value="">All Buses</option>
                      {busData.map((bus) => (
                        <option key={bus.id} value={bus.name}>
                          {bus.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="payLater"
                      checked={filters.payLater === true}
                      onChange={handleFilterChange}
                      className="mr-3 w-4 h-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label className="font-medium">Pay Later</label>
                  </div>

                  {/* Other fields... */}
                </div>

                {/* Apply and Cancel Buttons */}
                <div className="flex justify-end gap-4 mt-6">
                  <button
                    onClick={closeFilterDialog}
                    className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      applyFilters();
                      closeFilterDialog();
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
        <table className="min-w-full bg-white border border-gray-200 TO be Converted to PDF">
          <thead>
            <tr>
              {filters.payLater ? (
                <>
                  <th className="py-2 px-4 border-b">FROM</th>
                  <th className="py-2 px-4 border-b">TO</th>
                  <th className="py-2 px-4 border-b">Log Type</th>
                  <th className="py-2 px-4 border-b">Amount</th>
                  <th className="py-2 px-4 border-b">Payment Mode</th>
                  <th className="py-2 px-4 border-b">Remarks</th>
                  <th className="py-2 px-4 border-b">Category</th>
                  <th className="py-2 px-4 border-b">Bus Name</th>
                  <th className="py-2 px-4 border-b">Travel Date</th>
                  <th className="py-2 px-4 border-b">COMMISSION</th>
                  <th className="py-2 px-4 border-b">COLLECTION</th>
                  <th className="py-2 px-4 border-b">DUE</th>
                </>
              ) : (
                <>
                  <th className="py-2 px-4 border-b">Description</th>
                  <th className="py-2 px-4 border-b">Log Type</th>
                  <th className="py-2 px-4 border-b">Amount</th>
                  <th className="py-2 px-4 border-b">Payment Mode</th>
                  <th className="py-2 px-4 border-b">Remarks</th>
                  <th className="py-2 px-4 border-b">Category</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td
                  colSpan={filters.payLater ? 12 : 6}
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
                    {filters.payLater ? (
                      <>
                        <td className="py-2 px-4 border-b text-center">
                          {log.payLaterDetails?.from || "N/A"}
                        </td>
                        <td className="py-2 px-4 border-b text-center">
                          {log.payLaterDetails?.to || "N/A"}
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
                    ) : (
                      <>
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
                      </>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        {dialogOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
            <div className="bg-white p-10 rounded-lg shadow-lg w-full max-w-4xl">
              <h2 className="text-2xl font-semibold mb-6">Category Expense</h2>

              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-2 text-left">Category</th>
                    <th className="py-2 text-left">Credit</th>
                    <th className="py-2 text-left">Debit</th>
                    <th className="py-2 text-left">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Replace with your actual data */}
                  {Object.entries(categorySummary).map(
                    ([categoryName, { credit, debit }]) => (
                      <tr key={categoryName}>
                        <td className="py-2">{categoryName}</td>
                        <td className="py-2">{credit.toFixed(2)}</td>
                        <td className="py-2">{debit.toFixed(2)}</td>
                        <td className="py-2">{(credit - debit).toFixed(2)}</td>
                      </tr>
                    )
                  )}
                </tbody>
                <tfoot className="bg-gray-50 font-semibold">
                  <tr>
                    <td className="py-2 text-left ">Total</td>
                    <td className="py-2 text-left">
                      {Object.values(categorySummary)
                        .reduce((sum, { credit }) => sum + credit, 0)
                        .toFixed(2)}
                    </td>
                    <td className="py-2 text-left">
                      {Object.values(categorySummary)
                        .reduce((sum, { debit }) => sum + debit, 0)
                        .toFixed(2)}
                    </td>
                    <td className="py-2 text-left">
                      {Object.values(categorySummary)
                        .reduce(
                          (sum, { credit, debit }) => sum + (credit - debit),
                          0
                        )
                        .toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>

              <div className="mt-6 text-right">
                <button
                  onClick={closeDialog}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
