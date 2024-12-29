import React, { useState } from "react";
import axios from "axios";

const CreateCategory = () => {
  const [categoryName, setCategoryName] = useState("");
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found, please login first.");
      return;
    }
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };
    const body = { name: categoryName };
    try {
      console.log("Sending request to create category:", body, config);

      const res = await axios.post(
        "https://ftbackend.vercel.app/api/user/category/create",
        body,
        config
      );
      setResponse(res.data);
      setError(null);
      setCategoryName("");
    } catch (err) {
      console.error(
        "Error creating category:",
        err.response || err.message || err
      );
      const errorMessage =
        err.response?.data?.message ||
        "Failed to create category. Please try again.";
      setError(errorMessage);
      setResponse(null);
    }
  };
  return (
    <div>
      <h2>Create Category</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="categoryName">Category Name:</label>
          <input
            type="text"
            id="categoryName"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            required
          />
        </div>
        <button type="submit">Create</button>
      </form>
      {response && (
        <div>
          <h3>Category Created</h3>
          <p>ID: {response.id}</p>
          <p>Name: {response.name}</p>
          <p>Created By: {response.createdBy}</p>
        </div>
      )}
      {error && <div style={{ color: "red" }}>{error}</div>}
    </div>
  );
};
export default CreateCategory;
