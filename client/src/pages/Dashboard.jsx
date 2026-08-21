import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import GeminiKeyBanner from '../components/GeminiKeyBanner';
import CoachChat from '../components/CoachChat';
import BonusTasks from '../components/BonusTasks';
import { api } from '../api/api';

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

function HeroBalanceCard({ student }) {
  const readiness = student?.careerReadiness ?? 0;
  const count = useCountUp(readiness);

  return (
    <div className="card p-6 space-y-6 bg-[#171A22] border border-[#282D38]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#737B8C]">Career Readiness Overview</p>
          <h2 className="text-lg font-bold text-[#F5F7FA] mt-0.5">Readiness & Skill Index</h2>
        </div>
        <div className="flex items-center gap-1 p-1 rounded-lg bg-[#11131A] border border-[#282D38]">
          <button className="px-3 py-1 rounded-md text-xs font-semibold bg-[#1B1E27] text-[#F5F7FA]">
            Total readiness
          </button>
          <button className="px-3 py-1 rounded-md text-xs font-medium text-[#737B8C] hover:text-[#A7ADBA]">
            Skill gap
          </button>
        </div>
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

      {/* Mini KPI Cards built dynamically from student.skills */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-[#282D38]">
        {(student?.skills || []).slice(0, 4).map((s) => (
          <div key={s.name} className="p-3.5 rounded-xl bg-[#1B1E27] border border-[#282D38]">
            <p className="text-[11px] font-medium text-[#737B8C] mb-1 truncate">{s.name}</p>
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-[#F5F7FA]">{s.current}%</span>
              <span className="text-[11px] font-semibold text-[#34D399]">
                Target: {s.target}%
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

export default function Dashboard() {
  const { student, updateStudentSkills, showToast, setCurrentPage } = useApp();
  const [aiTasks, setAiTasks] = useState([]);
  const [aiPlan, setAiPlan] = useState(null);
  const [loadingAi, setLoadingAi] = useState(true);
  const [completedMap, setCompletedMap] = useState({});

  useEffect(() => {
    if (!student?._id) return;
    setLoadingAi(true);
    api.getTodaysTasks(student._id)
      .then((result) => {
        if (result?.tasks?.length) setAiTasks(result.tasks);
        if (result?.plan) setAiPlan(result.plan);
      })
      .catch((err) => console.error('Failed to load AI tasks:', err))
      .finally(() => setLoadingAi(false));
  }, [student?._id]);

  if (!student) {
    return (
      <div className="flex items-center justify-center h-64 text-[#737B8C]">
        Loading student dashboard...
      </div>
    );
  }

  // Skill gap analysis: computed from student.skills
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

  // Next Best Action: skill with biggest gap
  const biggestGap = skillGaps[0];

  // Daily mission tasks: if AI plan exists, use AI tasks for missions; else fall back to skill-gap tasks
  const missionTasks = aiTasks.length > 0
    ? aiTasks.map((t) => ({
        id: t.id,
        label: t.title,
        skill: t.category,
        done: aiPlan?.completedTaskIds?.includes(t.id) || false,
        estimatedMinutes: t.estimatedMinutes,
      }))
    : skillGaps.slice(0, 3).map((s) => ({
        label: `Practice ${s.name}`,
        skill: s.name,
        done: false,
      }));

  const handleMissionCheck = async (task, allDone) => {
    // If AI task, call complete-task endpoint
    if (task.id && student?._id) {
      try {
        await api.completeAiTask(student._id, task.id);
      } catch (err) {
        console.error('Failed to complete AI task:', err);
      }
    }
    // Also update skills as before
    const updatedSkills = (student.skills || []).map((s) =>
      s.name === task.skill ? { ...s, current: Math.min(100, s.current + 2) } : s
    );
    await updateStudentSkills(updatedSkills, `Completed: ${task.label}`);
    if (showToast) showToast(`+2% ${task.skill} 🎯`);
    if (allDone && showToast) showToast('🎉 Daily Mission Complete!');
  };

  const allMissionsDone = missionTasks.length > 0 && missionTasks.every((t, i) => t.done || completedMap[i]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <GeminiKeyBanner />
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

      <HeroBalanceCard student={student} />

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
    </div>
  );
}
