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
      active: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      completed: "bg-blue-100 text-blue-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
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
      <div className="p-4 bg-gray-100 min-h-screen">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-300 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-300 rounded"></div>
              ))}
            </div>
            <div className="h-48 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-100 min-h-screen font-sans overflow-x-hidden">
      <div className="max-w-6xl mx-auto w-full">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-xl font-bold text-gray-800 mb-1 flex items-center">
            <FaGift className="mr-2 text-purple-600 text-lg" />
            Bonus & Incentives
          </h1>
          <p className="text-xs text-gray-600">
            Manage employee bonuses, incentives, and rewards
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-white p-3 rounded-lg shadow border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Total Bonuses</p>
                <p className="text-lg font-bold text-gray-800">{stats.total}</p>
              </div>
              <FaGift className="text-purple-500 text-base" />
            </div>
          </div>

          <div className="bg-white p-3 rounded-lg shadow border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Active Programs</p>
                <p className="text-lg font-bold text-gray-800">
                  {stats.active}
                </p>
              </div>
              <FaCheckCircle className="text-green-500 text-base" />
            </div>
          </div>

          <div className="bg-white p-3 rounded-lg shadow border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Pending Approval</p>
                <p className="text-lg font-bold text-gray-800">
                  {stats.pending}
                </p>
              </div>
              <FaClock className="text-yellow-500 text-base" />
            </div>
          </div>

          <div className="bg-white p-3 rounded-lg shadow border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Total Budget</p>
                <p className="text-lg font-bold text-gray-800">
                  {formatCurrency(stats.total_amount)}
                </p>
              </div>
              <FaMoneyBillWave className="text-orange-500 text-base" />
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="mb-4 p-3 bg-white shadow rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div className="relative">
              <FaSearch className="absolute top-1/2 left-2 -translate-y-1/2 text-gray-400 text-xs" />
              <input
                type="text"
                placeholder="Search bonuses..."
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
                className="w-full border border-gray-300 pl-7 pr-2 py-1.5 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <select
              value={filters.type}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, type: e.target.value }))
              }
              className="border border-gray-300 px-2 py-1.5 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              {bonusTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <select
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, status: e.target.value }))
              }
              className="border border-gray-300 px-2 py-1.5 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              {statusTypes.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <div className="flex gap-1">
              <button
                onClick={() => setShowBonusForm(true)}
                className="flex items-center gap-1 px-2 py-1.5 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 transition-colors flex-1"
              >
                <FaPlus className="text-xs" /> New Bonus
              </button>
              <button className="flex items-center gap-1 px-2 py-1.5 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors">
                <FaDownload className="text-xs" />
              </button>
            </div>
          </div>
        </div>

        {/* Bonuses Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left font-bold text-gray-600 uppercase">
                    Bonus Details
                  </th>
                  <th className="px-3 py-2 text-left font-bold text-gray-600 uppercase">
                    Type & Calculation
                  </th>
                  <th className="px-3 py-2 text-left font-bold text-gray-600 uppercase">
                    Amount/Rate
                  </th>
                  <th className="px-3 py-2 text-left font-bold text-gray-600 uppercase">
                    Employees
                  </th>
                  <th className="px-3 py-2 text-left font-bold text-gray-600 uppercase">
                    Status
                  </th>
                  <th className="px-3 py-2 text-left font-bold text-gray-600 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredBonuses.map((bonus) => {
                  const StatusIcon = getStatusIcon(bonus.status);
                  return (
                    <tr
                      key={bonus.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-3 py-2">
                        <div className="flex items-center space-x-2">
                          <div className="flex-shrink-0">
                            <FaGift className="text-purple-500 text-xs" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-gray-900 truncate">
                              {bonus.name}
                            </div>
                            <div className="text-gray-500 truncate max-w-[150px] text-[10px]">
                              {bonus.description}
                            </div>
                            <div className="text-gray-400 text-[10px]">
                              {bonus.eligibility_criteria}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="text-gray-900">{bonus.type}</div>
                        <div className="text-gray-500 text-[10px] capitalize">
                          {bonus.calculation_type}
                        </div>
                        {bonus.department !== "all" && (
                          <div className="text-gray-400 text-[10px]">
                            {bonus.department}
                          </div>
                        )}
                        <div className="text-gray-400 text-[10px]">
                          {bonus.applicable_from} to {bonus.applicable_to}
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {bonus.calculation_type === "percentage" ? (
                          <div className="font-semibold text-blue-600 text-[10px]">
                            {bonus.percentage}%
                          </div>
                        ) : (
                          <div className="font-semibold text-green-600 text-[10px]">
                            {formatCurrency(bonus.amount)}
                          </div>
                        )}
                        {(bonus.min_amount > 0 || bonus.max_amount > 0) && (
                          <div className="text-gray-500 text-[10px]">
                            {formatCurrency(bonus.min_amount)} -{" "}
                            {formatCurrency(bonus.max_amount)}
                          </div>
                        )}
                        {bonus.target_amount > 0 && (
                          <div className="text-gray-500 text-[10px]">
                            Target: {formatCurrency(bonus.target_amount)}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="font-semibold text-gray-900 text-[10px]">
                          {bonus.total_employees} employees
                        </div>
                        <div className="font-semibold text-green-600 text-[10px]">
                          {formatCurrency(bonus.total_amount)}
                        </div>
                        <div className="text-gray-500 text-[10px]">
                          Paid: {formatCurrency(bonus.paid_amount)}
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span
                          className={`px-1.5 py-0.5 inline-flex items-center text-[10px] font-semibold rounded-full ${getStatusColor(
                            bonus.status
                          )}`}
                        >
                          <StatusIcon className="mr-0.5" size={8} />
                          {bonus.status}
                        </span>
                        {bonus.approved_by && (
                          <div className="text-gray-500 text-[10px] mt-1">
                            by {bonus.approved_by}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="flex gap-1 mb-1">
                          <button
                            onClick={() => handleEdit(bonus)}
                            className="p-1 bg-blue-600 text-white text-[10px] rounded hover:bg-blue-700 transition-colors"
                            title="Edit"
                          >
                            <FaEdit size={8} />
                          </button>
                          <button
                            onClick={() => handleDuplicate(bonus)}
                            className="p-1 bg-green-600 text-white text-[10px] rounded hover:bg-green-700 transition-colors"
                            title="Duplicate"
                          >
                            <FaCopy size={8} />
                          </button>
                          {bonus.status === "pending" && (
                            <button
                              onClick={() => handleApprove(bonus.id)}
                              className="p-1 bg-purple-600 text-white text-[10px] rounded hover:bg-purple-700 transition-colors"
                              title="Approve"
                            >
                              <FaCheckCircle size={8} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(bonus.id)}
                            className="p-1 bg-red-600 text-white text-[10px] rounded hover:bg-red-700 transition-colors"
                            title="Delete"
                          >
                            <FaTrash size={8} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredBonuses.length === 0 && (
              <div className="text-center py-8">
                <FaGift className="mx-auto text-2xl text-gray-300 mb-2" />
                <h3 className="text-sm font-semibold text-gray-600 mb-1">
                  No bonuses found
                </h3>
                <p className="text-gray-500 text-xs">
                  Create your first bonus program to get started.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Summary Footer */}
        {filteredBonuses.length > 0 && (
          <div className="mt-3 bg-gray-50 px-3 py-2 border-t border-gray-200 rounded text-xs">
            <div className="flex justify-between items-center text-gray-600">
              <div>
                Showing {filteredBonuses.length} of {bonuses.length} bonuses
              </div>
              <div className="font-semibold">
                Total budget:{" "}
                {formatCurrency(
                  filteredBonuses.reduce((sum, b) => sum + b.total_amount, 0)
                )}
              </div>
            </div>
          </div>
        )}

        {/* Bonus Form Modal */}
        {showBonusForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-4 rounded shadow w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg font-bold mb-3">
                {editingBonus
                  ? "Edit Bonus Program"
                  : "Create New Bonus Program"}
              </h2>
              <form onSubmit={handleSubmitBonus}>
                <div className="grid grid-cols-1 gap-3 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Bonus Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={newBonus.name}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 px-2 py-1.5 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="e.g., Q4 Performance Bonus"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Type *
                      </label>
                      <select
                        name="type"
                        value={newBonus.type}
                        onChange={handleInputChange}
                        required
                        className="w-full border border-gray-300 px-2 py-1.5 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Calculation Type *
                      </label>
                      <select
                        name="calculation_type"
                        value={newBonus.calculation_type}
                        onChange={handleInputChange}
                        required
                        className="w-full border border-gray-300 px-2 py-1.5 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="fixed">Fixed Amount</option>
                        <option value="percentage">Percentage</option>
                      </select>
                    </div>
                  </div>

                  {newBonus.calculation_type === "fixed" && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Fixed Amount (₹) *
                      </label>
                      <input
                        type="number"
                        name="amount"
                        value={newBonus.amount}
                        onChange={handleInputChange}
                        required
                        className="w-full border border-gray-300 px-2 py-1.5 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Enter fixed amount"
                      />
                    </div>
                  )}

                  {newBonus.calculation_type === "percentage" && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Percentage (%) *
                        </label>
                        <input
                          type="number"
                          name="percentage"
                          value={newBonus.percentage}
                          onChange={handleInputChange}
                          required
                          step="0.01"
                          className="w-full border border-gray-300 px-2 py-1.5 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Enter percentage"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Target Amount
                        </label>
                        <input
                          type="number"
                          name="target_amount"
                          value={newBonus.target_amount}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 px-2 py-1.5 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Target amount"
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Minimum Amount
                      </label>
                      <input
                        type="number"
                        name="min_amount"
                        value={newBonus.min_amount}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 px-2 py-1.5 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Minimum amount"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Maximum Amount
                      </label>
                      <input
                        type="number"
                        name="max_amount"
                        value={newBonus.max_amount}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 px-2 py-1.5 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Maximum amount"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Applicable From *
                      </label>
                      <input
                        type="date"
                        name="applicable_from"
                        value={newBonus.applicable_from}
                        onChange={handleInputChange}
                        required
                        className="w-full border border-gray-300 px-2 py-1.5 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Applicable To
                      </label>
                      <input
                        type="date"
                        name="applicable_to"
                        value={newBonus.applicable_to}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 px-2 py-1.5 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Department
                    </label>
                    <select
                      name="department"
                      value={newBonus.department}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 px-2 py-1.5 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="all">All Departments</option>
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Eligibility Criteria
                    </label>
                    <input
                      type="text"
                      name="eligibility_criteria"
                      value={newBonus.eligibility_criteria}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 px-2 py-1.5 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="e.g., Employees with rating 4+"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      name="status"
                      value={newBonus.status}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 px-2 py-1.5 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {statusTypes.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={newBonus.description}
                      onChange={handleInputChange}
                      rows="2"
                      className="w-full border border-gray-300 px-2 py-1.5 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Describe this bonus program..."
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
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
                    className="px-3 py-1.5 bg-gray-200 text-gray-800 rounded text-sm hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 transition-colors flex items-center gap-1"
                  >
                    <FaSave size={12} />{" "}
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
