// components/PayslipGeneration.jsx - UPDATED VERSION
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
  FaSpinner,
  FaCalendar,
  FaUsers,
  FaFileAlt,
  FaCogs,
  FaPlay,
  FaStop,
  FaExclamationTriangle
} from "react-icons/fa";
import { payrollService } from "../../services/payrollService.js";
import { useOrganizations } from "../../contexts/OrganizationContext.jsx";

const PayslipGeneration = () => {
  const { selectedOrganization } = useOrganizations();
  const organizationId = selectedOrganization?.id || "15";

  const [loading, setLoading] = useState({
    payPeriods: false,
    payRuns: false,
    payslips: false
  });
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // State for pay periods
  const [payPeriods, setPayPeriods] = useState([]);
  const [selectedCalendar, setSelectedCalendar] = useState(null);
  const [payPeriodFilters, setPayPeriodFilters] = useState({
    calendar_type: "all",
    is_current: "all"
  });

  // State for pay runs
  const [payRuns, setPayRuns] = useState([]);
  const [selectedPayRun, setSelectedPayRun] = useState(null);
  const [payRunDateRange, setPayRunDateRange] = useState({
    from_date: "",
    to_date: ""
  });

  // State for payslips
  const [payslips, setPayslips] = useState([]);
  const [selectedPayslips, setSelectedPayslips] = useState([]);
  const [filters, setFilters] = useState({
    department: "all",
    status: "all",
    search: ""
  });

  // Preview state
  const [showPreview, setShowPreview] = useState(false);
  const [previewPayslip, setPreviewPayslip] = useState(null);
  const [showPayslipDetails, setShowPayslipDetails] = useState(false);

  // Fetch pay periods on component mount
  useEffect(() => {
    fetchPayPeriods();
  }, [organizationId]);

  // API Functions - UPDATED
  const fetchPayPeriods = async () => {
    try {
      setLoading(prev => ({ ...prev, payPeriods: true }));
      setError(null);
      const response = await payrollService.fetchPayPeriods(organizationId);
      
      if (response.data && response.data.status) {
        setPayPeriods(response.data.data);
        if (response.data.data.length > 0) {
          const currentPeriod = response.data.data.find(p => p.is_current);
          if (currentPeriod) {
            setSelectedCalendar(currentPeriod.calendar_id);
            setPayRunDateRange({
              from_date: currentPeriod.start_date.split('T')[0],
              to_date: currentPeriod.end_date.split('T')[0]
            });
          }
        }
      } else {
        setError("Failed to fetch pay periods: Invalid response format");
      }
    } catch (error) {
      console.error("Error fetching pay periods:", error);
      setError(error.response?.data?.message || error.message || "Failed to fetch pay periods. Please try again.");
    } finally {
      setLoading(prev => ({ ...prev, payPeriods: false }));
    }
  };

  const createPayRun = async () => {
    if (!payRunDateRange.from_date || !payRunDateRange.to_date) {
      setError("Please select a date range");
      return;
    }

    try {
      setLoading(prev => ({ ...prev, payRuns: true }));
      setError(null);
      const response = await payrollService.createPayRun(
        organizationId,
        payRunDateRange.from_date,
        payRunDateRange.to_date
      );
      
      if (response.data && response.data.status) {
        setSuccessMessage("Pay run created successfully!");
        fetchPayRuns(); // Refresh pay runs list
      } else {
        setError(response.data?.message || "Failed to create pay run");
      }
    } catch (error) {
      console.error("Error creating pay run:", error);
      setError(error.response?.data?.message || error.message || "Failed to create pay run. Please try again.");
    } finally {
      setLoading(prev => ({ ...prev, payRuns: false }));
    }
  };

  const fetchPayRuns = async () => {
    if (!payRunDateRange.from_date || !payRunDateRange.to_date) {
      setError("Please select a date range first");
      return;
    }

    try {
      setLoading(prev => ({ ...prev, payRuns: true }));
      setError(null);
      const response = await payrollService.reviewPayRun(
        organizationId,
        payRunDateRange.from_date,
        payRunDateRange.to_date
      );
      
      if (response.data && response.data.status) {
        setPayRuns(response.data.data || []);
      } else {
        setError("Failed to fetch pay runs: Invalid response format");
      }
    } catch (error) {
      console.error("Error fetching pay runs:", error);
      setError(error.response?.data?.message || error.message || "Failed to fetch pay runs. Please try again.");
    } finally {
      setLoading(prev => ({ ...prev, payRuns: false }));
    }
  };

  const approvePayRun = async (xeroPayRunId) => {
    try {
      setError(null);
      const response = await payrollService.approvePayRun(xeroPayRunId, organizationId);
      
      if (response.data && response.data.status) {
        setSuccessMessage("Pay run approved successfully!");
        fetchPayRuns(); // Refresh pay runs list
      } else {
        setError(response.data?.message || "Failed to approve pay run");
      }
    } catch (error) {
      console.error("Error approving pay run:", error);
      setError(error.response?.data?.message || error.message || "Failed to approve pay run. Please try again.");
    }
  };

  const syncPayslips = async (xeroPayRunId) => {
    try {
      setLoading(prev => ({ ...prev, payslips: true }));
      setError(null);
      const response = await payrollService.syncPayslips(
        organizationId,
        xeroPayRunId
      );
      
      if (response.data && response.data.status) {
        setSuccessMessage(`Synced ${response.data.message}`);
        fetchPayslipsByPayRun(xeroPayRunId); // Refresh payslips
      } else {
        setError(response.data?.message || "Failed to sync payslips");
      }
    } catch (error) {
      console.error("Error syncing payslips:", error);
      setError(error.response?.data?.message || error.message || "Failed to sync payslips. Please try again.");
    } finally {
      setLoading(prev => ({ ...prev, payslips: false }));
    }
  };

  const fetchPayslipsByPayRun = async (xeroPayRunId) => {
    try {
      setLoading(prev => ({ ...prev, payslips: true }));
      setError(null);
      
      const response = await payrollService.getPayslipsByPayRun(xeroPayRunId);
      
      if (response.data && response.data.status) {
        const payslipData = response.data.data;
        setPayslips(payslipData.data || []);
        setSelectedPayRun(xeroPayRunId);
      } else {
        setError("Failed to fetch payslips: Invalid response format");
      }
    } catch (error) {
      console.error("Error fetching payslips:", error);
      setError(error.response?.data?.message || error.message || "Failed to fetch payslips. Please try again.");
    } finally {
      setLoading(prev => ({ ...prev, payslips: false }));
    }
  };

  // Helper functions
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

  const handlePreviewPayslip = (payslip) => {
    setPreviewPayslip(payslip);
    setShowPreview(true);
  };

  const viewPayslipDetails = (payslip) => {
    setPreviewPayslip(payslip);
    setShowPayslipDetails(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      DRAFT: "bg-yellow-100 text-yellow-800 border border-yellow-200",
      POSTED: "bg-green-100 text-green-800 border border-green-200",
      APPROVED: "bg-blue-100 text-blue-800 border border-blue-200",
      PAID: "bg-purple-100 text-purple-800 border border-purple-200",
      VOIDED: "bg-red-100 text-red-800 border border-red-200",
      default: "bg-gray-100 text-gray-800 border border-gray-200"
    };
    return colors[status] || colors.default;
  };

  const getStatusIcon = (status) => {
    const icons = {
      DRAFT: FaFileAlt,
      POSTED: FaCheckCircle,
      APPROVED: FaCheckCircle,
      PAID: FaMoneyBillWave,
      VOIDED: FaTimesCircle,
      default: FaFileAlt
    };
    return icons[status] || icons.default;
  };

  const formatCurrency = (amount) => {
    if (!amount) return "$0.00";
    const numAmount = parseFloat(amount);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numAmount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
      });
    } catch {
      return "Invalid Date";
    }
  };

  const calculateTotals = (payslipsList) => {
    return payslipsList.reduce((acc, payslip) => {
      const wages = parseFloat(payslip.wages) || 0;
      const tax = parseFloat(payslip.tax_deducted) || 0;
      const netPay = parseFloat(payslip.net_pay) || 0;
      
      return {
        totalWages: acc.totalWages + wages,
        totalTax: acc.totalTax + tax,
        totalNetPay: acc.totalNetPay + netPay,
        count: acc.count + 1
      };
    }, { totalWages: 0, totalTax: 0, totalNetPay: 0, count: 0 });
  };

  // Filter pay periods
  const filteredPayPeriods = payPeriods.filter((period) => {
    const matchesType = 
      payPeriodFilters.calendar_type === "all" || 
      period.calendar_type === payPeriodFilters.calendar_type;
    
    const matchesCurrent = 
      payPeriodFilters.is_current === "all" || 
      (payPeriodFilters.is_current === "current" && period.is_current) ||
      (payPeriodFilters.is_current === "past" && !period.is_current);
    
    return matchesType && matchesCurrent;
  });

  // Filter payslips
  const filteredPayslips = payslips.filter((payslip) => {
    const matchesSearch =
      filters.search === "" ||
      (payslip.employee_connection?.employee?.first_name?.toLowerCase().includes(filters.search.toLowerCase())) ||
      (payslip.employee_connection?.employee?.last_name?.toLowerCase().includes(filters.search.toLowerCase())) ||
      (payslip.employee_connection?.employee?.employee_code?.toLowerCase().includes(filters.search.toLowerCase()));

    return matchesSearch;
  });

  // Calculate stats
  const stats = calculateTotals(payslips);
  const selectedTotals = calculateTotals(
    payslips.filter(p => selectedPayslips.includes(p.id))
  );

  if (loading.payPeriods && payPeriods.length === 0) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading payroll data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
                <FaFileInvoice className="mr-3 text-blue-600" />
                Payroll Management
              </h1>
              <p className="text-gray-600">Manage pay periods, runs, and employee payslips</p>
              {selectedOrganization && (
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                  <FaBuilding className="text-gray-400" />
                  <span>Organization: {selectedOrganization.name} (ID: {organizationId})</span>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={fetchPayPeriods}
                disabled={loading.payPeriods}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaSync className={loading.payPeriods ? "animate-spin" : ""} />
                Refresh Data
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <FaExclamationTriangle className="text-red-500 text-xl" />
            <div>
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <FaTimesCircle />
            </button>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <FaCheckCircle className="text-green-500 text-xl" />
            <div>
              <p className="text-green-800 font-medium">Success</p>
              <p className="text-green-600 text-sm">{successMessage}</p>
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              className="ml-auto text-green-500 hover:text-green-700"
            >
              <FaTimesCircle />
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Payslips</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stats.count}</p>
              </div>
              <FaFileInvoice className="text-blue-500 text-xl" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Wages</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{formatCurrency(stats.totalWages)}</p>
              </div>
              <FaMoneyBillWave className="text-green-500 text-xl" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tax</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{formatCurrency(stats.totalTax)}</p>
              </div>
              <FaMoneyBillWave className="text-red-500 text-xl" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Net Pay</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{formatCurrency(stats.totalNetPay)}</p>
              </div>
              <FaUsers className="text-purple-500 text-xl" />
            </div>
          </div>
        </div>

        {/* Pay Periods Section */}
        <div className="mb-8 bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <FaCalendar className="mr-2 text-blue-600" />
                Pay Periods
              </h2>
              <div className="flex gap-2">
                <select
                  value={payPeriodFilters.calendar_type}
                  onChange={(e) => setPayPeriodFilters(prev => ({ ...prev, calendar_type: e.target.value }))}
                  className="border border-gray-300 px-3 py-1.5 rounded-lg text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="FORTNIGHTLY">Fortnightly</option>
                  <option value="MONTHLY">Monthly</option>
                </select>
                <select
                  value={payPeriodFilters.is_current}
                  onChange={(e) => setPayPeriodFilters(prev => ({ ...prev, is_current: e.target.value }))}
                  className="border border-gray-300 px-3 py-1.5 rounded-lg text-sm"
                >
                  <option value="all">All Periods</option>
                  <option value="current">Current Only</option>
                  <option value="past">Past Only</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Calendar</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Period</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Days</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPayPeriods.map((period) => (
                  <tr key={period.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{period.calendar_name}</div>
                      <div className="text-sm text-gray-500">ID: {period.calendar_id?.substring(0, 8)}...</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        period.calendar_type === 'WEEKLY' ? 'bg-blue-100 text-blue-800' :
                        period.calendar_type === 'FORTNIGHTLY' ? 'bg-purple-100 text-purple-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {period.calendar_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(period.start_date)}</div>
                      <div className="text-sm text-gray-500">to {formatDate(period.end_date)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {period.number_of_days} days
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {period.is_current ? (
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          Current
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                          Past
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => {
                          setPayRunDateRange({
                            from_date: period.start_date.split('T')[0],
                            to_date: period.end_date.split('T')[0]
                          });
                        }}
                        className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Use Period
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pay Runs Section */}
        <div className="mb-8 bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <FaCogs className="mr-2 text-blue-600" />
                Pay Runs
              </h2>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">From:</span>
                  <input
                    type="date"
                    value={payRunDateRange.from_date}
                    onChange={(e) => setPayRunDateRange(prev => ({ ...prev, from_date: e.target.value }))}
                    className="border border-gray-300 px-3 py-1.5 rounded-lg text-sm"
                  />
                  <span className="text-sm text-gray-600">To:</span>
                  <input
                    type="date"
                    value={payRunDateRange.to_date}
                    onChange={(e) => setPayRunDateRange(prev => ({ ...prev, to_date: e.target.value }))}
                    className="border border-gray-300 px-3 py-1.5 rounded-lg text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={fetchPayRuns}
                    disabled={loading.payRuns || !payRunDateRange.from_date || !payRunDateRange.to_date}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaSearch />
                    Review
                  </button>
                  <button
                    onClick={createPayRun}
                    disabled={loading.payRuns || !payRunDateRange.from_date || !payRunDateRange.to_date}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading.payRuns ? <FaSpinner className="animate-spin" /> : <FaPlay />}
                    Create Pay Run
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Pay Run</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Calendar</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Period</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Payment Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amounts</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payRuns.length > 0 ? (
                  payRuns.map((payRun) => {
                    const StatusIcon = getStatusIcon(payRun.status);
                    return (
                      <tr key={payRun.xero_pay_run_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">
                            {payRun.pay_run_name || `Pay Run #${payRun.xero_pay_run_id?.substring(0, 8)}`}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {payRun.xero_pay_run_id?.substring(0, 8)}...
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {payRun.calendar_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(payRun.period_start_date)}</div>
                          <div className="text-sm text-gray-500">to {formatDate(payRun.period_end_date)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(payRun.payment_date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex items-center text-xs font-medium rounded-full ${getStatusColor(payRun.status)}`}>
                            <StatusIcon className="mr-1" size={12} />
                            {payRun.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Wages:</span>
                              <span className="font-medium">{formatCurrency(payRun.total_wages)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Tax:</span>
                              <span className="font-medium text-red-600">{formatCurrency(payRun.total_tax)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Net:</span>
                              <span className="font-medium text-green-600">{formatCurrency(payRun.total_net_pay)}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex gap-1">
                            <button
                              onClick={() => fetchPayslipsByPayRun(payRun.xero_pay_run_id)}
                              className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              View Payslips
                            </button>
                            {payRun.status === 'DRAFT' && (
                              <button
                                onClick={() => approvePayRun(payRun.xero_pay_run_id)}
                                className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors"
                              >
                                Approve
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <FaCogs className="text-4xl text-gray-300 mb-3" />
                        <p className="text-lg font-medium text-gray-900 mb-1">No pay runs found</p>
                        <p className="text-gray-500">Create a pay run for the selected period</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payslips Section */}
        {selectedPayRun && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                    <FaFileInvoice className="mr-2 text-blue-600" />
                    Payslips
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Pay Run: {payRuns.find(p => p.xero_pay_run_id === selectedPayRun)?.calendar_name || 'Selected Pay Run'}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search employees..."
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="border border-gray-300 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-64"
                    />
                  </div>
                  <button
                    onClick={() => syncPayslips(selectedPayRun)}
                    disabled={loading.payslips}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading.payslips ? <FaSpinner className="animate-spin" /> : <FaSync />}
                    Sync Payslips
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedPayslips.length === filteredPayslips.length && filteredPayslips.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Hours</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Wages</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tax</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Net Pay</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPayslips.map((payslip) => (
                    <tr key={payslip.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedPayslips.includes(payslip.id)}
                          onChange={() => handlePayslipSelection(payslip.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <FaUserTie className="text-blue-600 text-lg" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900">
                              {payslip.employee_connection?.employee?.first_name} {payslip.employee_connection?.employee?.last_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {payslip.employee_connection?.employee?.employee_code} • {payslip.employee_connection?.employee?.designation_id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {parseFloat(payslip.hours_worked) || 0} hrs
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-blue-600">
                          {formatCurrency(payslip.wages)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-red-600">
                          {formatCurrency(payslip.tax_deducted)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-green-600">
                          {formatCurrency(payslip.net_pay)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-1">
                          <button
                            onClick={() => viewPayslipDetails(payslip)}
                            className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
                            title="View Details"
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() => handlePreviewPayslip(payslip)}
                            className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors"
                            title="Preview"
                          >
                            <FaFilePdf />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredPayslips.length === 0 && (
                <div className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center">
                    <FaFileInvoice className="text-4xl text-gray-300 mb-3" />
                    <p className="text-lg font-medium text-gray-900 mb-1">No payslips found</p>
                    <p className="text-gray-500">Sync payslips for the selected pay run</p>
                  </div>
                </div>
              )}
            </div>

            {/* Summary Footer */}
            {filteredPayslips.length > 0 && (
              <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Showing {filteredPayslips.length} of {payslips.length} payslips • 
                    Selected: {selectedPayslips.length} • 
                    Selected Total: {formatCurrency(selectedTotals.totalNetPay)}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Payslip Details Modal */}
        {showPayslipDetails && previewPayslip && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">
                  Payslip Details - {previewPayslip.employee_connection?.employee?.first_name} {previewPayslip.employee_connection?.employee?.last_name}
                </h2>
                <button
                  onClick={() => setShowPayslipDetails(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FaTimesCircle className="text-gray-500" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Employee Information</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p><strong>Name:</strong> {previewPayslip.employee_connection?.employee?.first_name} {previewPayslip.employee_connection?.employee?.last_name}</p>
                        <p><strong>Employee Code:</strong> {previewPayslip.employee_connection?.employee?.employee_code}</p>
                        <p><strong>Email:</strong> {previewPayslip.employee_connection?.employee?.personal_email}</p>
                        <p><strong>Phone:</strong> {previewPayslip.employee_connection?.employee?.phone_number}</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Earnings</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        {previewPayslip.earnings_lines?.map((earning, index) => (
                          <div key={index} className="mb-2 last:mb-0">
                            <div className="flex justify-between">
                              <span>Rate Per Unit: ${earning.RatePerUnit}</span>
                              <span>Units: {earning.NumberOfUnits}</span>
                            </div>
                            {earning.FixedAmount && (
                              <div className="text-right">
                                Fixed: ${earning.FixedAmount}
                              </div>
                            )}
                          </div>
                        )) || <p className="text-gray-500">No earnings data</p>}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Summary</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Hours Worked:</span>
                            <span className="font-medium">{previewPayslip.hours_worked || 0} hrs</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Wages:</span>
                            <span className="font-medium text-blue-600">{formatCurrency(previewPayslip.wages)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Tax Deducted:</span>
                            <span className="font-medium text-red-600">{formatCurrency(previewPayslip.tax_deducted)}</span>
                          </div>
                          <div className="flex justify-between border-t pt-2">
                            <span className="font-semibold">Net Pay:</span>
                            <span className="font-bold text-green-600">{formatCurrency(previewPayslip.net_pay)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Deductions & Super</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        {previewPayslip.deduction_lines?.length > 0 ? (
                          previewPayslip.deduction_lines.map((deduction, index) => (
                            <div key={index} className="mb-2 last:mb-0">
                              <div className="flex justify-between">
                                <span>Deduction:</span>
                                <span className="text-red-600">-${deduction.Amount}</span>
                              </div>
                            </div>
                          ))
                        ) : <p className="text-gray-500">No deductions</p>}
                        
                        {previewPayslip.super_lines?.length > 0 && (
                          <div className="mt-4">
                            <p className="font-medium mb-1">Superannuation:</p>
                            {previewPayslip.super_lines.map((sup, index) => (
                              <div key={index} className="text-sm">
                                {sup.ContributionType}: ${sup.Amount} ({sup.Percentage}%)
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowPayslipDetails(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <FaPrint /> Print
                  </button>
                  <button
                    className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <FaDownload /> Download PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payslip Preview Modal */}
        {showPreview && previewPayslip && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Payslip Preview</h2>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FaTimesCircle className="text-gray-500" />
                </button>
              </div>
              
              {/* Payslip Content */}
              <div className="p-6">
                <div className="border-2 border-gray-300 p-8">
                  {/* Company Header */}
                  <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">{selectedOrganization?.name || "COMPANY NAME"}</h1>
                    <p className="text-gray-600 text-lg">Salary Payslip</p>
                    <p className="text-gray-500">
                      {formatDate(payRunDateRange.from_date)} - {formatDate(payRunDateRange.to_date)}
                    </p>
                  </div>

                  {/* Employee Details */}
                  <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                      <h3 className="font-semibold mb-3 text-gray-700">Employee Details</h3>
                      <div className="space-y-2">
                        <p><strong>Name:</strong> {previewPayslip.employee_connection?.employee?.first_name} {previewPayslip.employee_connection?.employee?.last_name}</p>
                        <p><strong>Employee ID:</strong> {previewPayslip.employee_connection?.employee?.employee_code}</p>
                        <p><strong>Position:</strong> {previewPayslip.employee_connection?.employee?.designation_id}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-3 text-gray-700">Pay Details</h3>
                      <div className="space-y-2">
                        <p><strong>Pay Period:</strong> {formatDate(payRunDateRange.from_date)} - {formatDate(payRunDateRange.to_date)}</p>
                        <p><strong>Payment Date:</strong> {formatDate(payRunDateRange.to_date)}</p>
                        <p><strong>Pay Run ID:</strong> {previewPayslip.xero_pay_run_id?.substring(0, 12)}...</p>
                      </div>
                    </div>
                  </div>

                  {/* Earnings and Deductions */}
                  <div className="grid grid-cols-2 gap-8 mb-8">
                    {/* Earnings */}
                    <div>
                      <h3 className="font-semibold mb-3 text-gray-700 border-b pb-2">Earnings</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Basic Wages</span>
                          <span className="font-medium">{formatCurrency(previewPayslip.wages)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Allowances</span>
                          <span className="font-medium">{formatCurrency(previewPayslip.allowances)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Overtime</span>
                          <span className="font-medium">{formatCurrency(previewPayslip.overtime)}</span>
                        </div>
                        <div className="flex justify-between font-semibold border-t pt-2">
                          <span>Total Earnings</span>
                          <span>{formatCurrency(previewPayslip.total_earnings)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Deductions */}
                    <div>
                      <h3 className="font-semibold mb-3 text-gray-700 border-b pb-2">Deductions</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Tax Deducted</span>
                          <span className="font-medium text-red-600">-{formatCurrency(previewPayslip.tax_deducted)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Super Deductions</span>
                          <span className="font-medium text-red-600">-{formatCurrency(previewPayslip.super_deducted)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Other Deductions</span>
                          <span className="font-medium text-red-600">-{formatCurrency(previewPayslip.other_deductions)}</span>
                        </div>
                        <div className="flex justify-between font-semibold border-t pt-2">
                          <span>Total Deductions</span>
                          <span className="text-red-600">-{formatCurrency(previewPayslip.total_deductions)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Net Pay */}
                  <div className="bg-gray-100 p-6 rounded-lg text-center">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      Net Pay: {formatCurrency(previewPayslip.net_pay)}
                    </h3>
                    <p className="text-gray-600">
                      In Words: {convertToWords(parseFloat(previewPayslip.net_pay) || 0)}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="mt-8 pt-8 border-t border-gray-300 text-center text-sm text-gray-500">
                    <p>This is a computer-generated payslip. No signature is required.</p>
                    <p className="mt-2">Generated on: {new Date().toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button className="px-4 py-2.5 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2">
                    <FaPrint /> Print
                  </button>
                  <button className="px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                    <FaDownload /> Download PDF
                  </button>
                  <button className="px-4 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
                    <FaPaperPlane /> Send Email
                  </button>
                </div>
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
  if (amount === 0) return "Zero Dollars";
  
  const units = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
  const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  
  const convertHundreds = (num) => {
    let words = "";
    const hundred = Math.floor(num / 100);
    if (hundred > 0) {
      words += units[hundred] + " Hundred ";
      num %= 100;
    }
    
    if (num > 0) {
      if (num < 10) {
        words += units[num];
      } else if (num < 20) {
        words += teens[num - 10];
      } else {
        words += tens[Math.floor(num / 10)];
        if (num % 10 > 0) {
          words += " " + units[num % 10];
        }
      }
    }
    
    return words.trim();
  };
  
  let result = "";
  const dollars = Math.floor(amount);
  const cents = Math.round((amount - dollars) * 100);
  
  if (dollars >= 1000000) {
    const millions = Math.floor(dollars / 1000000);
    result += convertHundreds(millions) + " Million ";
    amount %= 1000000;
  }
  
  if (dollars >= 1000) {
    const thousands = Math.floor(dollars / 1000);
    result += convertHundreds(thousands) + " Thousand ";
    amount %= 1000;
  }
  
  result += convertHundreds(dollars % 1000);
  
  if (result === "") {
    result = "Zero";
  }
  
  result += " Dollar" + (dollars !== 1 ? "s" : "");
  
  if (cents > 0) {
    result += " and " + convertHundreds(cents) + " Cent" + (cents !== 1 ? "s" : "");
  }
  
  return result;
};

export default PayslipGeneration;