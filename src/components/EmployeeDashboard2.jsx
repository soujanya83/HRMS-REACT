// src/pages/Dashboard/EmployeeDashboard2.jsx
import { useState, useEffect } from "react";
import {
  CalendarDays, Briefcase, Clock, CalendarOff, Clock3, ListTodo, TrendingUp, Timer,
  Fingerprint, CheckCircle2, XCircle, LogIn, LogOut, FileText, CheckCircle, Circle,
  ArrowRight, IndianRupee, Download, Bell, Info, AlertTriangle, PartyPopper, Calendar,
  Users, ChevronLeft, ChevronRight, Building2
} from "lucide-react";
import { useOutletContext } from "react-router-dom";

// ============================================
// WELCOME SECTION
// ============================================
const WelcomeSection = ({ user }) => {
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-8 md:p-10">
      <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-white/70 text-sm font-medium tracking-wide uppercase mb-1">
            Dashboard Overview
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Welcome, {user?.name || "Employee"}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
            <span className="flex items-center gap-1.5"><CalendarDays size={15} />{dateStr}</span>
            <span className="flex items-center gap-1.5"><Briefcase size={15} />{user?.designation || "Team Member"}</span>
            <span className="flex items-center gap-1.5"><Clock size={15} />Shift: 9:00 AM – 6:00 PM</span>
          </div>
        </div>
        <div className="flex-shrink-0">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-2xl font-bold border border-white/20">
            {user?.name?.charAt(0) || "E"}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// QUICK STATS CARD
// ============================================
const StatCard = ({ icon, value, label, gradient }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
    <div className={`w-10 h-10 rounded-xl ${gradient} flex items-center justify-center text-white mb-3`}>
      {icon}
    </div>
    <p className="text-2xl font-bold text-gray-800">{value}</p>
    <p className="text-xs text-gray-500 mt-0.5">{label}</p>
  </div>
);

const QuickStats = () => {
  const stats = [
    { icon: <CalendarOff size={18} />, value: "12", label: "Leave Balance", gradient: "bg-gradient-to-r from-blue-500 to-blue-600" },
    { icon: <Clock3 size={18} />, value: "2", label: "Pending Leaves", gradient: "bg-gradient-to-r from-orange-500 to-orange-600" },
    { icon: <ListTodo size={18} />, value: "5", label: "Tasks Pending", gradient: "bg-gradient-to-r from-purple-500 to-purple-600" },
    { icon: <TrendingUp size={18} />, value: "96%", label: "Attendance", gradient: "bg-gradient-to-r from-green-500 to-green-600" },
    { icon: <Timer size={18} />, value: "8h", label: "Overtime", gradient: "bg-gradient-to-r from-teal-500 to-teal-600" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {stats.map((s, i) => (
        <StatCard key={s.label} {...s} />
      ))}
    </div>
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
    not_punched: { label: "Not Punched In", icon: XCircle, cls: "bg-red-50 text-red-600" },
    punched_in: { label: "Working", icon: CheckCircle2, cls: "bg-emerald-50 text-emerald-600" },
    punched_out: { label: "Completed", icon: LogOut, cls: "bg-blue-50 text-blue-600" },
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
    <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 flex items-center justify-center shadow-lg">
        <LogIn size={18} className="text-white" />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-800">Punched In</p>
        <p className="text-xs text-gray-500">at {data.punchInTime}</p>
      </div>
      <div className="ml-auto flex items-center gap-1 text-emerald-600">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
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
        <div 
          className="bg-gradient-to-r from-emerald-500 to-green-500 h-2 rounded-full transition-all duration-1000"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div className="text-center p-3 rounded-xl bg-gray-50 border border-gray-100">
        <Clock size={15} className="mx-auto mb-1 text-blue-500" />
        <p className="text-[10px] text-gray-500 uppercase tracking-wider">Check In</p>
        <p className="text-sm font-bold text-gray-800">{data.punchInTime}</p>
      </div>
      <div className="text-center p-3 rounded-xl bg-gray-50 border border-gray-100">
        <Timer size={15} className="mx-auto mb-1 text-blue-500" />
        <p className="text-[10px] text-gray-500 uppercase tracking-wider">Worked</p>
        <p className="text-sm font-bold text-gray-800">{formatMinutes(data.workedMinutes || 0)}</p>
      </div>
    </div>
  </div>
);

const PunchedOutView = ({ data, progress }) => (
  <div className="flex flex-col gap-4">
    <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
        <LogOut size={18} className="text-white" />
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
        <div 
          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-1000"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
    <div className="grid grid-cols-3 gap-2">
      <div className="text-center p-2.5 rounded-xl bg-gray-50 border border-gray-100">
        <LogIn size={14} className="mx-auto mb-1 text-emerald-500" />
        <p className="text-[10px] text-gray-500">In</p>
        <p className="text-xs font-bold text-gray-800">{data.punchInTime}</p>
      </div>
      <div className="text-center p-2.5 rounded-xl bg-gray-50 border border-gray-100">
        <LogOut size={14} className="mx-auto mb-1 text-red-500" />
        <p className="text-[10px] text-gray-500">Out</p>
        <p className="text-xs font-bold text-gray-800">{data.punchOutTime || "—"}</p>
      </div>
      <div className="text-center p-2.5 rounded-xl bg-gray-50 border border-gray-100">
        <Timer size={14} className="mx-auto mb-1 text-blue-500" />
        <p className="text-[10px] text-gray-500">Total</p>
        <p className="text-xs font-bold text-gray-800">{formatMinutes(data.workedMinutes || 0)}</p>
      </div>
    </div>
  </div>
);

const AttendanceCard = () => {
  const [data] = useState(dummyAttendanceData);
  const [animatedProgress, setAnimatedProgress] = useState(0);

  const progress = data.workedMinutes
    ? Math.min((data.workedMinutes / data.totalShiftMinutes) * 100, 100)
    : 0;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedProgress(progress), 400);
    return () => clearTimeout(timer);
  }, [progress]);

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Attendance</h2>
          <p className="text-sm text-gray-500">Today's Status</p>
        </div>
        <StatusBadge status={data.status} />
      </div>
      {data.status === "not_punched" && <NotPunchedView />}
      {data.status === "punched_in" && <PunchedInView data={data} progress={animatedProgress} />}
      {data.status === "punched_out" && <PunchedOutView data={data} progress={animatedProgress} />}
    </div>
  );
};

