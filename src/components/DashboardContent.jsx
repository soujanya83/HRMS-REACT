import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import {
  Icons,
  DashCard,
  CardTitle,
  Badge,
  StatCard,
  ColorPaletteModal
} from './Dashboard/DashboardShared';

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
  const context = useOutletContext();
  const user = context?.user || null;

  // Use the theme context instead of outlet context
  const { sidebarColor, setSidebarColor, backgroundColor, setBackgroundColor } = useTheme();

  // Calendar grid
  const calendarCells = [];
  for (let i = 0; i < firstDay; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);

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
          // console.log('Setting sidebar color to:', color);
          setSidebarColor(color);
          // Also save to localStorage directly as backup
          localStorage.setItem('sidebarColor', color);
        }}
        onBackgroundColorSelect={(color) => {
          //console.log('Setting background color to:', color);
          setBackgroundColor(color);
          localStorage.setItem('backgroundColor', color);
        }}

        currentSidebarColor={sidebarColor}
        currentBgColor={backgroundColor}
      />

      {/* Main Content */}
      <div className="p-6 min-h-screen transition-colors duration-300" style={{ backgroundColor: backgroundColor }}>
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {statCards.map((s) => (
              <StatCard key={s.label} {...s} />
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${r.status === 'On Duty' ? 'bg-green-100 text-green-700' :
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                    <span key={i} className={`py-1 rounded-full font-medium transition-colors ${isToday ? 'bg-blue-200 text-blue-800 font-bold' :
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
      </div>
    </>
  );
};

export default DashboardContent;