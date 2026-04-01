// src/pages/Public/ApplicationSuccess.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';

const ApplicationSuccess = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
        <FaCheckCircle className="text-green-500 text-5xl mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Application Submitted!</h1>
        <p className="text-gray-600 mb-6">
          Thank you for your application. Our HR team will review your details and contact you soon.
        </p>
        <Link to="/" className="text-blue-600 hover:text-blue-800">
          Return to Homepage
        </Link>
      </div>
    </div>
  );
};

export default ApplicationSuccess;