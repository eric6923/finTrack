import React, { useState, useEffect } from "react";
import { DatePicker } from "@nextui-org/react";
import { now, getLocalTimeZone, parseDateTime } from "@internationalized/date";

const Credit = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [payLater, setPayLater] = useState(true); // Default to true
  const [dueAmount, setDueAmount] = useState(null);
  const [travelDateValue, setTravelDateValue] = useState(
    now(getLocalTimeZone())
  );
  const [formData, setFormData] = useState({
    desc: "",
    amount: "",
    modeOfPayment: "",
    categoryId: "",
    remarks: "",
    busId: "",
    from: "",
    to: "",
    travelDate: "",
    agentId: "",
    operatorId: "",
    commissionAmount: "",
    collectionAmount: "",
    transactionId: "",
  });
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [busOptions, setBusOptions] = useState([]);
  const [agentOptions, setAgentOptions] = useState([]);
  const [operatorOptions, setOperatorOptions] = useState([]);

  const formatDateForAPI = (date) => {
    if (!date) return "";
    // Convert the date to ISO string and format it to match datetime-local format
    const isoString = date.toDate().toISOString();
    return isoString.slice(0, 16); // Get YYYY-MM-DDTHH:mm format
  };

  // Fetch dropdown options
  useEffect(() => {
    const fetchOptions = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("Token not found in localStorage. Please log in.");
        return;
      }

      try {
        const [categoryRes, busRes, agentRes, operatorRes] = await Promise.all([
          fetch("http://localhost:5000/api/user/category/", {
            headers: { Authorization: `Bearer ${token}` },
          }).then((res) => res.json()),
          fetch("http://localhost:5000/api/user/bus", {
            headers: { Authorization: `Bearer ${token}` },
          }).then((res) => res.json()),
          fetch("http://localhost:5000/api/user/agent", {
            headers: { Authorization: `Bearer ${token}` },
          }).then((res) => res.json()),
          fetch("http://localhost:5000/api/user/operator", {
            headers: { Authorization: `Bearer ${token}` },
          }).then((res) => res.json()),
        ]);

        setCategoryOptions(categoryRes);
        setBusOptions(Array.isArray(busRes) ? busRes : []);
        setAgentOptions(Array.isArray(agentRes) ? agentRes : []); // Ensure agentRes is an array
        setOperatorOptions(Array.isArray(operatorRes) ? operatorRes : []); // Ensure operatorRes is an array
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchOptions();
  }, []);

  const handleChange = (e) => {
    if (e?.target) {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };
  const handleDateChange = (date) => {
    setTravelDateValue(date);
    // Update the formData with the formatted date
    setFormData((prev) => ({
      ...prev,
      travelDate: formatDateForAPI(date),
    }));
  };

  const handleCreateCategory = async () => {
    const newCategory = prompt("Enter the new category name:");
    if (newCategory) {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(
          "http://localhost:5000/api/user/category/create",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ name: newCategory }),
          }
        );

        if (response.ok) {
          const category = await response.json();
          setCategoryOptions((prev) => [...prev, category]);
          alert("Category created successfully!");
        } else {
          alert("Failed to create category.");
        }
      } catch (error) {
        console.error("Error creating category:", error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.amount || !formData.modeOfPayment) {
      alert("Please fill in all required fields.");
      return;
    }

    if (
      payLater &&
      (!formData.from ||
        !formData.to ||
        !formData.travelDate ||
        !formData.busId)
    ) {
      alert("Please fill in all 'Pay Later' details.");
      return;
    }

    const token = localStorage.getItem("token");
    const payload = {
      desc: formData.desc,
      amount: parseFloat(formData.amount),
      modeOfPayment: formData.modeOfPayment,
      categoryId: parseInt(formData.categoryId, 10),
      remarks: formData.remarks,
      payLater,
      payLaterDetails: payLater
        ? {
            busId: parseInt(formData.busId, 10),
            from: formData.from,
            to: formData.to,
            travelDate: formData.travelDate,
          }
        : null,
      commission: payLater
        ? {
            agentId: parseInt(formData.agentId, 10),
            amount: parseFloat(formData.commissionAmount),
          }
        : null,
      collection: payLater
        ? {
            operatorId: parseInt(formData.operatorId, 10),
            amount: parseFloat(formData.collectionAmount),
          }
        : null,
    };

    try {
      const response = await fetch(
        "http://localhost:5000/api/user/transaction/create?logType=CREDIT",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      if (response.ok) {
        setDueAmount(data.dueAmount);
        alert("Credit log created successfully!");
        window.location.reload();
        setIsModalOpen(false);
      } else {
        alert("Failed to create credit log: " + data.message);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="p-4">
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-green-500 text-white px-4 py-2 rounded shadow hover:bg-green-600"
      >
        Credit
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-3xl">
            <h2 className="text-lg font-semibold mb-4">Create Credit Log</h2>

            <div className="flex space-x-4 mb-4">
              <button
                onClick={() => setPayLater(true)}
                className={`px-4 py-2 rounded ${
                  payLater ? "bg-blue-500 text-white" : "bg-gray-300"
                }`}
              >
                Pay Later
              </button>
              <button
                onClick={() => setPayLater(false)}
                className={`px-4 py-2 rounded ${
                  !payLater ? "bg-blue-500 text-white" : "bg-gray-300"
                }`}
              >
                Others
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {payLater ? (
                <>
                  {/* Pay Later fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Row 1 */}
                    <label className="flex flex-col">
                      From:
                      <input
                        type="text"
                        name="from"
                        value={formData.from}
                        onChange={handleChange}
                        required
                        className="mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </label>
                    <label className="flex flex-col">
                      To:
                      <input
                        type="text"
                        name="to"
                        value={formData.to}
                        onChange={handleChange}
                        required
                        className="mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </label>

                    <label className="flex flex-col">
                      Travel Date:
                      <DatePicker
                        hideTimeZone
                        showMonthAndYearPickers
                        value={travelDateValue}
                        onChange={handleDateChange}
                        defaultValue={now(getLocalTimeZone())}
                        variant="bordered"
                        classNames={{
                          base: "w-full",
                          input:
                            "mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500",
                        }}
                      />
                    </label>
                    

                    {/* Row 2 */}
                    <label className="flex flex-col">
                      Amount:
                      <input
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        required
                        className="mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </label>
                    <label className="flex flex-col">
                      Mode of Payment:
                      <select
                        name="modeOfPayment"
                        value={formData.modeOfPayment}
                        onChange={handleChange}
                        required
                        className="mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select</option>
                        <option value="CASH">Cash</option>
                        <option value="UPI">UPI</option>
                      </select>
                    </label>

                    {formData.modeOfPayment === "UPI" && (
                      <label className="flex flex-col sm:col-span-2">
                        Transaction ID:
                        <input
                          type="text"
                          name="transactionId"
                          value={formData.transactionId}
                          onChange={handleChange}
                          className="mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </label>
                    )}

                    {/* Row 3 */}
                    <label className="flex flex-col">
                      Category:
                      <div className="flex items-center space-x-2 mt-1">
                        <select
                          name="categoryId"
                          value={formData.categoryId}
                          onChange={handleChange}
                          required
                          className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select</option>
                          {categoryOptions.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={handleCreateCategory}
                          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          Add
                        </button>
                      </div>
                    </label>

                    <label className="flex flex-col">
                      Bus Name:
                      <select
                        name="busId"
                        value={formData.busId}
                        onChange={handleChange}
                        required
                        className="mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select</option>
                        {Array.isArray(busOptions) &&
                          busOptions.map((bus) => (
                            <option key={bus.id} value={bus.id}>
                              {bus.name}
                            </option>
                          ))}
                      </select>
                    </label>

                    <label className="flex flex-col">
                      Collection Amount:
                      <input
                        type="number"
                        name="collectionAmount"
                        value={formData.collectionAmount}
                        onChange={handleChange}
                        className="mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </label>
                    {/* Row 4 */}

                    {/* Row 5 */}
                    <label className="flex flex-col">
                      Agent:
                      <select
                        name="agentId"
                        value={formData.agentId}
                        onChange={handleChange}
                        className="mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select</option>
                        {agentOptions.map((agent) => (
                          <option key={agent.id} value={agent.id}>
                            {agent.name}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="flex flex-col">
                      Commission Amount:
                      <input
                        type="number"
                        name="commissionAmount"
                        value={formData.commissionAmount}
                        onChange={handleChange}
                        className="mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </label>

                    {/* Row 6 */}
                    <label className="flex flex-col">
                      Type:
                      <select
                        name="operatorId"
                        value={formData.operatorId}
                        onChange={handleChange}
                        required
                        className="mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select</option>
                        {operatorOptions.map((operator) => (
                          <option key={operator.id} value={operator.id}>
                            {operator.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="flex flex-col">
                      Remarks:
                      <input
                        type="text"
                        name="remarks"
                        value={formData.remarks}
                        onChange={handleChange}
                        className="mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </label>
                  </div>
                </>
              ) : (
                <>
                  {/* Non-Pay Later fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Row 1 */}
                    <label className="flex flex-col">
                      Description:
                      <input
                        type="text"
                        name="desc"
                        value={formData.desc}
                        onChange={handleChange}
                        required
                        className="mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </label>
                    <label className="flex flex-col">
                      Amount:
                      <input
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        required
                        className="mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </label>

                    {/* Row 2 */}
                    <label className="flex flex-col">
                      Mode of Payment:
                      <select
                        name="modeOfPayment"
                        value={formData.modeOfPayment}
                        onChange={handleChange}
                        required
                        className="mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select</option>
                        <option value="CASH">Cash</option>
                        <option value="UPI">UPI</option>
                      </select>
                    </label>
                    {formData.modeOfPayment === "UPI" && (
                      <label className="flex flex-col">
                        Transaction ID:
                        <input
                          type="text"
                          name="transactionId"
                          value={formData.transactionId}
                          onChange={handleChange}
                          className="mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </label>
                    )}

                    {/* Row 3 */}
                    <label className="flex flex-col">
                      Category:
                      <div className="flex items-center space-x-2 mt-1">
                        <select
                          name="categoryId"
                          value={formData.categoryId}
                          onChange={handleChange}
                          required
                          className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select</option>
                          {categoryOptions.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={handleCreateCategory}
                          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          Add
                        </button>
                      </div>
                    </label>
                    <label className="flex flex-col">
                      Remarks:
                      <input
                        type="text"
                        name="remarks"
                        value={formData.remarks}
                        onChange={handleChange}
                        className="mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </label>
                  </div>
                </>
              )}

              <div className=" sticky bottom-0 bg-white p-4 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Credit;
