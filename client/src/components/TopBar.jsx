import { useApp } from '../context/AppContext';
import { HiOutlineBell, HiOutlineSearch, HiPlus } from 'react-icons/hi';

function ReadinessBadge({ value }) {
  if (value == null) return null;

  return (
    <span
      className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full"
      style={{
        background: 'rgba(52, 211, 153, 0.08)',
        border: '1px solid rgba(52, 211, 153, 0.25)',
        color: '#34D399',
      }}
    >
      <span className="inline-block w-2 h-2 rounded-full bg-[#34D399] animate-pulse" />
      {value}% Career Ready
    </span>
  );
}

function AiStatusPill({ online }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all duration-300"
      style={{
        background: online ? 'rgba(52, 211, 153, 0.1)' : 'rgba(248, 113, 113, 0.1)',
        border: online ? '1px solid rgba(52, 211, 153, 0.3)' : '1px solid rgba(248, 113, 113, 0.3)',
        color: online ? '#34D399' : '#F87171',
      }}
    >
      <span
        className="inline-block w-2 h-2 rounded-full"
        style={{
          background: online ? '#34D399' : '#F87171',
          boxShadow: online ? '0 0 8px #34D399' : '0 0 8px #F87171',
        }}
      />
      {online ? '🟢 AI Connected' : '🔴 AI Offline'}
    </span>
  );
}

export default function TopBar() {
  const { student, aiOnline } = useApp();

  return (
    <header
      className="sticky top-0 z-10 flex items-center justify-between px-8"
      style={{
        height: 68,
        background: '#11131A',
        borderBottom: '1px solid #282D38',
      }}
    >
      {/* Search Input */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center">
          <HiOutlineSearch className="absolute left-3.5 text-[#737B8C] text-base pointer-events-none" />
          <input
            type="text"
            placeholder="Search topics, skills, assessments..."
            className="pl-10 pr-4 py-2 rounded-xl text-xs font-medium bg-[#171A22] text-[#F5F7FA] border border-[#282D38] focus:outline-none focus:border-[#8B5CF6] w-64 md:w-80 transition-colors placeholder-[#737B8C]"
          />
        </div>
      </div>

      {/* Right Cluster */}
      <div className="flex items-center gap-4">
        {/* AI Status Indicator */}
        <AiStatusPill online={aiOnline ?? true} />

        {/* Primary Action Button */}


        {/* Readiness Badge */}
        <ReadinessBadge value={student?.careerReadiness} />

        {/* Notification Bell */}
        <button
          id="topbar-notifications"
          className="relative flex items-center justify-center rounded-xl text-[#A7ADBA] hover:text-white hover:bg-[#1B1E27] transition-colors border border-[#282D38]"
          style={{ width: 38, height: 38, background: '#171A22' }}
        >
          <HiOutlineBell className="text-lg" />
          <span className="absolute top-2 right-2 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-[#8B5CF6]" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#8B5CF6]" />
          </span>
        </button>

        {/* User avatar */}
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white text-xs font-bold shadow-sm">
          {student?.name ? student.name.charAt(0) : 'A'}
        </div>
      </div>
    </header>
  );
}
