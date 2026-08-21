import { useState, useCallback } from 'react';
import axios from 'axios';
import { useApp } from '../context/AppContext';
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

/* ─── Task catalogue keyed by skill name ─────────────────────────── */
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
    const skill = weakest[i % weakest.length];
    const pool  = SKILL_TASKS[skill?.name] ?? FALLBACK_TASKS;
    const offset = Math.floor(i / weakest.length) * 2;
    const tasks  = [
      { ...pool[(offset)     % pool.length], skill: skill?.name },
      { ...pool[(offset + 1) % pool.length], skill: skill?.name },
    ];
    return { day, date: null, tasks };
  });
}

const TYPE_STYLE = {
  Learn:    { bg: 'rgba(139,92,246,0.2)', text: '#C084FC', border: 'rgba(139,92,246,0.4)' },
  Solve:    { bg: 'rgba(236,72,153,0.2)', text: '#F472B6', border: 'rgba(236,72,153,0.4)' },
  Quiz:     { bg: 'rgba(245,158,11,0.2)', text: '#FBBF24', border: 'rgba(245,158,11,0.4)' },
  Practice: { bg: 'rgba(16,185,129,0.2)', text: '#34D399', border: 'rgba(16,185,129,0.4)' },
  Read:     { bg: 'rgba(6,182,212,0.2)',  text: '#22D3EE', border: 'rgba(6,182,212,0.4)' },
};

function TypeBadge({ type }) {
  const s = TYPE_STYLE[type] ?? TYPE_STYLE.Learn;
  return (
    <span
      className="text-[10px] font-extrabold px-2 py-0.5 rounded-full border"
      style={{ background: s.bg, color: s.text, borderColor: s.border }}
    >
      {type}
    </span>
  );
}

function Toast({ toasts }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 items-end pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="px-4 py-2.5 rounded-xl text-sm font-extrabold shadow-2xl text-white flex items-center gap-2"
          style={{
            background: t.positive
              ? 'linear-gradient(135deg,#10B981,#059669)'
              : 'linear-gradient(135deg,#EF4444,#DC2626)',
            animation: 'toastIn 0.35s cubic-bezier(.34,1.56,.64,1) both',
          }}
        >
          {t.positive ? '📈' : '📉'} {t.message}
        </div>
      ))}
    </div>
  );
}

