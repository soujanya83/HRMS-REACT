import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  getEmployees,
  updateEmployeeStatus,
} from "../../services/employeeService";
import {
  getProbationPeriods,
  createProbationPeriod,
  updateProbationPeriod,
  deleteProbationPeriod,
} from "../../services/probationService";
import { useOrganizations } from "../../contexts/OrganizationContext";
import {
  FaCheckCircle,
  FaClock,
  FaSearch,
  FaUserCheck,
  FaUserClock,
  FaCalendarAlt,
  FaPlus,
  FaEdit,
  FaTrash,
  FaExclamationTriangle,
  FaFileExport,
  FaTimesCircle,
} from "react-icons/fa";

export default function ProbationConfirmation() {
  const [employees, setEmployees] = useState([]);
  const [probationPeriods, setProbationPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [showProbationForm, setShowProbationForm] = useState(false);
  const [editingProbation, setEditingProbation] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [error, setError] = useState(null);

  const { selectedOrganization } = useOrganizations();

  // Probation form state
  const [probationForm, setProbationForm] = useState({
    employee_id: "",
    start_date: "",
    end_date: "",
    status: "Active",
    notes: "",
    confirmation_date: null,
  });

  // Separate local form state to prevent re-renders
  const [localProbationForm, setLocalProbationForm] = useState(probationForm);

  // Sync local form when probationForm changes (on edit/open)
  useEffect(() => {
    setLocalProbationForm(probationForm);
  }, [probationForm]);

  const fetchData = useCallback(async () => {
    if (!selectedOrganization) {
      setLoading(false);
      setEmployees([]);
      setProbationPeriods([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const employeeStatusFilter =
        filter === "all"
          ? ""
          : filter === "probation"
          ? "On Probation"
          : "Active";

      const params = {
        search: searchTerm,
        organization_id: selectedOrganization.id,
        status: employeeStatusFilter,
      };

      const [employeesRes, probationRes] = await Promise.all([
        getEmployees(params),
        getProbationPeriods({ organization_id: selectedOrganization.id }),
      ]);

      setEmployees(employeesRes.data?.data || []);
      setProbationPeriods(probationRes.data?.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load data. Please try again.");
      setEmployees([]);
      setProbationPeriods([]);
    } finally {
      setLoading(false);
    }
  }, [selectedOrganization, searchTerm, filter]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [fetchData]);

  const handleConfirmEmployee = async (employeeId) => {
    try {
      await updateEmployeeStatus(employeeId, "Active");

      const employeeProbation = probationPeriods.find(
        (pp) => pp.employee_id === employeeId
      );
      if (employeeProbation) {
        const probationData = {
          employee_id: employeeId,
          start_date: employeeProbation.start_date,
          end_date: employeeProbation.end_date,
          status: "Completed",
          feedback: employeeProbation.feedback || "Employee confirmed successfully",
          confirmation_date: new Date().toISOString().split("T")[0],
        };

        await updateProbationPeriod(employeeProbation.id, probationData);
      }

      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === employeeId ? { ...emp, status: "Active" } : emp
        )
      );

      setProbationPeriods((prev) =>
        prev.map((pp) =>
          pp.employee_id === employeeId
            ? {
                ...pp,
                status: "Completed",
                confirmation_date: new Date().toISOString().split("T")[0],
              }
            : pp
        )
      );

      alert("Employee confirmed successfully!");
    } catch (error) {
      console.error("Failed to confirm employee:", error);
      const errorMsg = error.response?.data?.message || "Failed to confirm employee";
      alert(`Error: ${errorMsg}`);
    }
  };

  const handleExtendProbation = async (employeeId) => {
    const employee = employees.find((emp) => emp.id === employeeId);
    const currentProbation = probationPeriods.find(
      (pp) => pp.employee_id === employeeId
    );

    if (!employee || !currentProbation) {
      alert("Employee or probation data not found");
      return;
    }

    const currentEndDate = new Date(currentProbation.end_date);
    const newEndDate = new Date(currentEndDate);
    newEndDate.setDate(newEndDate.getDate() + 30);
    const extendedDate = newEndDate.toISOString().split("T")[0];

    try {
      const probationData = {
        employee_id: employeeId,
        start_date: currentProbation.start_date,
        end_date: extendedDate,
        status: "Extended",
        feedback: `Probation extended by 30 days until ${extendedDate}. Previous feedback: ${currentProbation.feedback || "None"}`,
        confirmation_date: currentProbation.confirmation_date,
      };

      await updateProbationPeriod(currentProbation.id, probationData);

      setProbationPeriods((prev) =>
        prev.map((pp) =>
          pp.employee_id === employeeId
            ? {
                ...pp,
                end_date: extendedDate,
                status: "Extended",
                feedback: probationData.feedback,
              }
            : pp
        )
      );

      alert(
        `Probation extended until ${extendedDate} for ${employee.first_name} ${employee.last_name}`
      );
    } catch (error) {
      console.error("Failed to extend probation:", error);
      const errorMsg = error.response?.data?.message || "Failed to extend probation";
      alert(`Error: ${errorMsg}`);
    }
  };

  const handleAddProbation = (employee) => {
    setSelectedEmployee(employee);
    setError(null);

    const startDate = employee.joining_date || new Date().toISOString().split("T")[0];
    const endDate = calculateProbationEndDate(startDate, 90);

    const newForm = {
      employee_id: employee.id,
      start_date: startDate,
      end_date: endDate,
      status: "Active",
      notes: "",
      confirmation_date: null,
    };
    
    setProbationForm(newForm);
    setLocalProbationForm(newForm);
    setShowProbationForm(true);
    setEditingProbation(null);
  };

  const handleEditProbation = (probation) => {
    setEditingProbation(probation);
    setError(null);

    const newForm = {
      employee_id: probation.employee_id,
      start_date: probation.start_date,
      end_date: probation.end_date,
      status: probation.status,
      notes: probation.feedback || "",
      confirmation_date: probation.confirmation_date,
    };
    
    setProbationForm(newForm);
    setLocalProbationForm(newForm);
    setShowProbationForm(true);
  };

  const handleDeleteProbation = async (probationId) => {
    if (!window.confirm("Are you sure you want to delete this probation period?"))
      return;

    try {
      await deleteProbationPeriod(probationId);
      setProbationPeriods((prev) => prev.filter((pp) => pp.id !== probationId));
      alert("Probation period deleted successfully!");
    } catch (error) {
      console.error("Failed to delete probation period:", error);
      const errorMsg = error.response?.data?.message || "Failed to delete probation period";
      alert(`Error: ${errorMsg}`);
    }
  };

  // Optimized form input handler
  const handleFormInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setLocalProbationForm((prev) => ({ ...prev, [name]: value }));
    
    // Update main form after a short delay to prevent excessive re-renders
    setTimeout(() => {
      setProbationForm((prev) => ({ ...prev, [name]: value }));
    }, 10);
  }, []);

  const handleProbationFormSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const apiData = {
        employee_id: localProbationForm.employee_id,
        start_date: localProbationForm.start_date,
        end_date: localProbationForm.end_date,
        status: localProbationForm.status,
        feedback: localProbationForm.notes,
        confirmation_date: localProbationForm.confirmation_date || null,
      };

      if (editingProbation) {
        await updateProbationPeriod(editingProbation.id, apiData);

        setProbationPeriods((prev) =>
          prev.map((pp) =>
            pp.id === editingProbation.id
              ? {
                  ...pp,
                  ...apiData,
                  feedback: apiData.feedback,
                }
              : pp
          )
        );
        alert("Probation period updated successfully!");
      } else {
        const response = await createProbationPeriod(apiData);
        const newProbation = response.data.data;

        setProbationPeriods((prev) => [...prev, newProbation]);
        alert("Probation period added successfully!");
      }

      setShowProbationForm(false);
      setEditingProbation(null);
      setSelectedEmployee(null);
      const resetForm = {
        employee_id: "",
        start_date: "",
        end_date: "",
        status: "Active",
        notes: "",
        confirmation_date: null,
      };
      setProbationForm(resetForm);
      setLocalProbationForm(resetForm);
    } catch (error) {
      console.error("Failed to save probation period:", error);
      const errorMsg = error.response?.data?.message || error.message || "Unknown error";
      setError(`Failed to save: ${errorMsg}`);
    }
  };

  const handleGenerateReports = async () => {
    if (!selectedOrganization) {
      alert("Please select an organization first");
      return;
    }

    setGeneratingReport(true);
    try {
      const reportData = {
        organization: selectedOrganization.name || "Unknown Organization",
        report_date: new Date().toLocaleDateString(),
        total_employees: employees.length,
        on_probation: employees.filter((emp) => emp.status === "On Probation").length,
        confirmed_employees: employees.filter((emp) => emp.status === "Active").length,
        probation_details: probationPeriods.map((pp) => {
          const employee = employees.find((e) => e.id === pp.employee_id);
          return {
            employee_name: employee
              ? `${employee.first_name} ${employee.last_name}`
              : "Unknown Employee",
            employee_code: employee?.employee_code || "N/A",
            start_date: pp.start_date,
            end_date: pp.end_date,
            status: pp.status,
            remaining_days: getProbationRemainingDays(pp.end_date),
            feedback: pp.feedback || "No feedback",
            department: employee?.department?.name || "N/A",
          };
        }),
      };

      const csvContent = convertToCSV(reportData);
      
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `probation-report-${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      alert("Report generated and downloaded successfully!");
    } catch (error) {
      console.error("Failed to generate report:", error);
      alert("Failed to generate report: " + error.message);
    } finally {
      setGeneratingReport(false);
    }
  };

  const convertToCSV = (data) => {
    const headers = [
      "Employee Name",
      "Employee Code",
      "Department",
      "Start Date",
      "End Date",
      "Status",
      "Remaining Days",
      "Feedback",
    ];

    const rows = data.probation_details.map((item) => [
      item.employee_name,
      item.employee_code,
      item.department,
      item.start_date,
      item.end_date,
      item.status,
      item.remaining_days > 0 ? item.remaining_days : "Completed",
      `"${item.feedback.replace(/"/g, '""')}"`,
    ]);

    const csvArray = [
      `Probation Report - ${data.organization}`,
      `Report Date: ${data.report_date}`,
      `Total Employees: ${data.total_employees}`,
      `On Probation: ${data.on_probation}`,
      `Confirmed: ${data.confirmed_employees}`,
      "",
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ];

    return csvArray.join("\n");
  };

  const calculateProbationProgress = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();

    if (today >= end) return 100;
    if (today <= start) return 0;

    const totalDuration = end - start;
    const elapsed = today - start;

    return Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);
  };

  const getProbationRemainingDays = (endDate) => {
    if (!endDate) return 0;

    const end = new Date(endDate);
    const today = new Date();
    const remainingTime = end - today;

    return Math.ceil(remainingTime / (1000 * 60 * 60 * 24));
  };

  const calculateProbationEndDate = (startDate, durationDays = 90) => {
    if (!startDate) return "";
    const start = new Date(startDate);
    start.setDate(start.getDate() + durationDays);
    return start.toISOString().split("T")[0];
  };

  const getEmployeeProbation = (employeeId) => {
    return probationPeriods.find((pp) => pp.employee_id === employeeId);
  };

  const stats = {
    total: employees.length,
    onProbation: employees.filter((emp) => emp.status === "On Probation").length,
    confirmed: employees.filter((emp) => emp.status === "Active").length,
    endingSoon: employees.filter((emp) => {
      if (emp.status !== "On Probation") return false;
      const probation = getEmployeeProbation(emp.id);
      if (!probation) return false;
      const remainingDays = getProbationRemainingDays(probation.end_date);
      return remainingDays <= 30 && remainingDays > 0;
    }).length,
  };

  // Memoized Probation Form Modal
  const ProbationFormModal = useMemo(() => {
    if (!showProbationForm) return null;

    const ModalComponent = () => {
      const employee = employees.find(
        (emp) => emp.id === localProbationForm.employee_id
      );

      const availableEmployees = employees.filter((emp) => {
        const existingProbation = getEmployeeProbation(emp.id);
        return (
          !existingProbation ||
          existingProbation.status === "Completed" ||
          editingProbation?.employee_id === emp.id
        );
      });

      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {editingProbation ? "Edit Probation Period" : "Add Probation Period"}
              </h2>
              <button
                onClick={() => {
                  setShowProbationForm(false);
                  setEditingProbation(null);
                  setSelectedEmployee(null);
                  setError(null);
                }}
                className="text-gray-500 hover:text-gray-700"
                type="button"
              >
                <FaTimesCircle className="text-xl" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleProbationFormSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee *
                  </label>
                  {employee || selectedEmployee ? (
                    <input
                      type="text"
                      value={
                        employee
                          ? `${employee.first_name} ${employee.last_name} (${employee.employee_code})`
                          : selectedEmployee
                          ? `${selectedEmployee.first_name} ${selectedEmployee.last_name} (${selectedEmployee.employee_code})`
                          : ""
                      }
                      disabled
                      className="w-full border border-gray-300 px-3 py-2 rounded bg-gray-50"
                      readOnly
                    />
                  ) : (
                    <select
                      name="employee_id"
                      value={localProbationForm.employee_id}
                      onChange={handleFormInputChange}
                      required
                      className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Employee *</option>
                      {availableEmployees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.first_name} {emp.last_name} ({emp.employee_code})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status *
                  </label>
                  <select
                    name="status"
                    value={localProbationForm.status}
                    onChange={handleFormInputChange}
                    required
                    className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Extended">Extended</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    value={localProbationForm.start_date}
                    onChange={handleFormInputChange}
                    required
                    className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    name="end_date"
                    value={localProbationForm.end_date}
                    onChange={handleFormInputChange}
                    required
                    className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Feedback / Notes *
                  </label>
                  <textarea
                    name="notes"
                    value={localProbationForm.notes}
                    onChange={handleFormInputChange}
                    rows="3"
                    required
                    className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter feedback or notes about the probation period..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This will be saved as 'feedback' in the system
                  </p>
                </div>

                {localProbationForm.status === "Completed" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirmation Date
                    </label>
                    <input
                      type="date"
                      name="confirmation_date"
                      value={localProbationForm.confirmation_date || ""}
                      onChange={handleFormInputChange}
                      className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowProbationForm(false);
                    setEditingProbation(null);
                    setSelectedEmployee(null);
                    setError(null);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingProbation ? "Update Probation" : "Add Probation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      );
    };

    return <ModalComponent />;
  }, [
    showProbationForm,
    localProbationForm,
    employees,
    editingProbation,
    selectedEmployee,
    error,
    handleFormInputChange,
    handleProbationFormSubmit
  ]);

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen font-sans">
      {ProbationFormModal}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Probation & Confirmation
        </h1>
        <p className="text-gray-600">
          Manage employee probation periods and confirmations
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Employees</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <FaUserCheck className="text-blue-500 text-2xl" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">On Probation</p>
              <p className="text-2xl font-bold text-gray-800">
                {stats.onProbation}
              </p>
            </div>
            <FaUserClock className="text-yellow-500 text-2xl" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Confirmed</p>
              <p className="text-2xl font-bold text-gray-800">
                {stats.confirmed}
              </p>
            </div>
            <FaCheckCircle className="text-green-500 text-2xl" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ending Soon</p>
              <p className="text-2xl font-bold text-gray-800">
                {stats.endingSoon}
              </p>
            </div>
            <FaClock className="text-orange-500 text-2xl" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="mb-8 p-6 bg-white shadow-lg rounded-xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-4 relative">
            <FaSearch className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search employees by name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 pl-12 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Employees</option>
              <option value="probation">On Probation</option>
              <option value="confirmed">Confirmed</option>
            </select>
          </div>

          <div className="md:col-span-5 flex justify-end items-center space-x-4">
            <button
              onClick={() => setShowProbationForm(true)}
              className="px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center font-medium"
            >
              <FaPlus className="mr-2" /> Add Probation
            </button>
            <button
              onClick={handleGenerateReports}
              disabled={generatingReport || employees.length === 0}
              className={`px-5 py-3 rounded-lg transition-colors flex items-center font-medium ${
                generatingReport || employees.length === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              <FaFileExport className="mr-2" />
              {generatingReport ? "Generating..." : "Generate Reports"}
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && !showProbationForm && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <FaExclamationTriangle className="text-red-500 mr-2" />
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* Employees Table */}
      <div className="bg-white shadow-lg rounded-xl overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Joining Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Probation Progress
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                    <p className="mt-2 text-gray-500">Loading employees...</p>
                  </td>
                </tr>
              ) : employees.length > 0 ? (
                employees.map((emp) => {
                  const probation = getEmployeeProbation(emp.id);
                  const progress = probation
                    ? calculateProbationProgress(
                        probation.start_date,
                        probation.end_date
                      )
                    : 0;
                  const remainingDays = probation
                    ? getProbationRemainingDays(probation.end_date)
                    : 0;
                  const isOnProbation = emp.status === "On Probation";
                  const hasProbation = !!probation;

                  return (
                    <tr
                      key={emp.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold">
                              {emp.first_name?.[0]}
                              {emp.last_name?.[0]}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {emp.first_name} {emp.last_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {emp.employee_code}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {emp.department?.name || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {emp.joining_date
                            ? new Date(emp.joining_date).toLocaleDateString()
                            : "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-32 mr-3">
                            <div className="w-full bg-gray-200 rounded-full h-2">
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
                          </div>
                          <div className="text-sm text-gray-600 min-w-[80px]">
                            {hasProbation ? (
                              <>
                                {remainingDays > 0 ? (
                                  <span className="font-medium">
                                    {remainingDays}d left
                                  </span>
                                ) : (
                                  <span className="text-green-600 font-medium">
                                    Completed
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="text-gray-400">No Probation</span>
                            )}
                          </div>
                        </div>
                        {probation && (
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(probation.start_date).toLocaleDateString()} -{" "}
                            {new Date(probation.end_date).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            emp.status === "Active"
                              ? "bg-green-100 text-green-800"
                              : emp.status === "On Probation"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {emp.status}
                        </span>
                        {probation && (
                          <div className="text-xs text-gray-600 mt-1">
                            Probation: {probation.status}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-2">
                          {isOnProbation && (
                            <>
                              <button
                                onClick={() => handleConfirmEmployee(emp.id)}
                                className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors flex items-center"
                              >
                                <FaCheckCircle className="mr-1.5" /> Confirm
                              </button>
                              {hasProbation && (
                                <button
                                  onClick={() => handleExtendProbation(emp.id)}
                                  className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                                >
                                  <FaCalendarAlt className="mr-1.5" /> Extend
                                </button>
                              )}
                            </>
                          )}
                          {hasProbation && (
                            <>
                              <button
                                onClick={() => handleEditProbation(probation)}
                                className="px-3 py-1.5 bg-yellow-600 text-white text-xs rounded-lg hover:bg-yellow-700 transition-colors"
                                title="Edit Probation"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleDeleteProbation(probation.id)}
                                className="px-3 py-1.5 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors"
                                title="Delete Probation"
                              >
                                <FaTrash />
                              </button>
                            </>
                          )}
                          {isOnProbation && !hasProbation && (
                            <button
                              onClick={() => handleAddProbation(emp)}
                              className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                            >
                              <FaPlus className="mr-1.5" /> Add Probation
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <FaUserClock className="text-4xl text-gray-300 mx-auto mb-3" />
                      <p className="text-lg">No employees found</p>
                      <p className="text-sm mt-1">
                        {searchTerm
                          ? "Try a different search term"
                          : "Add employees or check organization selection"}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upcoming Confirmations */}
      <div className="bg-white shadow-lg rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
          <FaClock className="mr-3 text-orange-500" />
          Upcoming Confirmations (Next 30 Days)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees
            .filter((emp) => {
              if (emp.status !== "On Probation") return false;
              const probation = getEmployeeProbation(emp.id);
              if (!probation) return false;
              const remainingDays = getProbationRemainingDays(probation.end_date);
              return remainingDays <= 30 && remainingDays > 0;
            })
            .slice(0, 6)
            .map((emp) => {
              const probation = getEmployeeProbation(emp.id);
              const remainingDays = getProbationRemainingDays(probation?.end_date);

              return (
                <div
                  key={emp.id}
                  className="border border-orange-200 rounded-xl p-4 bg-orange-50 hover:bg-orange-100 transition-colors"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        {emp.first_name} {emp.last_name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {emp.department?.name || "No Department"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {emp.employee_code}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 text-xs rounded-full font-semibold ${
                        remainingDays <= 7
                          ? "bg-red-100 text-red-800"
                          : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {remainingDays} {remainingDays === 1 ? "day" : "days"}
                    </span>
                  </div>
                  {probation && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-600 mb-1">
                        Ends: {new Date(probation.end_date).toLocaleDateString()}
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-orange-500 h-1.5 rounded-full"
                          style={{
                            width: `${Math.min(
                              calculateProbationProgress(
                                probation.start_date,
                                probation.end_date
                              ),
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
                  <button
                    onClick={() => handleConfirmEmployee(emp.id)}
                    className="w-full px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Confirm Now
                  </button>
                </div>
              );
            })}
          {employees.filter((emp) => {
            const probation = getEmployeeProbation(emp.id);
            if (!probation) return false;
            const remainingDays = getProbationRemainingDays(probation.end_date);
            return remainingDays <= 30 && remainingDays > 0;
          }).length === 0 && (
            <div className="col-span-3 text-center py-8">
              <FaClock className="text-3xl text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No upcoming confirmations</p>
              <p className="text-sm text-gray-400 mt-1">
                No employees have probation ending in the next 30 days
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}