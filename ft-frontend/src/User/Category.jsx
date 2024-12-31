import React, { useState, useEffect } from "react";
import axios from "axios";

const Category = () => {
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [error, setError] = useState(null);

  // Existing fetchCategories function remains the same
  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "https://ftbackend.vercel.app/api/user/category",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const categoriesData = Array.isArray(response.data) ? response.data : [];
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError("Failed to fetch categories. Please try again.");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Existing handleCreateCategory function remains the same
  const handleCreateCategory = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No token found, please login first.");
        return;
      }

      const response = await axios.post(
        "https://ftbackend.vercel.app/api/user/category/create",
        { name: newCategoryName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setCategories([...categories, response.data]);
      setNewCategoryName("");
      setIsDialogOpen(false);
      setError(null);
    } catch (err) {
      console.error(
        "Error creating category:",
        err.response || err.message || err
      );
      const errorMessage =
        err.response?.data?.message ||
        "Failed to create category. Please try again.";
      setError(errorMessage);
    }
  };

  // New function to handle category deletion
  const handleDeleteCategory = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No token found, please login first.");
        return;
      }

      if (!selectedCategoryId) {
        setError("Please select a category to delete.");
        return;
      }

      await axios.delete(
        `https://ftbackend.vercel.app/api/user/category/${selectedCategoryId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Remove the deleted category from the state
      // setCategories(categories.filter(cat => cat.id !== selectedCategoryId));
      await fetchCategories();
      setSelectedCategoryId("");
      setIsDeleteDialogOpen(false);
      setError(null);
    } catch (err) {
      console.error(
        "Error deleting category:",
        err.response || err.message || err
      );
      const errorMessage =
        err.response?.data?.message ||
        "Failed to delete category. Please try again.";
      setError(errorMessage);
    }
  };

  return (
    <div className="p-4 space-y-2">
      <h1 className="text-xl font-semibold text-center text-black">
        Create Category
      </h1>

      <div className="flex items-center justify-center space-x-4">
      <select 
  value={selectedCategoryId} 
  onChange={(e) => setSelectedCategoryId(e.target.value)}
  className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
>
  <option value="">Select Category</option>
  {categories.map((category) => (
    <option key={category.id} value={category.id}>
      {category.name}
    </option>
  ))}
</select>
        <button
          onClick={() => setIsDialogOpen(true)}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          +
        </button>
        <button
          onClick={() => setIsDeleteDialogOpen(true)}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
        >
          -
        </button>
      </div>

      {error && (
        <div className="text-red-500 text-center mt-2">{error}</div>
      )}

      {/* Existing Create Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full space-y-4">
            <h3 className="text-xl font-semibold text-center text-black">
              Create New Category
            </h3>
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Enter category name"
            />
            <div className="flex justify-between">
              <button
                onClick={handleCreateCategory}
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition"
              >
                Create
              </button>
              <button
                onClick={() => setIsDialogOpen(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Delete Dialog */}
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full space-y-4">
            <h3 className="text-xl font-semibold text-center text-black">
              Delete Category
            </h3>
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="">Select Category to Delete</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <div className="flex justify-between">
              <button
                onClick={handleDeleteCategory}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
              >
                Delete
              </button>
              <button
                onClick={() => setIsDeleteDialogOpen(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Category;