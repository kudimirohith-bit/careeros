import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import CoachChat from '../components/CoachChat';
import BonusTasks from '../components/BonusTasks';
import { callGemini } from '../utils/ai';

function useCountUp(target, duration = 1000) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!target && target !== 0) return;
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

const GRAPH_WAVE = [
  { day: 'Mon', val: 52 },
  { day: 'Tue', val: 55 },
  { day: 'Wed', val: 57 },
  { day: 'Thu', val: 60 },
  { day: 'Fri', val: 61 },
  { day: 'Sat', val: 65 },
  { day: 'Sun', val: 68 },
];

const PREV_SKILLS_KEY = 'careeros_prev_skills';

function getSkillDeltas(skills = []) {
  const targetNames = ['DSA', 'Backend', 'System Design', 'Communication'];
  
  let prevMap = {};
  try {
    const raw = localStorage.getItem(PREV_SKILLS_KEY);
    if (raw) prevMap = JSON.parse(raw);
  } catch { prevMap = {}; }

  const nextPrevMap = { ...prevMap };

  const results = targetNames.map((targetName) => {
    const matched = skills.find(
      (s) => s.name.toLowerCase() === targetName.toLowerCase() ||
             s.name.toLowerCase().includes(targetName.toLowerCase())
    ) || { name: targetName, current: 45, target: 75 };

    const curr = matched.current;
    let prevVal = prevMap[matched.name];
    if (prevVal === undefined) {
      prevVal = Math.max(0, curr - 2);
      nextPrevMap[matched.name] = prevVal;
    }
    const delta = curr - prevVal;

    return {
      name: targetName,
      current: curr,
      target: matched.target || 80,
      delta,
    };
  });

  try {
    localStorage.setItem(PREV_SKILLS_KEY, JSON.stringify(nextPrevMap));
  } catch { /* ignore */ }

  return results;
}

