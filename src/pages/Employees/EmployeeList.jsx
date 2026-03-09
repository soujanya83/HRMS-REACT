// EmployeeList.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaEdit,
  FaTrash,
  FaEye,
  FaPlus,
  FaUndo,
  FaTrashAlt,
  FaSearch,
  FaDownload,
  FaUpload,
  FaFileAlt,
  FaUserCheck,
  FaUserTimes,
  FaEnvelope,
  FaPhone,
  FaBuilding,
  FaBriefcase,
  FaUser,
  FaChartBar,
  FaRedoAlt,
  FaFileDownload,
  FaSync,
  FaCheckCircle,
  FaLink,
  FaCopy,
  FaTimes,
  FaSpinner,
} from "react-icons/fa";
import {
  HiOutlineArchive,
  HiX,
} from "react-icons/hi";
import { useOrganizations } from "../../contexts/OrganizationContext";
import {
  getEmployees,
  deleteEmployee,
  restoreEmployee,
  forceDeleteEmployee,
  updateEmployeeStatus,
  syncEmployeeToXero,
} from "../../services/employeeService";
import axiosClient from "../../axiosClient";

// Pastel color options for background
const PASTEL_COLORS = [
  { name: 'Soft Pink', value: '#FFD1DC', textColor: 'text-gray-800' },
  { name: 'Mint Green', value: '#C1E1C1', textColor: 'text-gray-800' },
  { name: 'Lavender', value: '#E6E6FA', textColor: 'text-gray-800' },
  { name: 'Peach', value: '#FFDAB9', textColor: 'text-gray-800' },
  { name: 'Baby Blue', value: '#B5D8FF', textColor: 'text-gray-800' },
  { name: 'Soft Yellow', value: '#FFFACD', textColor: 'text-gray-800' },
  { name: 'Lilac', value: '#C8A2C8', textColor: 'text-gray-800' },
  { name: 'Mint Cream', value: '#F5FFFA', textColor: 'text-gray-800' },
];

// Color Palette Component
const ColorPalette = ({ isOpen, onClose, onColorSelect }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-20 transition-opacity z-40"
        onClick={onClose}
      />
      
      {/* Side panel */}
      <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800">Choose Pastel Color</h3>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <HiX size={24} />
            </button>
          </div>
          
          <div className="space-y-4">
            {PASTEL_COLORS.map((color, index) => (
              <button
                key={index}
                onClick={() => {
                  onColorSelect(color.value);
                  onClose();
                }}
                className="w-full p-4 rounded-lg transition-transform hover:scale-105 flex items-center justify-between"
                style={{ backgroundColor: color.value }}
              >
                <span className={`font-medium ${color.textColor}`}>{color.name}</span>
                <div className="w-6 h-6 rounded-full border-2 border-gray-300" style={{ backgroundColor: color.value }} />
              </button>
            ))}
          </div>
          
          {/* Reset to default button */}
          <button
            onClick={() => {
              onColorSelect('#f9fafb'); // Default bg-gray-50
              onClose();
            }}
            className="w-full mt-6 p-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Reset to Default
          </button>
        </div>
      </div>
    </>
  );
};

