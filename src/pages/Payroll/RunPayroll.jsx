// components/RunPayroll.jsx - COMPLETE VERSION WITH ALL PAYSLIPS
import React, { useState, useEffect } from "react";
import {
  FaFileInvoice,
  FaSearch,
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
  FaSpinner,
  FaCalendar,
  FaUsers,
  FaFileAlt,
  FaCogs,
  FaPlay,
  FaExclamationTriangle,
  FaCheck,
  FaBan,
  FaChartLine,
  FaInfoCircle,
  FaArrowRight,
  FaAngleRight,
  FaAngleLeft,
  FaThumbsUp,
  FaThumbsDown,
  FaClock,
  FaHistory,
  FaListAlt,
  FaFileInvoice as FaPayslipIcon
} from "react-icons/fa";
import { payrollService } from "../../services/payrollService.js";
import { useOrganizations } from "../../contexts/OrganizationContext.jsx";

const RunPayroll = () => {
  const { selectedOrganization } = useOrganizations();
  const organizationId = selectedOrganization?.id || "15";

  const [loading, setLoading] = useState({
    payPeriods: false,
    payRuns: false,
    allPayRuns: false,
    payslips: false,
    allPayslips: false,
    creatingPayRun: false,
    approving: false,
    syncing: false,
    employeeHistory: false
  });
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [activeTab, setActiveTab] = useState("payPeriods");
  
  // View Modes
  const [payRunViewMode, setPayRunViewMode] = useState("byPeriod"); // 'byPeriod' or 'all'
  const [payslipViewMode, setPayslipViewMode] = useState("byPayRun"); // 'byPayRun' or 'all'

  // State for pay periods (FORTNIGHTLY ONLY)
  const [payPeriods, setPayPeriods] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [payPeriodFilters, setPayPeriodFilters] = useState({
    is_current: "all"
  });

  // State for pay runs
  const [payRuns, setPayRuns] = useState([]); // Filtered by period
  const [allPayRuns, setAllPayRuns] = useState([]); // All pay runs for organization
  const [selectedPayRun, setSelectedPayRun] = useState(null);
  const [payRunFilters, setPayRunFilters] = useState({
    status: "all",
    search: ""
  });

  // State for payslips
  const [payslips, setPayslips] = useState([]); // Filtered by pay run
  const [allPayslips, setAllPayslips] = useState([]); // ALL payslips for organization
  const [selectedPayslips, setSelectedPayslips] = useState([]);
  const [payslipFilters, setPayslipFilters] = useState({
    search: "",
    status: "all"
  });

  // State for employee payslip history
  const [employeeHistory, setEmployeeHistory] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showEmployeeHistory, setShowEmployeeHistory] = useState(false);

  // Form state - AUTO SET from selected period
  const [payRunDateRange, setPayRunDateRange] = useState({
    from_date: "",
    to_date: ""
  });

  // Preview state
  const [showPreview, setShowPreview] = useState(false);
  const [previewPayslip, setPreviewPayslip] = useState(null);
  const [showPayRunDetails, setShowPayRunDetails] = useState(false);
  const [selectedPayRunDetails, setSelectedPayRunDetails] = useState(null);

  // ============ INITIAL DATA LOAD ============
  useEffect(() => {
    if (organizationId) {
      console.log('🏢 Organization changed to:', organizationId);
      fetchPayPeriods();
      fetchAllPayRunsForOrganization();
      fetchAllPayslipsForOrganization(); // NEW: Fetch all payslips
    }
  }, [organizationId]);

  // ============ PAY PERIODS API ============
  const fetchPayPeriods = async () => {
    if (!organizationId) {
      setError("No organization selected");
      return;
    }

    try {
      setLoading(prev => ({ ...prev, payPeriods: true }));
      setError(null);
      
      console.log('📡 Fetching pay periods for organization:', organizationId);
      const response = await payrollService.fetchPayPeriods(organizationId);
      
      if (response.data && response.data.status) {
        const allPeriods = response.data.data || [];
        
        // FILTER: ONLY FORTNIGHTLY PERIODS
        const fortnightlyPeriods = allPeriods.filter(p => 
          p.calendar_type && p.calendar_type.toUpperCase() === "FORTNIGHTLY"
        );
        
        console.log(`✅ Found ${fortnightlyPeriods.length} fortnightly periods`);
        fortnightlyPeriods.sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
        setPayPeriods(fortnightlyPeriods);
        
        const currentPeriod = fortnightlyPeriods.find(p => p.is_current === true);
        if (currentPeriod) {
          console.log('🎯 Selected current period:', currentPeriod.calendar_name);
          handlePeriodChange(currentPeriod);
        } else if (fortnightlyPeriods.length > 0) {
          console.log('🎯 Selected most recent period');
          handlePeriodChange(fortnightlyPeriods[0]);
        }
      }
    } catch (error) {
      console.error("❌ Error fetching pay periods:", error);
      if (error.response?.status === 404) {
        setError(`No pay periods found for organization ID: ${organizationId}. Please check if this organization has payroll setup.`);
      } else {
        setError(error.response?.data?.message || error.message || "Failed to fetch pay periods.");
      }
    } finally {
      setLoading(prev => ({ ...prev, payPeriods: false }));
    }
  };

  // ============ PAY RUNS APIS ============
  const fetchAllPayRunsForOrganization = async () => {
    if (!organizationId) return;

    try {
      setLoading(prev => ({ ...prev, allPayRuns: true }));
      setError(null);
      
      console.log('📡 Fetching ALL pay runs for organization:', organizationId);
      const response = await payrollService.getAllPayRunsByOrganization(organizationId);
      
      if (response.data && response.data.status) {
        const allPayRunsData = response.data.data || [];
        
        // Filter to only show FORTNIGHTLY pay runs
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
        console.log(`📊 Loaded ${fortnightlyPayRuns.length} fortnightly pay runs`);
      }
    } catch (error) {
      console.error("❌ Error fetching all pay runs:", error);
      setAllPayRuns([]);
    } finally {
      setLoading(prev => ({ ...prev, allPayRuns: false }));
    }
  };

  const fetchPayRunsByPeriod = async (period) => {
    if (!period || !organizationId) return;

    try {
      setLoading(prev => ({ ...prev, payRuns: true }));
      
      const fromDate = period.start_date.split('T')[0];
      const toDate = period.end_date.split('T')[0];
      
      console.log('📡 Fetching pay runs for period:', fromDate, 'to', toDate);
      const response = await payrollService.reviewPayRun(organizationId, fromDate, toDate);
      
      if (response.data && response.data.status) {
        const payRunsData = response.data.data || [];
        setPayRuns(payRunsData);
        console.log(`📊 Loaded ${payRunsData.length} pay runs for period`);
      } else {
        setPayRuns([]);
      }
    } catch (error) {
      console.error("❌ Error fetching pay runs by period:", error);
      setPayRuns([]);
    } finally {
      setLoading(prev => ({ ...prev, payRuns: false }));
    }
  };

  // ============ PAYSLIPS APIS ============
  // NEW: Fetch ALL payslips for organization
  const fetchAllPayslipsForOrganization = async () => {
    if (!organizationId) return;

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
      console.error("❌ Error fetching all payslips:", error);
      setAllPayslips([]);
    } finally {
      setLoading(prev => ({ ...prev, allPayslips: false }));
    }
  };

  const fetchPayslipsByPayRun = async (xeroPayRunId) => {
    try {
      setLoading(prev => ({ ...prev, payslips: true }));
      setError(null);
      
      const payRun = allPayRuns.find(p => p.xero_pay_run_id === xeroPayRunId) || 
                     payRuns.find(p => p.xero_pay_run_id === xeroPayRunId);
      
      if (!payRun) {
        setError("Pay run not found");
        return;
      }

      console.log('📋 Fetching payslips for pay run DB ID:', payRun.id);
      const response = await payrollService.getPayslipsByPayRun(payRun.id);
      
      if (response.data && response.data.status) {
        const payslipData = response.data.data.data || [];
        setPayslips(payslipData);
        setSelectedPayRun(xeroPayRunId);
        setPayslipViewMode('byPayRun');
        setActiveTab("payslips");
        console.log(`📋 Loaded ${payslipData.length} payslips`);
      } else {
        setPayslips([]);
      }
    } catch (error) {
      console.error("❌ Error fetching payslips:", error);
      setPayslips([]);
    } finally {
      setLoading(prev => ({ ...prev, payslips: false }));
    }
  };

  // ============ CREATE PAY RUN ============
  const createPayRun = async () => {
    if (!selectedPeriod) {
      setError("Please select a fortnightly pay period");
      return;
    }

    if (payRuns.length > 0) {
      const existingPayRun = payRuns[0];
      setError(
        `⚠️ Cannot create pay run: A ${existingPayRun.status} pay run already exists for this period.\n\n` +
        `Period: ${formatDate(selectedPeriod.start_date)} to ${formatDate(selectedPeriod.end_date)}\n` +
        `Existing Pay Run ID: ${existingPayRun.id}\n` +
        `Status: ${existingPayRun.status}`
      );
      setActiveTab("payRuns");
      setPayRunFilters(prev => ({ ...prev, status: existingPayRun.status }));
      return;
    }

    try {
      setLoading(prev => ({ ...prev, creatingPayRun: true }));
      setError(null);
      setSuccessMessage(null);
      
      console.log('🔄 Creating pay run for period:', payRunDateRange);
      const response = await payrollService.createPayRun(
        organizationId,
        payRunDateRange.from_date,
        payRunDateRange.to_date
      );
      
      if (response.data && response.data.status) {
        setSuccessMessage(`✅ Fortnightly pay run created successfully!`);
        await fetchPayRunsByPeriod(selectedPeriod);
        await fetchAllPayRunsForOrganization();
        setActiveTab("payRuns");
        setPayRunFilters(prev => ({ ...prev, status: "DRAFT" }));
      }
    } catch (error) {
      console.error("❌ Error creating pay run:", error);
      const errorMsg = error.response?.data?.message || error.message;
      
      if (errorMsg.includes('draft pay run') || errorMsg.includes('already a draft')) {
        setError(
          `⚠️ Cannot create pay run: There is already a draft pay run for this period.\n\n` +
          `Please go to the Pay Runs tab and approve or delete the existing draft pay run.`
        );
        setActiveTab("payRuns");
        setPayRunFilters(prev => ({ ...prev, status: "DRAFT" }));
      } else {
        setError(errorMsg || "Failed to create pay run");
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
      
      console.log('✅ Approving pay run:', xeroPayRunId);
      const response = await payrollService.approvePayRun(xeroPayRunId, organizationId);
      
      if (response.data && response.data.status) {
        setSuccessMessage("✅ Pay run approved successfully!");
        await fetchPayRunsByPeriod(selectedPeriod);
        await fetchAllPayRunsForOrganization();
      }
    } catch (error) {
      console.error("❌ Error approving pay run:", error);
      if (error.response?.data?.details?.Message?.includes("You can't update a posted pay run")) {
        setError("⚠️ This pay run is already POSTED and cannot be approved.");
      } else {
        setError(error.response?.data?.message || error.message || "Failed to approve pay run");
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
      
      console.log('🔄 Syncing payslips for pay run:', xeroPayRunId);
      const response = await payrollService.syncPayslips(organizationId, xeroPayRunId);
      
      if (response.data && response.data.status) {
        setSuccessMessage(`✅ ${response.data.message || 'Payslips synced successfully!'}`);
        await fetchPayslipsByPayRun(xeroPayRunId);
        await fetchAllPayslipsForOrganization(); // Refresh all payslips
      }
    } catch (error) {
      console.error("❌ Error syncing payslips:", error);
      setError(error.response?.data?.message || error.message || "Failed to sync payslips");
    } finally {
      setLoading(prev => ({ ...prev, syncing: false }));
    }
  };

  // ============ EMPLOYEE HISTORY ============
  const fetchEmployeeHistory = async (employeeId) => {
    try {
      setLoading(prev => ({ ...prev, employeeHistory: true }));
      setError(null);
      
      console.log('📋 Fetching employee history for employee:', employeeId);
      const response = await payrollService.getEmployeePayslipHistory(employeeId);
      
      if (response.data && response.data.status) {
        setEmployeeHistory(response.data.data.data || []);
        setSelectedEmployee(employeeId);
        setShowEmployeeHistory(true);
        console.log(`📋 Loaded ${response.data.data.data?.length || 0} historical payslips`);
      }
    } catch (error) {
      console.error("❌ Error fetching employee history:", error);
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
    fetchPayRunsByPeriod(period);
  };

  const handlePayRunViewModeChange = (mode) => {
    setPayRunViewMode(mode);
    if (mode === 'all' && allPayRuns.length === 0) {
      fetchAllPayRunsForOrganization();
    }
  };

  const handlePayslipViewModeChange = (mode) => {
    setPayslipViewMode(mode);
    if (mode === 'all' && allPayslips.length === 0) {
      fetchAllPayslipsForOrganization();
    }
  };

  const viewPayRunDetails = (payRun) => {
    setSelectedPayRunDetails(payRun);
    setShowPayRunDetails(true);
  };

  const handlePreviewPayslip = (payslip) => {
    setPreviewPayslip(payslip);
    setShowPreview(true);
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

  // ============ FILTERS ============
  const filteredPayPeriods = payPeriods.filter((period) => {
    return payPeriodFilters.is_current === "all" || 
      (payPeriodFilters.is_current === "current" && period.is_current) ||
      (payPeriodFilters.is_current === "past" && !period.is_current);
  });

  const getFilteredPayRuns = () => {
    const sourceRuns = payRunViewMode === 'all' ? allPayRuns : payRuns;
    return sourceRuns.filter((payRun) => {
      const matchesStatus = payRunFilters.status === "all" || payRun.status === payRunFilters.status;
      const matchesSearch = payRunFilters.search === "" ||
        payRun.calendar_name?.toLowerCase().includes(payRunFilters.search.toLowerCase()) ||
        payRun.xero_pay_run_id?.toLowerCase().includes(payRunFilters.search.toLowerCase()) ||
        `#${payRun.id}`.includes(payRunFilters.search);
      return matchesStatus && matchesSearch;
    });
  };

  const getFilteredPayslips = () => {
    const sourcePayslips = payslipViewMode === 'all' ? allPayslips : payslips;
    return sourcePayslips.filter((payslip) => {
      const employee = payslip.employee_connection?.employee;
      const matchesSearch = payslipFilters.search === "" ||
        employee?.first_name?.toLowerCase().includes(payslipFilters.search.toLowerCase()) ||
        employee?.last_name?.toLowerCase().includes(payslipFilters.search.toLowerCase()) ||
        employee?.employee_code?.toLowerCase().includes(payslipFilters.search.toLowerCase()) ||
        payslip.xero_payslip_id?.toLowerCase().includes(payslipFilters.search.toLowerCase());
      return matchesSearch;
    });
  };

  const filteredPayRuns = getFilteredPayRuns();
  const filteredPayslips = getFilteredPayslips();

  // ============ TOTALS ============
  const payRunTotals = (payRunViewMode === 'all' ? allPayRuns : payRuns).reduce((acc, run) => ({
    totalWages: acc.totalWages + (parseFloat(run.total_wages) || 0),
    totalTax: acc.totalTax + (parseFloat(run.total_tax) || 0),
    totalNetPay: acc.totalNetPay + (parseFloat(run.total_net_pay) || 0),
    count: acc.count + 1
  }), { totalWages: 0, totalTax: 0, totalNetPay: 0, count: 0 });

  const payslipTotals = (payslipViewMode === 'all' ? allPayslips : payslips).reduce((acc, payslip) => ({
    totalWages: acc.totalWages + (parseFloat(payslip.wages) || 0),
    totalTax: acc.totalTax + (parseFloat(payslip.tax_deducted) || 0),
    totalNetPay: acc.totalNetPay + (parseFloat(payslip.net_pay) || 0),
    count: acc.count + 1
  }), { totalWages: 0, totalTax: 0, totalNetPay: 0, count: 0 });

  const draftPayRunsCount = (payRunViewMode === 'all' ? allPayRuns : payRuns).filter(p => p.status === 'DRAFT').length;

  // ============ RENDER ============
  if (!loading.payPeriods && payPeriods.length === 0 && !error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen font-sans">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <FaExclamationTriangle className="text-4xl text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Fortnightly Pay Periods Found</h2>
            <p className="text-gray-600 mb-4">
              Organization: {selectedOrganization?.name || 'Unknown'} (ID: {organizationId})
            </p>
            <p className="text-gray-500 mb-6">
              This organization doesn't have any fortnightly pay periods configured.
              {selectedOrganization?.id !== 15 && " Try switching back to organization ID 15 (Trugnina) which has test data."}
            </p>
            <button
              onClick={fetchPayPeriods}
              className="px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
            >
              <FaSync className="inline mr-2" /> Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

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
                Fortnightly Payroll
              </h1>
              <p className="text-gray-600">Manage fortnightly pay periods, pay runs, and payslips</p>
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
            <button
              onClick={() => {
                fetchPayPeriods();
                fetchAllPayRunsForOrganization();
                fetchAllPayslipsForOrganization();
              }}
              disabled={loading.payPeriods || loading.allPayRuns || loading.allPayslips}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <FaSync className={loading.payPeriods || loading.allPayRuns || loading.allPayslips ? "animate-spin" : ""} />
              Refresh All Data
            </button>
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
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
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
            <button onClick={() => setSuccessMessage(null)} className="text-green-500 hover:text-green-700">
              <FaTimesCircle />
            </button>
          </div>
        )}

        {/* ============ STATS CARDS ============ */}
        {payPeriods.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Fortnightly Periods</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{payPeriods.length}</p>
                </div>
                <FaCalendar className="text-blue-500 text-xl" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-indigo-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Pay Runs</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{allPayRuns.length}</p>
                  {draftPayRunsCount > 0 && (
                    <p className="text-xs text-yellow-600 mt-1">{draftPayRunsCount} draft</p>
                  )}
                </div>
                <FaCogs className="text-indigo-500 text-xl" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Payslips</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{allPayslips.length}</p>
                </div>
                <FaPayslipIcon className="text-purple-500 text-xl" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Wages</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{formatCurrency(payRunTotals.totalWages)}</p>
                </div>
                <FaMoneyBillWave className="text-green-500 text-xl" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Net Payout</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{formatCurrency(payRunTotals.totalNetPay)}</p>
                </div>
                <FaUsers className="text-red-500 text-xl" />
              </div>
            </div>
          </div>
        )}

        {/* ============ TABS NAVIGATION ============ */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-8">
            {["payPeriods", "payRuns", "payslips"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                disabled={payPeriods.length === 0 && tab !== "payPeriods"}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } ${payPeriods.length === 0 && tab !== "payPeriods" ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {tab === "payPeriods" && (
                  <span className="flex items-center gap-2">
                    <FaCalendar /> Fortnightly Periods
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
                    {(payRunViewMode === 'all' ? allPayRuns.length : payRuns.length) > 0 && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {payRunViewMode === 'all' ? allPayRuns.length : payRuns.length}
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
                    <FaPayslipIcon /> Payslips
                    {(payslipViewMode === 'all' ? allPayslips.length : payslips.length) > 0 && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {payslipViewMode === 'all' ? allPayslips.length : payslips.length}
                      </span>
                    )}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* ============ PAY PERIODS TAB ============ */}
        {activeTab === "payPeriods" && (
          <div className="space-y-6">
            {/* Create Pay Run Card */}
            {selectedPeriod && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="border-b border-gray-200 px-6 py-4 bg-blue-50">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                      <FaPlay className="mr-2 text-green-600" />
                      Create New Fortnightly Pay Run
                    </h2>
                    {draftPayRunsCount > 0 && (
                      <div className="flex items-center gap-2 text-sm text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full">
                        <FaExclamationTriangle />
                        <span>{draftPayRunsCount} draft pay run(s) for this period</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FaInfoCircle className="text-purple-500 text-xl" />
                      <div>
                        <p className="text-sm font-medium text-purple-800">Fortnightly Payroll System</p>
                        <p className="text-sm text-purple-600">Only fortnightly pay periods are available.</p>
                        {selectedPeriod && (
                          <p className="text-xs text-purple-500 mt-1">
                            Selected: {formatDate(selectedPeriod.start_date)} - {formatDate(selectedPeriod.end_date)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={createPayRun}
                      disabled={loading.creatingPayRun || !selectedPeriod || payRuns.length > 0}
                      className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
                      title={payRuns.length > 0 ? "Pay run already exists for this period" : ""}
                    >
                      {loading.creatingPayRun ? <FaSpinner className="animate-spin" /> : <FaPlay />}
                      Create Fortnightly Pay Run
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Pay Periods List */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="border-b border-gray-200 px-6 py-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                    <FaCalendar className="mr-2 text-blue-600" />
                    Fortnightly Pay Periods
                  </h2>
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
                  <tbody>
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
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg ${
                              selectedPeriod?.id === period.id
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                          >
                            {selectedPeriod?.id === period.id ? 'Selected' : 'Select'}
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

        {/* ============ PAY RUNS TAB ============ */}
        {activeTab === "payRuns" && (
          <div className="space-y-6">
            {/* View Mode Toggle */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-700">View Mode:</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePayRunViewModeChange('byPeriod')}
                      className={`px-4 py-2 text-sm font-medium rounded-lg ${
                        payRunViewMode === 'byPeriod'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <FaCalendar className="inline mr-2" />
                      By Period
                    </button>
                    <button
                      onClick={() => handlePayRunViewModeChange('all')}
                      className={`px-4 py-2 text-sm font-medium rounded-lg ${
                        payRunViewMode === 'all'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <FaListAlt className="inline mr-2" />
                      All Pay Runs ({allPayRuns.length})
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Period Info Banner */}
            {payRunViewMode === 'byPeriod' && selectedPeriod && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FaInfoCircle className="text-blue-500 text-xl" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">
                        Period: {formatDate(selectedPeriod.start_date)} - {formatDate(selectedPeriod.end_date)}
                      </p>
                      <p className="text-xs text-blue-600">
                        {payRuns.length} pay run(s) • {payRuns.filter(p => p.status === 'DRAFT').length} draft
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => fetchPayRunsByPeriod(selectedPeriod)}
                    disabled={loading.payRuns}
                    className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    <FaSync className={loading.payRuns ? "animate-spin" : ""} /> Refresh
                  </button>
                </div>
              </div>
            )}

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
                    className="w-full border border-gray-300 pl-10 pr-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                
                <select
                  value={payRunFilters.status}
                  onChange={(e) => setPayRunFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="DRAFT">Draft</option>
                  <option value="POSTED">Posted</option>
                  <option value="APPROVED">Approved</option>
                  <option value="PAID">Paid</option>
                  <option value="VOIDED">Voided</option>
                </select>

                <div className="md:col-span-2 flex justify-end">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FaClock className="text-gray-400" />
                    <span>Total: {payRunViewMode === 'all' ? allPayRuns.length : payRuns.length} pay runs</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pay Runs Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Pay Run</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Period</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Payment Date</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Summary</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayRuns.map((payRun) => {
                      const StatusIcon = getStatusIcon(payRun.status);
                      return (
                        <tr key={payRun.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <FaFileInvoice className="text-blue-600 text-lg" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-semibold text-gray-900">
                                  {payRun.calendar_name || `Pay Run #${payRun.id}`}
                                </div>
                                <div className="text-xs text-gray-500">
                                  ID: {payRun.id} • Xero: {payRun.xero_pay_run_id?.substring(0, 8)}...
                                </div>
                              </div>
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
                            <span className={`px-3 py-1 inline-flex items-center text-xs font-medium rounded-full ${getStatusColor(payRun.status)}`}>
                              <StatusIcon className="mr-1" size={12} />
                              {payRun.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Wages:</span>
                                <span className="font-medium">{formatCurrency(payRun.total_wages)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Net:</span>
                                <span className="font-medium text-green-600">{formatCurrency(payRun.total_net_pay)}</span>
                              </div>
                              <div className="text-xs text-gray-500">
                                {payRun.employee_count || 0} employees
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex flex-col gap-2">
                              <button
                                onClick={() => viewPayRunDetails(payRun)}
                                className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 flex items-center justify-center gap-1"
                              >
                                <FaEye /> Details
                              </button>
                              <button
                                onClick={() => fetchPayslipsByPayRun(payRun.xero_pay_run_id)}
                                className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 flex items-center justify-center gap-1"
                              >
                                <FaPayslipIcon /> Payslips
                              </button>
                              <button
                                onClick={() => syncPayslips(payRun.xero_pay_run_id)}
                                disabled={loading.syncing}
                                className="px-3 py-1.5 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-700 flex items-center justify-center gap-1 disabled:opacity-50"
                              >
                                {loading.syncing ? <FaSpinner className="animate-spin" /> : <FaSync />}
                                Sync
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
                    })}
                  </tbody>
                </table>

                {filteredPayRuns.length === 0 && (
                  <div className="px-6 py-12 text-center">
                    <FaCogs className="text-4xl text-gray-300 mx-auto mb-3" />
                    <p className="text-lg font-medium text-gray-900 mb-1">No pay runs found</p>
                    <p className="text-gray-500">
                      {payRunViewMode === 'byPeriod' && selectedPeriod
                        ? `Create a pay run for period ${formatDate(selectedPeriod.start_date)} - ${formatDate(selectedPeriod.end_date)}`
                        : 'No fortnightly pay runs found'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============ PAYSLIPS TAB ============ */}
        {activeTab === "payslips" && (
          <div className="space-y-6">
            {/* View Mode Toggle */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-700">View Mode:</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePayslipViewModeChange('byPayRun')}
                      className={`px-4 py-2 text-sm font-medium rounded-lg ${
                        payslipViewMode === 'byPayRun'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      disabled={!selectedPayRun && payslipViewMode === 'byPayRun'}
                    >
                      <FaFileInvoice className="inline mr-2" />
                      By Pay Run {selectedPayRun && `(${payslips.length})`}
                    </button>
                    <button
                      onClick={() => handlePayslipViewModeChange('all')}
                      className={`px-4 py-2 text-sm font-medium rounded-lg ${
                        payslipViewMode === 'all'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <FaListAlt className="inline mr-2" />
                      All Payslips ({allPayslips.length})
                    </button>
                  </div>
                </div>
                {payslipViewMode === 'all' && (
                  <button
                    onClick={fetchAllPayslipsForOrganization}
                    disabled={loading.allPayslips}
                    className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    <FaSync className={loading.allPayslips ? "animate-spin" : ""} />
                    Refresh All
                  </button>
                )}
              </div>
            </div>

            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    {payslipViewMode === 'all' 
                      ? `All Payslips (${allPayslips.length})` 
                      : selectedPayRun 
                        ? `Payslips for Pay Run #${payRuns.find(p => p.xero_pay_run_id === selectedPayRun)?.id || ''}`
                        : 'Select a pay run to view payslips'}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Total Net Pay: {formatCurrency(payslipTotals.totalNetPay)} • {payslipViewMode === 'all' ? allPayslips.length : payslips.length} payslips
                  </p>
                </div>
                <div className="relative">
                  <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search employees..."
                    value={payslipFilters.search}
                    onChange={(e) => setPayslipFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="border border-gray-300 pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm w-64"
                  />
                </div>
              </div>
            </div>

            {/* Payslips Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
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
                  <tbody>
                    {filteredPayslips.map((payslip) => {
                      const employee = payslip.employee_connection?.employee;
                      return (
                        <tr key={payslip.id} className="hover:bg-gray-50">
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
                              DB: {payslip.id}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {parseFloat(payslip.hours_worked || 0).toFixed(2)} hrs
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-semibold text-blue-600">
                              {formatCurrency(payslip.wages)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-semibold text-red-600">
                              {formatCurrency(payslip.tax_deducted)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-lg font-bold text-green-600">
                              {formatCurrency(payslip.net_pay)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(payslip.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex gap-1">
                              <button
                                onClick={() => handlePreviewPayslip(payslip)}
                                className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700"
                                title="Preview"
                              >
                                <FaEye />
                              </button>
                              <button
                                onClick={() => fetchEmployeeHistory(payslip.employee_xero_connection_id)}
                                className="px-3 py-1.5 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-700"
                                title="History"
                              >
                                <FaHistory />
                              </button>
                              <button
                                className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700"
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

                {filteredPayslips.length === 0 && (
                  <div className="px-6 py-12 text-center">
                    <FaPayslipIcon className="text-4xl text-gray-300 mx-auto mb-3" />
                    <p className="text-lg font-medium text-gray-900 mb-1">No payslips found</p>
                    <p className="text-gray-500">
                      {payslipViewMode === 'byPayRun'
                        ? 'Select a pay run and click "Payslips" to view payslips'
                        : 'No payslips found for this organization'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============ MODALS ============ */}
        {/* Pay Run Details Modal */}
        {showPayRunDetails && selectedPayRunDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">
                  Pay Run Details #{selectedPayRunDetails.id}
                </h2>
                <button onClick={() => setShowPayRunDetails(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <FaTimesCircle className="text-gray-500" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Pay Run Information</h3>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                        <p><strong>Database ID:</strong> {selectedPayRunDetails.id}</p>
                        <p><strong>Xero ID:</strong> {selectedPayRunDetails.xero_pay_run_id}</p>
                        <p><strong>Calendar:</strong> {selectedPayRunDetails.calendar_name}</p>
                        <p><strong>Status:</strong> 
                          <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusColor(selectedPayRunDetails.status)}`}>
                            {selectedPayRunDetails.status}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Dates</h3>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                        <p><strong>Period:</strong> {formatDate(selectedPayRunDetails.period_start_date)} - {formatDate(selectedPayRunDetails.period_end_date)}</p>
                        <p><strong>Payment Date:</strong> {formatDate(selectedPayRunDetails.payment_date)}</p>
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
                        <div className="flex justify-between border-t pt-2">
                          <span className="font-bold">Net Pay:</span>
                          <span className="font-bold text-green-600">{formatCurrency(selectedPayRunDetails.total_net_pay)}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Employees</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="font-medium">{selectedPayRunDetails.employee_count || 0} employees</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-6 border-t">
                  <button onClick={() => setShowPayRunDetails(false)} className="px-4 py-2.5 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300">
                    Close
                  </button>
                  <button
                    onClick={() => {
                      fetchPayslipsByPayRun(selectedPayRunDetails.xero_pay_run_id);
                      setShowPayRunDetails(false);
                    }}
                    className="px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <FaPayslipIcon /> View Payslips
                  </button>
                  {selectedPayRunDetails.status === 'DRAFT' && (
                    <button
                      onClick={() => {
                        approvePayRun(selectedPayRunDetails.xero_pay_run_id);
                        setShowPayRunDetails(false);
                      }}
                      disabled={loading.approving}
                      className="px-4 py-2.5 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 flex items-center gap-2 disabled:opacity-50"
                    >
                      {loading.approving ? <FaSpinner className="animate-spin" /> : <FaCheck />}
                      Approve
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Employee History Modal */}
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
                    <tbody>
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

        {/* Payslip Preview Modal */}
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
                  </div>

                  <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                      <h3 className="font-semibold mb-3 text-gray-700">Employee Details</h3>
                      <div className="space-y-2">
                        <p><strong>Name:</strong> {previewPayslip.employee_connection?.employee?.first_name} {previewPayslip.employee_connection?.employee?.last_name}</p>
                        <p><strong>Employee ID:</strong> {previewPayslip.employee_connection?.employee?.employee_code}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-3 text-gray-700">Pay Details</h3>
                      <div className="space-y-2">
                        <p><strong>Period:</strong> {formatDate(previewPayslip.pay_run?.period_start_date)} - {formatDate(previewPayslip.pay_run?.period_end_date)}</p>
                        <p><strong>Payment Date:</strong> {formatDate(previewPayslip.pay_run?.payment_date)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                      <h3 className="font-semibold mb-3 text-gray-700 border-b pb-2">Earnings</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Wages</span>
                          <span className="font-medium">{formatCurrency(previewPayslip.wages)}</span>
                        </div>
                        <div className="flex justify-between font-semibold border-t pt-2">
                          <span>Total Earnings</span>
                          <span>{formatCurrency(previewPayslip.wages)}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3 text-gray-700 border-b pb-2">Deductions</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Tax Deducted</span>
                          <span className="font-medium text-red-600">-{formatCurrency(previewPayslip.tax_deducted)}</span>
                        </div>
                        <div className="flex justify-between font-semibold border-t pt-2">
                          <span>Total Deductions</span>
                          <span className="text-red-600">-{formatCurrency(previewPayslip.tax_deducted)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-100 p-6 rounded-lg text-center">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      Net Pay: {formatCurrency(previewPayslip.net_pay)}
                    </h3>
                    <p className="text-gray-600">
                      {convertToWords(parseFloat(previewPayslip.net_pay) || 0)}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button className="px-4 py-2.5 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 flex items-center gap-2">
                    <FaPrint /> Print
                  </button>
                  <button className="px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 flex items-center gap-2">
                    <FaDownload /> Download PDF
                  </button>
                  <button className="px-4 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 flex items-center gap-2">
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