// ============================================
// TODAY'S SCHEDULE
// ============================================
const scheduleItems = [
  { time: "9:00 AM", title: "Morning Stand-up", type: "Meeting" },
  { time: "10:30 AM", title: "Sprint Review – Dashboard Module", type: "Review" },
  { time: "2:00 PM", title: "1-on-1 with Manager", type: "Meeting" },
  { time: "4:00 PM", title: "Code Review – Auth Service", type: "Task" },
];

const TodaySchedule = () => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
    <h2 className="text-lg font-semibold text-gray-800 mb-1">Today's Schedule</h2>
    <p className="text-xs text-gray-500 mb-5 flex items-center gap-1.5">
      <Clock size={13} /> Shift: 9:00 AM – 6:00 PM
    </p>
    <div className="space-y-4">
      {scheduleItems.map((item, i) => (
        <div key={i} className="flex items-start gap-3 group">
          <div className="flex flex-col items-center">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 group-hover:scale-125 transition-transform" />
            {i < scheduleItems.length - 1 && <div className="w-px h-8 bg-gray-200" />}
          </div>
          <div className="-mt-1">
            <p className="text-sm font-medium text-gray-800">{item.title}</p>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <FileText size={11} /> {item.time} · {item.type}
            </p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ============================================
// TASKS SECTION
// ============================================
const tasks = [
  { title: "Update API documentation", status: "completed" },
  { title: "Fix login page responsive issues", status: "completed" },
  { title: "Review pull request #142", status: "pending" },
  { title: "Deploy staging build", status: "pending" },
  { title: "Write unit tests for auth module", status: "pending" },
];

const TasksSection = () => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
    <div className="flex items-center justify-between mb-5">
      <h2 className="text-lg font-semibold text-gray-800">Tasks</h2>
      <button className="text-xs text-blue-600 font-medium flex items-center gap-1 hover:gap-2 transition-all">
        View All <ArrowRight size={13} />
      </button>
    </div>
    <div className="space-y-3">
      {tasks.map((t, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
          {t.status === "completed" ? (
            <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />
          ) : (
            <Circle size={18} className="text-gray-400 group-hover:text-blue-500 flex-shrink-0 transition-colors" />
          )}
          <span className={`text-sm ${t.status === "completed" ? "line-through text-gray-400" : "text-gray-700"}`}>
            {t.title}
          </span>
          <span className={`ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
            t.status === "completed" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
          }`}>
            {t.status === "completed" ? "Done" : "Pending"}
          </span>
        </div>
      ))}
    </div>
  </div>
);

// ============================================
// ROSTER SECTION
// ============================================
const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const weekDates = ["7 Apr", "8 Apr", "9 Apr", "10 Apr", "11 Apr", "12 Apr", "13 Apr"];

const departments = [
  {
    name: "Engineering Team",
    gradientClass: "bg-gradient-to-r from-blue-500 to-blue-600",
    employees: [
      {
        name: "Liam Chen", position: "Team Lead", avatar: "LC",
        shifts: {
          Mon: { time: "9:00 - 5:30", status: "normal" }, Tue: { time: "9:00 - 5:30", status: "normal" },
          Wed: { time: "9:00 - 5:30", status: "normal" }, Thu: { time: "9:00 - 5:30", status: "normal" },
          Fri: { time: "9:00 - 5:30", status: "normal" }, Sat: { time: "—", status: "normal" }, Sun: { time: "—", status: "normal" },
        },
      },
      {
        name: "Noah Singh", position: "Senior Dev", avatar: "NS",
        shifts: {
          Mon: { time: "10:00 - 6:30", status: "normal" }, Tue: { time: "10:00 - 6:30", status: "normal" },
          Wed: { time: "Leave", status: "leave", note: "Annual Leave" }, Thu: { time: "10:00 - 6:30", status: "normal" },
          Fri: { time: "10:00 - 6:30", status: "normal" }, Sat: { time: "—", status: "normal" }, Sun: { time: "—", status: "normal" },
        },
      },
      {
        name: "Ava Patel", position: "Frontend Dev", avatar: "AP",
        shifts: {
          Mon: { time: "8:30 - 5:00", status: "normal" }, Tue: { time: "8:30 - 5:00", status: "normal" },
          Wed: { time: "8:30 - 5:00", status: "normal" }, Thu: { time: "8:30 - 5:00", status: "modified", note: "Remote" },
          Fri: { time: "8:30 - 5:00", status: "normal" }, Sat: { time: "—", status: "normal" }, Sun: { time: "—", status: "normal" },
        },
      },
    ],
  },
  {
    name: "Design Studio",
    gradientClass: "bg-gradient-to-r from-purple-500 to-purple-600",
    employees: [
      {
        name: "Olivia Park", position: "Lead Designer", avatar: "OP",
        shifts: {
          Mon: { time: "9:00 - 5:30", status: "normal" }, Tue: { time: "9:00 - 5:30", status: "normal" },
          Wed: { time: "9:00 - 5:30", status: "normal" }, Thu: { time: "PH - ANZAC Day", status: "holiday" },
          Fri: { time: "9:00 - 5:30", status: "normal" }, Sat: { time: "—", status: "normal" }, Sun: { time: "—", status: "normal" },
        },
      },
      {
        name: "Emma Wilson", position: "UI Designer", avatar: "EW",
        shifts: {
          Mon: { time: "9:30 - 6:00", status: "normal" }, Tue: { time: "9:30 - 6:00", status: "normal" },
          Wed: { time: "Leave", status: "leave", note: "Sick Leave" }, Thu: { time: "PH - ANZAC Day", status: "holiday" },
          Fri: { time: "9:30 - 6:00", status: "normal" }, Sat: { time: "—", status: "normal" }, Sun: { time: "—", status: "normal" },
        },
      },
    ],
  },
  {
    name: "Operations Hub",
    gradientClass: "bg-gradient-to-r from-orange-500 to-orange-600",
    employees: [
      {
        name: "James Taylor", position: "Ops Manager", avatar: "JT",
        shifts: {
          Mon: { time: "7:00 - 3:30", status: "normal" }, Tue: { time: "7:00 - 3:30", status: "normal" },
          Wed: { time: "7:00 - 3:30", status: "normal" }, Thu: { time: "7:00 - 3:30", status: "normal" },
          Fri: { time: "7:00 - 3:30", status: "normal" }, Sat: { time: "8:00 - 12:00", status: "modified", note: "Half day" },
          Sun: { time: "—", status: "normal" },
        },
      },
      {
        name: "Sophie Brown", position: "Coordinator", avatar: "SB",
        shifts: {
          Mon: { time: "8:00 - 4:30", status: "normal" }, Tue: { time: "8:00 - 4:30", status: "normal" },
          Wed: { time: "8:00 - 4:30", status: "normal" }, Thu: { time: "8:00 - 4:30", status: "normal" },
          Fri: { time: "Leave", status: "leave", note: "Personal Leave" }, Sat: { time: "—", status: "normal" },
          Sun: { time: "—", status: "normal" },
        },
      },
      {
        name: "Ryan Mitchell", position: "Support Staff", avatar: "RM",
        shifts: {
          Mon: { time: "10:00 - 6:30", status: "normal" }, Tue: { time: "10:00 - 6:30", status: "normal" },
          Wed: { time: "10:00 - 6:30", status: "normal" }, Thu: { time: "10:00 - 6:30", status: "normal" },
          Fri: { time: "10:00 - 6:30", status: "normal" }, Sat: { time: "—", status: "normal" },
          Sun: { time: "—", status: "normal" },
        },
      },
    ],
  },
];

const shiftStatusStyles = {
  normal: "bg-gray-50 text-gray-700",
  leave: "bg-red-50 text-red-600 border border-red-200",
  holiday: "bg-purple-50 text-purple-600 border border-purple-200",
  modified: "bg-blue-50 text-blue-600 border border-blue-200",
};

const RosterSection = () => {
  const [currentWeekOffset] = useState(0);
  const isToday = (dayIndex) => {
    const today = new Date().getDay();
    const adjusted = today === 0 ? 6 : today - 1;
    return dayIndex === adjusted && currentWeekOffset === 0;
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Calendar size={18} className="text-blue-500" /> Weekly Roster
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-medium px-3 py-1.5 rounded-lg bg-gray-100">
            {weekDates[0]} – {weekDates[6]}
          </span>
          <button className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <ChevronLeft size={14} />
          </button>
          <button className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider pb-3 pl-3 w-[180px] min-w-[160px]">
                <span className="flex items-center gap-1.5"><Users size={12} /> Staff</span>
              </th>
              {weekDays.map((day, i) => (
                <th key={day} className="text-center pb-3 min-w-[100px]">
                  <div className={`inline-flex flex-col items-center px-3 py-1.5 rounded-xl transition-all ${
                    isToday(i) ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg" : "text-gray-500"
                  }`}>
                    <span className="text-[10px] font-medium">{day}</span>
                    <span className={`text-sm font-bold ${isToday(i) ? "text-white" : "text-gray-700"}`}>
                      {weekDates[i].split(" ")[0]}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {departments.map((dept, deptIdx) => (
              <>
                <tr key={`dept-${deptIdx}`}>
                  <td colSpan={8} className="pt-4 pb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-1 h-5 rounded-full ${dept.gradientClass}`} />
                      <span className="flex items-center gap-1.5 text-xs font-bold text-gray-700 uppercase tracking-wide">
                        <Building2 size={12} className="text-gray-500" />
                        {dept.name}
                      </span>
                      <div className="flex-1 h-px bg-gray-100 ml-2" />
                    </div>
                  </td>
                </tr>
                {dept.employees.map((emp, empIdx) => (
                  <tr key={`emp-${deptIdx}-${empIdx}`} className="group hover:bg-gray-50 transition-colors">
                    <td className="py-1.5 pl-3 pr-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg ${dept.gradientClass} flex items-center justify-center text-white text-[10px] font-bold shadow-sm`}>
                          {emp.avatar}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-800 truncate">{emp.name}</p>
                          <p className="text-[10px] text-gray-500 truncate">{emp.position}</p>
                        </div>
                      </div>
                    </td>
                    {weekDays.map((day, dayIdx) => {
                      const shift = emp.shifts[day];
                      const isDayOff = shift?.time === "—";
                      const status = shift?.status || "normal";
                      return (
                        <td key={day} className="py-1.5 px-1">
                          <div
                            className={`text-center rounded-xl px-2 py-2 text-[11px] font-medium transition-all ${
                              isDayOff ? "text-gray-300" : shiftStatusStyles[status]
                            } ${isToday(dayIdx) && !isDayOff ? "ring-1 ring-blue-300 shadow-sm" : ""}`}
                            title={shift?.note || ""}
                          >
                            {isDayOff ? (
                              <span className="text-[10px]">OFF</span>
                            ) : (
                              <>
                                <div className="flex items-center justify-center gap-1">
                                  <Clock size={9} className="opacity-60" />
                                  <span>{shift?.time}</span>
                                </div>
                                {shift?.note && <p className="text-[9px] opacity-70 mt-0.5">{shift.note}</p>}
                              </>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center gap-4 mt-5 pt-4 border-t border-gray-100">
        <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Legend:</span>
        {[
          { label: "Regular", class: "bg-gray-50" },
          { label: "Leave", class: "bg-red-50 border border-red-200" },
          { label: "Public Holiday", class: "bg-purple-50 border border-purple-200" },
          { label: "Modified", class: "bg-blue-50 border border-blue-200" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded ${item.class}`} />
            <span className="text-[10px] text-gray-500">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================
// ATTENDANCE GRAPH
// ============================================
const graphData = [
  { day: "Mon", hours: 8.5 },
  { day: "Tue", hours: 9 },
  { day: "Wed", hours: 7.5 },
  { day: "Thu", hours: 8 },
  { day: "Fri", hours: 9.5 },
  { day: "Sat", hours: 4 },
  { day: "Sun", hours: 0 },
];

const AttendanceGraph = () => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
    <h2 className="text-lg font-semibold text-gray-800 mb-1">Attendance Overview</h2>
    <p className="text-xs text-gray-500 mb-5">This week's working hours</p>
    <div className="h-64">
      <div className="flex items-end justify-between h-full gap-2">
        {graphData.map((item, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div 
              className="w-full bg-gradient-to-t from-blue-500 to-purple-500 rounded-lg transition-all duration-500 hover:from-blue-600 hover:to-purple-600"
              style={{ height: `${(item.hours / 10) * 200}px`, maxHeight: "200px" }}
            />
            <p className="text-xs text-gray-500 mt-2">{item.day}</p>
            <p className="text-xs font-semibold text-gray-700">{item.hours}h</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ============================================
// HOLIDAYS & EVENTS
// ============================================
const holidays = [
  { date: "Apr 25", name: "ANZAC Day", day: "Friday" },
  { date: "Jun 9", name: "Queen's Birthday", day: "Monday" },
  { date: "Dec 25", name: "Christmas Day", day: "Thursday" },
];

const HolidaysEvents = () => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
    <h2 className="text-lg font-semibold text-gray-800 mb-5 flex items-center gap-2">
      <PartyPopper size={18} className="text-purple-500" /> Upcoming Holidays
    </h2>
    <div className="space-y-3">
      {holidays.map((h, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex flex-col items-center justify-center text-white leading-tight">
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
  </div>
);

// ============================================
// PAYROLL SNAPSHOT
// ============================================
const PayrollSnapshot = () => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
    <h2 className="text-lg font-semibold text-gray-800 mb-5">Payroll</h2>
    <div className="flex items-center gap-4 mb-5">
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
        <IndianRupee size={22} className="text-white" />
      </div>
      <div>
        <p className="text-xs text-gray-500">Last Salary Credited</p>
        <p className="text-2xl font-bold text-gray-800">₹85,400</p>
      </div>
      <span className="ml-auto flex items-center gap-0.5 text-emerald-600 text-xs font-medium bg-emerald-50 px-2 py-1 rounded-full">
        <TrendingUp size={12} /> +5%
      </span>
    </div>
    <div className="grid grid-cols-2 gap-3 mb-5">
      <div className="p-3 rounded-xl bg-gray-50 text-center">
        <p className="text-xs text-gray-500">Basic</p>
        <p className="text-sm font-semibold text-gray-800">₹50,000</p>
      </div>
      <div className="p-3 rounded-xl bg-gray-50 text-center">
        <p className="text-xs text-gray-500">Deductions</p>
        <p className="text-sm font-semibold text-gray-800">₹14,600</p>
      </div>
    </div>
    <button className="w-full py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
      <Download size={15} /> Download Payslip
    </button>
  </div>
);

// ============================================
// NOTIFICATIONS
// ============================================
const notifications = [
  { icon: <Info size={15} className="text-blue-500" />, title: "Team outing scheduled for April 18", time: "2 hours ago" },
  { icon: <AlertTriangle size={15} className="text-amber-500" />, title: "Timesheet submission due by Friday", time: "5 hours ago" },
  { icon: <Bell size={15} className="text-purple-500" />, title: "New company policy update available", time: "1 day ago" },
];

const Notifications = () => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
    <h2 className="text-lg font-semibold text-gray-800 mb-5">Notifications</h2>
    <div className="space-y-3">
      {notifications.map((n, i) => (
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
  </div>
);

// ============================================
// MAIN EMPLOYEE DASHBOARD
// ============================================
const EmployeeDashboard2 = () => {
  const { user } = useOutletContext();

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <WelcomeSection user={user} />
      <QuickStats />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AttendanceCard />
        <TodaySchedule />
        <TasksSection />
      </div>

      <RosterSection />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AttendanceGraph />
        <HolidaysEvents />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PayrollSnapshot />
        <Notifications />
      </div>
    </div>
  );
};

export default EmployeeDashboard2;