import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3.5 py-2.5 rounded-xl text-xs shadow-xl border bg-[#1B1E27] border-[#282D38] text-[#F5F7FA]">
      <p className="font-bold text-[#A7ADBA] mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="flex items-center gap-2 font-medium" style={{ color: p.color }}>
          <span>{p.name}:</span>
          <span className="font-bold text-[#F5F7FA]">{p.value}%</span>
        </p>
      ))}
    </div>
  );
}

const DEFAULT_TIMELINE = [
  {
    id: 'evt_init_1',
    title: 'Completed Skill Assessment',
    type: 'assessment',
    details: 'Initial profile calibration completed',
    date: 'Recent',
  },
  {
    id: 'evt_init_2',
    title: 'Set Target Role',
    type: 'onboarding',
    details: 'Target role configured',
    date: 'Recent',
  },
  {
    id: 'evt_init_3',
    title: 'Account Created',
    type: 'account',
    details: 'Started career acceleration journey',
    date: 'Recent',
  },
];

export default function ProgressPage() {
  const { student } = useApp();
  const [timelineEvents, setTimelineEvents] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('careeros_timeline');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTimelineEvents(parsed);
          return;
        }
      }
    } catch { /* ignore */ }
    setTimelineEvents(DEFAULT_TIMELINE);
  }, []);

  // Generate 7-day progress trend line from current readiness
  const currentReadiness = student?.careerReadiness || 45;
  const progressData = [
    { day: 'Day 1', readiness: Math.max(20, currentReadiness - 15), date: 'Day 1' },
    { day: 'Day 2', readiness: Math.max(25, currentReadiness - 12), date: 'Day 2' },
    { day: 'Day 3', readiness: Math.max(30, currentReadiness - 8), date: 'Day 3' },
    { day: 'Day 4', readiness: Math.max(35, currentReadiness - 5), date: 'Day 4' },
    { day: 'Day 5', readiness: Math.max(38, currentReadiness - 3), date: 'Day 5' },
    { day: 'Day 6', readiness: Math.max(40, currentReadiness - 1), date: 'Day 6' },
    { day: 'Day 7', readiness: currentReadiness, date: 'Today' },
  ];

  // Skills comparison: baseline (initial) vs now
  const trackSkills = ['DSA', 'Backend', 'DBMS', 'Communication'];
  const skillComparison = trackSkills.map((skillName) => {
    const studentSkill = student?.skills?.find(
      (s) => s.name.toLowerCase() === skillName.toLowerCase() || s.name.toLowerCase().includes(skillName.toLowerCase())
    );
    const curr = studentSkill?.current || 50;
    return {
      skill: skillName,
      before: Math.max(20, curr - 15),
      now: curr,
    };
  });

  const getEventIcon = (type) => {
    switch (type) {
      case 'assessment': return '🧠';
      case 'coding':     return '💻';
      case 'interview':  return '🎤';
      case 'boost':      return '✨';
      case 'skills':     return '📈';
      default:           return '🎯';
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <p className="text-xs font-semibold text-[#737B8C]">Analytics</p>
        <h1 className="text-2xl font-bold text-[#F5F7FA] mt-0.5">Progress Tracking</h1>
        <p className="text-[#A7ADBA] text-xs mt-1">
          Historical view of your career readiness, skill growth trajectory, and activity log.
        </p>
      </div>

      {/* Line Chart for Career Readiness */}
      <div className="card p-6 bg-[#171A22] border border-[#282D38] rounded-2xl">
        <h2 className="text-base font-bold text-[#F5F7FA] mb-4">Career Readiness Over Time</h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={progressData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#282D38" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#A7ADBA' }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#A7ADBA' }} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="readiness"
              name="Career Readiness"
              stroke="#8B5CF6"
              strokeWidth={3}
              dot={{ r: 4, fill: '#8B5CF6' }}
              activeDot={{ r: 6, fill: '#A78BFA' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart comparing skills: Then vs Now */}
      <div className="card p-6 bg-[#171A22] border border-[#282D38] rounded-2xl">
        <h2 className="text-base font-bold text-[#F5F7FA] mb-4">Skills: Baseline vs Now</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={skillComparison}>
            <CartesianGrid strokeDasharray="3 3" stroke="#282D38" />
            <XAxis dataKey="skill" tick={{ fontSize: 11, fill: '#A7ADBA' }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#A7ADBA' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10, color: '#A7ADBA' }} />
            <Bar dataKey="before" name="Baseline" fill="#374151" radius={[4, 4, 0, 0]} barSize={16} />
            <Bar dataKey="now" name="Current" fill="#8B5CF6" radius={[4, 4, 0, 0]} barSize={16} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Dynamic Timeline Events Log */}
      <div className="card p-6 bg-[#171A22] border border-[#282D38] rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#F5F7FA]">Activity Timeline</h2>
          <span className="text-xs text-[#737B8C]">{timelineEvents.length} events logged</span>
        </div>

        <div className="space-y-3">
          {timelineEvents.map((evt, idx) => (
            <div
              key={evt.id || idx}
              className="p-3.5 rounded-xl bg-[#1B1E27] border border-[#282D38] flex items-center gap-3.5"
            >
              <div className="w-9 h-9 rounded-xl bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 flex items-center justify-center text-base shrink-0">
                {getEventIcon(evt.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#F5F7FA] truncate">{evt.title}</p>
                {evt.details && (
                  <p className="text-[11px] text-[#A7ADBA] truncate mt-0.5">{evt.details}</p>
                )}
              </div>
              <span className="text-[10px] font-medium text-[#737B8C] shrink-0">
                {evt.date || 'Just now'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