function DayCard({ dayData, dateObj, dayIdx, checkedMap, onToggle, onOpenStepper, fading }) {
  const isToday = dateObj && new Date().toDateString() === dateObj.toDateString();
  const doneCount = dayData.tasks.filter((_, ti) => checkedMap[`${dayIdx}-${ti}`]).length;
  const allDone   = doneCount === dayData.tasks.length;

  return (
    <div
      className="card flex flex-col transition-all duration-300 border border-[#2B2E3C] bg-[#1E202B]"
      style={{ opacity: fading ? 0 : 1, minHeight: 220 }}
    >
      <div
        className="px-4 pt-4 pb-3 rounded-t-2xl border-b border-[#2B2E3C]"
        style={{
          background: isToday
            ? 'linear-gradient(135deg,#7C3AED,#9333EA)'
            : allDone ? 'rgba(16,185,129,0.15)' : '#14161E',
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-xs font-bold ${isToday ? 'text-purple-200' : 'text-slate-400'}`}>
              {SHORT[dayIdx]}
            </p>
            <p className={`text-base font-black ${isToday ? 'text-white' : allDone ? 'text-emerald-400' : 'text-white'}`}>
              {dayData.day}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            {allDone ? (
              <span className="text-lg">🎉</span>
            ) : (
              <span
                className="text-xs font-bold px-2.5 py-0.5 rounded-full border border-purple-500/30"
                style={{
                  background: isToday ? 'rgba(255,255,255,0.2)' : '#252836',
                  color:      isToday ? '#fff' : '#C084FC',
                }}
              >
                {doneCount}/{dayData.tasks.length}
              </span>
            )}
          </div>
        </div>
        {dateObj && (
          <p className={`text-[10px] mt-0.5 ${isToday ? 'text-purple-200' : 'text-slate-400'}`}>
            {dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
          </p>
        )}
      </div>

      <div className="flex-1 p-3 space-y-2.5">
        {dayData.tasks.map((task, ti) => {
          const key     = `${dayIdx}-${ti}`;
          const checked = checkedMap[key] ?? false;
          return (
            <button
              key={ti}
              id={`task-${dayIdx}-${ti}`}
              onClick={() =>
                task.type === 'Learn'
                  ? onOpenStepper(task)
                  : onToggle(dayIdx, ti, task, checked)
              }
              className="w-full text-left p-3 rounded-2xl transition-all duration-200 flex items-start gap-2.5"
              style={{
                background: checked ? 'rgba(16,185,129,0.1)' : '#14161E',
                border: `1.5px solid ${checked ? '#10B981' : '#2B2E3C'}`,
              }}
            >
              <div
                className="mt-0.5 w-4 h-4 rounded flex-shrink-0 flex items-center justify-center transition-all duration-200"
                style={{
                  background: checked ? '#10B981' : '#1E202B',
                  border: `2px solid ${checked ? '#10B981' : '#475569'}`,
                }}
              >
                {checked && <span className="text-white text-[9px] font-black leading-none">✓</span>}
              </div>

              <div className="flex-1 min-w-0">
                <p
                  className="text-xs font-bold leading-snug mb-1.5"
                  style={{
                    color: checked ? '#34D399' : '#FFFFFF',
                    textDecoration: checked ? 'line-through' : 'none',
                  }}
                >
                  {task.label}
                </p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <TypeBadge type={task.type} />
                  <span className="text-[10px] text-slate-400 font-semibold">~{task.mins} min</span>
                  {task.skill && (
                    <span className="text-[10px] font-extrabold text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded-full border border-purple-800/40">
                      {task.skill}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function LearningPlan() {
  const { student, setStudent } = useApp();
  const skills  = student?.skills ?? [];
  const weekDates = getWeekDates();

  const [plan,        setPlan]        = useState(() => generatePlan(skills));
  const [checkedMap,  setCheckedMap]  = useState({});
  const [toasts,      setToasts]      = useState([]);
  const [fading,      setFading]      = useState(false);
  const [syncing,     setSyncing]     = useState(false);
  const [activeTask,  setActiveTask]  = useState(null);

  const syncSkills = useCallback(async (updatedSkills) => {
    if (!student?._id) return;
    setSyncing(true);
    try {
      const res = await axios.post(
        `/api/student/${student._id}/update-skills`,
        { skills: updatedSkills }
      );
      setStudent(res.data);
    } catch (e) {
      console.error('Sync failed:', e.message);
    } finally {
      setSyncing(false);
    }
  }, [student, setStudent]);

  const pushToast = (message, positive) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, positive }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  };

  const handleToggle = (dayIdx, taskIdx, task, wasChecked) => {
    const key   = `${dayIdx}-${taskIdx}`;
    const delta = wasChecked ? -2 : 2;

    setCheckedMap((prev) => ({ ...prev, [key]: !wasChecked }));

    if (task.skill && student?.skills) {
      const updatedSkills = student.skills.map((s) =>
        s.name === task.skill
          ? { ...s, current: Math.min(100, Math.max(0, s.current + delta)) }
          : s
      );
      syncSkills(updatedSkills);
      pushToast(
        `${wasChecked ? '-' : '+'}2% ${task.skill}`,
        !wasChecked
      );
    }
  };

  const handleRegenerate = () => {
    setFading(true);
    setCheckedMap({});
    setTimeout(() => {
      setPlan(generatePlan(skills));
      setFading(false);
    }, 350);
  };

  const totalTasks   = plan.reduce((s, d) => s + d.tasks.length, 0);
  const doneTasks    = Object.values(checkedMap).filter(Boolean).length;
  const totalMins    = plan.reduce((s, d) => s + d.tasks.reduce((ss, t) => ss + t.mins, 0), 0);
  const weekPct      = Math.round((doneTasks / totalTasks) * 100);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div
        className="rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border border-purple-800/40"
        style={{
          background: 'linear-gradient(135deg,#7C3AED 0%,#9333EA 50%,#A855F7 100%)',
          boxShadow: '0 10px 30px rgba(124,58,237,0.3)',
        }}
      >
        <div>
          <p className="text-purple-200 text-xs font-bold uppercase tracking-wider mb-1">
            📅 Week of {fmtDate(weekDates[0])}
          </p>
          <h2 className="text-2xl font-black text-white">Your Learning Plan</h2>
          <p className="text-purple-100 text-xs font-medium mt-1">
            Personalised for your <span className="text-white font-extrabold">{student?.targetRole ?? 'goal'}</span>
          </p>
        </div>

        <div className="flex items-center gap-5 flex-shrink-0">
          <div className="relative w-16 h-16">
            <svg viewBox="0 0 56 56" className="w-full h-full" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="6" />
              <circle
                cx="28" cy="28" r="22" fill="none"
                stroke="#fff" strokeWidth="6" strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 22}
                strokeDashoffset={2 * Math.PI * 22 * (1 - weekPct / 100)}
                style={{ transition: 'stroke-dashoffset 0.6s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white text-xs font-black">{weekPct}%</span>
            </div>
          </div>

          <div className="text-right text-white">
            <p className="text-2xl font-black">{doneTasks}<span className="text-base text-purple-200">/{totalTasks}</span></p>
            <p className="text-purple-200 text-xs font-semibold">tasks done</p>
            <p className="text-purple-200 text-xs mt-0.5 font-medium">~{totalMins} min total</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div>
          {syncing && (
            <span className="inline-flex items-center gap-2 text-xs font-bold text-purple-400">
              <span className="w-3 h-3 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
              Syncing to database…
            </span>
          )}
        </div>
        <button
          id="regenerate-plan-btn"
          onClick={handleRegenerate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold border border-purple-500/40 text-white bg-[#1E202B] hover:bg-[#252836] transition-all shadow-md"
        >
          🔄 Regenerate Plan
        </button>
      </div>

      {/* 5-day grid */}
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
          />
        ))}
      </div>

      {/* Task Types Legend */}
      <div className="p-4 rounded-2xl border border-[#2B2E3C] bg-[#1E202B] flex flex-wrap items-center gap-4">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider w-full">Task Types</p>
        {Object.entries(TYPE_STYLE).map(([type, s]) => (
          <span
            key={type}
            className="inline-flex items-center gap-1.5 text-xs font-extrabold px-3 py-1 rounded-full border"
            style={{ background: s.bg, color: s.text, borderColor: s.border }}
          >
            {type}
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
