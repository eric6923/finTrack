import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const UserLogin = () => {
  const [formData, setFormData] = useState({
    user_name: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate(); // Initialize useNavigate

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload
    setErrorMessage("");
    setSuccessMessage("");
  
    try {
      const response = await fetch("http://localhost:5000/api/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userName: formData.user_name,
          password: formData.password,
        }),
      });
  
      const result = await response.json();
  
      if (!response.ok) {
        throw new Error(result.message || "Login failed. Please check your credentials.");
      }
  
      if (!result.token || !result.user) {
        throw new Error("Token or user information not found in response.");
      }
  
      // Store token and user info in localStorage
      localStorage.setItem("token", result.token);
      localStorage.setItem("userInfo", JSON.stringify(result.user));
  
      setSuccessMessage("Login successful!");
  
      // Navigate to /sidebar
      navigate("/sidebar");
    } catch (error) {
      console.error("Error during login:", error);
      setErrorMessage(error.message || "An error occurred during login.");
    }
  };
  
  

  return (
    <div>
      <section className="bg-white">
        <div className="lg:grid lg:min-h-screen lg:grid-cols-12">
          <section className="relative flex h-32 items-end bg-gray-900 lg:col-span-5 lg:h-full xl:col-span-6">
            <img
              alt=""
              src="./src/User/fintrack.webp"
              className="absolute inset-0 h-full w-full object-cover opacity-80"
            />
            <div className="hidden lg:relative lg:block lg:p-12">
              <h2 className="mt-6 text-2xl font-bold text-white sm:text-3xl md:text-4xl">
                Welcome to FinTrack
              </h2>
              <p className="mt-4 leading-relaxed text-white/90">Login</p>
            </div>
          </section>

          <main className="flex items-center justify-center px-8 py-8 sm:px-12 lg:col-span-7 lg:px-16 lg:py-12 xl:col-span-6">
            <div className="max-w-xl lg:max-w-3xl">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6">
                    <label
                      htmlFor="UserName"
                      className="text-base font-semibold text-gray-700"
                    >
                      User Name
                    </label>
                    <input
                      type="text"
                      id="UserName"
                      name="user_name"
                      required
                      value={formData.user_name}
                      onChange={handleChange}
                      className="p-4 h-2 mt-1 w-full rounded-md border-2 border-gray-300 bg-white text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="col-span-6">
                    <label
                      htmlFor="Password"
                      className="text-base font-semibold text-gray-700"
                    >
                      Password
                    </label>
                    <input
                      type="password"
                      id="Password"
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="p-4 h-2 mt-1 w-full rounded-md border-2 border-gray-300 bg-white text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Error Message */}
                {errorMessage && (
                  <p className="mt-4 text-sm text-red-600">{errorMessage}</p>
                )}

                {/* Success Message */}
                {successMessage && (
                  <p className="mt-4 text-sm text-green-600">{successMessage}</p>
                )}

                <div className="col-span-6 mt-6 sm:flex sm:flex-col sm:items-start sm:gap-4">
                  <button
                    type="submit"
                    className="inline-block shrink-0 rounded-md border border-blue-600 bg-blue-600 px-12 py-3 text-sm font-medium text-white transition hover:bg-transparent hover:text-blue-600 focus:outline-none focus:ring active:text-blue-500"
                  >
                    Log In
                  </button>
                </div>
              </form>
            </div>
          </main>
        </div>
      </section>
    </div>
  );
};

export default UserLogin;
