import React, { useEffect, useState, useCallback } from "react";
import {
  getEmployees,
  deleteEmployee,
  getTrashedEmployees,
  restoreEmployee,
  forceDeleteEmployee,
} from "../../services/employeeService";
import { Link, useNavigate } from "react-router-dom";
import {
  FaEdit,
  FaTrash,
  FaEye,
  FaPlus,
  FaUndo,
  FaTrashAlt,
  FaSearch,
} from "react-icons/fa";
import { useOrganizations } from "../../contexts/OrganizationContext"; // THE FIX: Import context

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <p className="mb-6 text-gray-700">{message}</p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("active"); // 'active' or 'trashed'
  const [searchTerm, setSearchTerm] = useState("");
  const [modalState, setModalState] = useState({
    isOpen: false,
    action: null,
    title: "",
    message: "",
  });
  const navigate = useNavigate();

  // THE FIX: Get the currently selected organization from the global context
  const { selectedOrganization } = useOrganizations();

  const fetchAllEmployees = useCallback(async () => {
    // THE FIX: Do not fetch if no organization is selected
    if (!selectedOrganization) {
      setLoading(false);
      setEmployees([]);
      return;
    }

    setLoading(true);
    try {
      // THE FIX: Pass the organization_id and search term to the API
      const params = {
        search: searchTerm,
        organization_id: selectedOrganization.id,
      };

      const response =
        view === "active"
          ? await getEmployees(params)
          : await getTrashedEmployees(params);
      setEmployees(response.data.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, [view, searchTerm, selectedOrganization]); // THE FIX: Add selectedOrganization as a dependency

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchAllEmployees();
    }, 300); // Debounce search to avoid rapid API calls
    return () => clearTimeout(debounceTimer);
  }, [fetchAllEmployees]);

  const openModal = (action, title, message) => {
    setModalState({ isOpen: true, action, title, message });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, action: null, title: "", message: "" });
  };

  const handleConfirm = async () => {
    if (modalState.action) {
      await modalState.action();
    }
    fetchAllEmployees(); // Refresh list after action
    closeModal();
  };

  const handleDelete = (id) => {
    openModal(
      () => deleteEmployee(id),
      "Confirm Trash",
      "Are you sure you want to move this employee to the trash?"
    );
  };

  const handleRestore = (id) => {
    openModal(
      () => restoreEmployee(id),
      "Confirm Restore",
      "Are you sure you want to restore this employee?"
    );
  };

  const handleForceDelete = (id) => {
    openModal(
      () => forceDeleteEmployee(id),
      "Confirm Permanent Deletion",
      "This action is irreversible. Are you sure you want to permanently delete this employee and all associated data?"
    );
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gray-100 min-h-full font-sans">
      <ConfirmationModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        onConfirm={handleConfirm}
        title={modalState.title}
        message={modalState.message}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">
          Employee Management
        </h1>
        <button
          onClick={() => navigate("/dashboard/employees/new")}
          className="w-full md:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 flex items-center justify-center gap-2 transition-all"
        >
          <FaPlus /> Add New Employee
        </button>
      </div>

      {/* Filters and View Toggle Card */}
      <div className="mb-6 p-4 bg-white shadow-lg rounded-lg flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-1/3">
          <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-300 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2 p-1 bg-gray-200 rounded-lg">
          <button
            onClick={() => setView("active")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              view === "active"
                ? "bg-white shadow text-blue-600"
                : "text-gray-600"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setView("trashed")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              view === "trashed"
                ? "bg-white shadow text-blue-600"
                : "text-gray-600"
            }`}
          >
            Trash
          </button>
        </div>
      </div>

      {/* Employee Table */}
      <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-10 text-gray-500">
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {emp.personal_email}
                    </div>
                    <div className="text-sm text-gray-500">
                      {emp.phone_number}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowGrap">
                    {/* THE FIX: Check if designation/department exist before accessing name/title */}
                    <div className="text-sm text-gray-900">
                      {emp.designation?.title || "N/A"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {emp.department?.name || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        emp.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {emp.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <div className="flex justify-center items-center gap-4">
                      {view === "active" ? (
                        <>
                          <Link
                            to={`/dashboard/employees/${emp.id}`}
                            title="View Profile"
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <FaEye size={16} />
                          </Link>
                          <Link
                            to={`/dashboard/employees/edit/${emp.id}`}
                            title="Edit"
                            className="text-yellow-500 hover:text-yellow-700 transition-colors"
                          >
                            <FaEdit size={16} />
                          </Link>
                          <button
                            onClick={() => handleDelete(emp.id)}
                            title="Trash"
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                            <FaTrash size={16} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleRestore(emp.id)}
                            title="Restore"
                            className="text-green-600 hover:text-green-800 transition-colors"
                          >
                            <FaUndo size={16} />
                          </button>
                          <button
                            onClick={() => handleForceDelete(emp.id)}
                            title="Delete Permanently"
                            className="text-red-800 hover:text-red-900 transition-colors"
                          >
                            <FaTrashAlt size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-10 text-gray-500">
                  No employees found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
