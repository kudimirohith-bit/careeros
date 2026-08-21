import { useApp } from '../context/AppContext';

export default function CareerTwin() {
  const { student } = useApp();
  const readiness = student?.careerReadiness ?? 65;

  const BENCHMARKS = [
    { tier: 'Unicorn Tech Startups', readinessNeeded: 75, match: readiness >= 75 },
    { tier: 'Mid-sized Product Companies', readinessNeeded: 65, match: readiness >= 65 },
    { tier: 'Global IT Services', readinessNeeded: 50, match: readiness >= 50 },
  ];

  const SKILL_GAPS = [
    { name: 'System Design', score: 40, status: 'Weak', accent: 'danger' },
    { name: 'DSA & Algorithms', score: 68, status: 'Improving', accent: 'warning' },
    { name: 'Backend Frameworks', score: 82, status: 'Strong', accent: 'success' },
    { name: 'Communication', score: 57, status: 'Improving', accent: 'info' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold text-[#737B8C]">AI Persona Model</p>
        <h1 className="text-2xl font-bold text-[#F5F7FA] mt-0.5">🧬 Career Twin</h1>
        <p className="text-[#A7ADBA] text-sm mt-1">
          Your dynamic skill profile, market capabilities, and readiness benchmarks.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Central Readiness Score Card */}
        <div className="card p-6 flex flex-col items-center text-center space-y-4 bg-[#171A22] border border-[#282D38]">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white text-2xl font-bold shadow-md">
            {student?.name ? student.name.charAt(0) : 'A'}
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#F5F7FA]">{student?.name ?? 'Alex Kumar'}</h2>
            <p className="text-xs font-semibold text-[#A78BFA] mt-0.5">{student?.targetRole ?? 'Backend Developer'}</p>
          </div>

          <div className="w-full bg-[#1B1E27] p-4 rounded-xl border border-[#282D38]">
            <p className="text-[11px] text-[#737B8C] font-semibold uppercase tracking-wider mb-1">Career Readiness Score</p>
            <p className="text-4xl font-black text-[#F5F7FA]">{readiness}%</p>
            <p className="text-xs text-[#34D399] font-medium mt-1">Career Ready</p>
          </div>

          <p className="text-xs text-[#A7ADBA] leading-relaxed">
            Your Twin updates dynamically as you complete assessments, daily missions, and practice challenges.
          </p>
        </div>

        {/* Right Section: Market Benchmarks & Skill Gaps */}
        <div className="md:col-span-2 space-y-6">
          {/* Benchmarks */}
          <div className="card p-6 space-y-4 bg-[#171A22] border border-[#282D38]">
            <h3 className="text-sm font-bold text-[#F5F7FA] border-b border-[#282D38] pb-3">
              Market Benchmark Readiness
            </h3>

            <div className="space-y-3">
              {BENCHMARKS.map((b) => (
                <div key={b.tier} className="p-3.5 rounded-xl border border-[#282D38] bg-[#1B1E27] flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-[#F5F7FA]">{b.tier}</p>
                    <p className="text-[11px] text-[#737B8C]">Threshold: {b.readinessNeeded}% readiness</p>
                  </div>
                  <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-md border ${
                    b.match 
                      ? 'bg-[rgba(52,211,153,0.10)] text-[#34D399] border-[rgba(52,211,153,0.25)]' 
                      : 'bg-[rgba(251,191,36,0.10)] text-[#FBBF24] border-[rgba(251,191,36,0.25)]'
                  }`}>
                    {b.match ? '✓ Market Ready' : '⏳ Gap to Bridge'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Skill Breakdown Neutral Cards */}
          <div className="card p-6 space-y-4 bg-[#171A22] border border-[#282D38]">
            <h3 className="text-sm font-bold text-[#F5F7FA] border-b border-[#282D38] pb-3">
              Skill Profile Breakdown
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {SKILL_GAPS.map((s) => {
                const colorMap = {
                  danger: { bg: 'rgba(248,113,113,0.1)', text: '#F87171', border: 'rgba(248,113,113,0.25)' },
                  warning: { bg: 'rgba(251,191,36,0.1)', text: '#FBBF24', border: 'rgba(251,191,36,0.25)' },
                  success: { bg: 'rgba(52,211,153,0.1)', text: '#34D399', border: 'rgba(52,211,153,0.25)' },
                  info: { bg: 'rgba(96,165,250,0.1)', text: '#60A5FA', border: 'rgba(96,165,250,0.25)' },
                };
                const style = colorMap[s.accent];
                return (
                  <div key={s.name} className="p-3 rounded-xl bg-[#1B1E27] border border-[#282D38] flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-[#F5F7FA]">{s.name}</p>
                      <p className="text-[11px] font-bold text-[#A7ADBA]">{s.score}%</p>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded border" style={{ background: style.bg, color: style.text, borderColor: style.border }}>
                      {s.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Subtle AI Card */}
          <div className="p-4 rounded-xl bg-[#171A22] border border-[rgba(139,92,246,0.3)] flex items-start gap-3">
            <span className="text-lg text-[#A78BFA] bg-[rgba(139,92,246,0.12)] p-2 rounded-lg">🤖</span>
            <div>
              <p className="text-xs font-bold text-[#F5F7FA]">AI Career Insight</p>
              <p className="text-xs text-[#A7ADBA] leading-relaxed mt-0.5">
                Strengthening your Data Structures & System Design scores by +10% will unlock qualification for Tier-1 Unicorn Startups.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
