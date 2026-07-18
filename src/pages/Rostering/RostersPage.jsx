// pages/RostersPage.js
import React, { useState, useEffect, useCallback, useMemo } from "react";
import usePermissions from "../../hooks/usePermissions";
import {
  FaCalendarAlt,
  FaSearch,
  FaDownload,
  FaPrint,
  FaUsers,
  FaClock,
  FaExchangeAlt,
  FaChevronLeft,
  FaChevronRight,
  FaChevronDown,
  FaEdit,
  FaTrash,
  FaPlus,
  FaSync,
  FaRegCalendarPlus,
  FaTimes,
  FaBuilding,
  FaMoneyBillWave,
  FaHourglassHalf,
  FaCalculator,
  FaDoorOpen,
  FaDollarSign,
  FaCopy,
} from "react-icons/fa";
import { HiX } from "react-icons/hi";
import rosterService from "../../services/rosterService";
import employeeService from "../../services/employeeService"; // Import employee service
import { useOrganizations } from "../../contexts/OrganizationContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ============================================
// COLOR PALETTE ICON (Same as Dashboard)
// ============================================
const ColorPaletteIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    className="w-6 h-6"
  >
    <path
      d="M12 2C6.48 2 2 6.03 2 11c0 3.87 3.13 7 7 7h1c.55 0 1 .45 1 1 0 1.1.9 2 2 2 4.42 0 8-3.58 8-8 0-6.08-4.92-11-11-11z"
      fill="white"
    />
    <circle cx="7.5" cy="10.5" r="1.5" fill="#2D7BE5" />
    <circle cx="10.5" cy="7.5" r="1.5" fill="#2D7BE5" />
    <circle cx="14.5" cy="7.5" r="1.5" fill="#2D7BE5" />
    <circle cx="16.5" cy="11.5" r="1.5" fill="#2D7BE5" />
  </svg>
);

