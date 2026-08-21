import { useApp, NAV_PAGES } from '../context/AppContext';
import {
  RiDashboardLine,
  RiUserHeartLine,
  RiBookOpenLine,
  RiCodeSSlashLine,
  RiMicLine,
  RiMagicLine,
  RiLineChartLine,
} from 'react-icons/ri';
import { HiOutlineLightningBolt, HiSparkles } from 'react-icons/hi';

const PAGE_ICONS = {
  'dashboard': <RiDashboardLine />,
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
  const { student, currentPage, setCurrentPage } = useApp();

  return (
    <aside
      style={{ width: 240, minWidth: 240, background: 'var(--sidebar-bg)', borderRight: '1px solid #1E202B' }}
      className="flex flex-col h-screen sticky top-0 overflow-y-auto z-20"
    >
      {/* ── Logo ── */}
      <div className="flex items-center gap-3 px-6 py-6 mb-2">
        <span
          className="flex items-center justify-center rounded-xl text-white text-lg shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
            width: 36,
            height: 36,
            boxShadow: '0 4px 14px rgba(124, 58, 237, 0.4)',
          }}
        >
          <HiOutlineLightningBolt />
        </span>
        <span className="text-white font-extrabold text-lg tracking-tight leading-none">
          Career <span className="text-purple-400">OS</span>
        </span>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 px-3 space-y-1">
        <p className="text-[11px] font-bold uppercase tracking-widest px-3 mb-2 text-slate-500">
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
            <span>{label}</span>
          </button>
        ))}
      </nav>



      {/* ── Student Card ── */}
      {student && (
        <div
          className="mx-3 mb-4 p-3 rounded-2xl flex items-center gap-3"
          style={{ background: '#1E202B', border: '1px solid #2B2E3C' }}
        >
          {/* Avatar */}
          <div
            className="flex items-center justify-center rounded-xl text-white text-sm font-bold flex-shrink-0 shadow-md"
            style={{ width: 38, height: 38, background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)' }}
          >
            {getInitials(student.name)}
          </div>
          {/* Info */}
          <div className="min-w-0">
            <p className="text-white text-sm font-bold truncate leading-tight">
              {student.name}
            </p>
            <span
              className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 truncate max-w-full text-purple-300 bg-purple-950/80 border border-purple-800/60"
            >
              {student.targetRole}
            </span>
          </div>
        </div>
      )}
    </aside>
  );
}
