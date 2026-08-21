import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  AreaChart, Area,
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useApp } from '../context/AppContext';

/* ─── Static / Fallback Data ─────────────────────────────────────── */
const DEFAULT_TREND_VALUES = [52, 55, 57, 60, 61, 65, 68, 70, 71, 72];

const COMPARISON_SKILLS_DATA = [
  { skill: 'DSA',           past: 52, now: 68 },
  { skill: 'Backend',       past: 70, now: 82 },
  { skill: 'DBMS',          past: 62, now: 74 },
  { skill: 'Communication', past: 48, now: 57 },
  { skill: 'Aptitude',      past: 55, now: 61 },
  { skill: 'Interview',     past: 40, now: 48 },
];

const STATS_DATA = [
  { icon: '💻', label: 'Problems Solved',  value: '18',  sub: '+12 this week', color: '#6366F1' },
  { icon: '📝', label: 'Tests Completed',  value: '6',   sub: '+2 this week',  color: '#22C55E' },
  { icon: '📚', label: 'Learning Sessions', value: '14',  sub: '+5 this week',  color: '#F59E0B' },
  { icon: '⏱️', label: 'Practice Time',    value: '340 min', sub: '+45 min this week', color: '#06B6D4' },
];

const TIMELINE_DATA = [
  { dateLabel: 'Today',      event: 'Completed Arrays assessment — DSA +4%', icon: '🟢', color: '#22C55E' },
  { dateLabel: 'Yesterday',  event: 'Watched DBMS intro video',              icon: '🔵', color: '#3B82F6' },
  { dateLabel: '2 days ago', event: 'Solved 3 coding problems — Backend +2%', icon: '🟣', color: '#8B5CF6' },
  { dateLabel: '3 days ago', event: 'Completed Daily Mission 🎉',            icon: '🟡', color: '#F59E0B' },
];

/* ─── Custom Tooltip ─────────────────────────────────────────────── */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="px-3.5 py-2.5 rounded-xl text-xs shadow-xl border"
      style={{ background: '#0F172A', borderColor: '#334155', color: '#F8FAFC' }}
    >
      <p className="font-bold text-slate-300 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="flex items-center gap-2 font-medium" style={{ color: p.color }}>
          <span>{p.name}:</span>
          <span className="font-black text-white">{p.value}%</span>
        </p>
      ))}
    </div>
  );
}

/* ─── Main Progress Page ─────────────────────────────────────────── */
export default function ProgressPage() {
  const { student } = useApp();
  const [historyData, setHistoryData] = useState([]);

  // Fetch progress snapshot documents from API
  useEffect(() => {
    async function fetchProgress() {
      if (!student?._id) return;
      try {
        const res = await axios.get(`/api/student/${student._id}/progress`);
        if (Array.isArray(res.data) && res.data.length > 0) {
          const formatted = res.data.map((doc, idx) => {
            const d = new Date(doc.date);
            const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            return {
              day: dateStr,
              'Career Readiness': doc.careerReadiness,
            };
          });
          setHistoryData(formatted);
          return;
        }
      } catch (err) {
        console.warn('Progress API fallback:', err.message);
      }

      // Fallback 10-day history generator
      const now = new Date();
      const fallback = DEFAULT_TREND_VALUES.map((val, idx) => {
        const d = new Date(now);
        d.setDate(now.getDate() - (9 - idx));
        return {
          day: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          'Career Readiness': val,
        };
      });
      setHistoryData(fallback);
    }

    fetchProgress();
  }, [student?._id]);

  const trendData = historyData.length > 0 ? historyData : DEFAULT_TREND_VALUES.map((val, i) => ({
    day: `Day ${i + 1}`,
    'Career Readiness': val,
  }));

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp 0.35s ease both; }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">📈 Progress & Performance Tracking</h1>
          <p className="text-slate-500 text-sm mt-1">
            Track your career readiness trajectory, skill gains, activity stats, and recent milestones.
          </p>
        </div>
      </div>

      {/* ── Activity Stats Row (4 Cards) ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 fade-up">
        {STATS_DATA.map((st) => (
          <div key={st.label} className="card p-5 flex items-start gap-4 border border-slate-100 hover:shadow-md transition-shadow">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: `${st.color}15` }}
            >
              {st.icon}
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-800">{st.value}</p>
              <p className="text-xs font-semibold text-slate-600 mt-0.5">{st.label}</p>
              <span
                className="inline-block text-[11px] font-bold mt-1 px-2 py-0.5 rounded-full"
                style={{ background: `${st.color}15`, color: st.color }}
              >
                {st.sub}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Career Readiness Trend Chart (Area / Line Chart) ── */}
      <div className="card p-6 border border-slate-200 fade-up" style={{ animationDelay: '60ms' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-800">Career Readiness Trend</h2>
            <p className="text-xs text-slate-500 mt-0.5">Overall growth curve over the last 10 days</p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            ▲ +20% Growth
          </span>
        </div>

        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="readinessGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748B' }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748B' }} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="Career Readiness"
              stroke="#6366F1"
              strokeWidth={3}
              fill="url(#readinessGrad)"
              dot={{ r: 4, fill: '#6366F1', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 7, fill: '#4338CA' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── Skills Comparison Chart (Grouped Bar Chart) ── */}
      <div className="card p-6 border border-slate-200 fade-up" style={{ animationDelay: '120ms' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-800">Skills Growth Comparison</h2>
            <p className="text-xs text-slate-500 mt-0.5">Comparing skill scores from 2 weeks ago vs. today</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-slate-500">
              <span className="w-3 h-3 rounded bg-slate-400 inline-block" /> 2 Weeks Ago
            </span>
            <span className="flex items-center gap-1.5 text-indigo-600">
              <span className="w-3 h-3 rounded bg-indigo-600 inline-block" /> Current (Now)
            </span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={COMPARISON_SKILLS_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="skill" tick={{ fontSize: 11, fill: '#64748B', fontWeight: 600 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748B' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
            <Bar dataKey="past" name="2 Weeks Ago" fill="#94A3B8" radius={[4, 4, 0, 0]} barSize={16} />
            <Bar dataKey="now" name="Now" fill="#6366F1" radius={[4, 4, 0, 0]} barSize={16} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Timeline Section (Vertical Timeline) ── */}
      <div className="card p-6 border border-slate-200 fade-up" style={{ animationDelay: '180ms' }}>
        <h2 className="text-base font-bold text-slate-800 mb-4">Recent Activity Timeline</h2>
        
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {TIMELINE_DATA.map((item, idx) => (
            <div key={idx} className="relative flex items-start justify-between">
              {/* Timeline Dot */}
              <span
                className="absolute -left-[23px] top-0.5 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center text-[10px]"
                style={{ background: item.color }}
              />

              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-0.5">
                  {item.dateLabel}
                </p>
                <p className="text-sm font-semibold text-slate-800">{item.event}</p>
              </div>

              <span className="text-xs text-slate-400 font-medium">Logged</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
