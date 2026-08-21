import { useApp, NAV_PAGES } from '../context/AppContext';
import { HiOutlineBell, HiOutlineSearch, HiPlus } from 'react-icons/hi';

function ReadinessBadge({ value }) {
  if (value == null) return null;

  let bg, text, ring;
  if (value >= 70)      { bg = 'rgba(16, 185, 129, 0.15)'; text = '#34D399'; ring = 'rgba(16, 185, 129, 0.4)'; }
  else if (value >= 50) { bg = 'rgba(245, 158, 11, 0.15)'; text = '#FBBF24'; ring = 'rgba(245, 158, 11, 0.4)'; }
  else                  { bg = 'rgba(239, 68, 68, 0.15)';  text = '#F87171'; ring = 'rgba(239, 68, 68, 0.4)'; }

  return (
    <span
      className="inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-md"
      style={{ background: bg, color: text, border: `1px solid ${ring}` }}
    >
      <span
        className="inline-block w-2 h-2 rounded-full animate-pulse"
        style={{ background: text }}
      />
      {value}% Career Ready
    </span>
  );
}

export default function TopBar() {
  const { student, currentPage } = useApp();

  const pageLabel = NAV_PAGES.find((p) => p.id === currentPage)?.label ?? 'Dashboard';

  return (
    <header
      className="sticky top-0 z-10 flex items-center justify-between px-8"
      style={{
        height: 72,
        background: '#171922',
        borderBottom: '1px solid #262936',
      }}
    >
      {/* Search Input (Matches screenshot top left) */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center">
          <HiOutlineSearch className="absolute left-3.5 text-slate-400 text-base pointer-events-none" />
          <input
            type="text"
            placeholder="Search topics, skills, assessments..."
            className="pl-10 pr-4 py-2 rounded-xl text-xs font-medium bg-[#20232D] text-white border border-[#2B2E3C] focus:outline-none focus:border-indigo-500 w-64 md:w-80 transition-all placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Right Action Cluster (Matches screenshot top right) */}
      <div className="flex items-center gap-4">
        {/* Primary Action Button (Matches "+ Create new order" button in screenshot) */}
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs text-white transition-all shadow-md hover:bg-blue-600 active:scale-95"
          style={{ background: '#2563EB', boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)' }}
        >
          <HiPlus className="text-base" />
          <span>New Daily Mission</span>
        </button>

        {/* Readiness Badge */}
        <ReadinessBadge value={student?.careerReadiness} />

        {/* Notification Bell Icon */}
        <button
          id="topbar-notifications"
          className="relative flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-[#20232D] transition-colors border border-[#2B2E3C]"
          style={{ width: 40, height: 40, background: '#1E202B' }}
        >
          <HiOutlineBell className="text-lg" />
          <span className="absolute top-2 right-2 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-indigo-500" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
          </span>
        </button>

        {/* User avatar dot */}
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shadow-md">
          {student?.name ? student.name.charAt(0) : 'A'}
        </div>
      </div>
    </header>
  );
}
