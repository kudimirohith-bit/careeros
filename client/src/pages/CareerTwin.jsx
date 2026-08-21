import { useApp } from '../context/AppContext';

export default function CareerTwin() {
  const { student } = useApp();
  const readiness = student?.careerReadiness ?? 65;

  const BENCHMARKS = [
    { tier: 'Unicorn Tech Startups', readinessNeeded: 75, match: readiness >= 75 },
    { tier: 'Mid-sized Product Companies', readinessNeeded: 65, match: readiness >= 65 },
    { tier: 'Global IT Services', readinessNeeded: 50, match: readiness >= 50 },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">🧬 Career Twin Model</h1>
        <p className="text-slate-300 text-sm mt-1">
          Your live AI persona model representing your real-time skill profile, capabilities, and market readiness.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Twin Profile Card */}
        <div className="card p-6 flex flex-col items-center text-center space-y-4 border border-[#2B2E3C] bg-[#1E202B]">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white text-3xl font-extrabold shadow-xl">
              {student?.name ? student.name.charAt(0) : 'A'}
            </div>
            <span className="absolute bottom-0 right-0 w-6 h-6 bg-emerald-500 border-2 border-[#1E202B] rounded-full flex items-center justify-center text-white text-[10px] font-bold">
              ✓
            </span>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white">{student?.name ?? 'Alex Kumar'}</h2>
            <p className="text-xs font-bold text-purple-400 mt-1">{student?.targetRole ?? 'Backend Developer'}</p>
          </div>

          <div className="w-full bg-[#14161E] p-4 rounded-2xl border border-[#2B2E3C] shadow-sm">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Twin Health Index</p>
            <p className="text-3xl font-black text-purple-400">{readiness}% Ready</p>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Your Twin updates dynamically as you complete assessments, finish daily missions, and practice coding challenges.
          </p>
        </div>

        {/* Market Benchmark Match */}
        <div className="md:col-span-2 card p-6 space-y-6 border border-[#2B2E3C] bg-[#1E202B]">
          <h3 className="text-base font-extrabold text-white border-b border-[#2B2E3C] pb-3">
            Market Benchmark Readiness
          </h3>

          <div className="space-y-4">
            {BENCHMARKS.map((b) => (
              <div key={b.tier} className="p-4 rounded-2xl border border-[#2B2E3C] bg-[#14161E] flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-white">{b.tier}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Threshold: {b.readinessNeeded}% readiness</p>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                  b.match 
                    ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800' 
                    : 'bg-amber-950/80 text-amber-300 border-amber-800'
                }`}>
                  {b.match ? '✓ Market Ready' : '⏳ Gap to Bridge'}
                </span>
              </div>
            ))}
          </div>

          <div className="bg-purple-950/40 p-4 rounded-2xl border border-purple-800/60 flex items-start gap-3">
            <span className="text-2xl">🤖</span>
            <p className="text-xs text-purple-200 leading-relaxed font-medium">
              <span className="font-bold text-white">Twin Persona Advice:</span> Strengthening your Data Structures & System Design scores by +10% will unlock qualification for Tier-1 Unicorn Startups.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
