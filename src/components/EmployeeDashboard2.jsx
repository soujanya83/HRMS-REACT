// src/components/EmployeeDashboard2.jsx
import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useTheme } from '../contexts/ThemeContext';
import {
  CalendarDays, Briefcase, Clock, CalendarOff, Clock3, ListTodo, TrendingUp, Timer,
  Fingerprint, CheckCircle2, XCircle, LogIn, LogOut, FileText, CheckCircle, Circle,
  ArrowRight, IndianRupee, Download, Bell, Info, AlertTriangle, PartyPopper, Calendar,
  Users, ChevronLeft, ChevronRight, Building2, Wallet, Eye, FileText as FileIcon
} from "lucide-react";

// Icons for color palette
const Icons = {
  Palette: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="w-6 h-6">
      <path d="M12 2C6.48 2 2 6.03 2 11c0 3.87 3.13 7 7 7h1c.55 0 1 .45 1 1 0 1.1.9 2 2 2 4.42 0 8-3.58 8-8 0-6.08-4.92-11-11-11z" fill="white"/>
      <circle cx="7.5" cy="10.5" r="1.5" fill="#2D7BE5" />
      <circle cx="10.5" cy="7.5" r="1.5" fill="#2D7BE5" />
      <circle cx="14.5" cy="7.5" r="1.5" fill="#2D7BE5" />
      <circle cx="16.5" cy="11.5" r="1.5" fill="#2D7BE5" />
    </svg>
  ),
  Users: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  ),
  CheckCircle: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Calendar: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  ),
  Clock: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Briefcase: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
    </svg>
  ),
  Chart: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  ),
  Mail: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  ),
  Document: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  ),
  ArrowUp: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
    </svg>
  ),
  ArrowDown: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 4.5l15 15m0 0V8.25m0 11.25H8.25" />
    </svg>
  ),
  Wallet: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
    </svg>
  ),
};

