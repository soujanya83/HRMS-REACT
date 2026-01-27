import React, { useState, useEffect } from "react";
import {
  FaGift,
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaDownload,
  FaCopy,
  FaSave,
  FaMoneyBillWave,
  FaPercentage,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaUsers,
  FaCalendarAlt,
  FaChartBar,
  FaSpinner,
  FaFileInvoiceDollar,
  FaCalculator,
  FaUserTie,
} from "react-icons/fa";

const BonusIncentives = () => {
  const [bonuses, setBonuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBonusForm, setShowBonusForm] = useState(false);
  const [editingBonus, setEditingBonus] = useState(null);
  const [filters, setFilters] = useState({
    type: "all",
    status: "all",
    search: "",
  });

  // Sample data
  const bonusTypes = [
    "Performance Bonus",
    "Festival Bonus",
    "Annual Bonus",
    "Sales Incentive",
    "Retention Bonus",
    "Spot Award",
    "Other",
  ];
  const statusTypes = ["active", "completed", "pending", "cancelled"];
  const departments = [
    "Engineering",
    "Marketing",
    "Sales",
    "Design",
    "HR",
    "Finance",
    "Operations",
  ];

  const [newBonus, setNewBonus] = useState({
    name: "",
    type: "",
    calculation_type: "fixed",
    amount: 0,
    percentage: 0,
    target_amount: 0,
    min_amount: 0,
    max_amount: 0,
    applicable_from: new Date().toISOString().split("T")[0],
    applicable_to: "",
    eligibility_criteria: "",
    department: "all",
    status: "active",
    description: "",
    approved_by: "",
    approved_date: "",
  });

  // Sample bonuses data
  const sampleBonuses = [
    {
      id: 1,
      name: "Q4 Performance Bonus",
      type: "Performance Bonus",
      calculation_type: "percentage",
      amount: 0,
      percentage: 15,
      target_amount: 0,
      min_amount: 5000,
      max_amount: 50000,
      applicable_from: "2024-01-01",
      applicable_to: "2024-03-31",
      eligibility_criteria: "Employees with rating 4+",
      department: "all",
      status: "active",
      description: "Quarterly performance bonus for top performers",
      approved_by: "HR Manager",
      approved_date: "2024-01-15",
      total_employees: 25,
      total_amount: 450000,
      paid_amount: 0,
    },
    {
      id: 2,
      name: "Diwali Festival Bonus",
      type: "Festival Bonus",
      calculation_type: "fixed",
      amount: 10000,
      percentage: 0,
      target_amount: 0,
      min_amount: 0,
      max_amount: 0,
      applicable_from: "2024-10-25",
      applicable_to: "2024-11-05",
      eligibility_criteria: "All permanent employees",
      department: "all",
      status: "pending",
      description: "Festival bonus for Diwali celebrations",
      approved_by: "",
      approved_date: "",
      total_employees: 45,
      total_amount: 450000,
      paid_amount: 0,
    },
    {
      id: 3,
      name: "Sales Q1 Incentive",
      type: "Sales Incentive",
      calculation_type: "percentage",
      amount: 0,
      percentage: 10,
      target_amount: 1000000,
      min_amount: 0,
      max_amount: 50000,
      applicable_from: "2024-01-01",
      applicable_to: "2024-03-31",
      eligibility_criteria: "Sales team exceeding targets",
      department: "Sales",
      status: "active",
      description: "Sales incentive for Q1 performance",
      approved_by: "Sales Director",
      approved_date: "2024-01-10",
      total_employees: 8,
      total_amount: 320000,
      paid_amount: 0,
    },
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setBonuses(sampleBonuses);
      setLoading(false);
    }, 1000);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBonus((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitBonus = (e) => {
    e.preventDefault();

    const bonus = {
      id: editingBonus ? editingBonus.id : bonuses.length + 1,
      ...newBonus,
      total_employees: 0,
      total_amount: 0,
      paid_amount: 0,
      created_at: new Date().toISOString(),
    };

    if (editingBonus) {
      setBonuses((prev) =>
        prev.map((b) => (b.id === editingBonus.id ? bonus : b))
      );
    } else {
      setBonuses((prev) => [bonus, ...prev]);
    }

    setNewBonus({
      name: "",
      type: "",
      calculation_type: "fixed",
      amount: 0,
      percentage: 0,
      target_amount: 0,
      min_amount: 0,
      max_amount: 0,
      applicable_from: new Date().toISOString().split("T")[0],
      applicable_to: "",
      eligibility_criteria: "",
      department: "all",
      status: "active",
      description: "",
      approved_by: "",
      approved_date: "",
    });
    setShowBonusForm(false);
    setEditingBonus(null);
  };

  const handleEdit = (bonus) => {
    setEditingBonus(bonus);
    setNewBonus(bonus);
    setShowBonusForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this bonus?")) {
      setBonuses((prev) => prev.filter((bonus) => bonus.id !== id));
    }
  };

  const handleDuplicate = (bonus) => {
    const duplicated = {
      ...bonus,
      id: bonuses.length + 1,
      name: `${bonus.name} (Copy)`,
      total_employees: 0,
      total_amount: 0,
      paid_amount: 0,
    };
    setBonuses((prev) => [duplicated, ...prev]);
  };

  const handleApprove = (id) => {
    setBonuses((prev) =>
      prev.map((bonus) =>
        bonus.id === id
          ? {
              ...bonus,
              status: "active",
              approved_by: "Admin User",
              approved_date: new Date().toISOString().split("T")[0],
            }
          : bonus
      )
    );
  };

  const filteredBonuses = bonuses.filter((bonus) => {
    const matchesType = filters.type === "all" || bonus.type === filters.type;
    const matchesStatus =
      filters.status === "all" || bonus.status === filters.status;
    const matchesSearch =
      filters.search === "" ||
      bonus.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      bonus.description.toLowerCase().includes(filters.search.toLowerCase());

    return matchesType && matchesStatus && matchesSearch;
  });

  const stats = {
    total: bonuses.length,
    active: bonuses.filter((b) => b.status === "active").length,
    pending: bonuses.filter((b) => b.status === "pending").length,
    total_amount: bonuses.reduce((sum, b) => sum + b.total_amount, 0),
    paid_amount: bonuses.reduce((sum, b) => sum + b.paid_amount, 0),
  };

  const getStatusColor = (status) => {
    const colors = {
      active: "bg-green-100 text-green-800 border border-green-200",
      pending: "bg-yellow-100 text-yellow-800 border border-yellow-200",
      completed: "bg-blue-100 text-blue-800 border border-blue-200",
      cancelled: "bg-red-100 text-red-800 border border-red-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border border-gray-200";
  };

  const getStatusIcon = (status) => {
    const icons = {
      active: FaCheckCircle,
      pending: FaClock,
      completed: FaCheckCircle,
      cancelled: FaExclamationTriangle,
    };
    return icons[status] || FaClock;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="h-12 w-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading bonuses data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Bonus & Incentives Management
          </h1>
          <p className="text-gray-600">
            Manage and configure employee bonuses, incentives, and rewards
          </p>
        </div>

        {/* Stats Cards - Updated to match deductions page */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Bonuses
                </p>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {stats.total}
                </p>
              </div>
              <FaGift className="text-purple-500 text-xl" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Programs
                </p>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {stats.active}
                </p>
              </div>
              <FaCheckCircle className="text-green-500 text-xl" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-500 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Pending Approval
                </p>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {stats.pending}
                </p>
              </div>
              <FaClock className="text-yellow-500 text-xl" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-orange-500 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Budget</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {formatCurrency(stats.total_amount)}
                </p>
              </div>
              <FaChartBar className="text-orange-500 text-xl" />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mb-6 flex justify-end">
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm">
              <FaDownload /> Export
            </button>
            <button
              onClick={() => setShowBonusForm(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
            >
              <FaPlus /> New Bonus
            </button>
          </div>
        </div>

        {/* Filters Section - Updated to match deductions page */}
        <div className="mb-6 p-6 bg-white rounded-xl shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search bar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative">
                <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search bonuses..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, search: e.target.value }))
                  }
                  className="w-full border border-gray-300 pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
                />
              </div>
            </div>

            {/* Type filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={filters.type}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, type: e.target.value }))
                }
                className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white text-sm"
              >
                <option value="all">All Types</option>
                {bonusTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Status filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, status: e.target.value }))
                }
                className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white text-sm"
              >
                <option value="all">All Status</option>
                {statusTypes.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Bonuses Table - Updated with larger text */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[22%] min-w-[180px]">
                    Bonus Details
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[16%] min-w-[140px]">
                    Type & Calculation
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[14%] min-w-[120px]">
                    Amount/Rate
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[14%] min-w-[120px]">
                    Employees & Budget
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[12%] min-w-[100px]">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[22%] min-w-[180px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredBonuses.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <FaGift className="text-4xl text-gray-300 mb-3" />
                        <p className="text-lg font-medium text-gray-900 mb-1">
                          No bonuses found
                        </p>
                        <p className="text-gray-500">
                          Create your first bonus program to get started
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredBonuses.map((bonus) => {
                    const StatusIcon = getStatusIcon(bonus.status);
                    return (
                      <tr
                        key={bonus.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        {/* Bonus Details */}
                        <td className="px-4 py-3 w-[22%] min-w-[180px]">
                          <div className="flex items-start">
                            <div className="flex-shrink-0 h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center mt-1">
                              <FaGift className="text-purple-600 text-lg" />
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-semibold text-gray-900">
                                {bonus.name}
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                {bonus.description}
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                <span className="font-medium">Eligibility:</span>{" "}
                                {bonus.eligibility_criteria}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Type & Calculation */}
                        <td className="px-4 py-3 w-[16%] min-w-[140px]">
                          <div className="text-sm font-medium text-gray-900">
                            {bonus.type}
                          </div>
                          <div className="text-sm text-gray-500 capitalize mt-1">
                            {bonus.calculation_type}
                          </div>
                          {bonus.department !== "all" && (
                            <div className="text-sm text-gray-500 mt-1">
                              <span className="font-medium">Dept:</span>{" "}
                              {bonus.department}
                            </div>
                          )}
                          <div className="text-sm text-gray-500 mt-1">
                            <FaCalendarAlt className="inline mr-1 text-gray-400" />
                            {new Date(bonus.applicable_from).toLocaleDateString()} -{" "}
                            {bonus.applicable_to
                              ? new Date(bonus.applicable_to).toLocaleDateString()
                              : "Ongoing"}
                          </div>
                        </td>

                        {/* Amount/Rate */}
                        <td className="px-4 py-3 w-[14%] min-w-[120px]">
                          {bonus.calculation_type === "percentage" ? (
                            <div className="text-sm font-semibold text-blue-600">
                              {bonus.percentage}%
                            </div>
                          ) : (
                            <div className="text-sm font-semibold text-green-600">
                              {formatCurrency(bonus.amount)}
                            </div>
                          )}
                          {(bonus.min_amount > 0 || bonus.max_amount > 0) && (
                            <div className="text-sm text-gray-500 mt-1">
                              Min: {formatCurrency(bonus.min_amount)}
                              <br />
                              Max: {formatCurrency(bonus.max_amount)}
                            </div>
                          )}
                          {bonus.target_amount > 0 && (
                            <div className="text-sm text-gray-500 mt-1">
                              <span className="font-medium">Target:</span>{" "}
                              {formatCurrency(bonus.target_amount)}
                            </div>
                          )}
                        </td>

                        {/* Employees & Budget */}
                        <td className="px-4 py-3 w-[14%] min-w-[120px]">
                          <div className="text-sm font-semibold text-gray-900">
                            <FaUsers className="inline mr-1 text-gray-400" />
                            {bonus.total_employees} employees
                          </div>
                          <div className="text-sm font-semibold text-green-600 mt-1">
                            {formatCurrency(bonus.total_amount)}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            <span className="font-medium">Paid:</span>{" "}
                            {formatCurrency(bonus.paid_amount)}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3 w-[12%] min-w-[100px]">
                          <span
                            className={`px-3 py-1 text-xs font-semibold rounded-full inline-flex items-center ${getStatusColor(
                              bonus.status
                            )}`}
                          >
                            <StatusIcon className="mr-1" />
                            {bonus.status.charAt(0).toUpperCase() +
                              bonus.status.slice(1)}
                          </span>
                          {bonus.approved_by && (
                            <div className="text-sm text-gray-500 mt-1">
                              Approved by: {bonus.approved_by}
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 w-[22%] min-w-[180px] text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(bonus)}
                              className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-1"
                              title="Edit"
                            >
                              <FaEdit /> Edit
                            </button>
                            <button
                              onClick={() => handleDuplicate(bonus)}
                              className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm flex items-center gap-1"
                              title="Duplicate"
                            >
                              <FaCopy /> Copy
                            </button>
                            {bonus.status === "pending" && (
                              <button
                                onClick={() => handleApprove(bonus.id)}
                                className="px-3 py-1.5 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-700 transition-colors shadow-sm flex items-center gap-1"
                                title="Approve"
                              >
                                <FaCheckCircle /> Approve
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(bonus.id)}
                              className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm flex items-center gap-1"
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Footer */}
        {filteredBonuses.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <div className="text-sm text-gray-600">
                Showing {filteredBonuses.length} of {bonuses.length} bonuses
              </div>
              <div className="text-sm font-semibold text-gray-800">
                Total budget allocation:{" "}
                <span className="text-purple-600">
                  {formatCurrency(
                    filteredBonuses.reduce((sum, b) => sum + b.total_amount, 0)
                  )}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Bonus Form Modal - Updated styling */}
        {showBonusForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">
                  {editingBonus
                    ? "Edit Bonus Program"
                    : "Create New Bonus Program"}
                </h2>
                <button
                  onClick={() => {
                    setShowBonusForm(false);
                    setEditingBonus(null);
                    setNewBonus({
                      name: "",
                      type: "",
                      calculation_type: "fixed",
                      amount: 0,
                      percentage: 0,
                      target_amount: 0,
                      min_amount: 0,
                      max_amount: 0,
                      applicable_from: new Date().toISOString().split("T")[0],
                      applicable_to: "",
                      eligibility_criteria: "",
                      department: "all",
                      status: "active",
                      description: "",
                      approved_by: "",
                      approved_date: "",
                    });
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FaTimes className="text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSubmitBonus} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bonus Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={newBonus.name}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
                      placeholder="e.g., Q4 Performance Bonus"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type *
                    </label>
                    <select
                      name="type"
                      value={newBonus.type}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white text-sm"
                    >
                      <option value="">Select Type</option>
                      {bonusTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Calculation Type *
                    </label>
                    <select
                      name="calculation_type"
                      value={newBonus.calculation_type}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white text-sm"
                    >
                      <option value="fixed">Fixed Amount</option>
                      <option value="percentage">Percentage</option>
                    </select>
                  </div>

                  {newBonus.calculation_type === "fixed" && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fixed Amount (₹) *
                      </label>
                      <input
                        type="number"
                        name="amount"
                        value={newBonus.amount}
                        onChange={handleInputChange}
                        required
                        className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
                        placeholder="Enter fixed amount"
                      />
                    </div>
                  )}

                  {newBonus.calculation_type === "percentage" && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Percentage (%) *
                      </label>
                      <input
                        type="number"
                        name="percentage"
                        value={newBonus.percentage}
                        onChange={handleInputChange}
                        required
                        step="0.01"
                        className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
                        placeholder="Enter percentage"
                      />
                    </div>
                  )}

                  {newBonus.calculation_type === "percentage" && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Target Amount
                      </label>
                      <input
                        type="number"
                        name="target_amount"
                        value={newBonus.target_amount}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
                        placeholder="Target amount (optional)"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Amount
                    </label>
                    <input
                      type="number"
                      name="min_amount"
                      value={newBonus.min_amount}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
                      placeholder="Minimum amount"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Maximum Amount
                    </label>
                    <input
                      type="number"
                      name="max_amount"
                      value={newBonus.max_amount}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
                      placeholder="Maximum amount"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Applicable From *
                    </label>
                    <input
                      type="date"
                      name="applicable_from"
                      value={newBonus.applicable_from}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Applicable To
                    </label>
                    <input
                      type="date"
                      name="applicable_to"
                      value={newBonus.applicable_to}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department
                    </label>
                    <select
                      name="department"
                      value={newBonus.department}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white text-sm"
                    >
                      <option value="all">All Departments</option>
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Eligibility Criteria
                    </label>
                    <input
                      type="text"
                      name="eligibility_criteria"
                      value={newBonus.eligibility_criteria}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
                      placeholder="e.g., Employees with rating 4+"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      name="status"
                      value={newBonus.status}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white text-sm"
                    >
                      {statusTypes.map((status) => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={newBonus.description}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
                      placeholder="Describe this bonus program..."
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowBonusForm(false);
                      setEditingBonus(null);
                      setNewBonus({
                        name: "",
                        type: "",
                        calculation_type: "fixed",
                        amount: 0,
                        percentage: 0,
                        target_amount: 0,
                        min_amount: 0,
                        max_amount: 0,
                        applicable_from: new Date().toISOString().split("T")[0],
                        applicable_to: "",
                        eligibility_criteria: "",
                        department: "all",
                        status: "active",
                        description: "",
                        approved_by: "",
                        approved_date: "",
                      });
                    }}
                    className="px-4 py-2.5 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors shadow-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors shadow-sm flex items-center gap-2"
                  >
                    <FaSave />{" "}
                    {editingBonus ? "Update Bonus" : "Create Bonus"}
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

export default BonusIncentives;