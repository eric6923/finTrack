import React, { useState, useEffect } from "react";

const Credit = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [payLater, setPayLater] = useState(false);
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

  // Fetch dropdown options
  useEffect(() => {
    const fetchOptions = async () => {
      const token = localStorage.getItem("token");
      try {
        const [categoryRes, busRes, agentRes, operatorRes] = await Promise.all([
          fetch("https://ftbackend.vercel.app/api/user/category/", {
            headers: { Authorization: `Bearer ${token}` },
          }).then((res) => res.json()),
          fetch("https://ftbackend.vercel.app/api/user/bus", {
            headers: { Authorization: `Bearer ${token}` },
          }).then((res) => res.json()),
          fetch("https://ftbackend.vercel.app/api/user/agent", {
            headers: { Authorization: `Bearer ${token}` },
          }).then((res) => res.json()),
          fetch("https://ftbackend.vercel.app/api/user/operator", {
            headers: { Authorization: `Bearer ${token}` },
          }).then((res) => res.json()),
        ]);
        setCategoryOptions(categoryRes);
        setBusOptions(busRes);
        setAgentOptions(agentRes);
        setOperatorOptions(operatorRes);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchOptions();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateCategory = async () => {
    const newCategory = prompt("Enter the new category name:");
    if (newCategory) {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(
          "https://ftbackend.vercel.app/api/user/category/create",
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
        "https://ftbackend.vercel.app/api/user/transaction/create?logType=CREDIT",
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
        alert("Credit log created successfully!");
        console.log(data);
        setIsModalOpen(false); // Close modal on success
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
            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="flex items-center space-x-2">
                <span>Pay Later:</span>
                <input
                  type="checkbox"
                  checked={payLater}
                  onChange={(e) => setPayLater(e.target.checked)}
                  className="form-checkbox"
                />
              </label>

              {payLater ? (
                <>
                  <label>
                    From:
                    <input
                      type="text"
                      name="from"
                      value={formData.from}
                      onChange={handleChange}
                      required
                    />
                  </label>
                  <label>
                    To:
                    <input
                      type="text"
                      name="to"
                      value={formData.to}
                      onChange={handleChange}
                      required
                    />
                  </label>
                  <label>
                    Amount:
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      required
                    />
                  </label>
                  <label>
                    Mode of Payment:
                    <select
                      name="modeOfPayment"
                      value={formData.modeOfPayment}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select</option>
                      <option value="CASH">Cash</option>
                      <option value="UPI">UPI</option>
                    </select>
                  </label>
                  {formData.modeOfPayment === "UPI" && (
                    <label>
                      Transaction ID:
                      <input
                        type="text"
                        name="transactionId"
                        value={formData.transactionId}
                        onChange={handleChange}
                      />
                    </label>
                  )}
                  <label>
                    Category:
                    <select
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select</option>
                      {categoryOptions.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    <button type="button" onClick={handleCreateCategory}>
                      Add Category
                    </button>
                  </label>
                  <label>
                    Bus Name:
                    <select
                      name="busId"
                      value={formData.busId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select</option>
                      {busOptions.map((bus) => (
                        <option key={bus.id} value={bus.id}>
                          {bus.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Travel Date:
                    <input
                      type="datetime-local"
                      name="travelDate"
                      value={formData.travelDate}
                      onChange={handleChange}
                      required
                    />
                  </label>
                  <label>
                    Commission Amount:
                    <input
                      type="number"
                      name="commissionAmount"
                      value={formData.commissionAmount}
                      onChange={handleChange}
                    />
                  </label>
                  <label>
                    Agent:
                    <select
                      name="agentId"
                      value={formData.agentId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select</option>
                      {agentOptions.map((agent) => (
                        <option key={agent.id} value={agent.id}>
                          {agent.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Collection Amount:
                    <input
                      type="number"
                      name="collectionAmount"
                      value={formData.collectionAmount}
                      onChange={handleChange}
                    />
                  </label>
                  <label>
                    Operator:
                    <select
                      name="operatorId"
                      value={formData.operatorId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select</option>
                      {operatorOptions.map((operator) => (
                        <option key={operator.id} value={operator.id}>
                          {operator.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Description:
                    <input
                      type="text"
                      name="desc"
                      value={formData.desc}
                      onChange={handleChange}
                    />
                  </label>
                  <label>
                    Remarks:
                    <input
                      type="text"
                      name="remarks"
                      value={formData.remarks}
                      onChange={handleChange}
                    />
                  </label>
                  {/* Pay Later fields */}
                  {/* Add your Tailwind-styled Pay Later inputs here */}
                </>
              ) : (
                <>
                  <label>
                    Description:
                    <input
                      type="text"
                      name="desc"
                      value={formData.desc}
                      onChange={handleChange}
                      required
                    />
                  </label>
                  <label>
                    Amount:
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      required
                    />
                  </label>
                  <label>
                    Mode of Payment:
                    <select
                      name="modeOfPayment"
                      value={formData.modeOfPayment}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select</option>
                      <option value="CASH">Cash</option>
                      <option value="UPI">UPI</option>
                    </select>
                  </label>
                  {formData.modeOfPayment === "UPI" && (
                    <label>
                      Transaction ID:
                      <input
                        type="text"
                        name="transactionId"
                        value={formData.transactionId}
                        onChange={handleChange}
                      />
                    </label>
                  )}
                  <label>
                    Category:
                    <select
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select</option>
                      {categoryOptions.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    <button type="button" onClick={handleCreateCategory}>
                      Add Category
                    </button>
                  </label>
                  <label>
                    Remarks:
                    <input
                      type="text"
                      name="remarks"
                      value={formData.remarks}
                      onChange={handleChange}
                    />
                  </label>
                  {/* Non-Pay Later fields */}
                  {/* Add your Tailwind-styled Non-Pay Later inputs here */}
                </>
              )}

              <div className="flex justify-end space-x-4">
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
