// src/components/CreateCategory.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const VCategory = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // Get token from local storage
    const token = localStorage.getItem("token");

    // Fetch categories from the API
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "https://ftbackend.vercel.app/api/user/category/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
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

  return (
    <div>
      <h2>Categories</h2>
      <ul>
        {categories.map((category) => (
          <li key={category.id}>
            <strong>ID:</strong> {category.id} - <strong>Name:</strong>{" "}
            {category.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default VCategory;
