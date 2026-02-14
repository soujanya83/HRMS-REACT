// components/PayslipGeneration.jsx - FORTNIGHTLY ONLY WITH ALL PAYSLIPS API
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
  FaInfoCircle,
  FaAngleLeft,
  FaCheck,
  FaListAlt,
  FaFileInvoice as FaPayslipIcon
} from "react-icons/fa";
import { payrollService } from "../../services/payrollService.js";
import { useOrganizations } from "../../contexts/OrganizationContext.jsx";

const PayslipGeneration = () => {
  const { selectedOrganization } = useOrganizations();
  const organizationId = selectedOrganization?.id || "15";

  const [loading, setLoading] = useState({
    payPeriods: false,
    payRuns: false,
    payslips: false,
    allPayslips: false,
    creatingPayRun: false,
    approving: false,
    syncing: false,
    employeeHistory: false
  });
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  // View Modes
  const [payslipViewMode, setPayslipViewMode] = useState("byPayRun"); // 'byPayRun' or 'all'

  // State for pay periods - FORTNIGHTLY ONLY
  const [payPeriods, setPayPeriods] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [payPeriodFilters, setPayPeriodFilters] = useState({
    is_current: "all"
  });

  // State for pay runs
  const [payRuns, setPayRuns] = useState([]);
  const [allPayRuns, setAllPayRuns] = useState([]); // All pay runs for organization
  const [selectedPayRun, setSelectedPayRun] = useState(null);
  const [payRunDateRange, setPayRunDateRange] = useState({
    from_date: "",
    to_date: ""
  });

  // State for payslips
  const [payslips, setPayslips] = useState([]); // Filtered by pay run
  const [allPayslips, setAllPayslips] = useState([]); // ALL payslips for organization
  const [selectedPayslips, setSelectedPayslips] = useState([]);
  const [filters, setFilters] = useState({
    department: "all",
    status: "all",
    search: ""
  });

  // State for employee payslip history
  const [employeeHistory, setEmployeeHistory] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showEmployeeHistory, setShowEmployeeHistory] = useState(false);

  // Preview state
  const [showPreview, setShowPreview] = useState(false);
  const [previewPayslip, setPreviewPayslip] = useState(null);
  const [showPayslipDetails, setShowPayslipDetails] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    if (organizationId) {
      fetchPayPeriods();
      fetchAllPayRunsForOrganization();
      fetchAllPayslipsForOrganization(); // NEW: Fetch all payslips
    }
  }, [organizationId]);

  // ============ PAY PERIODS API ============
  const fetchPayPeriods = async () => {
    try {
      setLoading(prev => ({ ...prev, payPeriods: true }));
      setError(null);
      const response = await payrollService.fetchPayPeriods(organizationId);
      
      if (response.data && response.data.status) {
        const allPeriods = response.data.data || [];
        
        // FILTER: ONLY FORTNIGHTLY PERIODS
        const fortnightlyPeriods = allPeriods.filter(p => 
          p.calendar_type && p.calendar_type.toUpperCase() === "FORTNIGHTLY"
        );
        
        fortnightlyPeriods.sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
        setPayPeriods(fortnightlyPeriods);
        
        const currentPeriod = fortnightlyPeriods.find(p => p.is_current === true);
        if (currentPeriod) {
          setSelectedPeriod(currentPeriod);
          setPayRunDateRange({
            from_date: currentPeriod.start_date.split('T')[0],
            to_date: currentPeriod.end_date.split('T')[0]
          });
          fetchPayRuns(currentPeriod);
        } else if (fortnightlyPeriods.length > 0) {
          setSelectedPeriod(fortnightlyPeriods[0]);
          setPayRunDateRange({
            from_date: fortnightlyPeriods[0].start_date.split('T')[0],
            to_date: fortnightlyPeriods[0].end_date.split('T')[0]
          });
          fetchPayRuns(fortnightlyPeriods[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching pay periods:", error);
      setError(error.response?.data?.message || error.message || "Failed to fetch pay periods.");
    } finally {
      setLoading(prev => ({ ...prev, payPeriods: false }));
    }
  };

  // ============ PAY RUNS APIS ============
  const fetchAllPayRunsForOrganization = async () => {
    try {
      const response = await payrollService.getAllPayRunsByOrganization(organizationId);
      if (response.data && response.data.status) {
        const allPayRunsData = response.data.data || [];
        // Filter to fortnightly pay runs
        const fortnightlyPayRuns = allPayRunsData.filter(payRun => {
          if (payRun.period_start_date && payRun.period_end_date) {
            const start = new Date(payRun.period_start_date);
            const end = new Date(payRun.period_end_date);
            const daysDiff = Math.round((end - start) / (1000 * 60 * 60 * 24));
            return daysDiff === 14 || daysDiff === 13 || daysDiff === 15;
          }
          return payRun.calendar_name?.toLowerCase().includes('fortnightly');
        });
        setAllPayRuns(fortnightlyPayRuns);
      }
    } catch (error) {
      console.error("Error fetching all pay runs:", error);
    }
  };

  const fetchPayRuns = async (period = selectedPeriod) => {
    if (!period) {
      setError("Please select a period first");
      return;
    }

    try {
      setLoading(prev => ({ ...prev, payRuns: true }));
      setError(null);
      
      const fromDate = period.start_date.split('T')[0];
      const toDate = period.end_date.split('T')[0];
      
      const response = await payrollService.reviewPayRun(organizationId, fromDate, toDate);
      
      if (response.data && response.data.status) {
        const payRunsData = response.data.data || [];
        setPayRuns(payRunsData);
        console.log(`📊 Found ${payRunsData.length} pay run(s) for period`);
      } else {
        setPayRuns([]);
      }
    } catch (error) {
      console.error("Error fetching pay runs:", error);
      setPayRuns([]);
    } finally {
      setLoading(prev => ({ ...prev, payRuns: false }));
    }
  };

  const fetchAllPayslipsForOrganization = async () => {
    try {
      setLoading(prev => ({ ...prev, allPayslips: true }));
      setError(null);
      
      console.log('📡 Fetching ALL payslips for organization:', organizationId);
      const response = await payrollService.getAllPayslipsByOrganization(organizationId);
      
      if (response.data && response.data.status) {
        const payslipsData = response.data.data || [];
        setAllPayslips(payslipsData);
        console.log(`📊 Loaded ${payslipsData.length} payslips for organization`);
      }
    } catch (error) {
      console.error("Error fetching all payslips:", error);
      setAllPayslips([]);
    } finally {
      setLoading(prev => ({ ...prev, allPayslips: false }));
    }
  };

  const fetchPayslipsByPayRun = async (xeroPayRunId) => {
    try {
      setLoading(prev => ({ ...prev, payslips: true }));
      setError(null);
      
      // Find the pay run in either allPayRuns or payRuns
      const payRun = allPayRuns.find(p => p.xero_pay_run_id === xeroPayRunId) || 
                     payRuns.find(p => p.xero_pay_run_id === xeroPayRunId);
      
      if (!payRun) {
        setError("Pay run not found");
        return;
      }

      const response = await payrollService.getPayslipsByPayRun(payRun.id);
      
      if (response.data && response.data.status) {
        const payslipData = response.data.data.data || [];
        setPayslips(payslipData);
        setSelectedPayRun(xeroPayRunId);
        setPayslipViewMode('byPayRun');
        console.log(`📋 Loaded ${payslipData.length} payslips from database`);
      } else {
        setPayslips([]);
      }
    } catch (error) {
      console.error("Error fetching payslips:", error);
      setPayslips([]);
    } finally {
      setLoading(prev => ({ ...prev, payslips: false }));
    }
  };

  // ============ CREATE PAY RUN ============
  const createPayRun = async () => {
    if (!selectedPeriod) {
      setError("Please select a pay period first");
      return;
    }

    if (payRuns.length > 0) {
      const existingPayRun = payRuns[0];
      setError(
        `⚠️ Cannot create pay run: A ${existingPayRun.status} pay run already exists for this period.\n\n` +
        `Period: ${formatDate(selectedPeriod.start_date)} to ${formatDate(selectedPeriod.end_date)}\n` +
        `Existing Pay Run Status: ${existingPayRun.status}`
      );
      return;
    }

    try {
      setLoading(prev => ({ ...prev, creatingPayRun: true }));
      setError(null);
      
      const response = await payrollService.createPayRun(
        organizationId,
        payRunDateRange.from_date,
        payRunDateRange.to_date
      );
      
      if (response.data && response.data.status) {
        setSuccessMessage("✅ Fortnightly pay run created successfully!");
        await fetchPayRuns(selectedPeriod);
        await fetchAllPayRunsForOrganization();
      }
    } catch (error) {
      console.error("Error creating pay run:", error);
      
      if (error.type === 'DRAFT_EXISTS' || error.message.includes('draft pay run')) {
        setError(
          `⚠️ Cannot create pay run: There is already a draft pay run for this period.\n\n` +
          `Please go to the Pay Runs table below and approve or delete the existing draft pay run.`
        );
      } else {
        setError(error.message || "Failed to create pay run.");
      }
    } finally {
      setLoading(prev => ({ ...prev, creatingPayRun: false }));
    }
  };

  // ============ APPROVE PAY RUN ============
  const approvePayRun = async (xeroPayRunId) => {
    if (!window.confirm("Are you sure you want to approve this pay run? This action cannot be undone.")) {
      return;
    }

    try {
      setLoading(prev => ({ ...prev, approving: true }));
      setError(null);
      
      const response = await payrollService.approvePayRun(xeroPayRunId, organizationId);
      
      if (response.data && response.data.status) {
        setSuccessMessage("✅ Pay run approved successfully!");
        await fetchPayRuns(selectedPeriod);
        await fetchAllPayRunsForOrganization();
      }
    } catch (error) {
      console.error("Error approving pay run:", error);
      
      if (error.response?.data?.details?.Message?.includes("You can't update a posted pay run")) {
        setError("⚠️ This pay run is already POSTED and cannot be approved.");
      } else {
        setError(error.response?.data?.message || error.message || "Failed to approve pay run.");
      }
    } finally {
      setLoading(prev => ({ ...prev, approving: false }));
    }
  };

  // ============ SYNC PAYSLIPS ============
  const syncPayslips = async (xeroPayRunId) => {
    try {
      setLoading(prev => ({ ...prev, syncing: true }));
      setError(null);
      
      const response = await payrollService.syncPayslips(organizationId, xeroPayRunId);
      
      if (response.data && response.data.status) {
        setSuccessMessage(`✅ ${response.data.message || 'Payslips synced successfully!'}`);
        await fetchPayslipsByPayRun(xeroPayRunId);
        await fetchAllPayslipsForOrganization(); // Refresh all payslips
      }
    } catch (error) {
      console.error("Error syncing payslips:", error);
      setError(error.response?.data?.message || error.message || "Failed to sync payslips.");
    } finally {
      setLoading(prev => ({ ...prev, syncing: false }));
    }
  };

  // ============ EMPLOYEE HISTORY ============
  const fetchEmployeeHistory = async (employeeId) => {
    try {
      setLoading(prev => ({ ...prev, employeeHistory: true }));
      setError(null);
      
      const response = await payrollService.getEmployeePayslipHistory(employeeId);
      
      if (response.data && response.data.status) {
        setEmployeeHistory(response.data.data.data || []);
        setSelectedEmployee(employeeId);
        setShowEmployeeHistory(true);
      }
    } catch (error) {
      console.error("Error fetching employee history:", error);
      setError(error.response?.data?.message || "Failed to fetch employee history");
    } finally {
      setLoading(prev => ({ ...prev, employeeHistory: false }));
    }
  };

  // ============ HANDLERS ============
  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    setPayRunDateRange({
      from_date: period.start_date.split('T')[0],
      to_date: period.end_date.split('T')[0]
    });
    setSelectedPayRun(null);
    setPayslips([]);
    fetchPayRuns(period);
  };

  const handlePayslipViewModeChange = (mode) => {
    setPayslipViewMode(mode);
    if (mode === 'all' && allPayslips.length === 0) {
      fetchAllPayslipsForOrganization();
    }
  };

  const handlePayslipSelection = (payslipId) => {
    setSelectedPayslips((prev) =>
      prev.includes(payslipId)
        ? prev.filter((id) => id !== payslipId)
        : [...prev, payslipId]
    );
  };

  const handleSelectAll = () => {
    const currentList = payslipViewMode === 'all' ? filteredAllPayslips : filteredPayslips;
    if (selectedPayslips.length === currentList.length) {
      setSelectedPayslips([]);
    } else {
      setSelectedPayslips(currentList.map((p) => p.id));
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

  // ============ HELPER FUNCTIONS ============
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
      if (typeof dateString === 'string' && dateString.includes('/Date(')) {
        const timestamp = parseInt(dateString.match(/\d+/)[0]);
        return new Date(timestamp).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric"
        });
      }
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

  // ============ FILTERS ============
  const filteredPayPeriods = payPeriods.filter((period) => {
    return payPeriodFilters.is_current === "all" || 
      (payPeriodFilters.is_current === "current" && period.is_current) ||
      (payPeriodFilters.is_current === "past" && !period.is_current);
  });

  // Filter payslips by pay run
  const filteredPayslips = payslips.filter((payslip) => {
    const employee = payslip.employee_connection?.employee;
    const matchesSearch =
      filters.search === "" ||
      employee?.first_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      employee?.last_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      employee?.employee_code?.toLowerCase().includes(filters.search.toLowerCase()) ||
      payslip.xero_payslip_id?.toLowerCase().includes(filters.search.toLowerCase());
    return matchesSearch;
  });

  // Filter ALL payslips
  const filteredAllPayslips = allPayslips.filter((payslip) => {
    const employee = payslip.employee_connection?.employee;
    const matchesSearch =
      filters.search === "" ||
      employee?.first_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      employee?.last_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      employee?.employee_code?.toLowerCase().includes(filters.search.toLowerCase()) ||
      payslip.xero_payslip_id?.toLowerCase().includes(filters.search.toLowerCase());
    return matchesSearch;
  });

  // Get current display list based on view mode
  const currentPayslips = payslipViewMode === 'all' ? allPayslips : payslips;
  const currentFilteredPayslips = payslipViewMode === 'all' ? filteredAllPayslips : filteredPayslips;

  // Calculate stats
  const stats = calculateTotals(currentPayslips);
  const selectedTotals = calculateTotals(
    currentPayslips.filter(p => selectedPayslips.includes(p.id))
  );

  const draftPayRunsCount = payRuns.filter(p => p.status === 'DRAFT').length;

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
        
        {/* ============ HEADER ============ */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
                <FaFileInvoice className="mr-3 text-blue-600" />
                Fortnightly Payroll Management
              </h1>
              <p className="text-gray-600">Manage fortnightly pay periods, pay runs, and employee payslips</p>
              {selectedOrganization && (
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                  <FaBuilding className="text-gray-400" />
                  <span>Organization: {selectedOrganization.name} (ID: {organizationId})</span>
                  {selectedOrganization.id === 15 && (
                    <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                      Test Data Available
                    </span>
                  )}
                </div>
              )}
              <div className="mt-2 inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                <FaCalendarAlt className="mr-2 text-xs" />
                Fortnightly Pay Periods Only
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  fetchPayPeriods();
                  fetchAllPayRunsForOrganization();
                  fetchAllPayslipsForOrganization();
                }}
                disabled={loading.payPeriods || loading.allPayslips}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
              >
                <FaSync className={loading.payPeriods || loading.allPayslips ? "animate-spin" : ""} />
                Refresh All Data
              </button>
            </div>
          </div>
        </div>

        {/* ============ MESSAGES ============ */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <FaExclamationTriangle className="text-red-500 text-xl flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-600 text-sm whitespace-pre-line">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 flex-shrink-0">
              <FaTimesCircle />
            </button>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <FaCheckCircle className="text-green-500 text-xl flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-green-800 font-medium">Success</p>
              <p className="text-green-600 text-sm">{successMessage}</p>
            </div>
            <button onClick={() => setSuccessMessage(null)} className="text-green-500 hover:text-green-700 flex-shrink-0">
              <FaTimesCircle />
            </button>
          </div>
        )}

        {/* ============ STATS CARDS ============ */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Fortnightly Periods</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{payPeriods.length}</p>
              </div>
              <FaCalendar className="text-blue-500 text-xl" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-indigo-500 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pay Runs</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{allPayRuns.length}</p>
                {draftPayRunsCount > 0 && (
                  <p className="text-xs text-yellow-600 mt-1">{draftPayRunsCount} draft</p>
                )}
              </div>
              <FaCogs className="text-indigo-500 text-xl" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Payslips</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{allPayslips.length}</p>
              </div>
              <FaPayslipIcon className="text-purple-500 text-xl" />
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
                <p className="text-sm font-medium text-gray-600">Net Pay</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{formatCurrency(stats.totalNetPay)}</p>
              </div>
              <FaUsers className="text-red-500 text-xl" />
            </div>
          </div>
        </div>

        {/* ============ SELECTED PERIOD INFO ============ */}
        {selectedPeriod && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FaInfoCircle className="text-blue-500 text-xl" />
              <div>
                <p className="text-sm font-medium text-blue-800">
                  Selected Period: {formatDate(selectedPeriod.start_date)} - {formatDate(selectedPeriod.end_date)}
                </p>
                <p className="text-xs text-blue-600">
                  {selectedPeriod.number_of_days} days • {selectedPeriod.is_current ? 'Current Period' : 'Past Period'}
                </p>
              </div>
            </div>
            {payRuns.length > 0 && (
              <div className="text-sm text-blue-700">
                {payRuns.length} pay run(s) • {draftPayRunsCount} draft
              </div>
            )}
          </div>
        )}

        {/* ============ PAY PERIODS SECTION ============ */}
        <div className="mb-8 bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <FaCalendar className="mr-2 text-blue-600" />
                Fortnightly Pay Periods
              </h2>
              <div className="flex gap-2">
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
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Calendar</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Period</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Days</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPayPeriods.map((period) => (
                  <tr key={period.id} className={`hover:bg-gray-50 ${selectedPeriod?.id === period.id ? 'bg-blue-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{period.calendar_name}</div>
                      <div className="text-sm text-gray-500">Fortnightly</div>
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
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Current</span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Past</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handlePeriodChange(period)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                          selectedPeriod?.id === period.id
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {selectedPeriod?.id === period.id ? 'Selected' : 'Select Period'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ============ CREATE PAY RUN CARD ============ */}
        {selectedPeriod && (
          <div className="mb-8 bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-4 bg-green-50">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <FaPlay className="mr-2 text-green-600" />
                  Create New Fortnightly Pay Run
                </h2>
                {draftPayRunsCount > 0 && (
                  <div className="flex items-center gap-2 text-sm text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full">
                    <FaExclamationTriangle />
                    <span>{draftPayRunsCount} draft pay run(s) exist for this period</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt className="text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Period: {formatDate(payRunDateRange.from_date)} - {formatDate(payRunDateRange.to_date)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={createPayRun}
                  disabled={loading.creatingPayRun || payRuns.length > 0}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  title={payRuns.length > 0 ? "A pay run already exists for this period" : ""}
                >
                  {loading.creatingPayRun ? <FaSpinner className="animate-spin" /> : <FaPlay />}
                  Create Fortnightly Pay Run
                </button>
              </div>
              {payRuns.length > 0 && (
                <p className="mt-3 text-sm text-yellow-600 bg-yellow-50 p-3 rounded-lg">
                  ⚠️ Cannot create a new pay run because a {payRuns[0].status} pay run already exists for this period.
                </p>
              )}
            </div>
          </div>
        )}

        {/* ============ PAY RUNS SECTION ============ */}
        <div className="mb-8 bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <FaCogs className="mr-2 text-blue-600" />
                Pay Runs {selectedPeriod && `for ${formatDate(selectedPeriod.start_date)} - ${formatDate(selectedPeriod.end_date)}`}
              </h2>
              <button
                onClick={() => fetchPayRuns()}
                disabled={loading.payRuns || !selectedPeriod}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors shadow-sm disabled:opacity-50"
              >
                <FaSync className={loading.payRuns ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Pay Run</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Period</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Payment Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Financial Summary</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payRuns.length > 0 ? (
                  payRuns.map((payRun) => {
                    const StatusIcon = getStatusIcon(payRun.status);
                    return (
                      <tr key={payRun.id || payRun.xero_pay_run_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">
                            {payRun.calendar_name || `Pay Run #${payRun.id}`}
                          </div>
                          <div className="text-xs text-gray-500">
                            DB ID: {payRun.id} • Xero: {payRun.xero_pay_run_id?.substring(0, 8)}...
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(payRun.period_start_date)}</div>
                          <div className="text-xs text-gray-500">to {formatDate(payRun.period_end_date)}</div>
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
                            <div className="flex justify-between font-medium border-t pt-1 mt-1">
                              <span className="text-gray-700">Net:</span>
                              <span className="text-green-600">{formatCurrency(payRun.total_net_pay)}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => fetchPayslipsByPayRun(payRun.xero_pay_run_id)}
                              className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 flex items-center justify-center gap-1"
                            >
                              <FaFileInvoice /> View Payslips
                            </button>
                            <button
                              onClick={() => syncPayslips(payRun.xero_pay_run_id)}
                              disabled={loading.syncing}
                              className="px-3 py-1.5 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-700 flex items-center justify-center gap-1 disabled:opacity-50"
                            >
                              {loading.syncing ? <FaSpinner className="animate-spin" /> : <FaSync />}
                              Sync Payslips
                            </button>
                            {payRun.status === 'DRAFT' && (
                              <button
                                onClick={() => approvePayRun(payRun.xero_pay_run_id)}
                                disabled={loading.approving}
                                className="px-3 py-1.5 bg-yellow-600 text-white text-xs font-medium rounded-lg hover:bg-yellow-700 flex items-center justify-center gap-1 disabled:opacity-50"
                              >
                                {loading.approving ? <FaSpinner className="animate-spin" /> : <FaCheck />}
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
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <FaCogs className="text-4xl text-gray-300 mb-3" />
                        <p className="text-lg font-medium text-gray-900 mb-1">No pay runs found</p>
                        <p className="text-gray-500">
                          {selectedPeriod 
                            ? `Click "Create Fortnightly Pay Run" to create one for this period`
                            : 'Select a period to view pay runs'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ============ PAYSLIPS SECTION ============ */}
        {(selectedPayRun || payslipViewMode === 'all') && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-4">
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                      <FaPayslipIcon className="mr-2 text-blue-600" />
                      {payslipViewMode === 'all' ? 'All Payslips' : 'Payslips by Pay Run'}
                    </h2>
                    
                    {/* View Mode Toggle */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePayslipViewModeChange('byPayRun')}
                        className={`px-3 py-1 text-xs font-medium rounded-lg ${
                          payslipViewMode === 'byPayRun'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        disabled={!selectedPayRun}
                      >
                        <FaFileInvoice className="inline mr-1" />
                        By Pay Run {selectedPayRun && `(${payslips.length})`}
                      </button>
                      <button
                        onClick={() => handlePayslipViewModeChange('all')}
                        className={`px-3 py-1 text-xs font-medium rounded-lg ${
                          payslipViewMode === 'all'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <FaListAlt className="inline mr-1" />
                        All Payslips ({allPayslips.length})
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-500 mt-2">
                    {payslipViewMode === 'all' 
                      ? `${currentFilteredPayslips.length} of ${allPayslips.length} payslips • Total Net Pay: ${formatCurrency(stats.totalNetPay)}`
                      : `${payslips.length} payslips found • Total Net Pay: ${formatCurrency(stats.totalNetPay)}`}
                  </p>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search employees or payslip ID..."
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="border border-gray-300 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-64"
                    />
                  </div>
                  {payslipViewMode === 'byPayRun' && (
                    <button
                      onClick={() => {
                        setSelectedPayRun(null);
                        setPayslips([]);
                        setPayslipViewMode('all');
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700"
                    >
                      <FaAngleLeft /> Back to All
                    </button>
                  )}
                  {payslipViewMode === 'all' && (
                    <button
                      onClick={fetchAllPayslipsForOrganization}
                      disabled={loading.allPayslips}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50"
                    >
                      <FaSync className={loading.allPayslips ? "animate-spin" : ""} />
                      Refresh All
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      <input
                        type="checkbox"
                        checked={selectedPayslips.length === currentFilteredPayslips.length && currentFilteredPayslips.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Pay Run</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Payslip ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Hours</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Wages</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tax</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Net Pay</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentFilteredPayslips.map((payslip) => {
                    const employee = payslip.employee_connection?.employee;
                    return (
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
                                {employee?.first_name || 'N/A'} {employee?.last_name || ''}
                              </div>
                              <div className="text-xs text-gray-500">
                                {employee?.employee_code || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium">#{payslip.xero_pay_run_id}</div>
                          <div className="text-xs text-gray-500">
                            {formatDate(payslip.pay_run?.period_start_date)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs font-mono">
                            {payslip.xero_payslip_id?.substring(0, 8)}...
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {payslip.id}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {parseFloat(payslip.hours_worked || 0).toFixed(2)} hrs
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
                          <div className="text-sm font-bold text-green-600">
                            {formatCurrency(payslip.net_pay)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(payslip.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex gap-1">
                            <button
                              onClick={() => viewPayslipDetails(payslip)}
                              className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700"
                              title="View Details"
                            >
                              <FaEye />
                            </button>
                            <button
                              onClick={() => handlePreviewPayslip(payslip)}
                              className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700"
                              title="Preview"
                            >
                              <FaFilePdf />
                            </button>
                            <button
                              onClick={() => fetchEmployeeHistory(payslip.employee_xero_connection_id)}
                              className="px-3 py-1.5 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-700"
                              title="View History"
                            >
                              <FaHistory />
                            </button>
                            <button
                              className="px-3 py-1.5 bg-yellow-600 text-white text-xs font-medium rounded-lg hover:bg-yellow-700"
                              title="Download"
                            >
                              <FaDownload />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {currentFilteredPayslips.length === 0 && (
                <div className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center">
                    <FaPayslipIcon className="text-4xl text-gray-300 mb-3" />
                    <p className="text-lg font-medium text-gray-900 mb-1">No payslips found</p>
                    <p className="text-gray-500">
                      {payslipViewMode === 'byPayRun'
                        ? 'Click "Sync Payslips" to fetch payslips from Xero'
                        : 'No payslips found for this organization'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Summary Footer */}
            {currentFilteredPayslips.length > 0 && (
              <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Showing {currentFilteredPayslips.length} of {currentPayslips.length} payslips • 
                    Selected: {selectedPayslips.length} • 
                    Selected Total: {formatCurrency(selectedTotals.totalNetPay)}
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 flex items-center gap-2">
                      <FaDownload /> Download Selected
                    </button>
                    <button className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 flex items-center gap-2">
                      <FaEnvelope /> Email Selected
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============ EMPLOYEE HISTORY MODAL ============ */}
        {showEmployeeHistory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">
                  Employee Payslip History
                </h2>
                <button onClick={() => setShowEmployeeHistory(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <FaTimesCircle className="text-gray-500" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Pay Run</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Period</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Hours</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Wages</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tax</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Net Pay</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {employeeHistory.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium">Pay Run #{item.pay_run?.id}</div>
                            <div className="text-xs text-gray-500">{item.pay_run?.status}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm">{formatDate(item.pay_run?.period_start_date)}</div>
                            <div className="text-xs text-gray-500">to {formatDate(item.pay_run?.period_end_date)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {parseFloat(item.hours_worked || 0).toFixed(2)} hrs
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                            {formatCurrency(item.wages)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                            {formatCurrency(item.tax_deducted)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                            {formatCurrency(item.net_pay)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(item.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============ PAYSLIP DETAILS MODAL ============ */}
        {showPayslipDetails && previewPayslip && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">
                  Payslip Details - {previewPayslip.employee_connection?.employee?.first_name} {previewPayslip.employee_connection?.employee?.last_name}
                </h2>
                <button onClick={() => setShowPayslipDetails(false)} className="p-2 hover:bg-gray-100 rounded-lg">
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
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Earnings Breakdown</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        {previewPayslip.earnings_lines?.length > 0 ? (
                          previewPayslip.earnings_lines.map((earning, index) => (
                            <div key={index} className="mb-2 pb-2 border-b last:border-0">
                              {earning.FixedAmount ? (
                                <div className="flex justify-between">
                                  <span>Fixed Amount:</span>
                                  <span className="font-medium">${earning.FixedAmount}</span>
                                </div>
                              ) : (
                                <>
                                  <div className="flex justify-between">
                                    <span>Rate:</span>
                                    <span>${earning.RatePerUnit}/hr</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Hours:</span>
                                    <span>{earning.NumberOfUnits}</span>
                                  </div>
                                  <div className="flex justify-between font-medium">
                                    <span>Total:</span>
                                    <span>${(earning.RatePerUnit * earning.NumberOfUnits).toFixed(2)}</span>
                                  </div>
                                </>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500">No earnings data</p>
                        )}
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
                            <span>Tax:</span>
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
                            <div key={index} className="flex justify-between mb-1">
                              <span>Deduction:</span>
                              <span className="text-red-600">-${deduction.Amount}</span>
                            </div>
                          ))
                        ) : <p className="text-gray-500">No deductions</p>}
                        
                        {previewPayslip.super_lines?.length > 0 && (
                          <div className="mt-4">
                            <p className="font-medium mb-1">Superannuation:</p>
                            {previewPayslip.super_lines.map((sup, index) => (
                              <div key={index} className="flex justify-between text-sm">
                                <span>{sup.ContributionType}:</span>
                                <span>${sup.Amount} {sup.Percentage ? `(${sup.Percentage}%)` : ''}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-6 border-t">
                  <button onClick={() => setShowPayslipDetails(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                    Close
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                    <FaPrint /> Print
                  </button>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
                    <FaDownload /> PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============ PAYSLIP PREVIEW MODAL ============ */}
        {showPreview && previewPayslip && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Payslip Preview</h2>
                <button onClick={() => setShowPreview(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <FaTimesCircle className="text-gray-500" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="border-2 border-gray-300 p-8">
                  <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">{selectedOrganization?.name || "COMPANY NAME"}</h1>
                    <p className="text-gray-600 text-lg">Fortnightly Payslip</p>
                    <p className="text-gray-500">
                      {formatDate(previewPayslip.pay_run?.period_start_date || payRunDateRange.from_date)} - {formatDate(previewPayslip.pay_run?.period_end_date || payRunDateRange.to_date)}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                      <h3 className="font-semibold mb-3">Employee Details</h3>
                      <p><strong>Name:</strong> {previewPayslip.employee_connection?.employee?.first_name} {previewPayslip.employee_connection?.employee?.last_name}</p>
                      <p><strong>ID:</strong> {previewPayslip.employee_connection?.employee?.employee_code}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-3">Pay Details</h3>
                      <p><strong>Payment Date:</strong> {formatDate(previewPayslip.pay_run?.payment_date || payRunDateRange.to_date)}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                      <h3 className="font-semibold mb-3 border-b pb-2">Earnings</h3>
                      <div className="flex justify-between">
                        <span>Wages</span>
                        <span className="font-medium">{formatCurrency(previewPayslip.wages)}</span>
                      </div>
                      <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                        <span>Total</span>
                        <span>{formatCurrency(previewPayslip.wages)}</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-3 border-b pb-2">Deductions</h3>
                      <div className="flex justify-between">
                        <span>Tax</span>
                        <span className="text-red-600">-{formatCurrency(previewPayslip.tax_deducted)}</span>
                      </div>
                      <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                        <span>Total</span>
                        <span className="text-red-600">-{formatCurrency(previewPayslip.tax_deducted)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-100 p-6 rounded-lg text-center">
                    <h3 className="text-2xl font-bold mb-2">Net Pay: {formatCurrency(previewPayslip.net_pay)}</h3>
                    <p className="text-gray-600">{convertToWords(parseFloat(previewPayslip.net_pay) || 0)}</p>
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center gap-2">
                    <FaPrint /> Print
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                    <FaDownload /> PDF
                  </button>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
                    <FaPaperPlane /> Email
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
      if (num < 10) words += units[num];
      else if (num < 20) words += teens[num - 10];
      else {
        words += tens[Math.floor(num / 10)];
        if (num % 10 > 0) words += " " + units[num % 10];
      }
    }
    return words.trim();
  };
  
  let result = "";
  const dollars = Math.floor(amount);
  const cents = Math.round((amount - dollars) * 100);
  
  if (dollars >= 1000000) {
    result += convertHundreds(Math.floor(dollars / 1000000)) + " Million ";
  }
  if (dollars >= 1000) {
    result += convertHundreds(Math.floor((dollars % 1000000) / 1000)) + " Thousand ";
  }
  result += convertHundreds(dollars % 1000);
  
  result = result.trim() || "Zero";
  result += " Dollar" + (dollars !== 1 ? "s" : "");
  
  if (cents > 0) {
    result += " and " + convertHundreds(cents) + " Cent" + (cents !== 1 ? "s" : "");
  }
  
  return result;
};

export default PayslipGeneration;