// ============================================
// COLOR PALETTE MODAL (Same as Dashboard)
// ============================================
const ColorPaletteModal = ({
  isOpen,
  onClose,
  onSidebarColorSelect,
  onBackgroundColorSelect,
  currentSidebarColor,
  currentBgColor,
}) => {
  if (!isOpen) return null;

  const sidebarColors = [
    { name: "Dark Navy", value: "#0B1A2E" },
    { name: "Charcoal", value: "#2C2C2C" },
    { name: "Teal", value: "#008080" },
    { name: "Deep Purple", value: "#4B0082" },
    { name: "Forest Green", value: "#228B22" },
    { name: "Slate Blue", value: "#5B7B9A" },
  ];

  const backgroundColors = [
    { name: "Pure White", value: "#FFFFFF" },
    { name: "Snow", value: "#FFFAFA" },
    { name: "Ivory", value: "#FFFFF0" },
    { name: "Pearl", value: "#F8F6F0" },
    { name: "Whisper", value: "#F5F5F5" },
    { name: "Silver Mist", value: "#E5E7EB" },
    { name: "Ash", value: "#D1D5DB" },
    { name: "Pewter", value: "#9CA3AF" },
    { name: "Stone", value: "#6B7280" },
    { name: "Graphite", value: "#4B5563" },
    { name: "Slate", value: "#374151" },
    { name: "Charcoal", value: "#1F2937" },
  ];

  return (
    <>
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
      />
      <div className="fixed right-6 bottom-24 w-[350px] bg-white rounded-2xl shadow-2xl z-[70] p-6 border border-slate-100 animate-in slide-in-from-bottom-5 duration-300">
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-800">
              Customize Interface Theme
            </h2>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">
              Personalize colors & style
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 p-2 rounded-full transition-colors cursor-pointer"
          >
            <FaTimes className="text-xs" />
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-3">
              Sidebar Color
            </h3>
            <div className="grid grid-cols-3 gap-2.5">
              {sidebarColors.map((c) => (
                <button
                  key={c.name}
                  onClick={() => onSidebarColorSelect(c.value)}
                  className={`p-2.5 rounded-xl text-white text-[11px] font-bold transition-all shadow-sm hover:scale-[1.03] active:scale-[0.97] cursor-pointer ${
                    currentSidebarColor === c.value
                      ? "ring-2 ring-indigo-500 ring-offset-2 scale-[1.03]"
                      : "opacity-90 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: c.value }}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-3">
              Background Theme
            </h3>
            <div className="grid grid-cols-3 gap-2.5 max-h-[160px] overflow-y-auto pr-1">
              {backgroundColors.map((c) => (
                <button
                  key={c.name}
                  onClick={() => onBackgroundColorSelect(c.value)}
                  className={`p-2.5 rounded-xl text-[11px] font-bold border transition-all hover:scale-[1.03] active:scale-[0.97] cursor-pointer ${
                    currentBgColor === c.value
                      ? "border-indigo-600 ring-1 ring-indigo-600 ring-offset-1 scale-[1.03] text-indigo-700"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                  style={{ backgroundColor: c.value }}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const formatLocalDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getContrastColor = (hexColor) => {
  if (!hexColor) return "#ffffff";
  const hex = hexColor.replace("#", "");
  const fullHex =
    hex.length === 3
      ? hex
          .split("")
          .map((c) => c + c)
          .join("")
      : hex;
  const r = parseInt(fullHex.substr(0, 2), 16);
  const g = parseInt(fullHex.substr(2, 2), 16);
  const b = parseInt(fullHex.substr(4, 2), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return "#ffffff";
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#1e293b" : "#ffffff";
};

const formatTimeLabel = (timeStr) => {
  if (!timeStr) return "";
  const parts = timeStr.split(":");
  if (parts.length < 2) return timeStr;
  let hour = parseInt(parts[0], 10);
  const minute = parseInt(parts[1], 10);
  if (isNaN(hour)) return timeStr;
  const ampm = hour >= 12 ? "pm" : "am";
  hour = hour % 12;
  if (hour === 0) hour = 12;
  const minText = minute > 0 ? `:${String(minute).padStart(2, "0")}` : "";
  return `${hour}${minText}${ampm}`;
};

const getShortStaffName = (firstName, lastName) => {
  const f = (firstName || "").trim().split(/\s+/)[0];
  const l = (lastName || "").trim().split(/\s+/)[0];
  return `${f} ${l}`.trim() || "Unknown";
};

const calculateNetWorkingHours = (shiftOrRoster) => {
  if (!shiftOrRoster || !shiftOrRoster.start_time || !shiftOrRoster.end_time)
    return 0;

  const start = new Date(`2000-01-01T${shiftOrRoster.start_time}`);
  const end = new Date(`2000-01-01T${shiftOrRoster.end_time}`);

  let totalDuration = (end - start) / (1000 * 60 * 60);
  if (totalDuration < 0) totalDuration += 24;

  if (shiftOrRoster.break_start && shiftOrRoster.break_end) {
    const bStart = new Date(`2000-01-01T${shiftOrRoster.break_start}`);
    const bEnd = new Date(`2000-01-01T${shiftOrRoster.break_end}`);
    let breakDuration = (bEnd - bStart) / (1000 * 60 * 60);
    if (breakDuration < 0) breakDuration += 24;
    totalDuration -= breakDuration;
  } else if (shiftOrRoster.total_break_minutes) {
    totalDuration -= parseInt(shiftOrRoster.total_break_minutes) / 60;
  } else if (shiftOrRoster.break_duration) {
    totalDuration -= shiftOrRoster.break_duration / 60;
  }

  return parseFloat(totalDuration.toFixed(2));
};

const EmployeeRow = ({
  employee,
  weeklyTotals,
  getDesignationTitle,
  weekDates,
  getRostersForEmployeeAndDate,
  shifts,
  getShiftColor,
  canAddRoster,
  canEditRoster,
  handleAddRoster,
  handleEditRoster,
  handleDragStart,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  dragOverCell,
  selectedRosterIds = [],
  setSelectedRosterIds,
}) => {
  const employeeTotal = weeklyTotals.byEmployee[employee.id] || {
    hours: 0,
    amount: 0,
  };
  const position = getDesignationTitle(employee.designation_id);
  const isTBC =
    (employee.first_name || "").toUpperCase() === "TBC" ||
    (employee.last_name || "").toUpperCase() === "TBC";

  // Responsive column sizing: narrower for fortnightly (10 cols) to fit on lg screens
  const isFortnight = weekDates.length > 5;
  const posW = isFortnight ? 100 : 150;
  const nameW = isFortnight ? 120 : 180;
  const dateMin = isFortnight ? 100 : 110;
  const totalW = isFortnight ? 70 : 90;
  const fixedW = posW + nameW + totalW;

  const getEmployeeRosterIdsForPeriod = () => {
    const ids = [];
    weekDates.forEach((day) => {
      const dayRosters = getRostersForEmployeeAndDate(employee.id, day);
      dayRosters.forEach((r) => {
        if (r.id) ids.push(r.id);
      });
    });
    return ids;
  };

  const periodRosterIds = getEmployeeRosterIdsForPeriod();
  const hasRosters = periodRosterIds.length > 0;
  const isAllSelected = hasRosters && periodRosterIds.every((id) => selectedRosterIds.includes(id));
  const isSomeSelected = hasRosters && !isAllSelected && periodRosterIds.some((id) => selectedRosterIds.includes(id));

  const handleToggleEmployeeRosters = (e) => {
    e.stopPropagation();
    if (isAllSelected) {
      setSelectedRosterIds((prev) => prev.filter((id) => !periodRosterIds.includes(id)));
    } else {
      setSelectedRosterIds((prev) => {
        const unique = new Set([...prev, ...periodRosterIds]);
        return Array.from(unique);
      });
    }
  };

  return (
    <div
      className="border-b transition-colors hover:bg-gray-50"
      style={{
        display: "grid",
        gridTemplateColumns: `${posW}px ${nameW}px repeat(${weekDates.length}, minmax(${dateMin}px, 1fr)) ${totalW}px`,
        minWidth: `${fixedW + weekDates.length * dateMin}px`,
      }}
    >
      {/* Position Column */}
      <div className="p-1.5 border-r bg-white lg:sticky left-0 lg:z-[3] flex items-center font-medium text-gray-700 text-xs h-14 truncate">
        {position}
      </div>

      {/* Staff Name Column */}
      <div
        className={`p-1.5 border-r lg:sticky lg:z-[3] flex items-center gap-1.5 h-14 ${isTBC ? "bg-[#FFFF00]" : "bg-white"}`}
        style={{ left: `${posW}px` }}
      >
        {canEditRoster && hasRosters && (
          <input
            type="checkbox"
            checked={isAllSelected}
            ref={(el) => {
              if (el) el.indeterminate = isSomeSelected;
            }}
            onChange={handleToggleEmployeeRosters}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer shrink-0"
            title="Toggle selection for all rosters of this employee in the current view"
          />
        )}
        <div className="font-bold text-gray-900 text-left text-xs truncate flex-grow">
          {getShortStaffName(employee.first_name, employee.last_name)}
        </div>
      </div>
      {weekDates.map((day) => {
        const dayRosters = getRostersForEmployeeAndDate(employee.id, day);
        const dateStr = formatLocalDate(day);
        const isDragOver =
          dragOverCell?.employeeId === employee.id &&
          dragOverCell?.dateStr === dateStr;

        return (
          <div
            key={day.toString()}
            className={`p-1 border-r flex flex-col justify-center items-center h-14 transition-all relative ${
              isDragOver
                ? "bg-blue-50 border-2 border-dashed border-blue-500 scale-[0.98] z-20 animate-pulse"
                : day.toDateString() === new Date().toDateString()
                  ? "bg-blue-50/30"
                  : ""
            }`}
            onDragOver={(e) =>
              canEditRoster && handleDragOver(e, employee.id, dateStr)
            }
            onDragLeave={canEditRoster ? handleDragLeave : undefined}
            onDrop={(e) => canEditRoster && handleDrop(e, employee.id, day)}
          >
            {dayRosters.map((roster) => {
              const shift =
                roster.shift || shifts.find((s) => s.id === roster.shift_id);
              const shiftColor = getShiftColor(shift?.id);
              const startTime = roster.start_time || shift?.start_time;
              const endTime = roster.end_time || shift?.end_time;

              const isDraft = roster.status === "draft";
              const isPublished = roster.status === "published";

              const hours = roster.total_working_time
                ? parseFloat(roster.total_working_time)
                : shift
                  ? calculateNetWorkingHours(shift)
                  : 0;

              const formattedDuration = (() => {
                const totalMinutes = Math.round(hours * 60);
                const h = Math.floor(totalMinutes / 60);
                const m = totalMinutes % 60;
                return `${h}h ${m}m`;
              })();

              // Published is green, draft is red
              const accentColor = isDraft
                ? "#ef4444"
                : isPublished
                  ? "#22c55e"
                  : shiftColor.borderColor || "#a855f7";

              const cardClass = isDraft
                ? "border-red-200/80 bg-red-50/70 hover:bg-red-50 hover:border-red-300"
                : isPublished
                  ? "border-green-200/80 bg-green-50/70 hover:bg-green-50 hover:border-green-300"
                  : "border-slate-200/80 bg-slate-50/90 hover:bg-white hover:border-slate-300";

              return (
                <div
                  key={roster.id}
                  draggable={canEditRoster}
                  onDragStart={(e) => {
                    if (!canEditRoster) {
                      e.preventDefault();
                      return;
                    }
                    handleDragStart(e, roster);
                  }}
                  className={`w-full h-full flex items-stretch rounded-lg border text-left overflow-hidden transition-all select-none relative ${cardClass} ${
                    canEditRoster
                      ? "cursor-grab active:cursor-grabbing hover:shadow-sm"
                      : "cursor-not-allowed"
                  }`}
                  onClick={() => canEditRoster && handleEditRoster(roster)}
                  title={
                    canEditRoster
                      ? `${isDraft ? "[DRAFT] " : ""}${roster.notes || ""} (Drag to Move/Copy)`
                      : roster.notes || ""
                  }
                >
                  {/* Left Accent Color Strip */}
                  <div
                    className={`${isFortnight ? "w-1" : "w-1.5"} shrink-0`}
                    style={{ backgroundColor: accentColor }}
                  />
                  {/* Text Details Content */}
                  <div
                    className={`px-1.5 flex-grow min-w-0 flex flex-col justify-center py-0.5 leading-tight ${isFortnight ? "pr-5" : ""}`}
                  >
                    {isFortnight ? (
                      <>
                        <div className="font-bold text-[8.5px] text-slate-700 truncate pointer-events-none leading-none">
                          {formatTimeLabel(startTime)}
                        </div>
                        <div className="font-bold text-[8.5px] text-slate-500 truncate pointer-events-none leading-none mt-0.5">
                          {formatTimeLabel(endTime)}
                        </div>
                        <div className="text-[7.5px] text-slate-400 font-bold mt-0.5 pointer-events-none">
                          {formattedDuration}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="font-bold text-[10px] text-slate-700 truncate pointer-events-none">
                          {formatTimeLabel(startTime)} -{" "}
                          {formatTimeLabel(endTime)}
                        </div>
                        <div className="text-[9px] text-slate-400 font-bold mt-0.5 pointer-events-none flex items-center gap-1.5">
                          <span>{formattedDuration}</span>
                          {isDraft && (
                            <span className="text-[7px] text-red-600 font-extrabold uppercase bg-red-100 px-1 rounded border border-red-200/50">
                              Draft
                            </span>
                          )}
                          {isPublished && (
                            <span className="text-[7px] text-green-600 font-extrabold uppercase bg-green-100 px-1 rounded border border-green-200/50">
                              Published
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                  {/* Checkbox for selection */}
                  {canEditRoster && (
                    <div
                      className={`flex items-center shrink-0 ${isFortnight ? "absolute top-1 right-1" : "pr-2"}`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedRosterIds.includes(roster.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          setSelectedRosterIds((prev) =>
                            prev.includes(roster.id)
                              ? prev.filter((id) => id !== roster.id)
                              : [...prev, roster.id],
                          );
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-3.5 h-3.5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              );
            })}
            {dayRosters.length === 0 && canAddRoster && !isDragOver && (
              <button
                onClick={() => handleAddRoster(day, employee.id, employee)}
                className="w-full h-full flex items-center justify-center text-transparent hover:text-blue-300 transition-colors"
              >
                <FaPlus className="text-[10px]" />
              </button>
            )}
          </div>
        );
      })}

      {/* Total Hours Column */}
      <div className="p-1.5 bg-slate-50/50 border-l border-slate-200 font-bold text-slate-700 text-[10px] flex items-center justify-center h-14">
        {employeeTotal.hours.toFixed(1)}h
      </div>
    </div>
  );
};

const RostersPage = () => {
  const { selectedOrganization, currentUserRole } = useOrganizations();
  const { canAdd, canEdit, canDelete } = usePermissions(
    "rostering.weekly_monthly_rosters",
  );

  // Prevent Employee role from editing or adding rosters
  const canEditRoster =
    currentUserRole?.toLowerCase() !== "employee" && canEdit;
  const canAddRoster = currentUserRole?.toLowerCase() !== "employee" && canAdd;
  const [view, setView] = useState("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [lastOrgId, setLastOrgId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [sidebarColor, setSidebarColor] = useState(() => {
    return localStorage.getItem("sidebarColor") || "#1a4d4d";
  });
  const [backgroundColor, setBackgroundColor] = useState(() => {
    return localStorage.getItem("backgroundColor") || "#f9fafb";
  });
  const [isColorPaletteOpen, setIsColorPaletteOpen] = useState(false);
  const [filters, setFilters] = useState({
    room: "all",
    employee: "all",
    shiftType: "all",
    search: "",
  });
  const [footerBaseDate, setFooterBaseDate] = useState(new Date());

  useEffect(() => {
    if (sidebarColor) {
      localStorage.setItem("sidebarColor", sidebarColor);
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(
        new CustomEvent("sidebarColorChange", { detail: sidebarColor }),
      );
    }
  }, [sidebarColor]);

  // Date helpers moved to the top for consistent access
  const getDatesForView = useCallback(() => {
    const date = new Date(currentDate);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date.setDate(diff));
    monday.setHours(0, 0, 0, 0);

    if (view === "week") {
      return Array.from({ length: 5 }, (_, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        return d;
      });
    } else {
      // fortnight: double mon to fri (Week 1 Mon-Fri + Week 2 Mon-Fri)
      const week1 = Array.from({ length: 5 }, (_, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        return d;
      });
      const week2 = Array.from({ length: 5 }, (_, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + 7 + i);
        return d;
      });
      return [...week1, ...week2];
    }
  }, [currentDate, view]);

  const weekDates = useMemo(() => getDatesForView(), [getDatesForView]);

  useEffect(() => {
    localStorage.setItem("backgroundColor", backgroundColor);
  }, [backgroundColor]);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedRoster, setSelectedRoster] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Drag and Drop states
  const [draggedRoster, setDraggedRoster] = useState(null);
  const [dragOverCell, setDragOverCell] = useState(null); // { employeeId, dateStr }
  const [dropTarget, setDropTarget] = useState(null); // { employeeId, date, dateStr }
  const [showDropChoiceModal, setShowDropChoiceModal] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    employee_ids: [],
    shift_id: "",
    from_date: "",
    to_date: "",
    start_time: "",
    end_time: "",
    break_start: "",
    break_end: "",
    break_grace_minutes: 0,
    total_working_time: "00:00",
    status: "draft",
    notes: "",
    period_type: "weekly",
    department_id: "",
  });
  const [empSearchQuery, setEmpSearchQuery] = useState("");

  // State for data from API
  const [rosters, setRosters] = useState([]);
  const [selectedRosterIds, setSelectedRosterIds] = useState([]);
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [shifts, setShifts] = useState([]);

  console.log("Printing rosters", rosters);

  // State for rate calculations
  const [employeeRates, setEmployeeRates] = useState({});
  const [collapsedDepartments, setCollapsedDepartments] = useState({});
  const [selectedShift, setSelectedShift] = useState(null);
  const [estimatedAmount, setEstimatedAmount] = useState(0);
  const [ratesLoading, setRatesLoading] = useState(false);

  // Weekly totals state - will be updated dynamically
  const [weeklyTotals, setWeeklyTotals] = useState({
    totalHours: 0,
    totalAmount: 0,
    byEmployee: {},
    byDepartment: {},
    averageRate: 0,
    lastUpdated: null,
  });

  // Calculate net working hours
  const MOCK_ROOMS = [
    { id: 101, name: "Babies", age_group: "6 - 12 months" },
    { id: 102, name: "Junior Toddlers", age_group: "12 - 24 Months" },
    { id: 103, name: "Toddlers", age_group: "2 - 3 Years" },
    { id: 104, name: "3 - 5 Non Kinder Room", age_group: "" },
    { id: 105, name: "3 Years Kinder", age_group: "" },
    { id: 106, name: "4 Years Kinder", age_group: "" },
    { id: 107, name: "Kitchen", age_group: "" },
    { id: 108, name: "Management", age_group: "" },
  ];

  // Get employee hourly rate from employee data
  const getEmployeeRate = useCallback((employee) => {
    if (!employee) return 25; // Default fallback rate

    // Try different possible rate fields
    return (
      employee.hourly_wage ||
      employee.pay_rate ||
      employee.rate ||
      employee.hourly_rate ||
      25
    ); // Default fallback
  }, []);

  // Calculate amount for a roster
  const calculateRosterAmount = useCallback(
    (roster) => {
      if (!roster) return 0;

      const shift =
        roster.shift || shifts.find((s) => s.id === roster.shift_id);

      const hours = calculateNetWorkingHours({
        start_time: roster.start_time || shift?.start_time,
        end_time: roster.end_time || shift?.end_time,
        break_start: roster.break_start || shift?.break_start,
        break_end: roster.break_end || shift?.break_end,
        total_break_minutes:
          roster.total_break_minutes || shift?.total_break_minutes,
        break_duration: roster.break_duration || shift?.break_duration,
      });

      // Get rate from employee data
      let rate = 25; // Default
      if (roster.employee) {
        rate = getEmployeeRate(roster.employee);
      } else {
        const employee = employees.find((e) => e.id === roster.employee_id);
        rate = getEmployeeRate(employee);
      }

      return hours * rate;
    },
    [shifts, employees, getEmployeeRate, calculateNetWorkingHours],
  );

  // Get shift color style
  const getShiftColor = useCallback(
    (shiftId) => {
      const shift =
        shifts.find((s) => s.id === shiftId) ||
        rosters.find((r) => r.shift?.id === shiftId)?.shift;
      if (!shift)
        return {
          backgroundColor: "#f3f4f6",
          color: "#374151",
          borderColor: "#d1d5db",
        };

      if (shift.color_code) {
        return {
          backgroundColor: `${shift.color_code}20`,
          color: shift.color_code,
          borderColor: shift.color_code,
        };
      }

      return {
        backgroundColor: "#f3f4f6",
        color: "#374151",
        borderColor: "#d1d5db",
      };
    },
    [shifts, rosters],
  );

  // Fetch employee rates separately
  const fetchEmployeeRates = async () => {
    if (!selectedOrganization?.id) return;

    setRatesLoading(true);
    try {
      const response = await employeeService.getEmployees({
        organization_id: selectedOrganization.id,
      });

      // Extract employees data from response
      let employeesData = [];
      if (response?.data) {
        if (Array.isArray(response.data)) {
          employeesData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          employeesData = response.data.data;
        }
      }

      // Build rates object
      const rates = {};
      employeesData.forEach((emp) => {
        rates[emp.id] = getEmployeeRate(emp);
      });

      setEmployeeRates(rates);
      //console.log("💰 Employee rates loaded:", rates);
    } catch (error) {
      console.error("Error fetching employee rates:", error);
    } finally {
      setRatesLoading(false);
    }
  };

  // Fetch all data
  const fetchData = async () => {
    setSelectedRosterIds([]);
    try {
      const orgChanged = lastOrgId !== selectedOrganization?.id;
      if (orgChanged || employees.length === 0) {
        setLoading(true);
        if (selectedOrganization?.id) {
          setLastOrgId(selectedOrganization.id);
        }
      }
      setRefreshing(true);

      if (!selectedOrganization?.id) {
        toast.error("Please select an organization first");
        setLoading(false);
        setRefreshing(false);
        return;
      }

      //console.log("Fetching data for organization:", selectedOrganization.id);

      // Helper function to extract data from API response
      const extractData = (response) => {
        if (!response || !response.data) return [];

        // case 0: response.data.rosters is a department-grouped array or object
        if (response.data.success === true && response.data.rosters) {
          if (Array.isArray(response.data.rosters)) {
            // Check if it's the department array layout with sub-rosters: [ { department_id, rosters: [] } ]
            if (
              response.data.rosters.length > 0 &&
              Object.prototype.hasOwnProperty.call(
                response.data.rosters[0],
                "rosters",
              )
            ) {
              return response.data.rosters.flatMap((d) => d.rosters || []);
            }
            return response.data.rosters;
          }
          if (typeof response.data.rosters === "object") {
            return Object.values(response.data.rosters).flat();
          }
        }

        // case 1: response.data is success and has data
        if (response.data.success === true) {
          const data = response.data.data;
          // handle paginated structure { current_page, data: [], ... }
          if (data && data.data && Array.isArray(data.data)) {
            return data.data;
          }
          // handle flat array structure
          if (Array.isArray(data)) {
            return data;
          }
          // fallback to data itself if it's truthy
          return data || [];
        }

        // case 2: response.data itself is an array
        if (Array.isArray(response.data)) {
          return response.data;
        }

        // case 3: response.data.data exists but success is not explicit
        if (response.data.data) {
          if (Array.isArray(response.data.data)) return response.data.data;
          if (
            response.data.data.data &&
            Array.isArray(response.data.data.data)
          ) {
            return response.data.data.data;
          }
          return response.data.data || [];
        }

        return [];
      };

      // Calculate start and end dates for the current week (Mon-Fri)
      const startDate = formatLocalDate(weekDates[0]);
      const endDate = formatLocalDate(weekDates[weekDates.length - 1]);

      // Fetch all data in parallel
      const [
        rostersRes,
        employeesRes,
        shiftsRes,
        departmentsRes,
        designationsRes,
      ] = await Promise.allSettled([
        rosterService.getRosters({
          organization_id: selectedOrganization.id,
          start_date: startDate,
          end_date: endDate,
          ...(filters.room !== "all" && { department_id: filters.room }),
          ...(filters.employee !== "all" && { employee_id: filters.employee }),
        }),
        rosterService.getEmployees({
          organization_id: selectedOrganization.id,
        }),
        rosterService.getShifts({ organization_id: selectedOrganization.id }),
        rosterService.getDepartments(selectedOrganization.id),
        employeeService.getDesignationsByDeptId(selectedOrganization.id),
      ]);

      // Process rosters
      let rostersData = [];
      if (rostersRes.status === "fulfilled") {
        rostersData = extractData(rostersRes.value);
      }
      // Process employees and their rates
      let employeesData = [];
      if (employeesRes.status === "fulfilled") {
        employeesData = extractData(employeesRes.value);

        // Extract and store employee rates
        const rates = {};
        employeesData.forEach((emp) => {
          rates[emp.id] = getEmployeeRate(emp);
        });
        setEmployeeRates(rates);
      }

      // Process shifts
      let shiftsData = [];
      if (shiftsRes.status === "fulfilled") {
        shiftsData = extractData(shiftsRes.value);
        //console.log("Shifts loaded:", shiftsData.length);
      }

      // Process departments
      let departmentsData = [];
      if (departmentsRes.status === "fulfilled") {
        departmentsData = extractData(departmentsRes.value);
      }
      console.log("Departments loaded:", departmentsData);

      // Process designations
      let designationsData = [];
      if (designationsRes.status === "fulfilled") {
        designationsData = extractData(designationsRes.value);
      }

      // Update all states
      setRosters(rostersData);
      setEmployees(employeesData);
      setShifts(shiftsData);
      setDepartments(departmentsData);
      setDesignations(designationsData);

      // Show success message if we have data
      if (rostersData.length > 0) {
        toast.success(`Loaded ${rostersData.length} rosters`);
      }
    } catch (error) {
      console.error("Unexpected error in fetchData:", error);
      toast.error("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Calculate weekly totals - This will run whenever rosters, employees, shifts, or currentDate changes
  const calculateWeeklyTotals = useCallback(() => {
    if (!rosters.length || !employees.length || !shifts.length) {
      setWeeklyTotals({
        totalHours: 0,
        totalAmount: 0,
        byEmployee: {},
        byDepartment: {},
        averageRate: 0,
        lastUpdated: new Date(),
      });
      return;
    }

    const rangeStart = formatLocalDate(weekDates[0]);
    const rangeEnd = formatLocalDate(weekDates[weekDates.length - 1]);

    // Filter rosters for current view period
    const periodRosters = rosters.filter((roster) => {
      if (!roster.roster_date) return false;
      const rosterDate =
        typeof roster.roster_date === "string"
          ? roster.roster_date.split("T")[0]
          : formatLocalDate(new Date(roster.roster_date));
      return rosterDate >= rangeStart && rosterDate <= rangeEnd;
    });

    let totalHours = 0;
    let totalAmount = 0;
    const byEmployee = {};

    periodRosters.forEach((roster) => {
      const shift =
        roster.shift || shifts.find((s) => s.id === roster.shift_id);

      const hours = calculateNetWorkingHours({
        start_time: roster.start_time || shift?.start_time,
        end_time: roster.end_time || shift?.end_time,
        break_start: roster.break_start || shift?.break_start,
        break_end: roster.break_end || shift?.break_end,
        total_break_minutes:
          roster.total_break_minutes || shift?.total_break_minutes,
        break_duration: roster.break_duration || shift?.break_duration,
      });

      if (hours === 0) return;

      const amount = calculateRosterAmount(roster);

      totalHours += hours;
      totalAmount += amount;

      const employee =
        roster.employee || employees.find((e) => e.id === roster.employee_id);
      if (employee) {
        const employeeId = employee.id;
        if (!byEmployee[employeeId]) {
          byEmployee[employeeId] = {
            id: employeeId,
            name:
              `${employee.first_name || ""} ${employee.last_name || ""}`.trim() ||
              "Unknown",
            hours: 0,
            amount: 0,
            rate: getEmployeeRate(employee),
          };
        }
        byEmployee[employeeId].hours += hours;
        byEmployee[employeeId].amount += amount;
      }
    });

    const averageRate = totalHours > 0 ? totalAmount / totalHours : 0;

    const newTotals = {
      totalHours: parseFloat(totalHours.toFixed(2)),
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      byEmployee,
      byDepartment: {},
      averageRate: parseFloat(averageRate.toFixed(2)),
      lastUpdated: new Date(),
      rosterCount: periodRosters.length,
      uniqueEmployees: Object.keys(byEmployee).length,
    };

    setWeeklyTotals(newTotals);
  }, [
    rosters,
    employees,
    shifts,
    weekDates,
    calculateNetWorkingHours,
    calculateRosterAmount,
    getEmployeeRate,
  ]);

  // Update weekly totals when data changes
  useEffect(() => {
    if (rosters.length > 0 && employees.length > 0 && shifts.length > 0) {
      calculateWeeklyTotals();
    }
  }, [rosters, employees, shifts, currentDate, calculateWeeklyTotals]);

  // Calculate estimated amount when shift is selected in form
  useEffect(() => {
    if (formData.shift_id && formData.employee_id) {
      const shift = shifts.find((s) => s.id === parseInt(formData.shift_id));
      setSelectedShift(shift);

      const employee = employees.find(
        (e) => e.id === parseInt(formData.employee_id),
      );
      const rate = employee ? getEmployeeRate(employee) : 25;
      const hours = calculateNetWorkingHours(shift);
      const amount = hours * rate;

      setEstimatedAmount(amount);
    } else {
      setEstimatedAmount(0);
      setSelectedShift(null);
    }
  }, [
    formData.shift_id,
    formData.employee_id,
    shifts,
    employees,
    getEmployeeRate,
    calculateNetWorkingHours,
  ]);

  useEffect(() => {
    if (selectedOrganization?.id) {
      fetchData();
    }
  }, [selectedOrganization, currentDate, view, filters.room, filters.employee]);

  // Moved to top

  const navigateDate = (direction) => {
    const newDate = new Date(currentDate);
    if (view === "week") {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
    } else {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 14 : -14));
    }
    setCurrentDate(newDate);
    // Also update footer base date so tabs follow the main navigation
    setFooterBaseDate(newDate);
  };

  const getRostersForEmployeeAndDate = useCallback(
    (employeeId, date) => {
      if (!date || !employeeId) return [];

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const targetDateStr = `${year}-${month}-${day}`;

      return rosters.filter((roster) => {
        if (
          roster.employee_id !== employeeId &&
          roster.employee?.id !== employeeId
        )
          return false;

        let rosterDateStr = "";
        if (typeof roster.roster_date === "string") {
          rosterDateStr = roster.roster_date.split("T")[0];
        } else if (roster.roster_date instanceof Date) {
          const d = roster.roster_date;
          rosterDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        }

        return rosterDateStr === targetDateStr;
      });
    },
    [rosters],
  );

  // Filter employees based on search and room
  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const matchesRoom =
        filters.room === "all" ||
        employee.department_id?.toString() === filters.room;

      const matchesSearch =
        filters.search === "" ||
        (employee.first_name &&
          employee.first_name
            .toLowerCase()
            .includes(filters.search.toLowerCase())) ||
        (employee.last_name &&
          employee.last_name
            .toLowerCase()
            .includes(filters.search.toLowerCase())) ||
        (employee.employee_code &&
          employee.employee_code
            .toLowerCase()
            .includes(filters.search.toLowerCase()));

      const matchesEmployee =
        filters.employee === "all" ||
        employee.id?.toString() === filters.employee;

      return matchesRoom && matchesSearch && matchesEmployee;
    });
  }, [employees, filters]);

  // Group filtered employees by department / room
  const groupedEmployees = useMemo(() => {
    const groups = {};

    departments.forEach((dept) => {
      const matchesFilter =
        filters.room === "all" || dept.id?.toString() === filters.room;

      if (matchesFilter) {
        groups[dept.name] = [];
      }
    });

    if (filters.room === "all" && !groups["Unassigned"]) {
      groups["Unassigned"] = [];
    }

    filteredEmployees.forEach((emp) => {
      let deptName = "Unassigned";
      if (emp.department_id) {
        const dept = departments.find((d) => d.id === emp.department_id);
        if (dept) deptName = dept.name;
      }
      if (groups[deptName]) {
        groups[deptName].push(emp);
      }
    });

    return Object.entries(groups).sort((a, b) => {
      if (a[0] === "Unassigned") return 1;
      if (b[0] === "Unassigned") return -1;
      return a[0].localeCompare(b[0]);
    });
  }, [filteredEmployees, departments, filters.room]);

  const getDesignationTitle = useCallback(
    (designationId) => {
      if (!designationId) return "Staff";
      const designation = designations.find((d) => d.id === designationId);
      return designation ? designation.title || designation.name : "Staff";
    },
    [designations],
  );

  const formatTime = useCallback((timeString) => {
    if (!timeString) return "N/A";
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  }, []);

  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  }, []);

  const handleRefresh = () => {
    fetchData();
  };

  const getVisibleRosterIds = useCallback(() => {
    const employeeIds = new Set(filteredEmployees.map((emp) => emp.id));
    return rosters
      .filter((roster) => {
        const empId = roster.employee_id || roster.employee?.id;
        return employeeIds.has(empId);
      })
      .map((roster) => roster.id);
  }, [rosters, filteredEmployees]);

  const handleSelectAll = () => {
    const visibleIds = getVisibleRosterIds();
    setSelectedRosterIds(visibleIds);
  };

  const handleDeselectAll = () => {
    setSelectedRosterIds([]);
  };

  const handlePeriodSelectionChange = (e) => {
    const action = e.target.value;
    if (!action) return;

    if (action === "clear") {
      setSelectedRosterIds([]);
      e.target.value = "";
      return;
    }

    let targetDates = [];
    if (view === "week") {
      targetDates = weekDates;
    } else {
      if (action === "week1") {
        targetDates = weekDates.slice(0, 5);
      } else if (action === "week2") {
        targetDates = weekDates.slice(5, 10);
      } else if (action === "fortnight") {
        targetDates = weekDates;
      }
    }

    const dateStrings = new Set(targetDates.map((d) => formatLocalDate(d)));
    const employeeIds = new Set(filteredEmployees.map((emp) => emp.id));

    const matchingRosterIds = rosters
      .filter((roster) => {
        const empId = roster.employee_id || roster.employee?.id;
        if (!employeeIds.has(empId)) return false;

        const rosterDate =
          typeof roster.roster_date === "string"
            ? roster.roster_date.split("T")[0]
            : formatLocalDate(new Date(roster.roster_date));

        return dateStrings.has(rosterDate);
      })
      .map((roster) => roster.id);

    setSelectedRosterIds(matchingRosterIds);
    e.target.value = "";

    if (matchingRosterIds.length > 0) {
      toast.success(
        `Selected ${matchingRosterIds.length} rosters for the selected period`,
      );
    } else {
      toast.info("No rosters found in the selected period");
    }
  };

  const handleBulkStatusUpdate = async (status) => {
    if (selectedRosterIds.length === 0) return;

    setBulkUpdating(true);
    try {
      const response = await rosterService.bulkStatusUpdate({
        roster_ids: selectedRosterIds,
        status: status,
      });

      if (
        response.data?.success ||
        response.status === 200 ||
        response.status === 201
      ) {
        toast.success(
          `Successfully updated ${selectedRosterIds.length} rosters to ${status}`,
        );
        setSelectedRosterIds([]);
        fetchData();
      } else {
        toast.error(
          response.data?.message || "Failed to update rosters status",
        );
      }
    } catch (error) {
      console.error("Error bulk updating status:", error);
      toast.error(
        error.response?.data?.message ||
          "An error occurred while bulk updating status",
      );
    } finally {
      setBulkUpdating(false);
    }
  };

  const handleExport = () => {
    // Using top-level weekDates
    const weekRange = `${weekDates[0].toLocaleDateString()} - ${weekDates[weekDates.length - 1].toLocaleDateString()}`;

    const csvContent = [
      [`Weekly Roster Report - ${weekRange}`],
      [`Generated: ${new Date().toLocaleString()}`],
      [`Total Hours: ${weeklyTotals.totalHours}`],
      [`Total Amount: ${formatCurrency(weeklyTotals.totalAmount)}`],
      [`Average Rate: ${formatCurrency(weeklyTotals.averageRate)}/hr`],
      [],
      ["Employee", "Room", "Shift", "Date", "Hours", "Rate", "Amount"],
      ...rosters
        .filter((roster) => {
          if (!roster.roster_date) return false;
          const rosterDate =
            typeof roster.roster_date === "string"
              ? roster.roster_date.split("T")[0]
              : formatLocalDate(new Date(roster.roster_date));
          const weekStart = formatLocalDate(weekDates[0]);
          const weekEnd = formatLocalDate(weekDates[weekDates.length - 1]);
          return rosterDate >= weekStart && rosterDate <= weekEnd;
        })
        .map((roster) => {
          const employee =
            roster.employee ||
            employees.find((e) => e.id === roster.employee_id);
          const shift =
            roster.shift || shifts.find((s) => s.id === roster.shift_id);
          const hours = calculateNetWorkingHours(shift);
          const rate = employee ? getEmployeeRate(employee) : 25;
          const amount = hours * rate;

          const dept = departments.find(
            (d) => d.id === employee?.department_id,
          );

          return [
            employee
              ? `${employee.first_name || ""} ${employee.last_name || ""}`.trim()
              : "Unknown",
            dept?.name || "N/A",
            shift?.name || "N/A",
            new Date(roster.roster_date).toLocaleDateString(),
            hours.toFixed(2),
            formatCurrency(rate),
            formatCurrency(amount),
          ];
        }),
      [],
      ["WEEKLY TOTALS"],
      ["Total Hours", weeklyTotals.totalHours.toFixed(2)],
      ["Total Amount", formatCurrency(weeklyTotals.totalAmount)],
      ["Average Rate", formatCurrency(weeklyTotals.averageRate)],
      ["Unique Employees", weeklyTotals.uniqueEmployees || 0],
      [],
      ["TOTALS BY ROOM"],
      ["Room", "Hours", "Amount", "Employees"],
      ...Object.entries(weeklyTotals.byDepartment).map(([id, data]) => [
        data.name,
        data.hours.toFixed(2),
        formatCurrency(data.amount),
        data.employeeCount || 0,
      ]),
      [],
      ["TOTALS BY EMPLOYEE"],
      ["Employee", "Hours", "Amount", "Rate", "Room"],
      ...Object.entries(weeklyTotals.byEmployee).map(([id, data]) => {
        const dept = departments.find((d) => d.id === data.department);
        return [
          data.name,
          data.hours.toFixed(2),
          formatCurrency(data.amount),
          formatCurrency(data.rate || 25),
          dept?.name || "N/A",
        ];
      }),
    ]
      .map((row) => (Array.isArray(row) ? row.join(",") : row))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `roster_report_${formatLocalDate(new Date())}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Report exported successfully!");
  };

  const handlePrint = () => {
    window.print();
  };

  // Drag and Drop Event Handlers
  const handleDragStart = (e, roster) => {
    setDraggedRoster(roster);
    e.dataTransfer.effectAllowed = "copyMove";
    e.dataTransfer.setData("text/plain", roster.id.toString());
  };

  const handleDragOver = (e, employeeId, dateStr) => {
    e.preventDefault();
    if (!draggedRoster) return;

    const sourceEmployeeId =
      draggedRoster.employee_id || draggedRoster.employee?.id;
    const sourceDateStr =
      typeof draggedRoster.roster_date === "string"
        ? draggedRoster.roster_date.split("T")[0]
        : formatLocalDate(new Date(draggedRoster.roster_date));

    if (sourceEmployeeId === employeeId && sourceDateStr === dateStr) {
      return;
    }

    setDragOverCell({ employeeId, dateStr });
  };

  const handleDragLeave = () => {
    setDragOverCell(null);
  };

  const handleDrop = (e, employeeId, date) => {
    e.preventDefault();
    setDragOverCell(null);

    if (!draggedRoster) return;

    const dateStr = formatLocalDate(date);
    const sourceEmployeeId =
      draggedRoster.employee_id || draggedRoster.employee?.id;
    const sourceDateStr =
      typeof draggedRoster.roster_date === "string"
        ? draggedRoster.roster_date.split("T")[0]
        : formatLocalDate(new Date(draggedRoster.roster_date));

    if (sourceEmployeeId === employeeId && sourceDateStr === dateStr) {
      setDraggedRoster(null);
      return;
    }

    setDropTarget({ employeeId, date, dateStr });
    setShowDropChoiceModal(true);
  };

  const handleExecuteMove = async () => {
    if (!draggedRoster || !dropTarget) return;

    try {
      setShowDropChoiceModal(false);
      const payload = {
        roster_id: draggedRoster.id,
        target_employee_id: dropTarget.employeeId,
        target_roster_date: dropTarget.dateStr,
      };

      const response = await rosterService.moveRoster(payload);
      if (
        response.data?.success ||
        response.status === 200 ||
        response.status === 201
      ) {
        toast.success("Roster moved successfully!");
        fetchData();
      } else {
        toast.error("Failed to move roster.");
      }
    } catch (error) {
      console.error("Error moving roster:", error);
      toast.error(error.response?.data?.message || "Error moving roster.");
    } finally {
      setDraggedRoster(null);
      setDropTarget(null);
    }
  };

  const handleExecuteCopy = async () => {
    if (!draggedRoster || !dropTarget) return;

    try {
      setShowDropChoiceModal(false);
      const payload = {
        roster_id: draggedRoster.id,
        target_employee_id: dropTarget.employeeId,
        target_roster_date: dropTarget.dateStr,
      };

      const response = await rosterService.copyRoster(payload);
      if (
        response.data?.success ||
        response.status === 200 ||
        response.status === 201
      ) {
        toast.success("Roster copied successfully!");
        fetchData();
      } else {
        toast.error("Failed to copy roster.");
      }
    } catch (error) {
      console.error("Error copying roster:", error);
      toast.error(error.response?.data?.message || "Error copying roster.");
    } finally {
      setDraggedRoster(null);
      setDropTarget(null);
    }
  };

  // Real-time calculation of total working time based on start, end, break times and grace minutes
  useEffect(() => {
    const { start_time, end_time, break_start, break_end } = formData;
    if (start_time && end_time) {
      const [sH, sM] = start_time.split(":").map(Number);
      const [eH, eM] = end_time.split(":").map(Number);
      let durationMins = eH * 60 + eM - (sH * 60 + sM);
      if (durationMins < 0) durationMins += 24 * 60; // overnight support

      let breakMins = 0;
      if (break_start && break_end) {
        const [bsH, bsM] = break_start.split(":").map(Number);
        const [beH, beM] = break_end.split(":").map(Number);
        breakMins = beH * 60 + beM - (bsH * 60 + bsM);
        if (breakMins < 0) breakMins += 24 * 60;
      }

      const totalWorkingMins = Math.max(0, durationMins - breakMins);
      const hrs = Math.floor(totalWorkingMins / 60);
      const mins = totalWorkingMins % 60;
      const workingTimeStr = `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;

      if (formData.total_working_time !== workingTimeStr) {
        setFormData((prev) => ({
          ...prev,
          total_working_time: workingTimeStr,
        }));
      }
    }
  }, [
    formData.start_time,
    formData.end_time,
    formData.break_start,
    formData.break_end,
    formData.total_working_time,
  ]);

  const handleAddRoster = (date, employeeId, employee) => {
    setModalMode("add");
    setSelectedDate(date);
    setSelectedEmployee(employeeId);

    const formattedDate = formatLocalDate(date);

    setFormData({
      employee_ids: employeeId ? [employeeId] : [],
      shift_id: "",
      from_date: formattedDate,
      to_date: formattedDate,
      start_time: "",
      end_time: "",
      break_start: "",
      break_end: "",
      break_grace_minutes: 0,
      total_working_time: "00:00",
      status: "draft",
      notes: "",
      period_type: view === "fortnight" ? "fortnightly" : "weekly",
      department_id:
        employee?.department_id || (filters.room !== "all" ? filters.room : ""),
    });

    setShowModal(true);
  };

  const handleEditRoster = (roster) => {
    setModalMode("edit");
    setSelectedRoster(roster);
    setSelectedEmployee(roster.employee_id || roster.employee?.id);

    const formattedDate =
      typeof roster.roster_date === "string"
        ? roster.roster_date.split("T")[0]
        : formatLocalDate(new Date(roster.roster_date));

    const formatTimeField = (time) => {
      if (!time) return "";
      return time.substring(0, 5);
    };

    setFormData({
      employee_ids: [roster.employee_id || roster.employee?.id],
      shift_id: roster.shift_id || roster.shift?.id || "",
      from_date: formattedDate,
      to_date: formattedDate,
      start_time: formatTimeField(
        roster.start_time || roster.shift?.start_time,
      ),
      end_time: formatTimeField(roster.end_time || roster.shift?.end_time),
      break_start: formatTimeField(
        roster.break_start || roster.shift?.break_start,
      ),
      break_end: formatTimeField(roster.break_end || roster.shift?.break_end),
      break_grace_minutes:
        roster.break_grace_minutes || roster.shift?.break_grace_minutes || 0,
      total_working_time: roster.total_working_time || "00:00",
      status: roster.status || "draft",
      notes: roster.notes || "",
      period_type: "weekly",
      department_id:
        roster.department_id || roster.employee?.department_id || "",
    });

    setShowModal(true);
  };

  const handlePeriodTypeChange = (e) => {
    const val = e.target.value;
    setFormData((prev) => {
      const fromDate = prev.from_date ? new Date(prev.from_date) : new Date();
      const toDate = new Date(fromDate);
      if (val === "fortnightly") {
        toDate.setDate(fromDate.getDate() + 11);
      } else {
        toDate.setDate(fromDate.getDate() + 4);
      }
      return {
        ...prev,
        period_type: val,
        to_date: formatLocalDate(toDate),
      };
    });
  };

  const handleFromDateChange = (e) => {
    const fromDateStr = e.target.value;
    setFormData((prev) => {
      const fromDate = new Date(fromDateStr);
      if (isNaN(fromDate.getTime())) {
        return { ...prev, from_date: fromDateStr };
      }
      const toDate = new Date(fromDate);
      if (prev.period_type === "fortnightly") {
        toDate.setDate(fromDate.getDate() + 11);
      } else {
        toDate.setDate(fromDate.getDate() + 4);
      }
      return {
        ...prev,
        from_date: fromDateStr,
        to_date: formatLocalDate(toDate),
      };
    });
  };

  const handleDepartmentChange = async (e) => {
    const value = e.target.value;
    
    // First, update the state so UI reflects the selection
    setFormData((prev) => ({ ...prev, department_id: value }));

    // If we have exactly one employee, call the assign API
    if (formData.employee_ids.length === 1 && value) {
      const empId = formData.employee_ids[0];
      try {
        const response = await rosterService.assignDepartmentToEmployee({
          employee_id: empId.toString(),
          department_id: value.toString(),
        });
        if (response.data?.success) {
          toast.success(response.data?.message || "Department assigned successfully");
          // Refresh list of employees / rosters since department change may affect grouping/filters
          fetchData();
        } else {
          toast.error(response.data?.message || "Failed to assign department");
        }
      } catch (error) {
        console.error("Error assigning department to employee:", error);
        toast.error(error.response?.data?.message || "Error assigning department to employee");
      }
    }
  };

  // Fetch department by employee when exactly 1 employee is selected
  useEffect(() => {
    if (showModal && formData.employee_ids.length === 1) {
      const empId = formData.employee_ids[0];
      const fetchEmployeeDept = async () => {
        try {
          const response = await rosterService.getDepartmentByEmployee(empId);
          if (response.data?.success && response.data?.data) {
            setFormData((prev) => ({
              ...prev,
              department_id: response.data.data.id?.toString() || "",
            }));
          } else {
            setFormData((prev) => ({
              ...prev,
              department_id: "",
            }));
          }
        } catch (error) {
          console.error("Error fetching employee department:", error);
          setFormData((prev) => ({
            ...prev,
            department_id: "",
          }));
        }
      };
      fetchEmployeeDept();
    } else if (showModal && formData.employee_ids.length !== 1) {
      // Clear department if employee selection is cleared or multiple selected
      setFormData((prev) => {
        if (prev.department_id !== "") {
          return { ...prev, department_id: "" };
        }
        return prev;
      });
    }
  }, [showModal, formData.employee_ids]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "shift_id" && value) {
      const selectedShift = shifts.find((s) => s.id === parseInt(value));
      if (selectedShift) {
        const formatTimeField = (time) => {
          if (!time) return "";
          return time.substring(0, 5);
        };

        setFormData((prev) => ({
          ...prev,
          shift_id: value,
          start_time: formatTimeField(selectedShift.start_time),
          end_time: formatTimeField(selectedShift.end_time),
          break_start: formatTimeField(selectedShift.break_start),
          break_end: formatTimeField(selectedShift.break_end),
          break_grace_minutes: selectedShift.break_grace_minutes || 0,
        }));
        return;
      }
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.employee_ids.length === 0) {
      toast.error("Please select at least one employee");
      return;
    }

    try {
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      const creatorId = user?.id || 95;

      const rosterData = {
        employee_ids: formData.employee_ids.map(Number),
        organization_id: selectedOrganization.id,
        from_date: formData.from_date,
        to_date: formData.to_date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        break_start: formData.break_start || null,
        break_end: formData.break_end || null,
        break_grace_minutes: parseInt(formData.break_grace_minutes) || 0,
        total_working_time: formData.total_working_time,
        status: formData.status,
        notes: formData.notes || "",
        created_by: creatorId,
      };

      if (formData.shift_id) {
        rosterData.shift_id = parseInt(formData.shift_id);
      }

      if (formData.department_id) {
        rosterData.department_id = parseInt(formData.department_id);
      }

      // API update: POST /rosters serves both create & update operations
      const response = await rosterService.createRoster(rosterData);

      if (
        response.data?.success ||
        response.status === 200 ||
        response.status === 201
      ) {
        toast.success(
          `Roster ${modalMode === "add" ? "created" : "updated"} successfully!`,
        );
        fetchData();
        setShowModal(false);

        setFormData({
          employee_ids: [],
          shift_id: "",
          from_date: "",
          to_date: "",
          start_time: "",
          end_time: "",
          break_start: "",
          break_end: "",
          break_grace_minutes: 0,
          total_working_time: "00:00",
          status: "draft",
          notes: "",
          period_type: "weekly",
          department_id: "",
        });
      } else {
        toast.error(`Failed to ${modalMode} roster`);
      }
    } catch (error) {
      console.error("Error saving roster:", error);
      if (error.response) {
        toast.error(
          error.response.data?.message || `Failed to ${modalMode} roster`,
        );
      } else {
        toast.error("Failed to save roster");
      }
    }
  };

  const handleDeleteRoster = async (rosterId) => {
    if (window.confirm("Are you sure you want to delete this roster entry?")) {
      try {
        const response = await rosterService.deleteRoster(rosterId);
        if (response.data?.success) {
          toast.success("Roster deleted successfully");
          fetchData();
        } else {
          toast.error("Failed to delete roster");
        }
      } catch (error) {
        console.error("Error deleting roster:", error);
        toast.error("Failed to delete roster");
      }
    }
  };

  const getEmployeeName = useCallback(
    (employeeId) => {
      const employee =
        employees.find((emp) => emp.id === employeeId) ||
        rosters.find((r) => r.employee?.id === employeeId)?.employee;
      return employee
        ? `${employee.first_name || ""} ${employee.last_name || ""}`.trim()
        : "Unknown Employee";
    },
    [employees, rosters],
  );

  // If no organization is selected
  if (!selectedOrganization?.id) {
    return (
      <div
        className="p-6 min-h-screen flex items-center justify-center transition-colors duration-300"
        style={{ backgroundColor }}
      >
        <div className="text-center">
          <FaCalendarAlt className="text-6xl text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">
            No Organization Selected
          </h2>
          <p className="text-gray-600 mb-4">
            Please select an organization to view rosters
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div
        className="p-6 min-h-screen transition-colors duration-300"
        style={{ backgroundColor }}
      >
        <div className="max-w-full mx-auto px-4 md:px-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-24 bg-gray-300 rounded shadow-sm animate-pulse transition-all"
                ></div>
              ))}
            </div>
            <div className="h-64 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Using top-level weekDates and monthDates

  return (
    <>
      {/* Floating Action Banner for Bulk Roster Status Update */}
      {selectedRosterIds.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-slate-800 text-white px-6 py-4 rounded-2xl shadow-2xl flex flex-col sm:flex-row items-center gap-4 transition-all duration-300">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-indigo-500 animate-ping shrink-0" />
            <span className="text-sm font-semibold tracking-wide">
              {selectedRosterIds.length} rosters selected
            </span>
          </div>
          <div className="hidden sm:block h-6 w-px bg-slate-800" />
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkStatusUpdate("published")}
              disabled={bulkUpdating}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-900/35 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            >
              Publish Selected
            </button>
            <button
              onClick={() => handleBulkStatusUpdate("draft")}
              disabled={bulkUpdating}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-red-900/35 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            >
              Move to Draft
            </button>
            <button
              onClick={handleDeselectAll}
              disabled={bulkUpdating}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Color Palette Button - Same as Dashboard */}
      <button
        onClick={() => setIsColorPaletteOpen(true)}
        className="fixed right-6 bottom-6 bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-xl transition-all z-50"
      >
        <ColorPaletteIcon />
      </button>

      {/* Color Palette Modal */}
      <ColorPaletteModal
        isOpen={isColorPaletteOpen}
        onClose={() => setIsColorPaletteOpen(false)}
        onSidebarColorSelect={(color) => {
          // console.log('Setting sidebar color to:', color);
          setSidebarColor(color);
          localStorage.setItem("sidebarColor", color);
        }}
        onBackgroundColorSelect={(color) => {
          //console.log('Setting background color to:', color);
          setBackgroundColor(color);
          localStorage.setItem("backgroundColor", color);
        }}
        currentSidebarColor={sidebarColor}
        currentBgColor={backgroundColor}
      />

      <div
        className="p-2 sm:p-4 md:p-6 lg:p-6 min-h-screen font-sans transition-colors duration-300 max-w-[100vw] overflow-x-hidden"
        style={{ backgroundColor }}
      >
        <ToastContainer position="top-right" autoClose={3000} />

        {/* Add/Edit Roster Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-65 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-hidden flex flex-col border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex justify-between items-center shadow-sm">
                <div>
                  <h2 className="text-xl font-bold tracking-tight">
                    {modalMode === "add"
                      ? "Create New Roster"
                      : "Update Roster Entry"}
                  </h2>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {modalMode === "add"
                      ? "Assign shift schedule to one or more employees"
                      : "Modify shift schedule details for the selected employee"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-2 rounded-full cursor-pointer"
                >
                  <FaTimes />
                </button>
              </div>

              <form
                onSubmit={handleSubmit}
                className="flex-1 overflow-y-auto p-6 space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Column: Employees & Dates */}
                  <div className="space-y-6">
                    {/* Employee Selection */}
                    <div>
                      <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-3">
                        Employee Assignment
                      </h3>
                      {selectedEmployee ? (
                        (() => {
                          const empObj = employees.find(
                            (e) => e.id === selectedEmployee,
                          );
                          const fInit = (
                            (empObj?.first_name || "").split(" ")[0]?.[0] || ""
                          ).toUpperCase();
                          const lInit = (
                            (empObj?.last_name || "").split(" ")[0]?.[0] || ""
                          ).toUpperCase();
                          return (
                            /* Particular employee (disabled selection) */
                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-base shadow-sm">
                                {fInit}
                                {lInit}
                              </div>
                              <div>
                                <div className="font-bold text-slate-800 text-sm">
                                  {getEmployeeName(selectedEmployee)}
                                </div>
                                <div className="text-xs text-slate-500">
                                  Direct cell assignment (Locked)
                                </div>
                              </div>
                            </div>
                          );
                        })()
                      ) : (
                        /* Multiple employee selection */
                        <div className="space-y-3">
                          <div className="relative">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Search employees..."
                              value={empSearchQuery}
                              onChange={(e) =>
                                setEmpSearchQuery(e.target.value)
                              }
                              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div className="border border-gray-200 rounded-xl overflow-hidden bg-slate-50">
                            {/* Select options control */}
                            <div className="flex justify-between items-center px-4 py-2 border-b bg-white text-xs text-slate-600 font-medium">
                              <span>
                                {formData.employee_ids.length} selected
                              </span>
                              <div className="flex gap-3">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFormData((prev) => ({
                                      ...prev,
                                      employee_ids: employees.map((e) => e.id),
                                    }));
                                  }}
                                  className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                                >
                                  Select All
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFormData((prev) => ({
                                      ...prev,
                                      employee_ids: [],
                                    }));
                                  }}
                                  className="text-slate-500 hover:text-slate-700 font-semibold cursor-pointer"
                                >
                                  Clear
                                </button>
                              </div>
                            </div>

                            <div className="max-h-56 overflow-y-auto p-2 space-y-1">
                              {employees
                                .filter((emp) => {
                                  const name =
                                    `${emp.first_name || ""} ${emp.last_name || ""}`.toLowerCase();
                                  return name.includes(
                                    empSearchQuery.toLowerCase(),
                                  );
                                })
                                .map((emp) => {
                                  const isChecked =
                                    formData.employee_ids.includes(emp.id);
                                  return (
                                    <label
                                      key={emp.id}
                                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-white transition-colors cursor-pointer text-sm text-slate-700"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => {
                                          setFormData((prev) => {
                                            const ids =
                                              prev.employee_ids.includes(emp.id)
                                                ? prev.employee_ids.filter(
                                                    (id) => id !== emp.id,
                                                  )
                                                : [
                                                    ...prev.employee_ids,
                                                    emp.id,
                                                  ];
                                            return {
                                              ...prev,
                                              employee_ids: ids,
                                            };
                                          });
                                        }}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                                      />
                                      <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px] shrink-0">
                                        {(
                                          (emp.first_name || "").split(
                                            " ",
                                          )[0]?.[0] || ""
                                        ).toUpperCase()}
                                        {(
                                          (emp.last_name || "").split(
                                            " ",
                                          )[0]?.[0] || ""
                                        ).toUpperCase()}
                                      </div>
                                      <span className="font-medium text-slate-800">
                                        {emp.first_name || ""}{" "}
                                        {emp.last_name || ""}
                                      </span>
                                    </label>
                                  );
                                })}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Room/Department Selection */}
                    {formData.employee_ids.length === 1 && (
                      <div>
                        <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-3">
                          Room / Department
                        </h3>
                        <select
                          name="department_id"
                          value={formData.department_id}
                          onChange={handleDepartmentChange}
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          required
                        >
                          <option value="">-- Choose Room / Department --</option>
                          {departments.map((dept) => (
                            <option key={dept.id} value={dept.id}>
                              {dept.name}{" "}
                              {dept.age_group ? `(${dept.age_group})` : ""}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Date Range Selection */}
                    <div>
                      <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-3">
                        Roster Period
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">
                            Period Type
                          </label>
                          <select
                            name="period_type"
                            value={formData.period_type || "weekly"}
                            onChange={handlePeriodTypeChange}
                            className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          >
                            <option value="weekly">Weekly</option>
                            <option value="fortnightly">Fortnightly</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">
                            From Date
                          </label>
                          <input
                            type="date"
                            name="from_date"
                            value={formData.from_date}
                            onChange={handleFromDateChange}
                            className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">
                            To Date
                          </label>
                          <input
                            type="date"
                            name="to_date"
                            value={formData.to_date}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Roster Status & Notes */}
                    <div className="space-y-4 pt-2">
                      <div>
                        <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                          Status
                        </label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 text-sm text-slate-700 font-medium cursor-pointer">
                            <input
                              type="radio"
                              name="status"
                              value="draft"
                              checked={formData.status === "draft"}
                              onChange={handleInputChange}
                              className="text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                            />
                            Draft (Internal Only)
                          </label>
                          <label className="flex items-center gap-2 text-sm text-slate-700 font-medium cursor-pointer">
                            <input
                              type="radio"
                              name="status"
                              value="published"
                              checked={formData.status === "published"}
                              onChange={handleInputChange}
                              className="text-green-600 focus:ring-green-500 w-4 h-4 cursor-pointer"
                            />
                            Published (Visible to Staff)
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-800 mb-1">
                          Notes / Instructions
                        </label>
                        <textarea
                          name="notes"
                          value={formData.notes}
                          onChange={handleInputChange}
                          rows="3"
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Optional notes for employees..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Shift, Times, Calculations */}
                  <div className="space-y-6">
                    {/* Shift Selector */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-semibold text-slate-800">
                          Predefined Shift (Optional)
                        </label>
                        <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                          Autofills times
                        </span>
                      </div>
                      <select
                        name="shift_id"
                        value={formData.shift_id}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        <option value="">
                          -- Customize Manually / Choose Shift --
                        </option>
                        {shifts.map((shift) => {
                          const hours = calculateNetWorkingHours(shift);
                          return (
                            <option key={shift.id} value={shift.id}>
                              {shift.name} ({formatTime(shift.start_time)} -{" "}
                              {formatTime(shift.end_time)})
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-3">
                      Shift Timing & Break Configuration
                    </h3>

                    {/* Start & End Times */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                          Start Time
                        </label>
                        <input
                          type="time"
                          name="start_time"
                          value={formData.start_time}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                          End Time
                        </label>
                        <input
                          type="time"
                          name="end_time"
                          value={formData.end_time}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          required
                        />
                      </div>
                    </div>

                    {/* Break Start & End Times */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                          Break Start (Optional)
                        </label>
                        <input
                          type="time"
                          name="break_start"
                          value={formData.break_start}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                          Break End (Optional)
                        </label>
                        <input
                          type="time"
                          name="break_end"
                          value={formData.break_end}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                      </div>
                    </div>

                    {/* Break Grace Minutes */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Break Grace Minutes
                      </label>
                      <input
                        type="number"
                        name="break_grace_minutes"
                        value={formData.break_grace_minutes}
                        onChange={handleInputChange}
                        min="0"
                        placeholder="e.g. 15"
                        className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                    </div>

                    {/* Computation Dashboard */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 shadow-inner">
                      <div className="flex justify-between items-center text-sm font-semibold text-slate-700">
                        <span>Calculated Break Total:</span>
                        <span className="text-blue-600">
                          {(() => {
                            if (formData.break_start && formData.break_end) {
                              const [bsH, bsM] = formData.break_start
                                .split(":")
                                .map(Number);
                              const [beH, beM] = formData.break_end
                                .split(":")
                                .map(Number);
                              let breakMins = beH * 60 + beM - (bsH * 60 + bsM);
                              if (breakMins < 0) breakMins += 24 * 60;
                              return breakMins >= 60
                                ? `${(breakMins / 60).toFixed(1)} hrs`
                                : `${breakMins} mins`;
                            }
                            return "0 mins";
                          })()}
                        </span>
                      </div>
                      <div className="border-t border-slate-200 my-2"></div>
                      <div className="flex justify-between items-center text-sm font-bold text-slate-800">
                        <span>Total Net Working Time:</span>
                        <span className="text-emerald-600 text-base">
                          {formData.total_working_time} hours
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-blue-200 hover:shadow-lg cursor-pointer"
                  >
                    {modalMode === "add" ? "Create Roster" : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Drag and Drop Move/Copy Choice Modal */}
        {showDropChoiceModal && draggedRoster && dropTarget && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="px-6 py-4 bg-gradient-to-r from-indigo-900 to-indigo-850 text-white flex justify-between items-center shadow-sm">
                <div>
                  <h2 className="text-lg font-bold tracking-tight">
                    Roster Action Required
                  </h2>
                  <p className="text-xs text-indigo-200 mt-0.5">
                    Choose how to assign the dropped roster entry
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowDropChoiceModal(false);
                    setDraggedRoster(null);
                    setDropTarget(null);
                  }}
                  className="text-indigo-300 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-2 rounded-full cursor-pointer"
                >
                  <FaTimes />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                {/* Visual Flow diagram */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center text-xs text-slate-500 font-medium">
                    <span>SOURCE CELL</span>
                    <span className="text-blue-500 font-bold">➔</span>
                    <span>TARGET CELL</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-bold text-slate-800 truncate">
                        {getEmployeeName(
                          draggedRoster.employee_id ||
                            draggedRoster.employee?.id,
                        )}
                      </div>
                      <div className="text-xs text-slate-500">
                        {new Date(draggedRoster.roster_date).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                          },
                        )}
                      </div>
                    </div>

                    <div className="text-right border-l border-slate-200 pl-4">
                      <div className="font-bold text-slate-800 truncate">
                        {getEmployeeName(dropTarget.employeeId)}
                      </div>
                      <div className="text-xs text-slate-500">
                        {dropTarget.date.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-2 text-xs text-slate-600 flex justify-between">
                    <span>Shift hours:</span>
                    <span className="font-semibold text-slate-800">
                      {draggedRoster.start_time?.substring(0, 5) || "NA"} -{" "}
                      {draggedRoster.end_time?.substring(0, 5) || "NA"}
                    </span>
                  </div>
                </div>

                {/* Choices Buttons */}
                <div className="space-y-3 pt-2">
                  <button
                    type="button"
                    onClick={handleExecuteMove}
                    className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold shadow-md shadow-blue-100 hover:shadow-lg transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <FaExchangeAlt className="text-lg opacity-90" />
                      <div className="text-left">
                        <div className="text-sm">Move Roster</div>
                        <div className="text-[10px] text-blue-100 font-normal">
                          Shifts location to the new employee / date
                        </div>
                      </div>
                    </div>
                    <span className="text-sm group-hover:translate-x-1 transition-transform">
                      ➔
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExecuteCopy}
                    className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl font-semibold shadow-md shadow-emerald-100 hover:shadow-lg transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <FaCopy className="text-lg opacity-90" />
                      <div className="text-left">
                        <div className="text-sm">Copy Roster</div>
                        <div className="text-[10px] text-emerald-100 font-normal">
                          Duplicates entry, leaving source intact
                        </div>
                      </div>
                    </div>
                    <span className="text-sm group-hover:translate-x-1 transition-transform">
                      ➔
                    </span>
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowDropChoiceModal(false);
                    setDraggedRoster(null);
                    setDropTarget(null);
                  }}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors shadow-sm cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-full mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                  <FaCalendarAlt className="mr-3 text-blue-600" />
                  {view === "week" ? "Weekly Rosters" : "Fortnightly Rosters"}
                </h1>
                <p className="text-gray-600 mt-1">
                  <span className="font-medium">Organization:</span>{" "}
                  {selectedOrganization.name}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <FaSync className={refreshing ? "animate-spin" : ""} />
                  {refreshing ? "Refreshing..." : "Refresh"}
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            {/* Card 1 */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Staff Scheduled
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-slate-800 tracking-tight">
                      {weeklyTotals.uniqueEmployees || 0}
                    </span>
                    <span className="text-sm font-semibold text-slate-400">
                      / {employees.length}
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100">
                  <FaUsers className="text-indigo-600 text-xl" />
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Total Hours
                  </p>
                  <p className="text-3xl font-extrabold text-slate-800 tracking-tight">
                    {weeklyTotals.totalHours.toFixed(2)}h
                  </p>
                </div>
                <div className="p-3 bg-sky-50/60 rounded-xl border border-sky-100">
                  <FaClock className="text-sky-600 text-xl" />
                </div>
              </div>
            </div>
          </div>

          {/* Controls & Filter Center */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Left: View Mode Toggle & Navigation */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Segmented control for Weekly/Fortnightly */}
              <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200">
                <button
                  onClick={() => setView("week")}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    view === "week"
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Weekly View
                </button>
                <button
                  onClick={() => setView("fortnight")}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    view === "fortnight"
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Fortnightly View
                </button>
              </div>

              {/* Date Navigation */}
              <div className="flex items-center gap-2 bg-slate-50 rounded-xl border border-slate-200 p-1">
                <button
                  onClick={() => navigateDate("prev")}
                  className="p-2 hover:bg-white rounded-lg transition-colors cursor-pointer text-slate-600 hover:text-slate-800 hover:shadow-sm"
                  title="Previous Period"
                >
                  <FaChevronLeft className="text-xs" />
                </button>
                <div className="px-3 text-xs font-bold text-slate-700 select-none">
                  {weekDates.length > 0
                    ? `${weekDates[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${weekDates[weekDates.length - 1].toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                    : ""}
                </div>
                <button
                  onClick={() => navigateDate("next")}
                  className="p-2 hover:bg-white rounded-lg transition-colors cursor-pointer text-slate-600 hover:text-slate-800 hover:shadow-sm"
                  title="Next Period"
                >
                  <FaChevronRight className="text-xs" />
                </button>
              </div>
            </div>

            {/* Right: Actions and Filters */}
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              {/* Search Bar */}
              <div className="relative flex-grow sm:flex-grow-0">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                <input
                  type="text"
                  placeholder="Search staff..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, search: e.target.value }))
                  }
                  className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all w-full sm:w-48"
                />
              </div>

              {/* Room filter dropdown */}
              <select
                value={filters.room}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, room: e.target.value }))
                }
                className="bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
              >
                <option value="all">All Rooms / Departments</option>
                {departments.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name}
                  </option>
                ))}
              </select>

              {/* Employee filter dropdown */}
              <select
                value={filters.employee}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, employee: e.target.value }))
                }
                className="bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
              >
                <option value="all">All Employees</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {getShortStaffName(emp.first_name, emp.last_name)}
                  </option>
                ))}
              </select>

              {/* Shift filter dropdown */}
              <select
                value={filters.shiftType}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, shiftType: e.target.value }))
                }
                className="bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
              >
                <option value="all">All Predefined Shifts</option>
                {shifts.map((shift) => (
                  <option key={shift.id} value={shift.id}>
                    {shift.name}
                  </option>
                ))}
              </select>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 ml-auto lg:ml-0">
                {canEditRoster && (
                  <>
                    <select
                      onChange={handlePeriodSelectionChange}
                      className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200/50 px-3 py-2 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer focus:outline-none"
                      defaultValue=""
                    >
                      <option value="" disabled>Select Period...</option>
                      {view === "week" ? (
                        <option value="week">Current Week</option>
                      ) : (
                        <>
                          <option value="week1">Week 1 (First 5 Days)</option>
                          <option value="week2">Week 2 (Second 5 Days)</option>
                          <option value="fortnight">Full Fortnight</option>
                        </>
                      )}
                      <option value="clear">Clear Selections</option>
                    </select>

                    <button
                      onClick={
                        selectedRosterIds.length > 0
                          ? handleDeselectAll
                          : handleSelectAll
                      }
                      className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200/50 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
                      title={
                        selectedRosterIds.length > 0
                          ? "Clear all selections"
                          : "Select all visible rosters"
                      }
                    >
                      <FaUsers className="text-[10px]" />{" "}
                      {selectedRosterIds.length > 0
                        ? "Deselect All"
                        : "Select All"}
                    </button>
                  </>
                )}
                <button
                  onClick={handleExport}
                  className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/50 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
                  title="Export to CSV"
                >
                  <FaDownload className="text-[10px]" /> Export
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/50 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
                  title="Print Roster Grid"
                >
                  <FaPrint className="text-[10px]" /> Print
                </button>
                {canAddRoster && (
                  <button
                    onClick={() => {
                      setModalMode("add");
                      setSelectedEmployee(null);
                      setFormData({
                        employee_ids: [],
                        shift_id: "",
                        from_date: formatLocalDate(weekDates[0]),
                        to_date: formatLocalDate(
                          weekDates[weekDates.length - 1],
                        ),
                        start_time: "",
                        end_time: "",
                        break_start: "",
                        break_end: "",
                        break_grace_minutes: 0,
                        total_working_time: "00:00",
                        status: "draft",
                        notes: "",
                        period_type:
                          view === "fortnight" ? "fortnightly" : "weekly",
                        department_id:
                          filters.room !== "all" ? filters.room : "",
                      });
                      setShowModal(true);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-100 hover:shadow-lg transition-all cursor-pointer"
                  >
                    <FaPlus className="text-[10px]" /> Add Roster
                  </button>
                )}
              </div>
            </div>
          </div>
          {/* Roster Grid View */}
          {(view === "week" || view === "fortnight") && (
            <div
              className="bg-white rounded-lg shadow-xl border border-gray-300 relative overflow-x-auto w-full"
              style={{ maxWidth: "100%" }}
            >
              {(() => {
                const isFN = weekDates.length > 5;
                const posW = isFN ? 100 : 150;
                const nameW = isFN ? 120 : 180;
                const dateMin = isFN ? 100 : 110;
                const totalW = isFN ? 70 : 90;
                const fixedW = posW + nameW + totalW;
                const colTemplate = `${posW}px ${nameW}px repeat(${weekDates.length}, minmax(${dateMin}px, 1fr)) ${totalW}px`;
                const minW = `${fixedW + weekDates.length * dateMin}px`;
                return (
                  <div style={{ minWidth: minW, width: "100%" }}>
                    {/* Roster Header */}
                    <div
                      className="border-b border-gray-300 sticky top-0 shadow-md z-[5]"
                      style={{
                        display: "grid",
                        gridTemplateColumns: colTemplate,
                        height: "56px",
                        minWidth: minW,
                      }}
                    >
                      <div
                        className="p-1.5 font-bold text-white border-r border-gray-300 flex items-center justify-center text-xs lg:sticky left-0 lg:z-[3]"
                        style={{ backgroundColor: sidebarColor }}
                      >
                        Position
                      </div>
                      <div
                        className="p-1.5 font-bold text-white border-r border-gray-300 flex items-center justify-center text-xs lg:sticky lg:z-[3]"
                        style={{
                          backgroundColor: sidebarColor,
                          left: `${posW}px`,
                        }}
                      >
                        Staff
                      </div>
                      {weekDates.map((day) => (
                        <div
                          key={day.toString()}
                          className="text-center font-bold border-r border-gray-300 text-white flex flex-col justify-center py-1"
                          style={{ backgroundColor: sidebarColor }}
                        >
                          <div className="text-[11px] border-b border-[#ffffff33] pb-0.5 uppercase">
                            {day.toLocaleDateString("en-US", {
                              weekday: "short",
                            })}
                          </div>
                          <div className="text-sm pt-0.5">
                            {day.getDate()}
                            {day.getDate() === 1 ||
                            day.getDate() === 21 ||
                            day.getDate() === 31
                              ? "st"
                              : day.getDate() === 2 || day.getDate() === 22
                                ? "nd"
                                : day.getDate() === 3 || day.getDate() === 23
                                  ? "rd"
                                  : "th"}
                          </div>
                        </div>
                      ))}
                      <div
                        className="p-1.5 font-bold text-white border-l border-gray-300 flex items-center justify-center text-[10px]"
                        style={{ backgroundColor: sidebarColor }}
                      >
                        Total
                      </div>
                    </div>

                    {/* Grid Body */}
                    <div
                      className="overflow-y-auto"
                      style={{ maxHeight: "calc(85vh - 56px)" }}
                    >
                      {groupedEmployees.length > 0 ? (
                        groupedEmployees.map(([deptName, emps]) => {
                          const isCollapsed = collapsedDepartments[deptName];
                          const dept = departments.find(
                            (d) => d.name === deptName,
                          );
                          const colorCode = dept?.color_code || "#475569";
                          const textColor = getContrastColor(colorCode);

                          return (
                            <React.Fragment key={deptName}>
                              {/* Department/Room Header Row */}
                              <div
                                onClick={() =>
                                  setCollapsedDepartments((prev) => ({
                                    ...prev,
                                    [deptName]: !prev[deptName],
                                  }))
                                }
                                className="font-extrabold text-[11px] uppercase tracking-wider px-4 py-2.5 flex items-center justify-center gap-2.5 border-b border-black/10 sticky left-0 shadow-sm w-full cursor-pointer hover:opacity-95 select-none transition-all duration-200"
                                style={{
                                  backgroundColor: colorCode,
                                  color: textColor,
                                  minWidth: minW,
                                }}
                              >
                                <div className="absolute left-4 flex items-center">
                                  {isCollapsed ? (
                                    <FaChevronRight
                                      className="text-[10px]"
                                      style={{ color: textColor }}
                                    />
                                  ) : (
                                    <FaChevronDown
                                      className="text-[10px]"
                                      style={{ color: textColor }}
                                    />
                                  )}
                                </div>

                                <FaBuilding
                                  className="text-xs opacity-80"
                                  style={{ color: textColor }}
                                />
                                <span style={{ color: textColor }}>
                                  {deptName || "Unassigned"}
                                </span>
                                <span
                                  className="px-2 py-0.5 rounded-full text-[9px] font-bold normal-case tracking-normal"
                                  style={{
                                    backgroundColor:
                                      textColor === "#ffffff"
                                        ? "rgba(255, 255, 255, 0.2)"
                                        : "rgba(0, 0, 0, 0.08)",
                                    color: textColor,
                                  }}
                                >
                                  {emps.length}{" "}
                                  {emps.length === 1
                                    ? "Staff Member"
                                    : "Staff Members"}
                                </span>
                              </div>

                              {!isCollapsed &&
                                (emps.length > 0 ? (
                                  emps.map((employee) => (
                                    <EmployeeRow
                                      key={employee.id}
                                      employee={employee}
                                      weeklyTotals={weeklyTotals}
                                      getDesignationTitle={getDesignationTitle}
                                      weekDates={weekDates}
                                      getRostersForEmployeeAndDate={
                                        getRostersForEmployeeAndDate
                                      }
                                      shifts={shifts}
                                      getShiftColor={getShiftColor}
                                      canAddRoster={canAddRoster}
                                      canEditRoster={canEditRoster}
                                      handleAddRoster={handleAddRoster}
                                      handleEditRoster={handleEditRoster}
                                      handleDragStart={handleDragStart}
                                      handleDragOver={handleDragOver}
                                      handleDragLeave={handleDragLeave}
                                      handleDrop={handleDrop}
                                      dragOverCell={dragOverCell}
                                      selectedRosterIds={selectedRosterIds}
                                      setSelectedRosterIds={
                                        setSelectedRosterIds
                                      }
                                    />
                                  ))
                                ) : (
                                  <div
                                    className="p-4 text-center text-xs text-slate-400 bg-slate-50/50 italic border-b sticky left-0 w-full flex items-center justify-center gap-1.5"
                                    style={{ minWidth: minW }}
                                  >
                                    <span>
                                      No staff members in this room /
                                      department.
                                    </span>
                                  </div>
                                ))}
                            </React.Fragment>
                          );
                        })
                      ) : (
                        <div className="p-12 text-center text-gray-400 bg-gray-50">
                          <FaUsers className="mx-auto text-4xl mb-3 opacity-20" />
                          <p className="text-lg">
                            No staff members found in the selected period.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Legend & Summary Dashboard */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Shift Type Legend */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                <span className="w-1.5 h-3 bg-indigo-500 rounded-full"></span>
                Shift Color Legend
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {shifts.map((shift) => {
                  const shiftColor = getShiftColor(shift.id);
                  return (
                    <div
                      key={shift.id}
                      className="flex items-center gap-3 p-2 bg-slate-50/60 rounded-xl border border-slate-100/50 hover:bg-slate-50 transition-colors"
                    >
                      <div
                        className="w-4 h-4 rounded-lg border shadow-sm shrink-0"
                        style={{
                          backgroundColor: shiftColor.backgroundColor,
                          borderColor: shiftColor.borderColor,
                        }}
                      ></div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-700 truncate">
                          {shift.name}
                        </p>
                        {shift.start_time && shift.end_time && (
                          <p className="text-[10px] font-medium text-slate-400">
                            {formatTime(shift.start_time)} -{" "}
                            {formatTime(shift.end_time)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Summary Report Card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                  <span className="w-1.5 h-3 bg-emerald-400 rounded-full"></span>
                  Period Summary
                </h3>

                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2.5 border-b border-slate-700/50">
                    <span className="text-xs font-medium text-slate-300">
                      Staff Members
                    </span>
                    <span className="text-sm font-bold text-white">
                      {filteredEmployees.length}{" "}
                      <span className="text-[10px] font-medium text-slate-400">
                        / {employees.length} total
                      </span>
                    </span>
                  </div>

                  <div className="flex justify-between items-center pb-2.5 border-b border-slate-700/50">
                    <span className="text-xs font-medium text-slate-300">
                      Rostered Hours
                    </span>
                    <span className="text-sm font-bold text-white">
                      {weeklyTotals.totalHours.toFixed(2)}h
                    </span>
                  </div>

                  {weeklyTotals.averageRate > 0 && (
                    <div className="flex justify-between items-center pb-2.5 border-b border-slate-700/50">
                      <span className="text-xs font-medium text-slate-300">
                        Average Rate
                      </span>
                      <span className="text-sm font-bold text-white">
                        {formatCurrency(weeklyTotals.averageRate)}/hr
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-between items-end">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    Estimated Cost
                  </p>
                  <p className="text-2xl font-extrabold text-emerald-400 tracking-tight">
                    {formatCurrency(weeklyTotals.totalAmount)}
                  </p>
                </div>
                <div className="text-[10px] text-slate-400 italic">
                  Auto-calculated
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RostersPage;