// Color Palette Modal
const ColorPaletteModal = ({
  isOpen,
  onClose,
  onSidebarColorSelect,
  onBackgroundColorSelect,
  currentSidebarColor,
  currentBgColor
}) => {
  if (!isOpen) return null;

  const sidebarColors = [
    { name: 'Dark Navy', value: '#0B1A2E' },
    { name: 'Charcoal', value: '#2C2C2C' },
    { name: 'Teal', value: '#008080' },
    { name: 'Deep Purple', value: '#4B0082' },
    { name: 'Forest Green', value: '#228B22' },
    { name: 'Slate Blue', value: '#5B7B9A' },
  ];

  const backgroundColors = [
    { name: 'Pure White', value: '#FFFFFF' },
    { name: 'Snow', value: '#FFFAFA' },
    { name: 'Ivory', value: '#FFFFF0' },
    { name: 'Pearl', value: '#F8F6F0' },
    { name: 'Whisper', value: '#F5F5F5' },
    { name: 'Silver Mist', value: '#E5E7EB' },
    { name: 'Ash', value: '#D1D5DB' },
    { name: 'Pewter', value: '#9CA3AF' },
    { name: 'Stone', value: '#6B7280' },
    { name: 'Graphite', value: '#4B5563' },
    { name: 'Slate', value: '#374151' },
    { name: 'Charcoal', value: '#1F2937' },
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-[60]" onClick={onClose} />
      <div className="fixed right-6 bottom-24 w-[340px] bg-white rounded-2xl shadow-2xl z-[70] p-5">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Sidebar Color</h2>
        <div className="grid grid-cols-3 gap-3 mb-5">
          {sidebarColors.map((c) => (
            <button
              key={c.name}
              onClick={() => onSidebarColorSelect(c.value)}
              className={`p-3 rounded-xl text-white text-sm font-semibold transition-all ${
                currentSidebarColor === c.value ? "ring-2 ring-blue-500" : ""
              }`}
              style={{ backgroundColor: c.value }}
            >
              {c.name}
            </button>
          ))}
        </div>

        <h2 className="text-lg font-semibold text-gray-800 mb-3">Background Color</h2>
        <div className="grid grid-cols-3 gap-3">
          {backgroundColors.map((c) => (
            <button
              key={c.name}
              onClick={() => onBackgroundColorSelect(c.value)}
              className={`p-3 rounded-xl text-sm font-medium border ${
                currentBgColor === c.value ? "ring-2 ring-blue-500" : ""
              }`}
              style={{ backgroundColor: c.value }}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

// Card wrapper
const DashCard = ({ children, accentColor = '#B5D8FF', className = '' }) => (
  <div className={`bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden ${className}`}>
    <div className="h-1 w-full" style={{ backgroundColor: accentColor }} />
    <div className="p-5">{children}</div>
  </div>
);

const CardTitle = ({ icon, children }) => (
  <div className="flex items-center gap-2 mb-4">
    {icon && <span className="text-gray-500">{icon}</span>}
    <h3 className="font-bold text-gray-700 text-sm tracking-wide uppercase">{children}</h3>
  </div>
);

const Badge = ({ color = 'bg-green-100 text-green-700', children }) => (
  <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}>{children}</span>
);

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
              className={`py-1.5 rounded-full font-medium transition-colors text-xs ${
                isToday ? 'bg-blue-500 text-white font-bold shadow-sm' :
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
const scheduleItems = [
  { time: "9:00 AM", title: "Morning Stand-up", type: "Meeting" },
  { time: "10:30 AM", title: "Sprint Review – Dashboard Module", type: "Review" },
  { time: "2:00 PM", title: "1-on-1 with Manager", type: "Meeting" },
  { time: "4:00 PM", title: "Code Review – Auth Service", type: "Task" },
];

const TodaySchedule = () => (
  <DashCard accentColor="#FFE66D">
    <CardTitle icon={<Icons.Clock />}>Today's Schedule</CardTitle>
    <p className="text-xs text-gray-500 mb-5 flex items-center gap-1.5">
      <Clock size={13} /> Shift: 9:00 AM – 6:00 PM
    </p>
    <div className="space-y-4">
      {scheduleItems.map((item, i) => (
        <div key={i} className="flex items-start gap-3 group">
          <div className="flex flex-col items-center">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-400 group-hover:scale-125 transition-transform" />
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
  </DashCard>
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
  <DashCard accentColor="#A8E6CF">
    <div className="flex items-center justify-between mb-5">
      <CardTitle icon={<Icons.Document />}>Tasks</CardTitle>
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
          <span className={`ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
            t.status === "completed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
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
const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const weekDates = ["7 Apr", "8 Apr", "9 Apr", "10 Apr", "11 Apr", "12 Apr", "13 Apr"];

const departments = [
  {
    name: "Engineering Team",
    gradientClass: "bg-blue-100",
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
    gradientClass: "bg-purple-100",
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
    gradientClass: "bg-orange-100",
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
  normal: "bg-blue-50 text-gray-700",
  leave: "bg-red-50 text-red-600 border border-red-100",
  holiday: "bg-purple-50 text-purple-600 border border-purple-100",
  modified: "bg-yellow-50 text-amber-600 border border-yellow-100",
};

const RosterSection = () => {
  const [currentWeekOffset] = useState(0);
  const isToday = (dayIndex) => {
    const today = new Date().getDay();
    const adjusted = today === 0 ? 6 : today - 1;
    return dayIndex === adjusted && currentWeekOffset === 0;
  };

  return (
    <DashCard accentColor="#FF6B6B">
      <div className="flex items-center justify-between mb-6">
        <CardTitle icon={<Icons.Users />}>Weekly Roster</CardTitle>
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
                <span className="flex items-center gap-1.5"><Icons.Users size={12} /> Staff</span>
              </th>
              {weekDays.map((day, i) => (
                <th key={day} className="text-center pb-3 min-w-[100px]">
                  <div className={`inline-flex flex-col items-center px-3 py-1.5 rounded-xl transition-all ${
                    isToday(i) ? "bg-blue-500 text-white shadow-lg" : "text-gray-500"
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
              <React.Fragment key={`dept-${deptIdx}`}>
                <tr>
                  <td colSpan={8} className="pt-4 pb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-1 h-5 rounded-full ${dept.gradientClass.replace('bg-', 'bg-').replace('-100', '-500')}`} />
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
                        <div className={`w-8 h-8 rounded-lg ${dept.gradientClass} flex items-center justify-center text-gray-700 text-[10px] font-bold shadow-sm`}>
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
                            } ${isToday(dayIdx) && !isDayOff ? "ring-1 ring-blue-400 shadow-sm" : ""}`}
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
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
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

// ============================================
// ATTENDANCE OVERVIEW FOR 2 WEEKS
// ============================================
const twoWeekGraphData = [
  { week: "Week 1", day: "Mon", hours: 8.5 },
  { week: "Week 1", day: "Tue", hours: 9 },
  { week: "Week 1", day: "Wed", hours: 7.5 },
  { week: "Week 1", day: "Thu", hours: 8 },
  { week: "Week 1", day: "Fri", hours: 9.5 },
  { week: "Week 1", day: "Sat", hours: 4 },
  { week: "Week 2", day: "Mon", hours: 8 },
  { week: "Week 2", day: "Tue", hours: 8.5 },
  { week: "Week 2", day: "Wed", hours: 9 },
  { week: "Week 2", day: "Thu", hours: 7 },
  { week: "Week 2", day: "Fri", hours: 8.5 },
  { week: "Week 2", day: "Sat", hours: 3.5 },
];

const week1Data = twoWeekGraphData.filter(d => d.week === "Week 1");
const week2Data = twoWeekGraphData.filter(d => d.week === "Week 2");

const AttendanceOverview = () => (
  <DashCard accentColor="#4ECDC4">
    <CardTitle icon={<Icons.Chart />}>Attendance Overview (2 Weeks)</CardTitle>
    <p className="text-xs text-gray-500 mb-5">Last 2 weeks working hours comparison</p>
    
    {/* Week 1 */}
    <div className="mb-6">
      <h4 className="text-sm font-semibold text-gray-700 mb-3">Week 1 (Apr 7 - Apr 13)</h4>
      <div className="h-40">
        <div className="flex items-end justify-between h-full gap-2">
          {week1Data.map((item, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div 
                className="w-full bg-gradient-to-t from-blue-400 to-blue-300 rounded-lg transition-all duration-500 hover:from-blue-500 hover:to-blue-400"
                style={{ height: `${(item.hours / 10) * 120}px`, maxHeight: "120px" }}
              />
              <p className="text-xs text-gray-500 mt-2">{item.day}</p>
              <p className="text-xs font-semibold text-gray-700">{item.hours}h</p>
            </div>
          ))}
        </div>
      </div>
    </div>
    
    {/* Week 2 */}
    <div>
      <h4 className="text-sm font-semibold text-gray-700 mb-3">Week 2 (Apr 14 - Apr 20)</h4>
      <div className="h-40">
        <div className="flex items-end justify-between h-full gap-2">
          {week2Data.map((item, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div 
                className="w-full bg-gradient-to-t from-purple-400 to-purple-300 rounded-lg transition-all duration-500 hover:from-purple-500 hover:to-purple-400"
                style={{ height: `${(item.hours / 10) * 120}px`, maxHeight: "120px" }}
              />
              <p className="text-xs text-gray-500 mt-2">{item.day}</p>
              <p className="text-xs font-semibold text-gray-700">{item.hours}h</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </DashCard>
);

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
const payslips = [
  { month: "March 2024", amount: "₹85,400", downloadUrl: "#", viewUrl: "#" },
  { month: "February 2024", amount: "₹82,500", downloadUrl: "#", viewUrl: "#" },
  { month: "January 2024", amount: "₹82,500", downloadUrl: "#", viewUrl: "#" },
  { month: "December 2023", amount: "₹80,000", downloadUrl: "#", viewUrl: "#" },
];

const PayslipSection = () => (
  <DashCard accentColor="#A8E6CF">
    <CardTitle icon={<FileIcon size={16} />}>Payslips</CardTitle>
    <div className="space-y-3">
      {payslips.map((payslip, i) => (
        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
          <div>
            <p className="text-sm font-semibold text-gray-800">{payslip.month}</p>
            <p className="text-lg font-bold text-green-600">{payslip.amount}</p>
          </div>
          <div className="flex gap-2">
            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Payslip">
              <Eye size={18} />
            </button>
            <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Download Payslip">
              <Download size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  </DashCard>
);

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

const StatCard = ({ icon, value, label, accent, up, change }) => (
  <DashCard accentColor={accent}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs text-gray-500 font-medium mb-1">{label}</p>
        <p className="text-2xl font-extrabold text-gray-800">{value}</p>
      </div>
      <div className="p-2 rounded-xl" style={{ backgroundColor: accent + '30' }}>
        <span style={{ color: '#555' }}>{icon}</span>
      </div>
    </div>
    <div className="mt-3">
      <Badge color={up ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}>
        {up ? <Icons.ArrowUp /> : <Icons.ArrowDown />}
        {Math.abs(change)}%
      </Badge>
      <span className="text-xs text-gray-400 ml-1">vs last month</span>
    </div>
  </DashCard>
);

const QuickStats = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
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
            <TodaySchedule />
          </div>

          {/* Row 2: Roster Section (Moved to top of second row) */}
          <RosterSection />

          {/* Row 3: Tasks */}
          <TasksSection />

          {/* Row 4: Attendance Overview (2 weeks) & Holidays */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AttendanceOverview />
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