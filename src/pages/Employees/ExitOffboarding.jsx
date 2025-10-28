/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";
import {
  getEmployees,
  updateEmployeeStatus,
} from "../../services/employeeService";
import { useOrganizations } from "../../contexts/OrganizationContext";
import {
  FaUserTimes,
  FaSignOutAlt,
  FaSearch,
  FaCalendarAlt,
  FaFileExport,
} from "react-icons/fa";

export default function ExitOffboarding() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showExitForm, setShowExitForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const { selectedOrganization } = useOrganizations();

  const fetchEmployees = useCallback(async () => {
    if (!selectedOrganization) {
      setLoading(false);
      setEmployees([]);
      return;
    }

    setLoading(true);
    try {
      const params = {
        search: searchTerm,
        organization_id: selectedOrganization.id,
      };

      const response = await getEmployees(params);
      // Filter out terminated employees for the main list
      const activeEmployees = response.data.data.filter(
        (emp) => emp.status !== "Terminated"
      );
      setEmployees(activeEmployees);
    } catch (error) {
      console.error("Error fetching employees:", error);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, [selectedOrganization, searchTerm]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchEmployees();
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [fetchEmployees]);

  const handleInitiateExit = (employee) => {
    setSelectedEmployee(employee);
    setShowExitForm(true);
  };

  const handleTerminateEmployee = async (exitData) => {
    try {
      await updateEmployeeStatus(selectedEmployee.id, "Terminated");
      // You might want to call a separate API for exit details
      alert(
        `Exit process initiated for ${selectedEmployee.first_name} ${selectedEmployee.last_name}`
      );
      setShowExitForm(false);
      setSelectedEmployee(null);
      fetchEmployees(); // Refresh the list
    } catch (error) {
      console.error("Failed to terminate employee:", error);
      alert("Failed to initiate exit process");
    }
  };

  const ExitFormModal = () => {
    const [formData, setFormData] = useState({
      lastWorkingDay: "",
      exitReason: "",
      handoverTo: "",
      notes: "",
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      handleTerminateEmployee(formData);
    };

    if (!showExitForm) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl">
          <h2 className="text-xl font-bold mb-4">Initiate Exit Process</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee
                </label>
                <input
                  type="text"
                  value={`${selectedEmployee.first_name} ${selectedEmployee.last_name}`}
                  disabled
                  className="w-full border border-gray-300 px-3 py-2 rounded bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Working Day *
                </label>
                <input
                  type="date"
                  required
                  value={formData.lastWorkingDay}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      lastWorkingDay: e.target.value,
                    }))
                  }
                  className="w-full border border-gray-300 px-3 py-2 rounded"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exit Reason *
                </label>
                <select
                  required
                  value={formData.exitReason}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      exitReason: e.target.value,
                    }))
                  }
                  className="w-full border border-gray-300 px-3 py-2 rounded"
                >
                  <option value="">Select Reason</option>
                  <option value="resignation">Resignation</option>
                  <option value="termination">Termination</option>
                  <option value="end_of_contract">End of Contract</option>
                  <option value="retirement">Retirement</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Handover To
                </label>
                <select
                  value={formData.handoverTo}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      handoverTo: e.target.value,
                    }))
                  }
                  className="w-full border border-gray-300 px-3 py-2 rounded"
                >
                  <option value="">Select Employee</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  rows="3"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  className="w-full border border-gray-300 px-3 py-2 rounded"
                  placeholder="Additional notes about the exit process..."
                />
              </div>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => {
                  setShowExitForm(false);
                  setSelectedEmployee(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Initiate Exit Process
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gray-100 min-h-full font-sans">
      <ExitFormModal />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Exit & Offboarding
        </h1>
        <p className="text-gray-600">
          Manage employee exits and offboarding processes
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Employees</p>
              <p className="text-2xl font-bold text-gray-800">
                {employees.length}
              </p>
            </div>
            <FaUserTimes className="text-blue-500 text-xl" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Exits</p>
              <p className="text-2xl font-bold text-gray-800">0</p>
            </div>
            <FaSignOutAlt className="text-orange-500 text-xl" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed This Month</p>
              <p className="text-2xl font-bold text-gray-800">0</p>
            </div>
            <FaFileExport className="text-green-500 text-xl" />
          </div>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="mb-6 p-4 bg-white shadow-lg rounded-lg">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="relative w-full md:w-1/3">
            <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex space-x-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center">
              <FaFileExport className="mr-2" /> Exit Reports
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center">
              <FaCalendarAlt className="mr-2" /> Schedule Bulk
            </button>
          </div>
        </div>
      </div>

      {/* Employees Table */}
      <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Employee
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Designation
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Joining Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-10 text-gray-500">
                  Loading employees...
                </td>
              </tr>
            ) : employees.length > 0 ? (
              employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {emp.first_name} {emp.last_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {emp.employee_code}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {emp.department?.name || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {emp.designation?.title || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {emp.joining_date
                      ? new Date(emp.joining_date).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        emp.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : emp.status === "On Probation"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleInitiateExit(emp)}
                      className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors flex items-center"
                    >
                      <FaSignOutAlt className="mr-1" /> Initiate Exit
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-10 text-gray-500">
                  No active employees found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Recent Exits Section */}
      <div className="mt-6 bg-white shadow-lg rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <FaUserTimes className="mr-2 text-red-500" />
          Recent Exits (Last 30 Days)
        </h3>
        <div className="text-center py-8 text-gray-500">
          <FaUserTimes className="text-4xl mx-auto mb-4 text-gray-300" />
          <p>No recent exits in the last 30 days.</p>
        </div>
      </div>
    </div>
  );
}
