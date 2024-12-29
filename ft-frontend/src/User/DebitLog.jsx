import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Add this at the top

const CreateDebitLog = () => {
  const [formData, setFormData] = useState({
    desc: "",
    amount: "",
    modeOfPayment: "CASH",
    transactionNo: "",
    categoryId: "",
    remarks: "",
  });
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [payLater, setPayLater] = useState(false); // Add this state initialization
  const navigate = useNavigate(); // Add this inside the component
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);

  useEffect(() => {
    // Fetch categories from the backend when the component mounts
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/user/category",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found in local storage");
      }

      const dataToSend = {
        ...formData,
        amount: parseFloat(formData.amount),
        categoryId: parseInt(formData.categoryId, 10),
      };

      await axios.post(
        "http://localhost:5000/api/user/transaction/create?logType=DEBIT",
        dataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setError(null);
      setSuccess("Debit log created successfully!");
      window.location.reload();
      setFormData({
        desc: "",
        amount: "",
        modeOfPayment: "CASH",
        transactionNo: "",
        categoryId: "",
        remarks: "",
      });
      setIsDialogOpen(false);
    } catch (error) {
      setError("Error creating debit log. Please try again.");
      console.error("Error creating debit log:", error);
    }
  };

  const handleCreateCategory = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found in local storage");
      }

      const response = await axios.post(
        "http://localhost:5000/api/user/category/create",
        { name: newCategory },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setCategories([...categories, response.data]);
      setNewCategory("");
      setIsCategoryDialogOpen(false);
    } catch (error) {
      setError("Error creating category. Please try again.");
      console.error("Error creating category:", error);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <button
        className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-700"
        onClick={() => setIsDialogOpen(true)}
      >
        Debit
      </button>

      {isDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-1/2">
            <h1 className="text-2xl font-bold mb-4">Create Debit Log</h1>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <div className="flex space-x-4 mb-4">
                  <button
                    onClick={() => setPayLater()} // You can change the onClick logic if needed
                    className="px-4 py-2 rounded bg-blue-500 text-white"
                  >
                    Others
                  </button>

                  <button
                    onClick={() => navigate("/paylater")}
                    className={`px-4 py-2 rounded ${
                      payLater ? "bg-blue-500 text-white" : "bg-gray-300"
                    }`}
                  >
                    Pay Later
                  </button>
                </div>

                <label className="block text-gray-700">Description</label>
                <input
                  type="text"
                  name="desc"
                  value={formData.desc}
                  onChange={handleChange}
                  className="mt-1 p-2 w-full border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Amount</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className="mt-1 p-2 w-full border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Mode of Payment</label>
                <select
                  name="modeOfPayment"
                  value={formData.modeOfPayment}
                  onChange={handleChange}
                  className="mt-1 p-2 w-full border rounded"
                >
                  <option value="CASH">Cash</option>
                  <option value="UPI">UPI</option>
                </select>
              </div>
              {formData.modeOfPayment === "UPI" && (
                <div className="mb-4">
                  <label className="block text-gray-700">Transaction ID</label>
                  <input
                    type="text"
                    name="transactionNo"
                    value={formData.transactionNo}
                    onChange={handleChange}
                    className="mt-1 p-2 w-full border rounded"
                    required
                  />
                </div>
              )}
              <div className="mb-4">
                <label className="block text-gray-700">Category</label>
                <div className="flex">
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    className="mt-1 p-2 w-full border rounded"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="ml-2 bg-red-500 text-white py-2 px-4 rounded hover:bg-green-700"
                    onClick={() => setIsCategoryDialogOpen(true)}
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Remarks</label>
                <input
                  type="text"
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  className="mt-1 p-2 w-full border rounded"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-700 mr-2"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setFormData({
                      desc: "",
                      amount: "",
                      modeOfPayment: "CASH",
                      transactionNo: "",
                      categoryId: "",
                      remarks: "",
                    });
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700"
                >
                  Create Log
                </button>
              </div>
            </form>
            {error && <div className="mt-4 text-red-500">{error}</div>}
            {success && <div className="mt-4 text-green-500">{success}</div>}
          </div>
        </div>
      )}

      {isCategoryDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-1/3">
            <h1 className="text-2xl font-bold mb-4">Create Category</h1>
            <div className="mb-4">
              <label className="block text-gray-700">Category Name</label>
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="mt-1 p-2 w-full border rounded"
                required
              />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-700 mr-2"
                onClick={() => setIsCategoryDialogOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700"
                onClick={handleCreateCategory}
              >
                Create Category
              </button>
            </div>
            {error && <div className="mt-4 text-red-500">{error}</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateDebitLog;
