// src/components/EmployeeDashboard2.jsx
import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useTheme } from '../contexts/ThemeContext';
import {
  Icons,
  DashCard,
  CardTitle,
  Badge,
  StatCard,
  ColorPaletteModal
} from './Dashboard/DashboardShared';
import {
  CalendarDays, Briefcase, Clock, CalendarOff, Clock3, ListTodo, TrendingUp, Timer,
  Fingerprint, CheckCircle2, XCircle, LogIn, LogOut, FileText, CheckCircle, Circle,
  ArrowRight, IndianRupee, Download, Bell, Info, AlertTriangle, PartyPopper, Calendar,
  Users, ChevronLeft, ChevronRight, Building2, Wallet, Eye, FileText as FileIcon
} from "lucide-react";
import rosterService from "../services/rosterService";
import { attendanceService } from "../services/attendanceService";

// ============================================
// CALENDAR WIDGET
// ============================================
const CalendarWidget = () => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const holidays = [10, 25];
  const events = [5, 15, 20];

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(d);
  }

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const goToToday = () => {
    setYear(currentYear);
    setMonth(currentMonth);
  };

  return (
    <DashCard accentColor="#FFE66D">
      <div className="flex items-center justify-between mb-4">
        <CardTitle icon={<Icons.Calendar />}>
          {monthNames[month]} {year}
        </CardTitle>
        <div className="flex items-center gap-1">
          <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <ChevronLeft size={14} />
          </button>
          <button onClick={goToToday} className="px-2 py-1 text-[10px] font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            Today
          </button>
          <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
        {weekDays.map(day => (
          <div key={day} className="font-semibold text-gray-400 py-1">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {calendarDays.map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} className="py-1.5" />;
          }

          const isToday = day === today.getDate() && year === currentYear && month === currentMonth;
          const isHoliday = holidays.includes(day);
          const isEvent = events.includes(day);

          return (
            <div
              key={i}
              className={`py-1.5 rounded-full font-medium transition-colors text-xs ${isToday ? 'bg-blue-500 text-white font-bold shadow-sm' :
                isHoliday ? 'bg-red-100 text-red-600' :
                  isEvent ? 'bg-blue-100 text-blue-600' :
                    'text-gray-600 hover:bg-gray-100'
                }`}
            >
              {day}
            </div>
          );
        })}
      </div>

      <div className="flex justify-center gap-4 text-xs text-gray-500 mt-3 pt-2 border-t border-gray-100">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-200" />Holiday</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-200" />Event</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" />Today</span>
      </div>
    </DashCard>
  );
};

// ============================================
// ATTENDANCE CARD
// ============================================
const formatMinutes = (m) => {
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${h}h ${min}m`;
};

const dummyAttendanceData = {
  status: "punched_in",
  punchInTime: "09:02 AM",
  workedMinutes: 272,
  totalShiftMinutes: 540,
};

const StatusBadge = ({ status }) => {
  const config = {
    not_punched: { label: "Not Punched In", icon: XCircle, cls: "bg-red-100 text-red-600" },
    punched_in: { label: "Working", icon: CheckCircle2, cls: "bg-green-100 text-green-700" },
    punched_out: { label: "Completed", icon: LogOut, cls: "bg-blue-100 text-blue-700" },
  }[status];

  return (
    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.cls}`}>
      <config.icon size={13} />
      {config.label}
    </span>
  );
};

const NotPunchedView = () => (
  <div className="flex flex-col items-center gap-4 py-4">
    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
      <Fingerprint size={36} className="text-gray-400" />
    </div>
    <div className="text-center space-y-1">
      <p className="text-sm font-medium text-gray-800">You haven't punched in today</p>
      <p className="text-xs text-gray-500">Your attendance will appear here once you punch in</p>
    </div>
  </div>
);

const PunchedInView = ({ data, progress }) => (
  <div className="flex flex-col gap-4">
    <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50 border border-green-100">
      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
        <LogIn size={18} className="text-green-600" />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-800">Punched In</p>
        <p className="text-xs text-gray-500">at {data.punchInTime}</p>
      </div>
      <div className="ml-auto flex items-center gap-1 text-green-600">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
        </span>
        <span className="text-xs font-medium">Live</span>
      </div>
    </div>
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-gray-500">
        <span className="flex items-center gap-1"><Timer size={12} /> Working Hours</span>
        <span className="font-semibold text-gray-800">
          {formatMinutes(data.workedMinutes || 0)} / {formatMinutes(data.totalShiftMinutes)}
        </span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div className="bg-green-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
      </div>
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div className="text-center p-3 rounded-xl bg-blue-50 border border-blue-100">
        <Clock size={15} className="mx-auto mb-1 text-blue-500" />
        <p className="text-[10px] text-gray-500 uppercase tracking-wider">Check In</p>
        <p className="text-sm font-bold text-gray-800">{data.punchInTime}</p>
      </div>
      <div className="text-center p-3 rounded-xl bg-purple-50 border border-purple-100">
        <Timer size={15} className="mx-auto mb-1 text-purple-500" />
        <p className="text-[10px] text-gray-500 uppercase tracking-wider">Worked</p>
        <p className="text-sm font-bold text-gray-800">{formatMinutes(data.workedMinutes || 0)}</p>
      </div>
    </div>
  </div>
);

