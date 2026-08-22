import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { callGemini } from '../utils/ai';

function parseJSON(raw) {
  try {
    const s = raw.indexOf('{');
    const e = raw.lastIndexOf('}');
    if (s !== -1 && e !== -1) return JSON.parse(raw.substring(s, e + 1));
    return JSON.parse(raw);
  } catch { return null; }
}

/* ── AI Advisor Panel ───────────────────────────────────────────── */
function AiAdvisorPanel({ advice, loading, error }) {
  return (
    <div className="rounded-xl overflow-hidden border border-[rgba(139,92,246,0.35)] bg-[#171A22]">
      {/* Header */}
      <div className="px-5 py-3.5 flex items-center gap-3 bg-[#1B1E27] border-b border-[#282D38]">
        <span className="text-xl text-[#A78BFA] bg-[rgba(139,92,246,0.12)] p-1.5 rounded-lg">🤖</span>
        <div>
          <p className="text-[#F5F7FA] font-bold text-sm">AI Career Advisor Strategy</p>
          <p className="text-[#737B8C] text-[11px]">Personalised guidance from your AI career twin model</p>
        </div>
      </div>

      <div className="p-5">
        {loading && (
          <div className="space-y-3 animate-pulse py-1">
            <div className="h-3 bg-[#1B1E27] rounded-full w-full" />
            <div className="h-3 bg-[#1B1E27] rounded-full w-5/6" />
            <div className="h-3 bg-[#1B1E27] rounded-full w-4/5" />
          </div>
        )}

        {error && !loading && (
          <p className="text-xs text-[#F87171] flex items-center gap-2">
            <span>⚠️</span> AI advisor strategy loading default insights.
          </p>
        )}

        {advice && !loading && (
          <div className="space-y-4">
            <p className="text-xs leading-relaxed text-[#C4B5FD]">{advice.summary}</p>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold text-[#737B8C] uppercase tracking-wider">Top Focus:</span>
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold text-[#FBBF24] bg-[rgba(251,191,36,0.1)] border border-[rgba(251,191,36,0.25)]">
                ⚡ {advice.topPriority}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-[#A78BFA] bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.25)]">
                ~{advice.timelineWeeks} weeks to target readiness
              </span>
            </div>

            {advice.milestones?.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-[#737B8C] uppercase tracking-wider">Milestones Breakdown</p>
                {advice.milestones.map((m, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-[#1B1E27] border border-[#282D38]">
                    <span className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white bg-[#8B5CF6]">
                      W{m.week}
                    </span>
                    <p className="text-xs text-[#A7ADBA] leading-relaxed pt-1">{m.goal}</p>
                  </div>
                ))}
              </div>
            )}

            {advice.encouragement && (
              <p className="text-xs font-semibold text-[#34D399] flex items-start gap-2 leading-relaxed">
                <span className="flex-shrink-0">✨</span>
                {advice.encouragement}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main Career Twin Component ─────────────────────────────────── */
export default function CareerTwin() {
  const { student } = useApp();
  const readiness = student?.careerReadiness ?? 65;

  const [advice, setAdvice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const BENCHMARKS = [
    { tier: 'Unicorn Tech Startups', readinessNeeded: 75, match: readiness >= 75 },
    { tier: 'Mid-sized Product Companies', readinessNeeded: 60, match: readiness >= 60 },
    { tier: 'Global IT Services & Enterprise', readinessNeeded: 45, match: readiness >= 45 },
  ];

  const studentSkills = student?.skills || [
    { name: 'Data Structures & Algorithms', current: 65 },
    { name: 'Backend Engineering', current: 55 },
    { name: 'System Design & Architecture', current: 35 },
    { name: 'Database Management', current: 45 },
  ];

  useEffect(() => {
    if (!student) return;

    if (student.careerTwin?.twinAdvice) {
      setAdvice({
        summary: student.careerTwin.twinAdvice,
        topPriority: student.aiAnalysis?.skillGaps?.[0] || 'System Architecture',
        timelineWeeks: 6,
        milestones: (student.roadmap || []).slice(0, 3).map((r, i) => ({ week: i + 1, goal: r.title })),
        encouragement: 'Your GitHub & portfolio analysis indicates strong foundational progress!',
      });
      setLoading(false);
      return;
    }

    async function fetchAdvice() {
      setLoading(true);
      setError(false);
      try {
        const system = 'You are a senior tech career advisor. Return ONLY JSON: {"summary":string,"topPriority":string,"timelineWeeks":number,"milestones":[{"week":number,"goal":string}],"encouragement":string} summary: 2 sentences on current standing based on github/skills. topPriority: single most impactful skill. timelineWeeks: realistic weeks. milestones: 3 goals. encouragement: 1 motivating sentence.';
        const skillsList = studentSkills.map((s) => `${s.name}: ${s.current}%`).join(', ');
        const user = `Student: ${student.name}. Target Role: ${student.profile?.targetRole || 'Software Engineer'}. Readiness: ${readiness}%. Skills — ${skillsList}.`;
        const raw = await callGemini(system, user);
        const parsed = parseJSON(raw);
        if (parsed?.summary) {
          setAdvice(parsed);
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchAdvice();
  }, [student?._id, student?.careerReadiness, student?.targetRole]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold text-[#737B8C]">AI Persona Model</p>
        <h1 className="text-2xl font-bold text-[#F5F7FA] mt-0.5">🧬 Career Twin</h1>
        <p className="text-[#A7ADBA] text-sm mt-1">
          Your dynamic skill profile, market capabilities, and readiness benchmarks derived from social links & evidence.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Twin Profile Card */}
        <div className="card p-6 flex flex-col items-center text-center space-y-4 bg-[#171A22] border border-[#282D38] rounded-2xl">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white text-2xl font-bold shadow-md">
            {student?.name ? student.name.charAt(0).toUpperCase() : 'A'}
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#F5F7FA]">{student?.name ?? 'Alex Kumar'}</h2>
            <p className="text-xs font-semibold text-[#A78BFA] mt-0.5">{student?.profile?.targetRole || 'Backend Developer'}</p>
          </div>

          <div className="w-full bg-[#1B1E27] p-4 rounded-xl border border-[#282D38]">
            <p className="text-[11px] text-[#737B8C] font-semibold uppercase tracking-wider mb-1">Twin Health Index</p>
            <p className="text-4xl font-black text-[#F5F7FA]">{readiness}%</p>
            <p className="text-xs text-[#34D399] font-medium mt-1">
              {readiness >= 75 ? '🚀 Unicorn Ready' : readiness >= 60 ? '✅ Market Ready' : '📈 Building Skills'}
            </p>
          </div>

          <p className="text-xs text-[#A7ADBA] leading-relaxed">
            Your Twin updates in real time as you complete study topics, coding tests, and evidence hub items.
          </p>
        </div>

        {/* Right: Benchmarks, Skill Breakdown, AI Advisor */}
        <div className="md:col-span-2 space-y-6">
          {/* Market Benchmark Readiness */}
          <div className="card p-6 space-y-4 bg-[#171A22] border border-[#282D38] rounded-2xl">
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

          {/* Skill Profile Breakdown */}
          <div className="card p-6 space-y-4 bg-[#171A22] border border-[#282D38] rounded-2xl">
            <h3 className="text-sm font-bold text-[#F5F7FA] border-b border-[#282D38] pb-3">
              AI Evaluated Skill Breakdown
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {studentSkills.map((s) => {
                const isStrong = s.current >= 60;
                return (
                  <div key={s.name} className="p-3 rounded-xl bg-[#1B1E27] border border-[#282D38] flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-[#F5F7FA] truncate max-w-[140px]">{s.name}</p>
                      <p className="text-[11px] font-bold text-[#A7ADBA]">{s.current}% Score</p>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                        isStrong
                          ? 'bg-[rgba(52,211,153,0.1)] text-[#34D399] border-[rgba(52,211,153,0.25)]'
                          : 'bg-[rgba(251,191,36,0.1)] text-[#FBBF24] border-[rgba(251,191,36,0.25)]'
                      }`}
                    >
                      {isStrong ? 'Strong' : 'Focus Area'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Career Advisor */}
          <AiAdvisorPanel advice={advice} loading={loading} error={error} />
        </div>
      </div>
    </div>
  );
}
