import React, { useState, useEffect, useCallback } from "react";
import {
  getEmployees,
  updateEmployeeStatus,
} from "../../services/employeeService";
import {
  getProbationPeriods,
  createProbationPeriod,
  updateProbationPeriod,
  deleteProbationPeriod,
  getProbationPeriodsByEmployee
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
  FaExclamationTriangle
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

  const { selectedOrganization } = useOrganizations();

  // Probation form state
  const [probationForm, setProbationForm] = useState({
    employee_id: "",
    start_date: "",
    end_date: "",
    duration_days: 90,
    status: "active",
    notes: "",
    extended_from: null
  });

  const fetchData = useCallback(async () => {
    if (!selectedOrganization) {
      setLoading(false);
      setEmployees([]);
      setProbationPeriods([]);
      return;
    }

    setLoading(true);
    try {
      const params = {
        search: searchTerm,
        organization_id: selectedOrganization.id,
        status: filter === "all" ? "" : (filter === "probation" ? "On Probation" : "Active")
      };

      const [employeesRes, probationRes] = await Promise.all([
        getEmployees(params),
        getProbationPeriods({ organization_id: selectedOrganization.id })
      ]);

      setEmployees(employeesRes.data.data);
      setProbationPeriods(probationRes.data.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
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
      
      // Also update probation period status
      const employeeProbation = probationPeriods.find(pp => pp.employee_id === employeeId);
      if (employeeProbation) {
        await updateProbationPeriod(employeeProbation.id, {
          ...employeeProbation,
          status: "completed"
        });
      }
      
      setEmployees(prev => prev.map(emp => 
        emp.id === employeeId ? { ...emp, status: "Active" } : emp
      ));
      
      setProbationPeriods(prev => prev.map(pp => 
        pp.employee_id === employeeId ? { ...pp, status: "completed" } : pp
      ));
      
      alert('Employee confirmed successfully!');
    } catch (error) {
      console.error("Failed to confirm employee:", error);
      alert('Failed to confirm employee');
    }
  };

  const handleExtendProbation = async (employeeId, extendedDate) => {
    try {
      const employeeProbation = probationPeriods.find(pp => pp.employee_id === employeeId);
      if (employeeProbation) {
        await updateProbationPeriod(employeeProbation.id, {
          ...employeeProbation,
          end_date: extendedDate,
          status: "extended",
          notes: `Probation extended until ${extendedDate}`
        });
        
        setProbationPeriods(prev => prev.map(pp => 
          pp.employee_id === employeeId ? { 
            ...pp, 
            end_date: extendedDate,
            status: "extended" 
          } : pp
        ));
        
        alert(`Probation extended until ${extendedDate} for employee ${employeeId}`);
      }
    } catch (error) {
      console.error("Failed to extend probation:", error);
      alert('Failed to extend probation');
    }
  };

  const handleAddProbation = (employee) => {
    setSelectedEmployee(employee);
    setProbationForm({
      employee_id: employee.id,
      start_date: employee.joining_date || new Date().toISOString().split('T')[0],
      end_date: calculateProbationEndDate(employee.joining_date),
      duration_days: 90,
      status: "active",
      notes: "",
      extended_from: null
    });
    setShowProbationForm(true);
    setEditingProbation(null);
  };

  const handleEditProbation = (probation) => {
    setEditingProbation(probation);
    setProbationForm({
      employee_id: probation.employee_id,
      start_date: probation.start_date,
      end_date: probation.end_date,
      duration_days: probation.duration_days,
      status: probation.status,
      notes: probation.notes || "",
      extended_from: probation.extended_from
    });
    setShowProbationForm(true);
  };

  const handleDeleteProbation = async (probationId) => {
    if (!window.confirm('Are you sure you want to delete this probation period?')) return;
    
    try {
      await deleteProbationPeriod(probationId);
      setProbationPeriods(prev => prev.filter(pp => pp.id !== probationId));
      alert('Probation period deleted successfully!');
    } catch (error) {
      console.error("Failed to delete probation period:", error);
      alert('Failed to delete probation period');
    }
  };

  const handleProbationFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProbation) {
        await updateProbationPeriod(editingProbation.id, probationForm);
        setProbationPeriods(prev => prev.map(pp => 
          pp.id === editingProbation.id ? { ...pp, ...probationForm } : pp
        ));
        alert('Probation period updated successfully!');
      } else {
        const response = await createProbationPeriod(probationForm);
        setProbationPeriods(prev => [...prev, response.data.data]);
        alert('Probation period added successfully!');
      }
      setShowProbationForm(false);
      setEditingProbation(null);
      setProbationForm({
        employee_id: "",
        start_date: "",
        end_date: "",
        duration_days: 90,
        status: "active",
        notes: "",
        extended_from: null
      });
    } catch (error) {
      console.error("Failed to save probation period:", error);
      alert('Failed to save probation period');
    }
  };

  const handleFormInputChange = (e) => {
    const { name, value } = e.target;
    setProbationForm(prev => ({ ...prev, [name]: value }));
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
    if (!startDate) return '';
    const start = new Date(startDate);
    start.setDate(start.getDate() + durationDays);
    return start.toISOString().split('T')[0];
  };

  const getEmployeeProbation = (employeeId) => {
    return probationPeriods.find(pp => pp.employee_id === employeeId);
  };

  const stats = {
    total: employees.length,
    onProbation: employees.filter(emp => emp.status === "On Probation").length,
    confirmed: employees.filter(emp => emp.status === "Active").length,
    endingSoon: employees.filter(emp => {
      if (emp.status !== "On Probation") return false;
      const probation = getEmployeeProbation(emp.id);
      if (!probation) return false;
      const remainingDays = getProbationRemainingDays(probation.end_date);
      return remainingDays <= 30 && remainingDays > 0;
    }).length
  };

  // Probation Form Modal
  const ProbationFormModal = () => {
    if (!showProbationForm) return null;

    const employee = employees.find(emp => emp.id === probationForm.employee_id);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">
            {editingProbation ? 'Edit Probation Period' : 'Add Probation Period'}
          </h2>
          <form onSubmit={handleProbationFormSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee
                </label>
                {employee ? (
                  <input
                    type="text"
                    value={`${employee.first_name} ${employee.last_name}`}
                    disabled
                    className="w-full border border-gray-300 px-3 py-2 rounded bg-gray-100"
                  />
                ) : (
                  <select
                    name="employee_id"
                    value={probationForm.employee_id}
                    onChange={handleFormInputChange}
                    required
                    className="w-full border border-gray-300 px-3 py-2 rounded"
                  >
                    <option value="">Select Employee</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.first_name} {emp.last_name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={probationForm.status}
                  onChange={handleFormInputChange}
                  required
                  className="w-full border border-gray-300 px-3 py-2 rounded"
                >
                  <option value="active">Active</option>
                  <option value="extended">Extended</option>
                  <option value="completed">Completed</option>
                  <option value="terminated">Terminated</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={probationForm.start_date}
                  onChange={handleFormInputChange}
                  required
                  className="w-full border border-gray-300 px-3 py-2 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date *
                </label>
                <input
                  type="date"
                  name="end_date"
                  value={probationForm.end_date}
                  onChange={handleFormInputChange}
                  required
                  className="w-full border border-gray-300 px-3 py-2 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (Days)
                </label>
                <input
                  type="number"
                  name="duration_days"
                  value={probationForm.duration_days}
                  onChange={handleFormInputChange}
                  className="w-full border border-gray-300 px-3 py-2 rounded"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={probationForm.notes}
                  onChange={handleFormInputChange}
                  rows="3"
                  className="w-full border border-gray-300 px-3 py-2 rounded"
                  placeholder="Additional notes about the probation period..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => {
                  setShowProbationForm(false);
                  setEditingProbation(null);
                  setSelectedEmployee(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {editingProbation ? 'Update Probation' : 'Add Probation'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gray-100 min-h-full font-sans">
      <ProbationFormModal />

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
            <button 
              onClick={() => setShowProbationForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <FaPlus className="mr-2" /> Add Probation
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              Generate Reports
            </button>
          </div>
        </div>
      </div>

      {/* Employees Table */}
      <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Employee</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Department</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Joining Date</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Probation Progress</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
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
                const probation = getEmployeeProbation(emp.id);
                const progress = probation ? calculateProbationProgress(probation.start_date, probation.end_date) : 0;
                const remainingDays = probation ? getProbationRemainingDays(probation.end_date) : 0;
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
                              progress >= 100 ? "bg-green-500" : 
                              progress >= 70 ? "bg-yellow-500" : "bg-blue-500"
                            }`}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500 w-12">
                          {isOnProbation && probation
                            ? `${remainingDays}d left`
                            : probation?.status === 'completed' 
                            ? 'Completed' 
                            : 'No Probation'}
                        </span>
                      </div>
                      {probation && (
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(probation.start_date).toLocaleDateString()} - {new Date(probation.end_date).toLocaleDateString()}
                        </div>
                      )}
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
                      {probation && (
                        <div className="text-xs text-gray-500 mt-1">
                          {probation.status}
                        </div>
                      )}
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
                              onClick={() => handleExtendProbation(emp.id, new Date().toISOString().split("T")[0])}
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
                        {probation && (
                          <>
                            <button
                              onClick={() => handleEditProbation(probation)}
                              className="px-2 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700 transition-colors"
                              title="Edit Probation"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDeleteProbation(probation.id)}
                              className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                              title="Delete Probation"
                            >
                              <FaTrash />
                            </button>
                          </>
                        )}
                        {!probation && isOnProbation && (
                          <button
                            onClick={() => handleAddProbation(emp)}
                            className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                            title="Add Probation"
                          >
                            <FaPlus />
                          </button>
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
                      {remainingDays} days
                    </span>
                  </div>
                  {probation && (
                    <p className="text-xs text-gray-500 mb-2">
                      Ends: {new Date(probation.end_date).toLocaleDateString()}
                    </p>
                  )}
                  <button
                    onClick={() => handleConfirmEmployee(emp.id)}
                    className="w-full mt-2 px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
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
            <div className="col-span-3 text-center py-4 text-gray-500">
              No upcoming confirmations in the next 30 days.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}