function HeroBalanceCard({ student, onClaimBoost, boosting }) {
  const readiness = student?.careerReadiness ?? 0;
  const count = useCountUp(readiness);
  const kpiSkills = getSkillDeltas(student?.skills);

  return (
    <div className="card p-6 space-y-6 bg-[#171A22] border border-[#282D38]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#737B8C]">Career Readiness Overview</p>
          <h2 className="text-lg font-bold text-[#F5F7FA] mt-0.5">Readiness & Skill Index</h2>
        </div>

        <button
          id="claim-boost-btn"
          onClick={onClaimBoost}
          disabled={boosting}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white transition-all flex items-center gap-2 shadow-lg active:scale-95 disabled:opacity-60"
          style={{
            background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
            boxShadow: '0 4px 15px rgba(139,92,246,0.3)',
          }}
        >
          {boosting ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Fetching Tip…</span>
            </>
          ) : (
            <>
              <span>✨ Claim Daily +1% Readiness Boost</span>
            </>
          )}
        </button>
      </div>

      {/* Main Metric & Area Chart */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-5 space-y-2">
          <div className="flex items-baseline gap-3">
            <span className="text-5xl font-black text-[#F5F7FA] tracking-tight">{count}%</span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-[rgba(52,211,153,0.1)] text-[#34D399] border border-[rgba(52,211,153,0.25)]">
              ↗ Live
            </span>
          </div>
          <p className="text-xs text-[#A7ADBA]">
            Target role: <span className="text-[#A78BFA] font-semibold">{student?.targetRole || 'Backend Developer'}</span>
          </p>
        </div>

        <div className="md:col-span-7 h-36 relative">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={GRAPH_WAVE} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="purpleGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload?.length) {
                    return (
                      <div className="bg-[#1B1E27] text-[#F5F7FA] px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#282D38] shadow-lg">
                        <p className="text-[10px] text-[#737B8C]">{payload[0].payload.day}</p>
                        <p className="text-xs font-bold text-[#A78BFA]">{payload[0].value}% Readiness</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="val"
                stroke="#8B5CF6"
                strokeWidth={2.5}
                fill="url(#purpleGlow)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Mini KPI Cards for 4 specific skills */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-[#282D38]">
        {kpiSkills.map((s) => (
          <div key={s.name} className="p-3.5 rounded-xl bg-[#1B1E27] border border-[#282D38]">
            <p className="text-[11px] font-medium text-[#737B8C] mb-1 truncate">{s.name}</p>
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-[#F5F7FA]">{s.current}%</span>
              <span
                className="text-[11px] font-semibold px-2 py-0.5 rounded-md"
                style={{
                  background: s.delta >= 0 ? 'rgba(52, 211, 153, 0.1)' : 'rgba(248, 113, 113, 0.1)',
                  color: s.delta >= 0 ? '#34D399' : '#F87171',
                }}
              >
                {s.delta >= 0 ? `+${s.delta}%` : `${s.delta}%`}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SkillGapsCard({ skillGaps }) {
  return (
    <div className="card p-6 space-y-4 bg-[#171A22] border border-[#282D38]">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-[#F5F7FA]">Skill Gap Analysis</h3>
        <span className="text-xs font-semibold text-[#A78BFA]">Target Breakdown</span>
      </div>

      <div className="space-y-3">
        {skillGaps.slice(0, 5).map((s) => {
          const statusColor =
            s.status === 'strong' ? '#34D399' : s.status === 'improve' ? '#FBBF24' : '#F87171';
          return (
            <div key={s.name} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-[#F5F7FA]">{s.name}</span>
                <span className="text-[11px] font-medium" style={{ color: statusColor }}>
                  {s.current}% / {s.target}% ({s.gap > 0 ? `-${s.gap}%` : 'Met'})
                </span>
              </div>
              <div className="h-2 rounded-full bg-[#1B1E27] overflow-hidden flex">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (s.current / (s.target || 100)) * 100)}%`, background: statusColor }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DailyMissionsCard({ missionTasks, handleMissionCheck, biggestGap, setCurrentPage, completedMap, setCompletedMap }) {
  const toggleTask = async (task, idx) => {
    if (task.done || completedMap[idx]) return;
    const nextCompleted = { ...completedMap, [idx]: true };
    setCompletedMap(nextCompleted);
    const allDone = missionTasks.every((t, i) => t.done || nextCompleted[i]);
    await handleMissionCheck(task, allDone);
  };

  return (
    <div className="card p-6 space-y-5 bg-[#171A22] border border-[#282D38]">
      {/* Next Best Action Banner */}
      {biggestGap && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-[rgba(139,92,246,0.15)] to-[rgba(139,92,246,0.05)] border border-[rgba(139,92,246,0.3)]">
          <p className="text-[10px] font-bold text-[#A78BFA] uppercase tracking-wider mb-1">🎯 Next Best Action</p>
          <p className="text-xs font-semibold text-[#F5F7FA]">
            Focus on <span className="text-[#A78BFA] font-bold">{biggestGap.name}</span> (Gap: {biggestGap.gap}% to target)
          </p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-[#F5F7FA]">Daily Missions</h3>
        <span
          onClick={() => setCurrentPage('learning-plan')}
          className="text-xs font-semibold text-[#A78BFA] hover:underline cursor-pointer"
        >
          View Plan ›
        </span>
      </div>

      <div className="space-y-3">
        {missionTasks.map((task, idx) => {
          const isDone = task.done || !!completedMap[idx];
          return (
            <div
              key={idx}
              onClick={() => toggleTask(task, idx)}
              className="p-3.5 rounded-xl bg-[#1B1E27] border border-[#282D38] flex items-center gap-3 cursor-pointer hover:border-[#8B5CF6]/50 transition-colors"
            >
              <div
                className="w-5 h-5 rounded flex items-center justify-center border transition-all"
                style={{
                  background: isDone ? '#34D399' : '#11131A',
                  borderColor: isDone ? '#34D399' : '#737B8C',
                }}
              >
                {isDone && <span className="text-[#0F1117] text-xs font-bold">✓</span>}
              </div>
              <div className="flex-1">
                <p className={`text-xs font-semibold ${isDone ? 'line-through text-[#737B8C]' : 'text-[#F5F7FA]'}`}>
                  {task.label}
                </p>
                <p className="text-[10px] text-[#A7ADBA]">Skill: {task.skill} • +2% boost</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ToastNotification({ toast }) {
  if (!toast?.visible) return null;
  return (
    <div
      className="fixed bottom-6 right-6 z-50 max-w-sm p-4 rounded-2xl text-white shadow-2xl transition-all duration-300 border border-white/20"
      style={{
        background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
        boxShadow: '0 20px 40px rgba(139,92,246,0.4)',
        opacity: toast.visible ? 1 : 0,
        transform: toast.visible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
      }}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl">🚀</span>
        <div>
          <p className="text-xs font-bold text-white uppercase tracking-wider mb-0.5">Readiness Boosted +1%</p>
          <p className="text-xs text-purple-100 leading-relaxed font-medium">{toast.text}</p>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { student, setStudent, updateStudentSkills, showToast, setCurrentPage, recordTimelineEvent } = useApp();
  const [completedMap, setCompletedMap] = useState({});
  const [boosting, setBoosting] = useState(false);
  const [toastTip, setToastTip] = useState({ text: '', visible: false });

  if (!student) {
    return (
      <div className="flex items-center justify-center h-64 text-[#737B8C]">
        Loading student dashboard...
      </div>
    );
  }

  // Skill gap analysis
  const skillGaps = (student.skills || [])
    .map((s) => ({
      ...s,
      gap: s.target - s.current,
      status:
        s.current >= s.target
          ? 'strong'
          : s.target - s.current <= 10
          ? 'improve'
          : 'gap',
    }))
    .sort((a, b) => b.gap - a.gap);

  const biggestGap = skillGaps[0];

  const missionTasks = skillGaps.slice(0, 3).map((s) => ({
    label: `Practice ${s.name}`,
    skill: s.name,
    done: false,
  }));

  const handleMissionCheck = async (task, allDone) => {
    const updatedSkills = (student.skills || []).map((s) =>
      s.name === task.skill ? { ...s, current: Math.min(100, s.current + 2) } : s
    );
    await updateStudentSkills(updatedSkills, `Completed: ${task.label}`);
    if (showToast) showToast(`+2% ${task.skill} 🎯`);
    if (allDone && showToast) showToast('🎉 Daily Mission Complete!');
  };

  const handleClaimBoost = async () => {
    setBoosting(true);
    // Increment readiness
    const newReadiness = Math.min(100, (student.careerReadiness || 0) + 1);
    setStudent((prev) => ({ ...prev, careerReadiness: newReadiness }));
    if (recordTimelineEvent) {
      recordTimelineEvent('Claimed Daily +1% Readiness Boost', 'boost', `Readiness is now ${newReadiness}%`);
    }

    let tipText = 'Consistent effort every day compounds into massive career breakthroughs!';

    try {
      const system = 'You are a career coach. Return ONLY a 1-sentence motivational micro-tip for a student targeting the given role. No quotation marks or markdown.';
      const user = `Give a 1-sentence motivational tip for a student targeting ${student.targetRole || 'Software Engineer'}.`;
      const aiTip = await callGemini(system, user);
      if (aiTip && aiTip.trim()) {
        tipText = aiTip.trim().replace(/^["']|["']$/g, '');
      }
    } catch (e) {
      console.error('Boost tip API call error:', e);
    } finally {
      setBoosting(false);
      setToastTip({ text: tipText, visible: true });
      setTimeout(() => {
        setToastTip({ text: '', visible: false });
      }, 4000);
    }
  };

  const allMissionsDone = missionTasks.length > 0 && missionTasks.every((t, i) => t.done || completedMap[i]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto relative">
      {/* Top Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-[#737B8C]">Overview</p>
          <h1 className="text-2xl font-bold text-[#F5F7FA] tracking-tight mt-0.5">
            Welcome back, {student.name.split(' ')[0]} 👋
          </h1>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-lg bg-[#171A22] border border-[#282D38]">
          <button className="px-3 py-1 rounded-md text-xs font-medium text-[#737B8C] hover:text-[#A7ADBA]">
            Today
          </button>
          <button className="px-3 py-1 rounded-md text-xs font-semibold bg-[#1B1E27] text-[#F5F7FA]">
            Week
          </button>
        </div>
      </div>

      <HeroBalanceCard
        student={student}
        onClaimBoost={handleClaimBoost}
        boosting={boosting}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SkillGapsCard skillGaps={skillGaps} />
        <DailyMissionsCard
          missionTasks={missionTasks}
          handleMissionCheck={handleMissionCheck}
          biggestGap={biggestGap}
          setCurrentPage={setCurrentPage}
          completedMap={completedMap}
          setCompletedMap={setCompletedMap}
        />
      </div>

      <BonusTasks studentId={student?._id} allDone={allMissionsDone} />
      <CoachChat studentId={student?._id} />

      <ToastNotification toast={toastTip} />
    </div>
  );
}
