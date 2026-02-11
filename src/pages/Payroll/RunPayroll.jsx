// components/RunPayroll.jsx - COMPLETE FIXED VERSION
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
  FaExclamationTriangle,
  FaArrowRight,
  FaCheck,
  FaClock,
  FaBan,
  FaCopy,
  FaFileExcel,
  FaChartLine,
  FaInfoCircle,
  FaTrash,
  FaUndo
} from "react-icons/fa";
import { payrollService } from "../../services/payrollService.js";
import { useOrganizations } from "../../contexts/OrganizationContext.jsx";

const RunPayroll = () => {
  const { selectedOrganization } = useOrganizations();
  const organizationId = selectedOrganization?.id || "15";

  const [loading, setLoading] = useState({
    payPeriods: false,
    payRuns: false,
    payslips: false,
    creatingPayRun: false
  });
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [activeTab, setActiveTab] = useState("payPeriods");

  // State for pay periods
  const [payPeriods, setPayPeriods] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [payPeriodFilters, setPayPeriodFilters] = useState({
    calendar_type: "all",
    is_current: "current"
  });

  // State for pay runs
  const [payRuns, setPayRuns] = useState([]);
  const [selectedPayRun, setSelectedPayRun] = useState(null);
  const [payRunFilters, setPayRunFilters] = useState({
    status: "all",
    search: ""
  });

  // State for payslips
  const [payslips, setPayslips] = useState([]);
  const [selectedPayslips, setSelectedPayslips] = useState([]);
  const [payslipFilters, setPayslipFilters] = useState({
    search: "",
    status: "all"
  });

  // Form state
  const [payRunDateRange, setPayRunDateRange] = useState({
    from_date: "",
    to_date: ""
  });
  const [calendarType, setCalendarType] = useState("FORTNIGHTLY");

  // Preview state
  const [showPreview, setShowPreview] = useState(false);
  const [previewPayslip, setPreviewPayslip] = useState(null);
  const [showPayRunDetails, setShowPayRunDetails] = useState(false);
  const [selectedPayRunDetails, setSelectedPayRunDetails] = useState(null);

  // Fetch data on component mount
  useEffect(() => {
    fetchPayPeriods();
    fetchAllPayRuns();
  }, [organizationId]);

  // Fetch pay periods
  const fetchPayPeriods = async () => {
    try {
      setLoading(prev => ({ ...prev, payPeriods: true }));
      setError(null);
      const response = await payrollService.fetchPayPeriods(organizationId);
      
      if (response.data?.status) {
        const periods = response.data.data || [];
        setPayPeriods(periods);
        
        // Set default selected period to current
        const currentPeriod = periods.find(p => p.is_current);
        if (currentPeriod) {
          setSelectedPeriod(currentPeriod);
          setPayRunDateRange({
            from_date: currentPeriod.start_date.split('T')[0],
            to_date: currentPeriod.end_date.split('T')[0]
          });
          setCalendarType(currentPeriod.calendar_type);
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

  // Create pay run - FIXED WITH DRAFT HANDLING
  // In RunPayroll.jsx - Replace the entire createPayRun function with this:

const createPayRun = async () => {
  if (!payRunDateRange.from_date || !payRunDateRange.to_date) {
    setError("Please select a date range");
    return;
  }

  try {
    setLoading(prev => ({ ...prev, creatingPayRun: true }));
    setError(null);
    setSuccessMessage(null);
    
    console.log('🔄 Creating pay run for period:', {
      from: payRunDateRange.from_date,
      to: payRunDateRange.to_date
    });
    
    const response = await payrollService.createPayRun(
      organizationId.toString(),
      payRunDateRange.from_date,
      payRunDateRange.to_date
    );
    
    if (response.data?.status) {
      setSuccessMessage(response.data.message || "Pay run created successfully!");
      
      // Clear form
      setPayRunDateRange({
        from_date: "",
        to_date: ""
      });
      
      // Refresh data
      await fetchAllPayRuns();
      await fetchPayPeriods();
      
      // Switch to pay runs tab
      setActiveTab("payRuns");
      setPayRunFilters(prev => ({ ...prev, status: "DRAFT" }));
    }
  } catch (error) {
    console.error("❌ Error creating pay run:", error);
    
    let errorMessage = error.message || "Failed to create pay run";
    
    // Special handling for draft pay run error
    if (error.type === 'DRAFT_EXISTS' || 
        error.message?.includes('draft pay run') || 
        error.details?.Message?.includes('one draft pay run per pay frequency')) {
      
      // Force fetch all pay runs to check
      console.log('🔍 Fetching all pay runs to check for drafts...');
      await fetchAllPayRuns();
      
      // Get ALL pay runs, not just filtered ones
      const allDraftPayRuns = payRuns.filter(p => p.status === 'DRAFT');
      const draftCount = allDraftPayRuns.length;
      
      errorMessage = `⚠️ Cannot create pay run: There is already a draft pay run for this period.\n\n`;
      
      if (draftCount > 0) {
        errorMessage += `Found ${draftCount} draft pay run(s):\n`;
        allDraftPayRuns.slice(0, 3).forEach((payRun, index) => {
          errorMessage += `${index + 1}. ${payRun.calendar_name || 'Unnamed'} `;
          errorMessage += `(${formatDate(payRun.period_start_date)} - ${formatDate(payRun.period_end_date)})\n`;
        });
        if (draftCount > 3) {
          errorMessage += `... and ${draftCount - 3} more\n`;
        }
      } else {
        errorMessage += `Note: The system says there's a draft, but none are showing in our list.\n`;
        errorMessage += `This might be because:\n`;
        errorMessage += `1. The draft is in Xero but not synced to our system yet\n`;
        errorMessage += `2. The pay run date range doesn't match our search\n`;
        errorMessage += `3. There's a synchronization issue\n`;
      }
      
      errorMessage += `\nPlease:\n`;
      errorMessage += `1. Go to the "Pay Runs" tab\n`;
      errorMessage += `2. Look for any DRAFT pay runs (all periods)\n`;
      errorMessage += `3. Approve or void them\n`;
      errorMessage += `4. Try creating a new pay run again\n`;
      errorMessage += `\nOr try creating a pay run for a different date range.`;
      
      // Switch to pay runs tab and show all (no filter)
      setActiveTab("payRuns");
      setPayRunFilters(prev => ({ ...prev, status: "all" }));
    }
    
    setError(errorMessage);
  } finally {
    setLoading(prev => ({ ...prev, creatingPayRun: false }));
  }
};

// Also update the fetchAllPayRuns function to ensure it fetches ALL pay runs:
const fetchAllPayRuns = async () => {
  try {
    setLoading(prev => ({ ...prev, payRuns: true }));
    setError(null);
    
    // Fetch pay runs WITHOUT date filter to get ALL pay runs
    const response = await payrollService.reviewPayRun(organizationId);
    
    if (response.data?.status) {
      const allPayRuns = response.data.data || [];
      setPayRuns(allPayRuns);
      console.log('📋 All pay runs fetched:', {
        total: allPayRuns.length,
        drafts: allPayRuns.filter(p => p.status === 'DRAFT').length,
        payRuns: allPayRuns.map(p => ({
          id: p.xero_pay_run_id,
          name: p.calendar_name,
          status: p.status,
          period: `${formatDate(p.period_start_date)} - ${formatDate(p.period_end_date)}`
        }))
      });
    }
  } catch (error) {
    console.error("Error fetching pay runs:", error);
    setError(error.response?.data?.message || error.message || "Failed to fetch pay runs.");
  } finally {
    setLoading(prev => ({ ...prev, payRuns: false }));
  }
};

// Update the useEffect to use fetchAllPayRuns:
useEffect(() => {
  fetchPayPeriods();
  fetchAllPayRuns(); // Changed from fetchPayRuns()
}, [organizationId]);

 

  // Fetch pay runs with date filter
  const fetchPayRuns = async (fromDate = null, toDate = null) => {
    try {
      setLoading(prev => ({ ...prev, payRuns: true }));
      setError(null);
      
      const from = fromDate || payRunDateRange.from_date;
      const to = toDate || payRunDateRange.to_date;
      
      const response = await payrollService.reviewPayRun(
        organizationId,
        from,
        to
      );
      
      if (response.data?.status) {
        setPayRuns(response.data.data || []);
      } else {
        setError("Failed to fetch pay runs: Invalid response format");
      }
    } catch (error) {
      console.error("Error fetching pay runs:", error);
      setError(error.response?.data?.message || error.message || "Failed to fetch pay runs.");
    } finally {
      setLoading(prev => ({ ...prev, payRuns: false }));
    }
  };

  // Approve pay run
  const approvePayRun = async (xeroPayRunId) => {
    if (!window.confirm("Are you sure you want to approve this pay run? This action cannot be undone.")) {
      return;
    }

    try {
      setError(null);
      const response = await payrollService.approvePayRun(xeroPayRunId, organizationId);
      
      if (response.data?.status) {
        setSuccessMessage("Pay run approved successfully!");
        fetchAllPayRuns();
      } else {
        setError(response.data?.message || "Failed to approve pay run");
      }
    } catch (error) {
      console.error("Error approving pay run:", error);
      setError(error.response?.data?.message || error.message || "Failed to approve pay run.");
    }
  };

  // Sync payslips
  const syncPayslips = async (xeroPayRunId) => {
    try {
      setLoading(prev => ({ ...prev, payslips: true }));
      setError(null);
      const response = await payrollService.syncPayslips(
        organizationId,
        xeroPayRunId
      );
      
      if (response.data?.status) {
        setSuccessMessage(`Payslips synced successfully! ${response.data.message}`);
        fetchPayslipsByPayRun(xeroPayRunId);
      } else {
        setError(response.data?.message || "Failed to sync payslips");
      }
    } catch (error) {
      console.error("Error syncing payslips:", error);
      setError(error.response?.data?.message || error.message || "Failed to sync payslips.");
    } finally {
      setLoading(prev => ({ ...prev, payslips: false }));
    }
  };

  // Fetch payslips by pay run
  const fetchPayslipsByPayRun = async (xeroPayRunId) => {
    try {
      setLoading(prev => ({ ...prev, payslips: true }));
      setError(null);
      
      const response = await payrollService.getPayslipsByPayRun(xeroPayRunId);
      
      if (response.data?.status) {
        setPayslips(response.data.data || []);
        setSelectedPayRun(xeroPayRunId);
        setActiveTab("payslips");
      } else {
        setError("Failed to fetch payslips: Invalid response format");
      }
    } catch (error) {
      console.error("Error fetching payslips:", error);
      setError(error.response?.data?.message || error.message || "Failed to fetch payslips.");
    } finally {
      setLoading(prev => ({ ...prev, payslips: false }));
    }
  };

  // View pay run details
  const viewPayRunDetails = async (payRun) => {
    setSelectedPayRunDetails(payRun);
    setShowPayRunDetails(true);
  };

  // Preview payslip
  const handlePreviewPayslip = (payslip) => {
    setPreviewPayslip(payslip);
    setShowPreview(true);
  };

  // Helper functions
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
      APPROVED: FaCheck,
      PAID: FaMoneyBillWave,
      VOIDED: FaBan,
      default: FaFileAlt
    };
    return icons[status] || icons.default;
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "$0.00";
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

  const calculatePayRunStats = (payRun) => {
    return {
      totalWages: formatCurrency(payRun.total_wages),
      totalTax: formatCurrency(payRun.total_tax),
      totalNetPay: formatCurrency(payRun.total_net_pay),
      employeeCount: payRun.employee_count || 0
    };
  };

  // Filter functions
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

  const filteredPayRuns = payRuns.filter((payRun) => {
    const matchesStatus = 
      payRunFilters.status === "all" || 
      payRun.status === payRunFilters.status;
    
    const matchesSearch =
      payRunFilters.search === "" ||
      (payRun.calendar_name?.toLowerCase().includes(payRunFilters.search.toLowerCase())) ||
      (payRun.xero_pay_run_id?.toLowerCase().includes(payRunFilters.search.toLowerCase())) ||
      (payRun.pay_run_name?.toLowerCase().includes(payRunFilters.search.toLowerCase()));
    
    return matchesStatus && matchesSearch;
  });

  const filteredPayslips = payslips.filter((payslip) => {
    const employee = payslip.employee_connection?.employee;
    const matchesSearch =
      payslipFilters.search === "" ||
      (employee?.first_name?.toLowerCase().includes(payslipFilters.search.toLowerCase())) ||
      (employee?.last_name?.toLowerCase().includes(payslipFilters.search.toLowerCase())) ||
      (employee?.employee_code?.toLowerCase().includes(payslipFilters.search.toLowerCase()));
    
    return matchesSearch;
  });

  // Get draft pay runs count
  const draftPayRunsCount = payRuns.filter(p => p.status === 'DRAFT').length;

  if (loading.payPeriods && loading.payRuns) {
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
                Run Payroll
              </h1>
              <p className="text-gray-600">Manage pay periods, create pay runs, and process employee payments</p>
              {selectedOrganization && (
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                  <FaBuilding className="text-gray-400" />
                  <span>Organization: {selectedOrganization.name} (ID: {organizationId})</span>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  fetchPayPeriods();
                  fetchAllPayRuns();
                }}
                disabled={loading.payPeriods || loading.payRuns}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaSync className={loading.payPeriods || loading.payRuns ? "animate-spin" : ""} />
                Refresh Data
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <FaExclamationTriangle className="text-red-500 text-xl mt-0.5" />
              <div className="flex-1">
                <p className="text-red-800 font-medium">Error</p>
                <p className="text-red-600 text-sm whitespace-pre-line">{error}</p>
                
                {/* Show special actions for draft error */}
                {error.includes('draft pay run') && (
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => {
                        setActiveTab("payRuns");
                        setPayRunFilters(prev => ({ ...prev, status: "DRAFT" }));
                      }}
                      className="px-3 py-1.5 bg-yellow-600 text-white text-xs font-medium rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-1"
                    >
                      <FaEye /> View Draft Pay Runs ({draftPayRunsCount})
                    </button>
                    <button
                      onClick={() => setError(null)}
                      className="px-3 py-1.5 bg-gray-600 text-white text-xs font-medium rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-1"
                    >
                      <FaTimesCircle /> Dismiss
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-700"
              >
                <FaTimesCircle />
              </button>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <FaCheckCircle className="text-green-500 text-xl" />
            <div className="flex-1">
              <p className="text-green-800 font-medium">Success</p>
              <p className="text-green-600 text-sm">{successMessage}</p>
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-green-500 hover:text-green-700"
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
                <p className="text-sm font-medium text-gray-600">Total Pay Runs</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{payRuns.length}</p>
                {draftPayRunsCount > 0 && (
                  <p className="text-xs text-yellow-600 mt-1">{draftPayRunsCount} draft(s)</p>
                )}
              </div>
              <FaFileInvoice className="text-blue-500 text-xl" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Wages</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {formatCurrency(payRuns.reduce((sum, run) => sum + (parseFloat(run.total_wages) || 0), 0))}
                </p>
              </div>
              <FaMoneyBillWave className="text-green-500 text-xl" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tax</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {formatCurrency(payRuns.reduce((sum, run) => sum + (parseFloat(run.total_tax) || 0), 0))}
                </p>
              </div>
              <FaChartLine className="text-red-500 text-xl" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Net Payout</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {formatCurrency(payRuns.reduce((sum, run) => sum + (parseFloat(run.total_net_pay) || 0), 0))}
                </p>
              </div>
              <FaUsers className="text-purple-500 text-xl" />
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-8">
            {["payPeriods", "payRuns", "payslips"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab === "payPeriods" && (
                  <span className="flex items-center gap-2">
                    <FaCalendar /> Pay Periods
                    {payPeriods.length > 0 && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {payPeriods.length}
                      </span>
                    )}
                  </span>
                )}
                {tab === "payRuns" && (
                  <span className="flex items-center gap-2">
                    <FaCogs /> Pay Runs
                    {payRuns.length > 0 && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {payRuns.length}
                      </span>
                    )}
                    {draftPayRunsCount > 0 && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                        {draftPayRunsCount} draft
                      </span>
                    )}
                  </span>
                )}
                {tab === "payslips" && (
                  <span className="flex items-center gap-2">
                    <FaFileInvoice /> Payslips
                    {selectedPayRun && payslips.length > 0 && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {payslips.length}
                      </span>
                    )}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Pay Periods Tab */}
        {activeTab === "payPeriods" && (
          <div className="space-y-6">
            {/* Create Pay Run Card */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                    <FaPlay className="mr-2 text-green-600" />
                    Create New Pay Run
                  </h2>
                  {draftPayRunsCount > 0 && (
                    <div className="flex items-center gap-2 text-sm text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full">
                      <FaExclamationTriangle />
                      <span>You have {draftPayRunsCount} draft pay run(s)</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Date Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pay Period Date Range *
                    </label>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">From Date</label>
                        <input
                          type="date"
                          value={payRunDateRange.from_date}
                          onChange={(e) => setPayRunDateRange(prev => ({ ...prev, from_date: e.target.value }))}
                          className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">To Date</label>
                        <input
                          type="date"
                          value={payRunDateRange.to_date}
                          onChange={(e) => setPayRunDateRange(prev => ({ ...prev, to_date: e.target.value }))}
                          className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Calendar Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Calendar Type
                    </label>
                    <select
                      value={calendarType}
                      onChange={(e) => setCalendarType(e.target.value)}
                      className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    >
                      <option value="WEEKLY">Weekly</option>
                      <option value="FORTNIGHTLY">Fortnightly</option>
                      <option value="MONTHLY">Monthly</option>
                    </select>
                  </div>

                  {/* Quick Select */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quick Select Period
                    </label>
                    <select
                      value={selectedPeriod?.id || ""}
                      onChange={(e) => {
                        const period = payPeriods.find(p => p.id === parseInt(e.target.value));
                        if (period) {
                          setSelectedPeriod(period);
                          setPayRunDateRange({
                            from_date: period.start_date.split('T')[0],
                            to_date: period.end_date.split('T')[0]
                          });
                          setCalendarType(period.calendar_type);
                        }
                      }}
                      className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    >
                      <option value="">Select a pay period</option>
                      {payPeriods.map(period => (
                        <option key={period.id} value={period.id}>
                          {period.calendar_name} ({formatDate(period.start_date)} - {formatDate(period.end_date)})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-6 flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    {payRunDateRange.from_date && payRunDateRange.to_date && (
                      <div className="flex items-center gap-2">
                        <FaInfoCircle className="text-blue-500" />
                        <span>Selected period: {formatDate(payRunDateRange.from_date)} to {formatDate(payRunDateRange.to_date)}</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={createPayRun}
                    disabled={loading.creatingPayRun || !payRunDateRange.from_date || !payRunDateRange.to_date}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading.creatingPayRun ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      <FaPlay />
                    )}
                    Create Pay Run
                  </button>
                </div>
              </div>
            </div>

            {/* Pay Periods List */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="border-b border-gray-200 px-6 py-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                    <FaCalendar className="mr-2 text-blue-600" />
                    Available Pay Periods
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
                              setCalendarType(period.calendar_type);
                              setSelectedPeriod(period);
                            }}
                            className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Use This Period
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Pay Runs Tab */}
        {activeTab === "payRuns" && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search pay runs..."
                    value={payRunFilters.search}
                    onChange={(e) => setPayRunFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="w-full border border-gray-300 pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
                  />
                </div>
                
                <select
                  value={payRunFilters.status}
                  onChange={(e) => setPayRunFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="DRAFT">Draft</option>
                  <option value="POSTED">Posted</option>
                  <option value="APPROVED">Approved</option>
                  <option value="PAID">Paid</option>
                  <option value="VOIDED">Voided</option>
                </select>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">From:</span>
                  <input
                    type="date"
                    value={payRunDateRange.from_date}
                    onChange={(e) => setPayRunDateRange(prev => ({ ...prev, from_date: e.target.value }))}
                    className="border border-gray-300 px-3 py-2 rounded text-sm"
                  />
                </div>

                <button
                  onClick={() => fetchPayRuns()}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FaSearch /> Search
                </button>
              </div>
            </div>

            {/* Pay Runs List */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Pay Run Details</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Period</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Payment Date</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Financial Summary</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredPayRuns.map((payRun) => {
                      const StatusIcon = getStatusIcon(payRun.status);
                      const stats = calculatePayRunStats(payRun);
                      return (
                        <tr key={payRun.xero_pay_run_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <FaFileInvoice className="text-blue-600 text-lg" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-semibold text-gray-900">
                                  {payRun.calendar_name || `Pay Run #${payRun.xero_pay_run_id?.substring(0, 8)}`}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {payRun.xero_pay_run_id?.substring(0, 12)}...
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatDate(payRun.period_start_date)}</div>
                            <div className="text-sm text-gray-500">to {formatDate(payRun.period_end_date)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(payRun.payment_date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 inline-flex items-center text-xs font-medium rounded-full ${getStatusColor(payRun.status)}`}>
                              <StatusIcon className="mr-1" size={12} />
                              {payRun.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Wages:</span>
                                <span className="font-medium">{stats.totalWages}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Tax:</span>
                                <span className="font-medium text-red-600">{stats.totalTax}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Net:</span>
                                <span className="font-medium text-green-600">{stats.totalNetPay}</span>
                              </div>
                              <div className="text-xs text-gray-500">
                                {stats.employeeCount} employees
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex flex-col gap-2">
                              <button
                                onClick={() => viewPayRunDetails(payRun)}
                                className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                              >
                                <FaEye /> Details
                              </button>
                              <button
                                onClick={() => fetchPayslipsByPayRun(payRun.xero_pay_run_id)}
                                className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
                              >
                                <FaFileInvoice /> Payslips
                              </button>
                              {payRun.status === 'DRAFT' && (
                                <button
                                  onClick={() => approvePayRun(payRun.xero_pay_run_id)}
                                  className="px-3 py-1.5 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-1"
                                >
                                  <FaCheck /> Approve
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {filteredPayRuns.length === 0 && (
                  <div className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <FaFileInvoice className="text-4xl text-gray-300 mb-3" />
                      <p className="text-lg font-medium text-gray-900 mb-1">No pay runs found</p>
                      <p className="text-gray-500">Create a pay run from the Pay Periods tab</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Payslips Tab */}
        {activeTab === "payslips" && (
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    Payslips for {selectedPayRun ? payRuns.find(p => p.xero_pay_run_id === selectedPayRun)?.calendar_name : "Selected Pay Run"}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {payslips.length} payslips • Total: {formatCurrency(payslips.reduce((sum, p) => sum + (parseFloat(p.net_pay) || 0), 0))}
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="relative">
                    <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search employees..."
                      value={payslipFilters.search}
                      onChange={(e) => setPayslipFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="border border-gray-300 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-64"
                    />
                  </div>
                  {selectedPayRun && (
                    <button
                      onClick={() => {
                        const payRun = payRuns.find(p => p.xero_pay_run_id === selectedPayRun);
                        if (payRun) syncPayslips(payRun.xero_pay_run_id);
                      }}
                      disabled={loading.payslips}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading.payslips ? <FaSpinner className="animate-spin" /> : <FaSync />}
                      Sync Payslips
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Payslips List */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={selectedPayslips.length === filteredPayslips.length && filteredPayslips.length > 0}
                          onChange={() => {
                            if (selectedPayslips.length === filteredPayslips.length) {
                              setSelectedPayslips([]);
                            } else {
                              setSelectedPayslips(filteredPayslips.map(p => p.id));
                            }
                          }}
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
                            onChange={() => {
                              setSelectedPayslips(prev =>
                                prev.includes(payslip.id)
                                  ? prev.filter(id => id !== payslip.id)
                                  : [...prev, payslip.id]
                              );
                            }}
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
                                {payslip.employee_connection?.employee?.employee_code}
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
                              onClick={() => handlePreviewPayslip(payslip)}
                              className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
                              title="Preview"
                            >
                              <FaEye />
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
                      <p className="text-gray-500">Sync payslips or select a pay run</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Pay Run Details Modal */}
        {showPayRunDetails && selectedPayRunDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">
                  Pay Run Details
                </h2>
                <button
                  onClick={() => setShowPayRunDetails(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FaTimesCircle className="text-gray-500" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Pay Run Information</h3>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                        <p><strong>Calendar:</strong> {selectedPayRunDetails.calendar_name}</p>
                        <p><strong>Pay Run ID:</strong> {selectedPayRunDetails.xero_pay_run_id}</p>
                        <p><strong>Status:</strong> 
                          <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusColor(selectedPayRunDetails.status)}`}>
                            {selectedPayRunDetails.status}
                          </span>
                        </p>
                        <p><strong>Type:</strong> {selectedPayRunDetails.pay_run_type}</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Dates</h3>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                        <p><strong>Period:</strong> {formatDate(selectedPayRunDetails.period_start_date)} - {formatDate(selectedPayRunDetails.period_end_date)}</p>
                        <p><strong>Payment Date:</strong> {formatDate(selectedPayRunDetails.payment_date)}</p>
                        <p><strong>Last Synced:</strong> {formatDate(selectedPayRunDetails.last_synced_at)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Financial Summary</h3>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                        <div className="flex justify-between">
                          <span>Total Wages:</span>
                          <span className="font-bold text-blue-600">{formatCurrency(selectedPayRunDetails.total_wages)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Tax:</span>
                          <span className="font-bold text-red-600">{formatCurrency(selectedPayRunDetails.total_tax)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Super:</span>
                          <span className="font-bold text-purple-600">{formatCurrency(selectedPayRunDetails.total_super)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Deductions:</span>
                          <span className="font-bold text-orange-600">{formatCurrency(selectedPayRunDetails.total_deductions)}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="font-bold">Net Pay:</span>
                          <span className="font-bold text-green-600">{formatCurrency(selectedPayRunDetails.total_net_pay)}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Employees</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="font-medium">{selectedPayRunDetails.employee_count} employees in this pay run</p>
                        {selectedPayRunDetails.xero_data?.Payslips && (
                          <div className="mt-2 text-sm">
                            {selectedPayRunDetails.xero_data.Payslips.slice(0, 3).map((p, i) => (
                              <div key={i} className="flex justify-between">
                                <span>{p.FirstName} {p.LastName}</span>
                                <span>{formatCurrency(p.NetPay)}</span>
                              </div>
                            ))}
                            {selectedPayRunDetails.xero_data.Payslips.length > 3 && (
                              <p className="text-gray-500 text-xs mt-2">
                                +{selectedPayRunDetails.xero_data.Payslips.length - 3} more employees
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowPayRunDetails(false)}
                    className="px-4 py-2.5 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      fetchPayslipsByPayRun(selectedPayRunDetails.xero_pay_run_id);
                      setShowPayRunDetails(false);
                    }}
                    className="px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <FaFileInvoice /> View Payslips
                  </button>
                  {selectedPayRunDetails.status === 'DRAFT' && (
                    <button
                      onClick={() => {
                        approvePayRun(selectedPayRunDetails.xero_pay_run_id);
                        setShowPayRunDetails(false);
                      }}
                      className="px-4 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <FaCheck /> Approve Pay Run
                    </button>
                  )}
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
              
              <div className="p-6">
                <div className="border-2 border-gray-300 p-8">
                  {/* Payslip Content */}
                  <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">{selectedOrganization?.name || "COMPANY NAME"}</h1>
                    <p className="text-gray-600 text-lg">Salary Payslip</p>
                    <p className="text-gray-500">Pay Period: {formatDate(payRunDateRange.from_date)} - {formatDate(payRunDateRange.to_date)}</p>
                  </div>

                  {/* Employee Details */}
                  <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                      <h3 className="font-semibold mb-3 text-gray-700">Employee Details</h3>
                      <div className="space-y-2">
                        <p><strong>Name:</strong> {previewPayslip.employee_connection?.employee?.first_name} {previewPayslip.employee_connection?.employee?.last_name}</p>
                        <p><strong>Employee ID:</strong> {previewPayslip.employee_connection?.employee?.employee_code}</p>
                        <p><strong>Department:</strong> {previewPayslip.employee_connection?.employee?.department_id}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-3 text-gray-700">Pay Details</h3>
                      <div className="space-y-2">
                        <p><strong>Hours Worked:</strong> {previewPayslip.hours_worked || 0} hours</p>
                        <p><strong>Pay Slip ID:</strong> {previewPayslip.xero_payslip_id?.substring(0, 12)}...</p>
                        <p><strong>Generated:</strong> {formatDate(previewPayslip.created_at)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Earnings and Deductions */}
                  <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                      <h3 className="font-semibold mb-3 text-gray-700 border-b pb-2">Earnings</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Basic Wages</span>
                          <span className="font-medium">{formatCurrency(previewPayslip.wages)}</span>
                        </div>
                        <div className="flex justify-between font-semibold border-t pt-2">
                          <span>Total Earnings</span>
                          <span>{formatCurrency(previewPayslip.total_earnings || previewPayslip.wages)}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3 text-gray-700 border-b pb-2">Deductions</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Tax</span>
                          <span className="font-medium text-red-600">-{formatCurrency(previewPayslip.tax_deducted)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Superannuation</span>
                          <span className="font-medium text-red-600">-{formatCurrency(previewPayslip.super_deducted)}</span>
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
                      {convertToWords(parseFloat(previewPayslip.net_pay) || 0)}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="mt-8 pt-8 border-t border-gray-300 text-center text-sm text-gray-500">
                    <p>This is a computer-generated payslip. No signature is required.</p>
                    <p className="mt-2">Generated on: {formatDate(previewPayslip.created_at)}</p>
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

export default RunPayroll;