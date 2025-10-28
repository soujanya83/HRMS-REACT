import React, { useState, useEffect, useCallback } from "react";
import {
  getEmployees,
  updateEmployeeStatus,
} from "../../services/employeeService";
import { useOrganizations } from "../../contexts/OrganizationContext";
import {
  FaCheckCircle,
  FaClock,
  FaSearch,
  FaUserCheck,
  FaUserClock,
  FaCalendarAlt,
} from "react-icons/fa";

export default function ProbationConfirmation() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");

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
        status:
          filter === "all"
            ? ""
            : filter === "probation"
            ? "On Probation"
            : "Active",
      };

      const response = await getEmployees(params);
      setEmployees(response.data.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, [selectedOrganization, searchTerm, filter]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchEmployees();
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [fetchEmployees]);

  const handleConfirmEmployee = async (employeeId) => {
    try {
      await updateEmployeeStatus(employeeId, "Active");
      // Update local state
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === employeeId ? { ...emp, status: "Active" } : emp
        )
      );
      alert("Employee confirmed successfully!");
    } catch (error) {
      console.error("Failed to confirm employee:", error);
      alert("Failed to confirm employee");
    }
  };

  const handleExtendProbation = async (employeeId, extendedDate) => {
    try {
      // You might need to create an API for this or update the employee's probation_end_date
      alert(
        `Probation extended until ${extendedDate} for employee ${employeeId}`
      );
      // Implement actual API call here
    } catch (error) {
      console.error("Failed to extend probation:", error);
      alert("Failed to extend probation");
    }
  };

  const calculateProbationProgress = (joiningDate) => {
    if (!joiningDate) return 0;

    const joinDate = new Date(joiningDate);
    const today = new Date();
    const probationDays = 90; // 3 months probation
    const daysPassed = Math.floor((today - joinDate) / (1000 * 60 * 60 * 24));

    return Math.min(Math.max((daysPassed / probationDays) * 100, 0), 100);
  };

  const getProbationRemainingDays = (joiningDate) => {
    if (!joiningDate) return 0;

    const joinDate = new Date(joiningDate);
    const today = new Date();
    const probationEnd = new Date(joinDate);
    probationEnd.setDate(probationEnd.getDate() + 90); // 3 months

    const remainingTime = probationEnd - today;
    return Math.ceil(remainingTime / (1000 * 60 * 60 * 24));
  };

  const stats = {
    total: employees.length,
    onProbation: employees.filter((emp) => emp.status === "On Probation")
      .length,
    confirmed: employees.filter((emp) => emp.status === "Active").length,
    endingSoon: employees.filter((emp) => {
      if (emp.status !== "On Probation") return false;
      const remainingDays = getProbationRemainingDays(emp.joining_date);
      return remainingDays <= 30 && remainingDays > 0;
    }).length,
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gray-100 min-h-full font-sans">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Probation & Confirmation
        </h1>
        <p className="text-gray-600">
          Manage employee probation periods and confirmations
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Employees</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <FaUserCheck className="text-blue-500 text-xl" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">On Probation</p>
              <p className="text-2xl font-bold text-gray-800">
                {stats.onProbation}
              </p>
            </div>
            <FaUserClock className="text-yellow-500 text-xl" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Confirmed</p>
              <p className="text-2xl font-bold text-gray-800">
                {stats.confirmed}
              </p>
            </div>
            <FaCheckCircle className="text-green-500 text-xl" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ending Soon</p>
              <p className="text-2xl font-bold text-gray-800">
                {stats.endingSoon}
              </p>
            </div>
            <FaClock className="text-orange-500 text-xl" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 p-4 bg-white shadow-lg rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Employees</option>
            <option value="probation">On Probation</option>
            <option value="confirmed">Confirmed</option>
          </select>

          <div className="md:col-span-2 flex justify-end items-center space-x-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Generate Reports
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              Bulk Actions
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
                Joining Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Probation Progress
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
              employees.map((emp) => {
                const progress = calculateProbationProgress(emp.joining_date);
                const remainingDays = getProbationRemainingDays(
                  emp.joining_date
                );
                const isOnProbation = emp.status === "On Probation";

                return (
                  <tr
                    key={emp.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
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
                      {emp.joining_date
                        ? new Date(emp.joining_date).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              progress >= 100
                                ? "bg-green-500"
                                : progress >= 70
                                ? "bg-yellow-500"
                                : "bg-blue-500"
                            }`}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500 w-12">
                          {isOnProbation
                            ? `${remainingDays}d left`
                            : "Completed"}
                        </span>
                      </div>
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
                      <div className="flex space-x-2">
                        {isOnProbation && (
                          <>
                            <button
                              onClick={() => handleConfirmEmployee(emp.id)}
                              className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors flex items-center"
                            >
                              <FaCheckCircle className="mr-1" /> Confirm
                            </button>
                            <button
                              onClick={() =>
                                handleExtendProbation(
                                  emp.id,
                                  new Date().toISOString().split("T")[0]
                                )
                              }
                              className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors flex items-center"
                            >
                              <FaCalendarAlt className="mr-1" /> Extend
                            </button>
                          </>
                        )}
                        {emp.status === "Active" && (
                          <span className="text-green-600 text-xs flex items-center">
                            <FaCheckCircle className="mr-1" /> Confirmed
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-10 text-gray-500">
                  No employees found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Upcoming Confirmations */}
      <div className="mt-6 bg-white shadow-lg rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <FaClock className="mr-2 text-orange-500" />
          Upcoming Confirmations (Next 30 Days)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees
            .filter((emp) => {
              if (emp.status !== "On Probation") return false;
              const remainingDays = getProbationRemainingDays(emp.joining_date);
              return remainingDays <= 30 && remainingDays > 0;
            })
            .slice(0, 6)
            .map((emp) => (
              <div
                key={emp.id}
                className="border border-orange-200 rounded-lg p-4 bg-orange-50"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      {emp.first_name} {emp.last_name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {emp.department?.name}
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                    {getProbationRemainingDays(emp.joining_date)} days
                  </span>
                </div>
                <button
                  onClick={() => handleConfirmEmployee(emp.id)}
                  className="w-full mt-2 px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                >
                  Confirm Now
                </button>
              </div>
            ))}
          {employees.filter((emp) => {
            const remainingDays = getProbationRemainingDays(emp.joining_date);
            return remainingDays <= 30 && remainingDays > 0;
          }).length === 0 && (
            <div className="col-span-3 text-center py-4 text-gray-500">
              No upcoming confirmations in the next 30 days.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