const PunchedOutView = ({ data, progress }) => (
  <div className="flex flex-col gap-4">
    <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
        <LogOut size={18} className="text-blue-600" />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-800">Punched Out</p>
        <p className="text-xs text-gray-500">at {data.punchOutTime || "—"}</p>
      </div>
    </div>
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-gray-500">
        <span className="flex items-center gap-1"><Timer size={12} /> Total Hours</span>
        <span className="font-semibold text-gray-800">
          {formatMinutes(data.workedMinutes || 0)} / {formatMinutes(data.totalShiftMinutes)}
        </span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div className="bg-blue-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
      </div>
    </div>
    <div className="grid grid-cols-3 gap-2">
      <div className="text-center p-2.5 rounded-xl bg-green-50 border border-green-100">
        <LogIn size={14} className="mx-auto mb-1 text-green-600" />
        <p className="text-[10px] text-gray-500">In</p>
        <p className="text-xs font-bold text-gray-800">{data.punchInTime}</p>
      </div>
      <div className="text-center p-2.5 rounded-xl bg-red-50 border border-red-100">
        <LogOut size={14} className="mx-auto mb-1 text-red-600" />
        <p className="text-[10px] text-gray-500">Out</p>
        <p className="text-xs font-bold text-gray-800">{data.punchOutTime || "—"}</p>
      </div>
      <div className="text-center p-2.5 rounded-xl bg-purple-50 border border-purple-100">
        <Timer size={14} className="mx-auto mb-1 text-purple-600" />
        <p className="text-[10px] text-gray-500">Total</p>
        <p className="text-xs font-bold text-gray-800">{formatMinutes(data.workedMinutes || 0)}</p>
      </div>
    </div>
  </div>
);

const AttendanceCard = () => {
  const [data] = useState(dummyAttendanceData);
  const [animatedProgress, setAnimatedProgress] = useState(0);

  const progress = data.workedMinutes ? Math.min((data.workedMinutes / data.totalShiftMinutes) * 100, 100) : 0;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedProgress(progress), 400);
    return () => clearTimeout(timer);
  }, [progress]);

  return (
    <DashCard accentColor="#4ECDC4">
      <div className="flex items-center justify-between mb-5">
        <div>
          <CardTitle icon={<Icons.Chart />}>Attendance</CardTitle>
          <p className="text-xs text-gray-500 -mt-2">Today's Status</p>
        </div>
        <StatusBadge status={data.status} />
      </div>
      {data.status === "not_punched" && <NotPunchedView />}
      {data.status === "punched_in" && <PunchedInView data={data} progress={animatedProgress} />}
      {data.status === "punched_out" && <PunchedOutView data={data} progress={animatedProgress} />}
    </DashCard>
  );
};

// ============================================
// TODAY'S SCHEDULE
// ============================================
const tasks = [
  { title: "Update API documentation", status: "completed" },
  { title: "Fix login page responsive issues", status: "completed" },
  { title: "Review pull request #142", status: "pending" },
  { title: "Deploy staging build", status: "pending" },
  { title: "Write unit tests for auth module", status: "pending" },
];

const TodayTasksCard = () => (
  <DashCard accentColor="#FFE66D">
    <div className="flex items-center justify-between mb-5">
      <CardTitle icon={<Icons.Clock />}>Tasks</CardTitle>
      <button className="text-xs text-blue-500 font-medium flex items-center gap-1 hover:gap-2 transition-all">
        View All <ArrowRight size={13} />
      </button>
    </div>
    <div className="space-y-3">
      {tasks.map((t, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
          {t.status === "completed" ? (
            <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" />
          ) : (
            <Circle size={18} className="text-gray-400 group-hover:text-blue-500 flex-shrink-0 transition-colors" />
          )}
          <span className={`text-sm ${t.status === "completed" ? "line-through text-gray-400" : "text-gray-700"}`}>
            {t.title}
          </span>
          <span className={`ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${t.status === "completed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
            }`}>
            {t.status === "completed" ? "Done" : "Pending"}
          </span>
        </div>
      ))}
    </div>
  </DashCard>
);


// ============================================
// ROSTER SECTION (MOVED TO FIRST POSITION)
// ============================================
const shiftStatusStyles = {
  normal: "bg-blue-50 text-gray-700",
  leave: "bg-red-50 text-red-600 border border-red-100",
  holiday: "bg-purple-50 text-purple-600 border border-purple-100",
  modified: "bg-yellow-50 text-amber-600 border border-yellow-100",
};

const addDaysToDate = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const getStartOfWeek = (date) => {
  const d = new Date(date);
  // Get current day (0 for Sun, 1 for Mon, etc.)
  const day = d.getDay();
  // Calculate difference to get to Monday (if Sun, go back 6, if Mon go back 0, etc.)
  const diff = d.getDate() - (day === 0 ? 6 : day - 1);
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
};

