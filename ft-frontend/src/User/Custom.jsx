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
  const [monthYear, setMonthYear] = useState("");
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
  const calculateCategorySummary = (logs) => {
    const summary = {};
    
    logs.forEach(log => {
      const categoryName = log.category?.name || 'Uncategorized';
      const amount = parseFloat(log.amount) || 0;
      
      if (!summary[categoryName]) {
        summary[categoryName] = { credit: 0, debit: 0 };
      }
      
      if (log.logType === 'CREDIT') {
        summary[categoryName].credit += amount;
      } else if (log.logType === 'DEBIT') {
        summary[categoryName].debit += amount;
      }
    });
    
    return summary;
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
  
        // First fetch all the reference data
        const [busResponse, categoriesResponse, agentsResponse, operatorsResponse] = await Promise.all([
          axios.get("https://ftbackend.vercel.app/api/user/bus", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get("https://ftbackend.vercel.app/api/user/category/", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get("https://ftbackend.vercel.app/api/user/agent", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get("https://ftbackend.vercel.app/api/user/operator", {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
  
        setBusData(busResponse.data);
        setCategories(categoriesResponse.data);
        setAgents(agentsResponse.data);
        setOperators(operatorsResponse.data);
  
        // Then fetch the transaction data
        let url;
        if (monthYear) {
          url = `https://ftbackend.vercel.app/api/user/transaction?Date=${monthYear}`;
        } else {
          url = `https://ftbackend.vercel.app/api/user/transaction?startDate=${startDate}&endDate=${endDate}`;
        }
  
        const logsResponse = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
  
        const totalsUrl = monthYear
          ? `https://ftbackend.vercel.app/api/user/total?Date=${monthYear}`
          : `https://ftbackend.vercel.app/api/user/total?startDate=${startDate}&endDate=${endDate}`;
  
        const totalsResponse = await axios.get(totalsUrl, {
          headers: { Authorization: `Bearer ${token}` }
        });
  
        setLogs(logsResponse.data);
        setTotals(totalsResponse.data);
        setCategorySummary(calculateCategorySummary(logsResponse.data));

        
  
      } catch (err) {
        console.error('Error fetching data:', err);
        // setError("Error fetching data. Please try again.");
        setLogs([]);
        setTotals({ totalCredit: 0, totalDebit: 0 });
      }
    };
  
    fetchData();
  }, [startDate, endDate, monthYear]);
  
  const handleFilterChange = (e) => {
    const { name, type, value, checked } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
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
  
      // Create monthly query params for totals
      const monthQueryParams = new URLSearchParams();
      if (monthYear) {
        monthQueryParams.append('Date', monthYear);
      } else if (startDate) {
        // Extract month and year from startDate for totals
        const monthYearFromDate = startDate.substring(0, 7);
        monthQueryParams.append('Date', monthYearFromDate);
      }
  
      // Create separate query params for filtered logs
      const queryParams = new URLSearchParams();
      if (monthYear) {
        queryParams.append('Date', monthYear);
      } else {
        if (startDate) queryParams.append('startDate', startDate);
        if (endDate) queryParams.append('endDate', endDate);
      }
  
      // Add filter parameters if they have values
      if (filters.modeOfPayment) queryParams.append('modeOfPayment', filters.modeOfPayment);
      if (filters.busName) queryParams.append('busName', filters.busName);
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.logType) queryParams.append('logType', filters.logType);
      if (filters.agentName) queryParams.append('agentName', filters.agentName);
      if (filters.operatorName) queryParams.append('operatorName', filters.operatorName);
  
      // Make parallel API calls for monthly totals and filtered logs
      const [monthlyTotalsResponse, logsResponse] = await Promise.all([
        axios.get(
          `https://ftbackend.vercel.app/api/user/total?${monthQueryParams.toString()}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        ),
        axios.get(
          `https://ftbackend.vercel.app/api/user/transaction?${queryParams.toString()}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )
      ]);
  
      let filteredLogs = logsResponse.data;
  
      // Apply client-side filters
      filteredLogs = filteredLogs.filter(log => {
        let matchesFilter = true;
  
        // Apply date range filter
        if (monthYear) {
          const logDate = new Date(log.updatedAt);
          const [year, month] = monthYear.split('-');
          matchesFilter = logDate.getFullYear() === parseInt(year) && 
                         logDate.getMonth() === parseInt(month) - 1;
        } else if (startDate && endDate) {
          const logDate = new Date(log.updatedAt);
          const start = new Date(startDate);
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999); // Include the entire end date
          matchesFilter = logDate >= start && logDate <= end;
        }
  
        // Apply other filters only if they are set
        if (matchesFilter && filters.modeOfPayment) {
          matchesFilter = log.modeOfPayment === filters.modeOfPayment;
        }
        if (matchesFilter && filters.busName) {
          matchesFilter = log.payLaterDetails?.busName === filters.busName;
        }
        if (matchesFilter && filters.category) {
          matchesFilter = log.category?.name === filters.category;
        }
        if (matchesFilter && filters.logType) {
          matchesFilter = log.logType === filters.logType;
        }
        if (matchesFilter && filters.agentName) {
          matchesFilter = log.agentName === filters.agentName;
        }
        if (matchesFilter && filters.operatorName) {
          matchesFilter = log.operatorName === filters.operatorName;
        }
  
        // Apply payLater filter
        if (matchesFilter && filters.payLater !== null) {
          matchesFilter = log.payLater === filters.payLater;
        }
  
        return matchesFilter;
      });
  
      // Update states
      setLogs(filteredLogs); // Update filtered logs in table
      setTotals(monthlyTotalsResponse.data); // Update top totals with monthly data
      setCategorySummary(calculateCategorySummary(filteredLogs));
      closeFilterDialog();
      
    } catch (err) {
      console.error('Error applying filters:', err);
      setError("Error applying filters. Please try again.");
      setLogs([]);
      setTotals({ totalCredit: 0, totalDebit: 0 });
      setCategorySummary({});
    }
  };
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
    
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  // Clear month-year when date range is used
                  if (e.target.value) {
                    setMonthYear("");
                  }
                }}
                className="border border-gray-300 p-2 rounded-md"
                disabled={!!monthYear}
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  // Clear month-year when date range is used
                  if (e.target.value) {
                    setMonthYear("");
                  }
                }}
                className="border border-gray-300 p-2 rounded-md"
                disabled={!!monthYear}
              />
            </div>
            <div className="text-gray-500">OR</div>

            <div className="flex items-center gap-2">
              <input
                type="month"
                value={monthYear}
                onChange={(e) => {
                  setMonthYear(e.target.value);
                  // Clear date range when month-year is selected
                  if (e.target.value) {
                    setStartDate("");
                    setEndDate("");
                  }
                }}
                className="border border-gray-300 p-2 rounded-md"
              />
            </div>
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
      <div className="overflow-x-auto max-h-[350px] overflow-y-auto">
        <table className="min-w-full bg-white border border-gray-200 TO be Converted to PDF">
          <thead>
            <tr>
            <th className="py-2 px-4 border-b">S No</th>
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
                  <th className="py-2 px-4 border-b">Transaction Date</th>
                  <th className="py-2 px-4 border-b">COMMISSION</th>
                  <th className="py-2 px-4 border-b">COLLECTION</th>
                  <th className="py-2 px-4 border-b">DUE</th>
                  <th className="py-2 px-4 border-b">Status</th>
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
                  colSpan={filters.payLater ? 13 : 7}
                  className="py-4 px-4 text-center text-gray-500"
                >
                  No logs found.
                </td>
              </tr>
            ) : (
              <>
                {logs.map((log,index) => {
                  const busName =
                    busData.find((bus) => bus.id === log.payLaterDetails?.busId)
                      ?.name || "N/A";
                  const travelDate = log.payLaterDetails?.travelDate
                    ? new Date(
                        log.payLaterDetails.travelDate
                      ).toLocaleDateString()
                    : "N/A";
                    const transactionDate = log.updatedAt
                    ? new Date(
                        log.updatedAt
                      ).toLocaleDateString()
                    : "N/A";

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-gray-100 transition duration-150"
                    >
                      <td className="py-2 px-4 border-b text-center">{index + 1}</td>
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
                            {transactionDate}
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
                          <td
                            className={`py-2 px-4 border-b text-center ${
                              parseFloat(log.dueAmount || 0) === 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {parseFloat(log.dueAmount || 0) === 0
                              ? "Paid"
                              : "Not Paid"}
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
                })}
                {/* Total Row */}

                <tr className="bg-gray-100 font-semibold">
                  {filters.payLater ? (
                    <>
                      <td colSpan={4} className="py-2 px-4 border-b text-right">
                        Total:
                      </td>
                      <td className="py-2 px-4 border-b text-center">
                        {logs
                          .reduce((total, log) => {
                            const amount = parseFloat(log.amount) || 0;
                            return log.logType === "CREDIT"
                              ? total + amount
                              : total - amount;
                          }, 0)
                          .toFixed(2)}
                      </td>
                      <td colSpan={6} className="py-2 px-4 border-b"></td>
                      <td className="py-2 px-4 border-b text-center">
                        {logs
                          .reduce(
                            (total, log) =>
                              total + (parseFloat(log.commission?.amount) || 0),
                            0
                          )
                          .toFixed(2)}
                      </td>
                      <td className="py-2 px-4 border-b text-center">
                        {logs
                          .reduce(
                            (total, log) =>
                              total + (parseFloat(log.collection?.amount) || 0),
                            0
                          )
                          .toFixed(2)}
                      </td>
                      <td className="py-2 px-4 border-b text-center">
                        {logs
                          .reduce(
                            (total, log) =>
                              total + (parseFloat(log.dueAmount) || 0),
                            0
                          )
                          .toFixed(2)}
                      </td>
                    </>
                  ) : (
                    <>
                      <td colSpan={2} className="py-2 px-4 border-b text-right">
                        Total:
                      </td>
                      <td className="py-2 px-4 border-b text-center">
                        {logs
                          .reduce((total, log) => {
                            const amount = parseFloat(log.amount) || 0;
                            return log.logType === "CREDIT"
                              ? total + amount
                              : total - amount;
                          }, 0)
                          .toFixed(2)}
                      </td>
                      <td colSpan={3} className="py-2 px-4 border-b"></td>
                    </>
                  )}
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>

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
  );
}
