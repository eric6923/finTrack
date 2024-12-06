import React from "react";
import { Link } from "react-router-dom";

const UserRequest = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="max-w-md p-6 bg-white rounded-md shadow-md">
        <h2 className="text-lg font-semibold text-gray-800">Request Sent</h2>
        <p className="mt-2 text-gray-600">
          Your request has been sent. Please wait for some time.
        </p>
        <div className="mt-4">
          <Link
            to="/login"
            className="inline-block px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserRequest;
