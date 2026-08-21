import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../api/api';
import TopicStepper from '../components/TopicStepper';

/* ─── Helpers ─────────────────────────────────────────────────────── */
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

function getWeekDates() {
  const now   = new Date();
  const day   = now.getDay();
  const mon   = new Date(now);
  mon.setDate(now.getDate() - ((day + 6) % 7));
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(mon);
    d.setDate(mon.getDate() + i);
    return d;
  });
}

function fmtDate(d) {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

/* ─── Task catalogue ─────────────────────────────────────────────── */
const SKILL_TASKS = {
  'DSA':           [
    { label: 'Arrays & Hashing',          type: 'Learn',    mins: 20 },
    { label: 'Solve 3 LeetCode Mediums',  type: 'Solve',    mins: 30 },
    { label: 'Recursion Deep Dive',       type: 'Learn',    mins: 25 },
    { label: 'Binary Search quiz',        type: 'Quiz',     mins: 10 },
  ],
  'System Design': [
    { label: 'Load Balancers & Caching',  type: 'Learn',    mins: 20 },
    { label: 'Design URL Shortener',      type: 'Practice', mins: 30 },
    { label: 'Read: CAP Theorem',         type: 'Read',     mins: 15 },
    { label: 'System Design quiz',        type: 'Quiz',     mins: 10 },
  ],
  'Node.js':       [
    { label: 'Event Loop & Async/Await',  type: 'Learn',    mins: 20 },
    { label: 'Build REST API mini-project', type: 'Practice', mins: 35 },
    { label: 'Express middleware quiz',   type: 'Quiz',     mins: 10 },
    { label: 'Streams & Buffers',         type: 'Learn',    mins: 20 },
  ],
  'JavaScript':    [
    { label: 'Closures & Scope',          type: 'Learn',    mins: 20 },
    { label: 'Solve JS 30 challenges',    type: 'Solve',    mins: 25 },
    { label: 'Promises & async quiz',     type: 'Quiz',     mins: 10 },
    { label: 'Prototype & Classes',       type: 'Learn',    mins: 20 },
  ],
  'React':         [
    { label: 'Hooks: useState & useEffect', type: 'Learn', mins: 20 },
    { label: 'Build todo with Context',   type: 'Practice', mins: 30 },
    { label: 'React quiz: lifecycle',     type: 'Quiz',     mins: 10 },
    { label: 'Performance optimisation',  type: 'Read',     mins: 15 },
  ],
  'MongoDB':       [
    { label: 'Aggregation Pipelines',     type: 'Learn',    mins: 20 },
    { label: 'Practice: complex queries', type: 'Practice', mins: 25 },
    { label: 'Indexing strategies',       type: 'Read',     mins: 15 },
    { label: 'MongoDB quiz',              type: 'Quiz',     mins: 10 },
  ],
  'SQL':           [
    { label: 'JOINs & Subqueries',        type: 'Learn',    mins: 20 },
    { label: 'Solve 5 SQL challenges',    type: 'Solve',    mins: 25 },
    { label: 'Query optimisation',        type: 'Read',     mins: 15 },
    { label: 'SQL quiz',                  type: 'Quiz',     mins: 10 },
  ],
  'Communication': [
    { label: 'STAR method storytelling',  type: 'Learn',    mins: 15 },
    { label: '1 mock HR question',        type: 'Practice', mins: 20 },
    { label: 'Technical articulation',    type: 'Read',     mins: 15 },
    { label: 'Communication self-eval',   type: 'Quiz',     mins: 10 },
  ],
};

const FALLBACK_TASKS = [
  { label: 'Core concept review',    type: 'Learn',    mins: 20 },
  { label: 'Solve practice problems', type: 'Solve',   mins: 25 },
  { label: 'Topic quiz',             type: 'Quiz',     mins: 10 },
  { label: 'Read: advanced topics',  type: 'Read',     mins: 15 },
];

function generatePlan(skills) {
  const weakest = [...skills]
    .sort((a, b) => (b.target - b.current) - (a.target - a.current))
    .slice(0, 3);

  return DAYS.map((day, i) => {
    const skill = weakest[i % (weakest.length || 1)];
    const pool  = SKILL_TASKS[skill?.name] ?? FALLBACK_TASKS;
    const offset = Math.floor(i / (weakest.length || 1)) * 2;
    const tasks  = [
      { ...pool[(offset)     % pool.length], skill: skill?.name },
      { ...pool[(offset + 1) % pool.length], skill: skill?.name },
    ];
    return { day, date: null, tasks };
  });
}

function convertAiPlanToLocal(aiPlan) {
  // Map AI weeklyPlans into the flat 5-day format the existing UI expects
  const allDays = aiPlan.weeklyPlans.flatMap((w) => w.days);
  return DAYS.map((dayName, i) => {
    const aiDay = allDays[i];
    if (!aiDay) {
      return { day: dayName, date: null, tasks: [] };
    }
    return {
      day: dayName,
      date: aiDay.date,
      tasks: aiDay.tasks.map((t) => ({
        id: t.id,
        label: t.title,
        type: mapCategory(t.category),
        mins: t.estimatedMinutes,
        skill: t.category,
      })),
    };
  });
}

function mapCategory(cat) {
  const map = {
    'DSA': 'Solve', 'System Design': 'Learn', 'Project': 'Practice',
    'Learning': 'Learn', 'Revision': 'Read', 'Behavioural': 'Practice',
  };
  return map[cat] || 'Learn';
}

const TYPE_STYLE = {
  Learn:    { bg: 'rgba(139, 92, 246, 0.12)', text: '#A78BFA', border: 'rgba(139, 92, 246, 0.25)', icon: '📖' },
  Practice: { bg: 'rgba(52, 211, 153, 0.10)', text: '#34D399', border: 'rgba(52, 211, 153, 0.25)', icon: '✏️' },
  Quiz:     { bg: 'rgba(251, 191, 36, 0.10)', text: '#FBBF24', border: 'rgba(251, 191, 36, 0.25)', icon: '⚡' },
  Read:     { bg: 'rgba(96, 165, 250, 0.10)', text: '#60A5FA', border: 'rgba(96, 165, 250, 0.25)', icon: '📄' },
  Solve:    { bg: 'rgba(236, 72, 153, 0.10)', text: '#F472B6', border: 'rgba(236, 72, 153, 0.25)', icon: '💻' },
};

function TypeBadge({ type }) {
  const s = TYPE_STYLE[type] ?? TYPE_STYLE.Learn;
  return (
    <span
      className="text-[10px] font-medium px-2 py-0.5 rounded border inline-flex items-center gap-1"
      style={{ background: s.bg, color: s.text, borderColor: s.border }}
    >
      <span>{s.icon}</span>
      <span>{type}</span>
    </span>
  );
}

function Toast({ toasts }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 items-end pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold shadow-2xl text-white flex items-center gap-2 border border-[#282D38]"
          style={{
            background: t.positive ? '#10B981' : '#EF4444',
          }}
        >
          {t.positive ? '📈' : '📉'} {t.message}
        </div>
      ))}
    </div>
  );
}

