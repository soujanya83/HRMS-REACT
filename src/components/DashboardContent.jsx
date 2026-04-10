// DashboardContent.jsx
import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';

// Icons
const Icons = {
 Palette: () => (
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
),
  Close: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
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
  Home: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  ),
  UserPlus: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
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
  Video: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
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

// Color Palette Modal - EXACT match to your image (same size, horizontal layout)
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
    { name: 'Teal', value: '#1F5F5B' },
    { name: 'Deep Purple', value: '#3B1E54' },
    { name: 'Forest Green', value: '#1B4332' },
    { name: 'Slate Blue', value: '#334155' },
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
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/20 z-[60]"
        onClick={onClose}
      />

      {/* 🔥 RIGHT SIDE FLOATING BOX (EXACT LIKE IMAGE) */}
      <div className="fixed right-6 bottom-24 w-[340px] bg-white rounded-2xl shadow-2xl z-[70] p-5">

        {/* Sidebar Colors */}
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          Sidebar Color
        </h2>

        <div className="grid grid-cols-3 gap-3 mb-5">
          {sidebarColors.map((c) => (
            <button
              key={c.name}
              onClick={() => onSidebarColorSelect(c.value)}
              className={`p-3 rounded-xl text-white text-sm font-semibold transition-all ${
                currentSidebarColor === c.value
                  ? "ring-2 ring-blue-500"
                  : ""
              }`}
              style={{ backgroundColor: c.value }}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Background Colors */}
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          Background Color
        </h2>

        <div className="grid grid-cols-3 gap-3">
          {backgroundColors.map((c) => (
            <button
              key={c.name}
              onClick={() => onBackgroundColorSelect(c.value)}
              className={`p-3 rounded-xl text-sm font-medium border ${
                currentBgColor === c.value
                  ? "ring-2 ring-blue-500"
                  : ""
              }`}
              style={{ backgroundColor: c.value }}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg text-gray-600"
          >
            Reject
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-green-500 text-white rounded-lg"
          >
            Approve
          </button>
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

// Stat Cards
const statCards = [
  { label: 'Total Employees', value: 248, change: 4.2, up: true, accent: '#FF6B6B', icon: <Icons.Users /> },
  { label: 'Present Today', value: 206, change: 1.5, up: true, accent: '#4ECDC4', icon: <Icons.CheckCircle /> },
  { label: 'On Leave Today', value: 18, change: 12, up: true, accent: '#FFE66D', icon: <Icons.Calendar /> },
  { label: 'Remote Working', value: 34, change: 8.3, up: true, accent: '#A8E6CF', icon: <Icons.Home /> },
  { label: 'New Joiners', value: 7, change: 2.1, up: false, accent: '#FFB347', icon: <Icons.UserPlus /> },
];

// Attendance Data
const attendance = [
  { label: 'Present', count: 206, color: '#4ECDC4', pct: 83 },
  { label: 'Absent', count: 14, color: '#FF6B6B', pct: 6 },
  { label: 'Late', count: 10, color: '#FFE66D', pct: 4 },
  { label: 'On Leave', count: 18, color: '#FFB347', pct: 7 },
];

// Roster
const roster = [
  { name: 'Aarav Mehta', dept: 'Engineering', shift: '9:00–6:00', status: 'On Duty' },
  { name: 'Priya Sharma', dept: 'Design', shift: '10:00–7:00', status: 'On Duty' },
  { name: 'Rohan Gupta', dept: 'Sales', shift: '9:00–6:00', status: 'Leave' },
  { name: 'Sneha Iyer', dept: 'HR', shift: '9:30–6:30', status: 'On Duty' },
  { name: 'Kabir Singh', dept: 'Finance', shift: '10:00–7:00', status: 'Off' },
];

// Calendar
const today = new Date();
const year = today.getFullYear();
const month = today.getMonth();
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const daysInMonth = new Date(year, month + 1, 0).getDate();
const firstDay = new Date(year, month, 1).getDay();
const holidays = [15, 26];
const events = [10, 22];

// Holidays & Events
const holidaysEvents = [
  { date: 'Apr 14', title: 'Ambedkar Jayanti', type: 'holiday' },
  { date: 'Apr 17', title: 'Team Offsite', type: 'event' },
  { date: 'Apr 21', title: 'Easter Monday', type: 'holiday' },
  { date: 'Apr 25', title: 'ANZAC Day', type: 'holiday' },
  { date: 'May 1', title: 'May Day', type: 'holiday' },
];

// Leave Requests
const leaveRequests = [
  { name: 'Ananya Rao', type: 'Casual', dates: 'Apr 10–11' },
  { name: 'Vikram Das', type: 'Sick', dates: 'Apr 12–14' },
  { name: 'Meera Joshi', type: 'Earned', dates: 'Apr 15–18' },
  { name: 'Rahul Nair', type: 'Casual', dates: 'Apr 20' },
];

const leaveTypeColors = {
  Casual: 'bg-blue-100 text-blue-700',
  Sick: 'bg-red-100 text-red-700',
  Earned: 'bg-amber-100 text-amber-700'
};

// Top Performers
const performers = [
  { name: 'Sneha Iyer', dept: 'HR', pct: 96, initial: 'S', color: '#FF6B6B' },
  { name: 'Aarav Mehta', dept: 'Engineering', pct: 92, initial: 'A', color: '#4ECDC4' },
  { name: 'Priya Sharma', dept: 'Design', pct: 89, initial: 'P', color: '#A8E6CF' },
  { name: 'Kabir Singh', dept: 'Finance', pct: 85, initial: 'K', color: '#FFE66D' },
];

// Department Headcount
const departments = [
  { name: 'Engineering', count: 45, color: '#4ECDC4' },
  { name: 'Sales', count: 30, color: '#A8E6CF' },
  { name: 'Finance', count: 18, color: '#FFE66D' },
  { name: 'HR', count: 12, color: '#FF6B6B' },
  { name: 'Design', count: 15, color: '#FFB347' },
];

const maxDept = Math.max(...departments.map(d => d.count));

// Announcements
const announcements = [
  { category: 'Policy', badge: 'bg-indigo-100 text-indigo-700', title: 'Updated WFH Policy', desc: 'Work from home now allowed 3 days a week starting May.', time: '2 hours ago' },
  { category: 'Event', badge: 'bg-teal-100 text-teal-700', title: 'Annual Day Celebration', desc: 'Join us on Apr 28 for the annual day. RSVP required.', time: '5 hours ago' },
  { category: 'Alert', badge: 'bg-rose-100 text-rose-700', title: 'System Maintenance', desc: 'Payroll system downtime scheduled for Apr 13, 10pm–2am.', time: '1 day ago' },
];

// Quick Actions
const quickActions = [
  { label: 'Add Employee', icon: <Icons.UserPlus /> },
  { label: 'Mark Attendance', icon: <Icons.CheckCircle /> },
  { label: 'Apply Leave', icon: <Icons.Calendar /> },
  { label: 'View Payroll', icon: <Icons.Wallet /> },
  { label: 'Generate Report', icon: <Icons.Document /> },
  { label: 'Schedule Interview', icon: <Icons.Video /> },
];

const DashboardContent = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { 
    sidebarColor, 
    setSidebarColor, 
    backgroundColor, 
    setBackgroundColor 
  } = useOutletContext();

  // Calendar grid
  const calendarCells = [];
  for (let i = 0; i < firstDay; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);

  return (
    <>
      {/* Color Palette Button - Bottom Right */}
      <button
  onClick={() => setIsModalOpen(true)}
  className="fixed right-6 bottom-6 bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-xl transition-all z-50"
>
  <Icons.Palette />
</button>
      {/* Color Palette Modal - EXACT match to your image */}
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
        {/* Row 1: Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-6">
          {statCards.map((s) => (
            <DashCard key={s.label} accentColor={s.accent}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">{s.label}</p>
                  <p className="text-3xl font-extrabold text-gray-800">{s.value}</p>
                </div>
                <div className="p-2 rounded-xl" style={{ backgroundColor: s.accent + '30' }}>
                  <span style={{ color: '#555' }}>{s.icon}</span>
                </div>
              </div>
              <div className="mt-3">
                <Badge color={s.up ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}>
                  {s.up ? <Icons.ArrowUp /> : <Icons.ArrowDown />}
                  {s.change}%
                </Badge>
                <span className="text-xs text-gray-400 ml-1">vs last month</span>
              </div>
            </DashCard>
          ))}
        </div>

        {/* Row 2: Attendance & Roster */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          <DashCard accentColor="#4ECDC4">
            <CardTitle icon={<Icons.Chart />}>Attendance Summary</CardTitle>
            <div className="flex rounded-full overflow-hidden h-5 mb-4">
              {attendance.map(a => (
                <div key={a.label} style={{ width: `${a.pct}%`, backgroundColor: a.color }} className="transition-all" title={`${a.label}: ${a.count}`} />
              ))}
            </div>
            <div className="flex flex-wrap gap-4">
              {attendance.map(a => (
                <div key={a.label} className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: a.color }} />
                  {a.label} <span className="font-bold text-gray-800">{a.count}</span>
                </div>
              ))}
            </div>
          </DashCard>

          <DashCard accentColor="#FF6B6B">
            <CardTitle icon={<Icons.Clock />}>Today's Roster</CardTitle>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 text-xs uppercase">
                    <th className="pb-2">Name</th>
                    <th className="pb-2">Dept</th>
                    <th className="pb-2">Shift</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {roster.map(r => (
                    <tr key={r.name} className="border-t border-gray-100">
                      <td className="py-2 font-medium text-gray-700">{r.name}</td>
                      <td className="py-2 text-gray-500">{r.dept}</td>
                      <td className="py-2 text-gray-500">{r.shift}</td>
                      <td className="py-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          r.status === 'On Duty' ? 'bg-green-100 text-green-700' :
                          r.status === 'Leave' ? 'bg-amber-100 text-amber-700' :
                          'bg-gray-100 text-gray-500'
                        }`}>{r.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DashCard>
        </div>

        {/* Row 3: Calendar, Holidays, Leave */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          <DashCard accentColor="#FFE66D">
            <CardTitle icon={<Icons.Calendar />}>{monthNames[month]} {year}</CardTitle>
            <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                <span key={d} className="font-semibold text-gray-400 py-1">{d}</span>
              ))}
              {calendarCells.map((day, i) => {
                if (day === null) return <span key={`e${i}`} />;
                const isToday = day === today.getDate();
                const isHoliday = holidays.includes(day);
                const isEvent = events.includes(day);
                return (
                  <span key={i} className={`py-1 rounded-full font-medium transition-colors ${
                    isToday ? 'bg-blue-200 text-blue-800 font-bold' :
                    isHoliday ? 'bg-red-100 text-red-600' :
                    isEvent ? 'bg-blue-100 text-blue-600' :
                    'text-gray-600 hover:bg-gray-100'
                  }`}>{day}</span>
                );
              })}
            </div>
            <div className="flex gap-4 text-xs text-gray-500 mt-2">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-200" />Holiday</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-200" />Event</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-300" />Today</span>
            </div>
          </DashCard>

          <DashCard accentColor="#A8E6CF">
            <CardTitle icon={<Icons.Calendar />}>Holidays & Events</CardTitle>
            <div className="space-y-3">
              {holidaysEvents.map((h, i) => (
                <div key={i} className={`flex items-start gap-3 pl-3 border-l-4 ${h.type === 'holiday' ? 'border-red-300' : 'border-blue-300'}`}>
                  <span className={`text-xs font-bold px-2 py-1 rounded-lg ${h.type === 'holiday' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>{h.date}</span>
                  <span className="text-sm text-gray-700">{h.title}</span>
                </div>
              ))}
            </div>
          </DashCard>

          <DashCard accentColor="#FFB347">
            <CardTitle icon={<Icons.Mail />}>Leave Requests</CardTitle>
            <div className="space-y-3">
              {leaveRequests.map((l, i) => (
                <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">{l.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge color={leaveTypeColors[l.type]}>{l.type}</Badge>
                      <span className="text-xs text-gray-400">{l.dates}</span>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <button className="px-2.5 py-1 rounded-lg bg-green-100 text-green-700 text-xs font-semibold hover:bg-green-200">Approve</button>
                    <button className="px-2.5 py-1 rounded-lg bg-red-100 text-red-600 text-xs font-semibold hover:bg-red-200">Reject</button>
                  </div>
                </div>
              ))}
            </div>
          </DashCard>
        </div>

        {/* Row 4: Performers & Dept */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          <DashCard accentColor="#4ECDC4">
            <CardTitle icon={<Icons.Chart />}>Top Performers</CardTitle>
            <div className="space-y-4">
              {performers.map(p => (
                <div key={p.name} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm text-white" style={{ backgroundColor: p.color }}>{p.initial}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-semibold text-gray-700 truncate">{p.name}</span>
                      <span className="text-gray-400 text-xs">{p.dept}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${p.pct}%`, backgroundColor: p.color }} />
                    </div>
                  </div>
                  <span className="text-xs font-bold text-gray-600 w-8 text-right">{p.pct}%</span>
                </div>
              ))}
            </div>
          </DashCard>

          <DashCard accentColor="#FF6B6B">
            <CardTitle icon={<Icons.Briefcase />}>Department Headcount</CardTitle>
            <div className="space-y-3">
              {departments.map(d => (
                <div key={d.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 font-medium">{d.name}</span>
                    <span className="font-bold text-gray-700">{d.count}</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${(d.count / maxDept) * 100}%`, backgroundColor: d.color }} />
                  </div>
                </div>
              ))}
            </div>
          </DashCard>
        </div>

        {/* Row 5: Announcements & Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <DashCard accentColor="#FFE66D">
            <CardTitle icon={<Icons.Mail />}>Announcements</CardTitle>
            <div className="space-y-4">
              {announcements.map((a, i) => (
                <div key={i} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge color={a.badge}>{a.category}</Badge>
                    <span className="text-xs text-gray-400">{a.time}</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-700">{a.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{a.desc}</p>
                </div>
              ))}
            </div>
          </DashCard>

          <DashCard accentColor="#A8E6CF">
            <CardTitle icon={<Icons.Briefcase />}>Quick Actions</CardTitle>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {quickActions.map(q => (
                <button key={q.label} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-800">
                  {q.icon}
                  <span className="text-xs font-medium text-center">{q.label}</span>
                </button>
              ))}
            </div>
          </DashCard>
        </div>
      </div>
    </>
  );
};

export default DashboardContent;