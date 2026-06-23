import React from "react";
import {
  FaClipboardList,
  FaUniversity,
  FaFileAlt,
  FaGavel,
  FaUser,
  FaIdCard,
  FaExternalLinkAlt,
  FaShieldAlt,
  FaClipboardCheck,
} from "react-icons/fa";

const Forms = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Employee Forms</h1>
        <p className="text-gray-600">Complete your required Forms</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Superannuation Form */}
          <a
            href="/superannuation"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group cursor-pointer"
          >
            <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
              <FaUniversity className="text-blue-600 text-xl" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-800">
                Superannuation Form
              </h3>
              <p className="text-sm text-gray-500">
                Complete superannuation details
              </p>
            </div>
            <FaExternalLinkAlt className="text-gray-400 group-hover:text-blue-600 ml-auto" />
          </a>

          {/* TFN Declaration Form */}
          <a
            href="/tfn-declaration"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group cursor-pointer"
          >
            <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
              <FaFileAlt className="text-green-600 text-xl" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-800">TFN Declaration</h3>
              <p className="text-sm text-gray-500">
                Tax File Number declaration
              </p>
            </div>
            <FaExternalLinkAlt className="text-gray-400 group-hover:text-green-600 ml-auto" />
          </a>

          {/* Prohibition Notice Declaration Form */}
          <a
            href="/prohibition-notice-declaration-form"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition-all group cursor-pointer"
          >
            <div className="p-3 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
              <FaGavel className="text-red-600 text-xl" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-800">
                Prohibition Notice
              </h3>
              <p className="text-sm text-gray-500">
                Prohibition notice declaration
              </p>
            </div>
            <FaExternalLinkAlt className="text-gray-400 group-hover:text-red-600 ml-auto" />
          </a>

          {/* Person In Day To Day Charge Form */}
          <a
            href="/person-in-day-to-day-charge-form"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all group cursor-pointer"
          >
            <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
              <FaUser className="text-purple-600 text-xl" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-800">
                Person In Day To Day
              </h3>
              <p className="text-sm text-gray-500">
                Day to day charge declaration
              </p>
            </div>
            <FaExternalLinkAlt className="text-gray-400 group-hover:text-purple-600 ml-auto" />
          </a>

          {/* Staff Record Form */}
          <a
            href="/staff-record-form"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all group cursor-pointer"
          >
            <div className="p-3 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
              <FaIdCard className="text-orange-600 text-xl" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-800">Staff Record</h3>
              <p className="text-sm text-gray-500">Staff record form</p>
            </div>
            <FaExternalLinkAlt className="text-gray-400 group-hover:text-orange-600 ml-auto" />
          </a>

          {/* Child Safe Code of Policy Form */}
          <a
            href="/child-safe-code-of-policy-form"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-all group cursor-pointer"
          >
            <div className="p-3 bg-teal-100 rounded-lg group-hover:bg-teal-200 transition-colors">
              <FaShieldAlt className="text-teal-600 text-xl" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-800">
                Child Safe Code of Policy
              </h3>
              <p className="text-sm text-gray-500">
                Child safe code of conduct policy
              </p>
            </div>
            <FaExternalLinkAlt className="text-gray-400 group-hover:text-teal-600 ml-auto" />
          </a>

          {/* Staff Induction Checklist Form */}
          <a
            href="/staff-induction-form"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all group cursor-pointer"
          >
            <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
              <FaClipboardCheck className="text-indigo-600 text-xl" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-800">
                Staff Induction Checklist
              </h3>
              <p className="text-sm text-gray-500">
                Complete staff induction checklist
              </p>
            </div>
            <FaExternalLinkAlt className="text-gray-400 group-hover:text-indigo-600 ml-auto" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Forms;