function DayCard({ dayData, dateObj, dayIdx, checkedMap, onToggle, onOpenStepper, fading, selectedFilter }) {
  const isToday = dateObj && new Date().toDateString() === dateObj.toDateString();
  const doneCount = dayData.tasks.filter((_, ti) => checkedMap[`${dayIdx}-${ti}`]).length;
  const totalCount = dayData.tasks.length;
  const allDone   = doneCount === totalCount && totalCount > 0;
  const dayPct    = Math.round((doneCount / totalCount) * 100);

  return (
    <div
      className={`flex flex-col transition-all duration-300 rounded-2xl border bg-[#171A22] overflow-hidden ${
        fading ? 'opacity-30 scale-98' : 'opacity-100 scale-100'
      }`}
      style={{
        minHeight: 250,
        borderColor: isToday ? '#8B5CF6' : allDone ? 'rgba(52, 211, 153, 0.4)' : '#282D38',
        boxShadow: isToday ? '0 0 20px rgba(139, 92, 246, 0.15)' : 'none',
      }}
    >
      {/* Mini top progress indicator line */}
      <div className="h-1 w-full bg-[#11131A]">
        <div
          className="h-full transition-all duration-500"
          style={{
            width: `${dayPct}%`,
            background: allDone ? '#34D399' : '#8B5CF6',
          }}
        />
      </div>

      {/* Card Header */}
      <div
        className="px-4 pt-3.5 pb-3 border-b border-[#282D38]"
        style={{
          background: isToday
            ? 'rgba(139, 92, 246, 0.12)'
            : allDone ? 'rgba(52, 211, 153, 0.06)' : '#11131A',
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div>
              <p className={`text-[10px] font-semibold uppercase tracking-wider ${isToday ? 'text-[#A78BFA]' : 'text-[#737B8C]'}`}>
                {SHORT[dayIdx]}
              </p>
              <p className={`text-sm font-bold ${isToday ? 'text-[#F5F7FA]' : allDone ? 'text-[#34D399]' : 'text-[#F5F7FA]'}`}>
                {dayData.day}
              </p>
            </div>
            {isToday && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#8B5CF6] text-white">
                TODAY
              </span>
            )}
          </div>
          <div>
            {allDone ? (
              <span className="text-[11px] text-[#34D399] font-bold bg-[rgba(52,211,153,0.12)] px-2.5 py-1 rounded-full border border-[rgba(52,211,153,0.3)] flex items-center gap-1">
                <span>✓</span> Completed
              </span>
            ) : (
              <span
                className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border"
                style={{
                  background: isToday ? 'rgba(139,92,246,0.18)' : '#1B1E27',
                  color:      isToday ? '#A78BFA' : '#A7ADBA',
                  borderColor: isToday ? 'rgba(139,92,246,0.35)' : '#282D38',
                }}
              >
                {doneCount}/{totalCount}
              </span>
            )}
          </div>
        </div>
        {dateObj && (
          <p className={`text-[10px] mt-1 ${isToday ? 'text-[#A78BFA]' : 'text-[#737B8C]'}`}>
            {dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
          </p>
        )}
      </div>

      {/* Task List */}
      <div className="flex-1 p-3 space-y-2.5">
        {dayData.tasks.map((task, ti) => {
          const key       = `${dayIdx}-${ti}`;
          const checked   = checkedMap[key] ?? false;
          const isMatched = !selectedFilter || selectedFilter === 'All' || task.type === selectedFilter;

          return (
            <button
              key={ti}
              id={`task-${dayIdx}-${ti}`}
              onClick={() =>
                task.type === 'Learn'
                  ? onOpenStepper(task)
                  : onToggle(dayIdx, ti, task, checked)
              }
              className={`w-full text-left p-3 rounded-xl transition-all duration-200 flex items-start gap-2.5 group ${
                isMatched ? 'opacity-100' : 'opacity-35 grayscale'
              }`}
              style={{
                background: checked ? 'rgba(52, 211, 153, 0.06)' : '#1B1E27',
                border: `1px solid ${checked ? 'rgba(52, 211, 153, 0.3)' : '#282D38'}`,
              }}
            >
              {/* Checkbox */}
              <div
                className="mt-0.5 w-4 h-4 rounded flex-shrink-0 flex items-center justify-center transition-all duration-200"
                style={{
                  background: checked ? '#34D399' : '#11131A',
                  border: `1.5px solid ${checked ? '#34D399' : '#737B8C'}`,
                }}
              >
                {checked && <span className="text-[#0F1117] text-[10px] font-bold leading-none">✓</span>}
              </div>

              {/* Task info */}
              <div className="flex-1 min-w-0">
                <p
                  className="text-xs font-semibold leading-snug mb-1.5 transition-colors"
                  style={{
                    color: checked ? '#34D399' : '#F5F7FA',
                    textDecoration: checked ? 'line-through' : 'none',
                  }}
                >
                  {task.label}
                </p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <TypeBadge type={task.type} />
                  <span className="text-[10px] text-[#737B8C]">~{task.mins} min</span>
                  {task.skill && (
                    <span className="text-[10px] text-[#A7ADBA] bg-[#11131A] px-1.5 py-0.5 rounded border border-[#282D38]">
                      {task.skill}
                    </span>
                  )}
                </div>

                {/* Hint for Learn task */}
                {task.type === 'Learn' && !checked && (
                  <div className="mt-2 text-[10px] text-[#A78BFA] font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>🚀 Launch Topic Deep Dive</span>
                    <span>→</span>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function LearningPlan() {
  const { student, updateStudentSkills, showToast } = useApp();
  const skills  = student?.skills ?? [];
  const weekDates = getWeekDates();

  const [aiPlan, setAiPlan] = useState(null);
  const [loadingAi, setLoadingAi] = useState(true);
  const [checkedMap,     setCheckedMap]     = useState({});
  const [toasts,         setToasts]         = useState([]);
  const [fading,         setFading]         = useState(false);
  const [syncing,        setSyncing]        = useState(false);
  const [activeTask,     setActiveTask]     = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [viewMode,       setViewMode]       = useState('grid'); // 'grid' | 'today'

  // Load AI plan on mount
  useEffect(() => {
    if (!student?._id) return;
    api.getPlan(student._id)
      .then((result) => {
        if (result?.plan) {
          setAiPlan(result.plan);
          const completedIds = result.plan.completedTaskIds || [];
          const initialChecked = {};
          const localPlan = convertAiPlanToLocal(result.plan);
          localPlan.forEach((dayData, dIdx) => {
            dayData.tasks.forEach((task, tIdx) => {
              if (completedIds.includes(task.id)) {
                initialChecked[`${dIdx}-${tIdx}`] = true;
              }
            });
          });
          setCheckedMap(initialChecked);
        }
      })
      .catch(console.error)
      .finally(() => setLoadingAi(false));
  }, [student?._id]);

  const plan = aiPlan
    ? convertAiPlanToLocal(aiPlan)
    : generatePlan(skills);

  const pushToast = (message, positive) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, positive }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  };

  const handleTaskCheck = async (taskSkillName, increment = 2) => {
    if (!student?.skills) return;
    const updatedSkills = student.skills.map((s) =>
      s.name === taskSkillName
        ? { ...s, current: Math.min(100, Math.max(0, s.current + increment)) }
        : s
    );
    setSyncing(true);
    try {
      await updateStudentSkills(updatedSkills, `Learning Plan: completed ${taskSkillName} task`);
      if (showToast) showToast(`+${increment}% ${taskSkillName}`);
    } finally {
      setSyncing(false);
    }
  };

  const handleToggle = async (dayIdx, taskIdx, task, wasChecked) => {
    const key   = `${dayIdx}-${taskIdx}`;
    const delta = wasChecked ? -2 : 2;

    setCheckedMap((prev) => ({ ...prev, [key]: !wasChecked }));

    if (task.id && student?._id) {
      try {
        await api.completeAiTask(student._id, task.id);
      } catch (err) {
        console.error('Failed to complete AI task:', err);
      }
    }

    if (task.skill && student?.skills) {
      const updatedSkills = student.skills.map((s) =>
        s.name === task.skill
          ? { ...s, current: Math.min(100, Math.max(0, s.current + delta)) }
          : s
      );
      setSyncing(true);
      try {
        await updateStudentSkills(
          updatedSkills,
          `Learning Plan: ${wasChecked ? 'uncompleted' : 'completed'} ${task.skill} task`
        );
        pushToast(
          `${wasChecked ? '-' : '+'}2% ${task.skill}`,
          !wasChecked
        );
        if (showToast) showToast(`${wasChecked ? '-' : '+'}2% ${task.skill}`);
      } finally {
        setSyncing(false);
      }
    }
  };

  const handleRegenerate = () => {
    setFading(true);
    setCheckedMap({});
    setTimeout(() => {
      setFading(false);
    }, 350);
  };

  const totalTasks   = plan.reduce((s, d) => s + d.tasks.length, 0);
  const doneTasks    = Object.values(checkedMap).filter(Boolean).length;
  const totalMins    = plan.reduce((s, d) => s + d.tasks.reduce((ss, t) => ss + t.mins, 0), 0);
  const weekPct      = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  // Find index of today or default to 0
  const todayIdx = Math.max(0, weekDates.findIndex(d => d.toDateString() === new Date().toDateString()));
  const todayData = plan[todayIdx] || plan[0];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* ── Page Header Banner ── */}
      <div className="rounded-2xl p-6 border border-[#282D38] bg-[#171A22] relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-[rgba(139,92,246,0.08)] to-transparent pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[rgba(139,92,246,0.15)] text-[#A78BFA] border border-[rgba(139,92,246,0.3)]">
                WEEK OF {fmtDate(weekDates[0]).toUpperCase()}
              </span>
              {aiPlan && (
                <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-[rgba(139,92,246,0.15)] text-[#A78BFA] border border-[rgba(139,92,246,0.3)]">
                  {aiPlan.mode === 'interview_sprint' ? '🔥 Sprint' : '🌱 Growth'}
                </span>
              )}
              {syncing && (
                <span className="inline-flex items-center gap-1.5 text-[11px] text-[#A78BFA] font-medium">
                  <span className="w-2.5 h-2.5 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin" />
                  Syncing...
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-[#F5F7FA]">
              {aiPlan ? aiPlan.planTitle : 'Your Adaptive Learning Plan'}
            </h1>
            <p className="text-xs text-[#A7ADBA]">
              Target Goal: <span className="text-[#F5F7FA] font-semibold">{student?.targetRole ?? 'Full-Stack Developer'}</span> · {totalTasks} tasks · ~{totalMins} min study time
            </p>
          </div>

          {/* Progress Circular Widget & Stat Cards */}
          <div className="flex items-center gap-5 flex-wrap">
            <div className="flex items-center gap-3 bg-[#1B1E27] p-3 rounded-xl border border-[#282D38]">
              <div className="relative w-12 h-12">
                <svg viewBox="0 0 56 56" className="w-full h-full" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="28" cy="28" r="22" fill="none" stroke="#282D38" strokeWidth="5" />
                  <circle
                    cx="28" cy="28" r="22" fill="none"
                    stroke="#8B5CF6" strokeWidth="5" strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 22}
                    strokeDashoffset={2 * Math.PI * 22 * (1 - weekPct / 100)}
                    style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[#F5F7FA] text-[11px] font-bold">{weekPct}%</span>
                </div>
              </div>

              <div>
                <p className="text-base font-bold text-[#F5F7FA]">{doneTasks}<span className="text-xs text-[#737B8C]">/{totalTasks}</span></p>
                <p className="text-[#737B8C] text-[11px] font-medium">Weekly Tasks</p>
              </div>
            </div>

            <button
              id="regenerate-plan-btn"
              onClick={handleRegenerate}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border border-[#282D38] text-[#F5F7FA] bg-[#1B1E27] hover:bg-[#222633] transition-colors"
            >
              <span>🔄</span>
              <span>Regenerate Plan</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Toolbar: View Mode & Type Filter Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 rounded-xl border border-[#282D38] bg-[#171A22]">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[11px] font-semibold text-[#737B8C] mr-1 hidden md:inline">Filter:</span>
          {['All', 'Learn', 'Practice', 'Quiz', 'Read', 'Solve'].map((type) => {
            const active = selectedFilter === type;
            const style = TYPE_STYLE[type];
            return (
              <button
                key={type}
                onClick={() => setSelectedFilter(type)}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all duration-150 flex items-center gap-1"
                style={{
                  background: active
                    ? type === 'All' ? '#8B5CF6' : style?.bg ?? '#8B5CF6'
                    : '#1B1E27',
                  color: active
                    ? type === 'All' ? '#FFFFFF' : style?.text ?? '#FFFFFF'
                    : '#A7ADBA',
                  borderColor: active
                    ? type === 'All' ? '#8B5CF6' : style?.border ?? '#8B5CF6'
                    : '#282D38',
                }}
              >
                {type !== 'All' && <span>{style?.icon}</span>}
                <span>{type}</span>
              </button>
            );
          })}
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 bg-[#11131A] p-1 rounded-lg border border-[#282D38] self-start sm:self-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
              viewMode === 'grid' ? 'bg-[#8B5CF6] text-white' : 'text-[#737B8C] hover:text-[#F5F7FA]'
            }`}
          >
            Week Grid
          </button>
          <button
            onClick={() => setViewMode('today')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
              viewMode === 'today' ? 'bg-[#8B5CF6] text-white' : 'text-[#737B8C] hover:text-[#F5F7FA]'
            }`}
          >
            Today Spotlight 🎯
          </button>
        </div>
      </div>

      {/* ── View 1: 5-Day Grid ── */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {plan.map((dayData, i) => (
            <DayCard
              key={`${dayData.day}-${fading}`}
              dayData={dayData}
              dateObj={weekDates[i]}
              dayIdx={i}
              checkedMap={checkedMap}
              onToggle={handleToggle}
              onOpenStepper={(task) => setActiveTask({ label: task.label, skill: task.skill })}
              fading={fading}
              selectedFilter={selectedFilter}
            />
          ))}
        </div>
      )}

      {/* ── View 2: Today Spotlight ── */}
      {viewMode === 'today' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Today Tasks Card (8 cols) */}
          <div className="lg:col-span-8 card p-6 bg-[#171A22] border border-[#282D38] space-y-4">
            <div className="flex items-center justify-between border-b border-[#282D38] pb-4">
              <div>
                <span className="text-[10px] font-bold text-[#A78BFA] uppercase tracking-wider">
                  TODAY'S MISSION · {todayData.day.toUpperCase()}
                </span>
                <h2 className="text-xl font-bold text-[#F5F7FA] mt-0.5">Focus Tasks for Today</h2>
              </div>
              <span className="text-xs text-[#34D399] font-semibold bg-[rgba(52,211,153,0.1)] px-3 py-1 rounded-full border border-[rgba(52,211,153,0.25)]">
                {todayData.tasks.filter((_, ti) => checkedMap[`${todayIdx}-${ti}`]).length}/{todayData.tasks.length} Completed
              </span>
            </div>

            <div className="space-y-3">
              {todayData.tasks.map((task, ti) => {
                const key     = `${todayIdx}-${ti}`;
                const checked = checkedMap[key] ?? false;

                return (
                  <div
                    key={ti}
                    className="p-4 rounded-xl border bg-[#1B1E27] transition-all flex items-start gap-3"
                    style={{ borderColor: checked ? 'rgba(52,211,153,0.3)' : '#282D38' }}
                  >
                    <button
                      id={`today-task-${todayIdx}-${ti}`}
                      onClick={() =>
                        task.type === 'Learn'
                          ? setActiveTask({ label: task.label, skill: task.skill })
                          : handleToggle(todayIdx, ti, task, checked)
                      }
                      className="mt-1 w-5 h-5 rounded flex-shrink-0 flex items-center justify-center transition-colors"
                      style={{
                        background: checked ? '#34D399' : '#11131A',
                        border: `1.5px solid ${checked ? '#34D399' : '#737B8C'}`,
                      }}
                    >
                      {checked && <span className="text-[#0F1117] text-xs font-bold leading-none">✓</span>}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p
                          className="text-sm font-bold text-[#F5F7FA]"
                          style={{ textDecoration: checked ? 'line-through' : 'none', color: checked ? '#34D399' : '#F5F7FA' }}
                        >
                          {task.label}
                        </p>
                        <span className="text-xs text-[#737B8C]">~{task.mins} mins</span>
                      </div>

                      <div className="flex items-center gap-2 mt-2">
                        <TypeBadge type={task.type} />
                        {task.skill && (
                          <span className="text-[10px] text-[#A7ADBA] bg-[#11131A] px-2 py-0.5 rounded border border-[#282D38]">
                            Skill: {task.skill}
                          </span>
                        )}
                      </div>

                      {task.type === 'Learn' && (
                        <button
                          onClick={() => setActiveTask({ label: task.label, skill: task.skill })}
                          className="mt-3 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#8B5CF6] text-white hover:bg-[#7C3AED] transition-colors flex items-center gap-1.5"
                        >
                          <span>🚀 Start Learn → Practice → Test Loop</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Forecast & Insights (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="card p-5 bg-[#171A22] border border-[#282D38] space-y-3">
              <h3 className="text-sm font-bold text-[#F5F7FA]">💡 AI Learning Tip</h3>
              <p className="text-xs text-[#A7ADBA] leading-relaxed">
                Completing today's <span className="font-semibold text-[#F5F7FA]">DSA & System Design</span> tasks will boost your readiness score by <span className="text-[#34D399] font-bold">+4%</span>.
              </p>
            </div>

            <div className="card p-5 bg-[#171A22] border border-[#282D38] space-y-3">
              <h3 className="text-sm font-bold text-[#F5F7FA]">📅 Upcoming Days</h3>
              <div className="space-y-2">
                {plan.map((d, idx) => (
                  <div key={d.day} className="flex items-center justify-between text-xs py-1 border-b border-[#282D38] last:border-none">
                    <span className={idx === todayIdx ? 'text-[#A78BFA] font-bold' : 'text-[#737B8C]'}>
                      {d.day}
                    </span>
                    <span className="text-[#A7ADBA] font-medium">{d.tasks.length} tasks</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Types Legend */}
      <div className="p-4 rounded-xl border border-[#282D38] bg-[#171A22] flex flex-wrap items-center gap-3">
        <p className="text-xs font-semibold text-[#737B8C] uppercase tracking-wider w-full">Task Types Legend</p>
        {Object.entries(TYPE_STYLE).map(([type, s]) => (
          <span
            key={type}
            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-md border"
            style={{ background: s.bg, color: s.text, borderColor: s.border }}
          >
            <span>{s.icon}</span>
            <span>{type}</span>
          </span>
        ))}
      </div>

      <Toast toasts={toasts} />

      {activeTask && (
        <TopicStepper
          taskLabel={activeTask.label}
          skillName={activeTask.skill}
          onClose={() => setActiveTask(null)}
        />
      )}
    </div>
  );
}
