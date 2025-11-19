import React, { useState, useEffect } from "react";
import {
  FaCog,
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaDownload,
  FaUpload,
  FaCopy,
  FaSave,
  FaTimes,
  FaMoneyBillWave,
  FaPercentage,
  FaCalculator,
  FaUserTie,
  FaBuilding,
  FaChartBar,
} from "react-icons/fa";

const SalaryStructureSetup = () => {
  const [salaryStructures, setSalaryStructures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showStructureForm, setShowStructureForm] = useState(false);
  const [editingStructure, setEditingStructure] = useState(null);
  const [filters, setFilters] = useState({
    department: "all",
    grade: "all",
    search: "",
  });

  // Sample data
  const departments = [
    "Engineering",
    "Marketing",
    "Sales",
    "Design",
    "HR",
    "Finance",
    "Operations",
  ];
  const grades = ["A1", "A2", "B1", "B2", "C1", "C2", "D1", "D2"];

  const [newStructure, setNewStructure] = useState({
    name: "",
    department: "",
    grade: "",
    description: "",
    components: [
      {
        name: "Basic Salary",
        type: "fixed",
        value: 0,
        percentage: 50,
        is_editable: false,
      },
      {
        name: "HRA",
        type: "percentage",
        value: 0,
        percentage: 20,
        is_editable: true,
      },
      {
        name: "DA",
        type: "percentage",
        value: 0,
        percentage: 15,
        is_editable: true,
      },
      {
        name: "Conveyance",
        type: "fixed",
        value: 1600,
        percentage: 0,
        is_editable: true,
      },
      {
        name: "Medical",
        type: "fixed",
        value: 1250,
        percentage: 0,
        is_editable: true,
      },
      {
        name: "Special Allowance",
        type: "percentage",
        value: 0,
        percentage: 15,
        is_editable: true,
      },
    ],
    total_ctc: 0,
    effective_date: new Date().toISOString().split("T")[0],
    status: "active",
  });

  // API Base URL
  const API_BASE = "http://localhost:8000/api";

  // Fetch salary structures from API
  const fetchSalaryStructures = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE}/salary-structures?department=${filters.department}&grade=${filters.grade}&search=${filters.search}`
      );
      const data = await response.json();
      setSalaryStructures(data.data || []);
    } catch (error) {
      console.error("Error fetching salary structures:", error);
      // Fallback to sample data
      setSalaryStructures(getSampleStructures());
    } finally {
      setLoading(false);
    }
  };

  // Create or update salary structure
  const saveSalaryStructure = async (structureData) => {
    try {
      const url = editingStructure
        ? `${API_BASE}/salary-structures/${editingStructure.id}`
        : `${API_BASE}/salary-structures`;

      const method = editingStructure ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(structureData),
      });

      if (response.ok) {
        fetchSalaryStructures(); // Refresh the list
        return true;
      } else {
        console.error("Failed to save salary structure");
        return false;
      }
    } catch (error) {
      console.error("Error saving salary structure:", error);
      return false;
    }
  };

  // Delete salary structure
  const deleteSalaryStructure = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/salary-structures/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchSalaryStructures(); // Refresh the list
        return true;
      } else {
        console.error("Failed to delete salary structure");
        return false;
      }
    } catch (error) {
      console.error("Error deleting salary structure:", error);
      return false;
    }
  };

  useEffect(() => {
    fetchSalaryStructures();
  }, [filters]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewStructure((prev) => ({ ...prev, [name]: value }));
  };

  const handleComponentChange = (index, field, value) => {
    const updatedComponents = [...newStructure.components];
    updatedComponents[index] = { ...updatedComponents[index], [field]: value };

    // Recalculate values if percentage or type changes
    if (field === "percentage" || field === "type") {
      updatedComponents[index].value =
        field === "percentage"
          ? (newStructure.total_ctc * value) / 100
          : updatedComponents[index].value;
    }

    setNewStructure((prev) => ({ ...prev, components: updatedComponents }));
  };

  const calculateTotalCTC = () => {
    const fixedComponents = newStructure.components.filter(
      (comp) => comp.type === "fixed"
    );
    const percentageComponents = newStructure.components.filter(
      (comp) => comp.type === "percentage"
    );

    const fixedTotal = fixedComponents.reduce(
      (sum, comp) => sum + parseFloat(comp.value || 0),
      0
    );
    const percentageTotal = percentageComponents.reduce(
      (sum, comp) => sum + parseFloat(comp.percentage || 0),
      0
    );

    if (percentageTotal > 0) {
      const calculatedCTC = fixedTotal / (1 - percentageTotal / 100);
      setNewStructure((prev) => ({
        ...prev,
        total_ctc: Math.round(calculatedCTC),
      }));

      // Update percentage component values
      const updatedComponents = newStructure.components.map((comp) => {
        if (comp.type === "percentage") {
          return {
            ...comp,
            value: Math.round((calculatedCTC * comp.percentage) / 100),
          };
        }
        return comp;
      });
      setNewStructure((prev) => ({ ...prev, components: updatedComponents }));
    }
  };

  const handleSubmitStructure = async (e) => {
    e.preventDefault();
    calculateTotalCTC();

    const structure = {
      ...newStructure,
      employee_count: 0,
    };

    const success = await saveSalaryStructure(structure);

    if (success) {
      setNewStructure({
        name: "",
        department: "",
        grade: "",
        description: "",
        components: [
          {
            name: "Basic Salary",
            type: "fixed",
            value: 0,
            percentage: 50,
            is_editable: false,
          },
          {
            name: "HRA",
            type: "percentage",
            value: 0,
            percentage: 20,
            is_editable: true,
          },
          {
            name: "DA",
            type: "percentage",
            value: 0,
            percentage: 15,
            is_editable: true,
          },
          {
            name: "Conveyance",
            type: "fixed",
            value: 1600,
            percentage: 0,
            is_editable: true,
          },
          {
            name: "Medical",
            type: "fixed",
            value: 1250,
            percentage: 0,
            is_editable: true,
          },
          {
            name: "Special Allowance",
            type: "percentage",
            value: 0,
            percentage: 15,
            is_editable: true,
          },
        ],
        total_ctc: 0,
        effective_date: new Date().toISOString().split("T")[0],
        status: "active",
      });
      setShowStructureForm(false);
      setEditingStructure(null);
    }
  };

  const handleEdit = (structure) => {
    setEditingStructure(structure);
    setNewStructure(structure);
    setShowStructureForm(true);
  };

  const handleDelete = async (id) => {
    if (
      window.confirm("Are you sure you want to delete this salary structure?")
    ) {
      const success = await deleteSalaryStructure(id);
      if (!success) {
        alert("Failed to delete salary structure. Please try again.");
      }
    }
  };

  const handleDuplicate = (structure) => {
    const duplicated = {
      ...structure,
      id: null,
      name: `${structure.name} (Copy)`,
      employee_count: 0,
    };
    setEditingStructure(null);
    setNewStructure(duplicated);
    setShowStructureForm(true);
  };

  const filteredStructures = salaryStructures.filter((structure) => {
    const matchesDepartment =
      filters.department === "all" ||
      structure.department === filters.department;
    const matchesGrade =
      filters.grade === "all" || structure.grade === filters.grade;
    const matchesSearch =
      filters.search === "" ||
      structure.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      structure.description
        .toLowerCase()
        .includes(filters.search.toLowerCase());

    return matchesDepartment && matchesGrade && matchesSearch;
  });

  const stats = {
    total: salaryStructures.length,
    active: salaryStructures.filter((s) => s.status === "active").length,
    employees: salaryStructures.reduce(
      (sum, s) => sum + (s.employee_count || 0),
      0
    ),
    avg_ctc:
      salaryStructures.length > 0
        ? Math.round(
            salaryStructures.reduce((sum, s) => sum + (s.total_ctc || 0), 0) /
              salaryStructures.length
          )
        : 0,
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Sample data fallback
  const getSampleStructures = () => [
    {
      id: 1,
      name: "Senior Software Engineer",
      department: "Engineering",
      grade: "B1",
      description: "Salary structure for senior software engineers",
      total_ctc: 1200000,
      effective_date: "2024-01-01",
      status: "active",
      employee_count: 15,
      components: [
        { name: "Basic Salary", type: "fixed", value: 600000, percentage: 50 },
        { name: "HRA", type: "percentage", value: 240000, percentage: 20 },
        { name: "DA", type: "percentage", value: 180000, percentage: 15 },
        { name: "Conveyance", type: "fixed", value: 19200, percentage: 1.6 },
        { name: "Medical", type: "fixed", value: 15000, percentage: 1.25 },
        {
          name: "Special Allowance",
          type: "percentage",
          value: 180000,
          percentage: 15,
        },
      ],
    },
    // ... other sample structures
  ];

  if (loading) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-300 rounded"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gray-100 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
            <FaCog className="mr-3 text-blue-600" />
            Salary Structure Setup
          </h1>
          <p className="text-gray-600">
            Create and manage salary structures for different roles and
            departments
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Structures</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.total}
                </p>
              </div>
              <FaBuilding className="text-blue-500 text-xl" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Structures</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.active}
                </p>
              </div>
              <FaUserTie className="text-green-500 text-xl" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Employees Covered</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.employees}
                </p>
              </div>
              <FaChartBar className="text-purple-500 text-xl" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average CTC</p>
                <p className="text-2xl font-bold text-gray-800">
                  {formatCurrency(stats.avg_ctc)}
                </p>
              </div>
              <FaMoneyBillWave className="text-orange-500 text-xl" />
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="mb-6 p-4 bg-white shadow-lg rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search structures..."
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
                className="w-full border border-gray-300 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={filters.department}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, department: e.target.value }))
              }
              className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>

            <select
              value={filters.grade}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, grade: e.target.value }))
              }
              className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Grades</option>
              {grades.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>

            <div className="flex gap-2">
              <button
                onClick={() => setShowStructureForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex-1"
              >
                <FaPlus /> New Structure
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <FaDownload />
              </button>
            </div>
          </div>
        </div>

        {/* Salary Structures Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Structure Details
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Department & Grade
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    CTC
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Employees
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Effective Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStructures.map((structure) => (
                  <tr
                    key={structure.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <FaMoneyBillWave className="text-green-500" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {structure.name}
                          </div>
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {structure.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {structure.department}
                      </div>
                      <div className="text-sm text-gray-500">
                        Grade {structure.grade}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-semibold text-blue-600">
                        {formatCurrency(structure.total_ctc)}
                      </div>
                      <div className="text-xs text-gray-500">per annum</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {structure.employee_count}
                      </div>
                      <div className="text-xs text-gray-500">employees</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {new Date(structure.effective_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          structure.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {structure.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEdit(structure)}
                          className="p-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDuplicate(structure)}
                          className="p-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                          title="Duplicate"
                        >
                          <FaCopy />
                        </button>
                        <button
                          onClick={() => handleDelete(structure.id)}
                          className="p-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredStructures.length === 0 && (
              <div className="text-center py-12">
                <FaMoneyBillWave className="mx-auto text-4xl text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  No salary structures found
                </h3>
                <p className="text-gray-500">
                  Create your first salary structure to get started.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Summary Footer */}
        {filteredStructures.length > 0 && (
          <div className="mt-4 bg-gray-50 px-4 py-3 border-t border-gray-200 rounded-lg">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Showing {filteredStructures.length} of {salaryStructures.length}{" "}
                structures
              </div>
              <div className="text-sm font-semibold text-gray-800">
                Total annual CTC:{" "}
                {formatCurrency(
                  filteredStructures.reduce(
                    (sum, s) => sum + (s.total_ctc || 0),
                    0
                  )
                )}
              </div>
            </div>
          </div>
        )}

        {/* Salary Structure Form Modal */}
        {showStructureForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-4 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg font-bold mb-3">
                {editingStructure
                  ? "Edit Salary Structure"
                  : "Create New Salary Structure"}
              </h2>
              <form onSubmit={handleSubmitStructure}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Structure Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={newStructure.name}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="e.g., Senior Software Engineer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department *
                    </label>
                    <select
                      name="department"
                      value={newStructure.department}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Grade *
                    </label>
                    <select
                      name="grade"
                      value={newStructure.grade}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="">Select Grade</option>
                      {grades.map((grade) => (
                        <option key={grade} value={grade}>
                          {grade}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Effective Date *
                    </label>
                    <input
                      type="date"
                      name="effective_date"
                      value={newStructure.effective_date}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={newStructure.description}
                      onChange={handleInputChange}
                      rows="2"
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Describe this salary structure..."
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total CTC (Cost to Company) *
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        name="total_ctc"
                        value={newStructure.total_ctc}
                        onChange={handleInputChange}
                        required
                        className="flex-1 border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="Enter total CTC"
                      />
                      <button
                        type="button"
                        onClick={calculateTotalCTC}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        <FaCalculator /> Calculate
                      </button>
                    </div>
                  </div>
                </div>

                {/* Salary Components */}
                <div className="mb-4">
                  <h3 className="text-md font-semibold text-gray-800 mb-3">
                    Salary Components
                  </h3>
                  <div className="space-y-3">
                    {newStructure.components.map((component, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Component Name
                          </label>
                          <input
                            type="text"
                            value={component.name}
                            onChange={(e) =>
                              handleComponentChange(
                                index,
                                "name",
                                e.target.value
                              )
                            }
                            className="w-full border border-gray-300 px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            disabled={!component.is_editable}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Type
                          </label>
                          <select
                            value={component.type}
                            onChange={(e) =>
                              handleComponentChange(
                                index,
                                "type",
                                e.target.value
                              )
                            }
                            className="w-full border border-gray-300 px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            disabled={!component.is_editable}
                          >
                            <option value="fixed">Fixed Amount</option>
                            <option value="percentage">Percentage</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            {component.type === "percentage"
                              ? "Percentage (%)"
                              : "Amount (₹)"}
                          </label>
                          <input
                            type="number"
                            value={
                              component.type === "percentage"
                                ? component.percentage
                                : component.value
                            }
                            onChange={(e) =>
                              handleComponentChange(
                                index,
                                component.type === "percentage"
                                  ? "percentage"
                                  : "value",
                                parseFloat(e.target.value)
                              )
                            }
                            className="w-full border border-gray-300 px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            disabled={!component.is_editable}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Calculated Amount
                          </label>
                          <input
                            type="text"
                            value={formatCurrency(component.value)}
                            className="w-full border border-gray-300 px-2 py-1 rounded bg-gray-100 text-sm"
                            readOnly
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowStructureForm(false);
                      setEditingStructure(null);
                      setNewStructure({
                        name: "",
                        department: "",
                        grade: "",
                        description: "",
                        components: [
                          {
                            name: "Basic Salary",
                            type: "fixed",
                            value: 0,
                            percentage: 50,
                            is_editable: false,
                          },
                          {
                            name: "HRA",
                            type: "percentage",
                            value: 0,
                            percentage: 20,
                            is_editable: true,
                          },
                          {
                            name: "DA",
                            type: "percentage",
                            value: 0,
                            percentage: 15,
                            is_editable: true,
                          },
                          {
                            name: "Conveyance",
                            type: "fixed",
                            value: 1600,
                            percentage: 0,
                            is_editable: true,
                          },
                          {
                            name: "Medical",
                            type: "fixed",
                            value: 1250,
                            percentage: 0,
                            is_editable: true,
                          },
                          {
                            name: "Special Allowance",
                            type: "percentage",
                            value: 0,
                            percentage: 15,
                            is_editable: true,
                          },
                        ],
                        total_ctc: 0,
                        effective_date: new Date().toISOString().split("T")[0],
                        status: "active",
                      });
                    }}
                    className="px-3 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
                  >
                    <FaSave />{" "}
                    {editingStructure ? "Update Structure" : "Create Structure"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalaryStructureSetup;