// Confirmation Modal Component
const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = "delete",
}) => {
  if (!isOpen) return null;

  const buttonColors = {
    delete: "bg-red-600 hover:bg-red-700",
    restore: "bg-green-600 hover:bg-green-700",
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`p-3 rounded-full ${
              type === "delete"
                ? "bg-red-100 text-red-600"
                : "bg-green-100 text-green-600"
            }`}
          >
            {type === "delete" ? (
              <FaTrash className="h-6 w-6" />
            ) : (
              <FaUndo className="h-6 w-6" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
            <p className="text-sm text-gray-500 mt-1">
              This action cannot be undone
            </p>
          </div>
        </div>
        <p className="text-gray-600 mb-6 pl-1">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2.5 text-white rounded-lg transition-colors font-medium ${buttonColors[type]}`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

// Xero Status Badge Component
const XeroStatusBadge = ({ employee, onClick, syncing }) => {
  if (syncing) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
        <FaSpinner className="animate-spin h-3 w-3" />
        Syncing...
      </div>
    );
  }

  const hasXeroConnection = employee.xero_employee_connection || employee.xero_employee_id;
  const xeroStatus = employee.xero_synced_status || employee.xero_status;

  if (hasXeroConnection || xeroStatus === "synced" || xeroStatus === "Synced") {
    return (
      <div 
        className="flex items-center gap-1.5 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full cursor-pointer hover:bg-green-200 transition-colors"
        title="Already linked to Xero. Click to view details."
        onClick={() => onClick(employee)}
      >
        <FaCheckCircle className="h-3 w-3" />
        Linked
      </div>
    );
  }

  return (
    <button
      onClick={() => onClick(employee)}
      disabled={syncing}
      className="flex items-center gap-1.5 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      title="Sync to Xero"
    >
      <FaSync className="h-3 w-3" />
      Sync to Xero
    </button>
  );
};

// Xero Details Modal Component
const XeroDetailsModal = ({ isOpen, onClose, employee }) => {
  if (!isOpen || !employee) return null;

  const xeroEmployeeId = 
    employee.xero_employee_connection?.xero_employee_id || 
    employee.xero_employee_id || 
    'N/A';

  const xeroStatus = employee.xero_synced_status || employee.xero_status || 'synced';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <FaLink className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Xero Integration</h2>
              <p className="text-sm text-gray-500">Employee linked with Xero</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <FaTimes />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Employee</p>
            <p className="text-gray-900">{employee.first_name} {employee.last_name}</p>
            <p className="text-sm text-gray-500">{employee.employee_code || 'No Code'}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Xero Employee ID</p>
            <div className="flex items-center gap-2">
              <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono break-all">
                {xeroEmployeeId}
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(xeroEmployeeId);
                  alert('Copied to clipboard!');
                }}
                className="text-blue-600 hover:text-blue-800"
                title="Copy to clipboard"
              >
                <FaCopy className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Sync Status</p>
            <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
              <FaCheckCircle className="h-3 w-3" />
              {xeroStatus}
            </span>
          </div>

          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <FaCheckCircle className="h-5 w-5 text-green-600" />
              <p className="text-green-800 text-sm">
                This employee is successfully linked with Xero payroll system.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    Active: {
      color: "bg-green-100 text-green-800 border-green-200",
      icon: <FaUserCheck className="h-3 w-3" />,
    },
    Inactive: {
      color: "bg-gray-100 text-gray-800 border-gray-200",
      icon: <FaUserTimes className="h-3 w-3" />,
    },
    "On Leave": {
      color: "bg-blue-100 text-blue-800 border-blue-200",
      icon: <HiOutlineArchive className="h-3 w-3" />,
    },
    Terminated: {
      color: "bg-red-100 text-red-800 border-red-200",
      icon: <FaUserTimes className="h-3 w-3" />,
    },
    "On Probation": {
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      icon: <FaUser className="h-3 w-3" />,
    },
  };

  const config = statusConfig[status] || {
    color: "bg-gray-100 text-gray-800 border-gray-200",
    icon: null,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}
    >
      {config.icon}
      {status}
    </span>
  );
};

// Quick Stats Card Component - COMPACT VERSION
const StatsCard = ({ title, value, icon, color }) => (
  <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
      <h3 className="text-xl font-bold text-gray-800">{value}</h3>
    </div>
    <p className="text-xs text-gray-600 mt-1">{title}</p>
  </div>
);

// Quick Action Button Component - COMPACT VERSION
const QuickActionButton = ({
  icon,
  label,
  onClick,
  color = "bg-blue-600 hover:bg-blue-700",
}) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-center gap-1.5 px-3 py-2 text-sm text-white rounded-lg transition-all hover:opacity-90 ${color} font-medium`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

export default function EmployeeList() {
  const navigate = useNavigate();
  const { selectedOrganization } = useOrganizations();
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [view, setView] = useState("active");
  const [syncingAll, setSyncingAll] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState('#f9fafb');
  const [isColorPaletteOpen, setIsColorPaletteOpen] = useState(false);

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    onLeave: 0,
    departments: {},
  });

  // Modal state
  const [modalState, setModalState] = useState({
    isOpen: false,
    action: null,
    title: "",
    message: "",
    type: "delete",
    employeeId: null,
    employeeName: "",
  });

  // Xero states
  const [syncingEmployees, setSyncingEmployees] = useState({});
  const [xeroDetailsModal, setXeroDetailsModal] = useState({
    isOpen: false,
    employee: null,
  });

  const quickActions = [
    {
      label: "Add Employee",
      icon: <FaPlus className="h-4 w-4" />,
      action: () => navigate("/dashboard/employees/new"),
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      label: "Import",
      icon: <FaUpload className="h-4 w-4" />,
      action: () => alert("Import feature coming soon!"),
      color: "bg-green-600 hover:bg-green-700",
    },
    {
      label: "Export",
      icon: <FaFileDownload className="h-4 w-4" />,
      action: () => exportEmployeeList(),
      color: "bg-purple-600 hover:bg-purple-700",
    },
    {
      label: "Reports",
      icon: <FaChartBar className="h-4 w-4" />,
      action: () => navigate("/dashboard/employees/reports"),
      color: "bg-indigo-600 hover:bg-indigo-700",
    },
  ];

  // Apply filters function
  const applyFilters = useCallback((employeesList, search, status, department) => {
    let filtered = [...employeesList];

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((employee) =>
        employee.first_name?.toLowerCase().includes(searchLower) ||
        employee.last_name?.toLowerCase().includes(searchLower) ||
        employee.personal_email?.toLowerCase().includes(searchLower) ||
        employee.employee_code?.toLowerCase().includes(searchLower) ||
        employee.phone_number?.includes(search)
      );
    }

    if (status !== "all") {
      filtered = filtered.filter((employee) => employee.status === status);
    }

    if (department !== "all") {
      filtered = filtered.filter((employee) => 
        employee.department?.name === department
      );
    }

    setFilteredEmployees(filtered);
  }, []);

  // Fetch employees
  const fetchEmployees = useCallback(async () => {
    if (!selectedOrganization?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      let response;
      let employeesData = [];
      
      if (view === "active") {
        response = await getEmployees({
          organization_id: selectedOrganization.id,
        });
        employeesData = response.data?.data || [];
      } else {
        response = await axiosClient.post('/employees/trashed', {
          organization_id: selectedOrganization.id
        });
        
        if (response.data?.success === true && Array.isArray(response.data.data)) {
          employeesData = response.data.data;
        } else if (Array.isArray(response.data)) {
          employeesData = response.data;
        }
      }

      setEmployees(employeesData);
      applyFilters(employeesData, searchTerm, selectedStatus, selectedDepartment);

      const activeCount = employeesData.filter(
        (emp) => emp.status === "Active"
      ).length;
      const inactiveCount = employeesData.filter(
        (emp) => emp.status === "Inactive"
      ).length;
      const onLeaveCount = employeesData.filter(
        (emp) => emp.status === "On Leave"
      ).length;

      const departmentStats = {};
      employeesData.forEach((emp) => {
        const deptName = emp.department?.name || "No Department";
        departmentStats[deptName] = (departmentStats[deptName] || 0) + 1;
      });

      setStats({
        total: employeesData.length,
        active: activeCount,
        inactive: inactiveCount,
        onLeave: onLeaveCount,
        departments: departmentStats,
      });
    } catch (error) {
      console.error("Error fetching employees:", error);
      setEmployees([]);
      setFilteredEmployees([]);
    } finally {
      setLoading(false);
    }
  }, [selectedOrganization, view, searchTerm, selectedStatus, selectedDepartment, applyFilters]);

  useEffect(() => {
    applyFilters(employees, searchTerm, selectedStatus, selectedDepartment);
  }, [searchTerm, selectedStatus, selectedDepartment, employees, applyFilters]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const openModal = (action, title, message, type = "delete", employeeId = null, employeeName = "") => {
    setModalState({
      isOpen: true,
      action,
      title,
      message,
      type,
      employeeId,
      employeeName,
    });
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      action: null,
      title: "",
      message: "",
      type: "delete",
      employeeId: null,
      employeeName: "",
    });
  };

  const handleConfirm = async () => {
    if (modalState.action) {
      try {
        await modalState.action();
        fetchEmployees();
        alert(
          `${
            modalState.type === "delete"
              ? "Employee moved to trash"
              : "Employee restored"
          } successfully!`
        );
      } catch (error) {
        console.error("Error performing action:", error);
        alert("Failed to perform action. Please try again.");
      }
    }
    closeModal();
  };

  const handleDelete = (employee) => {
    openModal(
      () => deleteEmployee(employee.id),
      "Move to Trash",
      `Are you sure you want to move "${employee.first_name} ${employee.last_name}" to trash? They will be moved to the trash section and can be restored later.`,
      "delete",
      employee.id,
      `${employee.first_name} ${employee.last_name}`
    );
  };

  const handleRestore = (employee) => {
    openModal(
      () => restoreEmployee(employee.id),
      "Restore Employee",
      `Are you sure you want to restore "${employee.first_name} ${employee.last_name}"? They will be moved back to the active employees list.`,
      "restore",
      employee.id,
      `${employee.first_name} ${employee.last_name}`
    );
  };

  const handleForceDelete = (employee) => {
    openModal(
      () => forceDeleteEmployee(employee.id),
      "Permanently Delete",
      `WARNING: This will permanently delete "${employee.first_name} ${employee.last_name}" and all associated data. This action cannot be undone.`,
      "delete",
      employee.id,
      `${employee.first_name} ${employee.last_name}`
    );
  };

  const handleStatusChange = async (employeeId, newStatus) => {
    try {
      await updateEmployeeStatus(employeeId, newStatus);
      fetchEmployees();
      alert(`Status updated to ${newStatus} successfully!`);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status. Please try again.");
    }
  };

  const handleSyncToXero = async (employee) => {
    if (employee.xero_employee_connection || employee.xero_employee_id) {
      setXeroDetailsModal({
        isOpen: true,
        employee: employee
      });
      return;
    }

    if (!selectedOrganization?.id) {
      alert("Please select an organization first");
      return;
    }

    setSyncingEmployees((prev) => ({ ...prev, [employee.id]: true }));
    
    try {
      console.log(`Syncing employee ${employee.id} to Xero...`);
      
      const response = await syncEmployeeToXero(
        selectedOrganization.id,
        employee.id
      );
      
      console.log("Sync response:", response.data);
      
      if (response.data?.status === true) {
        const xeroEmployeeId = response.data.xero_employee_id;
        
        if (response.data.message === "Employee already linked with Xero.") {
          alert(`${employee.first_name} ${employee.last_name} is already linked with Xero (ID: ${xeroEmployeeId})`);
        } else {
          alert(`Successfully synced ${employee.first_name} ${employee.last_name} to Xero! Xero ID: ${xeroEmployeeId}`);
        }
        
        await fetchEmployees();
      } else {
        throw new Error(response.data?.message || 'Failed to sync with Xero');
      }
    } catch (error) {
      console.error("Failed to sync to Xero:", error);
      
      if (error.response?.data?.error?.includes("No query results for model")) {
        alert(`Employee ${employee.first_name} ${employee.last_name} not found in the system.`);
      } else {
        alert(`Failed to sync ${employee.first_name} ${employee.last_name} to Xero: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      setSyncingEmployees((prev) => ({ ...prev, [employee.id]: false }));
    }
  };

  // Sync all employees to Xero
  const handleSyncAllToXero = async () => {
    if (!selectedOrganization?.id) {
      alert("Please select an organization first");
      return;
    }

    const unsyncedEmployees = employees.filter(emp => 
      !emp.xero_employee_id && !emp.xero_employee_connection
    );

    if (unsyncedEmployees.length === 0) {
      alert("All employees are already synced with Xero!");
      return;
    }

    if (!window.confirm(`Sync ${unsyncedEmployees.length} employees to Xero? This may take a few moments.`)) {
      return;
    }

    setSyncingAll(true);
    let successCount = 0;
    let failCount = 0;
    const failedEmployees = [];

    for (const employee of unsyncedEmployees) {
      try {
        setSyncingEmployees(prev => ({ ...prev, [employee.id]: true }));
        
        const response = await syncEmployeeToXero(selectedOrganization.id, employee.id);
        
        if (response.data?.status === true) {
          successCount++;
        } else {
          failCount++;
          failedEmployees.push(`${employee.first_name} ${employee.last_name}`);
        }
      } catch (error) {
        failCount++;
        failedEmployees.push(`${employee.first_name} ${employee.last_name}`);
        console.error(`Failed to sync ${employee.first_name}:`, error);
      } finally {
        setSyncingEmployees(prev => ({ ...prev, [employee.id]: false }));
      }
    }

    alert(`Sync complete: ${successCount} succeeded, ${failCount} failed${failedEmployees.length > 0 ? '\nFailed: ' + failedEmployees.join(', ') : ''}`);
    fetchEmployees();
    setSyncingAll(false);
  };

  const closeXeroDetailsModal = () => {
    setXeroDetailsModal({
      isOpen: false,
      employee: null,
    });
  };

  const exportEmployeeList = () => {
    const csvContent = [
      [
        "Name",
        "Employee Code",
        "Email",
        "Phone",
        "Department",
        "Designation",
        "Status",
        "Joining Date",
        "Xero Status",
        "Xero Employee ID",
      ],
      ...filteredEmployees.map((emp) => [
        `${emp.first_name} ${emp.last_name}`,
        emp.employee_code || "N/A",
        emp.personal_email || "N/A",
        emp.phone_number || "N/A",
        emp.department?.name || "N/A",
        emp.designation?.title || "N/A",
        emp.status || "N/A",
        emp.joining_date || "N/A",
        emp.xero_synced_status || emp.xero_status || "Not synced",
        emp.xero_employee_id || "N/A",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `employees_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    alert("Export started! Check your downloads folder.");
  };

  const departments = [
    ...new Set(employees.map((emp) => emp.department?.name).filter(Boolean)),
  ];
  const statuses = [
    "Active",
    "Inactive",
    "On Leave",
    "Terminated",
    "On Probation",
  ];

  const trashedCount = employees.filter(e => e.deleted_at).length;

  return (
    <>
      {/* Color Palette Toggle Button */}
      <button
        onClick={() => setIsColorPaletteOpen(true)}
        className="fixed right-0 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-purple-400 to-pink-400 text-white p-2 rounded-l-lg shadow-lg hover:shadow-xl transition-all z-30 group"
        style={{ writingMode: 'vertical-rl' }}
      >
        <div className="flex items-center space-x-1">
          <svg className="w-4 h-4 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
          <span className="text-xs font-medium">Colors</span>
        </div>
      </button>

      {/* Color Palette Component */}
      <ColorPalette 
        isOpen={isColorPaletteOpen}
        onClose={() => setIsColorPaletteOpen(false)}
        onColorSelect={setBackgroundColor}
      />

      <ConfirmationModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        onConfirm={handleConfirm}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
      />

      <XeroDetailsModal
        isOpen={xeroDetailsModal.isOpen}
        onClose={closeXeroDetailsModal}
        employee={xeroDetailsModal.employee}
      />

      <div 
        className="p-3 sm:p-4 lg:p-5 font-sans min-h-screen transition-colors duration-300"
        style={{ backgroundColor }}
      >
        {/* Header - REDUCED MARGINS */}
        <div className="mb-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Employee Management
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage your workforce, track employment details, and handle
                employee lifecycle.
                {selectedOrganization && (
                  <span className="font-medium text-blue-600 ml-2">
                    {selectedOrganization.name}
                  </span>
                )}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleSyncAllToXero}
                disabled={syncingAll}
                className="flex items-center gap-1.5 px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50"
              >
                {syncingAll ? (
                  <>
                    <FaSpinner className="animate-spin h-3.5 w-3.5" /> 
                    Syncing...
                  </>
                ) : (
                  <>
                    <FaSync className="h-3.5 w-3.5" /> Sync All
                  </>
                )}
              </button>
              <button
                onClick={() => navigate("/dashboard/employees/new")}
                className="flex items-center gap-1.5 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <FaPlus className="h-3.5 w-3.5" /> Add Employee
              </button>
            </div>
          </div>

          {/* Quick Stats - COMPACT GRID */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
            <StatsCard
              title="Total Employees"
              value={stats.total}
              icon={<FaUser className="h-4 w-4 text-blue-600" />}
              color="bg-blue-50"
            />
            <StatsCard
              title="Active"
              value={stats.active}
              icon={<FaUserCheck className="h-4 w-4 text-green-600" />}
              color="bg-green-50"
            />
            <StatsCard
              title="On Leave"
              value={stats.onLeave}
              icon={<HiOutlineArchive className="h-4 w-4 text-yellow-600" />}
              color="bg-yellow-50"
            />
            <StatsCard
              title="Inactive"
              value={stats.inactive}
              icon={<FaUserTimes className="h-4 w-4 text-red-600" />}
              color="bg-red-50"
            />
          </div>

          {/* Quick Actions - COMPACT */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
            {quickActions.map((action, index) => (
              <QuickActionButton
                key={index}
                icon={action.icon}
                label={action.label}
                onClick={action.action}
                color={action.color}
              />
            ))}
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          {/* Toolbar - COMPACT */}
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
              {/* View Toggle */}
              <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg">
                <button
                  onClick={() => setView("active")}
                  className={`px-3 py-1.5 text-xs rounded-md font-medium transition-all ${
                    view === "active"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setView("trashed")}
                  className={`px-3 py-1.5 text-xs rounded-md font-medium transition-all flex items-center gap-1 ${
                    view === "trashed"
                      ? "bg-white text-red-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  <FaTrash className="h-3 w-3" />
                  Trash ({trashedCount})
                </button>
              </div>

              {/* Search and Filters - COMPACT */}
              <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                <div className="relative flex-grow min-w-[200px]">
                  <FaSearch className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-3.5 w-3.5" />
                  <input
                    type="text"
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  />
                </div>

                <div className="flex gap-2">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white min-w-[120px]"
                  >
                    <option value="all">All Status</option>
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white min-w-[140px]"
                  >
                    <option value="all">All Depts</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Employee Table - COMPACT CELLS */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Xero
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-3 py-8 text-center">
                      <div className="flex justify-center">
                        <FaSpinner className="animate-spin h-6 w-6 text-blue-600" />
                      </div>
                      <p className="mt-1 text-sm text-gray-500">Loading...</p>
                    </td>
                  </tr>
                ) : filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-3 py-8 text-center">
                      <div className="text-gray-400 mb-2">
                        <FaUser className="h-8 w-8 mx-auto" />
                      </div>
                      <h3 className="text-sm font-medium text-gray-700 mb-1">
                        {view === "trashed"
                          ? "No employees in trash"
                          : "No employees found"}
                      </h3>
                      <p className="text-xs text-gray-500 mb-2">
                        {searchTerm ||
                        selectedStatus !== "all" ||
                        selectedDepartment !== "all"
                          ? "Try adjusting your search or filters"
                          : view === "trashed"
                          ? "Trash is empty"
                          : "Add your first employee"}
                      </p>
                      {view === "active" && !searchTerm && (
                        <button
                          onClick={() => navigate("/dashboard/employees/new")}
                          className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                        >
                          <FaPlus className="inline mr-1 h-3 w-3" />
                          Add First
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((employee) => (
                    <tr
                      key={employee.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {/* Employee Info */}
                      <td className="px-3 py-2">
                        <div className="flex items-center">
                          <div className="h-7 w-7 flex-shrink-0 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">
                            {employee.first_name?.[0]}
                            {employee.last_name?.[0]}
                          </div>
                          <div className="ml-2">
                            <div className="text-xs font-medium text-gray-900">
                              {employee.first_name} {employee.last_name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {employee.employee_code || "No Code"}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="px-3 py-2">
                        <div className="text-xs text-gray-900 flex items-center gap-1 mb-0.5">
                          <FaEnvelope className="text-gray-400 h-3 w-3" />
                          <span className="truncate max-w-[100px]">{employee.personal_email || "No email"}</span>
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <FaPhone className="text-gray-400 h-3 w-3" />
                          {employee.phone_number || "No phone"}
                        </div>
                      </td>

                      {/* Role & Department */}
                      <td className="px-3 py-2">
                        <div className="text-xs text-gray-900 flex items-center gap-1 mb-0.5">
                          <FaBriefcase className="text-gray-400 h-3 w-3" />
                          <span className="truncate max-w-[80px]">{employee.designation?.title || "No designation"}</span>
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <FaBuilding className="text-gray-400 h-3 w-3" />
                          {employee.department?.name || "No dept"}
                        </div>
                      </td>

                      {/* Xero Status */}
                      <td className="px-3 py-2">
                        <XeroStatusBadge 
                          employee={employee}
                          onClick={() => handleSyncToXero(employee)}
                          syncing={syncingEmployees[employee.id]}
                        />
                      </td>

                      {/* Status */}
                      <td className="px-3 py-2">
                        <div className="flex flex-col gap-1">
                          <StatusBadge status={employee.status} />
                          {view === "active" &&
                            employee.status !== "Terminated" && (
                              <select
                                value={employee.status}
                                onChange={(e) =>
                                  handleStatusChange(employee.id, e.target.value)
                                }
                                className="text-[10px] border border-gray-300 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white w-full"
                              >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                                <option value="On Leave">On Leave</option>
                                <option value="On Probation">Probation</option>
                              </select>
                            )}
                        </div>
                      </td>

                      {/* Joining Date */}
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="text-xs text-gray-900">
                          {employee.joining_date
                            ? new Date(employee.joining_date).toLocaleDateString()
                            : "Not set"}
                        </div>
                        {employee.joining_date && (
                          <div className="text-[10px] text-gray-400">
                            {Math.floor(
                              (new Date() - new Date(employee.joining_date)) /
                                (1000 * 60 * 60 * 24 * 365)
                            )}{" "}
                            yrs
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="flex items-center gap-0.5">
                          {view === "active" ? (
                            <>
                              <Link
                                to={`/dashboard/employees/${employee.id}`}
                                className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                                title="View Profile"
                              >
                                <FaEye className="h-3.5 w-3.5" />
                              </Link>
                              <Link
                                to={`/dashboard/employees/edit/${employee.id}`}
                                className="p-1.5 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <FaEdit className="h-3.5 w-3.5" />
                              </Link>
                              <Link
                                to={`/dashboard/employees/${employee.id}/documents`}
                                className="p-1.5 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                                title="Documents"
                              >
                                <FaFileAlt className="h-3.5 w-3.5" />
                              </Link>
                              
                              <button
                                onClick={() => handleDelete(employee)}
                                className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                                title="Move to Trash"
                              >
                                <FaTrash className="h-3.5 w-3.5" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleRestore(employee)}
                                className="p-1.5 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                                title="Restore"
                              >
                                <FaUndo className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleForceDelete(employee)}
                                className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete Permanently"
                              >
                                <FaTrashAlt className="h-3.5 w-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer - COMPACT */}
          {filteredEmployees.length > 0 && (
            <div className="px-3 py-2 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                <div className="text-xs text-gray-600">
                  Showing <span className="font-semibold">{filteredEmployees.length}</span> of <span className="font-semibold">{employees.length}</span> employees
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={fetchEmployees}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    <FaRedoAlt className="h-3 w-3" />
                    Refresh
                  </button>
                  <div className="text-xs text-gray-500">
                    {new Date().toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Department Distribution Chart - COMPACT */}
        {Object.keys(stats.departments).length > 0 && view === "active" && (
          <div className="mt-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-gray-800">
                Department Distribution
              </h3>
              <span className="text-xs text-gray-500">
                {stats.total} total
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {Object.entries(stats.departments).map(([dept, count]) => (
                <div
                  key={dept}
                  className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-gray-700 truncate max-w-[100px]">
                      {dept}
                    </span>
                    <span className="text-xs font-bold text-blue-600">
                      {count}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${(count / stats.total) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-[10px] text-gray-500 mt-1">
                    {Math.round((count / stats.total) * 100)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}