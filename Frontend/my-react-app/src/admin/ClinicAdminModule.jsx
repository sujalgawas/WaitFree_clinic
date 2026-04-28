import { useState, useEffect } from "react";

// ─── Icons (inline SVG components) ───────────────────────────────────────────
const Icon = ({ d, size = 18, color = "currentColor", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const Icons = {
  dashboard: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
  doctors: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z",
  patients: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 11a4 4 0 100-8 4 4 0 000 8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75",
  schedule: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  docs: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8",
  reports: "M18 20V10 M12 20V4 M6 20v-6",
  settings: "M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z",
  bell: "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 01-3.46 0",
  search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  chevronRight: "M9 18l6-6-6-6",
  chevronDown: "M6 9l6 6 6-6",
  plus: "M12 5v14M5 12h14",
  check: "M20 6L9 17l-5-5",
  x: "M18 6L6 18M6 6l12 12",
  eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 100 6 3 3 0 000-6z",
  edit: "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
  trash: "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",
  upload: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M17 8l-5-5-5 5 M12 3v12",
  filter: "M22 3H2l8 9.46V19l4 2v-8.54L22 3z",
  download: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M7 10l5 5 5-5 M12 15V3",
  logout: "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4 M16 17l5-5-5-5 M21 12H9",
  menu: "M3 12h18M3 6h18M3 18h18",
  activity: "M22 12h-4l-3 9L9 3l-3 9H2",
  clock: "M12 22a10 10 0 100-20 10 10 0 000 20z M12 6v6l4 2",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  user: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z",
  warning: "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z M12 9v4 M12 17h.01",
  info: "M12 22a10 10 0 100-20 10 10 0 000 20z M12 8v4 M12 16h.01",
};

// ─── Mock Data ────────────────────────────────────────────────────────────────
const mockDoctors = [
  { id: 1, name: "Dr. Priya Sharma", specialty: "Cardiologist", phone: "+91 98765 43210", email: "priya@clinic.com", status: "verified", patients: 142, rating: 4.9, joined: "Jan 2022", avatar: "PS", experience: "12 yrs", availableToday: true },
  { id: 2, name: "Dr. Rahul Mehta", specialty: "Neurologist", phone: "+91 98765 43211", email: "rahul@clinic.com", status: "pending", patients: 87, rating: 4.7, joined: "Mar 2023", avatar: "RM", experience: "8 yrs", availableToday: false },
  { id: 3, name: "Dr. Aisha Khan", specialty: "Pediatrician", phone: "+91 98765 43212", email: "aisha@clinic.com", status: "verified", patients: 203, rating: 4.8, joined: "Jun 2021", avatar: "AK", experience: "15 yrs", availableToday: true },
  { id: 4, name: "Dr. Vikram Nair", specialty: "Orthopedic", phone: "+91 98765 43213", email: "vikram@clinic.com", status: "rejected", patients: 56, rating: 4.2, joined: "Sep 2023", avatar: "VN", experience: "5 yrs", availableToday: false },
  { id: 5, name: "Dr. Sneha Patel", specialty: "Dermatologist", phone: "+91 98765 43214", email: "sneha@clinic.com", status: "verified", patients: 178, rating: 4.6, joined: "Feb 2022", avatar: "SP", experience: "10 yrs", availableToday: true },
  { id: 6, name: "Dr. Arjun Singh", specialty: "Psychiatrist", phone: "+91 98765 43215", email: "arjun@clinic.com", status: "pending", patients: 34, rating: 4.5, joined: "Nov 2023", avatar: "AS", experience: "6 yrs", availableToday: true },
];

const mockPatients = [
  { id: 101, name: "Meera Joshi", age: 34, gender: "Female", phone: "+91 99887 76655", email: "meera@email.com", blood: "O+", lastVisit: "02 Apr 2026", doctor: "Dr. Priya Sharma", status: "active", visits: 8, avatar: "MJ" },
  { id: 102, name: "Rajesh Kumar", age: 52, gender: "Male", phone: "+91 99887 76656", email: "rajesh@email.com", blood: "A+", lastVisit: "01 Apr 2026", doctor: "Dr. Rahul Mehta", status: "active", visits: 14, avatar: "RK" },
  { id: 103, name: "Sunita Devi", age: 67, gender: "Female", phone: "+91 99887 76657", email: "sunita@email.com", blood: "B-", lastVisit: "28 Mar 2026", doctor: "Dr. Aisha Khan", status: "inactive", visits: 3, avatar: "SD" },
  { id: 104, name: "Amit Verma", age: 28, gender: "Male", phone: "+91 99887 76658", email: "amit@email.com", blood: "AB+", lastVisit: "04 Apr 2026", doctor: "Dr. Sneha Patel", status: "active", visits: 2, avatar: "AV" },
  { id: 105, name: "Kavita Nair", age: 41, gender: "Female", phone: "+91 99887 76659", email: "kavita@email.com", blood: "O-", lastVisit: "03 Apr 2026", doctor: "Dr. Vikram Nair", status: "active", visits: 6, avatar: "KN" },
  { id: 106, name: "Deepak Rao", age: 59, gender: "Male", phone: "+91 99887 76660", email: "deepak@email.com", blood: "A-", lastVisit: "30 Mar 2026", doctor: "Dr. Arjun Singh", status: "critical", visits: 21, avatar: "DR" },
];

const mockAppointments = [
  { id: 1, patient: "Meera Joshi", doctor: "Dr. Priya Sharma", time: "09:00 AM", date: "05 Apr 2026", type: "Consultation", status: "confirmed", room: "R-101" },
  { id: 2, patient: "Rajesh Kumar", doctor: "Dr. Rahul Mehta", time: "09:30 AM", date: "05 Apr 2026", type: "Follow-up", status: "waiting", room: "R-202" },
  { id: 3, patient: "Amit Verma", doctor: "Dr. Sneha Patel", time: "10:00 AM", date: "05 Apr 2026", type: "Check-up", status: "completed", room: "R-103" },
  { id: 4, patient: "Kavita Nair", doctor: "Dr. Vikram Nair", time: "10:30 AM", date: "05 Apr 2026", type: "Consultation", status: "cancelled", room: "R-301" },
  { id: 5, patient: "Deepak Rao", doctor: "Dr. Arjun Singh", time: "11:00 AM", date: "05 Apr 2026", type: "Emergency", status: "confirmed", room: "R-104" },
  { id: 6, patient: "Sunita Devi", doctor: "Dr. Aisha Khan", time: "11:30 AM", date: "05 Apr 2026", type: "Vaccination", status: "waiting", room: "R-205" },
  { id: 7, patient: "Priti Shah", doctor: "Dr. Priya Sharma", time: "02:00 PM", date: "05 Apr 2026", type: "Consultation", status: "confirmed", room: "R-101" },
  { id: 8, patient: "Mohan Das", doctor: "Dr. Rahul Mehta", time: "02:30 PM", date: "05 Apr 2026", type: "Check-up", status: "confirmed", room: "R-202" },
];

const mockDocuments = [
  { id: 1, doctor: "Dr. Rahul Mehta", docType: "Medical Degree (MBBS)", uploaded: "02 Apr 2026", status: "pending", size: "2.4 MB", avatar: "RM" },
  { id: 2, doctor: "Dr. Arjun Singh", docType: "Medical Registration Certificate", uploaded: "03 Apr 2026", status: "pending", size: "1.8 MB", avatar: "AS" },
  { id: 3, doctor: "Dr. Priya Sharma", docType: "Specialty Certification", uploaded: "01 Apr 2026", status: "verified", size: "3.1 MB", avatar: "PS" },
  { id: 4, doctor: "Dr. Vikram Nair", docType: "Identity Proof (Aadhaar)", uploaded: "28 Mar 2026", status: "rejected", size: "0.9 MB", avatar: "VN" },
  { id: 5, doctor: "Dr. Aisha Khan", docType: "Experience Certificate", uploaded: "30 Mar 2026", status: "verified", size: "1.5 MB", avatar: "AK" },
  { id: 6, doctor: "Dr. Sneha Patel", docType: "Medical Degree (MD)", uploaded: "04 Apr 2026", status: "pending", size: "2.7 MB", avatar: "SP" },
];

const mockReports = [
  { id: 1, name: "Monthly Appointment Report", period: "March 2026", generated: "01 Apr 2026", size: "1.2 MB", type: "appointments" },
  { id: 2, name: "Doctor Performance Report", period: "Q1 2026", generated: "01 Apr 2026", size: "0.8 MB", type: "performance" },
  { id: 3, name: "Revenue Summary", period: "March 2026", generated: "01 Apr 2026", size: "0.5 MB", type: "revenue" },
  { id: 4, name: "Patient Demographics", period: "Q1 2026", generated: "01 Apr 2026", size: "2.1 MB", type: "patients" },
];

// ─── Reusable UI Components ───────────────────────────────────────────────────
const Badge = ({ status }) => {
  const map = {
    verified: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    pending: "bg-amber-50 text-amber-700 border border-amber-200",
    rejected: "bg-red-50 text-red-700 border border-red-200",
    confirmed: "bg-blue-50 text-blue-700 border border-blue-200",
    waiting: "bg-amber-50 text-amber-700 border border-amber-200",
    completed: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    cancelled: "bg-red-50 text-red-700 border border-red-200",
    active: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    inactive: "bg-slate-100 text-slate-600 border border-slate-200",
    critical: "bg-red-50 text-red-700 border border-red-200",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${map[status] || map.pending}`}>
      {status}
    </span>
  );
};

const Avatar = ({ initials, color = "blue", size = "md" }) => {
  const colors = {
    blue: "bg-blue-100 text-blue-700", green: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700", purple: "bg-purple-100 text-purple-700",
    rose: "bg-rose-100 text-rose-700", teal: "bg-teal-100 text-teal-700",
  };
  const sizes = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-12 h-12 text-base" };
  const colorKeys = Object.keys(colors);
  const colorKey = colorKeys[initials.charCodeAt(0) % colorKeys.length];
  return (
    <div className={`${sizes[size]} ${colors[colorKey]} rounded-full flex items-center justify-center font-semibold flex-shrink-0`}>
      {initials}
    </div>
  );
};

const StatCard = ({ label, value, sub, icon, color = "blue", trend }) => {
  const colors = {
    blue: { bg: "bg-blue-50", icon: "text-blue-600", border: "border-blue-100" },
    emerald: { bg: "bg-emerald-50", icon: "text-emerald-600", border: "border-emerald-100" },
    amber: { bg: "bg-amber-50", icon: "text-amber-600", border: "border-amber-100" },
    rose: { bg: "bg-rose-50", icon: "text-rose-600", border: "border-rose-100" },
  };
  const c = colors[color];
  return (
    <div className={`bg-white rounded-2xl border ${c.border} p-5 flex items-start gap-4`}>
      <div className={`${c.bg} ${c.icon} rounded-xl p-3 flex-shrink-0`}>
        <Icon d={Icons[icon]} size={20} />
      </div>
      <div className="min-w-0">
        <p className="text-slate-500 text-sm font-medium">{label}</p>
        <p className="text-2xl font-bold text-slate-800 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
        {trend && (
          <p className={`text-xs font-medium mt-1 ${trend > 0 ? "text-emerald-600" : "text-red-500"}`}>
            {trend > 0 ? "▲" : "▼"} {Math.abs(trend)}% vs last month
          </p>
        )}
      </div>
    </div>
  );
};

const SearchBar = ({ placeholder, value, onChange }) => (
  <div className="relative">
    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
      <Icon d={Icons.search} size={16} />
    </div>
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-700 placeholder-slate-400"
    />
  </div>
);

const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors">
            <Icon d={Icons.x} size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

const EmptyBar = ({ label, value, max, color = "blue" }) => {
  const colors = { blue: "bg-blue-500", emerald: "bg-emerald-500", amber: "bg-amber-500", rose: "bg-rose-500", purple: "bg-purple-500" };
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-slate-500 w-24 flex-shrink-0">{label}</span>
      <div className="flex-1 bg-slate-100 rounded-full h-2">
        <div className={`h-2 rounded-full ${colors[color]}`} style={{ width: `${(value / max) * 100}%` }} />
      </div>
      <span className="text-sm font-medium text-slate-700 w-8 text-right">{value}</span>
    </div>
  );
};

// ─── PAGE: Dashboard ──────────────────────────────────────────────────────────
const DashboardPage = ({ setPage }) => {
  const todayAppts = mockAppointments.filter(a => a.date === "05 Apr 2026").length;
  const waiting = mockAppointments.filter(a => a.status === "waiting").length;
  const pendingDocs = mockDocuments.filter(d => d.status === "pending").length;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
        <p className="text-blue-200 text-sm font-medium">Sunday, 05 April 2026</p>
        <h2 className="text-2xl font-bold mt-1">Good morning, Admin 👋</h2>
        <p className="text-blue-200 text-sm mt-1">Here's what's happening at your clinic today.</p>
        <div className="flex gap-3 mt-4 flex-wrap">
          <button onClick={() => setPage("appointments")} className="bg-white/20 hover:bg-white/30 text-white text-sm px-4 py-2 rounded-xl font-medium transition-colors backdrop-blur-sm">
            View Schedule
          </button>
          <button onClick={() => setPage("doctors")} className="bg-white/20 hover:bg-white/30 text-white text-sm px-4 py-2 rounded-xl font-medium transition-colors backdrop-blur-sm">
            Manage Doctors
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Today's Appointments" value={todayAppts} sub="05 Apr 2026" icon="schedule" color="blue" trend={12} />
        <StatCard label="Patients Waiting" value={waiting} sub="In queue now" icon="patients" color="amber" />
        <StatCard label="Active Doctors" value={mockDoctors.filter(d => d.availableToday).length} sub="Available today" icon="doctors" color="emerald" />
        <StatCard label="Pending Documents" value={pendingDocs} sub="Needs review" icon="docs" color="rose" trend={-5} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's queue */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Today's Appointments</h3>
            <button onClick={() => setPage("appointments")} className="text-blue-600 text-sm font-medium hover:underline">View all</button>
          </div>
          <div className="space-y-3">
            {mockAppointments.slice(0, 5).map(appt => (
              <div key={appt.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <Avatar initials={appt.patient.split(" ").map(n => n[0]).join("")} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{appt.patient}</p>
                  <p className="text-xs text-slate-500">{appt.doctor} · {appt.type}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-medium text-slate-700">{appt.time}</p>
                  <Badge status={appt.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick stats */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <h3 className="font-semibold text-slate-800 mb-4">Appointments by Status</h3>
            <div className="space-y-3">
              <EmptyBar label="Confirmed" value={mockAppointments.filter(a => a.status === "confirmed").length} max={8} color="blue" />
              <EmptyBar label="Waiting" value={mockAppointments.filter(a => a.status === "waiting").length} max={8} color="amber" />
              <EmptyBar label="Completed" value={mockAppointments.filter(a => a.status === "completed").length} max={8} color="emerald" />
              <EmptyBar label="Cancelled" value={mockAppointments.filter(a => a.status === "cancelled").length} max={8} color="rose" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <h3 className="font-semibold text-slate-800 mb-4">Doctor Verification</h3>
            <div className="space-y-3">
              <EmptyBar label="Verified" value={mockDoctors.filter(d => d.status === "verified").length} max={6} color="emerald" />
              <EmptyBar label="Pending" value={mockDoctors.filter(d => d.status === "pending").length} max={6} color="amber" />
              <EmptyBar label="Rejected" value={mockDoctors.filter(d => d.status === "rejected").length} max={6} color="rose" />
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5">
        <h3 className="font-semibold text-slate-800 mb-4">System Alerts</h3>
        <div className="space-y-3">
          {[
            { type: "warning", msg: `${pendingDocs} doctor documents pending verification`, action: "Review now", page: "documents" },
            { type: "info", msg: "Dr. Rahul Mehta profile is awaiting approval", action: "View profile", page: "doctors" },
            { type: "warning", msg: "2 appointments have no assigned room", action: "Fix schedule", page: "appointments" },
          ].map((alert, i) => (
            <div key={i} className={`flex items-start gap-3 p-3 rounded-xl ${alert.type === "warning" ? "bg-amber-50 border border-amber-100" : "bg-blue-50 border border-blue-100"}`}>
              <span className={alert.type === "warning" ? "text-amber-600 mt-0.5" : "text-blue-600 mt-0.5"}>
                <Icon d={alert.type === "warning" ? Icons.warning : Icons.info} size={16} />
              </span>
              <p className={`text-sm flex-1 ${alert.type === "warning" ? "text-amber-800" : "text-blue-800"}`}>{alert.msg}</p>
              <button onClick={() => setPage(alert.page)} className={`text-xs font-medium flex-shrink-0 ${alert.type === "warning" ? "text-amber-700 hover:text-amber-900" : "text-blue-700 hover:text-blue-900"}`}>
                {alert.action} →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── PAGE: Doctors ────────────────────────────────────────────────────────────
const DoctorsPage = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  const filtered = mockDoctors.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.specialty.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || d.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Doctor Management</h2>
          <p className="text-slate-500 text-sm mt-0.5">{mockDoctors.length} doctors registered</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
          <Icon d={Icons.plus} size={16} color="white" /> Add Doctor
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1"><SearchBar placeholder="Search by name or specialty..." value={search} onChange={setSearch} /></div>
        <div className="flex gap-2 flex-wrap">
          {["all", "verified", "pending", "rejected"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${filter === f ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Doctor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(doc => (
          <div key={doc.id} className="bg-white rounded-2xl border border-slate-100 p-5 hover:border-blue-200 hover:shadow-sm transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Avatar initials={doc.avatar} size="lg" />
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{doc.name}</p>
                  <p className="text-xs text-slate-500">{doc.specialty}</p>
                  <Badge status={doc.status} />
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => setSelected(doc)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors">
                  <Icon d={Icons.eye} size={15} />
                </button>
                <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                  <Icon d={Icons.edit} size={15} />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-50 rounded-lg p-2">
                <p className="text-lg font-bold text-slate-800">{doc.patients}</p>
                <p className="text-xs text-slate-500">Patients</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-2">
                <p className="text-lg font-bold text-slate-800">{doc.rating}</p>
                <p className="text-xs text-slate-500">Rating</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-2">
                <p className="text-lg font-bold text-slate-800">{doc.experience}</p>
                <p className="text-xs text-slate-500">Exp.</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
              <span>Joined {doc.joined}</span>
              <span className={`flex items-center gap-1 font-medium ${doc.availableToday ? "text-emerald-600" : "text-slate-400"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${doc.availableToday ? "bg-emerald-500" : "bg-slate-300"}`} />
                {doc.availableToday ? "Available today" : "Unavailable"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Doctor Detail Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Doctor Profile">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar initials={selected.avatar} size="lg" />
              <div>
                <h3 className="font-bold text-slate-800 text-lg">{selected.name}</h3>
                <p className="text-slate-500 text-sm">{selected.specialty}</p>
                <Badge status={selected.status} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label: "Phone", value: selected.phone },
                { label: "Email", value: selected.email },
                { label: "Experience", value: selected.experience },
                { label: "Joined", value: selected.joined },
                { label: "Total Patients", value: selected.patients },
                { label: "Rating", value: `${selected.rating} / 5.0` },
              ].map(row => (
                <div key={row.label} className="bg-slate-50 rounded-xl p-3">
                  <p className="text-slate-400 text-xs">{row.label}</p>
                  <p className="text-slate-800 font-medium mt-0.5">{row.value}</p>
                </div>
              ))}
            </div>
            {selected.status === "pending" && (
              <div className="flex gap-3">
                <button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2">
                  <Icon d={Icons.check} size={15} color="white" /> Approve
                </button>
                <button className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 border border-red-200">
                  <Icon d={Icons.x} size={15} /> Reject
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Add Doctor Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add New Doctor">
        <div className="space-y-4">
          {[
            { label: "Full Name", placeholder: "Dr. Full Name", type: "text" },
            { label: "Email", placeholder: "doctor@clinic.com", type: "email" },
            { label: "Phone", placeholder: "+91 XXXXX XXXXX", type: "tel" },
          ].map(f => (
            <div key={f.label}>
              <label className="block text-sm font-medium text-slate-700 mb-1">{f.label}</label>
              <input type={f.type} placeholder={f.placeholder}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Specialty</label>
            <select className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option>Cardiologist</option>
              <option>Neurologist</option>
              <option>Pediatrician</option>
              <option>Orthopedic</option>
              <option>Dermatologist</option>
              <option>Psychiatrist</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowAdd(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-sm font-medium transition-colors">Cancel</button>
            <button onClick={() => setShowAdd(false)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-medium transition-colors">Add Doctor</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// ─── PAGE: Patients ───────────────────────────────────────────────────────────
const PatientsPage = () => {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const filtered = mockPatients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.doctor.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Patient Management</h2>
          <p className="text-slate-500 text-sm mt-0.5">{mockPatients.length} patients registered</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
          <Icon d={Icons.plus} size={16} color="white" /> Register Patient
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Patients" value={mockPatients.length} icon="patients" color="blue" />
        <StatCard label="Active" value={mockPatients.filter(p => p.status === "active").length} icon="activity" color="emerald" />
        <StatCard label="Critical" value={mockPatients.filter(p => p.status === "critical").length} icon="warning" color="rose" />
        <StatCard label="Inactive" value={mockPatients.filter(p => p.status === "inactive").length} icon="user" color="amber" />
      </div>

      <SearchBar placeholder="Search by patient name or doctor..." value={search} onChange={setSearch} />

      {/* Patient Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {["Patient", "Age / Gender", "Blood Group", "Last Visit", "Assigned Doctor", "Visits", "Status", "Actions"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar initials={p.avatar} size="sm" />
                      <div>
                        <p className="font-medium text-slate-800">{p.name}</p>
                        <p className="text-xs text-slate-400">ID #{p.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{p.age} / {p.gender}</td>
                  <td className="px-4 py-3">
                    <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full text-xs font-semibold">{p.blood}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{p.lastVisit}</td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{p.doctor}</td>
                  <td className="px-4 py-3 text-center font-medium text-slate-700">{p.visits}</td>
                  <td className="px-4 py-3"><Badge status={p.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => setSelected(p)} className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors">
                        <Icon d={Icons.eye} size={15} />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                        <Icon d={Icons.edit} size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Patient Detail Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Patient Record">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar initials={selected.avatar} size="lg" />
              <div>
                <h3 className="font-bold text-slate-800 text-lg">{selected.name}</h3>
                <p className="text-slate-500 text-sm">Patient ID: #{selected.id}</p>
                <Badge status={selected.status} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label: "Age", value: `${selected.age} years` },
                { label: "Gender", value: selected.gender },
                { label: "Blood Group", value: selected.blood },
                { label: "Phone", value: selected.phone },
                { label: "Email", value: selected.email },
                { label: "Last Visit", value: selected.lastVisit },
                { label: "Total Visits", value: selected.visits },
                { label: "Assigned Doctor", value: selected.doctor },
              ].map(row => (
                <div key={row.label} className="bg-slate-50 rounded-xl p-3">
                  <p className="text-slate-400 text-xs">{row.label}</p>
                  <p className="text-slate-800 font-medium mt-0.5">{row.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

// ─── PAGE: Appointments ───────────────────────────────────────────────────────
const AppointmentsPage = () => {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showBook, setShowBook] = useState(false);

  const filtered = mockAppointments.filter(a => {
    const matchSearch = a.patient.toLowerCase().includes(search.toLowerCase()) ||
      a.doctor.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filterStatus === "all" || a.status === filterStatus;
    return matchSearch && matchFilter;
  });

  const timeSlots = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Appointments & Schedule</h2>
          <p className="text-slate-500 text-sm mt-0.5">Managing {mockAppointments.length} appointments today</p>
        </div>
        <button onClick={() => setShowBook(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
          <Icon d={Icons.plus} size={16} color="white" /> Book Appointment
        </button>
      </div>

      {/* Status tabs + stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {["confirmed", "waiting", "completed", "cancelled"].map((s, i) => {
          const colors = ["blue", "amber", "emerald", "rose"];
          const icons = ["check", "clock", "activity", "x"];
          return (
            <StatCard key={s} label={s.charAt(0).toUpperCase() + s.slice(1)}
              value={mockAppointments.filter(a => a.status === s).length}
              icon={icons[i]} color={colors[i]} />
          );
        })}
      </div>

      {/* Time slot visual */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5">
        <h3 className="font-semibold text-slate-800 mb-4">Today's Time Slots</h3>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {timeSlots.map(slot => {
            const appt = mockAppointments.find(a => a.time === slot + " AM" || a.time === slot + " PM" || a.time.startsWith(slot));
            return (
              <div key={slot} className={`rounded-xl p-2 text-center text-xs font-medium border transition-colors cursor-pointer
                ${appt
                  ? appt.status === "confirmed" ? "bg-blue-50 border-blue-200 text-blue-700"
                    : appt.status === "waiting" ? "bg-amber-50 border-amber-200 text-amber-700"
                      : appt.status === "completed" ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                        : "bg-red-50 border-red-200 text-red-500 line-through"
                  : "bg-slate-50 border-slate-200 text-slate-400 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600"
                }`}>
                {slot}
                {appt && <div className="mt-0.5 truncate" style={{ fontSize: 10 }}>{appt.patient.split(" ")[0]}</div>}
              </div>
            );
          })}
        </div>
        <div className="flex gap-4 mt-4 flex-wrap text-xs text-slate-500">
          {[["bg-blue-200", "Confirmed"], ["bg-amber-200", "Waiting"], ["bg-emerald-200", "Completed"], ["bg-red-200", "Cancelled"], ["bg-slate-200", "Free"]].map(([c, l]) => (
            <span key={l} className="flex items-center gap-1.5"><span className={`w-3 h-3 rounded ${c}`} />{l}</span>
          ))}
        </div>
      </div>

      {/* Appointments Table */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1"><SearchBar placeholder="Search patient or doctor..." value={search} onChange={setSearch} /></div>
        <div className="flex gap-2 flex-wrap">
          {["all", "confirmed", "waiting", "completed", "cancelled"].map(f => (
            <button key={f} onClick={() => setFilterStatus(f)}
              className={`px-3 py-2 rounded-xl text-xs font-medium capitalize transition-colors ${filterStatus === f ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {["Patient", "Doctor", "Time", "Type", "Room", "Status", "Actions"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(a => (
                <tr key={a.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar initials={a.patient.split(" ").map(n => n[0]).join("")} size="sm" />
                      <span className="font-medium text-slate-800">{a.patient}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{a.doctor}</td>
                  <td className="px-4 py-3 font-medium text-slate-700 whitespace-nowrap">{a.time}</td>
                  <td className="px-4 py-3 text-slate-600">{a.type}</td>
                  <td className="px-4 py-3">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg text-xs font-mono">{a.room}</span>
                  </td>
                  <td className="px-4 py-3"><Badge status={a.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                        <Icon d={Icons.edit} size={15} />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors">
                        <Icon d={Icons.trash} size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Book Modal */}
      <Modal open={showBook} onClose={() => setShowBook(false)} title="Book New Appointment">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Patient</label>
            <select className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              {mockPatients.map(p => <option key={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Doctor</label>
            <select className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              {mockDoctors.map(d => <option key={d.id}>{d.name} — {d.specialty}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
              <input type="date" defaultValue="2026-04-05" className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Time</label>
              <select className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                {timeSlots.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Appointment Type</label>
            <select className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              {["Consultation", "Follow-up", "Check-up", "Emergency", "Vaccination"].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowBook(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-sm font-medium transition-colors">Cancel</button>
            <button onClick={() => setShowBook(false)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-medium transition-colors">Book Now</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// ─── PAGE: Documents ──────────────────────────────────────────────────────────
const DocumentsPage = () => {
  const [filter, setFilter] = useState("all");
  const [docs, setDocs] = useState(mockDocuments);

  const filtered = docs.filter(d => filter === "all" || d.status === filter);

  const updateStatus = (id, status) => {
    setDocs(prev => prev.map(d => d.id === id ? { ...d, status } : d));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Document Verification</h2>
          <p className="text-slate-500 text-sm mt-0.5">{docs.filter(d => d.status === "pending").length} documents pending review</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
          <Icon d={Icons.upload} size={16} color="white" /> Upload Document
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Pending Review" value={docs.filter(d => d.status === "pending").length} icon="clock" color="amber" />
        <StatCard label="Verified" value={docs.filter(d => d.status === "verified").length} icon="shield" color="emerald" />
        <StatCard label="Rejected" value={docs.filter(d => d.status === "rejected").length} icon="x" color="rose" />
      </div>

      <div className="flex gap-2 flex-wrap">
        {["all", "pending", "verified", "rejected"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${filter === f ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
            {f} {f !== "all" && `(${docs.filter(d => d.status === f).length})`}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(doc => (
          <div key={doc.id} className={`bg-white rounded-2xl border p-5 transition-all ${doc.status === "pending" ? "border-amber-200" : doc.status === "verified" ? "border-emerald-200" : "border-red-200"}`}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Avatar initials={doc.avatar} size="md" />
                <div className="min-w-0">
                  <p className="font-semibold text-slate-800">{doc.doctor}</p>
                  <p className="text-sm text-slate-500 truncate">{doc.docType}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                    <span>Uploaded: {doc.uploaded}</span>
                    <span>Size: {doc.size}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <Badge status={doc.status} />
                <button className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-2 rounded-xl hover:bg-blue-50 transition-colors border border-blue-200">
                  <Icon d={Icons.eye} size={14} /> Preview
                </button>
                {doc.status === "pending" && (
                  <>
                    <button onClick={() => updateStatus(doc.id, "verified")} className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-3 py-2 rounded-xl transition-colors">
                      <Icon d={Icons.check} size={14} color="white" /> Approve
                    </button>
                    <button onClick={() => updateStatus(doc.id, "rejected")} className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-medium px-3 py-2 rounded-xl transition-colors border border-red-200">
                      <Icon d={Icons.x} size={14} /> Reject
                    </button>
                  </>
                )}
                {doc.status === "rejected" && (
                  <button onClick={() => updateStatus(doc.id, "pending")} className="text-sm text-amber-700 font-medium px-3 py-2 rounded-xl hover:bg-amber-50 transition-colors border border-amber-200">
                    Re-review
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Audit Log */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5">
        <h3 className="font-semibold text-slate-800 mb-4">Audit Log</h3>
        <div className="space-y-3">
          {[
            { action: "Approved", doc: "Medical Degree (MBBS)", by: "Admin", time: "Today 10:22 AM", color: "emerald" },
            { action: "Rejected", doc: "Identity Proof (Aadhaar)", by: "Admin", time: "28 Mar 12:01 PM", color: "red" },
            { action: "Uploaded", doc: "Specialty Certification", by: "Dr. Priya Sharma", time: "01 Apr 9:45 AM", color: "blue" },
          ].map((log, i) => (
            <div key={i} className="flex items-center gap-3 text-sm">
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${log.color === "emerald" ? "bg-emerald-500" : log.color === "red" ? "bg-red-500" : "bg-blue-500"}`} />
              <span className={`font-medium ${log.color === "emerald" ? "text-emerald-700" : log.color === "red" ? "text-red-700" : "text-blue-700"}`}>{log.action}</span>
              <span className="text-slate-600">— {log.doc}</span>
              <span className="text-slate-400 ml-auto whitespace-nowrap">{log.by} · {log.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── PAGE: Reports & Analytics ────────────────────────────────────────────────
const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState("analytics");

  const monthlyData = [
    { month: "Oct", appts: 312 }, { month: "Nov", appts: 289 }, { month: "Dec", appts: 341 },
    { month: "Jan", appts: 298 }, { month: "Feb", appts: 356 }, { month: "Mar", appts: 401 },
  ];
  const maxAppts = Math.max(...monthlyData.map(d => d.appts));

  const specialtyData = [
    { name: "Cardiology", count: 142, color: "bg-blue-500" },
    { name: "Pediatrics", count: 203, color: "bg-emerald-500" },
    { name: "Neurology", count: 87, color: "bg-purple-500" },
    { name: "Dermatology", count: 178, color: "bg-rose-500" },
    { name: "Orthopedic", count: 56, color: "bg-amber-500" },
    { name: "Psychiatry", count: 34, color: "bg-teal-500" },
  ];
  const totalPatients = specialtyData.reduce((a, b) => a + b.count, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Reports & Analytics</h2>
          <p className="text-slate-500 text-sm mt-0.5">Performance insights for your clinic</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
            <Icon d={Icons.download} size={16} /> Export PDF
          </button>
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
            <Icon d={Icons.download} size={16} color="white" /> Export CSV
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {["analytics", "reports"].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${activeTab === tab ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "analytics" ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Appointments" value="1,997" sub="All time" icon="schedule" color="blue" trend={12} />
            <StatCard label="Total Patients" value="700" sub="Registered" icon="patients" color="emerald" trend={8} />
            <StatCard label="Active Doctors" value="6" sub="On platform" icon="doctors" color="amber" />
            <StatCard label="Avg. Rating" value="4.7" sub="Across all doctors" icon="activity" color="rose" trend={3} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5">
              <h3 className="font-semibold text-slate-800 mb-2">Monthly Appointments</h3>
              <p className="text-xs text-slate-400 mb-5">Oct 2025 — Mar 2026</p>
              <div className="flex items-end gap-3 h-40">
                {monthlyData.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs text-slate-500 font-medium">{d.appts}</span>
                    <div className="w-full bg-blue-500 rounded-t-lg transition-all hover:bg-blue-600"
                      style={{ height: `${(d.appts / maxAppts) * 120}px` }} />
                    <span className="text-xs text-slate-400">{d.month}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Specialty breakdown */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5">
              <h3 className="font-semibold text-slate-800 mb-2">Patients by Specialty</h3>
              <p className="text-xs text-slate-400 mb-5">Total: {totalPatients} patients</p>
              <div className="space-y-3">
                {specialtyData.map((s, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 w-20 flex-shrink-0">{s.name}</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-2">
                      <div className={`h-2 rounded-full ${s.color}`} style={{ width: `${(s.count / totalPatients) * 100}%` }} />
                    </div>
                    <span className="text-xs font-medium text-slate-700 w-8 text-right">{s.count}</span>
                    <span className="text-xs text-slate-400 w-8 text-right">{Math.round((s.count / totalPatients) * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Doctor performance */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <h3 className="font-semibold text-slate-800 mb-4">Doctor Performance</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    {["Doctor", "Specialty", "Patients", "Appointments", "Rating", "Status"].map(h => (
                      <th key={h} className="text-left pb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider pr-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {mockDoctors.map(doc => (
                    <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <Avatar initials={doc.avatar} size="sm" />
                          <span className="font-medium text-slate-800">{doc.name}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-slate-600">{doc.specialty}</td>
                      <td className="py-3 pr-4 font-medium text-slate-700">{doc.patients}</td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-100 rounded-full h-1.5" style={{ minWidth: 60 }}>
                            <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${(doc.patients / 210) * 100}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="font-semibold text-slate-800">{doc.rating}</span>
                        <span className="text-slate-400 text-xs"> /5</span>
                      </td>
                      <td className="py-3"><Badge status={doc.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          {mockReports.map(r => (
            <div key={r.id} className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="bg-blue-50 text-blue-600 rounded-xl p-3 flex-shrink-0">
                  <Icon d={Icons.reports} size={20} />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-800">{r.name}</p>
                  <p className="text-sm text-slate-500">{r.period} · Generated {r.generated} · {r.size}</p>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button className="flex items-center gap-2 text-slate-600 hover:text-slate-800 text-sm font-medium px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors border border-slate-200">
                  <Icon d={Icons.eye} size={14} /> View
                </button>
                <button className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-2 rounded-xl hover:bg-blue-50 transition-colors border border-blue-200">
                  <Icon d={Icons.download} size={14} /> Download
                </button>
              </div>
            </div>
          ))}

          {/* Schedule new report */}
          <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-300 p-6 text-center">
            <div className="text-slate-400 mb-2 flex justify-center"><Icon d={Icons.reports} size={32} /></div>
            <p className="font-medium text-slate-700 mb-1">Schedule a New Report</p>
            <p className="text-sm text-slate-500 mb-4">Generate custom reports on demand or schedule automatic delivery</p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors inline-flex items-center gap-2">
              <Icon d={Icons.plus} size={15} color="white" /> Generate Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── PAGE: Settings ───────────────────────────────────────────────────────────
const SettingsPage = () => {
  const [activeSection, setActiveSection] = useState("general");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const sections = [
    { id: "general", label: "General" },
    { id: "roles", label: "Roles & Permissions" },
    { id: "notifications", label: "Notifications" },
    { id: "security", label: "Security" },
  ];

  const roles = [
    { name: "Super Admin", count: 1, perms: ["Full system access", "User management", "System config", "Reports"] },
    { name: "Clinic Admin", count: 2, perms: ["Doctor management", "Patient records", "Schedule", "Reports"] },
    { name: "Receptionist", count: 4, perms: ["View appointments", "Book appointments", "Patient intake"] },
    { name: "Doctor", count: 6, perms: ["Own schedule", "Patient notes (own)", "Profile management"] },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">System Settings</h2>
        <p className="text-slate-500 text-sm mt-0.5">Manage clinic configuration, roles, and preferences</p>
      </div>

      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit flex-wrap">
        {sections.map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeSection === s.id ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
            {s.label}
          </button>
        ))}
      </div>

      {activeSection === "general" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
            <h3 className="font-semibold text-slate-800">Clinic Information</h3>
            {[
              { label: "Clinic Name", value: "WaitFree Clinic" },
              { label: "Registration Number", value: "CLN-MH-2021-00142" },
              { label: "Address", value: "Mumbai, Maharashtra, India" },
              { label: "Phone", value: "+91 22 4567 8900" },
              { label: "Email", value: "admin@waitfreeclinic.com" },
            ].map(f => (
              <div key={f.label}>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">{f.label}</label>
                <input defaultValue={f.value} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700" />
              </div>
            ))}
          </div>
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
              <h3 className="font-semibold text-slate-800">Operating Hours</h3>
              {["Monday - Friday", "Saturday", "Sunday"].map((day, i) => (
                <div key={day} className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">{day}</span>
                  {i === 2 ? (
                    <span className="text-sm text-red-500 font-medium">Closed</span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input defaultValue={i === 0 ? "09:00" : "09:00"} type="time" className="px-2 py-1 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <span className="text-slate-400 text-xs">to</span>
                      <input defaultValue={i === 0 ? "20:00" : "14:00"} type="time" className="px-2 py-1 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3">
              <h3 className="font-semibold text-slate-800">Preferences</h3>
              {[
                { label: "Auto-confirm appointments", defaultChecked: true },
                { label: "Send SMS reminders", defaultChecked: true },
                { label: "Send email reminders", defaultChecked: false },
                { label: "Allow online booking", defaultChecked: true },
              ].map(p => (
                <label key={p.label} className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-slate-700">{p.label}</span>
                  <div className="relative">
                    <input type="checkbox" defaultChecked={p.defaultChecked} className="sr-only peer" />
                    <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:bg-blue-600 transition-colors" />
                    <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSection === "roles" && (
        <div className="space-y-4">
          {roles.map(role => (
            <div key={role.name} className="bg-white rounded-2xl border border-slate-100 p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-slate-800">{role.name}</h3>
                  <p className="text-sm text-slate-500">{role.count} user{role.count > 1 ? "s" : ""} assigned</p>
                </div>
                <button className="text-sm text-blue-600 font-medium hover:underline">Edit permissions</button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {role.perms.map(p => (
                  <span key={p} className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg text-xs font-medium">{p}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeSection === "notifications" && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-5">
          <h3 className="font-semibold text-slate-800">Notification Templates</h3>
          {[
            { label: "Appointment Confirmation SMS", value: "Hi {patient_name}, your appointment with {doctor_name} is confirmed for {date} at {time}. — WaitFree Clinic" },
            { label: "Appointment Reminder", value: "Reminder: You have an appointment tomorrow at {time} with {doctor_name}. Please arrive 10 mins early." },
            { label: "Document Request", value: "Dear Dr. {doctor_name}, please upload your {document_type} to complete your profile verification." },
          ].map(t => (
            <div key={t.label}>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t.label}</label>
              <textarea defaultValue={t.value} rows={3}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 resize-none" />
            </div>
          ))}
        </div>
      )}

      {activeSection === "security" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
            <h3 className="font-semibold text-slate-800">Change Password</h3>
            {["Current Password", "New Password", "Confirm New Password"].map(f => (
              <div key={f}>
                <label className="block text-sm font-medium text-slate-700 mb-1">{f}</label>
                <input type="password" placeholder="••••••••" className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            ))}
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-medium transition-colors">Update Password</button>
          </div>
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3">
              <h3 className="font-semibold text-slate-800">Security Settings</h3>
              {[
                { label: "Two-Factor Authentication", on: true },
                { label: "Session timeout (30 min)", on: true },
                { label: "IP whitelist enforcement", on: false },
                { label: "Audit logging", on: true },
              ].map(s => (
                <label key={s.label} className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-slate-700">{s.label}</span>
                  <div className="relative">
                    <input type="checkbox" defaultChecked={s.on} className="sr-only peer" />
                    <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:bg-blue-600 transition-colors" />
                    <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
                  </div>
                </label>
              ))}
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 p-5">
              <h3 className="font-semibold text-slate-800 mb-3">Recent Login Activity</h3>
              <div className="space-y-2 text-sm">
                {[
                  { device: "Chrome · Mumbai", time: "Today 8:45 AM", current: true },
                  { device: "Safari · iPhone", time: "Yesterday 7:12 PM", current: false },
                  { device: "Chrome · Mumbai", time: "02 Apr 9:00 AM", current: false },
                ].map((log, i) => (
                  <div key={i} className="flex items-center justify-between py-1">
                    <div>
                      <p className="text-slate-700 font-medium">{log.device}</p>
                      <p className="text-xs text-slate-400">{log.time}</p>
                    </div>
                    {log.current && <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">Current</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3">
        <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">Discard</button>
        <button onClick={handleSave} className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${saved ? "bg-emerald-600 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}`}>
          {saved ? <><Icon d={Icons.check} size={15} color="white" /> Saved!</> : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const navItems = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard" },
  { id: "doctors", label: "Doctors", icon: "doctors" },
  { id: "patients", label: "Patients", icon: "patients" },
  { id: "appointments", label: "Appointments", icon: "schedule" },
  { id: "documents", label: "Documents", icon: "docs" },
  { id: "reports", label: "Reports", icon: "reports" },
  { id: "settings", label: "Settings", icon: "settings" },
];

const Sidebar = ({ page, setPage, open, setOpen }) => {
  const pendingCount = mockDocuments.filter(d => d.status === "pending").length;

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 lg:hidden" onClick={() => setOpen(false)} />
      )}

      <aside className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-100 z-40 flex flex-col transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        {/* Logo */}
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Icon d={Icons.activity} size={18} color="white" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm leading-tight">WaitFree Clinic</p>
              <p className="text-xs text-slate-400">Admin Portal</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setPage(item.id); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative
                ${page === item.id
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                }`}
            >
              <span className={page === item.id ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"}>
                <Icon d={Icons[item.icon]} size={18} />
              </span>
              {item.label}
              {item.id === "documents" && pendingCount > 0 && (
                <span className="ml-auto bg-amber-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">SA</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">Super Admin</p>
              <p className="text-xs text-slate-400 truncate">admin@waitfreeclinic.com</p>
            </div>
            <span className="text-slate-300 group-hover:text-slate-500 transition-colors">
              <Icon d={Icons.logout} size={15} />
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};

// ─── Top Bar ──────────────────────────────────────────────────────────────────
const TopBar = ({ page, setOpen }) => {
  const breadcrumb = navItems.find(n => n.id === page)?.label || page;
  const pendingDocs = mockDocuments.filter(d => d.status === "pending").length;

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button onClick={() => setOpen(o => !o)} className="lg:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
          <Icon d={Icons.menu} size={20} />
        </button>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-400">Admin</span>
          <Icon d={Icons.chevronRight} size={14} color="#94a3b8" />
          <span className="font-semibold text-slate-800">{breadcrumb}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-400">
          <Icon d={Icons.clock} size={12} />
          <span className="font-medium text-slate-600">05 Apr 2026, 09:00 AM</span>
        </div>
        <button className="relative p-2.5 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
          <Icon d={Icons.bell} size={18} />
          {pendingDocs > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </button>
      </div>
    </header>
  );
};

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function ClinicAdminModule() {
  const [page, setPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderPage = () => {
    switch (page) {
      case "dashboard": return <DashboardPage setPage={setPage} />;
      case "doctors": return <DoctorsPage />;
      case "patients": return <PatientsPage />;
      case "appointments": return <AppointmentsPage />;
      case "documents": return <DocumentsPage />;
      case "reports": return <ReportsPage />;
      case "settings": return <SettingsPage />;
      default: return <DashboardPage setPage={setPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Sidebar page={page} setPage={setPage} open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <TopBar page={page} setOpen={setSidebarOpen} />
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
