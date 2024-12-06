import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const UserSignup = () => {
  const navigate = useNavigate(); // Initialize navigate
  const [formData, setFormData] = useState({
    name: "",
    userName: "",
    email: "",
    phone: "",
    password: "",
    passwordConfirmation: "",
    address: "",
    gstin: "",
    aadhar: "",
    pan: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    const { name, userName, email, phone, password, passwordConfirmation, aadhar, pan, gstin } = formData;

    if (!name || !userName || !email || !phone || !password || !passwordConfirmation || !aadhar || !pan) {
      return "All fields are required.";
    }

    if (password !== passwordConfirmation) {
      return "Passwords do not match.";
    }

    const aadharRegex = /^\d{12}$/;
    if (!aadharRegex.test(aadhar)) {
      return "Aadhaar number must be 12 digits.";
    }

    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(pan)) {
      return "Invalid PAN number format.";
    }

    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}Z[0-9A-Z]{1}$/;
    if (gstin && !gstinRegex.test(gstin)) {
      return "Invalid GST number format.";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/user/regrequest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to submit form");
      }

      // Navigate to the UserRequest component on success
      navigate("/userrequest");
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
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
              <p className="mt-4 leading-relaxed text-white/90">
                SignUp To Get Started
              </p>
            </div>
          </section>

          <main className="flex items-center justify-center px-8 py-8 sm:px-12 lg:col-span-7 lg:px-16 lg:py-12 xl:col-span-6">
            <div className="max-w-xl lg:max-w-3xl">
              <form onSubmit={handleSubmit} className="mt-8 grid grid-cols-6 gap-6">
                {/* Form Fields */}
                {[{
                    id: "name",
                    label: "Name",
                    type: "text"
                  },
                  {
                    id: "userName",
                    label: "Username",
                    type: "text"
                  },
                  {
                    id: "email",
                    label: "Email",
                    type: "email"
                  },
                  {
                    id: "phone",
                    label: "Phone",
                    type: "tel"
                  },
                  {
                    id: "password",
                    label: "Password",
                    type: "password"
                  },
                  {
                    id: "passwordConfirmation",
                    label: "Confirm Password",
                    type: "password"
                  },
                  {
                    id: "address",
                    label: "Address",
                    type: "text"
                  },
                  {
                    id: "gstin",
                    label: "GST Number",
                    type: "text"
                  },
                  {
                    id: "aadhar",
                    label: "Aadhaar Number",
                    type: "text"
                  },
                  {
                    id: "pan",
                    label: "PAN Number",
                    type: "text"
                  },
                ].map(({
                  id,
                  label,
                  type
                }) => (
                  <div className="col-span-6 sm:col-span-3" key={id}>
                    <label htmlFor={id} className="block text-sm font-medium text-gray-700">
                      {label}
                    </label>
                    <input
                      type={type}
                      id={id}
                      name={id}
                      value={formData[id]}
                      onChange={handleInputChange}
                      className="p-4 h-2 mt-1 w-full rounded-md border-2 border-gray-300 bg-white text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}

                {/* Error Message */}
                {
                  errorMessage && (
                    <div className="col-span-6">
                      <p className="text-sm text-red-500">{errorMessage}</p>
                    </div>
                  )
                }

                {/* Submit Button */}
                <div className="col-span-6 sm:flex sm:items-center sm:gap-4">
                  <button
                    type="submit"
                    className="inline-block shrink-0 rounded-md border border-blue-600 bg-blue-600 px-12 py-3 text-sm font-medium text-white transition hover:bg-transparent hover:text-blue-600 focus:outline-none focus:ring active:text-blue-500"
                    disabled={isSubmitting}
                  >
                    {
                      isSubmitting ? "Submitting..." : "Request Access"
                    }
                  </button>
                  <p className="mt-4 text-sm text-gray-500 sm:mt-0">
                    Already have an account?{" "}
                    <a href="/login" className="text-gray-700 underline">
                      Log in
                    </a>
                  </p>
                </div>
              </form>
            </div>
          </main>
        </div>
      </section>
    </div>
  );
};

export default UserSignup;