const formatDateForAPI = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDateForDisplay = (date) => {
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};

const RosterSection = ({ organizationId }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [rosterData, setRosterData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use local helper for Monday start
  const weekStart = getStartOfWeek(currentDate);

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weekDates = weekDays.map((_, i) => addDaysToDate(weekStart, i));

  const fetchRoster = async () => {
    if (!organizationId) return;

    setIsLoading(true);
    setError(null);
    try {
      const params = {
        organization_id: organizationId,
        start_date: formatDateForAPI(weekStart),
        end_date: formatDateForAPI(weekDates[6]),
      };

      const response = await rosterService.getWeeklyRoster(params);

      // Handle the nested structure correctly based on common axios patterns or user's JSON
      const data = response.data?.success ? response.data.data : (response.data || []);
      setRosterData(Array.isArray(data) ? data : []);

    } catch (err) {
      console.error("Error fetching roster:", err);
      setError("Failed to load roster data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoster();
  }, [organizationId, currentDate]);

  const handlePrevWeek = () => setCurrentDate(addDaysToDate(currentDate, -7));
  const handleNextWeek = () => setCurrentDate(addDaysToDate(currentDate, 7));

  const isTodayDate = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  // Group data by employee
  const groupedRoster = rosterData.reduce((acc, item) => {
    const empId = item.employee?.id;
    if (!empId) return acc;

    if (!acc[empId]) {
      acc[empId] = {
        name: `${item.employee.first_name || ''} ${item.employee.last_name || ''}`.trim() || 'Unknown Staff',
        position: item.employee.designation?.name || 'Employee',
        avatar: (item.employee.first_name?.[0] || '') + (item.employee.last_name?.[0] || 'E'),
        shifts: {},
        department: item.employee.department?.name || "General Staff"
      };
    }

    if (item.roster_date) {
      const d = new Date(item.roster_date);
      const dateKey = formatDateForAPI(d);
      acc[empId].shifts[dateKey] = {
        time: item.shift ? `${item.shift.start_time.substring(0, 5)} - ${item.shift.end_time.substring(0, 5)}` : "—",
        status: "normal",
        color: item.shift?.color_code,
        note: item.notes
      };
    }

    return acc;
  }, {});

  // Group employees by department for the UI
  const departments = Object.values(groupedRoster).reduce((acc, emp) => {
    const deptName = emp.department;
    if (!acc[deptName]) {
      acc[deptName] = {
        name: deptName,
        employees: []
      };
    }
    acc[deptName].employees.push(emp);
    return acc;
  }, {});

  const departmentList = Object.values(departments);

  return (
    <DashCard accentColor="#FF6B6B">
      <div className="flex items-center justify-between mb-6">
        <CardTitle icon={<Icons.Users />}>Weekly Roster</CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-medium px-3 py-1.5 rounded-lg bg-gray-100">
            {formatDateForDisplay(weekDates[0])} – {formatDateForDisplay(weekDates[6])}
          </span>
          <button
            onClick={handlePrevWeek}
            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={handleNextWeek}
            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 font-medium">Fetching weekly roster...</p>
        </div>
      ) : error ? (
        <div className="py-20 text-center">
          <p className="text-red-500 font-medium">{error}</p>
          <button onClick={fetchRoster} className="text-blue-500 text-sm mt-2 hover:underline">Try Again</button>
        </div>
      ) : departmentList.length === 0 ? (
        <div className="py-20 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-gray-200">
            <Users className="text-gray-300" size={32} />
          </div>
          <p className="text-gray-500 font-medium">No roster records for this week</p>
        </div>
      ) : (
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider pb-3 pl-3 w-[180px] min-w-[160px]">
                  <span className="flex items-center gap-1.5 font-bold">STAFF MEMBER</span>
                </th>
                {weekDates.map((date, i) => (
                  <th key={i} className="text-center pb-3 min-w-[100px]">
                    <div className={`inline-flex flex-col items-center px-3 py-1.5 rounded-xl transition-all ${isTodayDate(date) ? "bg-blue-500 text-white shadow-lg" : "text-gray-500"
                      }`}>
                      <span className="text-[10px] font-medium uppercase">{weekDays[i]}</span>
                      <span className={`text-sm font-bold ${isTodayDate(date) ? "text-white" : "text-gray-700"}`}>
                        {date.getDate()}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {departmentList.map((dept, deptIdx) => (
                <React.Fragment key={`dept-${deptIdx}`}>
                  <tr>
                    <td colSpan={8} className="pt-4 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-5 rounded-full bg-blue-500 shadow-sm" />
                        <span className="flex items-center gap-1.5 text-xs font-bold text-gray-700 uppercase tracking-wide">
                          <Building2 size={12} className="text-gray-500" />
                          {dept.name}
                        </span>
                        <div className="flex-1 h-px bg-gray-100 ml-2" />
                      </div>
                    </td>
                  </tr>
                  {dept.employees.map((emp, empIdx) => (
                    <tr key={`emp-${deptIdx}-${empIdx}`} className="group hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                      <td className="py-2.5 pl-3 pr-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-50 flex items-center justify-center text-blue-700 text-[10px] font-bold shadow-sm border border-blue-200">
                            {emp.avatar}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-gray-800 truncate">{emp.name}</p>
                            <p className="text-[10px] text-gray-500 truncate font-medium">{emp.position}</p>
                          </div>
                        </div>
                      </td>
                      {weekDates.map((date, dayIdx) => {
                        const dateKey = formatDateForAPI(date);
                        const shift = emp.shifts[dateKey];
                        const isDayOff = !shift;
                        const status = shift?.status || "normal";
                        return (
                          <td key={dayIdx} className="py-2 px-1">
                            <div
                              className={`text-center rounded-xl px-2 py-2.5 text-[11px] font-semibold transition-all shadow-sm ${isDayOff ? "bg-gray-50 text-gray-300 border border-transparent" : `${shiftStatusStyles[status]} border-l-4`
                                } ${isTodayDate(date) && !isDayOff ? "ring-2 ring-blue-400 ring-offset-1" : ""}`}
                              style={shift?.color ? { borderLeftColor: shift.color } : {}}
                            >
                              {isDayOff ? (
                                <span className="text-[9px] tracking-tighter opacity-50 uppercase">OFF</span>
                              ) : (
                                <div className="flex flex-col items-center gap-0.5">
                                  <div className="flex items-center justify-center gap-1">
                                    <Clock size={10} className="opacity-70" />
                                    <span>{shift?.time}</span>
                                  </div>
                                  {shift?.note && (
                                    <span className="text-[8px] opacity-70 truncate max-w-full" title={shift.note}>
                                      {shift.note}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4 mt-5 pt-4 border-t border-gray-100">
        <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Legend:</span>
        {[
          { label: "Regular", class: "bg-blue-50" },
          { label: "Leave", class: "bg-red-50 border border-red-100" },
          { label: "Public Holiday", class: "bg-purple-50 border border-purple-100" },
          { label: "Modified", class: "bg-yellow-50 border border-yellow-100" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded ${item.class}`} />
            <span className="text-[10px] text-gray-500">{item.label}</span>
          </div>
        ))}
      </div>
    </DashCard>
  );
};

const AttendanceOverview = ({ userId }) => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [weekRange, setWeekRange] = useState({ start: '', end: '' });

  const fetchWeeklyAttendance = async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);
    try {
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];

      const response = await attendanceService.getWeeklyAttendance({
        employee_id: userId,
        date: dateStr
      });

      if (response.data && response.data.success) {
        const apiDays = response.data.data.days || [];

        // Define standard week days
        const standardDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

        // Map API data to standard days to ensure all 7 days are present
        const fullWeekData = standardDays.map(dayName => {
          const apiDay = apiDays.find(d => d.day === dayName);
          return apiDay || { day: dayName, total_work_hours: 0, date: "" };
        });

        setAttendanceData(fullWeekData);
        setWeekRange({
          start: response.data.data.week_start,
          end: response.data.data.week_end
        });
      }
    } catch (err) {
      console.error("Error fetching weekly attendance:", err);
      setError("Failed to load attendance data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWeeklyAttendance();
  }, [userId]);

  const maxHours = Math.max(...attendanceData.map(d => d.total_work_hours || 0), 8);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  return (
    <DashCard accentColor="#4ECDC4">
      <div className="flex items-center justify-between mb-2">
        <CardTitle icon={<Icons.Chart />}>Attendance Overview</CardTitle>
        {weekRange.start && (
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            {formatDate(weekRange.start)} - {formatDate(weekRange.end)}
          </span>
        )}
      </div>
      <p className="text-xs text-gray-500 mb-6">Your working hours for the current week</p>

      {isLoading ? (
        <div className="h-64 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-gray-400">Loading attendance...</p>
        </div>
      ) : error ? (
        <div className="h-64 flex flex-col items-center justify-center text-center">
          <p className="text-xs text-red-500 mb-2">{error}</p>
          <button onClick={fetchWeeklyAttendance} className="text-[10px] text-blue-500 font-bold uppercase hover:underline">Retry</button>
        </div>
      ) : attendanceData.length === 0 ? (
        <div className="h-64 flex items-center justify-center">
          <p className="text-xs text-gray-400 italic">No attendance records found for this week</p>
        </div>
      ) : (
        <div className="h-60 mt-4">
          <div className="flex items-end justify-between h-full gap-3 px-2">
            {attendanceData.map((item, index) => {
              const heightPct = (item.total_work_hours / (maxHours * 1.1)) * 100;
              return (
                <div key={index} className="flex flex-col items-center flex-1 group">
                  <div className="relative w-full flex flex-col items-center justify-end h-[180px]">
                    {/* Tooltip */}
                    <div className="absolute -top-8 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
                      {item.total_work_hours} hours
                    </div>

                    <div
                      className={`w-full max-w-[40px] bg-gradient-to-t from-emerald-400 to-teal-300 rounded-t-lg transition-all duration-500 group-hover:from-emerald-500 group-hover:to-teal-400 shadow-sm ${item.total_work_hours === 0 ? 'h-1 bg-gray-200' : ''
                        }`}
                      style={{ height: item.total_work_hours > 0 ? `${heightPct}%` : '4px' }}
                    />
                  </div>
                  <p className="text-[10px] font-bold text-gray-500 mt-3 uppercase tracking-tighter">{item.day}</p>
                  <p className="text-[10px] font-semibold text-gray-400">{item.total_work_hours}h</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </DashCard>
  );
};

// ============================================
// HOLIDAYS & EVENTS
// ============================================
const holidaysList = [
  { date: "Apr 25", name: "ANZAC Day", day: "Friday" },
  { date: "Jun 9", name: "Queen's Birthday", day: "Monday" },
  { date: "Dec 25", name: "Christmas Day", day: "Thursday" },
];

const HolidaysEvents = () => (
  <DashCard accentColor="#FFB347">
    <CardTitle icon={<PartyPopper size={16} />}>Upcoming Holidays</CardTitle>
    <div className="space-y-3">
      {holidaysList.map((h, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-400 to-blue-300 flex flex-col items-center justify-center text-white leading-tight">
            <span className="text-[10px] font-medium">{h.date.split(" ")[0]}</span>
            <span className="text-lg font-bold -mt-0.5">{h.date.split(" ")[1]}</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">{h.name}</p>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Calendar size={11} /> {h.day}
            </p>
          </div>
        </div>
      ))}
    </div>
  </DashCard>
);

// ============================================
// PAYSLIP SECTION (Replaces Payroll)
// ============================================
// ============================================
// PAYSLIP SECTION (Replaces Payroll)
// =====================================// ============================================
// PAYSLIP SECTION (Replaces Payroll)
// ============================================
// ============================================
// PAYSLIP SECTION (Replaces Payroll)
// ============================================
const GetPayslipsModal = ({ isOpen, onClose }) => {
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [selectedResultIds, setSelectedResultIds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [results, setResults] = useState([]);

  // Validation States
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [dateError, setDateError] = useState("");
  const [feedback, setFeedback] = useState(null);

  if (!isOpen) return null;

  const today = new Date().toISOString().split('T')[0];

  const dummyData = [
    { id: 11, month: "September", year: "2023" },
    { id: 12, month: "August", year: "2023" },
    { id: 13, month: "July", year: "2023" },
    { id: 14, month: "June", year: "2023" },
    { id: 15, month: "May", year: "2023" },
    { id: 16, month: "April", year: "2023" },
  ];

  const showFeedback = (msg, type = "success") => {
    setFeedback({ msg, type });
    setTimeout(() => setFeedback(null), 3000);
  };

  const validateDates = (start, end) => {
    if (start && end && new Date(start) > new Date(end)) {
      setDateError("End date cannot be before start date");
      return false;
    }
    setDateError("");
    return true;
  };

  const handleFromDateChange = (e) => {
    const val = e.target.value;
    setFromDate(val);
    setSelectedPeriod(null);
    validateDates(val, toDate);
  };

  const handleToDateChange = (e) => {
    const val = e.target.value;
    setToDate(val);
    setSelectedPeriod(null);
    validateDates(fromDate, val);
  };

  const handlePeriodSelect = (m) => {
    setSelectedPeriod(m);
    setFromDate("");
    setToDate("");
    setDateError("");
  };

  const isRetrieveDisabled = () => {
    if (isLoading) return true;
    if (selectedPeriod) return false;
    if (fromDate && toDate && !dateError) return false;
    return true;
  };

  const handleRetrieve = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);

      let generatedData = [];
      const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

      if (selectedPeriod) {
        // Generate last N months from now
        const now = new Date();
        for (let i = 0; i < selectedPeriod; i++) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          generatedData.push({
            id: 100 + i,
            month: months[d.getMonth()],
            year: d.getFullYear().toString()
          });
        }
      } else if (fromDate && toDate) {
        // Generate months between selected dates
        const start = new Date(fromDate);
        const end = new Date(toDate);
        let current = new Date(end.getFullYear(), end.getMonth(), 1);
        let count = 0;

        while (current >= new Date(start.getFullYear(), start.getMonth(), 1) && count < 12) {
          generatedData.push({
            id: 200 + count,
            month: months[current.getMonth()],
            year: current.getFullYear().toString()
          });
          current.setMonth(current.getMonth() - 1);
          count++;
        }
      }

      const hasData = generatedData.length > 0 && Math.random() > 0.1;
      if (hasData) {
        setResults(generatedData);
        setShowResults(true);
        showFeedback(`Found ${generatedData.length} payslips`);
      } else {
        setResults([]);
        setShowResults(true);
      }
    }, 1000);
  };

  const handleBulkDownload = () => {
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      showFeedback(`Successfully downloaded ${selectedResultIds.length} payslips`);
      setTimeout(handleClose, 1500);
    }, 2000);
  };

  const toggleSelectResult = (id) => {
    setSelectedResultIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAllResult = () => {
    if (selectedResultIds.length === results.length) {
      setSelectedResultIds([]);
    } else {
      setSelectedResultIds(results.map(r => r.id));
    }
  };

  const handleClose = () => {
    setShowResults(false);
    setSelectedResultIds([]);
    setSelectedPeriod(null);
    setFromDate("");
    setToDate("");
    setResults([]);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1001] transition-opacity duration-300" onClick={handleClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-3xl shadow-2xl z-[1002] overflow-hidden p-8 animate-in fade-in zoom-in duration-300">

        {/* Toast Notification */}
        {feedback && (
          <div className={`absolute top-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl text-xs font-bold shadow-lg animate-in slide-in-from-top-4 duration-300 z-50 ${feedback.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
            }`}>
            {feedback.msg}
          </div>
        )}

        <button
          onClick={handleClose}
          className="absolute right-6 top-6 p-2 rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
        >
          <Icons.Close />
        </button>

        <div className="flex flex-col">
          {!showResults ? (
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-6">
                <FileIcon className="text-blue-500 w-8 h-8" />
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-2">Get Payslips</h2>
              <p className="text-sm text-gray-500 mb-8 font-medium">Choose a period to retrieve your payslips.</p>

              {/* Select a Period */}
              <div className="w-full space-y-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-left">Select a period</p>
                <div className="grid grid-cols-3 gap-3">
                  {[6, 12, 18].map((m) => (
                    <button
                      key={m}
                      onClick={() => handlePeriodSelect(m)}
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-200 ${selectedPeriod === m
                        ? 'border-blue-500 bg-blue-50/50'
                        : 'border-gray-100 hover:border-gray-200 bg-white'
                        }`}
                    >
                      <Calendar size={18} className={`mb-2 ${selectedPeriod === m ? 'text-blue-500' : 'text-gray-400'}`} />
                      <span className={`text-xs font-bold ${selectedPeriod === m ? 'text-blue-600' : 'text-gray-600'}`}>{m} Months</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="w-full flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-[10px] font-bold text-gray-300 uppercase">or</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              {/* Custom Date Range */}
              <div className="w-full space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Select a custom date range</p>
                  {dateError && <span className="text-[9px] font-bold text-red-500 animate-pulse">{dateError}</span>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">From</label>
                    <input
                      type="date"
                      max={today}
                      value={fromDate}
                      onChange={handleFromDateChange}
                      className={`w-full px-4 py-3 rounded-xl border transition-all outline-none text-sm font-medium ${dateError ? 'border-red-200 bg-red-50/30' : 'border-gray-100 focus:border-blue-300'
                        }`}
                    />
                  </div>
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">To</label>
                    <input
                      type="date"
                      max={today}
                      value={toDate}
                      onChange={handleToDateChange}
                      className={`w-full px-4 py-3 rounded-xl border transition-all outline-none text-sm font-medium ${dateError ? 'border-red-200 bg-red-50/30' : 'border-gray-100 focus:border-blue-300'
                        }`}
                    />
                  </div>
                </div>
              </div>

              <div className="w-full flex items-center justify-end gap-3 mt-10">
                <button onClick={handleClose} className="px-6 py-3 text-sm font-bold text-gray-400 hover:text-gray-600">Cancel</button>
                <button
                  onClick={handleRetrieve}
                  disabled={isRetrieveDisabled()}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 active:scale-95"
                >
                  {isLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  Retrieve Payslips
                </button>
              </div>
            </div>
          ) : results.length > 0 ? (
            <div className="flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                  <FileIcon className="text-blue-500 w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Retrieve Results</h2>
                  <p className="text-xs text-gray-500 font-medium">{results.length} payslips found</p>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4 px-2">
                <label className="flex items-center gap-3 cursor-pointer group/all">
                  <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${selectedResultIds.length === results.length && results.length > 0
                    ? 'bg-blue-500 border-blue-500'
                    : 'bg-white border-gray-200 group-hover/all:border-blue-300'
                    }`}>
                    {selectedResultIds.length === results.length && results.length > 0 && <CheckCircle size={12} className="text-white" />}
                  </div>
                  <input type="checkbox" className="hidden" onChange={toggleSelectAllResult} checked={selectedResultIds.length === results.length && results.length > 0} />
                  <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Select All</span>
                </label>
                <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-widest">
                  {selectedResultIds.length} Selected
                </span>
              </div>

              <div className="max-h-[320px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {results.map((res) => (
                  <div
                    key={res.id}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 ${selectedResultIds.includes(res.id)
                      ? 'bg-blue-50/50 border-blue-100 shadow-sm'
                      : 'bg-gray-50/50 border-transparent hover:bg-white hover:shadow-md'
                      }`}
                  >
                    <div className="flex items-center gap-4">
                      <label className="cursor-pointer group/item">
                        <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${selectedResultIds.includes(res.id)
                          ? 'bg-blue-500 border-blue-500'
                          : 'bg-white border-gray-200 group-hover/item:border-blue-300'
                          }`}>
                          {selectedResultIds.includes(res.id) && <CheckCircle size={12} className="text-white" />}
                        </div>
                        <input type="checkbox" className="hidden" onChange={() => toggleSelectResult(res.id)} checked={selectedResultIds.includes(res.id)} />
                      </label>
                      <div>
                        <p className="text-sm font-bold text-gray-800">{res.month}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">{res.year}</p>
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <button className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all" title="View">
                        <Eye size={18} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all" title="Download">
                        <Download size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-50">
                <button
                  onClick={() => setShowResults(false)}
                  className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ChevronLeft size={16} /> Back
                </button>
                <button
                  disabled={selectedResultIds.length === 0 || isDownloading}
                  onClick={handleBulkDownload}
                  className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-green-100 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                >
                  {isDownloading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Download size={16} />
                  )}
                  {isDownloading ? "Downloading..." : "Download Selected"}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center py-10">
              <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-6 border border-dashed border-gray-200">
                <AlertTriangle className="text-gray-300" size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">No Payslips Found</h3>
              <p className="text-sm text-gray-500 max-w-[240px] mb-8 font-medium">We couldn't find any payslips for the selected period.</p>
              <button
                onClick={() => setShowResults(false)}
                className="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-bold rounded-xl transition-all"
              >
                Try Another Period
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const payslips = [
  { id: 1, month: "March", year: "2024", downloadUrl: "#", viewUrl: "#" },
  { id: 2, month: "February", year: "2024", downloadUrl: "#", viewUrl: "#" },
  { id: 3, month: "January", year: "2024", downloadUrl: "#", viewUrl: "#" },
  { id: 4, month: "December", year: "2023", downloadUrl: "#", viewUrl: "#" },
  { id: 5, month: "November", year: "2023", downloadUrl: "#", viewUrl: "#" },
  { id: 6, month: "October", year: "2023", downloadUrl: "#", viewUrl: "#" },
];

const PayslipSection = () => {
  const [selectedIds, setSelectedIds] = useState([]);
  const [isGetPayslipsOpen, setIsGetPayslipsOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const showFeedback = (msg) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === payslips.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(payslips.map(p => p.id));
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkDownload = () => {
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      showFeedback(`Downloaded ${selectedIds.length} slips successfully!`);
      setSelectedIds([]);
    }, 2000);
  };

  return (
    <DashCard accentColor="#A8E6CF" className="relative group">
      <div className="flex items-center justify-between mb-5">
        <CardTitle icon={<FileIcon size={16} />}>Payslips</CardTitle>
        <div className="flex items-center gap-4">
          {feedback && (
            <div className="text-[10px] font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full animate-in fade-in zoom-in">
              {feedback}
            </div>
          )}
          {selectedIds.length > 0 && !feedback && (
            <button
              onClick={handleBulkDownload}
              disabled={isDownloading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-green-600 text-[10px] font-bold uppercase transition-all hover:bg-green-100 animate-in fade-in slide-in-from-right-4 disabled:opacity-50"
              title="Download Selected"
            >
              {isDownloading ? (
                <div className="w-3 h-3 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download size={12} />
              )}
              {isDownloading ? "Wait..." : `Download (${selectedIds.length})`}
            </button>
          )}
          <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded-lg transition-colors group/all">
            <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${selectedIds.length === payslips.length
              ? 'bg-blue-500 border-blue-500'
              : 'bg-white border-gray-200 group-hover/all:border-blue-300'
              }`}>
              {selectedIds.length === payslips.length && <CheckCircle size={12} className="text-white" />}
            </div>
            <input
              type="checkbox"
              className="hidden"
              checked={selectedIds.length === payslips.length}
              onChange={toggleSelectAll}
            />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Select All</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {payslips.map((payslip) => (
          <div
            key={payslip.id}
            className={`flex items-center justify-between p-3.5 rounded-2xl transition-all duration-200 border group/card ${selectedIds.includes(payslip.id)
              ? 'bg-blue-50/50 border-blue-100 shadow-sm'
              : 'bg-gray-50/50 border-transparent hover:bg-white hover:border-gray-100 hover:shadow-md'
              }`}
          >
            <div className="flex items-center gap-4">
              <label className="cursor-pointer">
                <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${selectedIds.includes(payslip.id)
                  ? 'bg-blue-500 border-blue-500'
                  : 'bg-white border-gray-200 group-hover/card:border-blue-300'
                  }`}>
                  {selectedIds.includes(payslip.id) && <CheckCircle size={12} className="text-white" />}
                </div>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={selectedIds.includes(payslip.id)}
                  onChange={() => toggleSelect(payslip.id)}
                />
              </label>
              <div>
                <p className="text-xs font-bold text-gray-800">{payslip.month}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{payslip.year}</p>
              </div>
            </div>
            <div className="flex gap-1.5">
              <button
                className="w-9 h-9 flex items-center justify-center text-blue-500 bg-white hover:bg-blue-50 rounded-xl transition-all shadow-sm border border-gray-100 group/btn"
                title="View Payslip"
              >
                <Eye size={16} className="group-hover/btn:scale-110 transition-transform" />
              </button>
              <button
                className="w-9 h-9 flex items-center justify-center text-green-600 bg-white hover:bg-green-50 rounded-xl transition-all shadow-sm border border-gray-100 group/btn"
                title="Download Payslip"
              >
                <Download size={16} className="group-hover/btn:scale-110 transition-transform" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setIsGetPayslipsOpen(true)}
        className="w-full mt-6 py-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 text-blue-600 text-sm font-bold flex items-center justify-center gap-2 hover:from-blue-100 hover:to-indigo-100 transition-all group/more"
      >
        View More
        <ArrowRight size={16} className="group-hover/more:translate-x-1 transition-transform" />
      </button>

      <GetPayslipsModal
        isOpen={isGetPayslipsOpen}
        onClose={() => setIsGetPayslipsOpen(false)}
      />
    </DashCard>
  );
};








// ============================================
// NOTIFICATIONS
// ============================================
const notificationsList = [
  { icon: <Info size={15} className="text-blue-500" />, title: "Team outing scheduled for April 18", time: "2 hours ago" },
  { icon: <AlertTriangle size={15} className="text-yellow-500" />, title: "Timesheet submission due by Friday", time: "5 hours ago" },
  { icon: <Bell size={15} className="text-purple-500" />, title: "New company policy update available", time: "1 day ago" },
];

const Notifications = () => (
  <DashCard accentColor="#FFE66D">
    <CardTitle icon={<Bell size={16} />}>Notifications</CardTitle>
    <div className="space-y-3">
      {notificationsList.map((n, i) => (
        <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
            {n.icon}
          </div>
          <div>
            <p className="text-sm text-gray-700">{n.title}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{n.time}</p>
          </div>
        </div>
      ))}
    </div>
  </DashCard>
);

// ============================================
// QUICK STATS CARDS
// ============================================
const statCards = [
  { label: 'Leave Balance', value: '12', change: 2.5, up: true, accent: '#FF6B6B', icon: <Icons.Calendar /> },
  { label: 'Pending Leaves', value: '2', change: 0, up: false, accent: '#FFE66D', icon: <Icons.Clock /> },
  { label: 'Tasks Pending', value: '5', change: 1, up: false, accent: '#A8E6CF', icon: <Icons.Document /> },
  { label: 'Attendance Rate', value: '96%', change: 1.2, up: true, accent: '#4ECDC4', icon: <Icons.CheckCircle /> },
  { label: 'Overtime Hours', value: '8h', change: 2, up: true, accent: '#FFB347', icon: <Icons.Chart /> },
];

const QuickStats = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
    {statCards.map((s) => (
      <StatCard key={s.label} {...s} />
    ))}
  </div>
);

// ============================================
// MAIN EMPLOYEE DASHBOARD
// ============================================
const EmployeeDashboard2 = () => {
  // Safe way to get context - provide default values
  const context = useOutletContext();
  const user = context?.user || null;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const { sidebarColor, setSidebarColor, backgroundColor, setBackgroundColor } = useTheme();

  return (
    <>
      {/* Color Palette Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed right-6 bottom-6 bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-xl transition-all z-50"
      >
        <Icons.Palette />
      </button>

      {/* Color Palette Modal */}
      <ColorPaletteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSidebarColorSelect={(color) => {
          setSidebarColor(color);
          localStorage.setItem('sidebarColor', color);
        }}
        onBackgroundColorSelect={(color) => {
          setBackgroundColor(color);
          localStorage.setItem('backgroundColor', color);
        }}
        currentSidebarColor={sidebarColor}
        currentBgColor={backgroundColor}
      />

      {/* Main Content */}
      <div className="p-6 min-h-screen transition-colors duration-300" style={{ backgroundColor: backgroundColor }}>
        <div className="max-w-7xl mx-auto space-y-6">
          <QuickStats />

          {/* Row 1: Calendar, Attendance, Today's Schedule */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <CalendarWidget />
            <AttendanceCard />
            <TodayTasksCard />
          </div>

          {/* Row 2: Roster Section (Moved to top of second row) */}
          <RosterSection organizationId={user?.organization_id || 15} />

          {/* Row 4: Attendance Overview (2 weeks) & Holidays */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* TODO: Make this dynamic using user?.employee?.id or user?.id */}
            <AttendanceOverview userId={58} />
            <HolidaysEvents />
          </div>

          {/* Row 5: Payslip & Notifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PayslipSection />
            <Notifications />
          </div>
        </div>
      </div>
    </>
  );
};

export default EmployeeDashboard2;