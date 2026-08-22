import { useApp, NAV_PAGES } from '../context/AppContext';
import {
  RiDashboardLine,
  RiFolder3Line,
  RiUserHeartLine,
  RiBookOpenLine,
  RiCodeSSlashLine,
  RiMicLine,
  RiMagicLine,
  RiLineChartLine,
} from 'react-icons/ri';
import { HiOutlineLightningBolt } from 'react-icons/hi';

const PAGE_ICONS = {
  'dashboard': <RiDashboardLine />,
  'evidence-hub': <RiFolder3Line />,
  'career-twin': <RiUserHeartLine />,
  'learning-plan': <RiBookOpenLine />,
  'practice': <RiCodeSSlashLine />,
  'mock-interview': <RiMicLine />,
  'simulator': <RiMagicLine />,
  'progress': <RiLineChartLine />,
};

function getInitials(name = '') {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function Sidebar() {
  const { student, currentPage, setCurrentPage, logout } = useApp();

  return (
    <aside
      style={{ width: 240, minWidth: 240, background: 'var(--sidebar-bg)', borderRight: '1px solid #282D38' }}
      className="flex flex-col h-screen sticky top-0 overflow-y-auto z-20"
    >
      {/* ── Logo ── */}
      <div className="flex items-center gap-3 px-6 py-6 mb-2">
        <span
          className="flex items-center justify-center rounded-xl text-white text-lg shadow-sm"
          style={{
            background: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
            width: 34,
            height: 34,
          }}
        >
          <HiOutlineLightningBolt />
        </span>
        <span className="text-[#F5F7FA] font-extrabold text-lg tracking-tight leading-none">
          Career <span className="text-[#A78BFA]">OS</span>
        </span>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 px-3 space-y-1.5">
        <p className="text-[10px] font-bold uppercase tracking-widest px-3 mb-2 text-[#737B8C]">
          Navigation
        </p>
        {NAV_PAGES.map(({ id, label }) => (
          <button
            key={id}
            id={`nav-${id}`}
            className={`nav-link w-full text-left${currentPage === id ? ' active' : ''}`}
            onClick={() => setCurrentPage(id)}
          >
            <span className="nav-icon">{PAGE_ICONS[id]}</span>
            <span className="truncate">{label}</span>
          </button>
        ))}
      </nav>

      {/* ── Student Profile Card & Logout ── */}
      {student && (
        <div className="mx-3 mb-4 space-y-2">
          <div className="p-3 rounded-xl flex items-center gap-3 border border-[#282D38] bg-[#171A22]">
            <div
              className="flex items-center justify-center rounded-lg text-white text-xs font-bold flex-shrink-0"
              style={{ width: 34, height: 34, background: 'linear-gradient(135deg, #4F46E5 0%, #8B5CF6 100%)' }}
            >
              {getInitials(student.name)}
            </div>
            <div className="min-w-0">
              <p className="text-[#F5F7FA] text-xs font-bold truncate leading-tight">
                {student.name}
              </p>
              <span
                className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-0.5 truncate max-w-full text-[#A78BFA] bg-[rgba(139,92,246,0.12)] border border-[rgba(139,92,246,0.25)]"
              >
                {student.targetRole}
              </span>
            </div>
          </div>

          <button
            id="sidebar-logout-btn"
            onClick={logout}
            className="w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-200"
            style={{
              background: 'rgba(248, 113, 113, 0.08)',
              border: '1px solid rgba(248, 113, 113, 0.2)',
              color: '#F87171',
            }}
          >
            <span>🚪 Logout</span>
          </button>
        </div>
      )}
    </aside>
  );
}
