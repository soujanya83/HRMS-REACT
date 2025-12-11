import React, { useState, useEffect } from "react";
import {
  FaFileInvoice,
  FaSearch,
  FaFilter,
  FaDownload,
  FaPrint,
  FaEye,
  FaEnvelope,
  FaCalendarAlt,
  FaUserTie,
  FaBuilding,
  FaMoneyBillWave,
  FaCheckCircle,
  FaTimesCircle,
  FaSync,
  FaFilePdf,
  FaPaperPlane,
  FaHistory,
} from "react-icons/fa";

const PayslipGeneration = () => {
  const [payrollPeriod, setPayrollPeriod] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    department: "all",
    status: "all",
    search: "",
  });
  const [selectedPayslips, setSelectedPayslips] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [previewPayslipData, setPreviewPayslipData] = useState(null);

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
  const statusTypes = ["generated", "sent", "pending"];

  // Sample payslips data
  const samplePayslips = [
    {
      id: 1,
      employee_id: "EMP001",
      employee_name: "John Smith",
      department: "Engineering",
      position: "Senior Software Engineer",
      basic_salary: 60000,
      total_earnings: 75000,
      total_deductions: 12000,
      net_salary: 63000,
      payment_date: "2024-02-28",
      payment_method: "Bank Transfer",
      bank_account: "XXXXXX1234",
      status: "sent",
      generated_date: "2024-02-25",
      sent_date: "2024-02-26",
      payslip_url: "/payslips/EMP001_Feb2024.pdf",
    },
    {
      id: 2,
      employee_id: "EMP002",
      employee_name: "Sarah Johnson",
      department: "Marketing",
      position: "Marketing Manager",
      basic_salary: 55000,
      total_earnings: 68000,
      total_deductions: 9500,
      net_salary: 58500,
      payment_date: "2024-02-28",
      payment_method: "Bank Transfer",
      bank_account: "XXXXXX5678",
      status: "sent",
      generated_date: "2024-02-25",
      sent_date: "2024-02-26",
      payslip_url: "/payslips/EMP002_Feb2024.pdf",
    },
    {
      id: 3,
      employee_id: "EMP003",
      employee_name: "Mike Chen",
      department: "Sales",
      position: "Sales Executive",
      basic_salary: 45000,
      total_earnings: 62000,
      total_deductions: 8000,
      net_salary: 54000,
      payment_date: "2024-02-28",
      payment_method: "Bank Transfer",
      bank_account: "XXXXXX9012",
      status: "generated",
      generated_date: "2024-02-25",
      sent_date: null,
      payslip_url: "/payslips/EMP003_Feb2024.pdf",
    },
    {
      id: 4,
      employee_id: "EMP004",
      employee_name: "Lisa Brown",
      department: "Design",
      position: "UI/UX Designer",
      basic_salary: 52000,
      total_earnings: 61000,
      total_deductions: 7800,
      net_salary: 53200,
      payment_date: "2024-02-28",
      payment_method: "Bank Transfer",
      bank_account: "XXXXXX3456",
      status: "pending",
      generated_date: null,
      sent_date: null,
      payslip_url: null,
    },
    {
      id: 5,
      employee_id: "EMP005",
      employee_name: "Robert Wilson",
      department: "Engineering",
      position: "DevOps Engineer",
      basic_salary: 58000,
      total_earnings: 72000,
      total_deductions: 11000,
      net_salary: 61000,
      payment_date: "2024-02-28",
      payment_method: "Bank Transfer",
      bank_account: "XXXXXX7890",
      status: "sent",
      generated_date: "2024-02-25",
      sent_date: "2024-02-26",
      payslip_url: "/payslips/EMP005_Feb2024.pdf",
    },
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setPayslips(samplePayslips);
      setLoading(false);
    }, 1000);
  }, []);

  const handlePayslipSelection = (payslipId) => {
    setSelectedPayslips((prev) =>
      prev.includes(payslipId)
        ? prev.filter((id) => id !== payslipId)
        : [...prev, payslipId]
    );
  };

  const handleSelectAll = () => {
    if (selectedPayslips.length === filteredPayslips.length) {
      setSelectedPayslips([]);
    } else {
      setSelectedPayslips(filteredPayslips.map((p) => p.id));
    }
  };

  const generatePayslips = () => {
    // Simulate payslip generation
    const updatedPayslips = payslips.map((payslip) =>
      selectedPayslips.includes(payslip.id) && payslip.status === "pending"
        ? {
            ...payslip,
            status: "generated",
            generated_date: new Date().toISOString().split("T")[0],
            payslip_url: `/payslips/${payslip.employee_id}_${new Date(
              payrollPeriod.year,
              payrollPeriod.month - 1
            ).toLocaleString("default", {
              month: "short",
              year: "numeric",
            })}.pdf`,
          }
        : payslip
    );
    setPayslips(updatedPayslips);
    setSelectedPayslips([]);
  };

  const sendPayslips = () => {
    // Simulate sending payslips
    const updatedPayslips = payslips.map((payslip) =>
      selectedPayslips.includes(payslip.id) &&
      (payslip.status === "generated" || payslip.status === "pending")
        ? {
            ...payslip,
            status: "sent",
            sent_date: new Date().toISOString().split("T")[0],
          }
        : payslip
    );
    setPayslips(updatedPayslips);
    setSelectedPayslips([]);
  };

  const previewPayslip = (payslip) => {
    setPreviewPayslip(payslip);
    setShowPreview(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      generated: "bg-blue-100 text-blue-800",
      sent: "bg-green-100 text-green-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: FaTimesCircle,
      generated: FaSync,
      sent: FaCheckCircle,
    };
    return icons[status] || FaTimesCircle;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const filteredPayslips = payslips.filter((payslip) => {
    const matchesDepartment =
      filters.department === "all" || payslip.department === filters.department;
    const matchesStatus =
      filters.status === "all" || payslip.status === filters.status;
    const matchesSearch =
      filters.search === "" ||
      payslip.employee_name
        .toLowerCase()
        .includes(filters.search.toLowerCase()) ||
      payslip.employee_id.toLowerCase().includes(filters.search.toLowerCase());

    return matchesDepartment && matchesStatus && matchesSearch;
  });

  const stats = {
    total: payslips.length,
    pending: payslips.filter((p) => p.status === "pending").length,
    generated: payslips.filter((p) => p.status === "generated").length,
    sent: payslips.filter((p) => p.status === "sent").length,
    total_amount: payslips.reduce((sum, p) => sum + p.net_salary, 0),
  };

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
            <FaFileInvoice className="mr-3 text-blue-600" />
            Payslip Generation
          </h1>
          <p className="text-gray-600">Generate and manage employee payslips</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.total}
                </p>
              </div>
              <FaUserTie className="text-blue-500 text-xl" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Generation</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.pending}
                </p>
              </div>
              <FaFileInvoice className="text-yellow-500 text-xl" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sent to Employees</p>
                <p className="text-2xl font-bold text-gray-800">{stats.sent}</p>
              </div>
              <FaPaperPlane className="text-green-500 text-xl" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Payout</p>
                <p className="text-2xl font-bold text-gray-800">
                  {formatCurrency(stats.total_amount)}
                </p>
              </div>
              <FaMoneyBillWave className="text-orange-500 text-xl" />
            </div>
          </div>
        </div>

        {/* Payroll Period and Actions */}
        <div className="mb-6 p-4 bg-white shadow-lg rounded-lg">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payroll Period
                </label>
                <div className="flex gap-2">
                  <select
                    value={payrollPeriod.month}
                    onChange={(e) =>
                      setPayrollPeriod((prev) => ({
                        ...prev,
                        month: parseInt(e.target.value),
                      }))
                    }
                    className="border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {new Date(2000, i).toLocaleString("default", {
                          month: "long",
                        })}
                      </option>
                    ))}
                  </select>
                  <select
                    value={payrollPeriod.year}
                    onChange={(e) =>
                      setPayrollPeriod((prev) => ({
                        ...prev,
                        year: parseInt(e.target.value),
                      }))
                    }
                    className="border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Array.from({ length: 5 }, (_, i) => {
                      const year = new Date().getFullYear() - 2 + i;
                      return (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                Payslips for:{" "}
                {new Date(
                  payrollPeriod.year,
                  payrollPeriod.month - 1
                ).toLocaleString("default", { month: "long", year: "numeric" })}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={generatePayslips}
                disabled={selectedPayslips.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <FaFilePdf /> Generate Payslips
              </button>
              <button
                onClick={sendPayslips}
                disabled={selectedPayslips.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <FaPaperPlane /> Send Payslips
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                <FaHistory /> History
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 p-4 bg-white shadow-lg rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search employees..."
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
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, status: e.target.value }))
              }
              className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              {statusTypes.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">
              <FaFilter /> More Filters
            </button>
          </div>
        </div>

        {/* Payslips Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={
                        selectedPayslips.length === filteredPayslips.length &&
                        filteredPayslips.length > 0
                      }
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Basic Salary
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Net Salary
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Payment Date
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
                {filteredPayslips.map((payslip) => {
                  const StatusIcon = getStatusIcon(payslip.status);
                  return (
                    <tr
                      key={payslip.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedPayslips.includes(payslip.id)}
                          onChange={() => handlePayslipSelection(payslip.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <FaUserTie className="text-blue-500" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {payslip.employee_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {payslip.employee_id} • {payslip.position}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {payslip.department}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {formatCurrency(payslip.basic_salary)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-semibold text-green-600">
                          {formatCurrency(payslip.net_salary)}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {new Date(payslip.payment_date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                            payslip.status
                          )}`}
                        >
                          <StatusIcon className="mr-1" size={12} />
                          {payslip.status}
                        </span>
                        {payslip.generated_date && (
                          <div className="text-xs text-gray-500 mt-1">
                            Generated:{" "}
                            {new Date(
                              payslip.generated_date
                            ).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-1">
                          <button
                            onClick={() => previewPayslip(payslip)}
                            className="p-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                            title="Preview"
                          >
                            <FaEye />
                          </button>
                          {payslip.payslip_url && (
                            <>
                              <button
                                className="p-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                                title="Download"
                              >
                                <FaDownload />
                              </button>
                              <button
                                className="p-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 transition-colors"
                                title="Print"
                              >
                                <FaPrint />
                              </button>
                            </>
                          )}
                          <button
                            className="p-1 bg-orange-600 text-white text-xs rounded hover:bg-orange-700 transition-colors"
                            title="Send Email"
                          >
                            <FaEnvelope />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredPayslips.length === 0 && (
              <div className="text-center py-12">
                <FaFileInvoice className="mx-auto text-4xl text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  No payslips found
                </h3>
                <p className="text-gray-500">
                  Generate payslips for the selected period.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Summary Footer */}
        {filteredPayslips.length > 0 && (
          <div className="mt-4 bg-gray-50 px-4 py-3 border-t border-gray-200 rounded-lg">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Showing {filteredPayslips.length} employees • Selected:{" "}
                {selectedPayslips.length} • Total Payout:{" "}
                {formatCurrency(
                  filteredPayslips
                    .filter((p) => selectedPayslips.includes(p.id))
                    .reduce((sum, p) => sum + p.net_salary, 0)
                )}
              </div>
              <div className="text-sm font-semibold text-gray-800">
                {selectedPayslips.length} payslips ready for action
              </div>
            </div>
          </div>
        )}

        {/* Payslip Preview Modal */}
        {showPreview && previewPayslip && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Payslip Preview</h2>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  <FaTimes />
                </button>
              </div>

              {/* Payslip Content */}
              <div className="border-2 border-gray-300 p-6">
                {/* Company Header */}
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold text-gray-800">
                    COMPANY NAME
                  </h1>
                  <p className="text-gray-600">Salary Payslip</p>
                  <p className="text-sm text-gray-500">
                    {new Date(
                      payrollPeriod.year,
                      payrollPeriod.month - 1
                    ).toLocaleString("default", {
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>

                {/* Employee Details */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <h3 className="font-semibold mb-2">Employee Details</h3>
                    <p>
                      <strong>Name:</strong> {previewPayslip.employee_name}
                    </p>
                    <p>
                      <strong>ID:</strong> {previewPayslip.employee_id}
                    </p>
                    <p>
                      <strong>Department:</strong> {previewPayslip.department}
                    </p>
                    <p>
                      <strong>Position:</strong> {previewPayslip.position}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Payment Details</h3>
                    <p>
                      <strong>Payment Date:</strong>{" "}
                      {new Date(
                        previewPayslip.payment_date
                      ).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Payment Method:</strong>{" "}
                      {previewPayslip.payment_method}
                    </p>
                    <p>
                      <strong>Bank Account:</strong>{" "}
                      {previewPayslip.bank_account}
                    </p>
                  </div>
                </div>

                {/* Earnings and Deductions */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  {/* Earnings */}
                  <div>
                    <h3 className="font-semibold mb-2 border-b pb-1">
                      Earnings
                    </h3>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Basic Salary</span>
                        <span>
                          {formatCurrency(previewPayslip.basic_salary)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>House Rent Allowance</span>
                        <span>{formatCurrency(12000)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Dearness Allowance</span>
                        <span>{formatCurrency(9000)}</span>
                      </div>
                      <div className="flex justify-between font-semibold border-t pt-1">
                        <span>Total Earnings</span>
                        <span>
                          {formatCurrency(previewPayslip.total_earnings)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Deductions */}
                  <div>
                    <h3 className="font-semibold mb-2 border-b pb-1">
                      Deductions
                    </h3>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Provident Fund</span>
                        <span>{formatCurrency(7200)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Professional Tax</span>
                        <span>{formatCurrency(200)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Income Tax</span>
                        <span>{formatCurrency(3000)}</span>
                      </div>
                      <div className="flex justify-between font-semibold border-t pt-1">
                        <span>Total Deductions</span>
                        <span>
                          {formatCurrency(previewPayslip.total_deductions)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Net Salary */}
                <div className="bg-gray-100 p-4 rounded text-center">
                  <h3 className="font-semibold text-lg">
                    Net Salary: {formatCurrency(previewPayslip.net_salary)}
                  </h3>
                  <p className="text-sm text-gray-600">
                    In Words: {convertToWords(previewPayslip.net_salary)}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
                  <FaPrint className="inline mr-2" /> Print
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <FaDownload className="inline mr-2" /> Download PDF
                </button>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  <FaPaperPlane className="inline mr-2" /> Send Email
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to convert number to words
const convertToWords = (amount) => {
  // Simple implementation - in real app, use a proper library
  const units = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
  ];
  const teens = [
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  if (amount === 0) return "Zero";

  let words = "";
  const crore = Math.floor(amount / 10000000);
  if (crore > 0) {
    words += convertToWords(crore) + " Crore ";
    amount %= 10000000;
  }

  const lakh = Math.floor(amount / 100000);
  if (lakh > 0) {
    words += convertToWords(lakh) + " Lakh ";
    amount %= 100000;
  }

  const thousand = Math.floor(amount / 1000);
  if (thousand > 0) {
    words += convertToWords(thousand) + " Thousand ";
    amount %= 1000;
  }

  const hundred = Math.floor(amount / 100);
  if (hundred > 0) {
    words += units[hundred] + " Hundred ";
    amount %= 100;
  }

  if (amount > 0) {
    if (words !== "") words += "and ";

    if (amount < 10) {
      words += units[amount];
    } else if (amount < 20) {
      words += teens[amount - 10];
    } else {
      words += tens[Math.floor(amount / 10)];
      if (amount % 10 > 0) {
        words += " " + units[amount % 10];
      }
    }
  }

  return words.trim() + " Rupees Only";
};

export default PayslipGeneration;
