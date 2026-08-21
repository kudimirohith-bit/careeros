import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';

/* ─── Helpers ─────────────────────────────────────────────────────── */
const clamp = (v, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));

function useCountUp(target, duration = 1000) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!target) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const pct = Math.min((ts - start) / duration, 1);
      setValue(Math.round(pct * target));
      if (pct < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return value;
}

/* ─── Fake Area Chart Data matching screenshot wave ──────────────── */
const GRAPH_WAVE = [
  { day: 'Mon', val: 52 },
  { day: 'Tue', val: 68 },
  { day: 'Wed', val: 58 },
  { day: 'Thu', val: 82 },
  { day: 'Fri', val: 64 },
  { day: 'Sat', val: 76 },
  { day: 'Sun', val: 72 },
];

/* ─── Main Hero Card (Matches top balance card in screenshot) ───── */
function HeroBalanceCard({ student }) {
  const readiness = student?.careerReadiness ?? 72;
  const count = useCountUp(readiness);

  return (
    <div className="card p-6 md:p-8 space-y-6" style={{ background: '#1E202B', borderColor: '#2B2E3C', borderRadius: '24px' }}>
      {/* Header with pill toggles */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Career Twin Health</p>
          <h2 className="text-xl font-extrabold text-white mt-0.5">Readiness & Skill Index</h2>
        </div>
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#14161E] border border-[#2B2E3C]">
          <button className="px-3 py-1 rounded-lg text-xs font-bold bg-[#252836] text-white shadow-sm">
            Total readiness
          </button>
          <button className="px-3 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-white">
            Skill gap
          </button>
        </div>
      </div>

      {/* Main big metric + Neon Curve Graph */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left Big Number */}
        <div className="md:col-span-5 space-y-2">
          <div className="flex items-baseline gap-3">
            <span className="text-5xl font-black text-white tracking-tight">{count}%</span>
            <span className="inline-flex items-center gap-1 text-xs font-extrabold px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
              ↗ 24%
            </span>
          </div>
          <p className="text-xs text-slate-400">Personalized target role: <span className="text-purple-400 font-bold">{student?.targetRole}</span></p>
        </div>

        {/* Right Neon Purple Area Chart (Matches screenshot purple wave) */}
        <div className="md:col-span-7 h-36 relative">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={GRAPH_WAVE} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="neonPurple" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#A855F7" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload?.length) {
                    return (
                      <div className="bg-white text-slate-900 px-3 py-1.5 rounded-xl text-xs font-bold shadow-xl border border-slate-200">
                        <p className="text-[10px] text-slate-500 font-semibold">{payload[0].payload.day}</p>
                        <p className="text-sm font-extrabold text-purple-700">{payload[0].value}% Readiness</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="val"
                stroke="#C084FC"
                strokeWidth={4}
                fill="url(#neonPurple)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4 Mini KPI Cards (Matches bottom 4 metrics in screenshot) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-[#2B2E3C]">
        {[
          { label: 'DSA Score', val: '68%', up: true, delta: '↗ 8%' },
          { label: 'Backend Dev', val: '82%', up: true, delta: '↗ 12%' },
          { label: 'System Design', val: '40%', up: false, delta: '↘ 4%' },
          { label: 'Communication', val: '57%', up: true, delta: '↗ 6%' },
        ].map((item) => (
          <div key={item.label} className="p-3.5 rounded-2xl bg-[#14161E] border border-[#2B2E3C]">
            <p className="text-[11px] font-semibold text-slate-400 mb-1">{item.label}</p>
            <div className="flex items-center justify-between">
              <span className="text-lg font-black text-white">{item.val}</span>
              <span className={`text-[11px] font-bold ${item.up ? 'text-emerald-400' : 'text-red-400'}`}>
                {item.delta}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Concentric Donut / Skill Distribution (Matches Bottom Left Card) ─ */
function SkillDonutCard({ skills }) {
  const top4 = skills.slice(0, 4);

  return (
    <div className="card p-6 space-y-4" style={{ background: '#1E202B', borderColor: '#2B2E3C', borderRadius: '24px' }}>
      <div className="flex items-center justify-between">
        <h3 className="text-base font-extrabold text-white">Skill Distribution</h3>
        <span className="text-xs font-bold text-indigo-400 hover:underline cursor-pointer">Detail ›</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
        {/* SVG Concentric Rings */}
        <div className="relative flex items-center justify-center h-44">
          <svg width={160} height={160} viewBox="0 0 160 160">
            {/* Outer Ring Pink */}
            <circle cx={80} cy={80} r={65} fill="none" stroke="#EC4899" strokeWidth={10} strokeDasharray="408" strokeDashoffset="120" strokeLinecap="round" />
            {/* Middle Ring Purple */}
            <circle cx={80} cy={80} r={50} fill="none" stroke="#A855F7" strokeWidth={10} strokeDasharray="314" strokeDashoffset="80" strokeLinecap="round" />
            {/* Inner Ring Cyan */}
            <circle cx={80} cy={80} r={35} fill="none" stroke="#06B6D4" strokeWidth={10} strokeDasharray="220" strokeDashoffset="50" strokeLinecap="round" />
            {/* Center Ring Green */}
            <circle cx={80} cy={80} r={20} fill="none" stroke="#10B981" strokeWidth={10} strokeDasharray="125" strokeDashoffset="20" strokeLinecap="round" />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-2xl font-black text-white">86</span>
            <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">↗ Active</span>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-2.5">
          {top4.map((s, idx) => {
            const colors = ['#EC4899', '#A855F7', '#06B6D4', '#10B981'];
            return (
              <div key={s.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: colors[idx % 4] }} />
                  <span className="font-semibold text-slate-300 truncate max-w-[100px]">{s.name}</span>
                </div>
                <span className="font-extrabold text-white">{s.current}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── Daily Missions Table Card (Matches Bottom Right Card in screenshot) ─ */
function MissionsTableCard({ skills, onReadinessBump, setCurrentPage }) {
  const missions = [
    { title: 'Learn Arrays & HashMaps', category: 'DSA', time: '20 min', status: 'Processing', color: '#F59E0B' },
    { title: 'REST API Best Practices', category: 'Backend', time: '15 min', status: 'Success', color: '#10B981' },
    { title: 'System Design Load Balancing', category: 'Architecture', time: '25 min', status: 'Waiting', color: '#3B82F6' },
  ];

  return (
    <div className="card p-6 space-y-4" style={{ background: '#1E202B', borderColor: '#2B2E3C', borderRadius: '24px' }}>
      <div className="flex items-center justify-between">
        <h3 className="text-base font-extrabold text-white">Recent Missions</h3>
        <span
          onClick={() => setCurrentPage('learning-plan')}
          className="text-xs font-bold text-indigo-400 hover:underline cursor-pointer"
        >
          Detail ›
        </span>
      </div>

      <div className="space-y-3">
        {missions.map((m, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-2xl bg-[#14161E] border border-[#2B2E3C] flex items-center justify-between hover:border-slate-600 transition-all"
          >
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-white">{m.title}</p>
              <p className="text-[10px] font-semibold text-slate-400">{m.category} • {m.time}</p>
            </div>
            <span
              className="text-[10px] font-extrabold px-3 py-1 rounded-full text-white"
              style={{ background: m.color }}
            >
              {m.status}
            </span>
          </div>
        ))}
      </div>

      <button
        onClick={onReadinessBump}
        className="w-full py-3 rounded-xl font-bold text-xs text-white transition-all shadow-md hover:bg-purple-600"
        style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)' }}
      >
        ✨ Claim Daily +1% Readiness Boost
      </button>
    </div>
  );
}

/* ─── Main Dashboard Component ───────────────────────────────────── */
export default function Dashboard() {
  const { student, setStudent, setCurrentPage } = useApp();
  const skills = student?.skills ?? [];

  const bumpReadiness = () => {
    setStudent((prev) =>
      prev ? { ...prev, careerReadiness: Math.min(100, (prev.careerReadiness ?? 0) + 1) } : prev
    );
  };

  if (!student) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        No student data found. Complete onboarding first.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Welcome Header (Matches screenshot top left text) */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400">Hi {student.name.split(' ')[0]},</p>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2 mt-0.5">
            👋 Welcome back!
          </h1>
        </div>

        {/* Today / Week filter buttons (Matches top right filter in screenshot) */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#1E202B] border border-[#2B2E3C]">
          <button className="px-4 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:text-white">
            Today
          </button>
          <button className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#252836] text-white shadow-sm">
            Week
          </button>
        </div>
      </div>

      {/* Hero Balance / Readiness Card */}
      <HeroBalanceCard student={student} />

      {/* Bottom Grid (2 Columns: Skill Donut + Recent Missions Table) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SkillDonutCard skills={skills} />
        <MissionsTableCard skills={skills} onReadinessBump={bumpReadiness} setCurrentPage={setCurrentPage} />
      </div>
    </div>
  );
}
